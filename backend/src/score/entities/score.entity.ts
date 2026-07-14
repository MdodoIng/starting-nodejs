import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Game } from '../../game/entities/game.entity';

@Entity('scores')
@Index(['game', 'createdAt']) // speeds up the date-range top-players query in Step 6
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Game, { eager: true, onDelete: 'CASCADE' })
  game: Game;

  @Column({ type: 'float' })
  value: number;

  @CreateDateColumn()
  createdAt: Date;
}
