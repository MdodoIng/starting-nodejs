import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index.js";

import { Note } from "./Note.js";
import { Tag } from "./Tag.js";

export class Tag extends Model {}

Tag.init(
  {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: "Tag" },
);

Note.belongsToMany(Tag, { through: "NoteTags" });
Tag.belongsToMany(Note, { through: "NoteTags" });
