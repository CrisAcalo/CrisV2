'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from '../admin/AdminDialog.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  busy?: boolean;
  descriptionId?: string;
}

const tabbable = 'button, input, select, textarea, a[href], [tabindex]';

export function Modal({ isOpen, onClose, title, children, size = 'md', busy = false, descriptionId }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wasBusy = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-dialog-autofocus]')?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && wasBusy.current && !busy) {
      dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')?.focus();
    }
    wasBusy.current = busy;
  }, [busy, isOpen]);

  function keepTabInDialog(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;

    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(tabbable)].filter(
      (element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0,
    );
    const first = controls[0];
    const last = controls.at(-1);
    const active = document.activeElement;

    if (!first) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey ? active === first || !controls.includes(active as HTMLElement) : active === last) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy || undefined}
      onKeyDown={keepTabInDialog}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={styles.close} aria-label="Cerrar diálogo" disabled={busy} onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </dialog>
  );
}
