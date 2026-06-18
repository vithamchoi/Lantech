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

const mapBackendVocabToFrontend = (vocab: any): VocabularyDto => {
  const translation = vocab.translations?.find((t: any) => t.languageCode === 'vi') || vocab.translations?.[0] || {};
  return {
    id: vocab.id,
    word: vocab.word,
    ipa: vocab.ipa,
    partOfSpeech: vocab.partOfSpeech,
    cefrLevel: vocab.cefrLevel,
    definition: translation.explanation || translation.meaning || '',
    exampleSentence: vocab.exampleSentence,
    meaning: translation.meaning || '',
    explanation: translation.explanation || '',
    exampleTranslation: translation.exampleTranslation || '',
    tags: vocab.tags || [],
    isInDeck: vocab.isInDeck ?? false,
  };
};

export const vocabularyService = {
  getVocabularies: async (cefrLevel?: string, query?: string): Promise<VocabularyDto[]> => {
    let url = '/vocabularies';
    const params = new URLSearchParams();
    if (cefrLevel && cefrLevel !== 'All') params.append('level', cefrLevel);
    if (query) params.append('search', query);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const data: any[] = await apiClient.get(url);
    return data.map(mapBackendVocabToFrontend);
  },

  getVocabularyById: async (id: string): Promise<VocabularyDto> => {
    const data = await apiClient.get(`/vocabularies/${id}`);
    return mapBackendVocabToFrontend(data);
  },

  getRelatedVocabularies: async (id: string): Promise<VocabularyDto[]> => {
    const data: any[] = await apiClient.get(`/vocabularies/${id}/related`);
    return data.map(mapBackendVocabToFrontend);
  }
};
