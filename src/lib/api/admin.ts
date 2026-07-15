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

  // Delete admin user
  deleteAdmin: async (adminId: string) => {
    const response = await axiosInstance.delete(`/admin/${adminId}`);
    return response.data;
  },

  // Super-admin: fetch login details including exact recoverable password
  getAdminLoginDetails: async (adminId: string) => {
    const response = await axiosInstance.get(`/admin/${adminId}/login-details`);
    return response.data.data.admin as {
      _id: string;
      name: string;
      email: string;
      phoneNumber?: string;
      countryCode?: string;
      isSuperAdmin?: boolean;
      status?: string;
      password: string | null;
    };
  },

  // Super-admin: set exact login password (also makes it viewable)
  setAdminPassword: async (adminId: string, password: string) => {
    const response = await axiosInstance.post(
      `/admin/${adminId}/temporary-password`,
      { password },
    );
    return response.data.data as {
      _id: string;
      name: string;
      email: string;
      phoneNumber?: string;
      countryCode?: string;
      password: string;
    };
  },

  // Super-admin: switch session into another admin (no password needed)
  loginAsAdmin: async (adminId: string) => {
    const response = await axiosInstance.post(`/admin/${adminId}/login-as`);
    return response.data.data as {
      accessToken: string;
      refreshToken: string;
      admin: {
        id: string;
        name: string;
        email: string;
        phoneNumber?: string;
        countryCode?: string;
        profilePicture?: string | null;
        isSuperAdmin?: boolean;
        role?: unknown;
        permissions?: string[];
      };
    };
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
    const response = await axiosInstance.get("/admin/getDashboardData");
    return response.data.data as {
      totalApplication: number;
      pendingApplication: number;
      approveNameApplication: number;
      rejectedOrResubmitted: number;
    };
  },
};
