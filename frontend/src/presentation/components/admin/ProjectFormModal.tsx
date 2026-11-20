'use client';

import { useEffect, useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { SkillSelector } from '../common/SkillSelector';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { useSkills } from '../../hooks/useSkills';
import type { Project, ProjectCaseStudy } from '../../../domain/entities';
import { AdminFormActions, AdminInput, AdminTextarea } from './AdminFormFields';
import { httpUrlField, showFormError } from './adminFormValidation';
import styles from './AdminDialog.module.css';

const caseStudyFields = [
  { key: 'problem', label: 'Problema' },
  { key: 'contribution', label: 'Mi aporte' },
  { key: 'decision', label: 'Decisión técnica' },
  { key: 'outcome', label: 'Resultado' },
] as const;
const caseStudyText = z.string().trim().max(900, 'Usa un máximo de 900 caracteres');

const schema = z.object({
  title: z.string().trim().min(1, 'Escribe el título del proyecto'),
  description: z.string().trim(),
  imageUrl: httpUrlField,
  liveUrl: httpUrlField,
  repoUrl: httpUrlField,
  skillIds: z.array(z.string()),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  caseStudy: z.object({ problem: caseStudyText, contribution: caseStudyText, decision: caseStudyText, outcome: caseStudyText }),
});

type Values = z.infer<typeof schema>;
const defaults: Values = {
  title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '', skillIds: [], isPublished: false, isFeatured: false,
  caseStudy: { problem: '', contribution: '', decision: '', outcome: '' },
};

export function ProjectFormModal({ isOpen, onClose, projectToEdit }: {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}) {
  const create = useCreateProject();
  const update = useUpdateProject();
  const skills = useSkills();
  const [creatingSkill, setCreatingSkill] = useState(false);
  const featureHint = useId();
  const { register, handleSubmit, control, reset, setError, formState: { dirtyFields, errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const isPublished = useWatch({ control, name: 'isPublished' });
  const busy = isSubmitting || creatingSkill;

  useEffect(() => {
    if (!isOpen) return;
    reset(projectToEdit ? {
      title: projectToEdit.title,
      description: projectToEdit.description ?? '',
      imageUrl: projectToEdit.imageUrl ?? '',
      liveUrl: projectToEdit.liveUrl ?? '',
      repoUrl: projectToEdit.repoUrl ?? '',
      skillIds: projectToEdit.skills?.map((skill) => skill.id) ?? [],
      isPublished: projectToEdit.isPublished,
      isFeatured: projectToEdit.isFeatured ?? false,
      caseStudy: { ...defaults.caseStudy, ...projectToEdit.caseStudy },
    } : defaults);
  }, [isOpen, projectToEdit, reset]);

  async function submit(data: Values) {
    const caseStudy: ProjectCaseStudy = {};
    for (const { key } of caseStudyFields) {
      if (data.caseStudy[key]) caseStudy[key] = data.caseStudy[key];
    }
    const payload = {
      ...data,
      imageUrl: data.imageUrl || null,
      repoUrl: data.repoUrl || null,
      liveUrl: data.liveUrl || null,
      // Saving an unrelated edit must not reclaim the spotlight from another project.
      isFeatured: !projectToEdit || dirtyFields.isFeatured ? data.isPublished && data.isFeatured : undefined,
      caseStudy: Object.keys(caseStudy).length ? caseStudy : null,
    };
    try {
      if (projectToEdit) {
        await update.mutateAsync({ id: projectToEdit.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success(projectToEdit ? 'Proyecto actualizado' : 'Proyecto creado');
      onClose();
    } catch (error) {
      showFormError(error, schema.shape, setError, 'No se pudo guardar el proyecto.');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} busy={busy} title={projectToEdit ? 'Editar proyecto' : 'Nuevo proyecto'} size="xl">
      <form noValidate className={styles.form} onSubmit={handleSubmit(submit)}>
        <fieldset className={`${styles.fieldset} ${styles.fields}`} disabled={isSubmitting}>
          <div className={styles.fieldset}>
            <AdminInput label="Título" required autofocus {...register('title')} error={errors.title?.message} />
            <AdminTextarea label="Descripción" rows={4} {...register('description')} error={errors.description?.message} />
            <label className={styles.check}><input type="checkbox" {...register('isPublished')} /> Publicar proyecto</label>
            <div className={styles.field}>
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      checked={isPublished && field.value}
                      onChange={field.onChange}
                      disabled={!isPublished}
                      aria-describedby={featureHint}
                    />
                    Destacar en el portafolio
                  </label>
                )}
              />
              <p id={featureHint} className={styles.hint}>
                {isPublished ? 'Aparecerá primero y reemplazará al destacado anterior.' : 'Publica el proyecto para poder destacarlo.'}
              </p>
            </div>
          </div>
          <div className={styles.fieldset}>
            <AdminInput label="URL de la imagen" type="url" {...register('imageUrl')} error={errors.imageUrl?.message} />
            <AdminInput label="URL de la demo" type="url" {...register('liveUrl')} error={errors.liveUrl?.message} />
            <AdminInput label="URL del repositorio" type="url" {...register('repoUrl')} error={errors.repoUrl?.message} />
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
        <details className={styles.disclosure} open={errors.caseStudy ? true : undefined}>
          <summary>Caso de estudio <span className={styles.hint}>(opcional)</span></summary>
          <fieldset className={`${styles.fieldset} ${styles.fields}`} disabled={isSubmitting}>
            {caseStudyFields.map(({ key, label }) => (
              <AdminTextarea
                key={key}
                label={label}
                rows={3}
                maxLength={900}
                {...register(`caseStudy.${key}`)}
                error={errors.caseStudy?.[key]?.message}
              />
            ))}
          </fieldset>
        </details>
        {errors.root?.server?.message && <p role="alert" className={styles.notice}>{errors.root.server.message}</p>}
        <AdminFormActions busy={busy} onClose={onClose} submitLabel={projectToEdit ? 'Guardar cambios' : 'Crear proyecto'} />
      </form>
    </Modal>
  );
}
