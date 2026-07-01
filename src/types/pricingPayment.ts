export type PlanType = "Normal" | "Advance";
export type PackageType = "Full Payment" | "Installment";
export type PaymentStatus = "Complete" | "Active" | "Awaiting" | "Blocked";
export type StepStatus = "Paid" | "Pending" | "Overdue" | "Processing";

export interface PaymentStep {
  step: number;
  stepNumber: number;
  installmentName: string;
  amount: number;
  triggerGate: string;
  effects: string;
  status: StepStatus;
  action: string;
  invoice: string;
  paymentAlert: string;
  paymentModeCapture: string;
  paymentLinkSent?: boolean;
  paymentLinkSentAt?: string | null;
  _isActiveAttempt?: boolean;
  _attemptNumber?: number;
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
    attempts?: Array<{
      attemptNumber: number;
      status: string;
      amount: number;
      windowStartDate?: string;
      windowEndDate?: string;
      countdownStartDate?: string;
      paymentLinkSentAt?: string | null;
      paidAt?: string | null;
      markedDoneAt?: string | null;
      expiredAt?: string | null;
    }>;
    currentAttempt?: number;
  };
}

export interface PricingPayment {
  applicationNo: string;
  companyName: string;
  entityType: string;
  plan: PlanType;
  packageType: PackageType;
  totalPayable: number;
  paid: number;
  remainingBalance: number;
  status: PaymentStatus;
  baseServiceFee: number;
  gst: number; // 18% of base service fee
  finalPaidAmount: number;
  finalPayableWithGST?: number;
  isLocked: boolean;
  discount?: number;
  paymentSteps: PaymentStep[];
  currency?: string;
}
