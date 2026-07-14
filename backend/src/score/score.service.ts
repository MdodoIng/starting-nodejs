import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Score } from './entities/score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { LeaderboardGateway } from '../leaderboard/leaderboard.gateway';
import { leaderboardKeys } from '../leaderboard/leaderboard.constants';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepo: Repository<Score>,
    private readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly leaderboardGateway: LeaderboardGateway,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async submit(
    userId: number,
    gameName: string,
    dto: CreateScoreDto,
  ): Promise<Score> {
    const user = await this.userService.findById(userId);
    const game = await this.gameService.findByName(gameName);

    const score = this.scoreRepo.create({ user, game, value: dto.value });
    const saved = await this.scoreRepo.save(score);

    await Promise.all([
      this.redis.zadd(leaderboardKeys.global, 'GT', dto.value, String(user.id)),
      this.redis.zadd(
        leaderboardKeys.game(game.id),
        'GT',
        dto.value,
        String(user.id),
      ),
    ]);

    this.leaderboardGateway.emitLeaderboardUpdate(gameName, {
      userId: user.id,
      username: user.username,
      gameName,
      value: dto.value,
      submittedAt: saved.createdAt,
    });

    return saved;
  }

  async findHighestScores(gameName: string, limit = 10): Promise<Score[]> {
    const game = await this.gameService.findByName(gameName);
    return this.scoreRepo.find({
      where: { game: { id: game.id } },
      order: { value: 'DESC' },
      take: limit,
    });
  }

  async topPlayersReport(
    gameId: number,
    startDate: Date,
    endDate: Date,
    limit = 10,
  ): Promise<Score[]> {
    return this.scoreRepo.find({
      where: { game: { id: gameId }, createdAt: Between(startDate, endDate) },
      order: { value: 'DESC' },
      take: limit,
    });
  }
}
