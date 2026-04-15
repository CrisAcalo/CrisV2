'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiences, useRestoreExperience, useHardDeleteExperience } from '../../../../presentation/hooks/useHistory';
import { Button, Card, ConfirmModal } from '../../../../presentation/components/common';
import { ArrowLeft, RefreshCw, Trash2, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { formatFriendlyDate } from '../../../../presentation/utils/dateUtils';

export default function AdminExperienceTrashPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useExperiences(true);
  const restoreMutation = useRestoreExperience();
  const hardDeleteMutation = useHardDeleteExperience();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await hardDeleteMutation.mutateAsync(itemToDelete);
      toast.success('Experiencia eliminada definitivamente');
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id);
      toast.success('Experiencia restaurada con éxito');
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
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Papelera de Experiencias</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Puedes restaurar o eliminar definitivamente.</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Cargo / Empresa</th>
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
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium line-through opacity-60" style={{ color: 'var(--text-primary)' }}>{item.role}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.company}</div>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {formatFriendlyDate(item.startDate)} – {formatFriendlyDate(item.endDate)}
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
        message="Esta acción no se puede deshacer. La experiencia será borrada definitivamente. ¿Continuar?"
        confirmText="Eliminar Permanentemente"
        isDestructive
        isLoading={hardDeleteMutation.isPending}
      />
    </div>
  );
}
