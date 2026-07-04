export function up(knex) {
  return knex.schema.alterTable("notes", (table) => {
    table.string("image_path").nullable();
  });
}

export function down(knex) {
  return knex.schema.alterTable("notes", (table) => {
    table.dropColumn("image_path");
  });
}