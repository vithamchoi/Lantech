import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  streak: number;
  xp: number;
  lessonsCompleted: number;
  league: string;
  theme: 'light' | 'dark';
  incrementStreak: () => void;
  addXp: (amount: number) => void;
  completeLesson: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      streak: 7,
      xp: 2480,
      lessonsCompleted: 18,
      league: 'Sprout',
      theme: 'light',
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      completeLesson: () => set((state) => ({ lessonsCompleted: state.lessonsCompleted + 1 })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'lantech-app-storage',
    },
  ),
);
