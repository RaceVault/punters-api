import { LoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';
import { getRequestId } from './request-context';

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'jwt', 'secret', 'walletKey', 'privateKey'];

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

function redactString(value: string): string {
  return getSecretPatterns().reduce((current, pattern) => current.replace(pattern, '[REDACTED]'), value);
}

export class RedactingLogger implements LoggerService {
  private readonly pino: Logger;

  constructor() {
    this.pino = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      redact: {
        paths: SENSITIVE_KEYS.flatMap((k) => [`*.${k}`, k]),
        censor: '[REDACTED]',
      },
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: undefined,
    });
  }

  private withContext(message: string) {
    return redactString(message);
  }

  private child(context?: string) {
    const requestId = getRequestId();
    return this.pino.child({
      ...(context ? { context } : {}),
      ...(requestId ? { requestId } : {}),
    });
  }

  log(message: unknown, context?: string): void {
    this.child(context).info(this.withContext(String(message ?? '')));
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.child(context).error({ trace: trace ? redactString(trace) : undefined }, this.withContext(String(message ?? '')));
  }

  warn(message: unknown, context?: string): void {
    this.child(context).warn(this.withContext(String(message ?? '')));
  }

  debug(message: unknown, context?: string): void {
    this.child(context).debug(this.withContext(String(message ?? '')));
  }

  verbose(message: unknown, context?: string): void {
    this.child(context).trace(this.withContext(String(message ?? '')));
  }
}
