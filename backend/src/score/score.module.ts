import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Score } from './entities/score.entity';
import { UserModule } from '../user/user.module';
import { GameModule } from '../game/game.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Score]),
    UserModule,
    GameModule,
    LeaderboardModule,
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
