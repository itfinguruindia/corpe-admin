"use client";

import { useEffect, useState, useRef } from "react";

import { Edit, Upload, Download, Eye } from "lucide-react";
import { toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import CustomSelect from "@/components/ui/CustomSelect";
import Modal from "@/components/ui/Modal";
import { RegistrationData } from "@/types/registrationDocuments";
import { usePermissions } from "@/hooks/usePermissions";
import { requireClientTabEdit } from "@/utils/clientPermissions";
import { notifyApiError } from "@/utils/apiErrors";
import { getFileType } from "@/utils/helpers";
import { PanTanEmailDisclaimer } from "./PanTanEmailDisclaimer";

const CIN_REGEX = /^[LUlu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;

const COMPANY_STATUS_OPTIONS = [
  { id: "pending", label: "Pending" },
  { id: "under-process", label: "Under Process" },
  { id: "delayed", label: "Delayed" },
  { id: "completed", label: "Completed" },
];

function formatStatusLabel(status: string) {
  return (
    COMPANY_STATUS_OPTIONS.find((o) => o.id === status)?.label ??
    status
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

interface RegistrationDocumentsContentProps {
  appNo: string;
}

export default function RegistrationDocumentsContent({
  appNo,
}: RegistrationDocumentsContentProps) {
  const { admin } = usePermissions();
  const [data, setData] = useState<RegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cinInput, setCinInput] = useState("");
  const [isCinEditable, setIsCinEditable] = useState(true);
  const [cinError, setCinError] = useState("");
  const [companyStatus, setCompanyStatus] = useState<string>("pending");
  const [activeUploadDocType, setActiveUploadDocType] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await clientsApi.getRegistrationData(appNo);
      setData(result);
      if (result?.cin) {
        setCinInput(result.cin);
        setIsCinEditable(false);
      }
      if (result?.companyStatus) setCompanyStatus(result.companyStatus);
    } catch (error) {
      console.error("Failed to load registration data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [appNo]);

  const handleCinSubmit = async () => {
    if (!requireClientTabEdit(admin, "regDoc")) return;
    if (!CIN_REGEX.test(cinInput)) {
      setCinError("Please enter a valid CIN (e.g. L12345AB1234DEF123456)");
      return;
    }
    setCinError("");
    setIsCinEditable(false);
    try {
      await clientsApi.updateCinAndStatus(appNo, cinInput, companyStatus);
      toast.success("CIN updated successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to update CIN:", error);
      notifyApiError(error, {
        fallback: "Failed to update CIN.",
        actionLabel: "update registration details",
      });
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!requireClientTabEdit(admin, "regDoc")) return;
    try {
      setCompanyStatus(status);
      await clientsApi.updateCinAndStatus(appNo, cinInput, status);
      toast.success(`Company status updated to ${formatStatusLabel(status)}!`);
      loadData();
    } catch (error) {
      console.error("Failed to update company status:", error);
      notifyApiError(error, {
        fallback: "Failed to update company status.",
        actionLabel: "update company status",
      });
    }
  };

  const handleUploadClick = (docType: string) => {
    if (!requireClientTabEdit(admin, "regDoc")) return;
    if (!data?.cin) {
      toast.warning(
        "Please submit a valid CIN first to unlock document uploads.",
      );
      return;
    }
    setActiveUploadDocType(docType);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeUploadDocType) return;

    const file = files[0];
    try {
      setIsLoading(true);
      await clientsApi.uploadRegistrationDocument(
        appNo,
        activeUploadDocType,
        file,
      );
      toast.success(
        `${activeUploadDocType.toUpperCase()} document uploaded successfully!`,
      );
      loadData();
    } catch (error) {
      console.error("Failed to upload document:", error);
      notifyApiError(error, {
        fallback: "Failed to upload document.",
        actionLabel: "upload registration documents",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docType: string, fileName: string) => {
    try {
      const blob = await clientsApi.downloadRegistrationDocument(appNo, docType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `${docType}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.danger("No file uploaded yet or download failed.");
    }
  };

  const handlePreview = async (docType: string, fileName: string) => {
    try {
      const blob = await clientsApi.downloadRegistrationDocument(appNo, docType);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(fileName);
      setPreviewTitle(docType);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Failed to preview document:", error);
      toast.danger("Could not open document.");
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewFileName("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Data not found for {appNo}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-full">
        {/* Hidden Input for S3 upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
        />

        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <div className="bg-linear-to-r from-orange-50 to-white px-6 py-3 rounded-xl border-l-4 border-orange-200 shadow-sm">
              <h2 className="text-xl font-semibold text-secondary">
                Registration Documents
              </h2>
            </div>
          </div>
        </div>

        {/* Company Status */}
        <div className="mb-8 max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-secondary">
            Company Status
          </label>
          <div
            className={!data?.cin ? "cursor-not-allowed" : undefined}
            onClick={() => {
              if (!data?.cin) {
                toast.warning(
                  "Please submit a valid CIN first to unlock company status updates.",
                );
              }
            }}
          >
            <CustomSelect
              ariaLabel="Company status"
              value={companyStatus}
              onChange={handleStatusChange}
              options={COMPANY_STATUS_OPTIONS}
              isDisabled={!data?.cin}
              className="w-full min-w-[220px]"
              renderValue={(val) => (
                <span className="text-sm font-medium text-gray-900">
                  {formatStatusLabel(val)}
                </span>
              )}
            />
          </div>
          {!data?.cin && (
            <p className="mt-2 text-xs font-medium text-amber-600">
              * Please enter and submit the CIN first to unlock company status
              updates.
            </p>
          )}
        </div>

        {/* CIN Section */}
        <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-8">
          <div className="flex items-center">
            <label className="text-lg font-bold text-black min-w-20">CIN</label>
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <input
                type="text"
                disabled={!isCinEditable}
                value={cinInput}
                onChange={(e) => {
                  setCinInput(e.target.value.trim());
                  setCinError("");
                }}
                className="disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#F46A45] focus:outline-none focus:ring-2 focus:ring-[#F46A45]/20 scheme-light"
                placeholder="Enter 21 digit CIN"
              />
              <button
                onClick={handleCinSubmit}
                className="bg-[#F46A45] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#d55a39] transition-colors shadow-sm"
              >
                Submit
              </button>
              {/* Edit Icon for CIN */}
              <button onClick={() => setIsCinEditable(!isCinEditable)} className="p-2 text-primary hover:bg-orange-50 rounded-lg transition-colors border border-[#F46A45] aspect-square flex items-center justify-center w-10 h-10">
                <Edit size={18} />
              </button>
            </div>
          </div>
           {cinError && (
            <p className="ml-20 mt-1 text-xs font-medium text-red-600">
              {cinError}
            </p>
          )}
        </div>

        {/* Documents List */}
        <div className="space-y-0 max-w-5xl">
          {data.documents.map((doc) => {
            const isEmailDeliveryDoc = doc.name === "PAN" || doc.name === "TAN";

            return (
            <div
              key={doc.id}
              className="flex items-center justify-between py-6 border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex flex-col flex-1 min-w-0 pr-6">
                <span className="text-lg font-bold text-black">{doc.name}</span>
                {isEmailDeliveryDoc ? (
                  <PanTanEmailDisclaimer
                    officeEmail={data.officeEmail}
                    variant="admin"
                  />
                ) : (
                  (doc as { fileName?: string }).fileName && (
                    <span className="text-sm text-gray-500 font-normal mt-1">
                      {(doc as { fileName?: string }).fileName}
                    </span>
                  )
                )}
              </div>

              {!isEmailDeliveryDoc && (
              <div className="flex items-center gap-6 shrink-0">
                {/* View */}
                <button
                  onClick={() =>
                    handlePreview(
                      doc.name,
                      (doc as { fileName?: string }).fileName ?? "",
                    )
                  }
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="View"
                  disabled={doc.status === "pending"}
                  style={{ opacity: doc.status === "pending" ? 0.3 : 1 }}
                >
                  <Eye size={24} />
                </button>
                {/* Download */}
                <button
                  onClick={() =>
                    handleDownload(
                      doc.name,
                      (doc as { fileName?: string }).fileName ?? "",
                    )
                  }
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="Download"
                  disabled={doc.status === "pending"}
                  style={{ opacity: doc.status === "pending" ? 0.3 : 1 }}
                >
                  <Download size={24} />
                </button>
                {/* Edit / Upload */}
                <button
                  onClick={() => handleUploadClick(doc.name)}
                  className="text-primary hover:text-[#d55a39] transition-colors p-1"
                  title="Upload"
                  disabled={!data?.cin}
                  style={{ opacity: !data?.cin ? 0.3 : 1 }}
                >
                  <Upload size={24} />
                </button>
              </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          title={previewTitle}
        >
          {previewUrl ? (
            <>
              {getFileType(previewFileName) === "image" && (
                <img
                  src={previewUrl}
                  alt="Document Preview"
                  className="w-full max-h-[70vh] object-contain rounded"
                />
              )}

              {getFileType(previewFileName) === "pdf" && (
                <iframe
                  src={previewUrl}
                  title="Document PDF Preview"
                  className="w-full h-[70vh] border rounded"
                />
              )}

              {getFileType(previewFileName) === "other" && (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-gray-500 mb-4">
                    No online preview available for this file type.
                  </p>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewUrl;
                      link.download = previewFileName;
                      link.click();
                    }}
                    className="bg-primary hover:bg-secondary text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Download to View
                  </button>
                </div>
              )}
            </>
          ) : (
            <p>No preview available</p>
          )}
        </Modal>
      </div>
    </div>
  );
}
