'use client';

import { useEffect, useRef, useState } from 'react';

// A single "star" flash on a grid point
interface StarPoint {
  id: number;
  x: number;  // in grid units (multiples of GRID_SIZE)
  y: number;
}

const GRID_SIZE = 40;
const MAX_STARS = 30;       // how many can be visible simultaneously
const SPAWN_INTERVAL = 200; // ms between spawns
const FLASHLIGHT_MASK = 'radial-gradient(350px circle at var(--flashlight-position, 0px 0px), black, transparent)';

export const InteractiveBackground = () => {
  const flashlight = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<StarPoint[]>([]);

  useEffect(() => {
    const mask = flashlight.current;
    if (!mask) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | undefined;
    let interval: number | undefined;
    let x = 0;
    let y = 0;
    let nextStarId = 0;

    const moveFlashlight = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      frame ??= window.requestAnimationFrame(() => {
        mask.style.setProperty('--flashlight-position', `${x}px ${y}px`);
        frame = undefined;
      });
    };

    const spawnStar = () => {
      const cols = Math.floor(window.innerWidth / GRID_SIZE);
      const rows = Math.floor(window.innerHeight / GRID_SIZE);
      const star = {
        id: nextStarId++,
        x: Math.floor(Math.random() * cols) * GRID_SIZE + GRID_SIZE / 2,
        y: Math.floor(Math.random() * rows) * GRID_SIZE + GRID_SIZE / 2,
      };
      setStars((previous) => [...previous.slice(-(MAX_STARS - 1)), star]);
    };

    const start = () => {
      window.addEventListener('mousemove', moveFlashlight, { passive: true });
      interval = window.setInterval(spawnStar, SPAWN_INTERVAL);
    };
    const stop = () => {
      window.removeEventListener('mousemove', moveFlashlight);
      window.clearInterval(interval);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      frame = undefined;
    };
    const shouldRun = () => !document.hidden && !preference.matches;
    const updateActivity = () => {
      stop();
      if (shouldRun()) {
        start();
      } else {
        setStars([]);
        if (preference.matches) mask.style.removeProperty('--flashlight-position');
      }
    };

    if (shouldRun()) start();
    document.addEventListener('visibilitychange', updateActivity);
    preference.addEventListener('change', updateActivity);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', updateActivity);
      preference.removeEventListener('change', updateActivity);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -10 }}>

      {/* 1. Base grid — always visible, very subtle */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: 'radial-gradient(var(--text-primary) 1.5px, transparent 1.5px)',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      {/* 2. Mouse linterna — reveals accent-coloured grid */}
      <div
        ref={flashlight}
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: 'radial-gradient(var(--accent) 2px, transparent 2px)',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          WebkitMaskImage: FLASHLIGHT_MASK,
          maskImage: FLASHLIGHT_MASK,
        }}
      />

      {/* 3. Star flashes — random grid points that blink like stars */}
      {stars.map(star => (
        <span
          key={star.id}
          className="absolute rounded-full"
          onAnimationEnd={() => setStars((previous) => previous.filter((point) => point.id !== star.id))}
          style={{
            left: star.x,
            top: star.y,
            width: 4,
            height: 4,
            transform: 'translate(-50%, -50%)',
            background: 'var(--accent)',
            boxShadow: '0 0 6px 2px var(--accent-glow)',
            animation: 'starFlash 1.8s ease-in-out forwards',
          }}
        />
      ))}
    </div>
  );
};
