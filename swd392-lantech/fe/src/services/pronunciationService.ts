import apiClient from '../api/apiClient';

export interface PronunciationAttemptRequest {
  targetText: string;
  transcriptText: string;
  audioUrl?: string;
}

export interface WordFeedbackDto {
  word: string;
  accuracyScore: number;
  errorType: string;
}

export interface PronunciationAttemptDto {
  id: string;
  userId: string;
  targetText: string;
  transcriptText: string;
  score: number;
  accuracy: number;
  fluency?: number;
  completeness?: number;
  feedback?: string;
  wordLevelFeedback?: WordFeedbackDto[];
  createdAt: string;
}

export const pronunciationService = {
  submitAttempt: async (request: PronunciationAttemptRequest): Promise<PronunciationAttemptDto> => {
    return await apiClient.post('/pronunciation/submit', request);
  },

  getHistory: async (limit: number = 10): Promise<PronunciationAttemptDto[]> => {
    return await apiClient.get(`/pronunciation/history?limit=${limit}`);
  }
};
