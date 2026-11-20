import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../../domain/entities';
import { getPublicProject } from '../../../infrastructure/api/publicApi';
import { projectPath } from '../../utils/projectPath';
import { canOptimizeProjectImage } from '../../utils/projectImageOptimization';
import { publicHttpUrl } from '../../utils/publicHttpUrl';
import { ProjectPreview } from './ProjectPreview';
import { ProjectShowcase } from './ProjectShowcase';
import { getProjectChapters, ProjectLinks, ProjectTechnologies } from './ProjectContent';
import styles from './ProjectsSection.module.css';

export async function ProjectsSection({ projects }: { projects: Project[] }) {
  const published = projects.filter((project) => project.isPublished && !project.deletedAt);
  const featured = published.find((project) => project.isFeatured);
  const ordered = featured ? [featured, ...published.filter((project) => project.id !== featured.id)] : published;
  if (!ordered.length) return null;

  const entries = ordered.map((project) => ({
    project,
    imageUrl: publicHttpUrl(project.imageUrl),
    chapters: getProjectChapters(project.caseStudy, `proyecto-${project.id}-caso`),
  }));
  const candidate = entries.find(({ project, imageUrl, chapters }) =>
    imageUrl && (chapters.length > 1 || (project.caseStudy === undefined && project.hasCaseStudy)),
  );
  // The public list carries a flag, while the detail endpoint supplies the chapters.
  const detail = candidate && !candidate.chapters.length
    ? await getPublicProject(candidate.project.id).catch(() => null)
    : null;
  const showcaseChapters = detail
    ? getProjectChapters(detail.caseStudy, `proyecto-${detail.id}-caso`)
    : candidate?.chapters ?? [];
  const showcaseImage = detail ? publicHttpUrl(detail.imageUrl) : candidate?.imageUrl;
  const showcaseId = showcaseImage && showcaseChapters.length > 1 ? candidate?.project.id : undefined;

  return (
    <section id="proyectos" className="portfolio-section" aria-labelledby="projects-title" tabIndex={-1}>
      <div className="portfolio-shell portfolio-section-inner">
        <h2 id="projects-title" className="portfolio-heading">Proyectos</h2>
        {entries.map(({ project, imageUrl }) => {
          const isFeatured = project.id === featured?.id;
          const hasShowcase = project.id === showcaseId;

          return (
            <article
              key={project.id}
              id={`proyecto-${project.id}`}
              className={`portfolio-project ${styles.article}${hasShowcase ? ` ${styles.showcased}` : ''}`}
              tabIndex={-1}
              data-project-featured={isFeatured || undefined}
            >
              <header className="portfolio-project-header">
                {isFeatured && <p className={styles.featured}>Proyecto destacado</p>}
                <h3>{project.title}</h3>
                <div className="portfolio-actions">
                  <Link href={projectPath(project.id)} prefetch={false} className="portfolio-link" aria-label={`Ver proyecto: ${project.title}`}>
                    Ver proyecto <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                  <ProjectLinks project={project} />
                </div>
              </header>
              <div className="portfolio-project-details">
                {project.description?.trim() && <p>{project.description}</p>}
                <ProjectTechnologies skills={project.skills} />
              </div>
              {hasShowcase ? (
                <ProjectShowcase
                  key={showcaseImage}
                  imageUrl={showcaseImage}
                  chapters={showcaseChapters}
                  title={project.title}
                  headingLevel="h4"
                  compact
                />
              ) : imageUrl && (
                <ProjectPreview
                  key={imageUrl}
                  src={imageUrl}
                  title={project.title}
                  optimized={canOptimizeProjectImage(imageUrl)}
                  sizes="(min-width: 1240px) 38rem, (min-width: 900px) 51vw, 92vw"
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
