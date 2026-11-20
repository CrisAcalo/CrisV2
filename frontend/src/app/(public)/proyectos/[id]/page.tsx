import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPublicProject } from '../../../../infrastructure/api/publicApi';
import { PublicNavbar } from '../../../../presentation/components/common/PublicNavbar';
import { getProjectChapters, ProjectLinks, ProjectTechnologies } from '../../../../presentation/components/public/ProjectContent';
import { ProjectShowcase } from '../../../../presentation/components/public/ProjectShowcase';
import { projectPath } from '../../../../presentation/utils/projectPath';
import { publicHttpUrl } from '../../../../presentation/utils/publicHttpUrl';
import styles from './ProjectDetail.module.css';

type ProjectPageProps = { params: Promise<{ id: string }> };

const sections = [
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'contacto', label: 'Contacto' },
];
export const revalidate = 300;

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublicProject(id);
  if (!project) return { title: 'Proyecto no disponible | Cristian Acalo', robots: { index: false } };

  const path = projectPath(project.id);
  const description = project.description?.replace(/\s+/g, ' ').trim().slice(0, 200) || undefined;
  const image = publicHttpUrl(project.imageUrl);
  const title = `${project.title} | Cristian Acalo`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Cristian Acalo Portfolio',
      locale: 'es_EC',
      type: 'website',
      images: image?.startsWith('https://') ? [{ url: image, alt: `Vista previa de ${project.title}` }] : ['/og-image.svg'],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getPublicProject(id);
  if (!project) notFound();

  const imageUrl = publicHttpUrl(project.imageUrl);
  const hasLinks = publicHttpUrl(project.repoUrl) || publicHttpUrl(project.liveUrl);
  const chapters = getProjectChapters(project.caseStudy);
  const hasShowcase = Boolean(imageUrl) && chapters.length > 1;

  return (
    <>
      <PublicNavbar sections={sections} homeLinks />
      <main id="portfolio-content" className="portfolio-main" tabIndex={-1}>
        <article className={`portfolio-shell ${styles.content}${hasShowcase ? ` ${styles.showcased}` : ''}`} aria-labelledby="project-title">
          <Link href={`/#proyecto-${project.id}`} className={`portfolio-link ${styles.back}`}>
            <ArrowLeft size={18} aria-hidden="true" /> Volver a proyectos
          </Link>
          <header>
            <h1 id="project-title" className={`portfolio-heading ${styles.title}`}>{project.title}</h1>
            {project.description?.trim() && <p className={styles.description}>{project.description}</p>}
            <ProjectTechnologies skills={project.skills} />
            {hasLinks && <div className={`portfolio-actions ${styles.links}`}><ProjectLinks project={project} /></div>}
          </header>

          <ProjectShowcase key={imageUrl ?? project.id} imageUrl={imageUrl} chapters={chapters} title={project.title} headingLevel="h2" />
        </article>
      </main>
    </>
  );
}
