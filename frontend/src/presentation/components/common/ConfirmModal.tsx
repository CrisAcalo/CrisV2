'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

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

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          {isDestructive && (
            <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {message}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'primary' : 'primary'}
            className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
