import { z } from 'zod';
import { Role } from '../../../../domain/entities';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        role: z.nativeEnum(Role).optional(),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    })
});
