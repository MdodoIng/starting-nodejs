import fs from "fs";
import path from "path";
import { db } from "./database";

function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  console.log("Migration complete: schema applied.");
}

migrate();
