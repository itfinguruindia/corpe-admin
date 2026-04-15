export type PlanType = "Normal" | "Advance";
export type PackageType = "Full Payment" | "Installment";
export type PaymentStatus = "Complete" | "Active" | "Awaiting" | "Blocked";
export type StepStatus = "Paid" | "Pending" | "Overdue" | "Processing";

export interface PaymentStep {
  step: number;
  installmentName: string;
  amount: number;
  triggerGate: string;
  effects: string;
  status: StepStatus;
  action: string;
  invoice: string;
  paymentAlert: string;
  paymentModeCapture: string;
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
  isLocked: boolean;
  discount?: number;
  paymentSteps: PaymentStep[];
}
