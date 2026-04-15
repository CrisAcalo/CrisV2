'use client';

import { useEffect, useState, useCallback } from 'react';

// A single "star" flash on a grid point
interface StarPoint {
  id: number;
  x: number;  // in grid units (multiples of GRID_SIZE)
  y: number;
}

const GRID_SIZE = 40;
const MAX_STARS = 30;       // how many can be visible simultaneously
const SPAWN_INTERVAL = 200; // ms between spawns

let _id = 0;

export const InteractiveBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<StarPoint[]>([]);

  // Track mouse for the linterna effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spawn random star on a grid point
  const spawnStar = useCallback(() => {
    const cols = Math.floor(window.innerWidth / GRID_SIZE);
    const rows = Math.floor(window.innerHeight / GRID_SIZE);
    const x = Math.floor(Math.random() * cols) * GRID_SIZE + GRID_SIZE / 2;
    const y = Math.floor(Math.random() * rows) * GRID_SIZE + GRID_SIZE / 2;
    const id = ++_id;

    setStars(prev => [...prev.slice(-(MAX_STARS - 1)), { id, x, y }]);

    // Remove the star after its animation completes (1.8s)
    setTimeout(() => {
      setStars(prev => prev.filter(s => s.id !== id));
    }, 1800);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnStar, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [spawnStar]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -10 }}>

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
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: 'radial-gradient(var(--accent) 2px, transparent 2px)',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          WebkitMaskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          maskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
        }}
      />

      {/* 3. Star flashes — random grid points that blink like stars */}
      {stars.map(star => (
        <span
          key={star.id}
          className="absolute rounded-full"
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
