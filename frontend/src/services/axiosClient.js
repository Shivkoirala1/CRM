import axios from "axios";

/**
 * Shared axios instance for talking to the Express/MongoDB backend.
 * Set VITE_API_BASE_URL in a .env file (see .env.example) once the
 * backend is available. Until then, the functions in services/api.js
 * fall back to local mock data so the UI keeps working standalone.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach an auth token automatically if one is present (e.g. after login).
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("pit_crm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralized error passthrough — extend here for global 401 handling, toasts, etc.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
