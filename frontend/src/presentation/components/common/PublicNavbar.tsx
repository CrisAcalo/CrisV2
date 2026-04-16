'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Download } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CaLogo } from './CaLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useSectionsStore } from '../../../application/stores/useSectionsStore';

export const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const hasProjects = useSectionsStore(s => s.hasProjects);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass border-b border-[var(--surface-border)] rounded-none">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" onClick={closeMenu} aria-label="Inicio" className="hover:opacity-80 transition-opacity duration-200">
            <CaLogo size={44} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden min-[900px]:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Link href="#experiencia" className="hover:text-[var(--accent)] transition-colors">Experiencia</Link>
            {hasProjects && <Link href="#proyectos" className="hover:text-[var(--accent)] transition-colors">Proyectos</Link>}
            <Link href="#skills" className="hover:text-[var(--accent)] transition-colors">Skills</Link>
            <Link href="#certificados" className="hover:text-[var(--accent)] transition-colors">Certificados</Link>
            <Link href="#contacto" className="hover:text-[var(--accent)] transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <a href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf" className="hidden min-[900px]:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full glass hover:bg-[var(--surface-raised)] transition-colors" style={{ color: 'var(--text-primary)' }}>
              <Download size={14} /> CV
            </a>

            {/* <Link href="/login" className="text-xs font-semibold px-4 py-2 rounded-full hidden min-[900px]:block glass hover:bg-[var(--surface-raised)] transition-colors" style={{ color: 'var(--text-primary)' }}>
              Área Privada
            </Link> */}

            {/* Mobile Menu Toggle */}
            <button
              className="min-[900px]:hidden p-2 -mr-2 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors z-50"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex justify-end min-[900px]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-[calc(100vh-5rem)] top-20 glass backdrop-blur-lg border-l border-[var(--surface-border)] shadow-2xl flex flex-col justify-center items-center gap-8 px-6"
            >
              <nav className="flex flex-col items-center gap-6 text-lg font-medium w-full" style={{ color: 'var(--text-primary)' }}>
                <Link href="#experiencia" className="hover:text-[var(--accent)] transition-colors" onClick={closeMenu}>Experiencia</Link>
                {hasProjects && <Link href="#proyectos" className="hover:text-[var(--accent)] transition-colors" onClick={closeMenu}>Proyectos</Link>}
                <Link href="#skills" className="hover:text-[var(--accent)] transition-colors" onClick={closeMenu}>Skills</Link>
                <Link href="#certificados" className="hover:text-[var(--accent)] transition-colors" onClick={closeMenu}>Certificados</Link>
                <Link href="#contacto" className="hover:text-[var(--accent)] transition-colors" onClick={closeMenu}>Contacto</Link>

                <div className="w-full h-px bg-[var(--surface-border)] my-2" />

                <a href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf" className="flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl glass text-sm hover:bg-[var(--surface-raised)] transition-colors" onClick={closeMenu}>
                  <Download size={16} /> Descargar CV
                </a>

                {/* <Link href="/login" className="w-full text-center py-3 rounded-xl glass text-sm hover:bg-[var(--surface-raised)] transition-colors" style={{ color: 'var(--text-secondary)' }} onClick={closeMenu}>
                  Área Privada
                </Link> */}
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
