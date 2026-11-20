'use client';

import { useEffect, useRef, useState } from 'react';
import { canOptimizeProjectImage } from '../../utils/projectImageOptimization';
import { publicHttpUrl } from '../../utils/publicHttpUrl';
import { ProjectPreview } from './ProjectPreview';
import styles from './ProjectShowcase.module.css';

export type ProjectChapter = { id: string; title: string; text: string };

export function ProjectShowcase({
  chapters,
  imageUrl,
  title,
  headingLevel: Heading,
  compact = false,
}: {
  chapters: ProjectChapter[];
  imageUrl?: string | null;
  title: string;
  headingLevel: 'h2' | 'h4';
  compact?: boolean;
}) {
  const list = useRef<HTMLOListElement>(null);
  const figure = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const story = chapters.filter((chapter) => chapter.title.trim() && chapter.text.trim());
  const candidate = publicHttpUrl(imageUrl);
  const source = candidate === unavailable ? null : candidate;
  const guided = Boolean(source) && story.length > 1;
  const current = story[active] ?? story[0];

  useEffect(() => {
    const track = list.current;
    const panel = figure.current;
    if (!guided || !track || !panel) return;

    const pinned = window.matchMedia('(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)');
    let inView = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!pinned.matches || !inView) return;

      const steps = Array.from(track.children);
      const height = window.innerHeight;
      const scrollHeight = document.scrollingElement?.scrollHeight ?? height;
      const remaining = Math.max(0, scrollHeight - window.scrollY - height);
      const lastTop = steps.at(-1)?.getBoundingClientRect().top ?? height;
      // Keep the last chapter reachable even when the document cannot scroll further.
      const readingLine = Math.max(height * .54, Math.min(height * .86, lastTop - remaining + height * .1));
      let next = 0;

      for (const [index, step] of steps.entries()) {
        if (step.getBoundingClientRect().top > readingLine) break;
        next = index;
      }

      setActive(next);
    };

    const schedule = () => {
      if (pinned.matches && inView && !frame) frame = window.requestAnimationFrame(update);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    });
    const resize = new ResizeObserver((entries) => {
      if (entries.some(({ target }) => target === panel)) {
        panel.style.setProperty('--showcase-frame-height', `${panel.getBoundingClientRect().height}px`);
      }
      schedule();
    });
    intersection.observe(track);
    resize.observe(track);
    resize.observe(panel, { box: 'border-box' });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    pinned.addEventListener('change', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      pinned.removeEventListener('change', schedule);
    };
  }, [guided]);

  if (!source && !story.length) return null;

  return (
    <div className={styles.showcase} data-project-showcase data-guided={guided || undefined} data-compact={compact || undefined}>
      {source && (
        <figure ref={figure} className={styles.figure} data-showcase-frame>
          <ProjectPreview
            key={source}
            src={source}
            title={title}
            optimized={canOptimizeProjectImage(source)}
            sizes="(min-width: 1280px) 47rem, (min-width: 900px) 60vw, 92vw"
            onUnavailable={() => setUnavailable(source)}
          />
          {guided && current && (
            <figcaption className={styles.caption} aria-hidden="true">
              <span className={styles.progress}>
                {story.map(({ id }, index) => <span key={id} data-progress={index <= active || undefined} />)}
              </span>
              <span>{current.title}</span>
            </figcaption>
          )}
        </figure>
      )}

      {story.length > 0 && (
        <ol ref={list} className={styles.story} aria-label="Caso de estudio">
          {story.map((chapter) => (
            <li key={chapter.id} id={chapter.id} className={styles.chapter} data-current={guided && current?.id === chapter.id ? '' : undefined}>
              <Heading>{chapter.title}</Heading>
              <p>{chapter.text}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
