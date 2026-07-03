import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Tag } from "./Tag.js";

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar", default: "" })
  body!: string;

  @Column({ type: "boolean", default: false })
  done!: boolean;

  @Column({ type: "datetime", nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable() // only one side owns the join table — this is that side
  tags!: Tag[];
}
