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
  login: (role: UserRole, user: any, accessToken?: string, refreshToken?: string) => void;
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
      login: (role, user, accessToken, refreshToken) => {
        if (accessToken) localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        
        const email = typeof user === 'string' ? user : (user?.email || '');
        const name = typeof user === 'string' ? user.split('@')[0] : (user?.fullName || user?.name || email || 'User');
        
        const profile: UserProfile = {
          id: user?.id || '',
          name: name,
          email: email,
          avatar: user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
          xp: user?.xp || 0,
          streak: user?.streakCount || user?.streak || 0,
          cefr: user?.currentCefrLevel || user?.cefr || 'N/A',
          nativeLang: user?.sourceLanguageCode || user?.nativeLang || 'vi',
        };
        set({ role, user: profile });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
      partialize: (state) => ({ role: state.role, user: state.user }),
    }
  )
);
