'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, ConfirmModal } from '../../../presentation/components/common';
import { Trash2, Mail, MailOpen, Search, MessageSquare, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Message } from '../../../domain/entities';
import { useMessages, useMarkMessageAsRead, useSoftDeleteMessage } from '../../../presentation/hooks/useMessages';
import { MessageDetailModal } from '../../../presentation/components/admin/MessageDetailModal';

function formatDate(date?: Date | string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMessages(false);
  const markReadMutation = useMarkMessageAsRead();
  const softDeleteMutation = useSoftDeleteMessage();

  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const items = data?.data || [];
  const unreadCount = items.filter(m => !m.isRead).length;

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(m =>
      m.senderName.toLowerCase().includes(q) ||
      m.senderEmail.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  }, [items, search]);

  const openMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setIsDetailOpen(true);
    // Auto mark as read when opening
    if (!msg.isRead) {
      markReadMutation.mutate({ id: msg.id, isRead: true });
    }
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    try {
      await markReadMutation.mutateAsync({ id, isRead });
      toast.success(isRead ? 'Marcado como leído' : 'Marcado como no leído');
    } catch {
      toast.error('Error al actualizar el mensaje');
    }
  };

  const confirmDelete = (id: string) => { setItemToDelete(id); setIsConfirmOpen(true); };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await softDeleteMutation.mutateAsync(itemToDelete);
      toast.success('Mensaje enviado a la papelera');
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error('No se pudo eliminar el mensaje');
    }
  };

  if (isLoading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Cargando mensajes...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error al cargar mensajes.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            Mensajes
            {unreadCount > 0 && (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>
                {unreadCount} nuevos
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {items.length} mensaje{items.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button variant="danger-light" onClick={() => router.push('/admin/messages/trash')}>
          <Trash2 size={14} className="mr-1" /> Papelera
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo, asunto o contenido..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-faint)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.boxShadow = ''; }}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {search ? 'Sin resultados' : 'No hay mensajes'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {search ? 'Prueba con otro término de búsqueda.' : 'Cuando alguien envíe un mensaje desde el portafolio aparecerá aquí.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--surface-border)' }}>
                <tr>
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Remitente</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: 'var(--text-secondary)' }}>Asunto</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>Fecha</th>
                  <th className="px-4 py-3 font-semibold text-right" style={{ color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg, i) => (
                  <motion.tr
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => openMessage(msg)}
                  >
                    {/* Read indicator dot */}
                    <td className="px-4 py-4">
                      {!msg.isRead && (
                        <span className="block w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                      )}
                    </td>
                    {/* Sender */}
                    <td className="px-4 py-4">
                      <div className={`font-medium ${!msg.isRead ? 'font-semibold' : ''}`} style={{ color: 'var(--text-primary)' }}>
                        {msg.senderName}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{msg.senderEmail}</div>
                    </td>
                    {/* Subject + preview */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className={`truncate ${!msg.isRead ? 'font-semibold' : ''}`} style={{ color: 'var(--text-primary)' }}>
                        {msg.subject || '(Sin asunto)'}
                      </div>
                      <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {msg.content.slice(0, 60)}{msg.content.length > 60 ? '…' : ''}
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(msg.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary-light"
                          size="sm"
                          title="Ver mensaje"
                          onClick={() => openMessage(msg)}
                        >
                          <Eye size={13} />
                        </Button>
                        <Button
                          variant="secondary-light"
                          size="sm"
                          title={msg.isRead ? 'Marcar no leído' : 'Marcar leído'}
                          onClick={() => handleMarkRead(msg.id, !msg.isRead)}
                        >
                          {msg.isRead ? <Mail size={13} /> : <MailOpen size={13} />}
                        </Button>
                        <Button
                          variant="danger-light"
                          size="sm"
                          title="Mover a papelera"
                          onClick={() => confirmDelete(msg.id)}
                        >
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

      <MessageDetailModal
        message={selectedMessage}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onMarkRead={handleMarkRead}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Mover a papelera"
        message="¿Deseas mover este mensaje a la papelera? Podrás restaurarlo después."
        confirmText="Mover a papelera"
        isDestructive={false}
        isLoading={softDeleteMutation.isPending}
      />
    </div>
  );
}
