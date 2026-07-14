/**
 * Helpers to compute the period-bucket strings used for periodic leaderboards,
 * plus TTLs so old periodic sorted sets clean themselves up automatically.
 */

function pad(n) {
  return String(n).padStart(2, "0");
}

function dailyKeyFor(date = new Date()) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function monthlyKeyFor(date = new Date()) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

// ISO week number (1-53)
function weeklyKeyFor(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(weekNo)}`;
}

const SECONDS_IN_DAY = 60 * 60 * 24;

module.exports = {
  dailyKeyFor,
  weeklyKeyFor,
  monthlyKeyFor,
  TTL_DAILY: SECONDS_IN_DAY * 3, // keep ~3 days of daily boards
  TTL_WEEKLY: SECONDS_IN_DAY * 21, // keep ~3 weeks
  TTL_MONTHLY: SECONDS_IN_DAY * 95, // keep ~3 months
};
