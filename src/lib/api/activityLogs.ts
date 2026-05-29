import axiosInstance from "@/lib/axios";
import type {
  ActivityLog,
  ActivityLogFilterOptions,
  ActivityLogsListResponse,
  ActivityLogsQueryParams,
} from "@/types/activityLog";

export const activityLogsApi = {
  getLogs: async (
    params: ActivityLogsQueryParams = {},
  ): Promise<ActivityLogsListResponse> => {
    const response = await axiosInstance.get("/admin/activity-logs", {
      params,
    });
    return response.data.data;
  },

  getLogById: async (id: string): Promise<ActivityLog> => {
    const response = await axiosInstance.get(`/admin/activity-logs/${id}`);
    return response.data.data;
  },

  getFilterOptions: async (): Promise<ActivityLogFilterOptions> => {
    const response = await axiosInstance.get("/admin/activity-logs/filters");
    return response.data.data;
  },

  exportLogs: async (
    params: ActivityLogsQueryParams = {},
  ): Promise<ActivityLog[]> => {
    const response = await axiosInstance.get("/admin/activity-logs/export", {
      params,
    });
    return response.data.data.logs;
  },

  recordLogout: async (): Promise<void> => {
    await axiosInstance.post("/admin/activity-logs/logout");
  },

  trackPageView: async (payload: {
    module: string;
    description: string;
    activityType?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    await axiosInstance.post("/admin/activity-logs/track", payload);
  },
};
