"use client";

import { useEffect, useState, useRef } from "react";

import { Edit, Upload, Download, Eye } from "lucide-react";
import { toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import CustomSelect from "@/components/ui/CustomSelect";
import Modal from "@/components/ui/Modal";
import { RegistrationData, LlpAgreementStatus } from "@/types/registrationDocuments";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { notifyApiError } from "@/utils/apiErrors";
import { getFileType } from "@/utils/helpers";
import { PanTanEmailDisclaimer } from "./PanTanEmailDisclaimer";
import { DocumentIssueButton } from "@/components/clients/DocumentIssueModal";

const REGISTRATION_FIELD_KEYS: Record<string, string> = {
  PAN: "panDocument",
  TAN: "TAN",
  COI: "COI",
};

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
  const { requireEdit } = useClientTabEdit("regDoc");
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
  const [installmentInfo, setInstallmentInfo] = useState<{
    firstInstallmentDue: boolean;
    firstInstallmentPaid: boolean;
    secondInstallmentDue: boolean;
    secondInstallmentPaid: boolean;
  } | null>(null);
  const [llpAgreementStatus, setLlpAgreementStatus] =
    useState<LlpAgreementStatus | null>(null);
  const llpAgreementInputRef = useRef<HTMLInputElement>(null);

  const isLlpCompany =
    data?.companyType?.toLowerCase() === "llp" ||
    data?.companyType?.toLowerCase() === "limited-liability-partnership";

  const isLocked = !!(
    installmentInfo?.firstInstallmentDue ||
    !installmentInfo?.secondInstallmentPaid
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [result, trackerResponse] = await Promise.all([
        clientsApi.getRegistrationData(appNo),
        clientsApi.getTrackingStatus(appNo).catch(() => null),
      ]);
      setData(result);
      if (result?.cin) {
        setCinInput(result.cin);
        setIsCinEditable(false);
      }
      if (result?.companyStatus) setCompanyStatus(result.companyStatus);
      if (trackerResponse && trackerResponse.installmentInfo) {
        setInstallmentInfo(trackerResponse.installmentInfo);
      }
      const companyType = String(result?.companyType || "").toLowerCase();
      if (
        companyType === "llp" ||
        companyType === "limited-liability-partnership"
      ) {
        const llpStatus = await clientsApi.getLlpAgreementStatus(appNo);
        setLlpAgreementStatus(llpStatus);
      } else {
        setLlpAgreementStatus(null);
      }
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
    if (!requireEdit()) return;
    if (isLocked) {
      toast.danger("Action locked. Installment payment is due.");
      return;
    }
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
    if (!requireEdit()) return;
    if (isLocked) {
      toast.danger("Action locked. Installment payment is due.");
      return;
    }
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
    if (!requireEdit()) return;
    if (docType === "COI" && isLocked) {
      toast.danger("Action locked. Installment payment is due.");
      return;
    }
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
    if (activeUploadDocType === "COI" && isLocked) {
      toast.danger("Action locked. Installment payment is due.");
      return;
    }

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
      const blob = await clientsApi.downloadRegistrationDocument(
        appNo,
        docType,
      );
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
      const blob = await clientsApi.downloadRegistrationDocument(
        appNo,
        docType,
      );
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

  const handleLlpAgreementUploadClick = () => {
    if (!requireEdit()) return;
    if (!data?.cin) {
      toast.warning(
        "Please submit a valid CIN first to unlock document uploads.",
      );
      return;
    }
    if (llpAgreementInputRef.current) {
      llpAgreementInputRef.current.value = "";
      llpAgreementInputRef.current.click();
    }
  };

  const handleLlpAgreementFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      setIsLoading(true);
      await clientsApi.uploadLlpAgreementDocument(appNo, file);
      toast.success("LLP Agreement uploaded successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to upload LLP Agreement:", error);
      notifyApiError(error, {
        fallback: "Failed to upload LLP Agreement.",
        actionLabel: "upload LLP Agreement",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLlpAgreementDownload = async (source: "admin" | "client") => {
    try {
      const fileName =
        source === "admin"
          ? llpAgreementStatus?.adminFile?.name
          : llpAgreementStatus?.clientFile?.name;
      const blob = await clientsApi.downloadLlpAgreementDocument(appNo, source);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "llp-agreement.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download LLP Agreement:", error);
      toast.danger("No file uploaded yet or download failed.");
    }
  };

  const handleLlpAgreementPreview = async (source: "admin" | "client") => {
    try {
      const fileName =
        source === "admin"
          ? llpAgreementStatus?.adminFile?.name
          : llpAgreementStatus?.clientFile?.name;
      const blob = await clientsApi.downloadLlpAgreementDocument(appNo, source);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(fileName || "llp-agreement.pdf");
      setPreviewTitle("LLP Agreement");
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Failed to preview LLP Agreement:", error);
      toast.danger("Could not open LLP Agreement.");
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
        <input
          type="file"
          ref={llpAgreementInputRef}
          onChange={handleLlpAgreementFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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

        {isLocked && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm font-semibold max-w-5xl">
            <span>
              ⚠️ Stage locked. Outstanding installment payments are due for this
              client. Registration actions are disabled.
            </span>
          </div>
        )}

        {/* Company Status */}
        <div className="mb-8 max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-secondary">
            Company Status
          </label>
          <div
            className={
              !data?.cin || isLocked ? "cursor-not-allowed" : undefined
            }
            onClick={() => {
              if (isLocked) {
                toast.danger("Action locked. Installment payment is due.");
              } else if (!data?.cin) {
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
              isDisabled={!data?.cin || isLocked}
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
                disabled={!isCinEditable || isLocked}
                value={cinInput}
                onChange={(e) => {
                  setCinInput(e.target.value.trim());
                  setCinError("");
                }}
                className="disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#F46A45] focus:outline-none focus:ring-2 focus:ring-[#F46A45]/20 scheme-light"
                placeholder={
                  isLocked ? "Locked — installment due" : "Enter 21 digit CIN"
                }
              />
              <button
                onClick={isLocked ? undefined : handleCinSubmit}
                disabled={isLocked}
                className={`px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                  isLocked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#F46A45] text-white hover:bg-[#d55a39]"
                }`}
                title={isLocked ? "Locked — installment due" : "Submit"}
              >
                Submit
              </button>
              {/* Edit Icon for CIN */}
              <button
                onClick={
                  isLocked ? undefined : () => setIsCinEditable(!isCinEditable)
                }
                disabled={isLocked}
                className={`p-2 rounded-lg transition-colors border aspect-square flex items-center justify-center w-10 h-10 ${
                  isLocked
                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                    : "text-primary border-[#F46A45] hover:bg-orange-50 cursor-pointer"
                }`}
                title={isLocked ? "Locked — installment due" : "Edit CIN"}
              >
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
                  <span className="text-lg font-bold text-black">
                    {doc.name}
                  </span>
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
                      onClick={
                        doc.name === "COI" && isLocked
                          ? undefined
                          : () => handleUploadClick(doc.name)
                      }
                      className={`transition-colors p-1 ${
                        doc.name === "COI" && isLocked
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-primary hover:text-[#d55a39] cursor-pointer"
                      }`}
                      title={
                        doc.name === "COI" && isLocked
                          ? "Locked — installment due"
                          : "Upload"
                      }
                      disabled={!data?.cin || (doc.name === "COI" && isLocked)}
                      style={{
                        opacity:
                          !data?.cin || (doc.name === "COI" && isLocked)
                            ? 0.3
                            : 1,
                      }}
                    >
                      <Upload size={24} />
                    </button>
                    <DocumentIssueButton
                      applicationNo={appNo}
                      target={{
                        entityType: "registration",
                        entityId: "registration",
                        entityLabel: "Registration Documents",
                        fieldKey: REGISTRATION_FIELD_KEYS[doc.name] || doc.name,
                        documentLabel: doc.name,
                        clientRoute: "registration-documents",
                      }}
                      className="inline-flex items-center text-primary hover:text-[#d55a39] p-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isLlpCompany && (
          <div className="mt-10 max-w-5xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">LLP Agreement</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload the draft agreement for the client to download and
                  re-upload after signing.
                </p>
              </div>
              <button
                onClick={handleLlpAgreementUploadClick}
                disabled={!data?.cin}
                className="inline-flex items-center gap-2 rounded-lg border border-[#F46A45] px-4 py-2 text-sm font-medium text-[#F46A45] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                title="Upload LLP Agreement (Admin)"
              >
                <Upload size={18} />
                Upload Draft
              </button>
            </div>

            <div className="space-y-3">
              {llpAgreementStatus?.adminFile ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-700">
                      Admin Upload
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLlpAgreementPreview("admin")}
                        className="text-orange-600 hover:text-orange-700"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLlpAgreementDownload("admin")}
                        className="text-orange-600 hover:text-orange-700"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="truncate text-sm text-secondary">
                    {llpAgreementStatus.adminFile.name}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 text-xs font-medium text-gray-400">
                    Admin Upload
                  </div>
                  <div className="text-sm text-gray-400">No file uploaded</div>
                </div>
              )}

              {llpAgreementStatus?.clientFile ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700">
                      Client Upload
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLlpAgreementPreview("client")}
                        className="text-blue-600 hover:text-blue-700"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLlpAgreementDownload("client")}
                        className="text-blue-600 hover:text-blue-700"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="truncate text-sm text-secondary">
                    {llpAgreementStatus.clientFile.name}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 text-xs font-medium text-gray-400">
                    Client Upload
                  </div>
                  <div className="text-sm text-gray-400">
                    Waiting for client upload
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
