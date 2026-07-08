import { useEffect, useState, type FormEvent } from "react";
import type { Screen } from "../../api/types";
import { ScreensApi } from "../../api/endpoints";
import { Spinner } from "../../components/Spinner";
import { ApiError } from "../../api/client";

export function ScreensPanel() {
  const [screens, setScreens] = useState<Screen[] | null>(null);
  const [name, setName] = useState("");
  const [rows, setRows] = useState(6);
  const [columns, setColumns] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    ScreensApi.list()
      .then((res) => setScreens(res.screens))
      .catch(() => setError("Could not load screens."));
  }
  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await ScreensApi.create({ name, rows, columns });
      setName("");
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create screen.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm("Delete this screen? This also removes its seats and showtimes.")
    )
      return;
    try {
      await ScreensApi.remove(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not delete screen.",
      );
    }
  }

  return (
    <div className="admin-split">
      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          Add a screen
        </h3>
        {error && <div className="banner banner-danger">{error}</div>}
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Screen 3"
            />
          </div>
          <div className="field">
            <label>Rows</label>
            <input
              type="number"
              min={1}
              max={26}
              required
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Seats per row</label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
            />
          </div>
          <p className="text-faint" style={{ fontSize: 12, marginBottom: 16 }}>
            Seats are generated automatically. The back two rows are marked VIP.
          </p>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create screen"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="admin-subheading" style={{ marginTop: 0 }}>
          All screens
        </h3>
        {screens === null ? (
          <Spinner />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Layout</th>
                  <th>Capacity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {screens.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="mono">
                      {s.rows} × {s.columns}
                    </td>
                    <td className="mono">{s.rows * s.columns} seats</td>
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
