import { apiClient } from '../api/client';
export const performanceService = { get: async () => apiClient.get('/') };
