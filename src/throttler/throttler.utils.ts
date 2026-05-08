import { ExecutionContext } from '@nestjs/common';

const THROTTLER_LIMIT_METADATA = 'THROTTLER:LIMIT';

export const RATE_LIMIT_WHITELISTED_IPS = (process.env.RATE_LIMIT_WHITELISTED_IPS ?? '127.0.0.1,::1')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

export function getRequestIp(req: Record<string, any>): string {
  if (!req) {
    return '';
  }

  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  if (req.ip) {
    return req.ip;
  }

  return req.connection?.remoteAddress ?? '';
}

export function hasThrottleMetadata(context: ExecutionContext, throttlerName: string): boolean {
  const handler = context.getHandler();
  const classRef = context.getClass();
  return (
    Reflect.hasMetadata(THROTTLER_LIMIT_METADATA + throttlerName, handler) ||
    Reflect.hasMetadata(THROTTLER_LIMIT_METADATA + throttlerName, classRef)
  );
}
