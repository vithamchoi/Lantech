import apiClient from '../api/apiClient';

export interface BadgeDto {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  criteriaType: string;
  criteriaValue: number;
}

export interface UserBadgeDto {
  id: string;
  badgeId: string;
  badge: BadgeDto;
  unlockedAt: string;
}

export interface XpTransactionDto {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  totalXp: number;
  level: string;
  isCurrentUser: boolean;
}

export interface LeaderboardDto {
  period: string;
  entries: LeaderboardEntryDto[];
}

export const gamificationService = {
  getBadges: async (): Promise<BadgeDto[]> => {
    return await apiClient.get('/gamification/badges');
  },

  getMyBadges: async (): Promise<UserBadgeDto[]> => {
    return await apiClient.get('/gamification/my-badges');
  },

  getMyXpTransactions: async (): Promise<XpTransactionDto[]> => {
    return await apiClient.get('/gamification/my-xp-transactions');
  },

  getLeaderboard: async (period: string = 'weekly', top: number = 10): Promise<LeaderboardDto> => {
    return await apiClient.get(`/leaderboards?period=${period}&top=${top}`);
  }
};
