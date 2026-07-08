import { useEffect, useState, type FormEvent } from "react";
import type { Showtime, Movie, Screen } from "../../api/types";
import { ShowtimesApi, MoviesApi, ScreensApi } from "../../api/endpoints";
import { Spinner } from "../../components/Spinner";
import { ApiError } from "../../api/client";
import { formatDateTime } from "../../utils/format";

export function ShowtimesPanel() {
  const [showtimes, setShowtimes] = useState<Showtime[] | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);

  const [movieId, setMovieId] = useState<number | "">("");
  const [screenId, setScreenId] = useState<number | "">("");
  const [startTime, setStartTime] = useState("");
  const [price, setPrice] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    ShowtimesApi.list()
      .then((res) => setShowtimes(res.showtimes))
      .catch(() => setError("Could not load showtimes."));
    MoviesApi.list()
      .then((res) => setMovies(res.movies))
      .catch(() => {});
    ScreensApi.list()
      .then((res) => setScreens(res.screens))
      .catch(() => {});
  }
  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!movieId || !screenId || !startTime) return;
    setError(null);
    setSaving(true);
    try {
      await ShowtimesApi.create({
        movie_id: Number(movieId),
        screen_id: Number(screenId),
        start_time: new Date(startTime).toISOString(),
        price: Number(price),
      });
      setStartTime("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create showtime.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Delete this showtime? Existing reservations for it will also be removed.",
      )
    )
      return;
    try {
      await ShowtimesApi.remove(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete showtime.",
      );
    }
  }

  const upcoming =
    showtimes?.filter((s) => new Date(s.start_time).getTime() > Date.now()) ??
    [];

  return (
    <div className="admin-split">
      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          Schedule a showtime
        </h3>
        {error && <div className="banner banner-danger">{error}</div>}
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Movie</label>
            <select
              required
              value={movieId}
              onChange={(e) =>
                setMovieId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Select a movie…</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.duration_minutes}m)
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Screen</label>
            <select
              required
              value={screenId}
              onChange={(e) =>
                setScreenId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Select a screen…</option>
              {screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Start time</label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Price ($)</label>
            <input
              type="number"
              min={0}
              step="0.5"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <p className="text-faint" style={{ fontSize: 12, marginBottom: 16 }}>
            End time is calculated from the movie's runtime. Overlapping
            showtimes on the same screen are rejected.
          </p>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Scheduling…" : "Schedule showtime"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          Upcoming showtimes
        </h3>
        {showtimes === null ? (
          <Spinner />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Screen</th>
                  <th>Start</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((s) => (
                  <tr key={s.id}>
                    <td>{s.movie_title}</td>
                    <td>{s.screen_name}</td>
                    <td className="mono">{formatDateTime(s.start_time)}</td>
                    <td className="mono">${s.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
