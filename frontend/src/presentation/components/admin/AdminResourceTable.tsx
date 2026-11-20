'use client';

import { Search, X } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { AdminAction } from './AdminAction';
import { AdminState } from './AdminState';

export type AdminColumn<T> = {
  label: string;
  cell: (item: T) => ReactNode;
  size?: 'status' | 'date' | 'control' | 'link';
};

export type AdminResourceQuery<T> = {
  data?: { data: T[] };
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
};

function normalizeSearch(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

export function AdminResourceTable<T extends { id: string }>({
  query, name, columns, actions, actionSize = 'pair', searchText, emptyTitle, emptyDescription, emptyAction, summary,
}: {
  query: AdminResourceQuery<T>;
  name: string;
  columns: AdminColumn<T>[];
  actions: (item: T) => ReactNode;
  actionSize?: 'pair' | 'triple' | 'labeled';
  searchText: (item: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  summary?: ReactNode;
}) {
  const [search, setSearch] = useState('');
  const searchId = useId();
  const records = query.data?.data ?? [];
  const term = normalizeSearch(search);
  const shown = term ? records.filter((item) => normalizeSearch(searchText(item)).includes(term)) : records;

  if (query.isLoading) return <AdminState kind="loading" title="Cargando registros…" />;
  if (query.isError) return (
    <AdminState
      kind="error"
      title="No se pudieron cargar los registros"
      description="Comprueba la conexión y vuelve a intentarlo."
      onRetry={() => { void query.refetch(); }}
    />
  );
  if (!records.length) {
    return <AdminState kind="empty" title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="admin-resource">
      <div className="admin-resource-toolbar">
        <div className="admin-search">
          <label className="sr-only" htmlFor={searchId}>Buscar en {name.toLocaleLowerCase('es')}</label>
          <Search size={17} aria-hidden="true" />
          <input id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar…" />
        </div>
        <p className="admin-resource-count" role="status">
          {term ? `${shown.length} de ${records.length}` : records.length} {records.length === 1 ? 'registro' : 'registros'}
          {summary && <span>{summary}</span>}
        </p>
      </div>

      {!shown.length ? (
        <AdminState kind="empty" title="Sin resultados" description="Prueba con otro término de búsqueda."
          action={<AdminAction icon={<X size={17} />} onClick={() => setSearch('')}>Limpiar búsqueda</AdminAction>}
        />
      ) : (
        <div className="admin-table-frame">
          <table className="admin-card-table" role="table">
            <caption className="sr-only">{name}</caption>
            <colgroup>
              {columns.map(({ label, size }) => <col key={label} data-size={size} />)}
              <col className="admin-action-column" data-size={actionSize} />
            </colgroup>
            <thead role="rowgroup">
              <tr role="row">
                {columns.map(({ label }) => <th key={label} scope="col" role="columnheader">{label}</th>)}
                <th scope="col" role="columnheader" className="admin-table-actions">Acciones</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {shown.map((item) => (
                <tr key={item.id} role="row">
                  {columns.map(({ label, cell }, index) => index === 0 ? (
                    <th key={label} scope="row" role="rowheader">{cell(item)}</th>
                  ) : (
                    <td key={label} role="cell">
                      <span className="admin-cell-label" aria-hidden="true">{label}</span>
                      <div>{cell(item)}</div>
                    </td>
                  ))}
                  <td role="cell" className="admin-table-actions"><div>{actions(item)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
