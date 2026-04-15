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
};
