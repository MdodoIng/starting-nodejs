import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./dev.db",
  logging: console.log, // prints every SQL query — useful while learning
});
