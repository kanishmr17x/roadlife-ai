import { apiClient } from '../api/client';
export const weatherService = { get: async () => apiClient.get('/') };
