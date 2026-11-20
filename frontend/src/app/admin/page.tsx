'use client';

import Link from 'next/link';
import { Briefcase, FolderOpen, Mail } from 'lucide-react';
import { AdminActionLink } from '../../presentation/components/admin/AdminAction';
import { AdminPageHeader } from '../../presentation/components/admin/AdminPageHeader';
import { AdminState } from '../../presentation/components/admin/AdminState';
import { useProjects } from '../../presentation/hooks/useProjects';
import { useExperiences } from '../../presentation/hooks/useHistory';
import { useMessages } from '../../presentation/hooks/useMessages';

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'medium',
  timeZone: 'America/Guayaquil',
});

export default function AdminDashboardPage() {
  const projects = useProjects();
  const experiences = useExperiences();
  const messages = useMessages();
  const inbox = messages.data?.data ?? [];
  const unread = inbox.filter((message) => !message.isRead).length;
  const recent = [...inbox]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 4);
  const metrics = [
    {
      label: 'Proyectos publicados', href: '/admin/projects', icon: FolderOpen, query: projects,
      count: (projects.data?.data ?? []).filter((project) => project.isPublished).length,
      hint: `${projects.data?.data?.length ?? 0} en total`,
    },
    {
      label: 'Experiencias', href: '/admin/experience', icon: Briefcase, query: experiences,
      count: experiences.data?.data?.length ?? 0, hint: 'Registros activos',
    },
    {
      label: 'Mensajes sin leer', href: '/admin/messages', icon: Mail, query: messages,
      count: unread, hint: `${inbox.length} en la bandeja`,
    },
  ];

  return (
    <div className="admin-overview">
      <AdminPageHeader title="Vista general" description="Contenido publicado y mensajes del portafolio." />

      <ul className="admin-overview-metrics" aria-label="Resumen del portafolio">
        {metrics.map(({ label, href, icon: Icon, query, count, hint }) => (
          <li key={href}>
            <Link href={href} className="admin-metric">
              <span className="admin-metric-label"><Icon size={19} aria-hidden="true" />{label}</span>
              <strong className="admin-metric-value">{query.isPending || query.isError ? '—' : count}</strong>
              <span className="admin-metric-hint">{query.isPending ? 'Cargando…' : query.isError ? 'Datos no disponibles' : hint}</span>
            </Link>
          </li>
        ))}
      </ul>

      {(projects.isError || experiences.isError) && (
        <AdminState
          kind="error"
          title="No se pudo cargar el resumen completo"
          onRetry={() => {
            if (projects.isError) void projects.refetch();
            if (experiences.isError) void experiences.refetch();
          }}
        />
      )}

      <section className="admin-section" aria-labelledby="admin-recent-messages">
        <div className="admin-section-head">
          <h2 id="admin-recent-messages"><Mail size={19} aria-hidden="true" /> Mensajes recientes</h2>
          <AdminActionLink href="/admin/messages">Ver bandeja</AdminActionLink>
        </div>
        {messages.isPending ? (
          <div className="admin-section-body"><p className="admin-section-note" role="status">Cargando mensajes…</p></div>
        ) : messages.isError ? (
          <div className="admin-section-body"><AdminState kind="error" title="No se pudieron cargar los mensajes" onRetry={() => { void messages.refetch(); }} /></div>
        ) : recent.length ? (
          <ul className="admin-overview-inbox">
            {recent.map((message) => {
              const date = new Date(message.createdAt);
              return (
                <li key={message.id} className="admin-inbox-row">
                  <div>
                    <p className="admin-inbox-subject">{message.subject || 'Sin asunto'}</p>
                    <p className="admin-inbox-meta">
                      {message.senderName || message.senderEmail}
                      {!message.isRead && <> <span className="admin-inbox-unread">· Sin leer</span></>}
                    </p>
                  </div>
                  {Number.isFinite(date.getTime()) && <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="admin-section-body"><p className="admin-section-note">Todavía no tienes mensajes.</p></div>
        )}
      </section>
    </div>
  );
}
