import { apiClient } from '../api/client';
export const roadService = { get: async () => apiClient.get('/') };
