import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envSchema = z.object({
    PORT: z.string().default('4000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().default('1d'),
    LINKEDIN_API_TOKEN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
