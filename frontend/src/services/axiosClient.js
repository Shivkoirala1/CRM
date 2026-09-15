import axios from "axios";

/**
 * Shared axios instance for the Django REST backend. Set
 * VITE_API_BASE_URL in a .env file to point at a non-default host; it
 * defaults to the Django dev server (manage.py runserver -> :8000),
 * with the /api/ prefix that crm/urls.py mounts everything under.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ACCESS_KEY = "pit_crm_access";
const REFRESH_KEY = "pit_crm_refresh";

export const hasToken = () => !!localStorage.getItem(ACCESS_KEY);
export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// SIMPLE_JWT access tokens are short-lived outside DEBUG (see
// backend/crm/settings.py). On a 401 we try exactly one silent refresh
// via /api/token/refresh/ and replay the original request; if that also
// fails, the tokens are cleared and the caller's rejection bubbles up so
// DataContext can drop back to the login screen.
let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes("/token/");

    if (response?.status === 401 && !config._retried && getRefreshToken() && !isAuthEndpoint) {
      config._retried = true;
      try {
        refreshPromise =
          refreshPromise ||
          axios.post(`${BASE_URL}/token/refresh/`, { refresh: getRefreshToken() });
        const { data } = await refreshPromise;
        refreshPromise = null;
        setTokens({ access: data.access });
        config.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(config);
      } catch (refreshErr) {
        refreshPromise = null;
        clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
