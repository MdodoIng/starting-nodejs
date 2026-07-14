import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game } from './entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService], // Score module will need this to validate gameId
})
export class GameModule {}
