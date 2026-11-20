'use client';

import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion';
import { Download } from 'lucide-react';
import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './HeroAurora.module.css';

const auroraLights = [
  {
    className: 'w-[12vw] h-[12vw] min-w-[150px] min-h-[150px] bg-[var(--portfolio-neon)] top-[10%] left-[10%]',
    from: ['0vw', '0vh', 1], to: ['30vw', '-20vh', 1.3], duration: 12,
  },
  {
    className: 'w-[15vw] h-[15vw] min-w-[180px] min-h-[180px] bg-[var(--portfolio-aurora-blue)] top-[20%] right-[10%]',
    from: ['0vw', '0vh', 1], to: ['-40vw', '30vh', 1.4], duration: 15,
  },
  {
    className: 'w-[10vw] h-[10vw] min-w-[120px] min-h-[120px] bg-[var(--portfolio-action)] bottom-[20%] left-[30%]',
    from: ['20vw', '-20vh', 1.2], to: ['-10vw', '30vh', 1], duration: 10,
  },
  {
    className: 'w-[14vw] h-[14vw] min-w-[160px] min-h-[160px] bg-[var(--portfolio-aurora-blue)] top-[40%] right-[30%]',
    from: ['-20vw', '10vh', 1], to: ['30vw', '-40vh', 1.3], duration: 18,
  },
  {
    className: 'w-[11vw] h-[11vw] min-w-[130px] min-h-[130px] bg-[var(--portfolio-neon)] bottom-[10%] right-[20%]',
    from: ['0vw', '0vh', 1.1], to: ['30vw', '30vh', 1.4], duration: 14,
  },
  {
    className: 'w-[13vw] h-[13vw] min-w-[150px] min-h-[150px] bg-[var(--portfolio-aurora-blue)] top-[60%] left-[10%]',
    from: ['-30vw', '-30vh', 1], to: ['10vw', '10vh', 1.5], duration: 16,
  },
  {
    className: 'w-[10vw] h-[10vw] min-w-[120px] min-h-[120px] bg-[var(--portfolio-neon)] top-[5%] left-[50%]',
    from: ['30vw', '0vh', 1.3], to: ['-20vw', '20vh', 1], duration: 19,
  },
  {
    className: 'w-[12vw] h-[12vw] min-w-[140px] min-h-[140px] bg-[var(--portfolio-aurora-blue)] bottom-[30%] right-[40%]',
    from: ['-15vw', '-20vh', 1], to: ['25vw', '20vh', 1.2], duration: 13,
  },
] as const;

export const HeroSection = ({ hasProjects }: { hasProjects: boolean }) => {
  const hero = useRef<HTMLElement>(null);
  const aurora = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ['start 80px', 'start -100px'],
  });
  const reveal = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.76, 1]);
  const revealStyle: MotionStyle & { '--portfolio-hero-reveal': typeof reveal } = {
    '--portfolio-hero-reveal': reveal,
  };

  useEffect(() => {
    const section = hero.current;
    const layer = aurora.current;
    if (!section || !layer) return;

    let inView = false;
    const update = () => layer.toggleAttribute('data-aurora-playing', inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(section);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      layer.removeAttribute('data-aurora-playing');
    };
  }, []);

  return (
    <section ref={hero} className="portfolio-hero" aria-labelledby="portfolio-name">
      <div ref={aurora} aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {auroraLights.map(({ className, from, to, duration }) => (
          <div
            key={duration}
            className={`${styles.light} absolute rounded-full blur-3xl opacity-20 ${className}`}
            style={{
              '--aurora-start': `translate(${from[0]}, ${from[1]}) scale(${from[2]})`,
              '--aurora-middle': `translate(${to[0]}, ${to[1]}) scale(${to[2]})`,
              '--aurora-duration': `${duration}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <motion.div className="portfolio-shell portfolio-hero-grid" style={revealStyle}>
        <h1 id="portfolio-name" className="portfolio-name">
          <span>Cristian</span>{' '}
          <span className="portfolio-name-accent">Acalo</span>
        </h1>

        <div className="portfolio-hero-intro">
          <p className="portfolio-role">Desarrollador de software</p>
          <p className="portfolio-intro-copy">
            Desarrollo aplicaciones full stack para operaciones reales, desde sistemas financieros hasta plataformas CRM.
            Automatizo procesos e integro modelos de lenguaje donde aportan valor. Trabajo con contenedores y pruebas E2E
            para que el software sea fiable al desplegarlo.
          </p>
          <div className="portfolio-actions">
            <a className="portfolio-button" href={hasProjects ? '#proyectos' : '#contacto'}>
              {hasProjects ? 'Ver proyectos' : 'Contactarme'}
            </a>
            <a className="portfolio-link" href="/cv-cristian-acalo.pdf" download="CV_Cristian_Acalo.pdf">
              <Download aria-hidden="true" size={18} /> Descargar CV
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
