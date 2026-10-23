import { apiClient } from '../api/client';
export const reportService = { get: async () => apiClient.get('/') };
