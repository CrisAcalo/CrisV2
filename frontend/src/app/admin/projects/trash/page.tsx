'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects, useRestoreProject, useHardDeleteProject } from '../../../../presentation/hooks/useProjects';
import { Button, Card, ConfirmModal } from '../../../../presentation/components/common';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminProjectsTrashPage() {
  const router = useRouter();
  // Fetch only DELETED projects by passing true
  const { data, isLoading, isError } = useProjects(true);
  
  const restoreMutation = useRestoreProject();
  const hardDeleteMutation = useHardDeleteProject();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (projectToDelete) {
      try {
        await hardDeleteMutation.mutateAsync(projectToDelete);
        toast.success("Proyecto eliminado definitivamente");
        setIsConfirmOpen(false);
        setProjectToDelete(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Hubo un error al eliminar");
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success("Proyecto restaurado con éxito");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al restaurar el proyecto");
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando la papelera...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error cargando papelera.</div>;

  // Filter out any active projects just in case backend misbehaves (although backend handles it)
  // But wait, the backend right now returns ALL or DELETED if ?deleted=true?
  // Let's ensure we only show those with deletedAt !== null if ?deleted=true returned both
  // Actually, our prisma modification used: where: { deletedAt: includeDeleted ? { not: null } : null }
  // So includeDeleted=true returns STRICTLY the deleted ones.
  const projects = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.back()} className="p-1 rounded-full transition-colors hover:bg-[var(--surface-raised)]">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Papelera de Proyectos</h1>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Los proyectos aquí pueden ser restaurados o eliminados permanentemente.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Proyecto</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Eliminado el</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                    <p>La papelera está vacía.</p>
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
                      <div className="font-medium line-through opacity-70 max-w-[250px] truncate" style={{ color: 'var(--text-primary)' }}>{project.title}</div>
                      <div className="text-sm max-w-[250px] truncate" style={{ color: 'var(--text-secondary)' }} title={project.description || ''}>
                        {project.description || <span className="italic opacity-60">Sin descripción</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="success-light" size="sm" className="gap-1.5" onClick={() => handleRestore(project.id)}>
                          <RefreshCw className="w-4 h-4" /> Restaurar
                        </Button>
                        <Button variant="danger-light" size="sm" className="gap-1.5" onClick={() => confirmDelete(project.id)}>
                          <Trash2 className="w-4 h-4" /> Eliminar
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

      {/* CONFIRM HARD DELETE MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Eliminación Permanente"
        message="Esta acción no se puede deshacer. El proyecto será borrado de la base de datos definitivamente. ¿Continuar con la eliminación?"
        confirmText="Eliminar Permanentemente"
        isDestructive={true}
        isLoading={hardDeleteMutation.isPending}
      />
    </div>
  );
}
