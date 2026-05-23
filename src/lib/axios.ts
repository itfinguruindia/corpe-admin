import { getIsLoggingOut, performLogout } from "@/utils/auth";
import axios from "axios";
import { toast } from "@heroui/react";

function isAuthRequest(url?: string) {
  if (!url) return false;
  return (
    url.includes("/admin/auth/login") ||
    url.includes("/admin/auth/register") ||
    url.includes("/activity-logs/logout") ||
    url.includes("/activity-logs/track")
  );
}

function isAbortedRequest(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    const msg =
      error instanceof Error ? error.message.toLowerCase() : String(error);
    return msg.includes("abort") || msg.includes("cancel");
  }
  const code = error.code;
  const msg = (error.message || "").toLowerCase();
  return (
    code === "ERR_CANCELED" ||
    error.name === "CanceledError" ||
    msg.includes("abort") ||
    msg.includes("cancel")
  );
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && getIsLoggingOut()) {
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
    } else if (typeof window !== "undefined") {
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

axiosInstance.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      response.data.success === false &&
      response.data.message &&
      !isAuthRequest(response.config?.url) &&
      !getIsLoggingOut()
    ) {
      toast.danger(response.data.message);
    }

    return response;
  },
  (error) => {
    if (isAbortedRequest(error) || getIsLoggingOut()) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    const onAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register");

    if (status === 401 && (isAuthRequest(error.config?.url) || onAuthPage)) {
      return Promise.reject(error);
    }

    if (status === 401 && typeof window !== "undefined" && !getIsLoggingOut()) {
      toast.danger("Session expired. Please login again.");
      void performLogout({
        recordActivity: false,
        redirectTo: "/login",
        silent: true,
      });
      return Promise.reject(error);
    }

    if (!isAuthRequest(error.config?.url)) {
      const displayMessage = isAbortedRequest(error)
        ? null
        : message;
      if (displayMessage) {
        toast.danger(displayMessage);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
