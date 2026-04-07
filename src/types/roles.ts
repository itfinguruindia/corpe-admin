// Permission categories based on application modules
export type PermissionModule =
  | "Dashboard"
  | "Clients"
  | "Application"
  | "Company Overview"
  | "Directors"
  | "Shareholders"
  | "MOA/AOA"
  | "Pricing & Payment"
  | "Registration Documents"
  | "Tracking Status"
  | "Uploaded Documents"
  | "Documents"
  | "Messages"
  | "Tickets"
  | "Settings"
  | "User Management"
  | "Roles & Permissions"
  | "Audit Logs"
  | "Reports";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

export interface Permission {
  id: string;
  module: PermissionModule;
  action: PermissionAction;
  description: string;
}

export interface Role {
  id?: string | number;
  _id?: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  color: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface RolePermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  // Grouped permissions by module for easier display
  permissionsByModule: Record<PermissionModule, Permission[]>;
}

export interface User {
  _id?: string; // Backend uses _id
  id?: string; // Keep for backward compatibility
  name: string;
  email: string;
  roleId?: number | string; // Can be number (mock) or string (backend _id)
  role?: string | Role; // Role name or populated Role object
  isSuperAdmin?: boolean; // Flag for super admin
  status: "active" | "in-active" | "suspended";
  lastLogin?: string;
  createdAt: string;
}
