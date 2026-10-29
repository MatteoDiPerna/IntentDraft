export const API = {
  health: '/api/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    google: '/api/auth/google',
  },
  users: {
    me: '/api/users/me',
    password: '/api/users/me/password',
  },
  conversations: {
    list: '/api/conversations',
    one: (id: string) => `/api/conversations/${id}`,
    messages: (id: string) => `/api/conversations/${id}/messages`,
    files: (id: string) => `/api/conversations/${id}/files`,
    regenerate: (id: string) => `/api/conversations/${id}/regenerate`,
    skipClarification: (id: string) => `/api/conversations/${id}/skip-clarification`,
    promptsLatest: (id: string) => `/api/conversations/${id}/prompts/latest`,
  },
  files: {
    one: (id: string) => `/api/files/${id}`,
    download: (id: string) => `/api/files/${id}/download`,
  },
  prompts: {
    one: (id: string) => `/api/prompts/${id}`,
    feedback: (id: string) => `/api/prompts/${id}/feedback`,
  },
} as const;
