import { Logger, LoggerService } from '@nestjs/common';

const SENSITIVE_ENV_KEYS = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'STELLAR_NETWORK',
  'SOROBAN_CONTRACT_ADDRESS',
  'USDC_ASSET_CODE',
  'USDC_ISSUER',
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSecretPatterns(): RegExp[] {
  return SENSITIVE_ENV_KEYS.flatMap((key) => {
    const value = process.env[key];
    return value ? [new RegExp(escapeRegExp(value), 'g')] : [];
  });
}

function redact(value: string): string {
  return getSecretPatterns().reduce((current, pattern) => current.replace(pattern, '[REDACTED]'), value);
}

export class RedactingLogger implements LoggerService {
  private readonly logger = new Logger(RedactingLogger.name);

  log(message: unknown, context?: string): void {
    this.logger.log(this.format(message), this.format(context));
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error(this.format(message), this.format(trace), this.format(context));
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn(this.format(message), this.format(context));
  }

  debug?(message: unknown, context?: string): void {
    this.logger.debug(this.format(message), this.format(context));
  }

  verbose?(message: unknown, context?: string): void {
    this.logger.verbose(this.format(message), this.format(context));
  }

  private format(value: unknown): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value !== 'string') {
      return redact(String(value));
    }

    return redact(value);
  }
}
