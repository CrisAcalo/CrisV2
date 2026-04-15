'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MailOpen, User, AtSign, Clock, Tag } from 'lucide-react';
import { Message } from '../../../domain/entities';
import { Button } from '../common';

interface Props {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string, isRead: boolean) => void;
}

function formatDate(date?: Date | string) {
  if (!date) return '—';
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const MessageDetailModal = ({ message, isOpen, onClose, onMarkRead }: Props) => {
  if (!message) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-xl rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
            >
              {/* Header */}
              <div
                className="flex items-start justify-between gap-4 p-6 pb-4"
                style={{ borderBottom: '1px solid var(--surface-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}
                  >
                    {message.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {message.subject || '(Sin asunto)'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {message.isRead ? 'Leído' : 'No leído'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg flex-shrink-0 transition-colors hover:bg-[var(--surface-raised)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Meta */}
              <div className="px-6 py-4 space-y-2" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-raised)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{message.senderName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AtSign size={14} style={{ color: 'var(--text-muted)' }} />
                  <a
                    href={`mailto:${message.senderEmail}`}
                    className="hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {message.senderEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{message.subject || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{formatDate(message.createdAt)}</span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-60 overflow-y-auto custom-scrollbar">
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {message.content}
                </p>
              </div>

              {/* Footer actions */}
              <div
                className="flex items-center justify-between gap-3 px-6 py-4"
                style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-raised)' }}
              >
                <Button
                  variant="secondary-light"
                  size="sm"
                  onClick={() => {
                    onMarkRead(message.id, !message.isRead);
                    onClose();
                  }}
                >
                  {message.isRead ? <><Mail size={13} className="mr-1.5" /> Marcar no leído</> : <><MailOpen size={13} className="mr-1.5" /> Marcar leído</>}
                </Button>
                <a
                  href={`mailto:${message.senderEmail}?subject=Re: ${encodeURIComponent(message.subject || '')}`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Responder
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
