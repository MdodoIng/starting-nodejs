#!/usr/bin/env node
import { Command } from "commander";
import { registerTestConnectionCommand } from "./commands/test-connection.command";
import { registerBackupCommand } from "./commands/backup.command";
import { registerRestoreCommand } from "./commands/restore.command";

const program = new Command()
  .name("dbbackup")
  .description(
    "CLI utility to backup and restore PostgreSQL and MySQL databases",
  )
  .version("1.0.0");

registerTestConnectionCommand(program);
registerBackupCommand(program);
registerRestoreCommand(program);

program.parse(process.argv);
