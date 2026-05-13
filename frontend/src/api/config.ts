export type ApiMode = 'mock' | 'http';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080';
const DEFAULT_API_MODE: ApiMode = 'http';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export function getApiMode(): ApiMode {
  const mode = import.meta.env.VITE_API_MODE;
  return mode === 'mock' ? 'mock' : DEFAULT_API_MODE;
}
