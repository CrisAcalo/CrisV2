'use client';

import { useAuthStore } from '../../application/stores/useAuthStore';
import { useProjects } from '../../presentation/hooks/useProjects';
import { useExperiences } from '../../presentation/hooks/useHistory';
import { useMessages } from '../../presentation/hooks/useMessages';
import { motion } from 'framer-motion';
import { FolderOpen, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';

const statsConfig = [
  {
    label: 'Proyectos',
    icon: FolderOpen,
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.25)',
    key: 'projects',
  },
  {
    label: 'Experiencias',
    icon: Briefcase,
    color: 'from-teal-500 to-cyan-400',
    glow: 'rgba(20,184,166,0.25)',
    key: 'experiences',
  },
  {
    label: 'Mensajes',
    icon: MessageSquare,
    color: 'from-rose-500 to-pink-500',
    glow: 'rgba(244,63,94,0.25)',
    key: 'messages',
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: projectsData } = useProjects();
  const { data: experiencesData } = useExperiences();
  const { data: messagesData } = useMessages();

  const counts: Record<string, number> = {
    projects:    projectsData?.data?.length  || 0,
    experiences: experiencesData?.data?.length || 0,
    messages:    messagesData?.data?.length  || 0,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {greeting} 👋
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Panel de Control
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface)' }}>
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Todo activo
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsConfig.map((s, i) => {
          const Icon = s.icon;
          const count = counts[s.key];
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-surface p-6 flex items-center gap-5"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${s.color} flex-shrink-0`}
                style={{ boxShadow: `0 4px 20px ${s.glow}` }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                <p className="text-4xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {count}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-surface p-6"
        >
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🚀 Acciones Rápidas</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Gestiona el contenido de tu portafolio desde aquí.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/projects" className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: 'var(--accent-faint)', color: 'var(--accent)' }}>
              + Proyecto
            </a>
            <a href="/admin/settings" className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
              ⚙ Configuración
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-surface p-6"
        >
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>📋 Estado del Sistema</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'API Backend', status: 'Conectado', ok: true },
              { label: 'Base de Datos', status: 'Operativa', ok: true },
              { label: 'LinkedIn API', status: 'Verificar URN', ok: false },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.ok ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
