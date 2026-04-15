'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Modal, Input, Button } from '../common';
import { useCreateCertificate, useUpdateCertificate } from '../../hooks/useCertificates';
import { Certificate } from '../../../domain/entities';

const schema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    issuingOrganization: z.string().min(2, 'La organización debe tener al menos 2 caracteres'),
    issueDate: z.string().min(1, 'La fecha de expedición es requerida'),
    credentialUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    certificateToEdit?: Certificate | null;
}

export const CertificateFormModal: React.FC<Props> = ({ isOpen, onClose, certificateToEdit }) => {
    const createMutation = useCreateCertificate();
    const updateMutation = useUpdateCertificate();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: '', issuingOrganization: '', issueDate: '', credentialUrl: '',
        },
    });

    useEffect(() => {
        if (certificateToEdit) {
            reset({
                name: certificateToEdit.name,
                issuingOrganization: certificateToEdit.issuingOrganization,
                issueDate: certificateToEdit.issueDate ? certificateToEdit.issueDate.toString().slice(0, 10) : '',
                credentialUrl: certificateToEdit.credentialUrl || '',
            });
        } else {
            reset({ name: '', issuingOrganization: '', issueDate: '', credentialUrl: '' });
        }
    }, [certificateToEdit, isOpen, reset]);

    const onSubmit = async (values: FormValues) => {
        const toISO = (d?: string) => d ? new Date(d + 'T00:00:00').toISOString() : null;
        const payload = { ...values, issueDate: toISO(values.issueDate)!, credentialUrl: values.credentialUrl || null };

        try {
            if (certificateToEdit) {
                await updateMutation.mutateAsync({ id: certificateToEdit.id, data: payload });
                toast.success('¡Certificado actualizado correctamente!');
            } else {
                await createMutation.mutateAsync(payload as any);
                toast.success('¡Certificado creado correctamente!');
            }
            onClose();
        } catch (err: any) {
            if (isAxiosError(err) && err.response?.status === 400) {
                const serverErrors = err.response.data?.errors;
                if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                    let hasFieldError = false;
                    serverErrors.forEach((e: { path: string; message: string }) => {
                        const fieldName = e.path.replace(/^body\./, '') as keyof FormValues;
                        if (fieldName in schema.shape) {
                            setError(fieldName, { type: 'server', message: e.message });
                            hasFieldError = true;
                        }
                    });
                    if (!hasFieldError) toast.error(err.response.data?.message || 'Datos inválidos');
                } else {
                    toast.error(err.response?.data?.message || 'Datos inválidos');
                }
            } else {
                toast.error('Error al guardar el certificado');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={certificateToEdit ? 'Editar Certificado' : 'Nuevo Certificado'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Nombre del Certificado *" placeholder="Ej: AWS Certified Solutions Architect" error={errors.name?.message} {...register('name')} />
                <Input label="Organización Emisora *" placeholder="Ej: Amazon Web Services" error={errors.issuingOrganization?.message} {...register('issuingOrganization')} />

                <div className="grid grid-cols-1 gap-4">
                    <Input label="Fecha de Expedición *" type="date" error={errors.issueDate?.message} {...register('issueDate')} />
                </div>

                <Input label="URL de Credencial" placeholder="Ej: https://www.credly.com/badges/..." error={errors.credentialUrl?.message} {...register('credentialUrl')} />

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary-light" type="button" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : certificateToEdit ? 'Guardar Cambios' : 'Crear Certificado'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
