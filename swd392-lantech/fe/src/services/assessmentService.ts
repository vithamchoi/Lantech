import apiClient from '../api/apiClient';

export interface AssessmentQuestionDto {
  id: string;
  skill: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  level: string;
  questionText: string;
  instruction?: string;
  passageText?: string;
  audioUrl?: string;
  audioTranscript?: string;
  speakingPrompt?: string;
  writingPrompt?: string;
  options?: string[];
}

export interface AssessmentDetailDto {
  id: string;
  status: string;
  overallScore?: number;
  listeningScore?: number;
  speakingScore?: number;
  readingScore?: number;
  writingScore?: number;
  resultLevel?: string;
  questions: AssessmentQuestionDto[];
}

export interface AssessmentAnswerItem {
  questionId: string;
  answer?: string;
  answerText?: string;
  targetText?: string;
  transcriptText?: string;
}

export const assessmentService = {
  getLatestInfo: async (): Promise<any> => {
    const response = await apiClient.get<any>('/assessments/info');
    return response.data.data;
  },

  startAssessment: async (sourceLanguageCode: string = 'vi'): Promise<AssessmentDetailDto> => {
    const response = await apiClient.post<any>('/assessments/start', { sourceLanguageCode });
    return response.data.data;
  },

  getAssessment: async (id: string): Promise<AssessmentDetailDto> => {
    return await apiClient.get(`/assessments/${id}`);
  },

  submitSection: async (id: string, section: string, answers: any[]): Promise<void> => {
    await apiClient.post(`/assessments/${id}/${section.toLowerCase()}`, { answers });
  },

  completeAssessment: async (id: string): Promise<AssessmentDetailDto> => {
    return await apiClient.post(`/assessments/${id}/complete`);
  },

  getHistory: async (): Promise<AssessmentDetailDto[]> => {
    return await apiClient.get('/assessments/history');
  }
};
