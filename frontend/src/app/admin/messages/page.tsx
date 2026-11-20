'use client';

import { Eye, Mail, MailOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminAction, AdminActionLink } from '@/src/presentation/components/admin/AdminAction';
import { AdminPageHeader } from '@/src/presentation/components/admin/AdminPageHeader';
import { AdminResourceTable } from '@/src/presentation/components/admin/AdminResourceTable';
import { AdminBadge, AdminRecord, formatAdminDate } from '@/src/presentation/components/admin/AdminTableFields';
import { MessageDetailModal } from '@/src/presentation/components/admin/MessageDetailModal';
import { ConfirmModal } from '@/src/presentation/components/common/ConfirmModal';
import { useMessages, useMarkMessageAsRead, useSoftDeleteMessage } from '@/src/presentation/hooks/useMessages';
import { getApiErrorMessage } from '@/src/presentation/utils/apiErrors';
import type { Message } from '@/src/domain/entities';

const subject = (message: Message) => message.subject || 'Sin asunto';

export default function AdminMessagesPage() {
  const query = useMessages();
  const markRead = useMarkMessageAsRead();
  const remove = useSoftDeleteMessage();
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);
  const messages = query.data?.data ?? [];
  const selectedMessage = messages.find((message) => message.id === selected) ?? null;
  const unread = messages.filter((message) => !message.isRead).length;

  async function changeReadStatus(id: string, isRead: boolean, showSuccess = true) {
    if (markRead.isPending) return;
    try {
      await markRead.mutateAsync({ id, isRead });
      if (showSuccess) toast.success(isRead ? 'Marcado como leído' : 'Marcado como no leído');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el mensaje'));
    }
  }

  function open(message: Message) {
    setSelected(message.id);
    if (!message.isRead) void changeReadStatus(message.id, true, false);
  }

  async function moveToTrash() {
    if (!deleting || remove.isPending) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Mensaje enviado a la papelera');
      setDeleting(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo mover el mensaje a la papelera'));
    }
  }

  return (
    <div className="admin-list-page">
      <AdminPageHeader title="Mensajes" description="Revisa los mensajes recibidos desde tu portafolio." actions={
        <AdminActionLink href="/admin/messages/trash" icon={<Trash2 size={17} />}>Papelera</AdminActionLink>
      } />
      <AdminResourceTable
        query={query}
        name="Mensajes"
        actionSize="triple"
        searchText={(item) => [item.senderName, item.senderEmail, item.subject, item.content].join(' ')}
        emptyTitle="Aún no hay mensajes"
        emptyDescription="Los mensajes del formulario de contacto aparecerán aquí."
        summary={unread > 0 ? <AdminBadge tone="accent">{unread} sin leer</AdminBadge> : undefined}
        columns={[
          { label: 'Remitente', cell: (item) => <AdminRecord title={item.senderName} detail={item.senderEmail} /> },
          {
            label: 'Asunto',
            cell: (item) => (
              <AdminRecord title={
                <button type="button" className="admin-record-link" onClick={() => open(item)}>{subject(item)}</button>
              } detail={item.content} />
            ),
          },
          { label: 'Estado', size: 'status', cell: (item) => <AdminBadge tone={item.isRead ? 'neutral' : 'accent'}>{item.isRead ? 'Leído' : 'No leído'}</AdminBadge> },
          { label: 'Fecha', size: 'date', cell: (item) => formatAdminDate(item.createdAt) },
        ]}
        actions={(item) => (
          <>
            <AdminAction icon={<Eye size={17} />} title="Ver mensaje" onClick={() => open(item)} iconOnly>
              Ver {subject(item)}
            </AdminAction>
            <AdminAction
              icon={item.isRead ? <Mail size={17} /> : <MailOpen size={17} />}
              title={item.isRead ? 'Marcar como no leído' : 'Marcar como leído'}
              pending={markRead.isPending && markRead.variables?.id === item.id}
              disabled={markRead.isPending}
              onClick={() => changeReadStatus(item.id, !item.isRead)}
              iconOnly
            >
              {item.isRead ? 'Marcar como no leído' : 'Marcar como leído'} {subject(item)}
            </AdminAction>
            <AdminAction icon={<Trash2 size={17} />} title="Mover a la papelera" tone="danger"
              onClick={() => setDeleting(item)} pending={remove.isPending && deleting?.id === item.id} iconOnly>
              Mover a la papelera {subject(item)}
            </AdminAction>
          </>
        )}
      />
      <MessageDetailModal
        message={selectedMessage}
        isOpen={selectedMessage !== null}
        onClose={() => setSelected(null)}
        onMarkRead={changeReadStatus}
        busy={markRead.isPending}
      />
      <ConfirmModal
        isOpen={deleting !== null}
        title="Mover a la papelera"
        message={`¿Mover «${deleting ? subject(deleting) : ''}» a la papelera? Podrás restaurar el mensaje después.`}
        confirmText="Mover a la papelera"
        onConfirm={moveToTrash}
        onClose={() => { if (!remove.isPending) setDeleting(null); }}
        isDestructive={false}
        isLoading={remove.isPending}
      />
    </div>
  );
}
