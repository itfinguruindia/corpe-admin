export type PricingStageAmount =
  | number
  | {
      extraDirectorIndian: number;
      extraDirectorForeign: number;
      nonShareholder: number;
    }
  | {
      attempt1: number;
      attempt2: number;
    };

export interface AdminPricingStage {
  _id?: string;
  stage: string;
  stageNumber: number;
  percentage: string;
  amount: PricingStageAmount;
  taxable?: boolean;
  paymentTrigger: string;
  platformTrigger: string;
  conditional?: boolean;
  trigger?: string;
  corpeDeliverables?: string[];
  clientProvides?: string[];
}

export interface AdminPricingPlan {
  _id: string;
  companyType: string;
  companyTypeLabel: string;
  planName: string;
  originalPrice: number;
  discount?: {
    label: string;
    percentage: number;
    amount: number;
  };
  discountAmount?: number;
  finalPrice: number;
  gstPercentage: number;
  currency: "INR" | "USD";
  optionalAddOns?: string[];
  isUpdatedByAdmin?: boolean;
  stages: AdminPricingStage[];
}

export interface PricingPlanUpdateRequest {
  companyTypeLabel?: string;
  originalPrice: number;
  discount?: {
    label: string;
    percentage: number;
    amount: number;
  };
  finalPrice: number;
  gstPercentage: number;
  currency: "INR" | "USD";
  optionalAddOns?: string[];
  stages: AdminPricingStage[];
}
