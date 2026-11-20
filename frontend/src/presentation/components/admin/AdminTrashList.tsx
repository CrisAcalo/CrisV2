'use client';

import { ArchiveRestore, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '../common/ConfirmModal';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { AdminAction } from './AdminAction';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminResourceTable, type AdminColumn, type AdminResourceQuery } from './AdminResourceTable';
import { formatAdminDate } from './AdminTableFields';

export function AdminTrashList<T extends { id: string; deletedAt?: string | null }>({
  name, href, query, columns, itemLabel, searchText, restore, remove,
}: {
  name: string;
  href: string;
  query: AdminResourceQuery<T>;
  columns: AdminColumn<T>[];
  itemLabel: (item: T) => string;
  searchText: (item: T) => string;
  restore: (id: string) => Promise<unknown>;
  remove: { mutateAsync: (id: string) => Promise<unknown>; isPending: boolean };
}) {
  const [deleting, setDeleting] = useState<T | null>(null);
  const [restoring, setRestoring] = useState<Set<string>>(() => new Set());
  const resourceName = name.toLocaleLowerCase('es');
  const title = `Papelera de ${resourceName}`;

  async function restoreItem(id: string) {
    if (restoring.has(id) || deleting?.id === id) return;
    setRestoring((items) => new Set(items).add(id));
    try {
      await restore(id);
      toast.success('Registro restaurado');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo restaurar el registro'));
    } finally {
      setRestoring((items) => {
        const next = new Set(items);
        next.delete(id);
        return next;
      });
    }
  }

  async function hardDelete() {
    if (!deleting || remove.isPending) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Registro eliminado definitivamente');
      setDeleting(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el registro'));
    }
  }

  return (
    <div className="admin-list-page">
      <AdminPageHeader title={title} description="Restaura registros o elimínalos definitivamente."
        back={{ href, label: `Volver a ${resourceName}` }} />
      <AdminResourceTable
        query={query}
        name={title}
        columns={[...columns, { label: 'Eliminado el', size: 'date', cell: (item) => formatAdminDate(item.deletedAt) }]}
        actionSize="labeled"
        searchText={searchText}
        emptyTitle="La papelera está vacía"
        emptyDescription="Los registros que envíes a la papelera aparecerán aquí."
        actions={(item) => (
          <>
            <AdminAction icon={<ArchiveRestore size={17} />} tone="success" aria-label={`Restaurar ${itemLabel(item)}`}
              pending={restoring.has(item.id)} disabled={deleting?.id === item.id} onClick={() => restoreItem(item.id)}>
              Restaurar
            </AdminAction>
            <AdminAction icon={<Trash2 size={17} />} tone="danger" aria-label={`Eliminar definitivamente ${itemLabel(item)}`}
              onClick={() => setDeleting(item)} disabled={restoring.has(item.id)}
              pending={remove.isPending && deleting?.id === item.id}>
              Eliminar
            </AdminAction>
          </>
        )}
      />
      <ConfirmModal
        isOpen={deleting !== null}
        title="Eliminar definitivamente"
        message={`Se eliminará «${deleting ? itemLabel(deleting) : ''}» de la base de datos. Esta acción no se puede deshacer.`}
        confirmText="Eliminar definitivamente"
        onConfirm={hardDelete}
        onClose={() => { if (!remove.isPending) setDeleting(null); }}
        isDestructive
        isLoading={remove.isPending}
      />
    </div>
  );
}
