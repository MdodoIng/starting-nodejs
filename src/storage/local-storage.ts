import { mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

export function ensureBackupDir(dir = "./backups"): string {
  const resolved = resolve(dir);
  if (!existsSync(resolved)) {
    mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

export function backupFilePath(dir: string, filename: string): string {
  return join(dir, filename);
}
