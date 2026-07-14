import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: parseInt(config.get('REDIS_PORT') as string),
          password: config.get('REDIS_PASSWORD') || undefined,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
