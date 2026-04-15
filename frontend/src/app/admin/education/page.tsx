'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEducations, useSoftDeleteEducation } from '../../../presentation/hooks/useHistory';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { EducationFormModal } from '../../../presentation/components/admin/EducationFormModal';
import { Plus, Edit2, Trash2, ArchiveRestore, GraduationCap, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Education } from '../../../domain/entities';

import { formatFriendlyDate } from '../../../presentation/utils/dateUtils';

export default function AdminEducationPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useEducations(false);
  const softDeleteMutation = useSoftDeleteEducation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Education | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const handleEdit = (item: Education) => { setEditingItem(item); setIsFormOpen(true); };
  const confirmDelete = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await softDeleteMutation.mutateAsync(itemToDelete);
      toast.success('Educación enviada a la papelera');
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo eliminar la educación');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando educación...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error cargando educación.</div>;

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Educación</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Administra tu formación académica.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger-light" onClick={() => router.push('/admin/education/trash')}>
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
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Título / Institución</th>
                <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Período</th>
                <th className="px-6 py-4 font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>LinkedIn</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No hay registros de educación.</p>
                    <Button variant="ghost" className="mt-3" onClick={handleCreate}>Agregar primera educación</Button>
                  </td>
                </tr>
              ) : items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  style={{ borderBottom: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                  className="transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.degree}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.institution}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}>
                      {formatFriendlyDate(item.startDate)} – {formatFriendlyDate(item.endDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.isImportedFromLinkedIn ? (
                      <Linkedin size={15} className="mx-auto text-[#0a66c2]" />
                    ) : (
                      <span className="relative inline-flex mx-auto">
                        <Linkedin size={15} className="text-red-500 opacity-70" />
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="block w-[140%] h-[1.5px] bg-red-500 rotate-45 rounded-full" />
                        </span>
                      </span>
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

      <EducationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} educationToEdit={editingItem} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a la Papelera"
        message="La educación se ocultará del portafolio, pero podrás restaurarla desde la Papelera. ¿Estás seguro?"
        confirmText="Sí, mover"
        isDestructive
        isLoading={softDeleteMutation.isPending}
      />
    </div>
  );
}
