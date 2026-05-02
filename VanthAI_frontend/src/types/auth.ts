/**
 * src/types/auth.ts
 * Ported from ERP-SIH types/auth.ts — as-is.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'staff' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
