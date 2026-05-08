import { ConfigService } from '@nestjs/config';
export interface AppEnvironmentVariables {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    STELLAR_NETWORK: string;
    SOROBAN_CONTRACT_ADDRESS: string;
    USDC_ASSET_CODE: string;
    USDC_ISSUER: string;
}
export declare class AppConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    get databaseUrl(): string;
    get redisUrl(): string;
    get jwtSecret(): string;
    get stellarNetwork(): string;
    get sorobanContractAddress(): string;
    get usdcAssetCode(): string;
    get usdcIssuer(): string;
    private get;
}
