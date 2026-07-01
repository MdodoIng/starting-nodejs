import { User } from 'src/users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.orders)
  user: User;                // one user → many orders

  @ManyToMany(() => Product, product => product.orders)
  @JoinTable()              // this side owns the join table
  products: Product[];      // many orders ↔ many products

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'pending' })
  status: string;           // pending → confirmed → shipped → delivered
  @CreateDateColumn()
  createdAt: Date;
}