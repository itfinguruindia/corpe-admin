import axiosInstance from "@/lib/axios";
import { PackageType, PaymentStatus, PlanType } from "@/types/pricingPayment";

export type PricingSummaryResponse = {
  applicationNo: string;
  companyName?: string;
  entityType?: string;
  companyType?: string;
  companyTypeLabel?: string;
  plan: PlanType;
  packageType: PackageType;
  status: PaymentStatus;
  baseServiceFee: number;
  discountAmount: number;
  totalPayable: number;
  gstAmount: number;
  totalWithGST: number;
  amountPaid: number;
  remainingBalance: number;
  finalPayableWithoutGST: number;
  finalPayableWithGST: number;
  currency?: string;
};

export type PaymentStep = {
  stepNumber: number;
  installmentName: string;
  amount: number;
  triggerGate: string;
  effects: string;
  status: "paid" | "pending" | "failed" | "due";
  orderId?: string;
  invoiceAvailable?: boolean;
  paymentLinkSent?: boolean;
  paymentLinkSentAt?: string | null;
  breakdown?: {
    rejectionFee?: number;
    installmentBase?: number;
    installmentGST?: number;
    installmentTotal?: number;
    indianCount?: number;
    indianRate?: number;
    foreignCount?: number;
    foreignRate?: number;
    nonShareholderCount?: number;
    nonShareholderRate?: number;
    dinCount?: number;
    dinRate?: number;
    dinTotal?: number;
    gstAmount?: number;
    gstPercentage?: number;
    currency?: string;
  };
};

export interface PricingAndPaymentResponse {
  summary: PricingSummaryResponse;
  steps: PaymentStep[];
}

export const pricingPaymentService = {
  async getPricingAndPayment(applicationNo: string): Promise<PricingAndPaymentResponse | null> {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: PricingAndPaymentResponse }>(
        `/admin/clients/${applicationNo}/pricing-and-payment`
      );
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching pricing and payment data:", error);
      return null;
    }
  },

  async sendPaymentLink(applicationNo: string, stageNumber: number): Promise<boolean> {
    try {
      const response = await axiosInstance.post<{ success: boolean }>(
        `/admin/clients/${applicationNo}/payment-link/send`,
        { stageNumber }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error sending payment link:", error);
      return false;
    }
  },
};
