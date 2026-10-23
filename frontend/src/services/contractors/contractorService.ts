import { apiClient } from '../api/client';
export const contractorService = { get: async () => apiClient.get('/') };
