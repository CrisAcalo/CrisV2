'use client';

import { useState } from 'react';
import { Mail, MailOpen, Reply } from 'lucide-react';
import type { Message } from '../../../domain/entities';
import { Modal } from '../common/Modal';
import styles from './AdminDialog.module.css';

interface Props {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string, isRead: boolean) => void | Promise<void>;
  busy?: boolean;
}

const messageDateFormat = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function MessageDetailModal({ message, isOpen, onClose, onMarkRead, busy = false }: Props) {
  const [marking, setMarking] = useState(false);
  if (!message) return null;

  const locked = busy || marking;
  const subject = message.subject || 'Sin asunto';
  const date = new Date(message.createdAt);
  const formattedDate = Number.isFinite(date.getTime()) ? messageDateFormat.format(date) : 'Sin fecha';
  const address = `mailto:${encodeURIComponent(message.senderEmail)}`;
  const StatusIcon = message.isRead ? Mail : MailOpen;

  async function toggleRead() {
    if (!message || locked) return;
    setMarking(true);
    try {
      await onMarkRead(message.id, !message.isRead);
    } finally {
      setMarking(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subject} size="lg" busy={marking}>
      <div className={styles.form}>
        <dl className={styles.readMeta}>
          <div><dt>Remitente</dt><dd>{message.senderName}</dd><dd><a href={address}>{message.senderEmail}</a></dd></div>
          <div><dt>Recibido</dt><dd>{formattedDate}</dd></div>
          <div><dt>Estado</dt><dd>{message.isRead ? 'Leído' : 'No leído'}</dd></div>
        </dl>
        <p className={styles.messageBody}>{message.content}</p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.action} ${styles.secondary}`} disabled={locked} onClick={toggleRead}>
            <StatusIcon size={16} aria-hidden="true" /> {marking ? 'Actualizando…' : message.isRead ? 'Marcar como no leído' : 'Marcar como leído'}
          </button>
          <a href={`${address}?subject=${encodeURIComponent(`Re: ${subject}`)}`} className={`${styles.action} ${styles.primary}`}>
            <Reply size={16} aria-hidden="true" /> Responder
          </a>
        </div>
      </div>
    </Modal>
  );
}
