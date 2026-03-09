import { z } from 'zod';

// Helper to parse a date value (string or Date) into a comparable timestamp
const toMs = (d: string | Date) => new Date(d).getTime();

const dateRefinement = (body: { startDate?: string | Date; endDate?: string | Date | null }, ctx: z.RefinementCtx) => {
    if (body.startDate && body.endDate) {
        if (toMs(body.startDate) > toMs(body.endDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
                path: ['endDate'],
            });
        }
    }
};

export const createExperienceSchema = z.object({
    body: z.object({
        role: z.string().min(1, 'El rol es obligatorio'),
        company: z.string().min(1, 'La compañía es obligatoria'),
        startDate: z.string().datetime().or(z.date()),
        endDate: z.string().datetime().or(z.date()).optional().nullable(),
        description: z.string().optional().nullable(),
        isImportedFromLinkedIn: z.boolean().default(false)
    }).superRefine(dateRefinement)
});

export const updateExperienceSchema = z.object({
    body: z.object({
        role: z.string().min(1, 'El rol es obligatorio').optional(),
        company: z.string().min(1, 'La compañía es obligatoria').optional(),
        startDate: z.string().datetime().or(z.date()).optional(),
        endDate: z.string().datetime().or(z.date()).optional().nullable(),
        description: z.string().optional().nullable(),
        isImportedFromLinkedIn: z.boolean().optional()
    }).superRefine(dateRefinement),
    params: z.object({
        id: z.string().uuid('ID de experiencia no válido')
    })
});

export const getExperienceByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de experiencia no válido')
    })
});

export const deleteExperienceSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de experiencia no válido')
    })
});
