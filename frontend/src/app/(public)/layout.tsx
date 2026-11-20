import type { Metadata } from 'next';
import { Barlow_Condensed } from 'next/font/google';
import { ReactNode } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { InteractiveBackground } from '../../presentation/components/public/InteractiveBackground';
import './portfolio.css';

const barlowCondensed = Barlow_Condensed({
  weight: '600',
  subsets: ['latin'],
  variable: '--portfolio-display-font',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://crisacalo.com'),
  title: 'Cristian Acalo | Ingeniero de Software',
  description: 'Proyectos y trayectoria de Cristian Acalo, desarrollador de software full stack especializado en automatización e integración de modelos de lenguaje.',
  alternates: { canonical: '/' },
  keywords: ['Software Engineer', 'Full Stack Developer', 'Next.js', 'TypeScript', 'Node.js', 'Clean Architecture'],
  openGraph: {
    title: 'Cristian Acalo | Ingeniero de Software',
    description: 'Proyectos de desarrollo full stack, automatización e integración de modelos de lenguaje.',
    url: '/',
    siteName: 'Cristian Acalo Portfolio',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Cristian Acalo Portfolio Cover',
      },
    ],
    locale: 'es_EC',
    type: 'website',
  },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${barlowCondensed.variable} portfolio min-h-screen flex flex-col`}>
      <a className="portfolio-skip" href="#portfolio-content">Ir al contenido</a>

      <InteractiveBackground />

      {children}

      <footer className="portfolio-footer relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="portfolio-shell portfolio-footer-inner">
          <p>© {new Date().getFullYear()} Cristian Acalo</p>
          <div className="portfolio-actions">
            <a href="https://github.com/CrisAcalo" target="_blank" rel="noopener noreferrer" className="portfolio-link">
              <Github aria-hidden="true" size={17} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/cristianacalo/" target="_blank" rel="noopener noreferrer" className="portfolio-link">
              <Linkedin aria-hidden="true" size={17} /> LinkedIn
            </a>
            <a href="mailto:cristianchoacalo@gmail.com" className="portfolio-link">
              <Mail aria-hidden="true" size={17} /> Correo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
