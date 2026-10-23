import { apiClient } from '../api/client';
export const constructionService = { get: async () => apiClient.get('/') };
