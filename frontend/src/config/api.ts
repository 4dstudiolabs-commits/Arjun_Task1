const rawBase = (process.env.REACT_APP_API_BASE_URL || '').trim();

/**
 * CRA env vars are injected at build time.
 * Ensure .env is set and you restart `npm start` after changing it.
 */
export const API_BASE_URL = normalizeBaseUrl(
  rawBase || 'http://localhost:3000',
);

export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

function normalizeBaseUrl(base: string) {
  // Remove trailing slashes for clean joins
  return base.replace(/\/+$/, '');
}
