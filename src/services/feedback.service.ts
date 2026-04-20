import axiosInstance from "@/lib/axios";

export interface IFeedbackItem {
  _id: string;
  appNo: string;
  rating: number;
  feedback: string;
  clientName: string;
  entityType: string;
  createdAt: string;
}

export interface IFeedbackResponse {
  data: IFeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const feedbackService = {
  async getAllFeedbacks(params?: { search?: string; rating?: string; page?: number; limit?: number }) {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: IFeedbackResponse }>("admin/feedbacks", {
        params,
      });
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      return null;
    }
  },
};
