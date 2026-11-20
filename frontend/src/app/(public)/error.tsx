'use client';

import { Download, Mail } from 'lucide-react';
import { PublicNavbar } from '../../presentation/components/common/PublicNavbar';

export default function PortfolioError() {
  return (
    <>
      <PublicNavbar sections={[]} />
      <main id="portfolio-content" className="portfolio-main" tabIndex={-1}>
        <div className="portfolio-shell portfolio-status">
          <h1 className="portfolio-heading">El portafolio no está disponible</h1>
          <p className="portfolio-intro-copy">Puedes volver a intentarlo, descargar mi CV o escribirme directamente.</p>
          <div className="portfolio-actions">
            <button type="button" onClick={() => window.location.reload()} className="portfolio-button">Reintentar</button>
            <a className="portfolio-link" href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf">
              <Download size={18} aria-hidden="true" /> Descargar CV
            </a>
            <a className="portfolio-link" href="mailto:cristianchoacalo@gmail.com">
              <Mail size={18} aria-hidden="true" /> Escribirme
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
