'use client';

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import styles from './AdminDialog.module.css';

type FieldProps = { label: string; error?: string; hint?: string; required?: boolean; autofocus?: boolean };

function Field({ id, label, error, hint, required, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error || hint ? <p id={`${id}-description`} className={error ? styles.error : styles.hint}>{error || hint}</p> : null}
    </div>
  );
}

export const AdminInput = forwardRef<HTMLInputElement, FieldProps & ComponentPropsWithoutRef<'input'>>(
  ({ label, error, hint, required, autofocus, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id ?? generatedId;
    return (
      <Field id={id} label={label} error={error} hint={hint} required={required}>
        <input
          {...props}
          ref={ref}
          id={id}
          required={required}
          data-dialog-autofocus={autofocus || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-description` : undefined}
          className={styles.control}
        />
      </Field>
    );
  },
);
AdminInput.displayName = 'AdminInput';

export const AdminTextarea = forwardRef<HTMLTextAreaElement, FieldProps & ComponentPropsWithoutRef<'textarea'>>(
  ({ label, error, hint, required, ...props }, ref) => {
    const generatedId = useId();
    const id = props.id ?? generatedId;
    return (
      <Field id={id} label={label} error={error} hint={hint} required={required}>
        <textarea
          {...props}
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-description` : undefined}
          className={styles.control}
        />
      </Field>
    );
  },
);
AdminTextarea.displayName = 'AdminTextarea';

export function AdminFormActions({ busy, onClose, submitLabel }: { busy: boolean; onClose: () => void; submitLabel: string }) {
  return (
    <div className={styles.actions}>
      <button type="button" className={`${styles.action} ${styles.secondary}`} disabled={busy} onClick={onClose}>Cancelar</button>
      <button type="submit" className={`${styles.action} ${styles.primary}`} disabled={busy}>{busy ? 'Guardando…' : submitLabel}</button>
    </div>
  );
}
