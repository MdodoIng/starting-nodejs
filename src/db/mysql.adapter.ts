import mysql from 'mysql2/promise';
import { spawn } from 'node:child_process';
import { createWriteStream, createReadStream, statSync, writeFileSync, unlinkSync } from 'node:fs';
import { DbConnectionConfig } from '../config/types';
import { DbAdapter, BackupResult, BackupOptions, RestoreOptions } from './db-adapter.interface';
import { extractTableStatements } from '../utils/mysql-table-extractor';

export class MysqlAdapter implements DbAdapter {
  constructor(private readonly config: DbConnectionConfig) {}

  async testConnection(): Promise<void> {
    const connection = await mysql.createConnection({
      host: this.config.host, port: this.config.port, user: this.config.username,
      password: this.config.password, database: this.config.database, connectTimeout: 5000,
    });
    try { await connection.query('SELECT 1'); } finally { await connection.end(); }
  }

  async backup(outputPath: string, _options?: BackupOptions): Promise<BackupResult> {
    return new Promise((resolve, reject) => {
      const args = ['-h', this.config.host, '-P', String(this.config.port), '-u', this.config.username, this.config.database];
      const child = spawn('mysqldump', args, { env: { ...process.env, MYSQL_PWD: this.config.password } });
      const outStream = createWriteStream(outputPath);
      child.stdout.pipe(outStream);
      let stderrOutput = '';
      child.stderr.on('data', (c) => { stderrOutput += c.toString(); });
      child.on('error', (err) => reject(new Error(`Failed to start mysqldump: ${err.message}`)));
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error(`mysqldump exited with code ${code}: ${stderrOutput.trim()}`));
        resolve({ filePath: outputPath, sizeBytes: statSync(outputPath).size });
      });
    });
  }

  async restore(sqlFilePath: string, options?: RestoreOptions): Promise<void> {
    let fileToRestore = sqlFilePath;
    let tempFile: string | null = null;

    if (options?.tables?.length) {
      const extracted = extractTableStatements(sqlFilePath, options.tables);
      tempFile = `${sqlFilePath}.selective.sql`;
      writeFileSync(tempFile, extracted);
      fileToRestore = tempFile;
    }

    try {
      await this.runMysqlClient(fileToRestore);
    } finally {
      if (tempFile) {
        try { unlinkSync(tempFile); } catch { /* ignore */ }
      }
    }
  }

  private runMysqlClient(sqlFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['-h', this.config.host, '-P', String(this.config.port), '-u', this.config.username, this.config.database];
      const child = spawn('mysql', args, { env: { ...process.env, MYSQL_PWD: this.config.password } });
      createReadStream(sqlFilePath).pipe(child.stdin);
      let stderrOutput = '';
      child.stderr.on('data', (c) => { stderrOutput += c.toString(); });
      child.on('error', (err) => reject(new Error(`Failed to start mysql: ${err.message}`)));
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error(`mysql exited with code ${code}: ${stderrOutput.trim()}`));
        resolve();
      });
    });
  }
}