import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Movie, Showtime } from "../api/types";
import { MoviesApi, ShowtimesApi } from "../api/endpoints";
import { Spinner } from "../components/Spinner";
import { formatTime, nextDates, todayISODate } from "../utils/format";

export function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const movieId = Number(id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [date, setDate] = useState(todayISODate());
  const [showtimes, setShowtimes] = useState<Showtime[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dates = nextDates(7);

  useEffect(() => {
    MoviesApi.get(movieId)
      .then((res) => setMovie(res.movie))
      .catch(() => setError("Movie not found."));
  }, [movieId]);

  useEffect(() => {
    setShowtimes(null);
    ShowtimesApi.list({ date, movie_id: movieId })
      .then((res) => setShowtimes(res.showtimes))
      .catch(() => setError("Could not load showtimes."));
  }, [movieId, date]);

  if (error) {
    return (
      <div className="page">
        <div className="banner banner-danger">{error}</div>
      </div>
    );
  }
  if (!movie) return <Spinner />;

  return (
    <div className="page">
      <div className="movie-detail">
        <div className="movie-detail-poster">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} />
          ) : (
            <div className="movie-card-poster-fallback">{movie.title[0]}</div>
          )}
        </div>
        <div className="movie-detail-info">
          <p className="section-eyebrow">{movie.duration_minutes} min</p>
          <h1 className="marquee-heading" style={{ fontSize: 40 }}>
            {movie.title}
          </h1>
          <div className="movie-card-genres" style={{ margin: "14px 0" }}>
            {movie.genres.map((g) => (
              <span key={g.id} className="pill">
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-muted" style={{ maxWidth: 520, lineHeight: 1.6 }}>
            {movie.description}
          </p>
        </div>
      </div>

      <div className="showtimes-section">
        <p className="section-eyebrow" style={{ marginTop: 44 }}>
          Showtimes
        </p>
        <div className="date-strip">
          {dates.map((d) => (
            <button
              key={d.iso}
              className={`date-chip ${d.iso === date ? "date-chip-active" : ""}`}
              onClick={() => setDate(d.iso)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {showtimes === null ? (
          <Spinner />
        ) : showtimes.length === 0 ? (
          <div className="empty-state">
            <h3>No showtimes this day</h3>
            <p>Try another date.</p>
          </div>
        ) : (
          <div className="showtime-list">
            {showtimes.map((s) => (
              <button
                key={s.id}
                className="showtime-chip"
                onClick={() => navigate(`/showtimes/${s.id}/seats`)}
              >
                <span className="showtime-chip-time mono">
                  {formatTime(s.start_time)}
                </span>
                <span className="text-faint" style={{ fontSize: 12 }}>
                  {s.screen_name}
                </span>
                <span
                  className="mono"
                  style={{ color: "var(--gold)", fontSize: 13 }}
                >
                  ${s.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
