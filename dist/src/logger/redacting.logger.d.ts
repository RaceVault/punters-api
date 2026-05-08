import { LoggerService } from '@nestjs/common';
export declare class RedactingLogger implements LoggerService {
    private readonly logger;
    log(message: unknown, context?: string): void;
    error(message: unknown, trace?: string, context?: string): void;
    warn(message: unknown, context?: string): void;
    debug?(message: unknown, context?: string): void;
    verbose?(message: unknown, context?: string): void;
    private format;
}
