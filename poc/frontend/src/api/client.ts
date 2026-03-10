import axios from 'axios';

const TOKEN_KEY = 'inkly_token';
const DEFAULT_API_URL = 'http://localhost:3000';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeApiBaseUrl(rawUrl: string): string {
  const normalizedUrl = stripTrailingSlash(rawUrl);
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

const API_URL = stripTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL);
const API_BASE_URL = normalizeApiBaseUrl(API_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export { API_URL, API_BASE_URL, TOKEN_KEY };
export default apiClient;
