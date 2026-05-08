"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.envValidationSchema = joi_1.default.object({
    DATABASE_URL: joi_1.default.string()
        .uri({ scheme: ['postgresql', 'postgres'] })
        .required(),
    REDIS_URL: joi_1.default.string()
        .uri({ scheme: ['redis', 'rediss'] })
        .required(),
    JWT_SECRET: joi_1.default.string().required(),
    STELLAR_NETWORK: joi_1.default.string().required(),
    SOROBAN_CONTRACT_ADDRESS: joi_1.default.string().required(),
    USDC_ASSET_CODE: joi_1.default.string().required(),
    USDC_ISSUER: joi_1.default.string().required(),
}).unknown();
//# sourceMappingURL=env.validation.js.map