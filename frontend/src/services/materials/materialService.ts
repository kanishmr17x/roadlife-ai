import { apiClient } from '../api/client';
export const materialService = { get: async () => apiClient.get('/') };
