import "reflect-metadata";
import { DataSource } from "typeorm";
import { Note } from "./entity/Note.js";
import { Tag } from "./entity/Tag.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "dev.db",
  synchronize: true, // dev-only: auto-creates tables from entities, no migration files
  logging: true, // prints every SQL query TypeORM runs — invaluable while learning
  entities: [Note, Tag],
});
