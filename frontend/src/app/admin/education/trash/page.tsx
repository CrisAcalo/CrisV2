'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEducations, useRestoreEducation, useHardDeleteEducation } from '../../../../presentation/hooks/useHistory';
import { Button, Card, ConfirmModal } from '../../../../presentation/components/common';
import { ArrowLeft, RefreshCw, Trash2, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function formatDate(d?: string | null) {
  if (!d) return 'En curso';
  return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
}

export default function AdminEducationTrashPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useEducations(true);
  const restoreMutation = useRestoreEducation();
  const hardDeleteMutation = useHardDeleteEducation();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await hardDeleteMutation.mutateAsync(itemToDelete);
      toast.success('Educación eliminada definitivamente');
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success('Educación restaurada con éxito');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al restaurar');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando papelera...</div>;
  if (isError)   return <div className="p-8 text-center text-red-500">Error cargando papelera.</div>;

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-raised)]">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Papelera de Educación</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Puedes restaurar o eliminar definitivamente.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Título / Institución</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Período</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Eliminado el</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>La papelera está vacía.</p>
                  </td>
                </tr>
              ) : items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--surface-border)' }}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium line-through opacity-60" style={{ color: 'var(--text-primary)' }}>{item.degree}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(item.startDate)} – {formatDate(item.endDate)}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString('es-ES') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="success-light" size="sm" className="gap-1.5" onClick={() => handleRestore(item.id)}>
                        <RefreshCw className="w-4 h-4" /> Restaurar
                      </Button>
                      <Button variant="danger-light" size="sm" className="gap-1.5" onClick={() => confirmDelete(item.id)}>
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Eliminación Permanente"
        message="Esta acción no se puede deshacer. La educación será borrada definitivamente. ¿Continuar?"
        confirmText="Eliminar Permanentemente"
        isDestructive
        isLoading={hardDeleteMutation.isPending}
      />
    </div>
  );
}
