'use client';

import { useEffect } from 'react';
import { useSectionsStore } from '../../../application/stores/useSectionsStore';

interface Props {
  hasProjects: boolean;
}

/**
 * Bridge between server-rendered data and client Zustand store.
 * Renders nothing — just syncs the server's knowledge (which sections
 * have data) into the store so PublicNavbar can react.
 */
export const SectionsInitializer = ({ hasProjects }: Props) => {
  const setHasProjects = useSectionsStore(s => s.setHasProjects);

  useEffect(() => {
    setHasProjects(hasProjects);
  }, [hasProjects, setHasProjects]);

  return null;
};
