'use client';

import { useId } from 'react';
import { Modal } from './Modal';
import styles from '../admin/AdminDialog.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = true, isLoading = false,
}: ConfirmModalProps) {
  const descriptionId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} descriptionId={descriptionId} busy={isLoading} size="sm">
      <div className={styles.form}>
        <p id={descriptionId} className="text-sm leading-relaxed">{message}</p>
        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={isLoading} data-dialog-autofocus className={`${styles.action} ${styles.secondary}`}>
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`${styles.action} ${isDestructive ? styles.danger : styles.primary}`}
          >
            {isLoading ? 'Procesando…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
