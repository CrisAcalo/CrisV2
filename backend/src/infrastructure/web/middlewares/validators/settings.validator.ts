import { z } from 'zod';

export const updateSettingsSchema = z.object({
    body: z.object({
        linkedInUrn: z.string().optional().nullable(),
        theme: z.string().optional()
    })
});
