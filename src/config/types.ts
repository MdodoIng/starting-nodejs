export type DbType = "postgres" | "mysql";

export interface DbConnectionConfig {
  type: DbType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
