export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  googleAuthStartUrl:
    import.meta.env.VITE_GOOGLE_AUTH_START_URL ??
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/auth/google`,
  maxMessageChars: Number(import.meta.env.VITE_MAX_MESSAGE_CHARS) || 12_000,
  maxUploadBytes: Number(import.meta.env.VITE_MAX_UPLOAD_BYTES) || 5 * 1024 * 1024,
};
