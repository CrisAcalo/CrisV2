import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { Project, Skill } from '../../../domain/entities';
import { projectPath } from '../../utils/projectPath';
import { resolveTechnologyCategory, technologyCategories, TechnologyIcon, type TechnologyCategoryId } from './TechnologyIcon';
import { SkillsAssembly } from './SkillsAssembly';
import styles from './SkillsSection.module.css';

type ProjectLink = Pick<Project, 'id' | 'title'>;

const skillNames = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

function SkillItem({ skill, links }: { skill: Skill; links?: ProjectLink[] }) {
  const label = (
    <>
      <span className={styles.iconFrame}>
        <TechnologyIcon name={skill.name} size={23} />
      </span>
      <span className={styles.itemText}>
        <span className={styles.name}>{skill.name}</span>
        {!!links?.length && (
          <span className={styles.projectCount}>
            {links.length} {links.length === 1 ? 'proyecto' : 'proyectos'}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li className={styles.item}>
      {links?.length ? (
        <details className={styles.details}>
          <summary className={styles.itemRow}>
            {label}
            <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
          </summary>
          <ul className={styles.projectList} role="list">
            {links.map(({ id, title }) => (
              <li key={id}>
                <Link href={projectPath(id)} prefetch={false} className={`portfolio-link ${styles.projectLink}`}>
                  {title} <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : <div className={styles.itemRow}>{label}</div>}
    </li>
  );
}

export function SkillsSection({ skills, projects }: { skills: Skill[]; projects?: Project[] }) {
  const groups = new Map<TechnologyCategoryId, Skill[]>();
  for (const skill of skills) {
    if (!skill.isPublic || skill.deletedAt) continue;
    const category = resolveTechnologyCategory(skill.name);
    const group = groups.get(category) ?? [];
    group.push(skill);
    groups.set(category, group);
  }

  if (!groups.size) return null;

  const linksBySkill = new Map<string, ProjectLink[]>();
  for (const project of projects ?? []) {
    if (!project.isPublished || project.deletedAt) continue;
    for (const skill of project.skills ?? []) {
      const links = linksBySkill.get(skill.id) ?? [];
      links.push({ id: project.id, title: project.title });
      linksBySkill.set(skill.id, links);
    }
  }

  return (
    <section id="skills" className="portfolio-section" aria-labelledby="skills-title" tabIndex={-1}>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[var(--accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="portfolio-shell portfolio-section-inner">
        <h2 id="skills-title" className="portfolio-heading">Tecnologías</h2>
        <div className={styles.catalogue}>
          {technologyCategories.map(({ id, label }) => {
            const group = groups.get(id);
            if (!group) return null;

            return (
              <SkillsAssembly key={id}>
                <h3 className={styles.groupTitle}>{label}</h3>
                <ul className={styles.list} role="list">
                  {group.sort((first, second) => skillNames.compare(first.name, second.name)).map((skill) => (
                    <SkillItem key={skill.id} skill={skill} links={projects ? linksBySkill.get(skill.id) : skill.projects} />
                  ))}
                </ul>
              </SkillsAssembly>
            );
          })}
        </div>
      </div>
    </section>
  );
}
