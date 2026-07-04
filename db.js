import knexFactory from "knex";

export const db = knexFactory({
  client: "better-sqlite3",
  connection: { filename: "./dev.db" },
  useNullAsDefault: true, // required for sqlite — see note below
});
