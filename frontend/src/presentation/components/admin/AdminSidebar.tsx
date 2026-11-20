'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Award, Briefcase, ChevronRight, Code2, ExternalLink, FolderOpen, GraduationCap,
  LayoutDashboard, LogOut, Mail, Menu, PanelLeftClose, PanelLeftOpen, Settings2, X,
} from 'lucide-react';
import { useAdminLogout, useAdminSession } from '../../hooks/useAdminSession';
import { CaLogo } from '../common/CaLogo';
import { ThemeToggle } from '../common/ThemeToggle';

const sections = [
  { label: 'Vista general', href: '/admin', icon: LayoutDashboard },
  { label: 'Proyectos', href: '/admin/projects', icon: FolderOpen },
  { label: 'Experiencia', href: '/admin/experience', icon: Briefcase },
  { label: 'Educación', href: '/admin/education', icon: GraduationCap },
  { label: 'Tecnologías', href: '/admin/skills', icon: Code2 },
  { label: 'Certificados', href: '/admin/certificates', icon: Award },
  { label: 'Mensajes', href: '/admin/messages', icon: Mail },
  { label: 'Configuración', href: '/admin/settings', icon: Settings2 },
];

function matchesSection(pathname: string, href: string) {
  return pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
}

function AdminNavigation({ pathname, close }: { pathname: string; close?: () => void }) {
  const email = useAdminSession().data?.email;
  const logout = useAdminLogout();

  return (
    <>
      <div className="admin-brand">
        <Link href="/admin" className="admin-brand-link" aria-label="Ir a Vista general" title="Vista general" onClick={close}>
          <CaLogo size={32} color="var(--admin-accent)" />
          <span className="admin-nav-label">Cristian Acalo</span>
        </Link>
        {close && (
          <button className="admin-shell-icon" type="button" aria-label="Cerrar menú" onClick={close} autoFocus>
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <nav className="admin-navigation" aria-label="Navegación del panel">
        <ul>
          {sections.map(({ href, label, icon: Icon }) => {
            const active = matchesSection(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="admin-nav-link"
                  title={label}
                  aria-label={label}
                  aria-current={pathname === href ? 'page' : active ? 'location' : undefined}
                  onClick={close}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span className="admin-nav-label">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="admin-sidebar-footer">
        <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link" title="Ver portafolio" aria-label="Ver portafolio" onClick={close}>
          <ExternalLink size={19} aria-hidden="true" />
          <span className="admin-nav-label">Ver portafolio</span>
        </Link>
        <div className="admin-account">
          <p className="admin-nav-label" title={email}>{email}</p>
          <button
            className="admin-shell-icon"
            type="button"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            disabled={logout.isPending}
            onClick={() => { close?.(); logout.mutate(); }}
          >
            <LogOut size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AdminFrame({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const section = sections.find(({ href }) => matchesSection(pathname, href));
  const isTrash = pathname.endsWith('/trash');

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnResize = () => {
      if (desktop.matches && drawer.current?.open) drawer.current.close();
    };
    desktop.addEventListener('change', closeOnResize);
    return () => desktop.removeEventListener('change', closeOnResize);
  }, []);

  const closeMenu = () => drawer.current?.close();
  const openMenu = () => {
    if (!drawer.current?.open) {
      drawer.current?.showModal();
      setMenuOpen(true);
    }
  };

  return (
    <div className="admin-frame" data-collapsed={collapsed || undefined}>
      <a href="#admin-content" className="admin-skip">Ir al contenido</a>
      <aside className="admin-sidebar" id="admin-sidebar" aria-label="Panel lateral">
        <AdminNavigation pathname={pathname} />
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <button
              type="button"
              className="admin-shell-icon admin-collapse"
              aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
              aria-controls="admin-sidebar"
              aria-expanded={!collapsed}
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="admin-shell-icon admin-mobile-trigger"
              aria-label="Abrir menú"
              aria-controls="admin-nav-drawer"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={openMenu}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <nav className="admin-breadcrumb" aria-label="Ubicación">
              {isTrash && section ? (
                <>
                  <Link href={section.href}>{section.label}</Link>
                  <ChevronRight size={14} aria-hidden="true" />
                  <span aria-current="page">Papelera</span>
                </>
              ) : (
                <span aria-current="page">{section?.label ?? 'Administración'}</span>
              )}
            </nav>
          </div>
          <div className="admin-theme"><ThemeToggle /></div>
        </header>
        <main id="admin-content" className="admin-main" tabIndex={-1}>{children}</main>
      </div>
      <dialog
        ref={drawer}
        id="admin-nav-drawer"
        className="admin-drawer"
        aria-label="Menú del panel"
        onClose={() => setMenuOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}
      >
        <div className="admin-drawer-content">
          <AdminNavigation pathname={pathname} close={closeMenu} />
        </div>
      </dialog>
    </div>
  );
}
