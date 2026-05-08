import { OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
export declare const TTL: {
    readonly JWT_BLACKLIST: number;
    readonly RATE_LIMIT: 60;
    readonly ODDS_CACHE: 30;
    readonly AUTH_CHALLENGE: number;
};
export declare class RedisService implements OnModuleDestroy {
    private readonly logger;
    private readonly client;
    private available;
    constructor();
    onModuleDestroy(): Promise<void>;
    isAvailable(): boolean;
    getClient(): Redis;
    blacklistToken(jti: string, ttl?: number): Promise<void>;
    isTokenBlacklisted(jti: string): Promise<boolean>;
    incrementRateLimit(key: string, ttl?: 60): Promise<number>;
    getRateLimit(key: string): Promise<number>;
    setOdds(eventId: string, odds: unknown, ttl?: 30): Promise<void>;
    getOdds(eventId: string): Promise<unknown | null>;
    setAuthChallenge(key: string, value: string, ttl?: number): Promise<void>;
    getAuthChallenge(key: string): Promise<string | null>;
    deleteAuthChallenge(key: string): Promise<void>;
    ping(): Promise<boolean>;
}
