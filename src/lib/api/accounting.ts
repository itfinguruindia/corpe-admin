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
  export?: boolean;
}

export type SmsUsageByDate = {
  date: string;
  count: number;
  segments: number;
  cost: number;
};

export type SmsUsageByNumber = {
  to: string;
  count: number;
  segments: number;
  cost: number;
};

export type SmsUsageReport = {
  startDate: string;
  endDate: string;
  truncated: boolean;
  fetchedCount: number;
  fetchCap: number;
  totals: {
    totalMessages: number;
    totalSegments: number;
    totalCost: number;
    priceUnit: string;
  };
  byDate: SmsUsageByDate[];
  byNumber: SmsUsageByNumber[];
};

export type SmsUsageTopNumbersResponse = {
  startDate: string;
  endDate: string;
  truncated: boolean;
  fetchedCount: number;
  fetchCap: number;
  totals: SmsUsageReport["totals"];
  topNumbers: SmsUsageByNumber[];
};

export type OtpSessionRow = {
  phone: string;
  ips: string[];
  attemptCount: number;
  sentCount: number;
  totalSmsSent: number;
  sources: string[];
  lastAttemptAt: string;
  blocked: boolean;
  blockedUntil: string | null;
  blockReason: string | null;
};

export type OtpBlockedIpRow = {
  ip: string;
  blockedUntil: string;
  reason: string;
  createdAt: string;
};

export type OtpSessionsResponse = {
  sessions: OtpSessionRow[];
  blockedIps: OtpBlockedIpRow[];
};

function unwrapData<T>(payload: unknown): T {
  const body = payload as { data?: T };
  return (body?.data ?? payload) as T;
}

function withExportParams(params: RazorpayListParams = {}): RazorpayListParams {
  if (!params.export) return params;
  return { ...params, export: true };
}

export const accountingApi = {
  listPayments: async (
    params: RazorpayListParams = {},
  ): Promise<RazorpayListResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/razorpay/payments",
      { params: withExportParams(params) },
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
      { params: withExportParams(params) },
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
      { params: withExportParams(params) },
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
      { params: withExportParams(params) },
    );
    return unwrapData(response.data);
  },

  getSettlement: async (settlementId: string): Promise<RazorpayEntity> => {
    const response = await axiosInstance.get(
      `/admin/accounting/razorpay/settlements/${settlementId}`,
    );
    return unwrapData(response.data);
  },

  getSmsUsage: async (params: {
    startDate: string;
    endDate: string;
    orgFilterNumbers?: string;
  }): Promise<SmsUsageReport> => {
    const response = await axiosInstance.get("/admin/accounting/sms-usage", {
      params,
      // Live Twilio pagination can exceed the default 10s axios timeout.
      timeout: 120000,
    });
    return unwrapData(response.data);
  },

  getSmsUsageTopNumbers: async (params: {
    startDate: string;
    endDate: string;
    limit?: number;
    orgFilterNumbers?: string;
  }): Promise<SmsUsageTopNumbersResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/sms-usage/top-numbers",
      { params, timeout: 120000 },
    );
    return unwrapData(response.data);
  },

  getOtpSessions: async (): Promise<OtpSessionsResponse> => {
    const response = await axiosInstance.get(
      "/admin/accounting/sms-usage/otp-sessions",
    );
    return unwrapData(response.data);
  },

  clearOtpSession: async (params: {
    phone?: string;
    ip?: string;
  }): Promise<{
    phone?: { phone: string; deletedAttempts: number; clearedIps: string[] };
    ip?: { ip: string; deletedAttempts: number };
  }> => {
    const response = await axiosInstance.post(
      "/admin/accounting/sms-usage/otp-sessions/clear",
      params,
    );
    return unwrapData(response.data);
  },
};
