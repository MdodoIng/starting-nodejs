import { Module, forwardRef } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardGateway } from './leaderboard.gateway';
import { UserModule } from '../user/user.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [forwardRef(() => UserModule), GameModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardGateway],
  exports: [LeaderboardService, LeaderboardGateway],
})
export class LeaderboardModule {}
