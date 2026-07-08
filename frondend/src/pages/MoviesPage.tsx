import { useEffect, useState } from "react";
import type { Movie, Genre } from "../api/types";
import { MoviesApi, GenresApi } from "../api/endpoints";
import { MovieCard } from "../components/MovieCard";
import { Spinner } from "../components/Spinner";

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GenresApi.list()
      .then((res) => setGenres(res.genres))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setError(null);
      MoviesApi.list({
        genre: activeGenre || undefined,
        search: search || undefined,
      })
        .then((res) => setMovies(res.movies))
        .catch(() => setError("Could not load movies. Is the API running?"));
    }, 200);
    return () => clearTimeout(handle);
  }, [activeGenre, search]);
  return (
    <div className="page">
      <p className="section-eyebrow">Now showing</p>
      <h1 className="marquee-heading" style={{ fontSize: 44 }}>
        Pick something to watch
      </h1>

      <div className="movies-toolbar">
        <input
          type="search"
          placeholder="Search titles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="movies-search"
        />
        <div className="movies-genre-filter">
          <button
            className={`pill ${activeGenre === null ? "pill-gold" : ""}`}
            onClick={() => setActiveGenre(null)}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`pill ${activeGenre === g.name ? "pill-gold" : ""}`}
              onClick={() => setActiveGenre(g.name)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="banner banner-danger">{error}</div>}

      {movies === null && !error ? (
        <Spinner />
      ) : movies && movies.length === 0 ? (
        <div className="empty-state">
          <h3>No movies found</h3>
          <p>Try a different search or genre.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies!.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
