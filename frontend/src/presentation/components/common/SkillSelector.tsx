'use client';

import React, { useState, useMemo } from 'react';
import { SkillRef } from '../../../domain/entities';
import { useCreateSkill } from '../../hooks/useSkills';
import { toast } from 'sonner';
import { Plus, Search, X } from 'lucide-react';

interface SkillSelectorProps {
    skills: SkillRef[];          // All available skills
    selectedIds: string[];       // Currently selected skill IDs
    onChange: (ids: string[]) => void;
    disabled?: boolean;
    onSkillCreated?: (skill: SkillRef) => void; // Callback when a new skill is created inline
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({
    skills,
    selectedIds,
    onChange,
    disabled = false,
    onSkillCreated,
}) => {
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const createSkillMutation = useCreateSkill();

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? skills.filter(s => s.name.toLowerCase().includes(q)) : skills;
    }, [skills, search]);

    const exactMatch = skills.some(
        s => s.name.toLowerCase() === search.trim().toLowerCase()
    );

    const toggle = (id: string) => {
        if (disabled) return;
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(s => s !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const handleCreateInline = async () => {
        const name = search.trim();
        if (!name) return;
        setIsCreating(true);
        try {
            const res = await createSkillMutation.mutateAsync({ name, isPublic: true });
            const newSkill: SkillRef = { id: res.data.id, name: res.data.name };
            onChange([...selectedIds, newSkill.id]);
            onSkillCreated?.(newSkill);
            setSearch('');
            toast.success(`Skill "${name}" creada y añadida`);
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
                toast.error('Ya existe una skill con ese nombre');
            } else {
                toast.error('Error al crear la skill');
            }
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Search input */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--text-primary)' }} />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar skill..."
                    disabled={disabled}
                    className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-1"
                    style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                    }}
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {filtered.length === 0 && !search && (
                    <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                        No hay skills. Crea una usando el buscador.
                    </p>
                )}
                {filtered.map(skill => {
                    const selected = selectedIds.includes(skill.id);
                    return (
                        <button
                            key={skill.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggle(skill.id)}
                            className={`
                                px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 border
                                ${selected
                                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm'
                                    : 'hover:border-[var(--primary)] hover:text-[var(--primary)]'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            style={selected ? {} : { borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface-raised)' }}
                        >
                            {skill.name}
                        </button>
                    );
                })}
            </div>

            {/* Create inline — shown only when there's a search with no exact match */}
            {search.trim() && !exactMatch && (
                <button
                    type="button"
                    disabled={disabled || isCreating}
                    onClick={handleCreateInline}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                    <Plus size={12} />
                    {isCreating ? 'Creando...' : `Crear "${search.trim()}"`}
                </button>
            )}
        </div>
    );
};
