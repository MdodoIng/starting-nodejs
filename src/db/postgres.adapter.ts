import { Client } from "pg";
import { spawn } from "node:child_process";
import { createWriteStream, createReadStream, statSync } from "node:fs";
import { DbConnectionConfig } from "../config/types";
import {
  DbAdapter,
  BackupResult,
  BackupOptions,
  RestoreOptions,
} from "./db-adapter.interface";

export class PostgresAdapter implements DbAdapter {
  constructor(private readonly config: DbConnectionConfig) {}

  async testConnection(): Promise<void> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      connectionTimeoutMillis: 5000,
    });
    try {
      await client.connect();
      await client.query("SELECT 1");
    } finally {
      await client.end();
    }
  }

  async backup(
    outputPath: string,
    options?: BackupOptions,
  ): Promise<BackupResult> {
    const format = options?.format ?? "plain";
    return new Promise((resolve, reject) => {
      const args = [
        "-h",
        this.config.host,
        "-p",
        String(this.config.port),
        "-U",
        this.config.username,
        "-d",
        this.config.database,
        "-F",
        format === "custom" ? "c" : "p",
        "--no-password",
      ];
      const child = spawn("pg_dump", args, {
        env: { ...process.env, PGPASSWORD: this.config.password },
      });
      const outStream = createWriteStream(outputPath);
      child.stdout.pipe(outStream);
      let stderrOutput = "";
      child.stderr.on("data", (c) => {
        stderrOutput += c.toString();
      });
      child.on("error", (err) =>
        reject(new Error(`Failed to start pg_dump: ${err.message}`)),
      );
      child.on("close", (code) => {
        if (code !== 0)
          return reject(
            new Error(
              `pg_dump exited with code ${code}: ${stderrOutput.trim()}`,
            ),
          );
        resolve({ filePath: outputPath, sizeBytes: statSync(outputPath).size });
      });
    });
  }

  async restore(sqlFilePath: string, options?: RestoreOptions): Promise<void> {
    const isCustomFormat = await this.looksLikeCustomFormat(sqlFilePath);

    if (options?.tables?.length && !isCustomFormat) {
      throw new Error(
        "Selective table restore for Postgres requires a custom-format backup. " +
          "Re-run backup with --format custom, then restore with --tables.",
      );
    }

    if (isCustomFormat) {
      return this.restoreWithPgRestore(sqlFilePath, options?.tables);
    }
    return this.restoreWithPsql(sqlFilePath);
  }

  // Custom-format pg_dump files start with a "PGDMP" magic header.
  private async looksLikeCustomFormat(filePath: string): Promise<boolean> {
    const { readFileSync } = await import("node:fs");
    const buf = readFileSync(filePath, { encoding: null }).subarray(0, 5);
    return buf.toString("utf-8") === "PGDMP";
  }

  private restoreWithPsql(sqlFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        "-h",
        this.config.host,
        "-p",
        String(this.config.port),
        "-U",
        this.config.username,
        "-d",
        this.config.database,
        "--no-password",
        "-v",
        "ON_ERROR_STOP=1",
      ];
      const child = spawn("psql", args, {
        env: { ...process.env, PGPASSWORD: this.config.password },
      });
      createReadStream(sqlFilePath).pipe(child.stdin);
      let stderrOutput = "";
      child.stderr.on("data", (c) => {
        stderrOutput += c.toString();
      });
      child.on("error", (err) =>
        reject(new Error(`Failed to start psql: ${err.message}`)),
      );
      child.on("close", (code) => {
        if (code !== 0)
          return reject(
            new Error(`psql exited with code ${code}: ${stderrOutput.trim()}`),
          );
        resolve();
      });
    });
  }

  private restoreWithPgRestore(
    filePath: string,
    tables?: string[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        "-h",
        this.config.host,
        "-p",
        String(this.config.port),
        "-U",
        this.config.username,
        "-d",
        this.config.database,
        "--no-password",
        "--clean",
        "--if-exists",
      ];
      for (const table of tables ?? []) {
        args.push("--table", table);
      }
      args.push(filePath);

      const child = spawn("pg_restore", args, {
        env: { ...process.env, PGPASSWORD: this.config.password },
      });
      let stderrOutput = "";
      child.stderr.on("data", (c) => {
        stderrOutput += c.toString();
      });
      child.on("error", (err) =>
        reject(new Error(`Failed to start pg_restore: ${err.message}`)),
      );
      child.on("close", (code) => {
        // pg_restore commonly exits 1 on harmless "does not exist" warnings during --clean;
        // treat only "fatal"-labeled stderr output as a real failure.
        if (code !== 0 && /FATAL|failed/i.test(stderrOutput)) {
          return reject(new Error(`pg_restore failed: ${stderrOutput.trim()}`));
        }
        resolve();
      });
    });
  }
}
