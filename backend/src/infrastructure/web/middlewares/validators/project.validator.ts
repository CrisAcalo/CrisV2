import { z } from 'zod';

const caseStudyText = z.string().trim().min(1).max(900).optional();
const caseStudy = z.object({
    problem: caseStudyText,
    contribution: caseStudyText,
    decision: caseStudyText,
    outcome: caseStudyText,
}).nullable().optional();

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'El título es obligatorio'),
        description: z.string().default(''),
        imageUrl: z.string().url('URL de imagen no válida').optional().nullable(),
        skillIds: z.array(z.string().uuid()).optional().default([]),
        repoUrl: z.string().url('URL de repositorio no válida').optional().nullable(),
        liveUrl: z.string().url('URL en vivo no válida').optional().nullable(),
        isPublished: z.boolean().default(false),
        isFeatured: z.boolean().optional(),
        caseStudy,
    })
});

export const updateProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'El título es obligatorio').optional(),
        description: z.string().optional(),
        imageUrl: z.string().url('URL de imagen no válida').optional().nullable(),
        skillIds: z.array(z.string().uuid()).optional(),
        repoUrl: z.string().url('URL de repositorio no válida').optional().nullable(),
        liveUrl: z.string().url('URL en vivo no válida').optional().nullable(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        caseStudy,
    }),
    params: z.object({
        id: z.string().uuid('ID de proyecto no válido')
    })
});

export const getProjectByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de proyecto no válido')
    })
});

export const deleteProjectSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de proyecto no válido')
    })
});
