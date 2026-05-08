"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = exports.CACHE_TTL = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const redis_1 = __importDefault(require("@keyv/redis"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const events_module_1 = require("./events/events.module");
const bets_module_1 = require("./bets/bets.module");
const wallet_module_1 = require("./wallet/wallet.module");
const odds_module_1 = require("./odds/odds.module");
const redis_module_1 = require("./redis/redis.module");
const health_module_1 = require("./health/health.module");
const prisma_module_1 = require("./prisma/prisma.module");
const env_validation_1 = require("./config/env.validation");
const config_service_1 = require("./config/config.service");
exports.CACHE_TTL = {
    DEFAULT: 30_000,
    ODDS: 30_000,
    EVENTS: 60_000,
    USERS: 300_000,
};
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_validation_1.envValidationSchema,
                validationOptions: {
                    abortEarly: false,
                    allowUnknown: true,
                },
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: () => ({
                    stores: [new redis_1.default(process.env.REDIS_URL ?? 'redis://localhost:6379')],
                    ttl: exports.CACHE_TTL.DEFAULT,
                }),
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            events_module_1.EventsModule,
            bets_module_1.BetsModule,
            wallet_module_1.WalletModule,
            odds_module_1.OddsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, config_service_1.AppConfigService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map