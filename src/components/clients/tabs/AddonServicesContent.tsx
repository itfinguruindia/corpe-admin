"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";
import AdminAddonTrackerView from "./AdminAddonTrackerView";
import GstDetailsContent from "./GstDetailsContent";

interface AddonServicesContentProps {
  appNo: string;
}

interface GstDocEntry {
  id: string;
  name: string;
  path: string;
  uploadedAt: string;
}

interface GstDirectorView {
  name: string;
  email: string;
  phone: string;
  authorized: boolean;
  docs: Record<string, any>;
}

interface GstRegistrationView {
  _id: string;
  org?: string;
  gstDetails?: {
    legalName?: string;
    tradeName?: string;
    natureOfBusiness?: string;
    reason?: string;
    dateLiable?: string;
    hsnSac?: string;
    hsnSacCoveredByCorpE?: boolean;
    bankAccount?: string;
    ifsc?: string;
    principalAddress?: string;
    deliveryMethod?: string;
    deliveryEmail?: string;
    deliveryAddress?: string;
    additionalPlaces?: boolean;
    additionalPlacesText?: string;
  };
  businessDocs?: Record<string, { name: string; path: string; status?: string }>;
  directors?: GstDirectorView[];
  status?: string;
  adminDocs?: GstDocEntry[];
}

const ADDONS = [
  { id: "gst-registration", label: "GST Registration", comingSoon: false },
  { id: "epf-esi", label: "EPF / ESI Registration", comingSoon: true },
  { id: "msme", label: "MSME Registration", comingSoon: true },
  { id: "professional-tax", label: "Professional Tax", comingSoon: true },
  { id: "shop-establishment", label: "Shop & Establishment", comingSoon: true },
  { id: "iso-certification", label: "ISO Certification", comingSoon: true },
] as const;

const ADMIN_DOC_SLOTS = [
  { id: "gst-certificate", label: "GST Certificate" },
  { id: "arn-acknowledgement", label: "ARN Acknowledgement" },
];

export default function AddonServicesContent({ appNo }: AddonServicesContentProps) {
  const [selected, setSelected] = useState("gst-registration");
  const [gstData, setGstData] = useState<GstRegistrationView | null>(null);
  const [adminDocs, setAdminDocs] = useState<GstDocEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState<"details" | "tracker">("details");

  // KYC Verified state
  const [kycVerified, setKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  // ARN States
  const [arnInput, setArnInput] = useState("");
  const [arnError, setArnError] = useState("");
  const [savingArn, setSavingArn] = useState(false);

  const loadGst = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsApi.getGstRegistration(appNo);
      setGstData(data);
      setAdminDocs(data?.adminDocs ?? []);
      setArnInput((data as any)?.arn ?? "");
    } catch {
      setGstData(null);
      setAdminDocs([]);
      setArnInput("");
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  // Load KYC state from tracker
  const loadKycState = useCallback(async () => {
    if (!gstData?.org) return;
    try {
      const tracker = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      if (tracker?.stages) {
        for (const stage of tracker.stages) {
          for (const section of stage.sections) {
            for (const step of section.steps) {
              if (step.title === "Details and Document verification") {
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
  }, [appNo, gstData?.org]);

  // Load KYC state when GST data loads or switching to details tab
  useEffect(() => {
    if (subTab === "details" && gstData?.org) {
      loadKycState();
    }
  }, [subTab, gstData?.org, loadKycState]);

  // Load KYC state on initial load
  useEffect(() => {
    if (gstData?.org) {
      loadKycState();
    }
  }, [gstData?.org, loadKycState]);

  useEffect(() => {
    if (selected === "gst-registration") loadGst();
  }, [selected, loadGst]);

  const handleSaveArn = async () => {
    if (!arnInput) {
      setArnError("ARN is required");
      return;
    }

    // Validate ARN (15 characters: 2 letters, 12 digits, 1 alphanumeric character)
    const isValid = /^[a-zA-Z]{2}[0-9]{12}[a-zA-Z0-9]$/.test(arnInput);
    if (!isValid) {
      setArnError("Invalid ARN format. E.g. AA060826000001Z (15 characters alphanumeric).");
      return;
    }

    try {
      setSavingArn(true);
      setArnError("");
      await clientsApi.updateGstArn(appNo, arnInput.toUpperCase());
      toast.success("GST Application Reference Number (ARN) saved successfully!");
      loadGst();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to save ARN." });
    } finally {
      setSavingArn(false);
    }
  };

  const handleUpload = async (slotId: string, file: File) => {
    try {
      const result = await clientsApi.uploadGstAdminDocument(appNo, slotId, file);
      toast.success(`${ADMIN_DOC_SLOTS.find((s) => s.id === slotId)?.label ?? slotId} uploaded successfully!`);
      loadGst();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload document." });
    }
  };

  const findDoc = (slotId: string) => adminDocs.find((d) => d.id === slotId);

  const downloadBusinessDoc = async (docId: string, mode: "preview" | "download" = "download") => {
    try {
      const url = clientsApi.getGstBusinessDocDownloadUrl(appNo, docId);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
        const contentDisposition = response.headers["content-disposition"];
        let filename = docId;
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
          filename = `${docId}${ext}`;
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

  const handleKycVerifiedChange = async (checked: boolean) => {
    if (!gstData?.org) return;
    setKycLoading(true);
    try {
      const tracker = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      if (!tracker?.stages) {
        toast.danger("Tracker not initialized. Please initialize the GST tracker first.");
        return;
      }
      for (const stage of tracker.stages) {
        for (const section of stage.sections) {
          for (const step of section.steps) {
            if (step.title === "Details and Document verification") {
              await clientsApi.updateAddonStepStatus(
                gstData.org,
                "gst-registration",
                stage.stageId,
                section._id,
                step._id,
                checked ? "Done" : "Pending",
              );
              setKycVerified(checked);
              toast.success(checked ? "KYC marked as verified" : "KYC marked as pending");
              return;
            }
          }
        }
      }
      toast.danger("Details and Document verification step not found in tracker.");
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update KYC verification status." });
    } finally {
      setKycLoading(false);
    }
  };

  const downloadGstDocBlob = async (url: string, filename: string, mode: "preview" | "download") => {
    try {
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      if (mode === "preview") {
        window.open(objectUrl, "_blank");
      } else {
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

  const downloadMiscDoc = async (index: number, mode: "preview" | "download") => {
    const url = clientsApi.getGstMiscDocDownloadUrl(appNo, index);
    const miscDoc = (gstData as any)?.miscDocs?.[index];
    const filename = miscDoc?.name || `misc-doc-${index}`;
    await downloadGstDocBlob(url, filename, mode);
  };

  const renderAddonList = () => (
    <div className="w-64 shrink-0 border-r border-gray-200 pr-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Add-on Services
      </h3>
      <ul className="space-y-1">
        {ADDONS.map((addon) => {
          const isActive = selected === addon.id;
          return (
            <li key={addon.id}>
              <button
                type="button"
                disabled={addon.comingSoon}
                onClick={() => setSelected(addon.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : addon.comingSoon
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{addon.label}</span>
                {addon.comingSoon && (
                  <span className="text-[10px] font-semibold uppercase text-gray-400">
                    Soon
                  </span>
                )}
                {!addon.comingSoon && <ChevronRight size={16} className={isActive ? "text-white" : "text-gray-400"} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const renderGstDetail = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }
    
    const status = gstData?.status ?? "—";

    return (
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Toggle Bar */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">GST Registration</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {status === "completed" ? "Completed" : "Open"}
            </span>
            {!(gstData as any)?.isPaid && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                Payment Pending
              </span>
            )}
          </div>

          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSubTab("details")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                subTab === "details"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Form Details
            </button>
            <button
              type="button"
              onClick={() => setSubTab("tracker")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                subTab === "tracker"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Tracking Progress
            </button>
          </div>
        </div>

        {subTab === "tracker" ? (
          <AdminAddonTrackerView appNo={appNo} orgId={gstData?.org || ""} isPaid={(gstData as any)?.isPaid ?? false} />
        ) : (
          <GstDetailsContent
            appNo={appNo}
            gstData={gstData}
            adminDocs={adminDocs}
            arnInput={arnInput}
            arnError={arnError}
            savingArn={savingArn}
            setArnInput={setArnInput}
            setArnError={setArnError}
            handleSaveArn={handleSaveArn}
            handleUpload={handleUpload}
            downloadBusinessDoc={downloadBusinessDoc}
            downloadMiscDoc={downloadMiscDoc}
            ADMIN_DOC_SLOTS={ADMIN_DOC_SLOTS as any}
            kycVerified={kycVerified}
            onKycVerifiedChange={handleKycVerifiedChange}
            kycLoading={kycLoading}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-6 mt-4">
      {renderAddonList()}
      {selected === "gst-registration" && renderGstDetail()}
    </div>
  );
}

function InfoRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null | boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-gray-400 block">{label}</span>
      <span className="text-gray-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}
