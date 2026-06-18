import apiClient from '../api/apiClient';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
  currentCefrLevel?: string;
  xp: number;
  streakCount: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return await apiClient.post('/auth/login', { email, password });
  },

  register: async (email: string, password: string, fullName: string, sourceLanguageCode: string = 'vi'): Promise<AuthResponse> => {
    return await apiClient.post('/auth/register', { 
      email, 
      password, 
      fullName, 
      sourceLanguageCode 
    });
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    return await apiClient.post('/auth/google', { token: idToken });
  },

  getMe: async (): Promise<UserDto> => {
    return await apiClient.get('/auth/me');
  }
};
