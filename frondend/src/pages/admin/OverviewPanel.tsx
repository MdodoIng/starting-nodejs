import { useEffect, useState } from "react";
import type { Summary, CapacityRow, RevenueByMovie } from "../../api/types";
import { ReportsApi } from "../../api/endpoints";
import { Spinner } from "../../components/Spinner";
import { formatDateTime, formatMoney } from "../../utils/format";

export function OverviewPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [capacity, setCapacity] = useState<CapacityRow[] | null>(null);
  const [revenue, setRevenue] = useState<RevenueByMovie[] | null>(null);

  useEffect(() => {
    ReportsApi.summary()
      .then(setSummary)
      .catch(() => {});
    ReportsApi.capacity()
      .then((r) => setCapacity(r.capacity))
      .catch(() => {});
    ReportsApi.revenueByMovie()
      .then((r) => setRevenue(r.revenue_by_movie))
      .catch(() => {});
  }, []);

  if (!summary) return <Spinner />;

  return (
    <div>
      <div className="stat-grid">
        <StatCard
          label="Total revenue"
          value={formatMoney(summary.total_revenue)}
        />
        <StatCard
          label="Confirmed reservations"
          value={String(summary.confirmed_reservations)}
        />
        <StatCard label="Tickets sold" value={String(summary.tickets_sold)} />
        <StatCard
          label="Upcoming showtimes"
          value={String(summary.upcoming_showtimes)}
        />
      </div>

      <h3 className="admin-subheading">Revenue by movie</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Reservations</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {revenue?.map((row) => (
              <tr key={row.movie_id}>
                <td>{row.title}</td>
                <td>{row.reservation_count}</td>
                <td className="mono">{formatMoney(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="admin-subheading">Showtime capacity</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Screen</th>
              <th>Start</th>
              <th>Booked / Total</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {capacity?.map((row) => (
              <tr key={row.showtime_id}>
                <td>{row.movie_title}</td>
                <td>{row.screen_name}</td>
                <td className="mono">{formatDateTime(row.start_time)}</td>
                <td className="mono">
                  {row.booked_seats} / {row.total_seats}
                </td>
                <td>
                  <div className="utilization-bar">
                    <div
                      className="utilization-bar-fill"
                      style={{ width: `${row.utilization_percent}%` }}
                    />
                  </div>
                  <span className="mono" style={{ fontSize: 12 }}>
                    {row.utilization_percent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value mono">{value}</div>
    </div>
  );
}
