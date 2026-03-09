'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Modal, Input, Button } from '../common';
import { useCreateExperience, useUpdateExperience } from '../../hooks/useHistory';
import { Experience } from '../../../domain/entities';

const schema = z.object({
  role:                   z.string().min(2, 'El cargo debe tener al menos 2 caracteres'),
  company:                z.string().min(2, 'La empresa debe tener al menos 2 caracteres'),
  startDate:              z.string().min(1, 'La fecha de inicio es requerida'),
  endDate:                z.string().optional(),
  description:            z.string().optional(),
  isImportedFromLinkedIn: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: Experience | null;
}

export const ExperienceFormModal: React.FC<Props> = ({ isOpen, onClose, experienceToEdit }) => {
  const createMutation = useCreateExperience();
  const updateMutation = useUpdateExperience();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      role: '', company: '', startDate: '', endDate: '', description: '', isImportedFromLinkedIn: false,
    },
  });

  useEffect(() => {
    if (experienceToEdit) {
      reset({
        role:                   experienceToEdit.role,
        company:                experienceToEdit.company,
        startDate:              experienceToEdit.startDate ? experienceToEdit.startDate.toString().slice(0, 10) : '',
        endDate:                experienceToEdit.endDate   ? experienceToEdit.endDate.toString().slice(0, 10)   : '',
        description:            experienceToEdit.description || '',
        isImportedFromLinkedIn: experienceToEdit.isImportedFromLinkedIn,
      });
    } else {
      reset({ role: '', company: '', startDate: '', endDate: '', description: '', isImportedFromLinkedIn: false });
    }
  }, [experienceToEdit, isOpen, reset]);

  const onSubmit = async (values: FormValues) => {
    const toISO = (d?: string) => d ? new Date(d + 'T00:00:00').toISOString() : null;
    const payload = {
      ...values,
      startDate: toISO(values.startDate)!,
      endDate:   toISO(values.endDate),
    };

    try {
      if (experienceToEdit) {
        await updateMutation.mutateAsync({ id: experienceToEdit.id, data: payload });
        toast.success('¡Experiencia actualizada correctamente!');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success('¡Experiencia creada correctamente!');
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
        toast.error('Error al guardar la experiencia');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={experienceToEdit ? 'Editar Experiencia' : 'Nueva Experiencia'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Cargo *" placeholder="Ej: Frontend Developer" error={errors.role?.message} {...register('role')} />
        <Input label="Empresa *" placeholder="Ej: Google" error={errors.company?.message} {...register('company')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha de inicio *" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="Fecha de fin" type="date" hint="Vacío = trabajo actual" error={errors.endDate?.message} {...register('endDate')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
          <textarea
            rows={3}
            placeholder="Describe tus responsabilidades..."
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none transition-all duration-150 focus:outline-none focus:ring-2"
            style={{
              background: 'var(--surface)', borderColor: 'var(--surface-border)',
              color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)',
            } as any}
            {...register('description')}
          />
          {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 accent-[var(--accent)]" {...register('isImportedFromLinkedIn')} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Importado desde LinkedIn</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button variant="primary" type="submit" isLoading={isPending}>
            {experienceToEdit ? 'Guardar Cambios' : 'Crear Experiencia'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
