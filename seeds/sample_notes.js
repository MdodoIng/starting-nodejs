export async function seed(knex) {
  await knex("notes").del();
  await knex("notes").insert([
    { title: "Buy milk", body: "2%" },
    { title: "Finish report", done: true },
  ]);
}
