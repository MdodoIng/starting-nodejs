export type OperationStatus = "success" | "failure";

export interface LogEntry {
  operation: "backup" | "restore" | "test-connection";
  dbType: string;
  database: string;
  startedAt: string; // ISO timestamp
  finishedAt: string; // ISO timestamp
  durationMs: number;
  status: OperationStatus;
  filePath?: string;
  sizeBytes?: number;
  error?: string;
}
