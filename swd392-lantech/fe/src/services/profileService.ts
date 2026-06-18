import apiClient from '../api/apiClient';

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

export const profileService = {
  updateProfile: async (request: UpdateProfileRequest): Promise<any> => {
    return await apiClient.put('/profile/update', request);
  },

  getStreakCalendar: async (): Promise<{ date: string; studied: boolean }[]> => {
    return await apiClient.get('/profile/streak-calendar');
  }
};
