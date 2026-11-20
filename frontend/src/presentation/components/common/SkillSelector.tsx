'use client';

import { useId, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import type { SkillRef } from '../../../domain/entities';
import { useCreateSkill } from '../../hooks/useSkills';
import { getApiErrorMessage, getApiStatus } from '../../utils/apiErrors';
import { AdminInput } from '../admin/AdminFormFields';
import styles from '../admin/AdminDialog.module.css';

interface SkillSelectorProps {
  skills: SkillRef[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  loadError?: boolean;
  onRetry?: () => void;
  onCreatingChange?: (creating: boolean) => void;
}

export function SkillSelector({
  skills, selectedIds, onChange, disabled = false, error, loading, loadError, onRetry, onCreatingChange,
}: SkillSelectorProps) {
  const [search, setSearch] = useState('');
  const [created, setCreated] = useState<SkillRef[]>([]);
  const [createError, setCreateError] = useState('');
  const create = useCreateSkill();
  const id = useId();
  const name = search.trim();
  const query = name.toLocaleLowerCase('es');
  const available = [...skills, ...created.filter((entry) => !skills.some((skill) => entry.id === skill.id))];
  const filtered = available.filter((skill) => skill.name.toLocaleLowerCase('es').includes(query));
  const canCreate = name && !available.some((skill) => skill.name.toLocaleLowerCase('es') === query);
  const locked = disabled || create.isPending;

  async function createInline() {
    if (locked || !canCreate) return;
    setCreateError('');
    onCreatingChange?.(true);
    try {
      const { data: skill } = await create.mutateAsync({ name, isPublic: true });
      setCreated((previous) => [...previous, skill]);
      onChange([...new Set([...selectedIds, skill.id])]);
      setSearch('');
    } catch (err) {
      setCreateError(getApiStatus(err) === 409
        ? 'Ya existe una tecnología con ese nombre.'
        : getApiErrorMessage(err, 'No se pudo crear la tecnología.'));
    } finally {
      onCreatingChange?.(false);
    }
  }

  return (
    <div className={styles.selector} role="group" aria-labelledby={id}>
      <p id={id} className={styles.selectorLabel}>Tecnologías asociadas</p>
      <AdminInput
        type="search"
        label="Buscar tecnologías"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setCreateError('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault();
        }}
        disabled={locked || loading || loadError}
        maxLength={100}
        hint={selectedIds.length ? `${selectedIds.length} seleccionadas` : undefined}
        error={createError || error}
      />
      {loading && <p className={styles.hint} role="status">Cargando tecnologías…</p>}
      {loadError && (
        <div className={styles.selector}>
          <p className={styles.error} role="alert">No se pudieron cargar las tecnologías.</p>
          <button className={`${styles.action} ${styles.secondary}`} type="button" onClick={onRetry}>Reintentar</button>
        </div>
      )}
      {!loading && !loadError && (
        <>
          <div className={styles.selectorOptions}>
            {filtered.length === 0 && <p className={styles.hint}>{name ? 'No hay coincidencias.' : 'Todavía no hay tecnologías.'}</p>}
            {filtered.map((skill) => {
              const selected = selectedIds.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  disabled={locked}
                  aria-pressed={selected}
                  className={styles.choice}
                  onClick={() => onChange(selected ? selectedIds.filter((id) => id !== skill.id) : [...selectedIds, skill.id])}
                >
                  {selected && <Check size={14} aria-hidden="true" />} {skill.name}
                </button>
              );
            })}
          </div>
          {canCreate && (
            <button type="button" disabled={locked} onClick={createInline} className={`${styles.action} ${styles.secondary} justify-self-start`}>
              <Plus size={16} aria-hidden="true" /> {create.isPending ? 'Creando…' : `Crear «${name}»`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
