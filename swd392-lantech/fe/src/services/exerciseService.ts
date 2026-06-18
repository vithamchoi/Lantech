import apiClient from '../api/apiClient';

export interface ExerciseDto {
  id: string;
  lessonId: string;
  type: string;
  prompt: string;
  instruction?: string;
  sourceLanguageCode?: string;
  targetText?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: number;
  xpReward: number;
  orderIndex: number;
  isAiGenerated: boolean;
}

export interface ExerciseAttemptDto {
  id: string;
  userId: string;
  exerciseId: string;
  answer: string;
  isCorrect: boolean;
  score: number;
  feedback?: string;
  createdAt: string;
}

export const exerciseService = {
  getExercisesByLesson: async (lessonId: string): Promise<ExerciseDto[]> => {
    return await apiClient.get(`/exercises/lesson/${lessonId}`);
  },

  getExerciseById: async (id: string): Promise<ExerciseDto> => {
    return await apiClient.get(`/exercises/${id}`);
  },

  submitExercise: async (id: string, answer: string): Promise<ExerciseAttemptDto> => {
    return await apiClient.post(`/exercises/${id}/submit`, { answer });
  }
};
