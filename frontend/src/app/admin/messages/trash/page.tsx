'use client';

import { AdminTrashList } from '@/src/presentation/components/admin/AdminTrashList';
import { AdminRecord } from '@/src/presentation/components/admin/AdminTableFields';
import { useMessages, useHardDeleteMessage, useRestoreMessage } from '@/src/presentation/hooks/useMessages';

export default function AdminMessagesTrashPage() {
  const query = useMessages(true);
  const restore = useRestoreMessage();
  const remove = useHardDeleteMessage();

  return <AdminTrashList
    name="Mensajes"
    href="/admin/messages"
    query={query}
    restore={restore.mutateAsync}
    remove={remove}
    itemLabel={(item) => item.subject || 'Sin asunto'}
    searchText={(item) => [item.senderName, item.senderEmail, item.subject, item.content].join(' ')}
    columns={[
      { label: 'Remitente', cell: (item) => <AdminRecord title={item.senderName} detail={item.senderEmail} /> },
      { label: 'Asunto', cell: (item) => item.subject || 'Sin asunto' },
    ]}
  />;
}
