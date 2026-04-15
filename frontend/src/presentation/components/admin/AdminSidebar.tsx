'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  Mail,
  Award,
  Settings2,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../../application/stores/useAuthStore';

const SIDEBAR_W = 248;
const SIDEBAR_W_COLLAPSED = 72;

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
  { label: 'Experiencia', href: '/admin/experience', icon: Briefcase },
  { label: 'Educación', href: '/admin/education', icon: GraduationCap },
  { label: 'Certificados', href: '/admin/certificates', icon: Award },
  { label: 'Skills', href: '/admin/skills', icon: Sparkles },
  { label: 'Mensajes', href: '/admin/messages', icon: Mail },
];

const bottomItems = [
  { label: 'Ver Portafolio', href: '/', icon: ExternalLink, external: true },
  { label: 'Configuración', href: '/admin/settings', icon: Settings2 },
];

function NavLink({ item, collapsed, onClick }: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }>, exact?: boolean; external?: boolean };
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        background: isActive
          ? 'linear-gradient(135deg, hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.18), hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.08))'
          : undefined,
        boxShadow: isActive ? 'inset 0 1px 0 hsl(var(--accent-h) var(--accent-s) 90% / 0.1)' : undefined,
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.07)';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
      }}
    >
      {/* Active left accent bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: 'linear-gradient(to bottom, var(--accent), hsl(var(--accent-h) calc(var(--accent-s) + 10%) 80%))' }}
        />
      )}

      {/* Icon with glow on active */}
      <span
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all duration-200"
        style={isActive ? {
          color: 'var(--accent)',
          filter: 'drop-shadow(0 0 6px var(--accent-glow))',
        } : { color: 'var(--sidebar-text)' }}
      >
        <Icon className="w-5 h-5" />
      </span>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.05 } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            className="overflow-hidden whitespace-nowrap flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && isActive && (
        <ChevronRight className="w-3.5 h-3.5 opacity-50 flex-shrink-0" style={{ color: 'var(--accent)' }} />
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium
          bg-slate-900 text-white whitespace-nowrap pointer-events-none
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100]
          shadow-xl border border-white/10
        ">
          {item.label}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ collapsed, isMobile, onClose }: {
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const { logout, user } = useAuthStore();
  const isCollapsed = collapsed && !isMobile;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* Decorative background glow blobs */}
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-20 dark:opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(280 80% 60%) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0 relative">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), hsl(280 80% 60%))', boxShadow: '0 0 20px var(--accent-glow)' }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.06 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="overflow-hidden"
            >
              <p className="font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>Acalo Admin</p>
              <p className="text-xs mt-0.5 leading-none" style={{ color: 'var(--text-muted)' }}>Portfolio Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg transition-colors hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Divider with gradient */}
      <div className="mx-3 flex-shrink-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--sidebar-border), transparent)' }} />

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-0.5 custom-scrollbar relative">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-3" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
            Principal
          </p>
        )}
        {navItems.map(item => (
          <NavLink key={item.href} item={item} collapsed={isCollapsed} onClick={isMobile ? onClose : undefined} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 flex-shrink-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--sidebar-border), transparent)' }} />

      {/* ── Bottom Nav ── */}
      <div className="px-2 py-3 space-y-0.5 flex-shrink-0">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-3" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
            Sistema
          </p>
        )}
        {bottomItems.map(item => (
          <NavLink key={item.href} item={item} collapsed={isCollapsed} onClick={isMobile ? onClose : undefined} />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 flex-shrink-0 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--sidebar-border), transparent)' }} />

      {/* ── User ── */}
      <div className="flex items-center gap-3 px-3 py-4 flex-shrink-0 min-w-0 relative">
        {/* Avatar with glowing ring */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2"
          style={{
            background: 'linear-gradient(135deg, var(--accent), hsl(280 80% 60%))',
            boxShadow: '0 0 10px var(--accent-glow)',
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="user-info"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.06 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex-1 overflow-hidden min-w-0"
            >
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.email || 'Admin'}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{user?.role || 'ADMIN'}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1">
          <div className="scale-75 origin-right">
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f87171'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:block h-screen sticky top-0 flex-shrink-0 overflow-hidden"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* ── TOGGLE BUTTON ── */}
      <motion.button
        className="hidden md:flex"
        animate={{ left: sidebarW - 12 }}
        initial={false}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        style={{
          position: 'fixed',
          top: '20px',
          zIndex: 50,
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--surface-raised)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text-muted)',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 14px var(--accent-glow)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-raised)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--surface-border)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronRight size={14} />
        </motion.span>
      </motion.button>

      {/* ── MOBILE HAMBURGER ─────────────────────────── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text-secondary)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── MOBILE DRAWER ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed inset-y-0 left-0 z-50 w-72 overflow-hidden"
              style={{
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
                boxShadow: '8px 0 32px rgba(0,0,0,0.3)',
              }}
            >
              <SidebarContent collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
