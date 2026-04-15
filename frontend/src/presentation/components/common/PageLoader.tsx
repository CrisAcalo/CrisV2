'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaLogo } from './CaLogo';

// ── Constants ──────────────────────────────────────────────────────────────
/** Total duration the loader is visible (ms). Progress bar fills over this. */
const LOAD_DURATION_MS = 2500;
/** Tick rate for the progress bar (ms) */
const TICK_MS = 50;

// ── Neon flicker keyframes ─────────────────────────────────────────────────
// Logo flicker — irregular, like a real neon tube
const neonOpacity = [1, 0.9, 1, 0.15, 1, 0.8, 1, 0.1, 1, 0.95, 1];
const neonTimes = [0, 0.04, 0.09, 0.13, 0.20, 0.42, 0.62, 0.66, 0.72, 0.86, 1];
// Text flicker — same pattern but starts at a different phase
const textNeonOpacity = [1, 0.8, 1, 0.1, 1, 0.9, 1, 0.2, 1, 0.85, 1];

export const PageLoader = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(0);
  const [neonColor, setNeonColor] = useState('#6366ff');
  const startRef = useRef<number | null>(null);

  // Read computed accent color at runtime (CSS vars don't work inside filter strings)
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();
    if (raw) setNeonColor(raw);
  }, []);

  // Animated ellipsis
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  // Progress bar — purely time-based
  useEffect(() => {
    startRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current!;
      const pct = Math.min((elapsed / LOAD_DURATION_MS) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => setVisible(false), 300);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // Tight neon: small radii so the glow follows the logo shape, not a round halo
  const neonFilter = [
    `drop-shadow(0 0 1px #625af8)`,
    `drop-shadow(0 0 4px ${neonColor})`,
    `drop-shadow(0 0 10px ${neonColor})`,
  ].join(' ');

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          {/* Aurora blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: ['0vw', '15vw', '0vw'], y: ['0vh', '-10vh', '0vh'], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
              style={{ background: 'var(--accent)', opacity: 0.2 }}
            />
            <motion.div
              animate={{ x: ['0vw', '-20vw', '0vw'], y: ['0vh', '15vh', '0vh'], scale: [1, 1.3, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl"
              style={{ background: 'hsl(280 80% 60%)', opacity: 0.15 }}
            />
          </div>

          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-8"
          >
            {/* Neon logo — flicker glow layer + steady base */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: neonOpacity }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', times: neonTimes }}
                style={{ filter: neonFilter }}
              >
                {/* Near-white core (not pure white) + tight neon glow */}
                <CaLogo size={72} color="#625af8" />
              </motion.div>
              <CaLogo size={72} />
            </div>

            {/* Brand: "Cristian" steady + "Acalo" neon flicker */}
            <div className="text-center">
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Cristian
                <motion.span
                  animate={{ opacity: textNeonOpacity }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', times: neonTimes }}
                  className="gradient-text"
                  style={{
                    display: 'inline-block',
                    filter: `drop-shadow(0 0 6px ${neonColor}) drop-shadow(0 0 14px ${neonColor})`,
                  }}
                >
                  Acalo
                </motion.span>
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', minWidth: '11ch', display: 'inline-block', textAlign: 'left' }}>
                {'Cargando' + '.'.repeat(dots)}
              </p>
            </div>

            {/* Progress bar */}
            <div
              className="w-48 h-[2px] rounded-full overflow-hidden"
              style={{ background: 'var(--surface-border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(to right, ${neonColor}, hsl(280 80% 65%))`,
                  transition: `width ${TICK_MS}ms linear`,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
