import { apiClient } from '../api/client';
import { User } from '../../types/user';

export interface LoginPayload {
  email: string;
  password: string;
  portalRole?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  phone?: string;
  companyName?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  status?: string;
}

export const authService = {
  /**
   * Authenticate user with credentials against selected portal
   */
  login: async (payload: LoginPayload): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post<{ message: string; token: string; user: User }>(
      '/auth/login',
      payload
    );
    return {
      token: response.data.token,
      user: response.data.user
    };
  },

  /**
   * Register a new observer account or submit contractor onboarding
   */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  /**
   * Fetch current authenticated user session
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Inform backend of logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  }
};
