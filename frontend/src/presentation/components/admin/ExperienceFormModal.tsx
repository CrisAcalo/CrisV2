'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { SkillSelector } from '../common/SkillSelector';
import { useSkills } from '../../hooks/useSkills';
import { useCreateExperience, useUpdateExperience } from '../../hooks/useHistory';
import type { Experience } from '../../../domain/entities';
import { AdminFormActions, AdminInput, AdminTextarea } from './AdminFormFields';
import { dateField, dateInputValue, optionalDateField, showFormError, utcDate } from './adminFormValidation';
import styles from './AdminDialog.module.css';

const schema = z.object({
  role: z.string().trim().min(1, 'Escribe el cargo'),
  company: z.string().trim().min(1, 'Escribe la empresa'),
  startDate: dateField,
  endDate: optionalDateField,
  description: z.string().trim(),
  skillIds: z.array(z.string()),
}).refine(({ startDate, endDate }) => !endDate || endDate >= startDate, {
  message: 'La fecha de fin debe ser igual o posterior a la de inicio.',
  path: ['endDate'],
});

type Values = z.infer<typeof schema>;
const defaults: Values = {
  role: '', company: '', startDate: '', endDate: '', description: '', skillIds: [],
};

export function ExperienceFormModal({ isOpen, onClose, experienceToEdit }: {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: Experience | null;
}) {
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const skills = useSkills();
  const [creatingSkill, setCreatingSkill] = useState(false);
  const { register, handleSubmit, control, reset, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const busy = isSubmitting || creatingSkill;

  useEffect(() => {
    if (!isOpen) return;
    reset(experienceToEdit ? {
      role: experienceToEdit.role,
      company: experienceToEdit.company,
      startDate: dateInputValue(experienceToEdit.startDate),
      endDate: dateInputValue(experienceToEdit.endDate),
      description: experienceToEdit.description ?? '',
      skillIds: experienceToEdit.skills?.map((skill) => skill.id) ?? [],
    } : defaults);
  }, [isOpen, experienceToEdit, reset]);

  async function submit(data: Values) {
    const payload = {
      ...data,
      startDate: utcDate(data.startDate),
      endDate: data.endDate ? utcDate(data.endDate) : null,
      description: data.description || null,
      isImportedFromLinkedIn: experienceToEdit?.isImportedFromLinkedIn ?? false,
    };
    try {
      if (experienceToEdit) {
        await update.mutateAsync({ id: experienceToEdit.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(experienceToEdit ? 'Experiencia actualizada' : 'Experiencia creada');
      onClose();
    } catch (error) {
      showFormError(error, schema.shape, setError, 'No se pudo guardar la experiencia.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} busy={busy} title={experienceToEdit ? 'Editar experiencia' : 'Nueva experiencia'} size="lg">
      <form noValidate className={styles.form} onSubmit={handleSubmit(submit)}>
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <AdminInput label="Cargo" required autofocus {...register('role')} error={errors.role?.message} />
          <AdminInput label="Empresa" required {...register('company')} error={errors.company?.message} />
          <div className={styles.fields}>
            <AdminInput label="Fecha de inicio" type="date" required {...register('startDate')} error={errors.startDate?.message} />
            <AdminInput label="Fecha de fin" type="date" hint="Deja en blanco si sigue en curso." {...register('endDate')} error={errors.endDate?.message} />
          </div>
          <AdminTextarea label="Descripción" rows={4} {...register('description')} error={errors.description?.message} />
        </fieldset>
        <Controller
          name="skillIds"
          control={control}
          render={({ field, fieldState }) => (
            <SkillSelector skills={skills.data?.data ?? []} selectedIds={field.value} onChange={field.onChange}
              disabled={isSubmitting} error={fieldState.error?.message} loading={skills.isLoading} loadError={skills.isError}
              onRetry={() => void skills.refetch()} onCreatingChange={setCreatingSkill} />
          )}
        />
        {errors.root?.server?.message && <p role="alert" className={styles.notice}>{errors.root.server.message}</p>}
        <AdminFormActions busy={busy} onClose={onClose} submitLabel={experienceToEdit ? 'Guardar cambios' : 'Crear experiencia'} />
      </form>
    </Modal>
  );
}
