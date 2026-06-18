import apiClient from '../api/apiClient';

export interface ChatTutorRequest {
  message: string;
  sourceLanguageCode?: string;
}

export interface ExplainSentenceRequest {
  sentence: string;
  question?: string;
  sourceLanguageCode?: string;
}

export const aiService = {
  chatTutor: async (message: string, sourceLanguageCode: string = 'vi'): Promise<string> => {
    // Expected response wrapper from apiClient
    return await apiClient.post('/ai/chat-tutor', { message, sourceLanguageCode });
  },

  explainSentence: async (sentence: string, question: string = '', sourceLanguageCode: string = 'vi'): Promise<string> => {
    return await apiClient.post('/ai/explain-sentence', { sentence, question, sourceLanguageCode });
  },

  generateVocabularyExamples: async (word: string, cefrLevel: string = 'A2', sourceLanguageCode: string = 'vi'): Promise<string> => {
    return await apiClient.post('/ai/vocabulary-examples', { word, cefrLevel, sourceLanguageCode });
  }
};
