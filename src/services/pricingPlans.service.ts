import axiosInstance from "@/lib/axios";
import type {
  AdminPricingPlan,
  PricingPlanUpdateRequest,
} from "@/types/pricingPlans";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const pricingPlansService = {
  async getAllPlans(): Promise<AdminPricingPlan[]> {
    const response = await axiosInstance.get<ApiResponse<AdminPricingPlan[]>>(
      "/pricing/plans",
    );
    return response.data.data || [];
  },

  async updatePlan(
    planId: string,
    payload: PricingPlanUpdateRequest,
  ): Promise<AdminPricingPlan> {
    const response = await axiosInstance.put<ApiResponse<AdminPricingPlan>>(
      `/pricing/plans/${planId}`,
      payload,
    );
    return response.data.data;
  },
};
