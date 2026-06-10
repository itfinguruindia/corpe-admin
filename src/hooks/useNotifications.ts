"use client";

import { useEffect, useCallback, useRef, startTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addNotification,
  setUnreadCount,
  setPreferences,
} from "@/redux/slices/notificationSlice";
import { connectSocket } from "@/lib/socket";
import notificationService from "@/services/notification.service";
import { toast } from "@heroui/react";

/**
 * Hook to manage real-time notification listeners and global notification state.
 * Should be called once in a high-level layout component.
 */
export function useNotifications() {
  const dispatch = useDispatch();
  const { admin } = useSelector((state: RootState) => state.auth);
  const { preferences } = useSelector(
    (state: RootState) => state.notifications,
  );
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;

  const playNotificationSound = useCallback(() => {
    if (preferencesRef.current?.soundEnabled) {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.8;
      audio.play().catch((err) => {
        if (err.name !== "NotSupportedError") {
          console.error("Could not play notification sound", err);
        }
      });
    }
  }, []);

  const handleNewNotification = useCallback(
    (data: any) => {
      const { notification } = data;
      if (!notification) return;

      // Low-priority updates avoid aborting an in-flight App Router transition.
      startTransition(() => {
        dispatch(addNotification(notification));
      });

      // Defer toast to the next task so root Toast.Provider re-renders don't
      // collide with router transition state (InvalidStateError).
      setTimeout(() => {
        toast(notification.title, {
          description: notification.body,
          variant: notification.severity === "critical" ? "danger" : "accent",
          timeout: 5000,
        });
      }, 0);

      playNotificationSound();
    },
    [dispatch, playNotificationSound],
  );

  const handleUnreadCount = useCallback(
    (data: { count: number }) => {
      startTransition(() => {
        dispatch(setUnreadCount(data.count));
      });
    },
    [dispatch],
  );

  useEffect(() => {
    if (!admin || preferences) return;

    notificationService.getPreferences().then((prefs) => {
      if (prefs) dispatch(setPreferences(prefs));
    });
  }, [admin, preferences, dispatch]);

  useEffect(() => {
    if (!admin) return;

    const socket = connectSocket();

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:unreadCount", handleUnreadCount);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:unreadCount", handleUnreadCount);
    };
  }, [admin, dispatch, handleNewNotification, handleUnreadCount]);

  return { preferences };
}
