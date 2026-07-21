export function timestampedFilename(database: string, type: string): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-"); // filesystem-safe
  return `${database}_${type}_${stamp}.sql`;
}
