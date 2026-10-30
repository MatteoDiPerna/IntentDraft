import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import { toUserDto } from '../modules/auth/userMapper.js';
import { hashPassword, verifyPassword } from './passwordService.js';

export async function updateUserProfile(
  userId: string,
  input: { displayName?: string; locale?: 'it' | 'en' },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.displayName !== undefined ? { displayName: input.displayName.trim() } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
    },
  });
  return toUserDto(user);
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  if (!user.passwordHash) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Password change not available for this account');
  }
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
