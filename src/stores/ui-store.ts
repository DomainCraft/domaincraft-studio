import { create } from 'zustand';

interface UIState {
  viewMode: 'graph' | 'code' | 'split';
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  activeTab: 'entities' | 'enums' | 'settings';
  darkMode: boolean;
  setViewMode: (mode: 'graph' | 'code' | 'split') => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setActiveTab: (tab: 'entities' | 'enums' | 'settings') => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'graph',
  leftPanelOpen: true,
  rightPanelOpen: true,
  activeTab: 'entities',
  darkMode: true,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
