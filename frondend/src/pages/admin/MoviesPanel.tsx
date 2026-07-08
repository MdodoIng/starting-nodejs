import { useEffect, useState, type FormEvent } from "react";
import type { Movie, Genre } from "../../api/types";
import { MoviesApi, GenresApi } from "../../api/endpoints";
import { Spinner } from "../../components/Spinner";
import { ApiError } from "../../api/client";

const emptyForm = {
  title: "",
  description: "",
  poster_url: "",
  duration_minutes: 100,
  genre_ids: [] as number[],
};

export function MoviesPanel() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenreName, setNewGenreName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    MoviesApi.list()
      .then((res) => setMovies(res.movies))
      .catch(() => setError("Could not load movies."));
    GenresApi.list()
      .then((res) => setGenres(res.genres))
      .catch(() => {});
  }
  useEffect(load, []);

  function startEdit(movie: Movie) {
    setEditingId(movie.id);
    setForm({
      title: movie.title,
      description: movie.description || "",
      poster_url: movie.poster_url || "",
      duration_minutes: movie.duration_minutes,
      genre_ids: movie.genres.map((g) => g.id),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function toggleGenre(id: number) {
    setForm((f) => ({
      ...f,
      genre_ids: f.genre_ids.includes(id)
        ? f.genre_ids.filter((g) => g !== id)
        : [...f.genre_ids, id],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        poster_url: form.poster_url || undefined,
        duration_minutes: Number(form.duration_minutes),
        genre_ids: form.genre_ids,
      };
      if (editingId) {
        await MoviesApi.update(editingId, payload);
      } else {
        await MoviesApi.create(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save movie.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this movie? This also removes its showtimes.")) return;
    try {
      await MoviesApi.remove(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete movie.",
      );
    }
  }

  async function handleAddGenre() {
    if (!newGenreName.trim()) return;
    try {
      await GenresApi.create(newGenreName.trim());
      setNewGenreName("");
      GenresApi.list().then((res) => setGenres(res.genres));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add genre.");
    }
  }

  return (
    <div className="admin-split">
      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          {editingId ? "Edit movie" : "Add a movie"}
        </h3>
        {error && <div className="banner banner-danger">{error}</div>}
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Poster URL</label>
            <input
              value={form.poster_url}
              onChange={(e) => setForm({ ...form, poster_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min={1}
              required
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({ ...form, duration_minutes: Number(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <label>Genres</label>
            <div className="genre-check-list">
              {genres.map((g) => (
                <label key={g.id} className="genre-check">
                  <input
                    type="checkbox"
                    checked={form.genre_ids.includes(g.id)}
                    onChange={() => toggleGenre(g.id)}
                  />
                  {g.name}
                </label>
              ))}
            </div>
            <div className="add-genre-row">
              <input
                placeholder="New genre name"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddGenre}
              >
                Add
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add movie"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          All movies
        </h3>
        {movies === null ? (
          <Spinner />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.genres.map((g) => g.name).join(", ") || "—"}</td>
                    <td className="mono">{m.duration_minutes}m</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(m)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(m.id)}
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
