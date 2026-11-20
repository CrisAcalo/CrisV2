import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envSchema = z.object({
    PORT: z.string().default('4000'),
    CRISV2_DEV_HOST: z.string().optional(),
    DATABASE_URL: z.string().url(),
    AUTH_SESSION_TTL_MINUTES: z.coerce.number().int().min(5).max(720).default(30),
    ADMIN_MFA_REQUIRED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
    ADMIN_MFA_SECRETS: z.string().optional(),
    LINKEDIN_API_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().trim().min(1).optional(),
    RESEND_FROM: z.string().trim().email().optional(),
    MAIL_TO: z.string().email().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;
