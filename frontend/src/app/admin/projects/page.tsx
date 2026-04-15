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

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando proyectos...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error cargando proyectos.</div>;

  const projects = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Proyectos</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Administra tu portafolio de proyectos públicos.</p>
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

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Proyecto</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Estado</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Skills</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                    <p>No tienes proyectos activos aún.</p>
                    <Button variant="ghost" className="mt-2" onClick={handleCreate}>Crear tu primer proyecto</Button>
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium max-w-[250px] truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</div>
                      <div className="text-sm max-w-[250px] truncate" style={{ color: 'var(--text-secondary)' }} title={project.description || ''}>
                        {project.description || <span className="italic opacity-60">Sin descripción</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium`} style={{
                        background: project.isPublished ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface-raised)',
                        color: project.isPublished ? 'rgb(34, 197, 94)' : 'var(--text-secondary)'
                      }}>
                        {project.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.skills?.slice(0, 3).map(skill => (
                          <span key={skill.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                            {skill.name}
                          </span>
                        ))}
                        {(project.skills?.length ?? 0) > 3 && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{project.skills!.length - 3}</span>
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
