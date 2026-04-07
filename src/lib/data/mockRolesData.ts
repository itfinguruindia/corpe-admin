import {
  Permission,
  Role,
  RolePermissionMatrix,
  PermissionModule,
  User,
} from "@/types/roles";

// Comprehensive list of all permissions in the system
export const allPermissions: Permission[] = [
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

  // Audit Logs
  {
    id: "audit-view",
    module: "Audit Logs",
    action: "view",
    description: "View audit logs",
  },
  {
    id: "audit-export",
    module: "Audit Logs",
    action: "export",
    description: "Export audit logs",
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

// Predefined system roles
export const systemRoles: Role[] = [
  {
    _id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions",
    isSystemRole: true,
    permissions: allPermissions.map((p) => p.id), // All permissions
    userCount: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#E91E63",
    __v: 0,
  },
  {
    _id: "2",
    name: "Admin",
    description: "Administrative access with most permissions",
    isSystemRole: true,
    permissions: allPermissions
      .filter(
        (p) => !["role-delete", "user-delete", "settings-edit"].includes(p.id),
      )
      .map((p) => p.id),
    userCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#3D63A4",
    __v: 0,
  },
  {
    _id: "3",
    name: "Manager",
    description:
      "Manage clients and applications with limited administrative access",
    isSystemRole: true,
    permissions: [
      "dash-view",
      "dash-export",
      "client-view",
      "client-create",
      "client-edit",
      "client-export",
      "app-view",
      "app-create",
      "app-edit",
      "company-view",
      "company-edit",
      "director-view",
      "director-create",
      "director-edit",
      "director-export",
      "shareholder-view",
      "shareholder-create",
      "shareholder-edit",
      "shareholder-export",
      "moa-view",
      "moa-create",
      "moa-edit",
      "pricing-view",
      "pricing-edit",
      "pricing-export",
      "reg-doc-view",
      "reg-doc-create",
      "reg-doc-edit",
      "track-view",
      "track-edit",
      "upload-view",
      "upload-create",
      "doc-view",
      "msg-view",
      "msg-create",
      "ticket-view",
      "ticket-create",
      "ticket-edit",
      "user-view",
      "report-view",
      "report-create",
      "report-export",
    ],
    userCount: 8,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#FF9800",
    __v: 0,
  },
  {
    _id: "4",
    name: "Accountant",
    description: "Access to financial and payment information",
    isSystemRole: true,
    permissions: [
      "dash-view",
      "client-view",
      "app-view",
      "company-view",
      "pricing-view",
      "pricing-edit",
      "pricing-export",
      "track-view",
      "report-view",
      "report-export",
    ],
    userCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#4CAF50",
    __v: 0,
  },
  {
    _id: "5",
    name: "Operator",
    description: "Day-to-day operations and document handling",
    isSystemRole: true,
    permissions: [
      "dash-view",
      "client-view",
      "app-view",
      "company-view",
      "director-view",
      "director-create",
      "director-edit",
      "shareholder-view",
      "shareholder-create",
      "shareholder-edit",
      "moa-view",
      "moa-create",
      "reg-doc-view",
      "reg-doc-create",
      "track-view",
      "upload-view",
      "upload-create",
      "doc-view",
      "msg-view",
      "msg-create",
      "ticket-view",
      "ticket-create",
    ],
    userCount: 12,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#2196F3",
    __v: 0,
  },
  {
    _id: "6",
    name: "Viewer",
    description: "Read-only access to view information",
    isSystemRole: true,
    permissions: [
      "dash-view",
      "client-view",
      "app-view",
      "company-view",
      "director-view",
      "shareholder-view",
      "moa-view",
      "pricing-view",
      "reg-doc-view",
      "track-view",
      "upload-view",
      "doc-view",
      "msg-view",
      "ticket-view",
    ],
    userCount: 6,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    color: "#9E9E9E",
    __v: 0,
  },
];

// Custom roles (created by users)
export const customRoles: Role[] = [
  {
    _id: "7",
    name: "Client Support",
    description: "Handle client communications and basic updates",
    isSystemRole: false,
    permissions: [
      "client-view",
      "app-view",
      "company-view",
      "track-view",
      "msg-view",
      "msg-create",
      "ticket-view",
      "ticket-create",
      "ticket-edit",
    ],
    userCount: 4,
    createdAt: "2024-02-15T10:30:00Z",
    updatedAt: "2024-02-20T14:22:00Z",
    color: "#00BCD4",
    __v: 0,
  },
  {
    _id: "8",
    name: "Document Specialist",
    description: "Specialized in document management and templates",
    isSystemRole: false,
    permissions: [
      "doc-view",
      "doc-create",
      "doc-edit",
      "upload-view",
      "upload-create",
      "reg-doc-view",
      "reg-doc-create",
      "reg-doc-edit",
      "moa-view",
      "moa-create",
      "moa-edit",
    ],
    userCount: 2,
    createdAt: "2024-03-01T09:15:00Z",
    updatedAt: "2024-03-01T09:15:00Z",
    color: "#673AB7",
    __v: 0,
  },
];

// All roles combined
export const allRoles: Role[] = [...systemRoles, ...customRoles];

// Mock users (admins)
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Shaili Mehta",
    email: "shaili.mehta@example.com",
    roleId: 1,
    role: "Super Admin",
    status: "active",
    lastLogin: "2024-02-11T15:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "Raj Patel",
    email: "raj.patel@example.com",
    roleId: 2,
    role: "Admin",
    status: "active",
    lastLogin: "2024-02-12T09:20:00Z",
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "user-3",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    roleId: 3,
    role: "Manager",
    status: "active",
    lastLogin: "2024-02-11T18:45:00Z",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "user-4",
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    roleId: 4,
    role: "Accountant",
    status: "active",
    lastLogin: "2024-02-10T14:30:00Z",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "user-5",
    name: "Neha Desai",
    email: "neha.desai@example.com",
    roleId: 5,
    role: "Operator",
    status: "active",
    lastLogin: "2024-02-12T08:15:00Z",
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "user-6",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    roleId: 5,
    role: "Operator",
    status: "active",
    lastLogin: "2024-02-11T16:20:00Z",
    createdAt: "2024-01-22T00:00:00Z",
  },
  {
    id: "user-7",
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    roleId: 3,
    role: "Manager",
    status: "active",
    lastLogin: "2024-02-12T10:45:00Z",
    createdAt: "2024-01-25T00:00:00Z",
  },
  {
    id: "user-8",
    name: "Karan Malhotra",
    email: "karan.malhotra@example.com",
    roleId: 6,
    role: "Viewer",
    status: "active",
    lastLogin: "2024-02-09T14:10:00Z",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "user-9",
    name: "Divya Kapoor",
    email: "divya.kapoor@example.com",
    roleId: 7,
    role: "Client Support",
    status: "active",
    lastLogin: "2024-02-12T11:30:00Z",
    createdAt: "2024-02-03T00:00:00Z",
  },
  {
    id: "user-10",
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    roleId: 5,
    role: "Operator",
    status: "in-active",
    lastLogin: "2024-01-28T09:15:00Z",
    createdAt: "2024-01-28T00:00:00Z",
  },
  {
    id: "user-11",
    name: "Sneha Iyer",
    email: "sneha.iyer@example.com",
    roleId: 8,
    role: "Document Specialist",
    status: "active",
    lastLogin: "2024-02-11T13:20:00Z",
    createdAt: "2024-02-05T00:00:00Z",
  },
  {
    id: "user-12",
    name: "Arjun Nair",
    email: "arjun.nair@example.com",
    roleId: 4,
    role: "Accountant",
    status: "active",
    lastLogin: "2024-02-12T09:00:00Z",
    createdAt: "2024-02-07T00:00:00Z",
  },
  {
    id: "user-13",
    name: "Pooja Gupta",
    email: "pooja.gupta@example.com",
    roleId: 5,
    role: "Operator",
    status: "suspended",
    lastLogin: "2024-02-05T10:30:00Z",
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "user-14",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    roleId: 6,
    role: "Viewer",
    status: "active",
    lastLogin: "2024-02-12T07:45:00Z",
    createdAt: "2024-02-08T00:00:00Z",
  },
  {
    id: "user-15",
    name: "Maya Krishnan",
    email: "maya.krishnan@example.com",
    roleId: 3,
    role: "Manager",
    status: "active",
    lastLogin: "2024-02-11T17:30:00Z",
    createdAt: "2024-02-10T00:00:00Z",
  },
];

// Group permissions by module
export const getPermissionsByModule = (): Record<
  PermissionModule,
  Permission[]
> => {
  const grouped: Partial<Record<PermissionModule, Permission[]>> = {};

  allPermissions.forEach((permission) => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module]!.push(permission);
  });

  return grouped as Record<PermissionModule, Permission[]>;
};

// Fetch role permission matrix
export const fetchRolePermissionMatrix =
  async (): Promise<RolePermissionMatrix> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      roles: allRoles,
      permissions: allPermissions,
      permissionsByModule: getPermissionsByModule(),
    };
  };

// Fetch single role
export const fetchRole = async (roleId: number): Promise<Role | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return allRoles.find((role) => Number(role._id) === roleId) || null;
};

// Fetch users by role
export const fetchUsersByRole = async (roleId: number): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockUsers.filter((user) => user.roleId === roleId);
};

// Fetch all users
export const fetchAllUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockUsers;
};
