export function up(knex) {
  return knex.schema
    .createTable("tags", (table) => {
      table.increments("id");
      table.string("name").notNullable().unique();
    })
    .createTable("note_tags", (table) => {
      table
        .integer("note_id")
        .references("id")
        .inTable("notes")
        .onDelete("CASCADE");
      table
        .integer("tag_id")
        .references("id")
        .inTable("tags")
        .onDelete("CASCADE");
    });
}

export function down(knex) {
  return knex.schema.dropTable("note_tags").dropTable("tags");
}
