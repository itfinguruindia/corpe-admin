"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addNotification,
  setUnreadCount,
  setPreferences,
} from "@/redux/slices/notificationSlice";
import { connectSocket, getSocket } from "@/lib/socket";
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

  const playNotificationSound = useCallback(() => {
    if (preferences?.soundEnabled) {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.8;
      audio.play().catch((err) => {
        // Only log if it's not a 'no supported source' error to keep console clean if file is missing
        if (err.name !== "NotSupportedError") {
          console.error("Could not play notification sound", err);
        }
      });
    }
  }, [preferences?.soundEnabled]);

  const handleNewNotification = useCallback(
    (data: any) => {
      const { notification } = data;
      if (notification) {
        dispatch(addNotification(notification));

        // Show a toast for all new notifications
        toast(notification.title, {
          description: notification.body,
          variant: notification.severity === "critical" ? "danger" : "accent",
          timeout: 5000,
        });

        playNotificationSound();
      }
    },
    [dispatch, playNotificationSound],
  );

  const handleUnreadCount = useCallback(
    (data: { count: number }) => {
      dispatch(setUnreadCount(data.count));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!admin) return;

    // 1. Fetch preferences if not loaded
    if (!preferences) {
      notificationService.getPreferences().then((prefs) => {
        if (prefs) dispatch(setPreferences(prefs));
      });
    }

    // 2. Connect socket
    const socket = connectSocket();

    // 3. Register listeners
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:unreadCount", handleUnreadCount);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:unreadCount", handleUnreadCount);
    };
  }, [admin, preferences, dispatch, handleNewNotification, handleUnreadCount]);

  return { preferences };
}
