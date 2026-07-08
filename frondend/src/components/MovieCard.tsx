import { Link } from "react-router-dom";
import type { Movie } from "../api/types";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <div className="movie-card-poster">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} loading="lazy" />
        ) : (
          <div className="movie-card-poster-fallback">{movie.title[0]}</div>
        )}
        <div className="movie-card-runtime mono">{movie.duration_minutes}m</div>
      </div>
      <div className="movie-card-body">
        <h3>{movie.title}</h3>
        <div className="movie-card-genres">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g.id} className="pill">
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
