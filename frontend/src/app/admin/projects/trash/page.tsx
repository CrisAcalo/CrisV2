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

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando la papelera...</div>;
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
            <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Papelera de Proyectos
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 pl-8">Los proyectos aquí pueden ser restaurados o eliminados permanentemente.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Proyecto</th>
                <th className="px-6 py-4 font-semibold">Eliminado (Soft)</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones (Irreversible)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                    <p>La papelera está vacía.</p>
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
                      <div className="font-medium text-slate-900 dark:text-white line-through opacity-70 max-w-[250px] truncate">{project.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 max-w-[250px] truncate" title={project.description || ''}>
                        {project.description || <span className="italic text-slate-400">Sin descripción</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : 'N/A'}
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
