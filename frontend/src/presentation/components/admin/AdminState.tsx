import { CircleAlert, Inbox, LoaderCircle, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminAction } from './AdminAction';

export function AdminState({
  kind, title, description, action, onRetry,
}: {
  kind: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
  action?: ReactNode;
  onRetry?: () => void;
}) {
  const Icon = kind === 'loading' ? LoaderCircle : kind === 'error' ? CircleAlert : Inbox;
  return (
    <div className="admin-state" data-kind={kind}>
      <div role={kind === 'error' ? 'alert' : 'status'}>
        <Icon size={22} aria-hidden="true" className={kind === 'loading' ? 'animate-spin' : undefined} />
        <p className="admin-state-title">{title}</p>
        {description && <p className="admin-state-description">{description}</p>}
      </div>
      {kind === 'error' && onRetry && (
        <AdminAction icon={<RotateCw size={17} />} onClick={onRetry}>Reintentar</AdminAction>
      )}
      {action}
    </div>
  );
}
