export type Locale = 'it' | 'en';

export interface User {
  id: string;
  email: string;
  displayName: string;
  locale: Locale;
}

export interface StoredUser extends User {
  passwordHash: string;
}
