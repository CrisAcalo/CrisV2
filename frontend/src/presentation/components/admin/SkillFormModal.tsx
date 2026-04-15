'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { Modal, Input, Button } from '../common';
import { useCreateSkill, useUpdateSkill, useUpdateSkillRelations } from '../../hooks/useSkills';
import { useProjects } from '../../hooks/useProjects';
import { useExperiences, useEducations } from '../../hooks/useHistory';
import { Skill } from '../../../domain/entities';

const skillSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Demasiado largo'),
    isPublic: z.boolean(),
});
type SkillFormValues = z.infer<typeof skillSchema>;

// Small reusable searchable multi-select for entities
function EntitySelector({
    label,
    items,
    selectedIds,
    onToggle,
}: {
    label: string;
    items: Array<{ id: string; label: string }>;
    selectedIds: string[];
    onToggle: (id: string) => void;
}) {
    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
        const lq = q.toLowerCase();
        return lq ? items.filter(i => i.label.toLowerCase().includes(lq)) : items;
    }, [items, q]);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {label}
            </label>
            <div className="relative mb-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }} />
                <input
                    type="text"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border focus:outline-none"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {filtered.length === 0 && (
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Sin resultados</p>
                )}
                {filtered.map(item => {
                    const sel = selectedIds.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggle(item.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${sel ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'hover:border-[var(--primary)]'}`}
                            style={sel ? {} : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface-raised)' }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface SkillFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    skillToEdit?: Skill | null;
}

export const SkillFormModal: React.FC<SkillFormModalProps> = ({ isOpen, onClose, skillToEdit }) => {
    const createMutation = useCreateSkill();
    const updateMutation = useUpdateSkill();
    const updateRelationsMutation = useUpdateSkillRelations();

    // Entity data for linking
    const { data: projectsData } = useProjects(false);
    const { data: experiencesData } = useExperiences(false);
    const { data: educationsData } = useEducations(false);

    const projects = projectsData?.data ?? [];
    const experiences = experiencesData?.data ?? [];
    const educations = educationsData?.data ?? [];

    // Selected entity IDs for relation linking
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedExperienceIds, setSelectedExperienceIds] = useState<string[]>([]);
    const [selectedEducationIds, setSelectedEducationIds] = useState<string[]>([]);

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<SkillFormValues>({
        resolver: zodResolver(skillSchema) as any,
        defaultValues: { name: '', isPublic: true },
    });

    useEffect(() => {
        if (skillToEdit) {
            reset({ name: skillToEdit.name, isPublic: skillToEdit.isPublic });
            setSelectedProjectIds(skillToEdit.projects?.map(p => p.id) ?? []);
            setSelectedExperienceIds(skillToEdit.experiences?.map(e => e.id) ?? []);
            setSelectedEducationIds(skillToEdit.educations?.map(e => e.id) ?? []);
        } else {
            reset({ name: '', isPublic: true });
            setSelectedProjectIds([]);
            setSelectedExperienceIds([]);
            setSelectedEducationIds([]);
        }
    }, [skillToEdit, reset, isOpen]);

    const toggleProject = (id: string) =>
        setSelectedProjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleExperience = (id: string) =>
        setSelectedExperienceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleEducation = (id: string) =>
        setSelectedEducationIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const onSubmit = async (values: SkillFormValues) => {
        try {
            let skillId: string;
            if (skillToEdit) {
                const res = await updateMutation.mutateAsync({ id: skillToEdit.id, data: values });
                skillId = res.data.id;
                toast.success('Skill actualizada');
            } else {
                const res = await createMutation.mutateAsync(values);
                skillId = res.data.id;
                toast.success('Skill creada');
            }

            // Always save relations (for both create and update)
            await updateRelationsMutation.mutateAsync({
                id: skillId,
                data: {
                    projectIds: selectedProjectIds,
                    experienceIds: selectedExperienceIds,
                    educationIds: selectedEducationIds,
                },
            });

            onClose();
        } catch (err: any) {
            const apiErrors = err?.response?.data?.errors;
            const message = err?.response?.data?.message;
            const status = err?.response?.status;
            if (apiErrors && Array.isArray(apiErrors)) {
                apiErrors.forEach((e: { field: string; message: string }) =>
                    setError(e.field as keyof SkillFormValues, { message: e.message })
                );
            } else if (status === 409) {
                setError('name', { message: message || 'Ya existe una skill con ese nombre' });
            } else {
                toast.error(message || 'Error al guardar la skill');
            }
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || updateRelationsMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={skillToEdit ? 'Editar Skill' : 'Nueva Skill'}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Basic info */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Nombre <span className="text-red-400">*</span>
                    </label>
                    <Input {...register('name')} placeholder="Ej: Next.js, React Native..." />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" {...register('isPublic')} className="w-4 h-4 accent-[var(--primary)]" />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Visible en el portafolio público
                    </span>
                </label>

                {/* Entity linking */}
                <div className="border rounded-xl p-4 flex flex-col gap-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Vincular con entidades</p>

                    <EntitySelector
                        label="Proyectos"
                        items={projects.map(p => ({ id: p.id, label: p.title }))}
                        selectedIds={selectedProjectIds}
                        onToggle={toggleProject}
                    />

                    <EntitySelector
                        label="Experiencias"
                        items={experiences.map(e => ({ id: e.id, label: `${e.role} — ${e.company}` }))}
                        selectedIds={selectedExperienceIds}
                        onToggle={toggleExperience}
                    />

                    <EntitySelector
                        label="Educación"
                        items={educations.map(e => ({ id: e.id, label: `${e.degree} — ${e.institution}` }))}
                        selectedIds={selectedEducationIds}
                        onToggle={toggleEducation}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary-light" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isPending}>
                        {isPending ? 'Guardando...' : skillToEdit ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
