"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedactingLogger = void 0;
const common_1 = require("@nestjs/common");
const SENSITIVE_ENV_KEYS = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'STELLAR_NETWORK',
    'SOROBAN_CONTRACT_ADDRESS',
    'USDC_ASSET_CODE',
    'USDC_ISSUER',
];
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getSecretPatterns() {
    return SENSITIVE_ENV_KEYS.flatMap((key) => {
        const value = process.env[key];
        return value ? [new RegExp(escapeRegExp(value), 'g')] : [];
    });
}
function redact(value) {
    return getSecretPatterns().reduce((current, pattern) => current.replace(pattern, '[REDACTED]'), value);
}
class RedactingLogger {
    logger = new common_1.Logger(RedactingLogger.name);
    log(message, context) {
        this.logger.log(this.format(message), this.format(context));
    }
    error(message, trace, context) {
        this.logger.error(this.format(message), this.format(trace), this.format(context));
    }
    warn(message, context) {
        this.logger.warn(this.format(message), this.format(context));
    }
    debug(message, context) {
        this.logger.debug(this.format(message), this.format(context));
    }
    verbose(message, context) {
        this.logger.verbose(this.format(message), this.format(context));
    }
    format(value) {
        if (value === undefined || value === null) {
            return '';
        }
        if (typeof value !== 'string') {
            return redact(String(value));
        }
        return redact(value);
    }
}
exports.RedactingLogger = RedactingLogger;
//# sourceMappingURL=redacting.logger.js.map