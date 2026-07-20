import axiosInstance from "@/lib/axios";

export type RazorpayEntity = Record<string, unknown> & {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: number;
  order_id?: string;
  payment_id?: string;
  method?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, unknown> | unknown[];
  receipt?: string;
  attempts?: number;
  amount_paid?: number;
  amount_due?: number;
};

export interface RazorpayListResponse {
  entity: string;
  count: number;
  items: RazorpayEntity[];
}

export interface RazorpayListParams {
  count?: number;
  skip?: number;
  from?: number;
  to?: number;
}

function unwrapData<T>(payload: unknown): T {
  const body = payload as { data?: T };
  return (body?.data ?? payload) as T;
}

export const accountingApi = {
  listPayments: async (
    params: RazorpayListParams = {},
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/razorpay/payments",
      { params },
    );
    return unwrapData(response.data);
  },

  getPayment: async (paymentId: string): Promise<RazorpayEntity> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/payments/${paymentId}`,
    );
    return unwrapData(response.data);
  },

  listOrders: async (
    params: RazorpayListParams = {},
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/razorpay/orders",
      { params },
    );
    return unwrapData(response.data);
  },

  getOrder: async (orderId: string): Promise<RazorpayEntity> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/orders/${orderId}`,
    );
    return unwrapData(response.data);
  },

  getOrderPayments: async (
    orderId: string,
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/orders/${orderId}/payments`,
    );
    return unwrapData(response.data);
  },

  listRefunds: async (
    params: RazorpayListParams = {},
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/razorpay/refunds",
      { params },
    );
    return unwrapData(response.data);
  },

  getRefund: async (refundId: string): Promise<RazorpayEntity> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/refunds/${refundId}`,
    );
    return unwrapData(response.data);
  },

  listSettlements: async (
    params: RazorpayListParams = {},
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/razorpay/settlements",
      { params },
    );
    return unwrapData(response.data);
  },

  getSettlement: async (settlementId: string): Promise<RazorpayEntity> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/settlements/${settlementId}`,
    );
    return unwrapData(response.data);
  },
};
