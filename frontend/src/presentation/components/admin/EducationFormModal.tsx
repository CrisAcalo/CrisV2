'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Modal, Input, Button, SkillSelector } from '../common';
import { useCreateEducation, useUpdateEducation } from '../../hooks/useHistory';
import { useSkills } from '../../hooks/useSkills';
import { Education } from '../../../domain/entities';

const schema = z.object({
    institution: z.string().min(2, 'La institución debe tener al menos 2 caracteres'),
    degree:      z.string().min(2, 'El título/grado debe tener al menos 2 caracteres'),
    startDate:   z.string().min(1, 'La fecha de inicio es requerida'),
    endDate:     z.string().optional(),
    skillIds:    z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    educationToEdit?: Education | null;
}

export const EducationFormModal: React.FC<Props> = ({ isOpen, onClose, educationToEdit }) => {
    const createMutation = useCreateEducation();
    const updateMutation = useUpdateEducation();
    const { data: skillsData } = useSkills(false);
    const allSkills = skillsData?.data || [];
    const isPending = createMutation.isPending || updateMutation.isPending;

    const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: { institution: '', degree: '', startDate: '', endDate: '', skillIds: [] },
    });

    useEffect(() => {
        if (educationToEdit) {
            reset({
                institution: educationToEdit.institution,
                degree:      educationToEdit.degree,
                startDate:   educationToEdit.startDate ? educationToEdit.startDate.toString().slice(0, 10) : '',
                endDate:     educationToEdit.endDate   ? educationToEdit.endDate.toString().slice(0, 10) : '',
                skillIds:    educationToEdit.skills?.map(s => s.id) ?? [],
            });
        } else {
            reset({ institution: '', degree: '', startDate: '', endDate: '', skillIds: [] });
        }
    }, [educationToEdit, isOpen, reset]);

    const onSubmit = async (values: FormValues) => {
        const toISO = (d?: string) => d ? new Date(d + 'T00:00:00').toISOString() : null;
        const payload = { ...values, startDate: toISO(values.startDate)!, endDate: toISO(values.endDate) };

        try {
            if (educationToEdit) {
                await updateMutation.mutateAsync({ id: educationToEdit.id, data: payload });
                toast.success('¡Educación actualizada correctamente!');
            } else {
                await createMutation.mutateAsync(payload as any);
                toast.success('¡Educación creada correctamente!');
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
                toast.error('Error al guardar la educación');
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={educationToEdit ? 'Editar Educación' : 'Nueva Educación'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Institución *" placeholder="Ej: Universidad Central" error={errors.institution?.message} {...register('institution')} />
                <Input label="Título / Grado *" placeholder="Ej: Ingeniería en Sistemas" error={errors.degree?.message} {...register('degree')} />

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Fecha de inicio *" type="date" error={errors.startDate?.message} {...register('startDate')} />
                    <Input label="Fecha de fin" type="date" hint="Vacío = en curso" error={errors.endDate?.message} {...register('endDate')} />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Skills asociadas</label>
                    <Controller
                        name="skillIds"
                        control={control}
                        render={({ field }) => (
                            <SkillSelector skills={allSkills} selectedIds={field.value} onChange={field.onChange} />
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary-light" type="button" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : educationToEdit ? 'Guardar Cambios' : 'Crear Educación'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
