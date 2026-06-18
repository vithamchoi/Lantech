import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'Visitor' | 'Student' | 'Admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  streak: number;
  cefr: string;
  nativeLang: string;
}

interface AppState {
  role: UserRole;
  user: UserProfile | null;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile | null) => void;
  login: (role: UserRole, user: any, token: string) => void;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: 'Visitor',
      user: null,
      darkMode: localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
      setRole: (role) => set({ role }),
      setUser: (user) => set({ user }),
      login: (role, user, token) => {
        localStorage.setItem('access_token', token);
        const profile: UserProfile = {
          id: user.id,
          name: user.fullName,
          email: user.email,
          avatar: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.fullName}`,
          xp: user.xp,
          streak: user.streakCount,
          cefr: user.currentCefrLevel || 'N/A',
          nativeLang: user.sourceLanguageCode,
        };
        set({ role, user: profile });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        set({ role: 'Visitor', user: null });
      },
      toggleDarkMode: () => {
        const isDark = !get().darkMode;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        set({ darkMode: isDark });
      },
    }),
    {
      name: 'lantech-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ role: state.role, user: state.user, darkMode: state.darkMode }),
    }
  )
);
