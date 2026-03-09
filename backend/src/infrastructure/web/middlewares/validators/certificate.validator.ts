import { z } from 'zod';

export const createCertificateSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'El nombre es obligatorio'),
        issuingOrganization: z.string().min(1, 'La organización emisora es obligatoria'),
        issueDate: z.string().datetime().or(z.date()),
        credentialUrl: z.string().url('URL no válida').optional().nullable()
    })
});

export const updateCertificateSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'El nombre es obligatorio').optional(),
        issuingOrganization: z.string().min(1, 'La organización emisora es obligatoria').optional(),
        issueDate: z.string().datetime().or(z.date()).optional(),
        credentialUrl: z.string().url('URL no válida').optional().nullable()
    }),
    params: z.object({
        id: z.string().uuid('ID de certificado no válido')
    })
});

export const getCertificateByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de certificado no válido')
    })
});

export const deleteCertificateSchema = z.object({
    params: z.object({
        id: z.string().uuid('ID de certificado no válido')
    })
});
