'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, Input, Button } from '../common';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import { Project } from '../../../domain/entities';

const projectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  imageUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
  liveUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
  repoUrl: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
  techStack: z.string().min(1, 'Agrega al menos una tecnología'),
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
      title: '',
      description: '',
      imageUrl: '',
      liveUrl: '',
      repoUrl: '',
      techStack: '',
      isPublished: false,
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
        techStack: projectToEdit.techStack.join(', '),
        isPublished: projectToEdit.isPublished,
      });
    } else {
      reset({
        title: '',
        description: '',
        imageUrl: '',
        liveUrl: '',
        repoUrl: '',
        techStack: '',
        isPublished: false,
      });
    }
  }, [projectToEdit, reset, isOpen]);

  const onSubmit = async (data: ProjectFormValues) => {
    const formattedData = {
      ...data,
      techStack: data.techStack.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (projectToEdit) {
        // Remove undefined null overrides for partial
        const payload = Object.fromEntries(
          Object.entries(formattedData).filter(([_, v]) => v !== null)
        );
        await updateMutation.mutateAsync({ id: projectToEdit.id, data: payload });
        toast.success("Proyecto actualizado correctamente");
      } else {
        await createMutation.mutateAsync(formattedData as any);
        toast.success("Proyecto creado exitosamente");
      }
      onClose();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data?.errors) {
        // Parse backend validation array: [{ path: 'body.title', message: '...' }]
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            const fieldName = err.path.replace('body.', '') as keyof ProjectFormValues;
            setError(fieldName, { type: 'server', message: err.message });
          } else {
            toast.error(err.message || "Error de validación del servidor");
          }
        });
      } else {
        toast.error(error.response?.data?.message || "Ocurrió un error inesperado al guardar el proyecto");
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-[600px] w-full">
        <Input
          label="Título"
          placeholder="Mi Proyecto..."
          {...register('title')}
          error={errors.title?.message}
        />
        
        <div className="flex flex-col space-y-1.5 w-full">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
          <textarea 
            className={`flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="Describe los objetivos y logros..."
            {...register('description')}
          />
          {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
        </div>

        <Input
          label="URL del Proyecto (Live)"
          placeholder="https://..."
          {...register('liveUrl')}
          error={errors.liveUrl?.message}
        />

        <Input
          label="URL del Repositorio (GitHub)"
          placeholder="https://github.com/..."
          {...register('repoUrl')}
          error={errors.repoUrl?.message}
        />

        <Input
          label="URL de la Imagen (Thumbnail)"
          placeholder="https://ejemplo.com/imagen.jpg"
          {...register('imageUrl')}
          error={errors.imageUrl?.message}
        />

        <Input
          label="Tech Stack (Separado por comas)"
          placeholder="React, Node.js, TailwindCSS..."
          {...register('techStack')}
          error={errors.techStack?.message}
        />

        <div className="flex items-center gap-2 pt-2">
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <input 
                type="checkbox" 
                id="isPublished"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 dark:bg-slate-900 dark:border-slate-700"
              />
            )}
          />
          <label htmlFor="isPublished" className="text-sm text-slate-700 dark:text-slate-300">
            Publicar inmediatamente
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
          <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" isLoading={isPending}>
            {projectToEdit ? 'Guardar Cambios' : 'Crear Proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
