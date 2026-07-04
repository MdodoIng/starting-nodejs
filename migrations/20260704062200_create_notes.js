export function up(knex) {
  return knex.schema.createTable("notes", (table) => {
    table.increments("id");
    table.string("title").notNullable();
    table.string("body").defaultTo("");
    table.boolean("done").defaultTo(false);
    table.timestamp("completed_at").nullable();
    table.timestamps(true, true); // adds created_at, updated_at
  });
}

export function down(knex) {
  return knex.schema.dropTable("notes");
}
