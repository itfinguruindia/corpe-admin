import { logoutAdmin } from "@/utils/auth";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "@heroui/react";

function isAuthRequest(url?: string) {
  if (!url) return false;
  return (
    url.includes("/admin/auth/login") || url.includes("/admin/auth/register")
  );
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// REQUEST: attach token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["x-access-token"] = token;
        config.headers["x-access-token-type"] = "access_token";
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE: handle success + error toast
axiosInstance.interceptors.response.use(
  (response) => {
    /**
     * Handle API-level failure
     * Example response:
     * { success: false, message: "Something went wrong" }
     */
    if (
      response.data &&
      response.data.success === false &&
      response.data.message &&
      !isAuthRequest(response.config?.url)
    ) {
      toast.danger(response.data.message);
    }

    return response;
  },
  (error) => {
    // HTTP errors
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    const onAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register");

    // Failed login/register — login/register pages show their own toast
    if (status === 401 && (isAuthRequest(error.config?.url) || onAuthPage)) {
      return Promise.reject(error);
    }

    // 401 → logout
    if (status === 401 && typeof window !== "undefined") {
      logoutAdmin();
      toast.danger("Session expired. Please login again.");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Other errors → toast (auth forms handle their own messages)
    if (!isAuthRequest(error.config?.url)) {
      toast.danger(message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
