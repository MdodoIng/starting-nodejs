import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { statSync } from "node:fs";
import { resolveConnectionConfig } from "../config/resolve-connection";
import { createDbAdapter } from "../db/adapter-factory";
import { ensureBackupDir, backupFilePath } from "../storage/local-storage";
import { timestampedFilename } from "../utils/filename";
import { gzipFile } from "../utils/compress";
import { OperationLogger } from "../utils/logger";

export function registerBackupCommand(program: Command) {
  program
    .command("backup")
    .description("Back up a database to a local, gzip-compressed SQL file")
    .requiredOption("--type <type>", "database type: postgres | mysql")
    .option("--host <host>", "database host")
    .option("--port <port>", "database port")
    .requiredOption("--username <username>", "database username")
    .option("--password <password>", "database password")
    .requiredOption("--database <database>", "database name")
    .option("--output-dir <dir>", "directory to store backups", "./backups")
    .option("--log-file <path>", "path to the operation log file")
    .option(
      "--format <format>",
      "postgres only: plain | custom (custom required for --tables on restore)",
      "plain",
    )
    .action(async (opts) => {
      const spinner = ora("Preparing backup...").start();
      const logger = new OperationLogger(opts.logFile);

      try {
        const config = resolveConnectionConfig(opts);
        const adapter = createDbAdapter(config);

        const result = await logger.track(
          "backup",
          config.type,
          config.database,
          async () => {
            const dir = ensureBackupDir(opts.outputDir);
            const filename = timestampedFilename(config.database, config.type);
            const rawPath = backupFilePath(dir, filename);

            spinner.text = `Dumping ${config.type} database "${config.database}"...`;
            await adapter.backup(rawPath, { format: opts.format });

            spinner.text = "Compressing backup...";
            const compressedPath = await gzipFile(rawPath);

            return {
              filePath: compressedPath,
              sizeBytes: statSync(compressedPath).size,
            };
          },
        );

        spinner.succeed(
          chalk.green(
            `Backup complete: ${result.filePath} (${(result.sizeBytes / 1024).toFixed(1)} KB)`,
          ),
        );
      } catch (err: any) {
        spinner.fail(chalk.red(`Backup failed: ${err.message}`));
        process.exitCode = 1;
      }
    });
}
