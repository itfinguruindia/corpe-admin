import axiosInstance from "@/lib/axios";
import { clearAuthData, setAuthData } from "@/redux/slices/authSlice";
import { store } from "@/redux/store";
import Cookies from "js-cookie";

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
    return true;
  } else {
    throw new Error(response.data.message || "Login failed");
  }
}

export function logoutAdmin() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("adminInfo");
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  store.dispatch(clearAuthData());
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
    return { accessToken, refreshToken, admin };
  } else {
    throw new Error(response.data.message || "Verification failed");
  }
}
