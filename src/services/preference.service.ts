import axiosInstance from "@/lib/axios";
import { AdminPreferences } from "@/types/admin";

export const fetchAdminPreferences = async (): Promise<AdminPreferences> => {
  const response = await axiosInstance.get('/auth/admin-preferences');
  return response.data.data;
};

export const updateAdminPreferences = async (
  updates: Partial<AdminPreferences>
): Promise<AdminPreferences> => {
  const response = await axiosInstance.put('/auth/admin-preferences', updates);
  return response.data.data;
};
