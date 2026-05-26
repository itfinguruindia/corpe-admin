"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setAuthData } from "@/redux/slices/authSlice";
import type { Admin } from "@/types/admin";

/**
 * Restores admin + permissions from localStorage when Redux rehydrate is incomplete.
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

    if (!needsHydration) return;

    try {
      const raw = localStorage.getItem("adminInfo");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Admin;
      if (!parsed?.id) return;

      dispatch(
        setAuthData({
          accessToken: token,
          refreshToken: localStorage.getItem("refreshToken"),
          admin: parsed,
        }),
      );
    } catch {
      // ignore invalid adminInfo
    }
  }, [admin, accessToken, dispatch]);

  return null;
}
