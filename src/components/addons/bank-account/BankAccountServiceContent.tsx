"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import { Loader2 } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";

import BankAccountDetailsContent from "./BankAccountDetailsContent";
import BankAccountTrackerView from "./BankAccountTrackerView";

interface BankAccountServiceContentProps {
  appNo: string;
}

interface AdminDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
}

interface BankAccountData {
  _id: string;
  org: string;
  bankId: string;
  hasGstBundle: boolean;
  panCard?: { name?: string; path?: string };
  incorporationCertificate?: { name?: string; path?: string };
  gstCertificate?: { name?: string; path?: string };
  addressProof?: { name?: string; path?: string };
  signatoryPan?: { name?: string; path?: string };
  signatoryAadhaar?: { name?: string; path?: string };
  signatoryPhoto?: { name?: string; path?: string };
  boardResolution?: { name?: string; path?: string };
  specimenSignature?: { name?: string; path?: string };
  accountDetails?: {
    accountType?: string;
    branch?: string;
    existingCustomer?: string;
    funding?: string;
    notes?: string;
    city?: string;
  };
  openedAccountDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  isPaid: boolean;
  amountPaid?: number;
  pricingDetails?: {
    baseFee?: number;
    bundleDiscount?: number;
    subtotal?: number;
    gstFee?: number;
    total?: number;
  };
  status?: string;
  adminDocs?: AdminDocEntry[];
  createdAt: string;
}

export default function BankAccountServiceContent({ appNo }: BankAccountServiceContentProps) {
  const [bankData, setBankData] = useState<BankAccountData | null>(null);
  const [adminDocs, setAdminDocs] = useState<AdminDocEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<"details" | "tracker">("details");

  const [kycVerified, setKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [uploadingAdminDoc, setUploadingAdminDoc] = useState(false);

  const loadBankData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/clients/${appNo}/bank-account-setup`);
      const data = res.data?.data || res.data;
      setBankData(data);
      setAdminDocs(data?.adminDocs ?? []);
    } catch {
      setBankData(null);
      setAdminDocs([]);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  const loadKycState = useCallback(async () => {
    if (!bankData?.org) return;
    try {
      const tracker = await clientsApi.getAddonTrackingStatus(appNo, "bank-account-setup");
      if (tracker?.stages) {
        for (const stage of tracker.stages) {
          for (const section of stage.sections) {
            for (const step of section.steps) {
              if (
                step.title?.toLowerCase().includes("kyc") ||
                step.title?.toLowerCase().includes("verification")
              ) {
                setKycVerified(step.status === "Done");
                return;
              }
            }
          }
        }
      }
      setKycVerified(false);
    } catch {
      setKycVerified(false);
    }
  }, [appNo, bankData?.org]);

  useEffect(() => {
    loadBankData();
  }, [loadBankData]);

  useEffect(() => {
    if (bankData?.org) {
      loadKycState();
    }
  }, [bankData?.org, loadKycState]);

  const handleKycVerifiedChange = async (checked: boolean) => {
    if (!bankData?.org) return;
    setKycLoading(true);
    try {
      const tracker = await clientsApi.getAddonTrackingStatus(appNo, "bank-account-setup");
      if (tracker?.stages) {
        for (const stage of tracker.stages) {
          for (const section of stage.sections) {
            for (const step of section.steps) {
              if (
                step.title?.toLowerCase().includes("kyc") ||
                step.title?.toLowerCase().includes("verification")
              ) {
                const newStatus = checked ? "Done" : "Pending";
                await clientsApi.updateAddonStepStatus(
                  bankData.org,
                  "bank-account-setup",
                  stage.stageId,
                  section._id,
                  step._id,
                  newStatus,
                );
                setKycVerified(checked);
                toast.success(`KYC Verification ${checked ? "marked as verified" : "marked as pending"}`);
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update KYC status." });
    } finally {
      setKycLoading(false);
    }
  };

  const handleAdminDocUpload = async (file: File, title?: string) => {
    setUploadingAdminDoc(true);
    try {
      const docType = `misc-${Date.now()}`;
      await clientsApi.uploadBankAccountAdminDoc(appNo, docType, file, title);
      toast.success("Admin document uploaded successfully!");
      loadBankData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload document." });
    } finally {
      setUploadingAdminDoc(false);
    }
  };

  const handleOpenedAccountInfoSave = async (payload: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  }) => {
    try {
      await clientsApi.updateBankAccountOpenedInfo(appNo, payload);
      toast.success("Opened account details saved successfully!");
      loadBankData();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to save opened account details." });
      throw error;
    }
  };

  const downloadBankDoc = async (
    docType: string,
    mode: "preview" | "download" = "download",
    adminDocId?: string,
    docName?: string,
  ) => {
    try {
      const url = clientsApi.getBankAccountDocDownloadUrl(appNo, docType, adminDocId);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);

      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const contentDisposition = response.headers["content-disposition"];
        let filename = docName || docType || "document";
        if (contentDisposition) {
          const matches = /filename\*?=(?:UTF-8'')?([^;]+)/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
          } else {
            const legacyMatches = /filename="?([^";]+)"?/.exec(contentDisposition);
            if (legacyMatches && legacyMatches[1]) {
              filename = legacyMatches[1];
            }
          }
        } else {
          const extensionMap: Record<string, string> = {
            "application/pdf": ".pdf",
            "image/png": ".png",
            "image/jpeg": ".jpg",
          };
          const ext = extensionMap[blob.type] || "";
          if (!filename.includes(".")) {
            filename = `${filename}${ext}`;
          }
        }

        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast.danger("Failed to download document");
    }
  };

  const downloadBankMiscDoc = async (index: number, mode: "preview" | "download" = "download") => {
    try {
      const url = clientsApi.getBankMiscDocDownloadUrl(appNo, index);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);

      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const contentDisposition = response.headers["content-disposition"];
        let filename = (bankData as any)?.miscDocs?.[index]?.name || `misc-doc-${index + 1}`;
        if (contentDisposition) {
          const matches = /filename\*?=(?:UTF-8'')?([^;]+)/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
          } else {
            const legacyMatches = /filename="?([^";]+)"?/.exec(contentDisposition);
            if (legacyMatches && legacyMatches[1]) {
              filename = legacyMatches[1];
            }
          }
        }

        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      toast.danger("Failed to download document");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-700" />
      </div>
    );
  }

  const status = bankData?.status ?? "open";
  const isPaid = bankData?.isPaid ?? false;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Bank Account Service</h2>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "completed" ? "Completed" : "Open"}
          </span>
          {isPaid ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-800 border border-green-300 uppercase">
              Paid
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
              Payment Pending
            </span>
          )}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setSubTab("details")}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              subTab === "details"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Form Details
          </button>
          <button
            type="button"
            onClick={() => setSubTab("tracker")}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              subTab === "tracker"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Tracking Progress
          </button>
        </div>
      </div>

      {subTab === "tracker" ? (
        <BankAccountTrackerView appNo={appNo} orgId={bankData?.org || ""} />
      ) : (
        <BankAccountDetailsContent
          appNo={appNo}
          bankData={bankData}
          adminDocs={adminDocs}
          kycVerified={kycVerified}
          kycLoading={kycLoading}
          onKycVerifiedChange={handleKycVerifiedChange}
          downloadBankDoc={downloadBankDoc}
          downloadBankMiscDoc={downloadBankMiscDoc}
          handleAdminDocUpload={handleAdminDocUpload}
          uploadingAdminDoc={uploadingAdminDoc}
          onOpenedAccountInfoSave={handleOpenedAccountInfoSave}
        />
      )}
    </div>
  );
}
