'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  GraduationCap,
  Settings2,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../../application/stores/useAuthStore';

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 72;

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
  { label: 'Experiencia', href: '/admin/experience', icon: Briefcase },
  { label: 'Educación', href: '/admin/education', icon: GraduationCap },
];

const bottomItems = [
  { label: 'Configuración', href: '/admin/settings', icon: Settings2 },
];

function NavLink({ item, collapsed, onClick }: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }>, exact?: boolean };
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
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-colors duration-150
        ${isActive
          ? 'text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }
      `}
      style={isActive ? { background: 'hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.18)' } : undefined}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{ background: 'var(--accent)' }} />
      )}

      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
        style={isActive ? { color: 'var(--accent)' } : undefined}>
        <Icon className="w-5 h-5" />
      </span>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.05 } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            className="overflow-hidden whitespace-nowrap flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {!collapsed && isActive && (
        <ChevronRight className="w-4 h-4 opacity-60 flex-shrink-0" style={{ color: 'var(--accent)' }} />
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium
          bg-slate-800 text-white whitespace-nowrap pointer-events-none
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100]
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.06 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="overflow-hidden"
            >
              <p className="font-bold text-white text-sm leading-none">Acalo Admin</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-none">Portfolio Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="h-px bg-[#1f2937] mx-3 flex-shrink-0" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 mb-3">Principal</p>
        )}
        {navItems.map(item => (
          <NavLink key={item.href} item={item} collapsed={isCollapsed} onClick={isMobile ? onClose : undefined} />
        ))}
      </nav>

      <div className="h-px bg-[#1f2937] mx-3 flex-shrink-0" />

      {/* Bottom Nav */}
      <div className="px-2 py-3 space-y-1 flex-shrink-0">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 mb-3">Sistema</p>
        )}
        {bottomItems.map(item => (
          <NavLink key={item.href} item={item} collapsed={isCollapsed} onClick={isMobile ? onClose : undefined} />
        ))}
      </div>

      <div className="h-px bg-[#1f2937] mx-3 flex-shrink-0" />

      {/* User */}
      <div className="flex items-center gap-3 px-3 py-4 flex-shrink-0 min-w-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="user-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.06 } }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex-1 overflow-hidden min-w-0"
            >
              <p className="text-xs text-white font-medium truncate">{user?.email || 'Admin'}</p>
              <p className="text-[11px] text-slate-500">{user?.role || 'ADMIN'}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
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
          background: '#111827',
          borderRight: '1px solid #1f2937',
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* ── TOGGLE BUTTON (fixed so it's never clipped) ── */}
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
          background: '#3f3f46',
          border: '1px solid #52525b',
          color: '#d1d5db',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46';
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#52525b';
          (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db';
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
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: '#1e293b', color: '#94a3b8' }}
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
              style={{ background: '#111827', borderRight: '1px solid #1f2937' }}
            >
              <SidebarContent collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
