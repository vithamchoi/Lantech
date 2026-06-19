import apiClient from '../api/apiClient';

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationDto[]> => {
    return await apiClient.get('/notifications');
  },

  markAsRead: async (id: string): Promise<void> => {
    return await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    return await apiClient.put('/notifications/read-all');
  }
};
