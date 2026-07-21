import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { resolveConnectionConfig } from "../config/resolve-connection";
import { createDbAdapter } from "../db/adapter-factory";
import { OperationLogger } from "../utils/logger";

export function registerTestConnectionCommand(program: Command) {
  program
    .command("test-connection")
    .description("Validate database connection credentials")
    .requiredOption("--type <type>", "database type: postgres | mysql")
    .option("--host <host>", "database host")
    .option("--port <port>", "database port")
    .requiredOption("--username <username>", "database username")
    .option("--password <password>", "database password")
    .requiredOption("--database <database>", "database name")
    .option("--log-file <path>", "path to the operation log file")
    .action(async (opts) => {
      const spinner = ora("Connecting...").start();
      const logger = new OperationLogger(opts.logFile);

      try {
        const config = resolveConnectionConfig(opts);
        const adapter = createDbAdapter(config);

        await logger.track(
          "test-connection",
          config.type,
          config.database,
          async () => {
            await adapter.testConnection();
            return {};
          },
        );

        spinner.succeed(
          chalk.green(
            `Connected to ${config.type} database "${config.database}" successfully.`,
          ),
        );
      } catch (err: any) {
        spinner.fail(chalk.red(`Connection failed: ${err.message}`));
        process.exitCode = 1;
      }
    });
}
