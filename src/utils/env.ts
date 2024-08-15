import {z} from 'zod';

const environmentSchema = z.object({
  PORT: z.string(),
  JWT_SIGN_KEY: z.string(),
  NODE_ENV: z.enum(['production', 'staging', 'development']),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly']),
});

const env = environmentSchema.parse(process.env);

export default env;
