import { apiClient } from '../api/client';
export const notificationService = { get: async () => apiClient.get('/') };
