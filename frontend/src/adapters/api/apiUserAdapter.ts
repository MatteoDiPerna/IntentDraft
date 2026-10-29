import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { UserPort } from '@/adapters/types';
import type { AuthResponse } from '@/types/api';

export const apiUserAdapter: UserPort = {
  async updateProfile(input) {
    const data = await request<AuthResponse>('PATCH', API.users.me, { body: input });
    return data.user;
  },
  async changePassword(currentPassword, newPassword) {
    await request('POST', API.users.password, {
      body: { currentPassword, newPassword },
    });
  },
};
