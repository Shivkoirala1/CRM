import axios from "axios";

/**
 * Shared axios instance for talking to the Django REST backend.
 * VITE_API_BASE_URL is set in .env and points at
 * http://127.0.0.1:8000/api during local development.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const ACCESS_KEY = "pit_crm_token";
const REFRESH_KEY = "pit_crm_refresh";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Attach the access token automatically to every request.
axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a request comes back 401 (expired access token), try refreshing once
// with the refresh token before giving up. This keeps people logged in
// without needing to re-enter credentials every few minutes.
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes("/token/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const refresh = tokenStorage.getRefresh();
      if (!refresh) {
        tokenStorage.clear();
        return Promise.reject(error);
      }
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${axiosClient.defaults.baseURL}/token/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        tokenStorage.set(data.access, null);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(original);
      } catch (refreshError) {
        tokenStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
