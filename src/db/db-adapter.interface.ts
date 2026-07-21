export interface BackupResult {
  filePath: string;
  sizeBytes: number;
}

export interface BackupOptions {
  format?: "plain" | "custom"; // Postgres only; MySQL ignores this
}

export interface RestoreOptions {
  /** Restrict restore to specific tables, if supported (Step 6). */
  tables?: string[];
}

export interface DbAdapter {
  testConnection(): Promise<void>;
  backup(outputPath: string): Promise<BackupResult>;
  restore(sqlFilePath: string, options?: RestoreOptions): Promise<void>;
}
