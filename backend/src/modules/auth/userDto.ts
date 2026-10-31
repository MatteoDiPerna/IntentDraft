/** API user shape — aligned with `frontend/src/types/auth.ts` */
export type Locale = 'it' | 'en';
export type AuthProvider = 'local' | 'google';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  locale: Locale;
  authProvider: AuthProvider;
  hasPassword: boolean;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
}
