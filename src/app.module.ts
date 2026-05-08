import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { BetsModule } from './bets/bets.module';
import { WalletModule } from './wallet/wallet.module';
import { OddsModule } from './odds/odds.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import KeyvRedis from '@keyv/redis';

// Per-resource TTLs (ms)
export const CACHE_TTL = {
  DEFAULT: 30_000,
  ODDS: 30_000,
  EVENTS: 60_000,
  USERS: 300_000,
} as const;

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [
          new KeyvRedis(
            `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
          ),
        ],
        ttl: CACHE_TTL.DEFAULT,
      }),
    }),
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    EventsModule,
    BetsModule,
    WalletModule,
    OddsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
