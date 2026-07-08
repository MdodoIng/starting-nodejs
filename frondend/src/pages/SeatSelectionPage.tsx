import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Showtime, SeatWithStatus } from "../api/types";
import { ShowtimesApi, ReservationsApi } from "../api/endpoints";
import { Spinner } from "../components/Spinner";
import { SeatMap } from "../components/SeatMap";
import { ApiError } from "../api/client";
import { formatDateTime } from "../utils/format";

export function SeatSelectionPage() {
  const { id } = useParams();
  const showtimeId = Number(id);
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<SeatWithStatus[] | null>(null);
  const [selected, setSelected] = useState<SeatWithStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  function load() {
    ShowtimesApi.seatMap(showtimeId)
      .then((res) => {
        setShowtime(res.showtime);
        setSeats(res.seats);
      })
      .catch(() => setError("Could not load this showtime."));
  }

  useEffect(load, [showtimeId]);

  function toggleSeat(seat: SeatWithStatus) {
    setSelected((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  }

  async function confirmBooking() {
    if (!showtime || selected.length === 0) return;
    setBooking(true);
    setError(null);
    try {
      await ReservationsApi.create(
        showtime.id,
        selected.map((s) => s.id),
      );
      navigate("/reservations", { state: { justBooked: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 409) {
          // Seats were taken between load and booking — refresh the map
          setSelected([]);
          load();
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setBooking(false);
    }
  }

  if (error && !showtime) {
    return (
      <div className="page">
        <div className="banner banner-danger">{error}</div>
      </div>
    );
  }
  if (!showtime || !seats) return <Spinner />;

  const total = selected.length * showtime.price;

  return (
    <div className="page">
      <p className="section-eyebrow">{formatDateTime(showtime.start_time)}</p>
      <h1 className="marquee-heading" style={{ fontSize: 36 }}>
        {showtime.movie_title}
      </h1>
      <p className="text-muted" style={{ marginTop: 6 }}>
        {showtime.screen_name} · ${showtime.price.toFixed(2)} / seat
      </p>

      {error && (
        <div className="banner banner-danger" style={{ marginTop: 20 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: 28 }}>
        <SeatMap
          seats={seats}
          selectedIds={selected.map((s) => s.id)}
          onToggle={toggleSeat}
        />
      </div>

      <div className="ticket-stub">
        <div className="ticket-stub-info">
          <div>
            <div className="ticket-stub-label">Seats</div>
            <div className="ticket-stub-value">
              {selected.length === 0
                ? "—"
                : selected
                    .slice()
                    .sort((a, b) =>
                      (a.row_label + a.seat_number).localeCompare(
                        b.row_label + b.seat_number,
                      ),
                    )
                    .map((s) => `${s.row_label}${s.seat_number}`)
                    .join(", ")}
            </div>
          </div>
          <div className="ticket-stub-divider" />
          <div>
            <div className="ticket-stub-label">Total</div>
            <div className="ticket-stub-value gold">${total.toFixed(2)}</div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={selected.length === 0 || booking}
          onClick={confirmBooking}
        >
          {booking
            ? "Reserving…"
            : `Reserve ${selected.length || ""} seat${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
