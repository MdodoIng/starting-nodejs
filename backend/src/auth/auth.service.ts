import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  private refreshTokenKey(userId: number) {
    return `refresh_token:${userId}`;
  }

  private async issueTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: `${this.config.get('ACCESSTOKEN_LIFETIME')}s`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.config.get('REFRESHTOKEN_LIFETIME')}s`,
    });

    // Store a hash of the refresh token, not the token itself — if Redis were
    // ever compromised, a leaked hash can't be replayed as a valid token.
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.redis.set(
      this.refreshTokenKey(userId),
      hashedRefresh,
      'EX',
      parseInt(this.config.get('REFRESHTOKEN_LIFETIME') as string),
    );

    return { accessToken, refreshToken };
  }

  async signup(dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, username: user.username, email: user.email },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, username: user.username, email: user.email },
      ...tokens,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    let payload: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const storedHash = await this.redis.get(this.refreshTokenKey(payload.sub));
    if (!storedHash)
      throw new UnauthorizedException('Session not found, please log in again');

    const matches = await bcrypt.compare(oldRefreshToken, storedHash);
    if (!matches)
      throw new UnauthorizedException('Refresh token no longer valid');

    // Rotate: issue a brand new pair and invalidate the old one implicitly
    // (issueTokens overwrites the Redis key with the new hash).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.issueTokens(payload.sub, payload.email, payload.role);
  }

  async logout(userId: number) {
    await this.redis.del(this.refreshTokenKey(userId));
    return { message: 'Logged out successfully' };
  }
}
