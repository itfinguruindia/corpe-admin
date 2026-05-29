export type ActivityLogStatus = "success" | "failed" | "warning";

export type ActivityLogType =
  | "login"
  | "logout"
  | "login_failed"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "status_change"
  | "permission_change"
  | "settings_change"
  | "export"
  | "view"
  | "upload"
  | "download"
  | "assign"
  | "unassign"
  | "other";

export interface ActivityLog {
  _id: string;
  adminId?: string;
  adminName: string;
  adminEmail?: string;
  roleId?: string;
  roleName?: string;
  isSuperAdmin?: boolean;
  activityType: ActivityLogType;
  module: string;
  description: string;
  status: ActivityLogStatus;
  requestMethod?: string;
  apiEndpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  browserInfo?: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  errorDetails?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogsListResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityLogFilterOptions {
  modules: string[];
  activityTypes: string[];
  statuses: string[];
  admins: Array<{ id: string; name: string; email?: string }>;
  roles: Array<{ id: string; name: string }>;
}

export interface ActivityLogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  activityType?: string;
  module?: string;
  status?: string;
  adminId?: string;
  roleId?: string;
  endpoint?: string;
  dateFrom?: string;
  dateTo?: string;
  preset?: "today" | "last7" | "last30";
  sort?: "asc" | "desc";
}
