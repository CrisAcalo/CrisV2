'use client';

import { useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import styles from './SkillsAssembly.module.css';

export function SkillsAssembly({ children }: { children: ReactNode }) {
  const group = useRef<HTMLDivElement>(null);
  const entered = useInView(group, { margin: '-80px 0px -64px 0px' });

  return (
    <div ref={group} className={styles.assembly} data-entered={entered || undefined}>
      {children}
    </div>
  );
}
