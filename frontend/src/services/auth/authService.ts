import { apiClient } from '../api/client';
export const authService = { get: async () => apiClient.get('/') };
