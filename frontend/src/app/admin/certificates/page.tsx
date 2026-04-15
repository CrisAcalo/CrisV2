'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { Plus, Edit2, Trash2, Award, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CertificateFormModal } from '../../../presentation/components/admin/CertificateFormModal';
import { Certificate } from '../../../domain/entities';
import { useCertificates, useSoftDeleteCertificate } from '../../../presentation/hooks/useCertificates';
import { formatFriendlyDate } from '../../../presentation/utils/dateUtils';

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useCertificates(false);
  const softDeleteMutation = useSoftDeleteCertificate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Certificate | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Certificate) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete) {
      try {
        await softDeleteMutation.mutateAsync(itemToDelete);
        toast.success("Certificado enviado a la papelera");
        setIsConfirmOpen(false);
        setItemToDelete(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "No se pudo eliminar");
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando certificados...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error al cargar certificados.</div>;

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Certificados</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {items.length} certificado{items.length !== 1 ? 's' : ''} registrado{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="danger-light" onClick={() => router.push('/admin/certificates/trash')}>
            <Trash2 size={14} className="mr-1" /> Papelera
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={14} className="mr-1" /> Nuevo Certificado
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-16">
          <Award className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--surface-border)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No hay certificados</h3>
          <p style={{ color: 'var(--text-muted)' }} className="mb-6 max-w-md mx-auto">
            Agrega tus certificaciones, diplomas y logros académicos para mostrarlos en el portfolio.
          </p>
          <Button variant="primary" onClick={handleCreate} className="mx-auto">
            <Plus size={14} className="mr-1" /> Crear el primero
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                <tr>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Certificado</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Expedición</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>Organización</th>
                  <th className="px-6 py-4 font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>LinkedIn</th>
                  <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                      {item.credentialUrl && (
                        <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline mt-1 inline-block" style={{ color: 'var(--accent)' }}>
                          Ver credencial
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {formatFriendlyDate(item.issueDate?.toString())}
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                      {item.issuingOrganization}
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
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary-light" onClick={() => handleEdit(item)} title="Editar">
                          <Edit2 size={13} />
                        </Button>
                        <Button variant="danger-light" onClick={() => confirmDelete(item.id)} title="Mover a papelera">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CertificateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        certificateToEdit={editingItem}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a papelera"
        message="¿Estás seguro de que deseas enviar este certificado a la papelera? Podrás restaurarlo después."
        confirmText="Mover a papelera"
        isDestructive={false}
        isLoading={softDeleteMutation.isPending}
      />
    </div>
  );
}
