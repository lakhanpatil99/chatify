import axios from "axios";

const backendUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "");

export const axiosInstance = axios.create({
  baseURL: backendUrl ? `${backendUrl.replace(/\/$/, "")}/api` : "/api",
  withCredentials: true,
});
