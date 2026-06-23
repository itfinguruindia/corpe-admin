import axiosInstance from "@/lib/axios";
import type { AxiosRequestConfig } from "axios";

export type ComplianceCategory =
  | "GST"
  | "TDS / TCS"
  | "Income Tax"
  | "ROC"
  | "MSME"
  | "Advance Tax";
export type ComplianceCompanyType = "all" | "pvt" | "opc" | "public" | "msme";
export type ComplianceStatus = "done" | "pending";

export interface CompliancePenalty {
  title: string;
  rate: string;
  maximum: string;
  interest: string;
  section: string;
}

export interface ComplianceEntry {
  id: string;
  day: number;
  month: number;
  category: ComplianceCategory;
  companyType: ComplianceCompanyType;
  formName: string;
  description: string;
  period: string;
  locationEnabled: boolean;
  status: ComplianceStatus;
  penalty: CompliancePenalty;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceListResponse {
  data: ComplianceEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ComplianceInput {
  day: number;
  month: number;
  category: ComplianceCategory;
  companyType?: ComplianceCompanyType;
  formName: string;
  description?: string;
  period: string;
  locationEnabled?: boolean;
  status?: ComplianceStatus;
  penalty: CompliancePenalty;
}

export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  "GST",
  "TDS / TCS",
  "Income Tax",
  "ROC",
  "MSME",
  "Advance Tax",
];

/** Stable select keys (avoids HeroUI issues with `/` and spaces in option ids). */
export const COMPLIANCE_CATEGORY_OPTIONS: {
  id: string;
  label: ComplianceCategory;
}[] = [
  { id: "gst", label: "GST" },
  { id: "tds-tcs", label: "TDS / TCS" },
  { id: "income-tax", label: "Income Tax" },
  { id: "roc", label: "ROC" },
  { id: "msme", label: "MSME" },
  { id: "advance-tax", label: "Advance Tax" },
];

export const COMPLIANCE_COMPANY_TYPE_OPTIONS: {
  id: ComplianceCompanyType;
  label: string;
}[] = [
  { id: "all", label: "All Companies" },
  { id: "pvt", label: "Private Limited" },
  { id: "opc", label: "One Person Company" },
  { id: "public", label: "Public Limited" },
  { id: "msme", label: "MSME / Small Co" },
];

const LEGACY_CATEGORY_MAP: Record<string, ComplianceCategory> = {
  IT: "Income Tax",
  TDS: "TDS / TCS",
  Other: "GST",
};

export function normalizeComplianceCategory(
  value: string | undefined | null,
): ComplianceCategory {
  if (!value) return "GST";
  if (COMPLIANCE_CATEGORIES.includes(value as ComplianceCategory)) {
    return value as ComplianceCategory;
  }
  return LEGACY_CATEGORY_MAP[value] ?? "GST";
}

export function categoryToSelectId(category: string): string {
  const normalized = normalizeComplianceCategory(category);
  return (
    COMPLIANCE_CATEGORY_OPTIONS.find((o) => o.label === normalized)?.id ?? "gst"
  );
}

export function selectIdToCategory(selectId: string): ComplianceCategory {
  const match = COMPLIANCE_CATEGORY_OPTIONS.find((o) => o.id === selectId);
  return match?.label ?? "GST";
}

export function normalizeComplianceCompanyType(
  value: string | undefined | null,
): ComplianceCompanyType {
  if (!value) return "all";
  const trimmed = value.trim();
  const byId = COMPLIANCE_COMPANY_TYPE_OPTIONS.find((o) => o.id === trimmed);
  if (byId) return byId.id;
  const byLabel = COMPLIANCE_COMPANY_TYPE_OPTIONS.find(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel?.id ?? "all";
}

export function companyTypeLabel(companyType: ComplianceCompanyType): string {
  return (
    COMPLIANCE_COMPANY_TYPE_OPTIONS.find((o) => o.id === companyType)?.label ??
    "All Companies"
  );
}

function normalizeEntry(raw: ComplianceEntry & { _id?: string }): ComplianceEntry {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? "",
    companyType: normalizeComplianceCompanyType(raw.companyType),
    penalty: raw.penalty ?? {
      title: "",
      rate: "",
      maximum: "",
      interest: "",
      section: "",
    },
  };
}

export const complianceApi = {
  getAll: async (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: ComplianceCategory;
      companyType?: ComplianceCompanyType;
      companyTypeScope?: "exact" | "applicable";
      status?: ComplianceStatus;
      month?: number;
      day?: number;
    },
    config?: AxiosRequestConfig,
  ): Promise<ComplianceListResponse> => {
    const response = await axiosInstance.get("/compliance", {
      params,
      ...config,
    });
    const payload = response.data.data;
    return {
      ...payload,
      data: (payload.data ?? []).map(normalizeEntry),
    };
  },

  create: async (data: ComplianceInput): Promise<ComplianceEntry> => {
    const response = await axiosInstance.post("/compliance", data);
    return normalizeEntry(response.data.data);
  },

  update: async (
    id: string,
    data: ComplianceInput,
  ): Promise<ComplianceEntry> => {
    const response = await axiosInstance.put(`/compliance/${id}`, data);
    return normalizeEntry(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/compliance/${id}`);
  },
};
