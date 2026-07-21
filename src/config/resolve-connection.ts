import "dotenv/config";
import type { DbConnectionConfig, DbType } from "./types";

export interface ConnectionFlags {
  type?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}

const DEFAULT_PORTS: Record<DbType, number> = {
  postgres: 5432,
  mysql: 3306,
};

export function resolveConnectionConfig(
  flags: ConnectionFlags,
): DbConnectionConfig {
  const type = (flags.type || process.env.DB_TYPE) as DbType;
  if (type !== "postgres" && type !== "mysql") {
    throw new Error(
      `Unsupported or missing --type (got "${type}"). Use "postgres" or "mysql".`,
    );
  }

  const host = flags.host || process.env.DB_HOST;
  const username = flags.username || process.env.DB_USERNAME;
  const password = flags.password || process.env.DB_PASSWORD;
  const database = flags.database || process.env.DB_DATABASE;
  const port = parseInt(
    flags.port || process.env.DB_PORT || String(DEFAULT_PORTS[type]),
    10,
  );

  const missing = Object.entries({ host, username, database }).filter(
    ([, v]) => !v,
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required connection field(s): ${missing.map(([k]) => k).join(", ")}`,
    );
  }

  return {
    type,
    host: host!,
    port,
    username: username!,
    password: password || "",
    database: database!,
  };
}
