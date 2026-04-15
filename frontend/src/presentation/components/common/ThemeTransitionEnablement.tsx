'use client';

import { useEffect } from 'react';

/**
 * Adds `.theme-ready` to <html> after the first paint.
 * This gates the global CSS transition rule so it doesn't
 * fire on the initial page load (which would cause a flash),
 * but it IS active for every subsequent theme switch.
 */
export const ThemeTransitionEnablement = () => {
  useEffect(() => {
    // requestAnimationFrame ensures we wait for the first paint
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
};
