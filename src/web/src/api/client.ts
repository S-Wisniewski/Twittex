const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5260";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getAuthToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

function getRefreshToken(): string | null {
  return sessionStorage.getItem("refreshToken");
}

function clearSession() {
  sessionStorage.clear();
  window.location.href = "/login";
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) sessionStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken as string;
    }
  } catch {
    // network error — fall through
  }
  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !isRetry) {
    const newToken = await tryRefresh();
    if (newToken) {
      return request<T>(path, options, true);
    }
    clearSession();
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
