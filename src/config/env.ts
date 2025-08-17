import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
    PORT: z.string().default('4000'),
    NODE_ENV: z.string().default('development'),
    WASABI_ENDPOINT: z.string().url(),
    WASABI_REGION: z.string(),
    WASABI_BUCKET: z.string().min(1),
    WASABI_ACCESS_KEY_ID: z.string().min(1),
    WASABI_SECRET_ACCESS_KEY: z.string().min(1),
    PUBLIC_BASE_URL: z.string().url(),
    CORS_ORIGIN: z.string().optional()
});

export const env = schema.parse(process.env);

export const isProd = env.NODE_ENV === 'production';
