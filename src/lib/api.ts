import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─── Token Storage Helpers ─────────────────────────────────────────
// Access token in sessionStorage (clears on tab close — safer than localStorage)
// Refresh token kept in sessionStorage too; backend also sets httpOnly cookie as fallback.

const TOKEN_KEY = "fclub_access_token";
const REFRESH_KEY = "fclub_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

// ─── Axios Instance ────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send httpOnly cookies (refresh token fallback)
  headers: {
    "Content-Type": "application/json",
  },
  /* Bounded request time. Without this a backend that accepts the connection
     but never answers (cold instance, stalled tunnel) left callers pending
     forever — on the home page that meant the fallback fetch never settled
     and content that depends on it stayed blank. */
  timeout: 15000,
});

// ─── Request Interceptor: Attach Access Token ──────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Auto-Refresh on 401 ─────────────────────

// Queue to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401, skip if already retried or if it's an auth request
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh-token" ||
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/register" ||
      originalRequest.url === "/auth/me"
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Try refresh via cookie first (httpOnly), fallback to body token
      const refreshToken = getRefreshToken();
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
        refreshToken ? { refreshToken } : {},
        { withCredentials: true }
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      // Store new tokens
      setTokens(newAccessToken, newRefreshToken);

      // Update default headers for future requests
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests
      processQueue(null, newAccessToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear tokens and redirect to login
      processQueue(refreshError, null);
      clearTokens();

      if (typeof window !== "undefined") {
        // Avoid redirect loop if already on login page
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
