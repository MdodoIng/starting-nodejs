import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import chalk from "chalk";
import { LogEntry } from "./logger.types";

const DEFAULT_LOG_PATH = resolve("./logs/dbbackup.log");

function ensureLogDir(logPath: string) {
  const dir = dirname(logPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export class OperationLogger {
  constructor(private readonly logPath: string = DEFAULT_LOG_PATH) {
    ensureLogDir(this.logPath);
  }

  /**
   * Wraps an async operation, timing it and writing a log entry regardless
   * of whether it succeeds or throws. Re-throws the original error after
   * logging, so calling code's error handling still works normally.
   */
  async track<T extends { filePath?: string; sizeBytes?: number }>(
    operation: LogEntry["operation"],
    dbType: string,
    database: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startedAt = new Date();

    try {
      const result = await fn();
      this.write({
        operation,
        dbType,
        database,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        status: "success",
        filePath: result.filePath,
        sizeBytes: result.sizeBytes,
      });
      return result;
    } catch (err: any) {
      this.write({
        operation,
        dbType,
        database,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        status: "failure",
        error: err.message,
      });
      throw err;
    }
  }

  private write(entry: LogEntry) {
    appendFileSync(this.logPath, JSON.stringify(entry) + "\n");
    this.printConsole(entry);
  }

  private printConsole(entry: LogEntry) {
    const durationSec = (entry.durationMs / 1000).toFixed(1);
    const line = `[${entry.finishedAt}] ${entry.operation} ${entry.dbType}/${entry.database} — ${durationSec}s`;

    if (entry.status === "success") {
      console.log(chalk.gray(line + " — logged"));
    } else {
      console.log(chalk.gray(line + ` — logged (error: ${entry.error})`));
    }
  }
}
