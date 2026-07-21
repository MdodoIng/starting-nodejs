import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { unlinkSync } from 'node:fs';
import { resolveConnectionConfig } from '../config/resolve-connection';
import { createDbAdapter } from '../db/adapter-factory';
import { gunzipFile } from '../utils/compress';
import { OperationLogger } from '../utils/logger';

export function registerRestoreCommand(program: Command) {
  program
    .command('restore')
    .description('Restore a database from a gzip-compressed SQL backup file')
    .requiredOption('--type <type>', 'database type: postgres | mysql')
    .option('--host <host>', 'database host')
    .option('--port <port>', 'database port')
    .requiredOption('--username <username>', 'database username')
    .option('--password <password>', 'database password')
    .requiredOption('--database <database>', 'database name')
    .requiredOption('--file <path>', 'path to the .sql.gz backup file to restore')
    .option('--tables <tables>', 'comma-separated list of tables to restore selectively')
    .option('--log-file <path>', 'path to the operation log file')
    .action(async (opts) => {
      const spinner = ora('Preparing restore...').start();
      const logger = new OperationLogger(opts.logFile);
      let decompressedPath: string | null = null;

      try {
        const config = resolveConnectionConfig(opts);
        const adapter = createDbAdapter(config);
        const tables = opts.tables ? opts.tables.split(',').map((t: string) => t.trim()) : undefined;

        await logger.track('restore', config.type, config.database, async () => {
          spinner.text = 'Decompressing backup file...';
          decompressedPath = await gunzipFile(opts.file);

          spinner.text = tables
            ? `Restoring tables [${tables.join(', ')}] into ${config.type} database "${config.database}"...`
            : `Restoring into ${config.type} database "${config.database}"...`;
          await adapter.restore(decompressedPath, { tables });

          return { filePath: opts.file };
        });

        spinner.succeed(chalk.green(`Restore complete from ${opts.file}`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Restore failed: ${err.message}`));
        process.exitCode = 1;
      } finally {
        if (decompressedPath) {
          try { unlinkSync(decompressedPath); } catch { /* ignore */ }
        }
      }
    });
}