import Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
  JWT_SECRET: Joi.string().required(),
  STELLAR_NETWORK: Joi.string().required(),
  SOROBAN_CONTRACT_ADDRESS: Joi.string().required(),
  USDC_ASSET_CODE: Joi.string().required(),
  USDC_ISSUER: Joi.string().required(),
}).unknown();
