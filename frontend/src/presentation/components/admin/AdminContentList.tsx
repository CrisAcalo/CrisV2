'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '../common/ConfirmModal';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { AdminAction, AdminActionLink } from './AdminAction';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminResourceTable, type AdminColumn, type AdminResourceQuery } from './AdminResourceTable';

type ContentListProps<T> = {
  title: string;
  description: string;
  href: string;
  createLabel: string;
  emptyTitle: string;
  query: AdminResourceQuery<T>;
  columns: AdminColumn<T>[];
  itemLabel: (item: T) => string;
  searchText: (item: T) => string;
  form: (props: { isOpen: boolean; onClose: () => void; item: T | null }) => ReactNode;
  remove: { mutateAsync: (id: string) => Promise<unknown>; isPending: boolean };
};

export function AdminContentList<T extends { id: string }>({
  title, description, href, createLabel, emptyTitle, query, columns, itemLabel, searchText, form, remove,
}: ContentListProps<T>) {
  const [editing, setEditing] = useState<T | null | undefined>();
  const [deleting, setDeleting] = useState<T | null>(null);
  const create = () => setEditing(null);

  async function moveToTrash() {
    if (!deleting || remove.isPending) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Registro enviado a la papelera');
      setDeleting(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo mover a la papelera'));
    }
  }

  return (
    <div className="admin-list-page">
      <AdminPageHeader title={title} description={description} actions={
        <>
          <AdminActionLink href={`${href}/trash`} icon={<Trash2 size={17} />}>Papelera</AdminActionLink>
          <AdminAction icon={<Plus size={17} />} tone="primary" onClick={create}>{createLabel}</AdminAction>
        </>
      } />
      <AdminResourceTable
        query={query}
        name={title}
        columns={columns}
        searchText={searchText}
        emptyTitle={emptyTitle}
        actions={(item) => (
          <>
            <AdminAction icon={<Edit2 size={17} />} iconOnly title="Editar" onClick={() => setEditing(item)}>
              Editar {itemLabel(item)}
            </AdminAction>
            <AdminAction icon={<Trash2 size={17} />} iconOnly tone="danger" title="Mover a la papelera"
              pending={remove.isPending && deleting?.id === item.id} onClick={() => setDeleting(item)}>
              Mover a la papelera {itemLabel(item)}
            </AdminAction>
          </>
        )}
      />
      {form({ isOpen: editing !== undefined, item: editing ?? null, onClose: () => setEditing(undefined) })}
      <ConfirmModal
        isOpen={deleting !== null}
        title="Mover a la papelera"
        message={`¿Mover «${deleting ? itemLabel(deleting) : ''}» a la papelera? Podrás restaurar el registro después.`}
        confirmText="Mover a la papelera"
        onConfirm={moveToTrash}
        onClose={() => { if (!remove.isPending) setDeleting(null); }}
        isDestructive={false}
        isLoading={remove.isPending}
      />
    </div>
  );
}
