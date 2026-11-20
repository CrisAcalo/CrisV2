import { z } from 'zod';
import { Role } from '../../../../domain/entities';

const email = z.string().trim().max(254).email('Invalid email format');

export const registerSchema = z.object({
    body: z.object({
        email,
        password: z.string().min(12, 'Password must be at least 12 characters long')
            .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Password must be at most 72 bytes'),
        role: z.nativeEnum(Role).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email,
        password: z.string().min(1, 'Password is required').max(256),
        otp: z.string().regex(/^\d{6}$/, 'El código debe tener seis dígitos').optional(),
    }),
});
