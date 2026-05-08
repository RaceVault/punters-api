"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = exports.TTL = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
exports.TTL = {
    JWT_BLACKLIST: 60 * 60 * 24,
    RATE_LIMIT: 60,
    ODDS_CACHE: 30,
    AUTH_CHALLENGE: 60 * 5,
};
let RedisService = RedisService_1 = class RedisService {
    logger = new common_1.Logger(RedisService_1.name);
    client;
    available = true;
    constructor() {
        this.client = new ioredis_1.default({
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
    isAvailable() {
        return this.available;
    }
    getClient() {
        return this.client;
    }
    async blacklistToken(jti, ttl = exports.TTL.JWT_BLACKLIST) {
        if (!this.available)
            return;
        await this.client.set(`blacklist:${jti}`, '1', 'EX', ttl);
    }
    async isTokenBlacklisted(jti) {
        if (!this.available)
            return false;
        return (await this.client.exists(`blacklist:${jti}`)) === 1;
    }
    async incrementRateLimit(key, ttl = exports.TTL.RATE_LIMIT) {
        if (!this.available)
            return 0;
        const count = await this.client.incr(`rate:${key}`);
        if (count === 1)
            await this.client.expire(`rate:${key}`, ttl);
        return count;
    }
    async getRateLimit(key) {
        if (!this.available)
            return 0;
        return Number(await this.client.get(`rate:${key}`)) || 0;
    }
    async setOdds(eventId, odds, ttl = exports.TTL.ODDS_CACHE) {
        if (!this.available)
            return;
        await this.client.set(`odds:${eventId}`, JSON.stringify(odds), 'EX', ttl);
    }
    async getOdds(eventId) {
        if (!this.available)
            return null;
        const val = await this.client.get(`odds:${eventId}`);
        return val ? JSON.parse(val) : null;
    }
    async setAuthChallenge(key, value, ttl = exports.TTL.AUTH_CHALLENGE) {
        if (!this.available)
            return;
        await this.client.set(`challenge:${key}`, value, 'EX', ttl);
    }
    async getAuthChallenge(key) {
        if (!this.available)
            return null;
        return this.client.get(`challenge:${key}`);
    }
    async deleteAuthChallenge(key) {
        if (!this.available)
            return;
        await this.client.del(`challenge:${key}`);
    }
    async ping() {
        try {
            return (await this.client.ping()) === 'PONG';
        }
        catch {
            return false;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map