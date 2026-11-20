'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useCreateSkill, useUpdateSkill, useUpdateSkillRelations } from '../../hooks/useSkills';
import { useProjects } from '../../hooks/useProjects';
import { useExperiences, useEducations } from '../../hooks/useHistory';
import type { Skill } from '../../../domain/entities';
import { getApiErrorMessage, getApiStatus } from '../../utils/apiErrors';
import { AdminFormActions, AdminInput } from './AdminFormFields';
import { showFormError } from './adminFormValidation';
import styles from './AdminDialog.module.css';

const schema = z.object({
  name: z.string().trim().min(1, 'Escribe el nombre de la tecnología').max(100, 'Usa un máximo de 100 caracteres'),
  isPublic: z.boolean(),
});
type Values = z.infer<typeof schema>;

function EntitySelector({ label, items, selection, onChange, loading, failed, onRetry }: {
  label: string;
  items: { id: string; label: string }[];
  selection: string[];
  onChange: (selection: string[]) => void;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const [search, setSearch] = useState('');
  const titleId = useId();
  const filtered = items.filter((item) => item.label.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));

  return (
    <div role="group" aria-labelledby={titleId} className={styles.selector}>
      <p id={titleId} className={styles.selectorLabel}>{label}</p>
      {loading ? (
        <p className={styles.hint} role="status">Cargando opciones…</p>
      ) : failed ? (
        <div className={styles.selector}>
          <p className={styles.error} role="alert">No se pudieron cargar las opciones.</p>
          <button className={`${styles.action} ${styles.secondary} justify-self-start`} type="button" onClick={onRetry}>Reintentar</button>
        </div>
      ) : items.length === 0 ? (
        <p className={styles.hint}>No hay registros disponibles.</p>
      ) : (
        <>
          <AdminInput
            label={`Buscar en ${label.toLocaleLowerCase('es')}`}
            type="search"
            value={search}
            hint={selection.length ? `${selection.length} vinculados` : undefined}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault();
            }}
          />
          <div className={styles.selectorOptions}>
            {!filtered.length && <p className={styles.hint}>No hay coincidencias.</p>}
            {filtered.map((item) => {
              const selected = selection.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  className={styles.choice}
                  onClick={() => onChange(selected ? selection.filter((id) => id !== item.id) : [...selection, item.id])}
                >
                  {selected && <Check size={14} aria-hidden="true" />} {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

type Props = { isOpen: boolean; onClose: () => void; skillToEdit?: Skill | null };

export function SkillFormModal({ isOpen, onClose, skillToEdit }: Props) {
  if (!isOpen) return null;
  return <SkillForm key={skillToEdit?.id ?? 'new'} isOpen={isOpen} onClose={onClose} skillToEdit={skillToEdit} />;
}

function SkillForm({ isOpen, onClose, skillToEdit }: Props) {
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const updateRelations = useUpdateSkillRelations();
  const projects = useProjects();
  const experiences = useExperiences();
  const educations = useEducations();
  const [projectIds, setProjectIds] = useState(() => skillToEdit?.projects?.map((item) => item.id) ?? []);
  const [experienceIds, setExperienceIds] = useState(() => skillToEdit?.experiences?.map((item) => item.id) ?? []);
  const [educationIds, setEducationIds] = useState(() => skillToEdit?.educations?.map((item) => item.id) ?? []);
  const [savedId, setSavedId] = useState(skillToEdit?.id);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: skillToEdit?.name ?? '', isPublic: skillToEdit?.isPublic ?? true },
  });

  async function submit(values: Values) {
    let id = savedId;
    try {
      if (id) {
        await update.mutateAsync({ id, data: values });
      } else {
        const { data } = await create.mutateAsync(values);
        id = data.id;
        setSavedId(id);
      }
    } catch (error) {
      if (getApiStatus(error) === 409) {
        setError('name', { message: getApiErrorMessage(error, 'Ya existe una tecnología con ese nombre.') });
      } else {
        showFormError(error, schema.shape, setError, 'No se pudo guardar la tecnología.');
      }
      return;
    }

    const relations = { projectIds, experienceIds, educationIds };
    if (id && (skillToEdit || Object.values(relations).some((list) => list.length))) {
      try {
        await updateRelations.mutateAsync({ id, data: relations });
      } catch {
        setError('root.server', { message: 'La tecnología se guardó, pero sus vínculos siguen pendientes. Guarda los cambios para reintentar.' });
        return;
      }
    }

    toast.success(skillToEdit ? 'Tecnología actualizada' : 'Tecnología creada');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} busy={isSubmitting} title={savedId ? 'Editar tecnología' : 'Nueva tecnología'} size="lg">
      <form noValidate className={styles.form} onSubmit={handleSubmit(submit)}>
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <AdminInput label="Nombre" required autofocus maxLength={100} {...register('name')} error={errors.name?.message} />
          <label className={styles.check}><input type="checkbox" {...register('isPublic')} /> Mostrar en el portafolio</label>
        </fieldset>
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <legend className={styles.selectorLabel}>Vínculos en el portafolio</legend>
          <EntitySelector label="Proyectos"
            items={(projects.data?.data ?? []).map((item) => ({ id: item.id, label: item.title }))}
            selection={projectIds} onChange={setProjectIds} loading={projects.isLoading} failed={projects.isError}
            onRetry={() => void projects.refetch()} />
          <EntitySelector label="Experiencia"
            items={(experiences.data?.data ?? []).map((item) => ({ id: item.id, label: `${item.role} · ${item.company}` }))}
            selection={experienceIds} onChange={setExperienceIds} loading={experiences.isLoading} failed={experiences.isError}
            onRetry={() => void experiences.refetch()} />
          <EntitySelector label="Formación"
            items={(educations.data?.data ?? []).map((item) => ({ id: item.id, label: `${item.degree} · ${item.institution}` }))}
            selection={educationIds} onChange={setEducationIds} loading={educations.isLoading} failed={educations.isError}
            onRetry={() => void educations.refetch()} />
        </fieldset>
        {errors.root?.server?.message && <p role="alert" className={styles.notice}>{errors.root.server.message}</p>}
        <AdminFormActions busy={isSubmitting} onClose={onClose} submitLabel={savedId ? 'Guardar cambios' : 'Crear tecnología'} />
      </form>
    </Modal>
  );
}
