import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification, NotificationPreference, NotificationState } from "@/types/notification";

const initialState: NotificationState = {
  unreadCount: 0,
  recentNotifications: [],
  preferences: null,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setRecentNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.recentNotifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add to start of recent notifications
      state.recentNotifications = [action.payload, ...state.recentNotifications].slice(0, 20);
      // Increment unread count (real-time increment)
      state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.recentNotifications.find(n => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setPreferences: (state, action: PayloadAction<NotificationPreference>) => {
      state.preferences = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setUnreadCount,
  setRecentNotifications,
  addNotification,
  markNotificationRead,
  setPreferences,
  setLoading,
} = notificationSlice.actions;

export default notificationSlice.reducer;
