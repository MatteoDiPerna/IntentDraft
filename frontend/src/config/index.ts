export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
};
