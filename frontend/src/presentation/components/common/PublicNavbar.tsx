'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Download } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { CaLogo } from './CaLogo';

export const PublicNavbar = ({ sections, homeLinks = false }: {
  sections: { id: string; label: string }[];
  homeLinks?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lastActive = useRef<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (homeLinks || !sections.length) return;

    const targets = sections.flatMap(({ id }) => {
      const target = document.getElementById(id);
      return target ? [target] : [];
    });
    const main = document.getElementById('portfolio-content');
    let frame = 0;

    function update() {
      frame = 0;
      const readingLine = Math.max(112, window.innerHeight * .36);
      let current: string | null = null;
      for (const target of targets) {
        if (target.getBoundingClientRect().top > readingLine) break;
        current = target.id;
      }
      const scrollHeight = document.scrollingElement?.scrollHeight ?? 0;
      if (scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= scrollHeight - 2) {
        current = targets.at(-1)?.id ?? current;
      }
      if (current === lastActive.current) return;
      lastActive.current = current;
      setActiveSection(current);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    const resize = new ResizeObserver(schedule);
    if (main) resize.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    schedule();

    return () => {
      resize.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [homeLinks, sections]);

  useEffect(() => {
    if (!isOpen) return;

    mobileNav.current?.querySelector('a')?.focus();

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      menuButton.current?.focus();
    }

    function handleFocus(event: FocusEvent) {
      if (event.target instanceof Node && !mobileNav.current?.contains(event.target) && event.target !== menuButton.current) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('focusin', handleFocus);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('focusin', handleFocus);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const sectionHref = (id: string) => (homeLinks ? '/#' : '#') + id;
  const currentLocation = (id: string) => !homeLinks && activeSection === id ? 'location' : undefined;

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass border-b border-[var(--surface-border)] rounded-none">
        <div className="portfolio-shell portfolio-nav">
          <Link href="/" onClick={closeMenu} aria-label="Inicio" className="inline-flex items-center min-h-11">
            <CaLogo size={40} />
          </Link>

          <nav className="portfolio-desktop-nav" aria-label="Secciones del portafolio">
            {sections.map(({ id, label }) => <a key={id} href={sectionHref(id)} aria-current={currentLocation(id)}>{label}</a>)}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <a href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf" className="portfolio-link portfolio-desktop-cv" aria-label="Descargar CV">
              <Download size={16} aria-hidden="true" /> CV
            </a>
            <button
              type="button"
              ref={menuButton}
              className="portfolio-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isOpen}
              aria-controls={isOpen ? 'mobile-navigation' : undefined}
            >
              {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex justify-end min-[900px]:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                closeMenu();
                menuButton.current?.focus();
              }}
            />
            <motion.nav
              ref={mobileNav}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
              id="mobile-navigation"
              aria-label="Secciones del portafolio"
              className="portfolio-mobile-nav glass"
            >
              {sections.map(({ id, label }) => <a key={id} href={sectionHref(id)} aria-current={currentLocation(id)} onClick={closeMenu}>{label}</a>)}
              <a href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf" onClick={closeMenu}>
                <Download size={18} aria-hidden="true" /> Descargar CV
              </a>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
