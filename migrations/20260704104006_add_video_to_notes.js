export function up(knex) {
  return knex.schema.alterTable("notes", (table) => {
    table.string("video_path").nullable();
  });
}
export function down(knex) {
  return knex.schema.alterTable("notes", (table) => {
    table.dropColumn("video_path");
  });
}