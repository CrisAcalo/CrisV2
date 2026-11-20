import type { ReactNode } from 'react';
import { formatFriendlyDate } from '../../utils/dateUtils';

export function AdminRecord({ title, detail }: { title: ReactNode; detail?: string | null }) {
  return (
    <div className="admin-record">
      <div className="admin-record-title">{title}</div>
      {detail && <p className="admin-record-detail" title={detail}>{detail}</p>}
    </div>
  );
}

export function AdminBadge({
  children, tone = 'neutral',
}: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' }) {
  return <span className="admin-badge" data-tone={tone}>{children}</span>;
}

export function AdminOrigin({ imported }: { imported?: boolean }) {
  return <AdminBadge tone={imported ? 'accent' : 'neutral'}>{imported ? 'LinkedIn' : 'Manual'}</AdminBadge>;
}

export function AdminPeriod({ start, end }: { start: string; end?: string | null }) {
  return (
    <div className="admin-period">
      <span>{formatFriendlyDate(start, 'UTC')}</span>
      <span>Hasta {end ? formatFriendlyDate(end, 'UTC') : 'hoy'}</span>
    </div>
  );
}

export function AdminTags({ values, limit = 3 }: { values: string[]; limit?: number }) {
  if (!values.length) return '—';
  return (
    <div className="admin-tags">
      {values.slice(0, limit).map((value, index) => <AdminBadge key={`${index}-${value}`}>{value}</AdminBadge>)}
      {values.length > limit && <span title={values.slice(limit).join(', ')}>+{values.length - limit}</span>}
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric', month: 'short', year: 'numeric',
});
const calendarFormatter = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

export function formatAdminDate(value: string | Date | null | undefined, calendarDate = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return (calendarDate ? calendarFormatter : dateFormatter).format(date);
}
