import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";

export class Note extends Model {}

Note.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [3, 200] },
    },
    body: { type: DataTypes.STRING, defaultValue: "" },
    done: { type: DataTypes.BOOLEAN, defaultValue: false },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "Note",
  },
);
