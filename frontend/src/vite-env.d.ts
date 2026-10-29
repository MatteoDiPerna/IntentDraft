/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_GOOGLE_AUTH_START_URL: string;
  readonly VITE_MAX_MESSAGE_CHARS: string;
  readonly VITE_MAX_UPLOAD_BYTES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
