import axiosInstance from "@/lib/axios";

export interface Newsletter {
  _id: string;
  email: string;
  subscribeCount: number;
  createdAt: string;
  updatedAt: string;
}

export const newsletterApi = {
  getAll: async (): Promise<Newsletter[]> => {
    const res = await axiosInstance.get("/admin/newsletter");
    return res.data.data;
  },
  addOrUpdate: async (email: string): Promise<Newsletter> => {
    const res = await axiosInstance.post("/admin/newsletter", { email });
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/newsletter/${id}`);
  },
  export: async (): Promise<Newsletter[]> => {
    const res = await axiosInstance.get("/admin/newsletter/export");
    return res.data.data;
  },
};
