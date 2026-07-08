import { datetimeRegex } from "zod";
import { db, transaction } from "../../db/database";
import { AppError } from "../../utils/AppError";

interface MovieInput {
  title: string;
  description?: string;
  poster_url?: string;
  duration_minutes: number;
  genre_ids?: number[];
}

function attachGenres(movieId: number, genresIds: number[]) {
  const insertLink = db.prepare(
    "INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)",
  );
  for (const genreId of genresIds) {
    const genre = db.prepare("SELECT id FROM genres WHERE id = ?").get(genreId);
    if (!genre)
      throw new AppError(400, `Genre with id ${genreId} does not exist`);
    insertLink.run(movieId, genreId);
  }
}
function getGenresForMovie(movieId: number) {
  return db
    .prepare(
      `SELECT g.id, g.name FROM genres g
       JOIN movie_genres mg ON mg.genre_id = g.id
       WHERE mg.movie_id = ?`,
    )
    .all(movieId);
}

export function listMovies(filters: { genre?: string; search?: string }) {
  let query = `SELECT DISTINCT m.* FROM movies m`;
  const params: any[] = [];
  const conditions: string[] = [];

  if (filters.genre) {
    query += ` JOIN movie_genres mg ON mg.movie_id = m.id JOIN genres g ON g.id = mg.genre_id`;
    conditions.push(`g.name = ?`);
    params.push(filters.genre);
  }
  if (filters.search) {
    conditions.push(`m.title LIKE ?`);
    params.push(`%${filters.search}%`);
  }
  if (conditions.length) {
    query += ` WHERE ` + conditions.join(" AND ");
  }
  query += ` ORDER BY m.title ASC`;

  const movies = db.prepare(query).all(...params) as any[];
  return movies.map((m) => ({ ...m, genres: getGenresForMovie(m.id) }));
}

export function getMovieById(id: number) {
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(id) as any;
  if (!movie) throw new AppError(404, "Movie not found");
  return { ...movie, genres: getGenresForMovie(id) };
}

export function createMovie(input: MovieInput) {
  const createTx = transaction((data: MovieInput) => {
    const info = db
      .prepare(
        `INSERT INTO movies (title, description, poster_url, duration_minutes) VALUES (?, ?, ?, ?)`,
      )
      .run(
        data.title,
        data.description ?? null,
        data.poster_url ?? null,
        data.duration_minutes,
      );
    const movieId = info.lastInsertRowid as number;
    if (data.genre_ids?.length) attachGenres(movieId, data.genre_ids);
    return movieId;
  });

  const movieId = createTx(input);
  return getMovieById(movieId);
}

export function updateMovie(id: number, input: Partial<MovieInput>) {
  const existing = db.prepare("SELECT id FROM movies WHERE id = ?").get(id);
  if (!existing) throw new AppError(404, "Movie not found");

  const updateTx = transaction((data: Partial<MovieInput>) => {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.poster_url !== undefined) {
      fields.push("poster_url = ?");
      values.push(data.poster_url);
    }
    if (data.duration_minutes !== undefined) {
      fields.push("duration_minutes = ?");
      values.push(data.duration_minutes);
    }
    fields.push(`updated_at = datetime('now')`);

    if (fields.length) {
      values.push(id);
      db.prepare(`UPDATE movies SET ${fields.join(", ")} WHERE id = ?`).run(
        ...values,
      );
    }
    if (data.genre_ids !== undefined) {
      db.prepare("DELETE FROM movie_genres WHERE movie_id = ?").run(id);
      if (data.genre_ids.length) attachGenres(id, data.genre_ids);
    }
  });

  updateTx(input);
  return getMovieById(id);
}

export function deleteMovie(id: number) {
  const existing = db.prepare("SELECT id FROM movies WHERE id = ?").get(id);
  if (!existing) throw new AppError(404, "Movie not found");
  db.prepare("DELETE FROM movies WHERE id = ?").run(id);
}
