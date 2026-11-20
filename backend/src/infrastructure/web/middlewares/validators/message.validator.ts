import { z } from 'zod';

export const createMessageSchema = z.object({
    body: z.object({
        senderName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
        senderEmail: z.string().trim().email('Correo electrónico no válido').max(254),
        subject: z.string().trim().min(5, 'El asunto debe tener al menos 5 caracteres').max(200),
        content: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000)
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
