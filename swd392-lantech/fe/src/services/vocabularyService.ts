import apiClient from '../api/apiClient';

export interface VocabularyDto {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  cefrLevel: string;
  definition: string;
  exampleSentence?: string;
  meaning: string;
  explanation?: string;
  exampleTranslation?: string;
  tags?: string[];
  isInDeck: boolean;
}

export const vocabularyService = {
  getVocabularies: async (cefrLevel?: string, query?: string): Promise<VocabularyDto[]> => {
    let url = '/vocabularies';
    const params = new URLSearchParams();
    if (cefrLevel && cefrLevel !== 'All') params.append('cefrLevel', cefrLevel);
    if (query) params.append('query', query);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return await apiClient.get(url);
  },

  getVocabularyById: async (id: string): Promise<VocabularyDto> => {
    return await apiClient.get(`/vocabularies/${id}`);
  }
};
