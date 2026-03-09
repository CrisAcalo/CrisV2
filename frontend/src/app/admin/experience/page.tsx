'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExperiences, useSoftDeleteExperience } from '../../../presentation/hooks/useHistory';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { ExperienceFormModal } from '../../../presentation/components/admin/ExperienceFormModal';
import { Plus, Edit2, Trash2, ArchiveRestore, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Experience } from '../../../domain/entities';

function formatDate(d?: string | null) {
  if (!d) return 'Actualidad';
  return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
}

export default function AdminExperiencePage() {
  const router = useRouter();
  const { data, isLoading, isError } = useExperiences(false);
  const softDeleteMutation = useSoftDeleteExperience();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const handleEdit = (item: Experience) => { setEditingItem(item); setIsFormOpen(true); };
  const confirmDelete = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await softDeleteMutation.mutateAsync(itemToDelete);
      toast.success('Experiencia enviada a la papelera');
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar la experiencia');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando experiencias...</div>;
  if (isError)   return <div className="p-8 text-center text-red-500">Error cargando experiencias.</div>;

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Experiencia</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Administra tu historial laboral.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger-light" onClick={() => router.push('/admin/experience/trash')}>
            <ArchiveRestore className="w-4 h-4" /> Papelera
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4" /> Nueva
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Cargo / Empresa</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Período</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Descripción</th>
                <th className="px-6 py-4 font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>LinkedIn</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No hay experiencias registradas.</p>
                    <Button variant="ghost" className="mt-3" onClick={handleCreate}>Agregar primera experiencia</Button>
                  </td>
                </tr>
              ) : items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--surface-border)' }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.role}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}>
                      {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.description || <span className="italic opacity-60">Sin descripción</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.isImportedFromLinkedIn ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">Sí</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--surface-raised)', color: 'var(--text-muted)' }}>No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="primary-light" size="sm" className="h-9 w-9 p-0" title="Editar" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="danger-light" size="sm" className="h-9 w-9 p-0" title="Mover a papelera" onClick={() => confirmDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ExperienceFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} experienceToEdit={editingItem} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a la Papelera"
        message="La experiencia se ocultará del portafolio, pero podrás restaurarla desde la Papelera. ¿Estás seguro?"
        confirmText="Sí, mover"
        isDestructive
        isLoading={softDeleteMutation.isPending}
      />
    </div>
  );
}
