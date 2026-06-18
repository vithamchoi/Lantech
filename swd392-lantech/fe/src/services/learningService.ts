import apiClient from '../api/apiClient';

export interface LessonDto {
  id: string;
  cefrLevel: string;
  title: string;
  description: string;
  skill: string;
  topic?: string;
  orderIndex: number;
  estimatedMinutes: number;
  xpReward: number;
  progressStatus: 'NotStarted' | 'InProgress' | 'Completed';
  userScore?: number;
}

export interface LearningPathDto {
  id: string;
  title: string;
  description: string;
  cefrLevel: string;
  weakSkills: string[];
  isActive: boolean;
}

export const learningService = {
  getActivePath: async (): Promise<LearningPathDto | null> => {
    return await apiClient.get('/learningpaths/active');
  },

  getRecommendedLessons: async (): Promise<LessonDto[]> => {
    const data = await apiClient.get('/learningpaths/recommended');
    return data || [];
  }
};
