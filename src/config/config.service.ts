import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get redisUrl(): string {
    return this.get('REDIS_URL');
  }

  get jwtSecret(): string {
    return this.get('JWT_SECRET');
  }

  get stellarNetwork(): string {
    return this.get('STELLAR_NETWORK');
  }

  get sorobanContractAddress(): string {
    return this.get('SOROBAN_CONTRACT_ADDRESS');
  }

  get usdcAssetCode(): string {
    return this.get('USDC_ASSET_CODE');
  }

  get usdcIssuer(): string {
    return this.get('USDC_ISSUER');
  }

  private get<T extends keyof AppEnvironmentVariables>(key: T): AppEnvironmentVariables[T] {
    return this.configService.get(key) as AppEnvironmentVariables[T];
  }
}
