import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  price: number

  @Column({ nullable: true })
  image: string
}