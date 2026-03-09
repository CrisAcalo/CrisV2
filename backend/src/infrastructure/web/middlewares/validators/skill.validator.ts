import { z } from 'zod';

export const createSkillSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Nombre demasiado largo'),
        isFromLinkedIn: z.boolean().optional(),
        isPublic: z.boolean().optional(),
    })
});

export const updateSkillSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'El nombre es obligatorio').max(100).optional(),
        isFromLinkedIn: z.boolean().optional(),
        isPublic: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string().uuid('ID de skill no válido')
    })
});

export const getSkillByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de skill no válido')
    })
});

export const deleteSkillSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de skill no válido')
    })
});
