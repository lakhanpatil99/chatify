import axios from "axios";

const backendUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "");

const baseURL = backendUrl ? `${backendUrl.replace(/\/$/, "")}/api` : "/api";

// Expose for error messages (e.g. when backend is unreachable)
export const getBackendBaseURL = () => baseURL;
export const isBackendConfigured = () => !!backendUrl;

// Log backend host so you can verify deployed app uses correct URL (open Console on Vercel)
try {
  const url = (backendUrl || "").replace(/\/$/, "");
  const host = url ? (url.startsWith("http") ? new URL(url).host : url) : "(same origin)";
  console.log("🔗 Chatify backend:", host);
} catch (_) {
  console.log("🔗 Chatify backend:", backendUrl || "(not set)");
}

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 25000, // 25s - Render free tier can take 30–60s to wake up
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const isNetworkError = error.code === "ERR_NETWORK" || error.message === "Network Error";
      const hint = !backendUrl
        ? " Set VITE_BACKEND_URL in Vercel and redeploy."
        : " Check that your backend is live and CORS allows this origin.";
      error.userMessage = isNetworkError
        ? `Cannot reach server.${hint}`
        : (error.message || "Request failed");
      console.error("🚨 Network error - Backend may be unreachable:", {
        baseURL: error.config?.baseURL,
        message: error.message,
        userMessage: error.userMessage,
      });
    }
    return Promise.reject(error);
  }
);
