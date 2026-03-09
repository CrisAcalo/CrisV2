import { z } from 'zod';

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

export const createEducationSchema = z.object({
    body: z.object({
        institution: z.string().min(1, 'La institución es obligatoria'),
        degree: z.string().min(1, 'La titulación es obligatoria'),
        startDate: z.string().datetime().or(z.date()),
        endDate: z.string().datetime().or(z.date()).optional().nullable()
    }).superRefine(dateRefinement)
});

export const updateEducationSchema = z.object({
    body: z.object({
        institution: z.string().min(1, 'La institución es obligatoria').optional(),
        degree: z.string().min(1, 'La titulación es obligatoria').optional(),
        startDate: z.string().datetime().or(z.date()).optional(),
        endDate: z.string().datetime().or(z.date()).optional().nullable()
    }).superRefine(dateRefinement),
    params: z.object({
        id: z.string().uuid('ID de educación no válido')
    })
});

export const getEducationByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de educación no válido')
    })
});

export const deleteEducationSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de educación no válido')
    })
});
