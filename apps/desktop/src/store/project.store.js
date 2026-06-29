import { create } from 'zustand';

const STORAGE_KEY = 'codeforge:projects';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(projects) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  fileTree: [],

    loadProjects: () => {
    if (typeof window === 'undefined') return; // Prevent SSR crash
    const stored = loadFromStorage();
    set({ projects: stored });
  },

  openProject: async (folderPath) => {
    const path = await import('path');
    const name = folderPath.split(/[/\\]/).pop() || folderPath;

    const project = { path: folderPath, name, openedAt: Date.now() };

    set({ currentProject: project });

    // Update recent projects list
    const { projects } = get();
    const filtered = projects.filter((p) => p.path !== folderPath);
    const updated = [project, ...filtered].slice(0, 10);
    set({ projects: updated });
    saveToStorage(updated);
  },

  closeProject: () => {
    set({ currentProject: null, fileTree: [] });
  },

  loadFileTree: async (dirPath) => {
    try {
      const tree = await window.codeforge.listFiles(dirPath, {
        maxDepth: 3,
        ignore: ['node_modules', '.git', 'dist', 'build', '.next', 'out'],
      });
      set({ fileTree: tree });
    } catch (err) {
      console.error('Failed to load file tree:', err);
      set({ fileTree: [] });
    }
  },
}));