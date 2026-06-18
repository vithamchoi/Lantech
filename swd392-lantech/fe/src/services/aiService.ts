import apiClient from '../api/apiClient';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatTutorRequest {
  message: string;
  sourceLanguageCode?: string;
  history?: ChatMessage[];
}

export interface ExplainSentenceRequest {
  sentence: string;
  question?: string;
  sourceLanguageCode?: string;
}

export const aiService = {
  chatTutor: async (message: string, sourceLanguageCode: string = 'vi', history?: ChatMessage[]): Promise<string> => {
    // Expected response wrapper from apiClient
    return await apiClient.post('/ai/chat-tutor', { message, sourceLanguageCode, history });
  },

  chatTutorStream: async (
    message: string,
    sourceLanguageCode: string = 'vi',
    history: ChatMessage[] = [],
    onChunk: (text: string) => void,
    onError: (err: any) => void
  ): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5131/api/ai/chat-tutor-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message, sourceLanguageCode, history })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                onError(new Error(parsed.error));
                return;
              }
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              // Ignore parse errors from malformed chunks
            }
          }
        }
      }
    } catch (err) {
      onError(err);
    }
  },

  explainSentence: async (sentence: string, question: string = '', sourceLanguageCode: string = 'vi'): Promise<string> => {
    return await apiClient.post('/ai/explain-sentence', { sentence, question, sourceLanguageCode });
  },

  generateVocabularyExamples: async (word: string, cefrLevel: string = 'A2', sourceLanguageCode: string = 'vi'): Promise<string> => {
    return await apiClient.post('/ai/vocabulary-examples', { word, cefrLevel, sourceLanguageCode });
  }
};
