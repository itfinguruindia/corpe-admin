"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import axiosInstance from "@/lib/axios";
import Modal from "@/components/ui/Modal";
import DocumentPreviewBody from "@/components/ui/DocumentPreviewBody";
import { createPreviewObjectUrlFromBlob } from "@/utils/documentPreview";

import GstDetailsContent from "./GstDetailsContent";
import GSTAddonTrackerView from "./GSTAddonTrackerView";

interface GSTServiceContentProps {
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

const ADMIN_DOC_SLOTS = [
  { id: "gst-certificate", label: "GST Certificate" },
  { id: "arn-acknowledgement", label: "ARN Acknowledgement" },
  { id: "board-resolution", label: "Board Resolution" },
  { id: "auth-signatory-letter", label: "Authorised Signatory Letter (Template)" },
];

export default function GSTServiceContent({ appNo }: GSTServiceContentProps) {
  const [gstData, setGstData] = useState<GstRegistrationView | null>(null);
  const [adminDocs, setAdminDocs] = useState<GstDocEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState<"details" | "tracker">("details");

  const [kycVerified, setKycVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  const [arnInput, setArnInput] = useState("");
  const [arnError, setArnError] = useState("");
  const [savingArn, setSavingArn] = useState(false);

  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    url: string | null;
    fileName: string;
    loading: boolean;
  }>({
    isOpen: false,
    url: null,
    fileName: "",
    loading: false,
  });

  const closePreview = () => {
    if (previewState.url) {
      URL.revokeObjectURL(previewState.url);
    }
    setPreviewState({
      isOpen: false,
      url: null,
      fileName: "",
      loading: false,
    });
  };

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

  useEffect(() => {
    loadGst();
  }, [loadGst]);

  useEffect(() => {
    if (gstData?.org) {
      clientsApi.getAddonTrackingStatus(appNo, "gst-registration").then((tracker) => {
        if (!tracker?.stages) {
          setKycVerified(false);
          return;
        }
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
        setKycVerified(false);
      }).catch(() => setKycVerified(false));
    }
  }, [appNo, gstData?.org]);

  const handleSaveArn = async () => {
    if (!arnInput.trim()) {
      setArnError("ARN is required");
      return;
    }
    if (!/^[A-Za-z0-9]{15}$/.test(arnInput.trim())) {
      setArnError("ARN must be exactly 15 alphanumeric characters");
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

  const handleUpload = async (slotId: string, file: File, title?: string) => {
    try {
      await clientsApi.uploadGstAdminDocument(appNo, slotId, file, title);
      toast.success("Document uploaded successfully!");
      loadGst();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to upload document." });
    }
  };

  const downloadBusinessDoc = async (
    docId: string,
    mode: "preview" | "download" = "download",
    directorIndex?: number,
  ) => {
    try {
      let filename = docId;
      if (mode === "preview") {
        setPreviewState({
          isOpen: true,
          url: null,
          fileName: filename,
          loading: true,
        });
      }
      const url = clientsApi.getGstBusinessDocDownloadUrl(appNo, docId, directorIndex);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const matches = /filename\*?=(?:UTF-8'')?([^;]+)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
        }
      }

      if (mode === "preview") {
        const preview = createPreviewObjectUrlFromBlob(blob, filename);
        setPreviewState({
          isOpen: true,
          url: preview.url,
          fileName: preview.fileName,
          loading: false,
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      if (mode === "preview") {
        setPreviewState((prev) => ({ ...prev, loading: false }));
      }
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
      if (mode === "preview") {
        setPreviewState({
          isOpen: true,
          url: null,
          fileName: filename,
          loading: true,
        });
      }
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = response.data;
      if (mode === "preview") {
        const preview = createPreviewObjectUrlFromBlob(blob, filename);
        setPreviewState({
          isOpen: true,
          url: preview.url,
          fileName: preview.fileName,
          loading: false,
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      if (mode === "preview") {
        setPreviewState((prev) => ({ ...prev, loading: false }));
      }
      toast.danger("Failed to download document");
    }
  };

  const downloadMiscDoc = async (index: number, mode: "preview" | "download") => {
    const url = clientsApi.getGstMiscDocDownloadUrl(appNo, index);
    const miscDoc = (gstData as any)?.miscDocs?.[index];
    const filename = miscDoc?.name || `misc-doc-${index}`;
    await downloadGstDocBlob(url, filename, mode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const status = gstData?.status ?? "-";

  return (
    <div className="flex flex-col gap-6">
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
        <GSTAddonTrackerView appNo={appNo} orgId={gstData?.org || ""} isPaid={(gstData as any)?.isPaid ?? false} />
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

      <Modal
        isOpen={previewState.isOpen}
        onClose={closePreview}
        title={previewState.fileName ? `Document Preview: ${previewState.fileName}` : "Document Preview"}
        maxWidth="md:max-w-[90vw]"
      >
        <DocumentPreviewBody
          url={previewState.url}
          fileName={previewState.fileName}
          loading={previewState.loading}
        />
      </Modal>
    </div>
  );
}