'use client';

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './TimelineScroll.module.css';

type Period = { group: string; year: string | null; target?: string };
type YearGroup = { title: string; years: { year: string; anchor: string }[] };

const yearMotion = {
  enter: (direction: number) => ({ y: direction * 92, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction * -68, opacity: 0 }),
};

export function TimelineScroll({ periods, yearGroups, children }: { periods: Period[]; yearGroups: YearGroup[]; children: ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLLIElement[]>([]);
  const activeRow = useRef(0);
  const reducedMotion = useRef<MediaQueryList | null>(null);
  const reduceIndexMotion = useReducedMotion();
  const yearMarker = useId();
  const [active, setActive] = useState({ index: 0, direction: 1 });
  const { scrollYProgress } = useScroll({
    target: body,
    offset: ['start 42%', 'end 42%'],
  });
  const railProgress = useSpring(0, { stiffness: 200, damping: 30, mass: .9 });

  const updatePeriod = useCallback((sync = false) => {
    if (rows.current.length === 0) return;

    const readingLine = window.innerHeight * .42;
    let start = 0;
    let end = rows.current.length;
    // Keep the last row that crossed the reading line, including between groups.
    while (start < end) {
      const middle = Math.floor((start + end) / 2);
      if (rows.current[middle].getBoundingClientRect().top <= readingLine) {
        start = middle + 1;
      } else {
        end = middle;
      }
    }

    const index = Math.max(0, start - 1);
    const previous = activeRow.current;
    if (index === previous && !sync) return;

    const row = rows.current[index];
    if (!reducedMotion.current?.matches) {
      const marker = row.querySelector('[data-timeline-marker]')?.getBoundingClientRect();
      const rail = track.current?.getBoundingClientRect();
      if (marker && rail?.height) {
        const progress = (marker.top + marker.height / 2 - rail.top) / rail.height;
        if (sync) railProgress.jump(progress);
        else railProgress.set(progress);
      }
    }

    if (index !== previous) {
      rows.current[previous]?.removeAttribute('data-timeline-current');
      row.setAttribute('data-timeline-current', '');
      activeRow.current = index;
      setActive({ index, direction: index > previous ? 1 : -1 });
    }
  }, [railProgress]);

  // Motion clamps progress outside the timeline, so scrolling elsewhere needs no row reads.
  useMotionValueEvent(scrollYProgress, 'change', () => updatePeriod());

  useEffect(() => {
    const list = body.current;
    const rail = track.current;
    if (!list || !rail) return;

    const entries = [...list.querySelectorAll<HTMLLIElement>('[data-timeline-entry]')];
    const divider = list.querySelector('[data-timeline-divider]');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    rows.current = entries;
    reducedMotion.current = preference;
    entries[activeRow.current]?.setAttribute('data-timeline-current', '');
    rail.toggleAttribute('data-timeline-separated', Boolean(divider));
    const syncPeriod = () => {
      if (divider) {
        const offset = divider.getBoundingClientRect().top - rail.getBoundingClientRect().top;
        rail.style.setProperty('--timeline-break', `${offset}px`);
      }
      updatePeriod(true);
    };
    const initialUpdate = window.requestAnimationFrame(syncPeriod);

    const resize = new ResizeObserver(syncPeriod);
    resize.observe(list);
    window.addEventListener('resize', syncPeriod);
    preference.addEventListener('change', syncPeriod);

    return () => {
      entries[activeRow.current]?.removeAttribute('data-timeline-current');
      rows.current = [];
      window.cancelAnimationFrame(initialUpdate);
      resize.disconnect();
      window.removeEventListener('resize', syncPeriod);
      preference.removeEventListener('change', syncPeriod);
    };
  }, [periods, updatePeriod]);

  const period = periods[active.index] ?? periods[0];
  const showYearIndex = yearGroups.length > 1 || (yearGroups[0]?.years.length ?? 0) > 1;

  return (
    <div className={styles.timeline} data-timeline-scroll>
      <div className={styles.side}>
        <div className={styles.sidePanel}>
          <div className={styles.period} aria-hidden="true">
            <div className={styles.yearFrame} data-timeline-period={period.year ?? ''}>
              <AnimatePresence initial={false} custom={active.direction}>
                <motion.span
                  key={period.year ?? 'unknown-year'}
                  className={styles.year}
                  custom={active.direction}
                  variants={yearMotion}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: .33, ease: [.22, 1, .36, 1] }}
                >
                  {period.year ?? '—'}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          {showYearIndex && (
            <motion.nav className={styles.yearIndex} aria-label="Ir a un año de Trayectoria" layoutScroll>
              <p className={styles.indexLabel}>Ir a un año</p>
              {yearGroups.map(({ title, years }) => (
                <div className={styles.indexGroup} key={title} data-current={title === period.group || undefined}>
                  <span className={styles.indexGroupLabel}>{title}</span>
                  <ul className={styles.indexYears}>
                    {years.map(({ year, anchor }) => (
                      <li key={anchor}>
                        <a
                          className={styles.indexLink}
                          href={`#${anchor}`}
                          aria-label={`${title}, ${year}`}
                          aria-current={anchor === period.target ? 'location' : undefined}
                        >
                          {anchor === period.target && (
                            <motion.span
                              className={styles.indexMarker}
                              layoutId={reduceIndexMotion ? undefined : yearMarker}
                              transition={{ layout: { duration: .24, ease: [0.23, 1, 0.32, 1] } }}
                              aria-hidden="true"
                              data-timeline-year-marker
                            />
                          )}
                          {year}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.nav>
          )}
        </div>
      </div>
      <div className={styles.body} ref={body}>
        <div className={styles.track} ref={track} aria-hidden="true">
          <motion.div className={styles.fill} style={{ scaleY: railProgress }} data-timeline-progress />
        </div>
        {children}
      </div>
    </div>
  );
}
