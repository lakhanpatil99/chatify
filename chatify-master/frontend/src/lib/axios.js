import axios from "axios";

const backendUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "");

const baseURL = backendUrl ? `${backendUrl.replace(/\/$/, "")}/api` : "/api";

// Log backend URL in development for debugging (only in dev, not production)
if (import.meta.env.MODE === "development") {
  console.log("🔗 Backend URL:", backendUrl || "Using relative /api");
  console.log("🔗 Axios baseURL:", baseURL);
}

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors (CORS, connection refused, etc.)
    if (!error.response) {
      console.error("🚨 Network error - Backend may be unreachable:", {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);
