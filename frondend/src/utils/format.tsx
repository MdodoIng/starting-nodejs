export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the next N dates (including today) as { iso, label } for a date-picker strip. */
export function nextDates(n: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    });
  }
  return out;
}
