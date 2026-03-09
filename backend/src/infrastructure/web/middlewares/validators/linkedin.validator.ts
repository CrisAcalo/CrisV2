import { z } from 'zod';

export const syncLinkedInSchema = z.object({
    body: z.object({
        urn: z.string().min(5, "El URN es requerido para sincronizar")
    })
});
