import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Exclude } from 'class-transformer';      // add this

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()                                       // add this — hides password everywhere
  password: string;

  @Column({ default: 'customer' })
  role: string;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}