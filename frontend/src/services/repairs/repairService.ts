import { apiClient } from '../api/client';
export const repairService = { get: async () => apiClient.get('/') };
