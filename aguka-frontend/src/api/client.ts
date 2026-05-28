import { tabSession } from '@/utils/tabSession';

export const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

function getToken(): string | null {
  return tabSession.getToken();
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && retry && endpoint !== '/auth/refresh-token') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
  }

  if (res.status === 401) {
    tabSession.clear();
    if (onUnauthorized) onUnauthorized();
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || body?.message || 'Authentication required';
    const code = body?.error?.code || 'UNAUTHORIZED';
    throw new ApiError(401, code, message, body?.error?.details);
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || body?.message || 'You do not have permission to perform this action';
    const code = body?.error?.code || 'FORBIDDEN';
    throw new ApiError(403, code, message, body?.error?.details);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || body?.message || `HTTP ${res.status}`;
    const code = body?.error?.code || `HTTP_${res.status}`;
    throw new ApiError(res.status, code, message, body?.error?.details);
  }

  const data: ApiResponse<T> = await res.json();
  return data;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tabSession.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const body = await res.json();
    const tokens = body?.data ?? body;
    const accessToken = tokens?.accessToken ?? tokens?.token;
    const nextRefreshToken = tokens?.refreshToken ?? refreshToken;

    if (!accessToken) return false;

    const session = tabSession.get();
    tabSession.set({
      ...session,
      token: accessToken,
      refreshToken: nextRefreshToken,
    });

    return true;
  } catch {
    return false;
  }
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<T>(`${endpoint}${qs}`, { method: 'GET' });
  },

  post: <T = unknown>(endpoint: string, body?: unknown, options: Partial<RequestInit> = {}) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  download: async (endpoint: string, params?: Record<string, string>, filename: string = 'download') => {
    const token = getToken();
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}${qs}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
