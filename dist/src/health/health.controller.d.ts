import { HealthCheckService } from '@nestjs/terminus';
import { RedisHealthIndicator } from '../redis/redis.health';
export declare class HealthController {
    private readonly health;
    private readonly redisHealth;
    constructor(health: HealthCheckService, redisHealth: RedisHealthIndicator);
    check(): any;
}
