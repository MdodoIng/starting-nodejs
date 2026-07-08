import type { SeatWithStatus } from "../api/types";

interface SeatMapProps {
  seats: SeatWithStatus[];
  selectedIds: number[];
  onToggle: (seat: SeatWithStatus) => void;
}

export function SeatMap({ seats, selectedIds, onToggle }: SeatMapProps) {
  const rows = new Map<string, SeatWithStatus[]>();
  for (const seat of seats) {
    if (!rows.has(seat.row_label)) rows.set(seat.row_label, []);
    rows.get(seat.row_label)!.push(seat);
  }
  const rowLabels = Array.from(rows.keys()).sort();

  return (
    <div className="seatmap">
      <div className="seatmap-screen-wrap">
        <div className="seatmap-screen" />
        <div className="seatmap-screen-label mono">SCREEN</div>
      </div>

      <div className="seatmap-rows">
        {rowLabels.map((label) => (
          <div className="seatmap-row" key={label}>
            <span className="seatmap-row-label mono">{label}</span>
            <div className="seatmap-seats">
              {rows
                .get(label)!
                .sort((a, b) => a.seat_number - b.seat_number)
                .map((seat) => {
                  const isSelected = selectedIds.includes(seat.id);
                  const isBooked = seat.is_booked === 1;
                  const classes = [
                    "seat",
                    seat.seat_type === "vip" ? "seat-vip" : "",
                    isBooked ? "seat-booked" : "",
                    isSelected ? "seat-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={classes}
                      disabled={isBooked}
                      onClick={() => onToggle(seat)}
                      title={`${label}${seat.seat_number}${seat.seat_type === "vip" ? " · VIP" : ""}${
                        isBooked ? " · Booked" : ""
                      }`}
                      aria-pressed={isSelected}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="seatmap-legend">
        <span>
          <i className="seat-swatch seat-swatch-available" /> Available
        </span>
        <span>
          <i className="seat-swatch seat-swatch-vip" /> VIP
        </span>
        <span>
          <i className="seat-swatch seat-swatch-selected" /> Selected
        </span>
        <span>
          <i className="seat-swatch seat-swatch-booked" /> Booked
        </span>
      </div>
    </div>
  );
}
