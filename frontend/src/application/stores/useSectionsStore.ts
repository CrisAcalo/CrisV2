import { create } from 'zustand';

/**
 * Tracks which portfolio sections have data to show.
 * Set once by SectionsInitializer (server data → client store).
 * Read by PublicNavbar to conditionally render nav links.
 */
interface SectionsState {
  hasProjects: boolean;
  setHasProjects: (v: boolean) => void;
}

export const useSectionsStore = create<SectionsState>()((set) => ({
  hasProjects: true, // optimistic default — avoids link flashing out on load
  setHasProjects: (v) => set({ hasProjects: v }),
}));
