import axiosInstance from "@/lib/axios";

export interface Lead {
  _id: string;
  selectedCompany: string;
  phone: string;
  message: string;
  lastName: string;
  gclid: string;
  firstName: string;
  fbclid: string;
  email: string;
  createdtime: string;
  country: string;
  companyName: string;
  clientWebsite: string;
  UTMSource: string;
  UTMMedium: string;
  URL: string;
  CountryCode: string;
  ipAddress: string;
  currentLat: number;
  currentLng: number;
  formType: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Marketing API endpoints
export const marketingApi = {
  /**
   * Get all marketing leads with pagination and filters
   */
  getAllLeads: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    country?: string,
  ): Promise<LeadsResponse> => {
    const params: any = {
      page,
      limit,
    };

    if (search) {
      params.search = search;
    }

    if (country) {
      params.country = country;
    }

    const response = await axiosInstance.get("/admin/marketing", {
      params,
    });
    return response.data.data;
  },

  /**
   * Get a single lead by ID
   */
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.get(`/admin/marketing/${id}`);
    return response.data.data;
  },

  /**
   * Create a new lead
   */
  createLead: async (leadData: Partial<Lead>): Promise<Lead> => {
    const response = await axiosInstance.post("/admin/marketing", leadData);
    return response.data.data;
  },

  /**
   * Update a lead
   */
  updateLead: async (id: string, updateData: Partial<Lead>): Promise<Lead> => {
    const response = await axiosInstance.patch(
      `/admin/marketing/${id}`,
      updateData,
    );
    return response.data.data;
  },

  /**
   * Delete a single lead
   */
  deleteLead: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/marketing/${id}`);
  },

  /**
   * Delete multiple leads
   */
  deleteMultipleLeads: async (
    ids: string[],
  ): Promise<{ deletedCount: number }> => {
    const response = await axiosInstance.delete("/admin/marketing/bulk", {
      data: { ids },
    });
    return response.data.data;
  },

  /**
   * Get leads count by country
   */
  getLeadsStatsByCountry: async (): Promise<
    Array<{ country: string; count: number }>
  > => {
    const response = await axiosInstance.get(
      "/admin/marketing/stats/by-country",
    );
    return response.data.data;
  },
};
