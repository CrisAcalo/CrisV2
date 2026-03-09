import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'El título es obligatorio'),
        description: z.string().min(1, 'La descripción es obligatoria'),
        imageUrl: z.string().url('URL de imagen no válida').optional().nullable(),
        techStack: z.array(z.string()).min(1, 'Debe incluir al menos una tecnología'),
        repoUrl: z.string().url('URL de repositorio no válida').optional().nullable(),
        liveUrl: z.string().url('URL en vivo no válida').optional().nullable(),
        isPublished: z.boolean().default(false)
    })
});

export const updateProjectSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'El título es obligatorio').optional(),
        description: z.string().min(1, 'La descripción es obligatoria').optional(),
        imageUrl: z.string().url('URL de imagen no válida').optional().nullable(),
        techStack: z.array(z.string()).min(1, 'Debe incluir al menos una tecnología').optional(),
        repoUrl: z.string().url('URL de repositorio no válida').optional().nullable(),
        liveUrl: z.string().url('URL en vivo no válida').optional().nullable(),
        isPublished: z.boolean().optional()
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
