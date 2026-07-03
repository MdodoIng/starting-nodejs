export default {
  schema: "./db/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: "./dev.db" },
};
