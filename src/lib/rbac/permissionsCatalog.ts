import { Permission, PermissionModule } from "@/types/roles";
import { ALL_PERMISSION_IDS } from "@/lib/rbac/permissions";

// Comprehensive list of all permissions in the system
const rawPermissions: Permission[] = [
  // Dashboard
  {
    id: "dash-view",
    module: "Dashboard",
    action: "view",
    description: "View dashboard and analytics",
  },
  {
    id: "dash-export",
    module: "Dashboard",
    action: "export",
    description: "Export dashboard reports",
  },

  // Clients
  {
    id: "client-view",
    module: "Clients",
    action: "view",
    description: "View client list and details",
  },
  {
    id: "client-create",
    module: "Clients",
    action: "create",
    description: "Create new clients",
  },
  {
    id: "client-edit",
    module: "Clients",
    action: "edit",
    description: "Edit client information",
  },
  {
    id: "client-delete",
    module: "Clients",
    action: "delete",
    description: "Delete clients",
  },
  {
    id: "client-export",
    module: "Clients",
    action: "export",
    description: "Export client data",
  },
  {
    id: "client-assign",
    module: "Clients",
    action: "assign",
    description: "Assign or unassign admins as assignee/assigner",
  },

  // Application
  {
    id: "app-view",
    module: "Application",
    action: "view",
    description: "View application details",
  },
  {
    id: "app-create",
    module: "Application",
    action: "create",
    description: "Create applications",
  },
  {
    id: "app-edit",
    module: "Application",
    action: "edit",
    description: "Edit application details",
  },
  {
    id: "app-delete",
    module: "Application",
    action: "delete",
    description: "Delete applications",
  },

  // Company Overview
  {
    id: "company-view",
    module: "Company Overview",
    action: "view",
    description: "View company information",
  },
  {
    id: "company-edit",
    module: "Company Overview",
    action: "edit",
    description: "Edit company information",
  },
  {
    id: "company-export",
    module: "Company Overview",
    action: "export",
    description: "Export company data",
  },

  // Directors
  {
    id: "director-view",
    module: "Directors",
    action: "view",
    description: "View directors list and details",
  },
  {
    id: "director-create",
    module: "Directors",
    action: "create",
    description: "Add new directors",
  },
  {
    id: "director-edit",
    module: "Directors",
    action: "edit",
    description: "Edit director information",
  },
  {
    id: "director-delete",
    module: "Directors",
    action: "delete",
    description: "Remove directors",
  },
  {
    id: "director-export",
    module: "Directors",
    action: "export",
    description: "Export director data",
  },

  // Shareholders
  {
    id: "shareholder-view",
    module: "Shareholders",
    action: "view",
    description: "View shareholders list and details",
  },
  {
    id: "shareholder-create",
    module: "Shareholders",
    action: "create",
    description: "Add new shareholders",
  },
  {
    id: "shareholder-edit",
    module: "Shareholders",
    action: "edit",
    description: "Edit shareholder information",
  },
  {
    id: "shareholder-delete",
    module: "Shareholders",
    action: "delete",
    description: "Remove shareholders",
  },
  {
    id: "shareholder-export",
    module: "Shareholders",
    action: "export",
    description: "Export shareholder data",
  },

  // MOA/AOA
  {
    id: "moa-view",
    module: "MOA/AOA",
    action: "view",
    description: "View MOA/AOA documents",
  },
  {
    id: "moa-create",
    module: "MOA/AOA",
    action: "create",
    description: "Create MOA/AOA documents",
  },
  {
    id: "moa-edit",
    module: "MOA/AOA",
    action: "edit",
    description: "Edit MOA/AOA documents",
  },
  {
    id: "moa-delete",
    module: "MOA/AOA",
    action: "delete",
    description: "Delete MOA/AOA documents",
  },

  // Pricing & Payment
  {
    id: "pricing-view",
    module: "Pricing & Payment",
    action: "view",
    description: "View pricing and payment details",
  },
  {
    id: "pricing-edit",
    module: "Pricing & Payment",
    action: "edit",
    description: "Edit pricing and payment",
  },
  {
    id: "pricing-export",
    module: "Pricing & Payment",
    action: "export",
    description: "Export payment reports",
  },

  // Registration Documents
  {
    id: "reg-doc-view",
    module: "Registration Documents",
    action: "view",
    description: "View registration documents",
  },
  {
    id: "reg-doc-create",
    module: "Registration Documents",
    action: "create",
    description: "Upload registration documents",
  },
  {
    id: "reg-doc-edit",
    module: "Registration Documents",
    action: "edit",
    description: "Modify registration documents",
  },
  {
    id: "reg-doc-delete",
    module: "Registration Documents",
    action: "delete",
    description: "Delete registration documents",
  },

  // Tracking Status
  {
    id: "track-view",
    module: "Tracking Status",
    action: "view",
    description: "View tracking status",
  },
  {
    id: "track-edit",
    module: "Tracking Status",
    action: "edit",
    description: "Update tracking status",
  },

  // Uploaded Documents
  {
    id: "upload-view",
    module: "Uploaded Documents",
    action: "view",
    description: "View uploaded documents",
  },
  {
    id: "upload-create",
    module: "Uploaded Documents",
    action: "create",
    description: "Upload documents",
  },
  {
    id: "upload-delete",
    module: "Uploaded Documents",
    action: "delete",
    description: "Delete uploaded documents",
  },

  // Documents (Template Library)
  {
    id: "doc-view",
    module: "Documents",
    action: "view",
    description: "View document templates",
  },
  {
    id: "doc-create",
    module: "Documents",
    action: "create",
    description: "Create document templates",
  },
  {
    id: "doc-edit",
    module: "Documents",
    action: "edit",
    description: "Edit document templates",
  },
  {
    id: "doc-delete",
    module: "Documents",
    action: "delete",
    description: "Delete document templates",
  },

  // Messages
  {
    id: "msg-view",
    module: "Messages",
    action: "view",
    description: "View client messages",
  },
  {
    id: "msg-create",
    module: "Messages",
    action: "create",
    description: "Send messages to clients",
  },
  {
    id: "msg-delete",
    module: "Messages",
    action: "delete",
    description: "Delete messages",
  },

  // Marketing
  {
    id: "marketing-view",
    module: "Marketing",
    action: "view",
    description: "View marketing leads",
  },
  {
    id: "marketing-create",
    module: "Marketing",
    action: "create",
    description: "Create marketing leads",
  },
  {
    id: "marketing-edit",
    module: "Marketing",
    action: "edit",
    description: "Edit marketing leads",
  },
  {
    id: "marketing-delete",
    module: "Marketing",
    action: "delete",
    description: "Delete marketing leads",
  },
  {
    id: "marketing-export",
    module: "Marketing",
    action: "export",
    description: "Export marketing leads",
  },

  // Newsletter
  {
    id: "newsletter-view",
    module: "Newsletter",
    action: "view",
    description: "View newsletter subscribers",
  },
  {
    id: "newsletter-edit",
    module: "Newsletter",
    action: "edit",
    description: "Manage newsletter subscribers",
  },
  {
    id: "newsletter-delete",
    module: "Newsletter",
    action: "delete",
    description: "Delete newsletter subscribers",
  },
  {
    id: "newsletter-export",
    module: "Newsletter",
    action: "export",
    description: "Export newsletter data",
  },

  // Accounting
  {
    id: "accounting-view",
    module: "Accounting",
    action: "view",
    description: "View Razorpay payments, orders, refunds and settlements",
  },
  {
    id: "accounting-export",
    module: "Accounting",
    action: "export",
    description: "Export Razorpay accounting data",
  },

  // Feedbacks
  {
    id: "feedback-view",
    module: "Feedbacks",
    action: "view",
    description: "View client feedbacks",
  },
  {
    id: "feedback-export",
    module: "Feedbacks",
    action: "export",
    description: "Export client feedbacks to Excel",
  },

  // Tickets
  {
    id: "ticket-view",
    module: "Tickets",
    action: "view",
    description: "View raised tickets",
  },
  {
    id: "ticket-create",
    module: "Tickets",
    action: "create",
    description: "Create new tickets",
  },
  {
    id: "ticket-edit",
    module: "Tickets",
    action: "edit",
    description: "Edit and resolve tickets",
  },
  {
    id: "ticket-delete",
    module: "Tickets",
    action: "delete",
    description: "Delete tickets",
  },

  // Settings
  {
    id: "settings-view",
    module: "Settings",
    action: "view",
    description: "View settings",
  },
  {
    id: "settings-edit",
    module: "Settings",
    action: "edit",
    description: "Modify system settings",
  },

  // User Management
  {
    id: "user-view",
    module: "User Management",
    action: "view",
    description: "View users list",
  },
  {
    id: "user-create",
    module: "User Management",
    action: "create",
    description: "Create new users",
  },
  {
    id: "user-edit",
    module: "User Management",
    action: "edit",
    description: "Edit user information",
  },
  {
    id: "user-delete",
    module: "User Management",
    action: "delete",
    description: "Delete users",
  },

  // Roles & Permissions
  {
    id: "role-view",
    module: "Roles & Permissions",
    action: "view",
    description: "View roles and permissions",
  },
  {
    id: "role-create",
    module: "Roles & Permissions",
    action: "create",
    description: "Create custom roles",
  },
  {
    id: "role-edit",
    module: "Roles & Permissions",
    action: "edit",
    description: "Edit roles and permissions",
  },
  {
    id: "role-delete",
    module: "Roles & Permissions",
    action: "delete",
    description: "Delete custom roles",
  },

  // Audit Logs / System Activity Logs
  {
    id: "activity-logs.view",
    module: "Audit Logs",
    action: "view",
    description: "View system activity logs",
  },
  {
    id: "activity-logs.export",
    module: "Audit Logs",
    action: "export",
    description: "Export system activity logs",
  },

  // Reports
  {
    id: "report-view",
    module: "Reports",
    action: "view",
    description: "View reports",
  },
  {
    id: "report-create",
    module: "Reports",
    action: "create",
    description: "Generate reports",
  },
  {
    id: "report-export",
    module: "Reports",
    action: "export",
    description: "Export reports",
  },
];

const knownPermissionIds = new Set<string>(ALL_PERMISSION_IDS);

export const allPermissions: Permission[] = rawPermissions.filter((p) =>
  knownPermissionIds.has(p.id),
);

export function getPermissionsByModule(): Record<PermissionModule, Permission[]> {
  const grouped: Partial<Record<PermissionModule, Permission[]>> = {};

  allPermissions.forEach((permission) => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module]!.push(permission);
  });

  return grouped as Record<PermissionModule, Permission[]>;
}
