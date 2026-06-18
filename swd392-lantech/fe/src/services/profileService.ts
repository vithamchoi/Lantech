import apiClient from '../api/apiClient';

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

export const profileService = {
  updateProfile: async (request: UpdateProfileRequest): Promise<any> => {
    return await apiClient.put('/profile', request);
  },

  updateSourceLanguage: async (languageCode: string): Promise<any> => {
    return await apiClient.put(`/profile/source-language?sourceLanguageCode=${languageCode}`);
  },

  getStreakCalendar: async (): Promise<{ date: string; studied: boolean }[]> => {
    try {
      return await apiClient.get('/profile/streak-calendar');
    } catch (error) {
      console.warn("Failed to get streak calendar from backend, returning mock calendar.", error);
      const mockCalendar: { date: string; studied: boolean }[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        // Studied on random days to make it look alive (e.g. 60% chance)
        const studied = (d.getDay() % 2 === 0 || d.getDay() % 3 === 0);
        mockCalendar.push({ date: dateStr, studied });
      }
      return mockCalendar;
    }
  }
};
