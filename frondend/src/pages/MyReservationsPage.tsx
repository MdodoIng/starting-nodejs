import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Reservation } from "../api/types";
import { ReservationsApi } from "../api/endpoints";
import { Spinner } from "../components/Spinner";
import { ApiError } from "../api/client";
import { formatDateTime, formatMoney } from "../utils/format";

export function MyReservationsPage() {
  const location = useLocation() as { state?: { justBooked?: boolean } };
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  function load() {
    ReservationsApi.mine()
      .then((res) => setReservations(res.reservations))
      .catch(() => setError("Could not load your reservations."));
  }

  useEffect(load, []);

  async function handleCancel(id: number) {
    setCancelingId(id);
    setError(null);
    try {
      await ReservationsApi.cancel(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not cancel this reservation.",
      );
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="page">
      <p className="section-eyebrow">Your tickets</p>
      <h1 className="marquee-heading" style={{ fontSize: 40 }}>
        My reservations
      </h1>

      {location.state?.justBooked && (
        <div className="banner banner-success" style={{ marginTop: 20 }}>
          Booked! Your seats are confirmed below.
        </div>
      )}
      {error && (
        <div className="banner banner-danger" style={{ marginTop: 20 }}>
          {error}
        </div>
      )}

      {reservations === null ? (
        <Spinner />
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <h3>No reservations yet</h3>
          <p>Browse movies and grab a seat.</p>
        </div>
      ) : (
        <div className="reservation-list">
          {reservations.map((r) => {
            const isUpcoming = new Date(r.start_time).getTime() > Date.now();
            const canCancel = isUpcoming && r.status === "confirmed";
            return (
              <div key={r.id} className="reservation-card card">
                <div className="reservation-card-main">
                  <div>
                    <p className="section-eyebrow" style={{ marginBottom: 4 }}>
                      {formatDateTime(r.start_time)}
                    </p>
                    <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>
                      {r.movie_title}
                    </h3>
                    <p
                      className="text-muted"
                      style={{ fontSize: 13, margin: 0 }}
                    >
                      {r.screen_name} · Seats:{" "}
                      {r.seats
                        .map((s) => `${s.row_label}${s.seat_number}`)
                        .join(", ")}
                    </p>
                    <p
                      className="text-muted"
                      style={{ fontSize: 13, margin: "4px 0 0" }}
                    >
                      Payment: {r.payment_method === "card"
                        ? "Card"
                        : r.payment_method === "paypal"
                        ? "PayPal"
                        : "Pay at venue"}
                    </p>
                  </div>
                  <div className="reservation-card-side">
                    <div
                      className="mono"
                      style={{ color: "var(--gold)", fontSize: 18 }}
                    >
                      {formatMoney(r.total_amount)}
                    </div>
                    <span
                      className={`pill ${r.status === "cancelled" ? "" : "pill-gold"}`}
                    >
                      {r.status === "cancelled"
                        ? "Cancelled"
                        : isUpcoming
                          ? "Upcoming"
                          : "Past"}
                    </span>
                  </div>
                </div>
                {canCancel && (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: 16 }}
                    disabled={cancelingId === r.id}
                    onClick={() => handleCancel(r.id)}
                  >
                    {cancelingId === r.id
                      ? "Cancelling…"
                      : "Cancel reservation"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
