/**
 * Central permission ID constants — single source of truth for frontend + backend.
 * Convention: `{module}-{action}` or dotted IDs for nested modules (e.g. activity-logs.view).
 */
export const PERMISSIONS = {
  ALL: "*",

  // Dashboard
  DASH_VIEW: "dash-view",
  DASH_EXPORT: "dash-export",

  // Clients
  CLIENT_VIEW: "client-view",
  CLIENT_CREATE: "client-create",
  CLIENT_EDIT: "client-edit",
  CLIENT_DELETE: "client-delete",
  CLIENT_EXPORT: "client-export",

  // Application (client sub-routes)
  APP_VIEW: "app-view",
  APP_CREATE: "app-create",
  APP_EDIT: "app-edit",
  APP_DELETE: "app-delete",

  // Company overview (client tab)
  COMPANY_VIEW: "company-view",
  COMPANY_EDIT: "company-edit",
  COMPANY_EXPORT: "company-export",

  // Directors (client tab)
  DIRECTOR_VIEW: "director-view",
  DIRECTOR_CREATE: "director-create",
  DIRECTOR_EDIT: "director-edit",
  DIRECTOR_DELETE: "director-delete",
  DIRECTOR_EXPORT: "director-export",

  // Shareholders (client tab)
  SHAREHOLDER_VIEW: "shareholder-view",
  SHAREHOLDER_CREATE: "shareholder-create",
  SHAREHOLDER_EDIT: "shareholder-edit",
  SHAREHOLDER_DELETE: "shareholder-delete",
  SHAREHOLDER_EXPORT: "shareholder-export",

  // MOA/AOA (client tab)
  MOA_VIEW: "moa-view",
  MOA_CREATE: "moa-create",
  MOA_EDIT: "moa-edit",
  MOA_DELETE: "moa-delete",

  // Pricing & payment (client tab)
  PRICING_VIEW: "pricing-view",
  PRICING_EDIT: "pricing-edit",
  PRICING_EXPORT: "pricing-export",

  // Registration documents (client tab)
  REG_DOC_VIEW: "reg-doc-view",
  REG_DOC_CREATE: "reg-doc-create",
  REG_DOC_EDIT: "reg-doc-edit",
  REG_DOC_DELETE: "reg-doc-delete",

  // Tracking status (client tab)
  TRACK_VIEW: "track-view",
  TRACK_EDIT: "track-edit",

  // Uploaded documents (client tab)
  UPLOAD_VIEW: "upload-view",
  UPLOAD_CREATE: "upload-create",
  UPLOAD_DELETE: "upload-delete",

  // Documents
  DOC_VIEW: "doc-view",
  DOC_CREATE: "doc-create",
  DOC_EDIT: "doc-edit",
  DOC_DELETE: "doc-delete",

  // Messages / Chat
  MSG_VIEW: "msg-view",
  MSG_CREATE: "msg-create",
  MSG_DELETE: "msg-delete",

  // Tickets
  TICKET_VIEW: "ticket-view",
  TICKET_CREATE: "ticket-create",
  TICKET_EDIT: "ticket-edit",
  TICKET_DELETE: "ticket-delete",

  // Marketing & Newsletter (admin panel)
  MARKETING_VIEW: "marketing-view",
  MARKETING_CREATE: "marketing-create",
  MARKETING_EDIT: "marketing-edit",
  MARKETING_DELETE: "marketing-delete",
  MARKETING_EXPORT: "marketing-export",

  NEWSLETTER_VIEW: "newsletter-view",
  NEWSLETTER_EDIT: "newsletter-edit",
  NEWSLETTER_DELETE: "newsletter-delete",
  NEWSLETTER_EXPORT: "newsletter-export",

  // Feedbacks
  FEEDBACK_VIEW: "feedback-view",

  // Settings
  SETTINGS_VIEW: "settings-view",
  SETTINGS_EDIT: "settings-edit",

  // User management
  USER_VIEW: "user-view",
  USER_CREATE: "user-create",
  USER_EDIT: "user-edit",
  USER_DELETE: "user-delete",

  // Roles
  ROLE_VIEW: "role-view",
  ROLE_CREATE: "role-create",
  ROLE_EDIT: "role-edit",
  ROLE_DELETE: "role-delete",

  // Activity / audit logs
  ACTIVITY_LOGS_VIEW: "activity-logs.view",
  ACTIVITY_LOGS_EXPORT: "activity-logs.export",
  AUDIT_VIEW: "audit-view",
  AUDIT_EXPORT: "audit-export",

  // Reports
  REPORT_VIEW: "report-view",
  REPORT_CREATE: "report-create",
  REPORT_EXPORT: "report-export",
} as const;

export type PermissionId = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All defined permission string values (excludes ALL wildcard). */
export const ALL_PERMISSION_IDS: PermissionId[] = Object.values(PERMISSIONS).filter(
  (p) => p !== PERMISSIONS.ALL,
) as PermissionId[];

/** Legacy aliases grouped for route/API checks */
export const ACTIVITY_LOG_VIEW_IDS = [
  PERMISSIONS.ACTIVITY_LOGS_VIEW,
  PERMISSIONS.AUDIT_VIEW,
] as const;

export const ACTIVITY_LOG_EXPORT_IDS = [
  PERMISSIONS.ACTIVITY_LOGS_EXPORT,
  PERMISSIONS.AUDIT_EXPORT,
] as const;
