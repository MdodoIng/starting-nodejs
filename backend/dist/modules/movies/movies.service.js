"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMovies = listMovies;
exports.getMovieById = getMovieById;
exports.createMovie = createMovie;
exports.updateMovie = updateMovie;
exports.deleteMovie = deleteMovie;
const database_1 = require("../../db/database");
const AppError_1 = require("../../utils/AppError");
function attachGenres(movieId, genresIds) {
    const insertLink = database_1.db.prepare("INSERT INTO movie_genres (movie_id, genre_id) VALUES (?, ?)");
    for (const genreId of genresIds) {
        const genre = database_1.db.prepare("SELECT id FROM genres WHERE id = ?").get(genreId);
        if (!genre)
            throw new AppError_1.AppError(400, `Genre with id ${genreId} does not exist`);
        insertLink.run(movieId, genreId);
    }
}
function getGenresForMovie(movieId) {
    return database_1.db
        .prepare(`SELECT g.id, g.name FROM genres g
       JOIN movie_genres mg ON mg.genre_id = g.id
       WHERE mg.movie_id = ?`)
        .all(movieId);
}
function listMovies(filters) {
    let query = `SELECT DISTINCT m.* FROM movies m`;
    const params = [];
    const conditions = [];
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
    const movies = database_1.db.prepare(query).all(...params);
    return movies.map((m) => ({ ...m, genres: getGenresForMovie(m.id) }));
}
function getMovieById(id) {
    const movie = database_1.db.prepare("SELECT * FROM movies WHERE id = ?").get(id);
    if (!movie)
        throw new AppError_1.AppError(404, "Movie not found");
    return { ...movie, genres: getGenresForMovie(id) };
}
function createMovie(input) {
    const createTx = (0, database_1.transaction)((data) => {
        const info = database_1.db
            .prepare(`INSERT INTO movies (title, description, poster_url, duration_minutes) VALUES (?, ?, ?, ?)`)
            .run(data.title, data.description ?? null, data.poster_url ?? null, data.duration_minutes);
        const movieId = info.lastInsertRowid;
        if (data.genre_ids?.length)
            attachGenres(movieId, data.genre_ids);
        return movieId;
    });
    const movieId = createTx(input);
    return getMovieById(movieId);
}
function updateMovie(id, input) {
    const existing = database_1.db.prepare("SELECT id FROM movies WHERE id = ?").get(id);
    if (!existing)
        throw new AppError_1.AppError(404, "Movie not found");
    const updateTx = (0, database_1.transaction)((data) => {
        const fields = [];
        const values = [];
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
            database_1.db.prepare(`UPDATE movies SET ${fields.join(", ")} WHERE id = ?`).run(...values);
        }
        if (data.genre_ids !== undefined) {
            database_1.db.prepare("DELETE FROM movie_genres WHERE movie_id = ?").run(id);
            if (data.genre_ids.length)
                attachGenres(id, data.genre_ids);
        }
    });
    updateTx(input);
    return getMovieById(id);
}
function deleteMovie(id) {
    const existing = database_1.db.prepare("SELECT id FROM movies WHERE id = ?").get(id);
    if (!existing)
        throw new AppError_1.AppError(404, "Movie not found");
    database_1.db.prepare("DELETE FROM movies WHERE id = ?").run(id);
}
