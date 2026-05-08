import { ThrottlerStorage, ThrottlerStorageRecord } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

const HITS_KEY = (key: string) => `throttle:hits:${key}`;
const BLOCK_KEY = (key: string) => `throttle:block:${key}`;

export class RedisThrottlerStorageService implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    if (!this.redisService.isAvailable()) {
      return {
        totalHits: 0,
        timeToExpire: ttl,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }

    const client = this.redisService.getClient();
    const blockKey = BLOCK_KEY(key);
    const hitsKey = HITS_KEY(key);

    const blockedTtl = await client.ttl(blockKey);
    if (blockedTtl > 0) {
      const currentHits = Number((await client.get(hitsKey)) || 0);
      const hitsTtl = await client.ttl(hitsKey);
      return {
        totalHits: currentHits,
        timeToExpire: hitsTtl > 0 ? hitsTtl : ttl,
        isBlocked: true,
        timeToBlockExpire: blockedTtl,
      };
    }

    const totalHits = await client.incr(hitsKey);
    if (totalHits === 1) {
      await client.expire(hitsKey, ttl);
    }

    const timeToExpire = await client.ttl(hitsKey);
    const isBlocked = totalHits > limit;
    const timeToBlockExpire = isBlocked ? blockDuration : 0;

    if (isBlocked) {
      await client.set(blockKey, '1', 'EX', blockDuration);
    }

    return {
      totalHits,
      timeToExpire: timeToExpire > 0 ? timeToExpire : ttl,
      isBlocked,
      timeToBlockExpire,
    };
  }
}
