export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Tags", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Tags");
}
