import axiosInstance from "@/lib/axios";
import { Role } from "@/types/roles";

// Role API endpoints
export const roleApi = {
  // Get all roles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get("/roles");
    return response.data.data;
  },

  // Get role by ID
  getRoleById: async (roleId: string): Promise<Role> => {
    const response = await axiosInstance.get(`/roles/${roleId}`);
    return response.data.data;
  },

  // Create new role
  createRole: async (roleData: {
    name: string;
    description: string;
    permissions: string[];
    color?: string;
  }): Promise<Role> => {
    const response = await axiosInstance.post("/roles", roleData);
    return response.data.data.role;
  },

  // Update role
  updateRole: async (
    roleId: string,
    roleData: {
      name?: string;
      description?: string;
      permissions?: string[];
      color?: string;
    },
  ): Promise<Role> => {
    const response = await axiosInstance.put(`/roles/${roleId}`, roleData);
    return response.data.data.role;
  },

  // Delete role
  deleteRole: async (roleId: string): Promise<void> => {
    await axiosInstance.delete(`/roles/${roleId}`);
  },

  // Get role permissions
  getRolePermissions: async (roleId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/roles/${roleId}/permissions`);
    return response.data.data.permissions;
  },
};
