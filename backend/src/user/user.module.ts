import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => LeaderboardModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
