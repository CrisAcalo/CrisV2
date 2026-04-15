import { z } from 'zod';

export const createMessageSchema = z.object({
    body: z.object({
        senderName: z.string().min(1, 'El nombre es obligatorio'),
        senderEmail: z.string().email('Correo electrónico no válido'),
        subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
        content: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres')
    })
});

export const updateMessageSchema = z.object({
    body: z.object({
        isRead: z.boolean().optional()
    }),
    params: z.object({
        id: z.string().uuid('ID de mensaje no válido')
    })
});

export const getMessageByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de mensaje no válido')
    })
});

export const deleteMessageSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de mensaje no válido')
    })
});
