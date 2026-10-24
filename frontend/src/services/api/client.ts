import axios, { AxiosError } from 'axios';
import { ENV } from '../../config/env';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'offline';
  service: string;
  timestamp?: string;
  error?: string;
}

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with normalized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Non-2xx response or network unreachable
    return Promise.reject(error);
  }
);

/**
 * Checks backend health without throwing fatal UI errors
 */
export async function checkBackendHealth(): Promise<HealthResponse> {
  try {
    const response = await apiClient.get<HealthResponse>('/health');
    return {
      status: response.data.status || 'ok',
      service: response.data.service || 'roadsense-backend',
      timestamp: response.data.timestamp || new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      status: 'offline',
      service: 'roadsense-backend',
      error: message,
    };
  }
}
