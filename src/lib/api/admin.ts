import axiosInstance from "@/lib/axios";

// Admin API endpoints
export const adminApi = {
  // Get assignee and assigner list (with optional search)
  getAssigneeAndAssigner: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await axiosInstance.get("/admin/getAssigneeAndAssigner", {
      params,
    });
    return response.data.data as {
      assignee: { _id: string; name: string; assigneeCount: number }[];
      assigner: { _id: string; name: string; assignerCount: number }[];
    };
  },

  // Get all admins
  getAllAdmins: async () => {
    const response = await axiosInstance.get("/admin");
    return response.data.data;
  },

  // Update admin role
  updateAdminRole: async (adminId: string, roleId: string) => {
    const response = await axiosInstance.put(`/admin/${adminId}/role`, {
      roleId,
    });
    return response.data.data.admin;
  },

  // Toggle admin status
  toggleAdminStatus: async (adminId: string) => {
    const response = await axiosInstance.put(`/admin/${adminId}/toggle-status`);
    return response.data.data.admin;
  },

  // Update admin status to specific value
  updateAdminStatus: async (
    adminId: string,
    status: "active" | "in-active" | "suspended",
  ) => {
    const response = await axiosInstance.put(`/admin/${adminId}/status`, {
      status,
    });
    return response.data.data.admin;
  },

  // Register new admin
  registerAdmin: async (adminData: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    roleId?: string;
  }) => {
    const response = await axiosInstance.post(
      "/admin/auth/register",
      adminData,
    );
    return response.data.data.admin;
  },

  // Get Dashboard Data
  getDashboardData: async () => {
    try {
      const response = await axiosInstance.get("/admin/getDashboardData");
      return response.data.data;
    } catch (error) {}
  },
};
