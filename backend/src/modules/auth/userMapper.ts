import type { User as DbUser } from '@prisma/client';
import type { AuthProvider, Locale, User, UserRole } from './userDto.js';

export function toUserDto(user: DbUser): User {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? '',
    locale: user.locale as Locale,
    authProvider: user.authProvider as AuthProvider,
    hasPassword: user.passwordHash != null && user.passwordHash.length > 0,
    role: user.role as UserRole,
  };
}
