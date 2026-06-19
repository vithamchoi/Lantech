import apiClient from '../api/apiClient';

export interface CreateLessonRequest {
  cefrLevel: string;
  title: string;
  description: string;
  skill: string;
  topic?: string;
  contentSource?: string;
  orderIndex: number;
  estimatedMinutes?: number;
  xpReward?: number;
  isPublished?: boolean;
}

export interface CreateExerciseRequest {
  lessonId: string;
  type: string;
  prompt: string;
  instruction?: string;
  sourceLanguageCode?: string;
  targetText?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: number;
  xpReward?: number;
  orderIndex: number;
}

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
  code: string;
  title: string;
  description: string;
  iconUrl?: string;
  conditionType: string;
  conditionValue: number;
  requiredXP: number;
  holders: number;
}

export interface AdminPronunciationPhraseDto {
  id?: string;
  text: string;
  phonetic: string;
  category: string;
  tags: string[];
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
  updateUser: async (userId: string, data: { username: string; email: string; xp: number }): Promise<void> => {
    return await apiClient.put(`/admin/users/${userId}`, data);
  },
  deleteUser: async (userId: string): Promise<void> => {
    return await apiClient.delete(`/admin/users/${userId}`);
  },

  // Lessons
  getLessons: async (): Promise<AdminLessonDto[]> => {
    return await apiClient.get('/admin/lessons');
  },
  createLesson: async (dto: CreateLessonRequest): Promise<any> => {
    return await apiClient.post('/admin/lessons', dto);
  },
  updateLesson: async (id: string, dto: CreateLessonRequest): Promise<any> => {
    return await apiClient.put(`/admin/lessons/${id}`, dto);
  },
  deleteLesson: async (id: string): Promise<void> => {
    return await apiClient.delete(`/admin/lessons/${id}`);
  },

  // Questions
  getQuestions: async (): Promise<AdminQuestionDto[]> => {
    return await apiClient.get('/admin/questions');
  },
  createQuestion: async (dto: CreateExerciseRequest): Promise<any> => {
    return await apiClient.post('/admin/questions', dto);
  },
  updateQuestion: async (id: string, dto: CreateExerciseRequest): Promise<any> => {
    return await apiClient.put(`/admin/questions/${id}`, dto);
  },
  deleteQuestion: async (id: string): Promise<void> => {
    return await apiClient.delete(`/admin/questions/${id}`);
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
  },
  createBadge: async (data: { code: string; name: string; description: string; iconUrl?: string; conditionType: string; conditionValue: number }): Promise<AdminBadgeDto> => {
    return await apiClient.post('/admin/badges', data);
  },
  updateBadge: async (id: string, data: { code: string; name: string; description: string; iconUrl?: string; conditionType: string; conditionValue: number }): Promise<AdminBadgeDto> => {
    return await apiClient.put(`/admin/badges/${id}`, data);
  },
  deleteBadge: async (id: string): Promise<void> => {
    return await apiClient.delete(`/admin/badges/${id}`);
  },

  // Pronunciation Phrases
  getPronunciationPhrases: async (): Promise<AdminPronunciationPhraseDto[]> => {
    return await apiClient.get('/pronunciation/phrases');
  },
  createPronunciationPhrase: async (dto: AdminPronunciationPhraseDto): Promise<AdminPronunciationPhraseDto> => {
    return await apiClient.post('/pronunciation/phrases', dto);
  },
  updatePronunciationPhrase: async (id: string, dto: AdminPronunciationPhraseDto): Promise<AdminPronunciationPhraseDto> => {
    return await apiClient.put(`/pronunciation/phrases/${id}`, dto);
  },
  deletePronunciationPhrase: async (id: string): Promise<void> => {
    return await apiClient.delete(`/pronunciation/phrases/${id}`);
  }
};
