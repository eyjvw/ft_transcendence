export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  coins?: number;
  language?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  error?: string;
}
