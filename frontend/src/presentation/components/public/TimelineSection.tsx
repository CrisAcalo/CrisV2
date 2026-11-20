import { ChevronDown } from 'lucide-react';
import type { Education, Experience, SkillRef } from '../../../domain/entities';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { TechnologyIcon } from './TechnologyIcon';
import { TimelineScroll } from './TimelineScroll';
import styles from './TimelineScroll.module.css';

type TimelineEntry = {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  skills?: SkillRef[];
  anchorId?: string;
};

const sentenceSegmenter = new Intl.Segmenter('es', { granularity: 'sentence' });
const excerptLimit = 280;

function splitDescription(text: string) {
  if (text.length <= 320) return { excerpt: text, remainder: '' };

  const preview = text.slice(0, excerptLimit);
  let naturalEnd = preview.lastIndexOf('\n');
  for (const { index, segment } of sentenceSegmenter.segment(text)) {
    const end = index + segment.trimEnd().length;
    if (end > excerptLimit) break;
    naturalEnd = Math.max(naturalEnd, end);
  }

  const wordEnd = preview.match(/\s+\S*$/u)?.index ?? 0;
  let cutoff = /[\uD800-\uDBFF]$/u.test(preview) ? excerptLimit - 1 : excerptLimit;
  if (naturalEnd >= 90) cutoff = naturalEnd;
  else if (wordEnd >= 200) cutoff = wordEnd;

  return { excerpt: text.slice(0, cutoff).trimEnd(), remainder: text.slice(cutoff).trimStart() };
}

function TimelineDescription({ description, title }: { description: string; title: string }) {
  const { excerpt, remainder } = splitDescription(description);

  return (
    <div className={styles.entryBody}>
      <p className={styles.entryCopy}>
        {excerpt}
        {remainder && !/[.!?…]$/u.test(excerpt) && <span className={styles.entryEllipsis} aria-hidden="true">…</span>}
      </p>
      {remainder && (
        <details className={styles.entryDisclosure}>
          <summary>
            <span className={styles.readMore}>Leer más</span>
            <span className={styles.readLess}>Leer menos</span>
            <span className="sr-only"> sobre {title}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <p className={styles.entryRemainder}>{remainder}</p>
        </details>
      )}
    </div>
  );
}

function TimelineGroup({ title, entries, separated }: { title: string; entries: TimelineEntry[]; separated: boolean }) {
  return (
    <div className={`portfolio-timeline-group ${styles.group}`} data-timeline-divider={separated || undefined}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className="portfolio-entries">
        {entries.map((entry) => {
          const description = entry.description?.trim();
          return (
            <li
              className={`portfolio-timeline-entry ${styles.entry}`}
              key={entry.id}
              id={entry.anchorId}
              tabIndex={entry.anchorId ? -1 : undefined}
              data-timeline-entry
            >
              <span className={styles.marker} aria-hidden="true" data-timeline-marker />
              <header className={styles.entryHeader}>
                <div className={styles.entryIdentity}>
                  <h4 className={styles.entryTitle}>{entry.title}</h4>
                  <p className="portfolio-organization">{entry.organization}</p>
                </div>
                <p className={`portfolio-date ${styles.date}`}>
                  {formatFriendlyDate(entry.startDate, 'UTC')} – {formatFriendlyDate(entry.endDate, 'UTC')}
                </p>
              </header>
              {description && <TimelineDescription description={description} title={entry.title} />}
              {!!entry.skills?.length && (
                <ul className={`portfolio-tech-list ${styles.entrySkills}`} aria-label="Tecnologías">
                  {entry.skills.map((skill) => (
                    <li key={skill.id}><TechnologyIcon name={skill.name} size={16} />{skill.name}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TimelineSection({ experiences, educations }: { experiences: Experience[]; educations: Education[] }) {
  const groups = [
    {
      id: 'experiencia',
      title: 'Experiencia',
      entries: experiences.map((entry) => ({ ...entry, title: entry.role, organization: entry.company })),
    },
    {
      id: 'educacion',
      title: 'Educación',
      entries: educations.map((entry) => ({ ...entry, title: entry.degree, organization: entry.institution })),
    },
  ].filter((group) => group.entries.length > 0);

  if (!groups.length) return null;

  const indexedGroups = groups.map(({ id, title, entries }) => {
    const years = new Map<string, string>();
    const indexedEntries = entries.map((entry) => {
      const startYear = new Date(entry.startDate).getUTCFullYear();
      const year = Number.isFinite(startYear) ? String(startYear) : null;
      const target = year ? `trayectoria-${id}-${year}` : undefined;
      const anchorId = year && !years.has(year) ? target : undefined;
      if (year && anchorId) years.set(year, anchorId);
      return { ...entry, year, target, anchorId };
    });
    return { title, entries: indexedEntries, years: Array.from(years, ([year, anchor]) => ({ year, anchor })) };
  });
  const periods = indexedGroups.flatMap(({ title, entries }) => entries.map(({ year, target }) => ({ group: title, year, target })));
  const yearGroups = indexedGroups.filter(({ years }) => years.length).map(({ title, years }) => ({ title, years }));

  return (
    <section id="experiencia" className="portfolio-section" aria-labelledby="timeline-title" tabIndex={-1}>
      <div className="portfolio-shell portfolio-section-inner">
        <h2 id="timeline-title" className="portfolio-heading">Trayectoria</h2>
        <TimelineScroll periods={periods} yearGroups={yearGroups}>
          {indexedGroups.map(({ title, entries }, index) => (
            <TimelineGroup key={title} title={title} entries={entries} separated={index > 0} />
          ))}
        </TimelineScroll>
      </div>
    </section>
  );
}
