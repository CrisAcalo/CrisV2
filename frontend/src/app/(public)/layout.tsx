import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { PublicNavbar } from '../../presentation/components/common/PublicNavbar';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { InteractiveBackground } from '../../presentation/components/public/InteractiveBackground';
import { PageLoader } from '../../presentation/components/common/PageLoader';
import { CaLogo } from '../../presentation/components/common/CaLogo';

export const metadata: Metadata = {
  title: 'Cristian Acalo | Ingeniero de Software',
  description: 'Portafolio Profesional de Cristian Acalo, desarrollador especializado en arquitecturas limpias, rendimiento y experiencias de usuario de alto impacto.',
  keywords: ['Software Engineer', 'Full Stack Developer', 'Next.js', 'TypeScript', 'Node.js', 'Clean Architecture'],
  openGraph: {
    title: 'Cristian Acalo | Ingeniero de Software',
    description: 'Descubre mis proyectos destacados y trayectoria construyendo software escalable.',
    url: 'https://crisacalo.com',
    siteName: 'Cristian Acalo Portfolio',
    images: [
      {
        url: '/og-image.jpg', // Placeholder for upcoming OG Image
        width: 1200,
        height: 630,
        alt: 'Cristian Acalo Portfolio Cover',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[var(--accent)] selection:text-white">
      {/* Page Loader — fades out once window.load fires */}
      <PageLoader />

      {/* Public Navbar (Client Component for Mobile Menu) */}
      <PublicNavbar />

      {/* Global Interactive Background */}
      <InteractiveBackground />

      {/* Main Content */}
      <main className="flex-grow pt-20 overflow-x-hidden">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[var(--surface-border)] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <CaLogo size={36} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} Cristian Acalo. Construido con arquitectura limpia.
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/CrisAcalo" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:-translate-y-1 transition-transform" style={{ color: 'var(--text-secondary)' }}>
              <Github size={18} />
            </a>
            <a href="https://www.linkedin.com/in/cristianacalo/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:-translate-y-1 transition-transform" style={{ color: 'var(--text-secondary)' }}>
              <Linkedin size={18} />
            </a>
            <a href="mailto:cristianchoacalo@gmail.com" className="p-2 rounded-full glass hover:-translate-y-1 transition-transform" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
