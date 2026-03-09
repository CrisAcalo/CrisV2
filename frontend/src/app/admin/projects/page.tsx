'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects, useSoftDeleteProject } from '../../../presentation/hooks/useProjects';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { ProjectFormModal } from '../../../presentation/components/admin/ProjectFormModal';
import { Plus, Edit2, Trash2, ArchiveRestore } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Project } from '../../../domain/entities';

export default function AdminProjectsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useProjects(false); // Only active projects
  const softDeleteMutation = useSoftDeleteProject();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (projectToDelete) {
      try {
        await softDeleteMutation.mutateAsync(projectToDelete);
        toast.success("Proyecto enviado a la papelera");
        setIsConfirmOpen(false);
        setProjectToDelete(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "No se pudo eliminar el proyecto");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando proyectos...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error cargando proyectos.</div>;

  const projects = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Proyectos</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Administra tu portafolio de proyectos públicos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger-light" onClick={() => router.push('/admin/projects/trash')}>
            <ArchiveRestore className="w-5 h-5" /> Papelera
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-5 h-5" /> Nuevo
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Proyecto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Tech Stack</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    <p>No tienes proyectos activos aún.</p>
                    <Button variant="ghost" className="mt-2" onClick={handleCreate}>Crear tu primer proyecto</Button>
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => (
                  <motion.tr 
                    key={project.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white max-w-[250px] truncate">{project.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={project.description || ''}>
                        {project.description || <span className="italic text-slate-400">Sin descripción</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${project.isPublished ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {project.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {project.techStack?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                            {tech}
                          </span>
                        ))}
                        {project.techStack?.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="primary-light" size="sm" className="h-9 w-9 p-0" title="Editar" onClick={() => handleEdit(project)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="danger-light" size="sm" className="h-9 w-9 p-0" title="Mover a papelera" onClick={() => confirmDelete(project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <ProjectFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        projectToEdit={editingProject} 
      />

      {/* CONFIRM SOFT DELETE MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a la Papelera"
        message="El proyecto se ocultará del portafolio, pero podrás restaurarlo desde la Papelera luego. ¿Estás seguro?"
        confirmText="Sí, mover"
        isDestructive={true}
        isLoading={softDeleteMutation.isPending}
      />
    </div>
  );
}
