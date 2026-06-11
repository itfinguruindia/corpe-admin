import axiosInstance from "@/lib/axios";
import { clearAuthData, setAuthData } from "@/redux/slices/authSlice";
import { store } from "@/redux/store";
import Cookies from "js-cookie";
import { redirectAfterAuth } from "@/utils/navigation";

let isLoggingOut = false;

export function getIsLoggingOut(): boolean {
  return isLoggingOut;
}

export function resetLogoutState(): void {
  isLoggingOut = false;
}

function clearAuthStorage(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminInfo");
  // Remove with explicit path to match how cookies were set (js-cookie defaults to "/").
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  store.dispatch(clearAuthData());
}

export type LogoutOptions = {
  /** Record logout in activity log (needs valid token; call before clearing) */
  recordActivity?: boolean;
  /** Redirect after logout; set null to stay on page */
  redirectTo?: string | null;
  /** Suppress session-expired style side effects when triggered by 401 handler */
  silent?: boolean;
};

/** Record logout in activity log while the session token is still valid. */
async function recordLogoutActivity(): Promise<void> {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const base =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const res = await fetch(`${base}/admin/activity-logs/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
        "x-access-token-type": "access_token",
      },
      keepalive: true,
    });

    if (!res.ok) {
      console.warn("[Logout] Failed to record activity log:", res.status);
    }
  } catch (err) {
    console.warn("[Logout] Activity log request failed:", err);
  }
}

/**
 * Full logout: optionally records activity, clears auth, then redirects once.
 */
export async function performLogout(
  options: LogoutOptions = {},
): Promise<void> {
  if (isLoggingOut) return;

  const {
    recordActivity = false,
    redirectTo = "/login",
    silent: _silent = false,
  } = options;

  try {
    if (recordActivity) {
      await recordLogoutActivity();
    }
  } finally {
    isLoggingOut = true;
    clearAuthStorage();

    if (redirectTo && typeof window !== "undefined") {
      redirectAfterAuth(redirectTo);
    }
  }
}

/** @deprecated Use performLogout — kept for axios 401 handler */
export function logoutAdmin(): void {
  void performLogout({ recordActivity: false, redirectTo: "/login", silent: true });
}

export async function checkSuperAdmin(): Promise<boolean> {
  const response = await axiosInstance.get("/admin/auth/check-super");
  if (response.data.success) {
    return response.data.data.hasSuperAdmin;
  }
  throw new Error(response.data.message || "Failed to check super admin");
}

export async function registerSuperAdmin({
  name,
  email,
  phoneNumber,
  password,
}: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  const response = await axiosInstance.post("/admin/auth/register", {
    name,
    email,
    phoneNumber,
    password,
  });
  if (response.data.success) {
    const { accessToken, refreshToken, admin } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("adminInfo", JSON.stringify(admin));
    Cookies.set("accessToken", accessToken, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 30 });
    resetLogoutState();
    return true;
  } else {
    throw new Error(response.data.message || "Registration failed");
  }
}

export async function loginAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await axiosInstance.post("/admin/auth/login", {
    email,
    password,
  });
  if (response.data.success) {
    const { accessToken, refreshToken, admin } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("adminInfo", JSON.stringify(admin));
    Cookies.set("accessToken", accessToken, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 30 });
    store.dispatch(setAuthData({ accessToken, refreshToken, admin }));
    resetLogoutState();
    return true;
  } else {
    throw new Error(response.data.message || "Login failed");
  }
}

export async function requestEmailChange(newEmail: string): Promise<void> {
  const response = await axiosInstance.post(
    "/auth/admin-request-email-change",
    {
      newEmail,
    },
  );
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to request email change");
  }
}

export async function verifyEmailChange(token: string) {
  const response = await axiosInstance.post("/admin/auth/verify-email-change", {
    token,
  });
  if (response.data.success) {
    const { accessToken, refreshToken, admin } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("adminInfo", JSON.stringify(admin));
    Cookies.set("accessToken", accessToken, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 30 });
    resetLogoutState();
    return { accessToken, refreshToken, admin };
  } else {
    throw new Error(response.data.message || "Verification failed");
  }
}
