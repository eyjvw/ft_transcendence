import type { User, RegisterData, LoginData, AuthResponse } from '../types/auth';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

type ErrorPayload = { error?: unknown };
type BasicResponse = { success?: boolean; error?: string };
type UserResponse = { success?: boolean; user?: User; error?: string };
type ProfileUpdatePayload = {
  username?: string;
  email?: string;
  avatar_url?: string;
  language?: 'en' | 'fr' | 'ar';
};

const stringifyError = (payload: ErrorPayload | null | undefined): string => {
  const raw = payload?.error;

  if (!raw) return 'Request failed';
  if (typeof raw === 'string') return raw;

  if (typeof raw === 'object') {
    try {
      const messages: string[] = [];
      const stack: unknown[] = [raw];

      while (stack.length) {
        const current = stack.pop();
        if (!current || typeof current !== 'object') continue;

        const obj = current as Record<string, unknown>;
        if (typeof obj.message === 'string') messages.push(obj.message);
        if (Array.isArray(obj.issues)) {
          obj.issues.forEach((issue) => {
            if (issue && typeof issue === 'object' && typeof (issue as Record<string, unknown>).message === 'string') {
              messages.push((issue as Record<string, unknown>).message as string);
            }
          });
        }
        Object.values(obj).forEach((value) => stack.push(value));
      }

      if (messages.length > 0) return messages[0]!;
    } catch {
      return 'Request failed';
    }
  }

  return 'Request failed';
};

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

      const result: AuthResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

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

      const result: AuthResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async googleLogin(credential: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ credential }),
      });

      const result: AuthResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

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

      if (!response.ok) {
        return { user: null, error: stringifyError(result) };
      }

      return result;
    } catch (error) {
      return { user: null, error: 'Network error' };
    }
  },

  async resendVerification(): Promise<BasicResponse> {
    try {
      const response = await fetch(`${API_URL}/verify/resend`, {
        method: 'POST',
        credentials: 'include',
      });

      const result: BasicResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result: UserResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },

  async logout(): Promise<BasicResponse> {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const result: BasicResponse & ErrorPayload = await response.json();

      if (!response.ok) {
        return { error: stringifyError(result) };
      }

      return result;
    } catch (error) {
      return { error: 'Network error' };
    }
  },
};
