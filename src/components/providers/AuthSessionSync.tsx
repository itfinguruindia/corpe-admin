"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setAuthData } from "@/redux/slices/authSlice";
import type { Admin } from "@/types/admin";
import { refreshAdminSession } from "@/utils/auth";

/**
 * Restores admin + permissions from localStorage and refreshes from the server.
 */
export default function AuthSessionSync() {
  const dispatch = useDispatch();
  const { admin, accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      accessToken || localStorage.getItem("accessToken") || undefined;
    if (!token) return;

    const needsHydration =
      !admin?.id ||
      (!admin.isSuperAdmin &&
        (!Array.isArray(admin.permissions) || admin.permissions.length === 0));

    if (needsHydration) {
      try {
        const raw = localStorage.getItem("adminInfo");
        if (raw) {
          const parsed = JSON.parse(raw) as Admin;
          if (parsed?.id) {
            dispatch(
              setAuthData({
                accessToken: token,
                refreshToken: localStorage.getItem("refreshToken"),
                admin: parsed,
              }),
            );
          }
        }
      } catch {
        // ignore invalid adminInfo
      }
    }

    void refreshAdminSession();
  }, [admin?.id, accessToken, dispatch]);

  return null;
}
