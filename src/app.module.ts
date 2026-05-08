import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { PrismaModule } from './prisma/prisma.module';
import { envValidationSchema } from './config/env.validation';
import { AppConfigService } from './config/config.service';
import { RedisService } from './redis/redis.service';
import { RedisThrottlerStorageService } from './throttler/redis-throttler.storage';
import { RATE_LIMIT_WHITELISTED_IPS, getRequestIp, hasThrottleMetadata } from './throttler/throttler.utils';
import KeyvRedis from '@keyv/redis';

// Per-resource TTLs (ms)
export const CACHE_TTL = {
  DEFAULT: 30_000,
  ODDS: 30_000,
  EVENTS: 60_000,
  USERS: 300_000,
} as const;

const DEFAULT_RATE_LIMIT = 100;
const AUTH_RATE_LIMIT = 5;
const BET_RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const whitelistedIps = new Set(RATE_LIMIT_WHITELISTED_IPS);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [new KeyvRedis(process.env.REDIS_URL ?? 'redis://localhost:6379')],
        ttl: CACHE_TTL.DEFAULT,
      }),
    }),
    PrismaModule,
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [
          {
            name: 'default',
            limit: DEFAULT_RATE_LIMIT,
            ttl: RATE_LIMIT_WINDOW_SECONDS,
            getTracker: (req) => getRequestIp(req),
          },
          {
            name: 'auth',
            limit: AUTH_RATE_LIMIT,
            ttl: RATE_LIMIT_WINDOW_SECONDS,
            skipIf: (context) => !hasThrottleMetadata(context, 'auth'),
            getTracker: (req) => getRequestIp(req),
          },
          {
            name: 'bet',
            limit: BET_RATE_LIMIT,
            ttl: RATE_LIMIT_WINDOW_SECONDS,
            skipIf: (context) => !hasThrottleMetadata(context, 'bet'),
            getTracker: (req) => req.user?.id ?? getRequestIp(req),
          },
        ],
        storage: new RedisThrottlerStorageService(redisService),
        setHeaders: true,
        skipIf: (context) => {
          const req = context.switchToHttp().getRequest();
          return whitelistedIps.has(getRequestIp(req));
        },
      }),
    }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    BetsModule,
    WalletModule,
    OddsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService, { provide: APP_GUARD, useClass: ThrottlerGuard }],

})
export class AppModule {}
