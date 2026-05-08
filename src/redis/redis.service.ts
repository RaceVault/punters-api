import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

// TTLs in seconds per resource type
export const TTL = {
  JWT_BLACKLIST: 60 * 60 * 24, // 24h
  RATE_LIMIT: 60,              // 1 min window
  ODDS_CACHE: 30,              // 30s
  AUTH_CHALLENGE: 60 * 5,     // 5 min
} as const;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private available = true;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    this.client.on('error', (err) => {
      if (this.available) {
        this.logger.warn(`Redis unavailable, degrading gracefully: ${err.message}`);
        this.available = false;
      }
    });

    this.client.on('connect', () => {
      this.available = true;
      this.logger.log('Redis connected');
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis initial connect failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  isAvailable(): boolean {
    return this.available;
  }

  getClient(): Redis {
    return this.client;
  }

  // JWT Blacklist
  async blacklistToken(jti: string, ttl = TTL.JWT_BLACKLIST): Promise<void> {
    if (!this.available) return;
    await this.client.set(`blacklist:${jti}`, '1', 'EX', ttl);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    if (!this.available) return false;
    return (await this.client.exists(`blacklist:${jti}`)) === 1;
  }

  // Rate Limiting
  async incrementRateLimit(key: string, ttl = TTL.RATE_LIMIT): Promise<number> {
    if (!this.available) return 0;
    const count = await this.client.incr(`rate:${key}`);
    if (count === 1) await this.client.expire(`rate:${key}`, ttl);
    return count;
  }

  async getRateLimit(key: string): Promise<number> {
    if (!this.available) return 0;
    return Number(await this.client.get(`rate:${key}`)) || 0;
  }

  // Odds Cache
  async setOdds(eventId: string, odds: unknown, ttl = TTL.ODDS_CACHE): Promise<void> {
    if (!this.available) return;
    await this.client.set(`odds:${eventId}`, JSON.stringify(odds), 'EX', ttl);
  }

  async getOdds(eventId: string): Promise<unknown | null> {
    if (!this.available) return null;
    const val = await this.client.get(`odds:${eventId}`);
    return val ? JSON.parse(val) : null;
  }

  // Auth Challenges (e.g. OTP, PKCE)
  async setAuthChallenge(key: string, value: string, ttl = TTL.AUTH_CHALLENGE): Promise<void> {
    if (!this.available) return;
    await this.client.set(`challenge:${key}`, value, 'EX', ttl);
  }

  async getAuthChallenge(key: string): Promise<string | null> {
    if (!this.available) return null;
    return this.client.get(`challenge:${key}`);
  }

  async deleteAuthChallenge(key: string): Promise<void> {
    if (!this.available) return;
    await this.client.del(`challenge:${key}`);
  }

  // Health check ping
  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
