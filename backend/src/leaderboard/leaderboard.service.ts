import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { leaderboardKeys } from './leaderboard.constants';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly gameService: GameService,
  ) {}

  // Turns a flat [id, score, id, score, ...] ZREVRANGE result into ranked,
  // username-enriched objects.
  private async hydrate(
    flat: string[],
    startRank = 0,
  ): Promise<LeaderboardEntry[]> {
    const rows: { userId: number; score: number }[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      rows.push({ userId: parseInt(flat[i]), score: parseFloat(flat[i + 1]) });
    }
    if (rows.length === 0) return [];

    const users = await Promise.all(
      rows.map((r) => this.userService.findById(r.userId).catch(() => null)),
    );

    return rows.map((r, idx) => ({
      rank: startRank + idx + 1,
      userId: r.userId,
      username: users[idx]?.username ?? '(deleted user)',
      score: r.score,
    }));
  }

  async getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const flat = await this.redis.zrevrange(
      leaderboardKeys.global,
      0,
      limit - 1,
      'WITHSCORES',
    );
    return this.hydrate(flat);
  }

  async getGameLeaderboard(
    gameName: string,
    limit = 10,
  ): Promise<LeaderboardEntry[]> {
    const game = await this.gameService.findByName(gameName);
    const flat = await this.redis.zrevrange(
      leaderboardKeys.game(game.id),
      0,
      limit - 1,
      'WITHSCORES',
    );
    return this.hydrate(flat);
  }

  async getUserRanking(userId: number, gameName: string) {
    const game = await this.gameService.findByName(gameName);
    const key = leaderboardKeys.game(game.id);

    const [rank, score] = await Promise.all([
      this.redis.zrevrank(key, String(userId)),
      this.redis.zscore(key, String(userId)),
    ]);

    if (rank === null) {
      throw new NotFoundException(
        'User has not submitted a score for this game yet',
      );
    }

    return {
      userId,
      gameName,
      rank: rank + 1,
      score: parseFloat(score as string),
    };
  }
}
