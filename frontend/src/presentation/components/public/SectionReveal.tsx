'use client';

import { motion, useMotionValue, useMotionValueEvent, useScroll, type MotionStyle } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './SectionReveal.module.css';

type SectionRevealProps = {
  className?: string;
  trackHeight?: boolean;
  children: ReactNode;
};

export function SectionReveal({ className, trackHeight = false, children }: SectionRevealProps) {
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: trackHeight ? ['start 96%', 'end 88%'] : ['start 98%', 'start 34%'],
  });
  const progress = useMotionValue(1);
  useMotionValueEvent(scrollYProgress, 'change', (value) => progress.set(value));

  useEffect(() => {
    const frame = requestAnimationFrame(() => progress.set(scrollYProgress.get()));
    return () => cancelAnimationFrame(frame);
  }, [progress, scrollYProgress]);

  const style: MotionStyle & { '--section-scroll-progress': typeof progress } = {
    '--section-scroll-progress': progress,
  };

  return (
    <motion.div
      ref={target}
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      style={style}
      data-section-scroll
    >
      {children}
    </motion.div>
  );
}
