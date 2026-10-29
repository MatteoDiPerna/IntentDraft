export type Locale = 'it' | 'en';

export type AuthProvider = 'local' | 'google';

export interface User {
  id: string;
  email: string;
  displayName: string;
  locale: Locale;
  authProvider: AuthProvider;
  hasPassword: boolean;
}

export interface StoredUser extends User {
  passwordHash: string;
}
