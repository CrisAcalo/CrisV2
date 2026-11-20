import { ExternalLink, Github } from 'lucide-react';
import type { Project, ProjectCaseStudy, SkillRef } from '../../../domain/entities';
import { publicHttpUrl } from '../../utils/publicHttpUrl';
import { TechnologyIcon } from './TechnologyIcon';

const storyFields = [
  ['problem', 'El problema'],
  ['contribution', 'Mi aporte'],
  ['decision', 'Decisión técnica'],
  ['outcome', 'Resultado'],
] as const;

export function getProjectChapters(story?: ProjectCaseStudy | null, prefix = 'case') {
  return storyFields.flatMap(([field, title]) => {
    const text = story?.[field]?.trim();
    return text ? [{ id: `${prefix}-${field}`, title, text }] : [];
  });
}

export function ProjectLinks({ project }: { project: Pick<Project, 'repoUrl' | 'liveUrl' | 'title'> }) {
  const repo = publicHttpUrl(project.repoUrl);
  const live = publicHttpUrl(project.liveUrl);

  return (
    <>
      {repo && (
        <a href={repo} target="_blank" rel="noopener noreferrer" className="portfolio-link" aria-label={`Ver código de ${project.title}`}>
          <Github size={17} aria-hidden="true" /> Código
        </a>
      )}
      {live && (
        <a href={live} target="_blank" rel="noopener noreferrer" className="portfolio-link" aria-label={`Ver demo de ${project.title}`}>
          <ExternalLink size={17} aria-hidden="true" /> Demo
        </a>
      )}
    </>
  );
}

export function ProjectTechnologies({ skills }: { skills?: SkillRef[] }) {
  if (!skills?.length) return null;

  return (
    <ul className="portfolio-tech-list" aria-label="Tecnologías">
      {skills.map((skill) => (
        <li key={skill.id}>
          <TechnologyIcon name={skill.name} size={16} />
          {skill.name}
        </li>
      ))}
    </ul>
  );
}
