import apiClient from '../api/apiClient';

export interface AdminVocabularyTranslationRequest {
  languageCode: string;
  meaning: string;
  explanation?: string;
  exampleTranslation?: string;
}

export interface CreateVocabularyRequest {
  word: string;
  ipa?: string;
  audioUrl?: string;
  cefrLevel: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  contentSource?: string;
  translations: AdminVocabularyTranslationRequest[];
}

export interface VocabularyTranslationDto {
  id: string;
  vocabularyId: string;
  languageCode: string;
  meaning: string;
  explanation?: string;
  exampleTranslation?: string;
}

export interface VocabularyDto {
  id: string;
  word: string;
  ipa?: string;
  audioUrl?: string;
  cefrLevel: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  contentSource: string;
  createdAt: string;
  translations: VocabularyTranslationDto[];
}

export interface AdminStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalLessons: number;
  totalQuestions: number;
  totalBadges: number;
}

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  joined: string;
  role: string;
  status: string;
  xp: number;
}

export interface AdminLessonDto {
  id: string;
  title: string;
  level: string;
  exercises: number;
  students: number;
  order: number;
}

export interface AdminQuestionDto {
  id: string;
  text: string;
  skill: string;
  level: string;
  difficulty: string;
}

export interface AdminVocabularyDto {
  id: string;
  word: string;
  phoneme: string;
  level: string;
  definition: string;
  added: string;
}

export interface AdminBadgeDto {
  id: string;
  title: string;
  description: string;
  requiredXP: number;
  holders: number;
}

export const adminService = {
  getOverviewStats: async (): Promise<AdminStatsDto> => {
    return await apiClient.get('/admin/overview');
  },

  // Users
  getUsers: async (): Promise<AdminUserDto[]> => {
    return await apiClient.get('/admin/users');
  },
  updateUserRole: async (userId: string, role: string): Promise<void> => {
    return await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },
  updateUserStatus: async (userId: string, status: string): Promise<void> => {
    return await apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  // Lessons
  getLessons: async (): Promise<AdminLessonDto[]> => {
    return await apiClient.get('/admin/lessons');
  },

  // Questions
  getQuestions: async (): Promise<AdminQuestionDto[]> => {
    return await apiClient.get('/admin/questions');
  },

  // Vocabulary
  getVocabularies: async (): Promise<AdminVocabularyDto[]> => {
    return await apiClient.get('/admin/vocabulary');
  },
  createVocabulary: async (data: CreateVocabularyRequest): Promise<VocabularyDto> => {
    return await apiClient.post('/admin/vocabulary', data);
  },
  updateVocabulary: async (id: string, data: CreateVocabularyRequest): Promise<VocabularyDto> => {
    return await apiClient.put(`/admin/vocabulary/${id}`, data);
  },
  deleteVocabulary: async (id: string): Promise<void> => {
    return await apiClient.delete(`/admin/vocabulary/${id}`);
  },

  // Badges
  getBadges: async (): Promise<AdminBadgeDto[]> => {
    return await apiClient.get('/admin/badges');
  }
};
