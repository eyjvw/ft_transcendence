import type { User, RegisterData, LoginData, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:4000/api';

export const api = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async me(): Promise<{ user: User | null; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { user: null, error: 'Network error' };
    }
  },
};
