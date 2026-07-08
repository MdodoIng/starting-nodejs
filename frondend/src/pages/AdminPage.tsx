import { useState } from "react";
import { OverviewPanel } from "./admin/OverviewPanel.tsx";
import { MoviesPanel } from "./admin/MoviesPanel";
import { ScreensPanel } from "./admin/ScreensPanel";
import { ShowtimesPanel } from "./admin/ShowtimesPanel";
import { UsersPanel } from "./admin/UsersPanel";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "movies", label: "Movies" },
  { key: "screens", label: "Screens" },
  { key: "showtimes", label: "Showtimes" },
  { key: "users", label: "Users" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminPage() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div className="page">
      <p className="section-eyebrow">Box office</p>
      <h1 className="marquee-heading" style={{ fontSize: 40 }}>
        Admin
      </h1>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab ${tab === t.key ? "admin-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        {tab === "overview" && <OverviewPanel />}
        {tab === "movies" && <MoviesPanel />}
        {tab === "screens" && <ScreensPanel />}
        {tab === "showtimes" && <ShowtimesPanel />}
        {tab === "users" && <UsersPanel />}
      </div>
    </div>
  );
}
