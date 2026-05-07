import axiosInstance from "@/lib/axios";

/**
 * Notification REST API service for admin panel.
 * Handles fetching, marking as read, and preference management.
 */
const notificationService = {
  /**
   * Fetch paginated notifications for the current admin.
   */
  async getNotifications(filters: { category?: string; isRead?: boolean; type?: string } = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    if (filters.category) params.append("category", filters.category);
    if (filters.isRead !== undefined) params.append("isRead", String(filters.isRead));
    if (filters.type) params.append("type", filters.type);

    const response = await axiosInstance.get(`/admin/notifications?${params}`);
    return response.data?.data;
  },

  /**
   * Get unread notification count.
   */
  async getUnreadCount() {
    const response = await axiosInstance.get("/admin/notifications/unread-count");
    return response.data?.data?.count ?? 0;
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string) {
    const response = await axiosInstance.patch(`/admin/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications (or all in a category) as read.
   */
  async markAllAsRead(category?: string) {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    
    const response = await axiosInstance.patch(`/admin/notifications/read-all?${params}`);
    return response.data;
  },

  /**
   * Delete a notification for the current admin.
   */
  async deleteNotification(notificationId: string) {
    const response = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get current admin's notification preferences.
   */
  async getPreferences() {
    const response = await axiosInstance.get("/admin/notifications/preferences");
    return response.data?.data;
  },

  /**
   * Update admin's notification preferences.
   */
  async updatePreferences(data: {
    emailDigest?: boolean;
    soundEnabled?: boolean;
    mutedCategories?: string[];
    mutedTypes?: string[];
    chatThrottleSeconds?: number;
  }) {
    const response = await axiosInstance.patch("/admin/notifications/preferences", data);
    return response.data?.data;
  },
};

export default notificationService;
