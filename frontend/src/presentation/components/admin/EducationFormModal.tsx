'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { SkillSelector } from '../common/SkillSelector';
import { useSkills } from '../../hooks/useSkills';
import { useCreateEducation, useUpdateEducation } from '../../hooks/useHistory';
import type { Education } from '../../../domain/entities';
import { AdminFormActions, AdminInput } from './AdminFormFields';
import { dateField, dateInputValue, optionalDateField, showFormError, utcDate } from './adminFormValidation';
import styles from './AdminDialog.module.css';

const schema = z.object({
  degree: z.string().trim().min(1, 'Escribe el título o grado'),
  institution: z.string().trim().min(1, 'Escribe la institución'),
  startDate: dateField,
  endDate: optionalDateField,
  skillIds: z.array(z.string()),
}).refine(({ startDate, endDate }) => !endDate || endDate >= startDate, {
  message: 'La fecha de fin debe ser igual o posterior a la de inicio.',
  path: ['endDate'],
});

type Values = z.infer<typeof schema>;
const defaults: Values = {
  degree: '', institution: '', startDate: '', endDate: '', skillIds: [],
};

export function EducationFormModal({ isOpen, onClose, educationToEdit }: {
  isOpen: boolean;
  onClose: () => void;
  educationToEdit?: Education | null;
}) {
  const create = useCreateEducation();
  const update = useUpdateEducation();
  const skills = useSkills();
  const [creatingSkill, setCreatingSkill] = useState(false);
  const { register, handleSubmit, control, reset, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const busy = isSubmitting || creatingSkill;

  useEffect(() => {
    if (!isOpen) return;
    reset(educationToEdit ? {
      degree: educationToEdit.degree,
      institution: educationToEdit.institution,
      startDate: dateInputValue(educationToEdit.startDate),
      endDate: dateInputValue(educationToEdit.endDate),
      skillIds: educationToEdit.skills?.map((skill) => skill.id) ?? [],
    } : defaults);
  }, [isOpen, educationToEdit, reset]);

  async function submit(data: Values) {
    const payload = {
      ...data,
      startDate: utcDate(data.startDate),
      endDate: data.endDate ? utcDate(data.endDate) : null,
    };
    try {
      if (educationToEdit) {
        await update.mutateAsync({ id: educationToEdit.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(educationToEdit ? 'Formación actualizada' : 'Formación creada');
      onClose();
    } catch (error) {
      showFormError(error, schema.shape, setError, 'No se pudo guardar la formación.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} busy={busy} title={educationToEdit ? 'Editar formación' : 'Nueva formación'} size="lg">
      <form noValidate className={styles.form} onSubmit={handleSubmit(submit)}>
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <AdminInput label="Título o grado" required autofocus {...register('degree')} error={errors.degree?.message} />
          <AdminInput label="Institución" required {...register('institution')} error={errors.institution?.message} />
          <div className={styles.fields}>
            <AdminInput label="Fecha de inicio" type="date" required {...register('startDate')} error={errors.startDate?.message} />
            <AdminInput label="Fecha de fin" type="date" hint="Deja en blanco si sigue en curso." {...register('endDate')} error={errors.endDate?.message} />
          </div>
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
        <AdminFormActions busy={busy} onClose={onClose} submitLabel={educationToEdit ? 'Guardar cambios' : 'Crear formación'} />
      </form>
    </Modal>
  );
}
