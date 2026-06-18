import apiClient from '../api/apiClient';

export interface OnboardingOptionsDto {
  canTakeAssessment: boolean;
  canSelfSelectLevel: boolean;
  supportedLevels: string[];
  supportedSkills: string[];
  explanation: string;
}

export interface SelfSelectLevelRequest {
  nativeLanguageCode: string;
  targetLevel: string;
}

export interface OnboardingResultDto {
  profile: any;
  learningPath: any;
}

export const onboardingService = {
  getOptions: async (): Promise<OnboardingOptionsDto> => {
    return await apiClient.get('/onboarding/options');
  },

  selfSelectLevel: async (request: SelfSelectLevelRequest): Promise<OnboardingResultDto> => {
    return await apiClient.post('/onboarding/select-level', request);
  }
};
