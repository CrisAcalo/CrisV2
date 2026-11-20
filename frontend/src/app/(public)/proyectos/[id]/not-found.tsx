import Link from 'next/link';
import { PublicNavbar } from '../../../../presentation/components/common/PublicNavbar';
import styles from './ProjectDetail.module.css';

export default function ProjectNotFound() {
  return (
    <>
      <PublicNavbar sections={[{ id: 'proyectos', label: 'Proyectos' }, { id: 'contacto', label: 'Contacto' }]} homeLinks />
      <main id="portfolio-content" className="portfolio-main" tabIndex={-1}>
        <div className={`portfolio-shell ${styles.content}`}>
          <h1 className={`portfolio-heading ${styles.title}`}>Proyecto no disponible</h1>
          <p className={styles.description}>Puedes explorar los proyectos que están publicados en el portafolio.</p>
          <div className={`portfolio-actions ${styles.links}`}>
            <Link href="/#proyectos" className="portfolio-button">Ver proyectos</Link>
            <Link href="/#contacto" className="portfolio-link">Contacto</Link>
          </div>
        </div>
      </main>
    </>
  );
}
