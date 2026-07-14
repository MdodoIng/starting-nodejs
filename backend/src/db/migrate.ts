import fs from "fs";
import path from "path";
import { db } from "./database";

function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  const reservationColumns = db
    .prepare("PRAGMA table_info(reservations)")
    .all() as { name: string }[];
  const hasPaymentMethod = reservationColumns.some(
    (column) => column.name === "payment_method",
  );

  if (!hasPaymentMethod) {
    db.exec(
      "ALTER TABLE reservations ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'card';",
    );
    db.exec(
      "UPDATE reservations SET payment_method = 'card' WHERE payment_method IS NULL;",
    );
  }

  console.log("Migration complete: schema applied.");
}

migrate();
