'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, Input, Button, SkillSelector } from '../common';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { useSkills } from '../../hooks/useSkills';
import { Project } from '../../../domain/entities';

const projectSchema = z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    imageUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
    liveUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
    repoUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
    skillIds: z.array(z.string()),
    isPublished: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectToEdit?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, projectToEdit }) => {
    const createMutation = useCreateProject();
    const updateMutation = useUpdateProject();
    const { data: skillsData } = useSkills(false);
    const allSkills = skillsData?.data || [];

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '',
            skillIds: [], isPublished: false,
        },
    });

    useEffect(() => {
        if (projectToEdit) {
            reset({
                title: projectToEdit.title,
                description: projectToEdit.description || '',
                imageUrl: projectToEdit.imageUrl || '',
                liveUrl: projectToEdit.liveUrl || '',
                repoUrl: projectToEdit.repoUrl || '',
                skillIds: projectToEdit.skills?.map(s => s.id) ?? [],
                isPublished: projectToEdit.isPublished,
            });
        } else {
            reset({ title: '', description: '', imageUrl: '', liveUrl: '', repoUrl: '', skillIds: [], isPublished: false });
        }
    }, [projectToEdit, reset, isOpen]);

    const onSubmit = async (data: ProjectFormValues) => {
        // Convert empty URL strings to undefined so backend skips validation on them
        const nullify = (v?: string | null) => (v?.trim() === '' ? undefined : v || undefined);
        const payload = {
            ...data,
            liveUrl: nullify(data.liveUrl),
            repoUrl: nullify(data.repoUrl),
            imageUrl: nullify(data.imageUrl),
        };

        try {
            if (projectToEdit) {
                await updateMutation.mutateAsync({ id: projectToEdit.id, data: payload });
                toast.success('Proyecto actualizado correctamente');
            } else {
                await createMutation.mutateAsync(payload as any);
                toast.success('Proyecto creado exitosamente');
            }
            onClose();
        } catch (error: any) {
            if (error.response?.status === 400 && error.response.data?.errors) {
                error.response.data.errors.forEach((err: any) => {
                    if (err.path) {
                        const fieldName = err.path.replace('body.', '') as keyof ProjectFormValues;
                        setError(fieldName, { type: 'server', message: err.message });
                    } else {
                        toast.error(err.message || 'Error de validación del servidor');
                    }
                });
            } else {
                toast.error(error.response?.data?.message || 'Ocurrió un error inesperado');
            }
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'} size="xl">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ── Left Column ── */}
                    <div className="flex flex-col gap-4">

                        <Input label="Título *" placeholder="Mi Proyecto..." {...register('title')} error={errors.title?.message} />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Descripción</label>
                            <textarea
                                rows={5}
                                className="w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                                style={{ background: 'var(--surface-raised)', borderColor: errors.description ? '#f87171' : 'var(--surface-border)', color: 'var(--text-primary)' }}
                                placeholder="Describe los objetivos y logros..."
                                {...register('description')}
                            />
                            {errors.description && <span className="text-xs text-red-400">{errors.description.message}</span>}
                        </div>

                        <Input label="URL del Proyecto (Live)" placeholder="https://..." {...register('liveUrl')} error={errors.liveUrl?.message} />
                        <Input label="URL del Repositorio (GitHub)" placeholder="https://github.com/..." {...register('repoUrl')} error={errors.repoUrl?.message} />

                    </div>

                    {/* ── Right Column ── */}
                    <div className="flex flex-col gap-4">
                        <Input label="URL de Imagen (Thumbnail)" placeholder="https://ejemplo.com/imagen.jpg" {...register('imageUrl')} error={errors.imageUrl?.message} />

                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Skills del Proyecto
                            </label>
                            <Controller
                                name="skillIds"
                                control={control}
                                render={({ field }) => (
                                    <SkillSelector
                                        skills={allSkills}
                                        selectedIds={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.skillIds && <span className="text-xs text-red-400">{errors.skillIds.message}</span>}
                        </div>

                        <div
                            className="flex items-center gap-3 p-4 rounded-xl border mt-auto"
                            style={{ background: 'var(--surface-raised)', borderColor: 'var(--surface-border)' }}
                        >
                            <Controller
                                name="isPublished"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="checkbox" id="isPublished"
                                        checked={field.value}
                                        onChange={e => field.onChange(e.target.checked)}
                                        className="w-4 h-4 rounded accent-[var(--accent)]"
                                    />
                                )}
                            />
                            <div>
                                <label htmlFor="isPublished" className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                    Publicar proyecto
                                </label>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    Visible en el portafolio público
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-5 mt-5 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    <Button variant="secondary-light" type="button" onClick={onClose} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : projectToEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
