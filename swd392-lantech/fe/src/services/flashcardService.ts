import apiClient from '../api/apiClient';

export interface FlashcardDto {
  id: string;
  userId: string;
  vocabularyId: string;
  sourceLanguageCode: string;
  easeFactor: number;
  interval: number;
  repetition: number;
  dueDate: string;
  lastReviewedAt?: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  meaning: string;
  explanation?: string;
  exampleTranslation?: string;
}

export interface FlashcardReviewDto {
  id: string;
  flashcardId: string;
  quality: number;
  oldInterval: number;
  newInterval: number;
  oldEaseFactor: number;
  newEaseFactor: number;
  dueDate: string;
  reviewedAt: string;
}

export const flashcardService = {
  getFlashcards: async (): Promise<FlashcardDto[]> => {
    return await apiClient.get('/flashcards');
  },

  getDueFlashcards: async (): Promise<FlashcardDto[]> => {
    return await apiClient.get('/flashcards/due');
  },

  addFlashcard: async (vocabularyId: string): Promise<FlashcardDto> => {
    return await apiClient.post(`/flashcards/add/${vocabularyId}`);
  },

  removeFlashcard: async (flashcardId: string): Promise<void> => {
    return await apiClient.delete(`/flashcards/${flashcardId}`);
  },

  reviewFlashcard: async (flashcardId: string, quality: number): Promise<FlashcardReviewDto> => {
    return await apiClient.post(`/flashcards/review/${flashcardId}`, { quality });
  }
};
