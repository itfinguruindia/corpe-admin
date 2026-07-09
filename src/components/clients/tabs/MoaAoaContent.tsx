"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Spinner } from "@heroui/react";
import { Eye, Download, Upload, RefreshCw } from "lucide-react";

import { FileUploadComponent } from "@/components/upload";
import Modal from "@/components/ui/Modal";
import { clientsApi } from "@/lib/api/clients";
import type { CompanyMiscDocType, MoaAoaDocType } from "@/lib/api/clients";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { notifyApiError } from "@/utils/apiErrors";
import { DocumentIssueButton } from "@/components/clients/DocumentIssueModal";
import { getFileType } from "@/utils/helpers";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";

interface MoaAoaContentProps {
  appNo: string;
}

type DocFile = {
  name: string;
  path: string;
  uploadedAt?: string;
} | null;

type DocumentSection = {
  key: string;
  label: string;
  kind: "moa-aoa" | "misc";
  docType: MoaAoaDocType | CompanyMiscDocType;
  adminFile: DocFile;
  clientFile: DocFile;
};

const BASE_SECTIONS: DocumentSection[] = [
  {
    key: "moa",
    label: "MOA",
    kind: "moa-aoa",
    docType: "moa",
    adminFile: null,
    clientFile: null,
  },
  {
    key: "aoa",
    label: "AOA",
    kind: "moa-aoa",
    docType: "aoa",
    adminFile: null,
    clientFile: null,
  },
  {
    key: "miscellaneous1",
    label: "Miscellaneous 1",
    kind: "misc",
    docType: "miscellaneous1",
    adminFile: null,
    clientFile: null,
  },
  {
    key: "miscellaneous2",
    label: "Miscellaneous 2",
    kind: "misc",
    docType: "miscellaneous2",
    adminFile: null,
    clientFile: null,
  },
  {
    key: "miscellaneous3",
    label: "Miscellaneous 3",
    kind: "misc",
    docType: "miscellaneous3",
    adminFile: null,
    clientFile: null,
  },
];

const CONSENT_SECTION: DocumentSection = {
  key: "consentToAct",
  label: "Consent to Act as Nominee",
  kind: "moa-aoa",
  docType: "consentToAct",
  adminFile: null,
  clientFile: null,
};

export default function MoaAoaContent({ appNo }: MoaAoaContentProps) {
  const { requireEdit } = useClientTabEdit("moa");
  const { isOpc, labels } = useClientCompanyLabels();
  const initialSections = useMemo(() => {
    if (!isOpc) return BASE_SECTIONS;
    const miscSections = BASE_SECTIONS.filter((section) => section.kind === "misc");
    return [
      {
        ...CONSENT_SECTION,
        label: labels.consentToAct || CONSENT_SECTION.label,
      },
      ...miscSections,
    ];
  }, [isOpc, labels.consentToAct]);

  const [sections, setSections] = useState<DocumentSection[]>(initialSections);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingKey, setRefreshingKey] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [installmentInfo, setInstallmentInfo] = useState<{
    firstInstallmentDue: boolean;
    firstInstallmentPaid: boolean;
    secondInstallmentDue: boolean;
    secondInstallmentPaid: boolean;
  } | null>(null);

  const isLocked = !!(
    installmentInfo?.firstInstallmentDue ||
    !installmentInfo?.secondInstallmentPaid
  );

  const getFileName = (value: string) => {
    if (!value) return "";
    return value.split("/").pop() || value;
  };

  const loadSectionStatus = useCallback(
    async (section: DocumentSection): Promise<DocumentSection> => {
      if (section.kind === "moa-aoa") {
        const status = await clientsApi.getMoaAoaDocFilesStatus(
          appNo,
          section.docType as MoaAoaDocType,
        );
        return {
          ...section,
          adminFile: status.adminFile,
          clientFile: status.clientFile,
        };
      }

      const status = await clientsApi.getCompanyMiscDocStatus(
        appNo,
        section.docType as CompanyMiscDocType,
      );
      return {
        ...section,
        adminFile: status.adminFile,
        clientFile: status.clientFile,
      };
    },
    [appNo],
  );

  const loadAllSections = useCallback(async () => {
    const updated = await Promise.all(
      initialSections.map((section) => loadSectionStatus(section)),
    );
    setSections(updated);
  }, [loadSectionStatus, initialSections]);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [_, trackerRes] = await Promise.all([
          loadAllSections(),
          clientsApi.getTrackingStatus(appNo).catch(() => null),
        ]);
        if (trackerRes && trackerRes.installmentInfo) {
          setInstallmentInfo(trackerRes.installmentInfo);
        }
      } catch (error) {
        console.error("Error fetching MOA & AOA:", error);
        setSections(initialSections);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadAllSections, appNo, initialSections]);

  const refreshSection = async (sectionKey: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    if (!section) return;

    try {
      setRefreshingKey(sectionKey);
      const updated = await loadSectionStatus(section);
      setSections((prev) =>
        prev.map((s) => (s.key === sectionKey ? updated : s)),
      );
      toast.success("Status refreshed");
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast("Failed to refresh status", { variant: "danger" });
    } finally {
      setRefreshingKey(null);
    }
  };

  const downloadBlob = async (
    section: DocumentSection,
    source: "admin" | "client",
    fileName: string,
  ) => {
    const blob =
      section.kind === "moa-aoa"
        ? await clientsApi.downloadMoaAoaDocument(
            appNo,
            section.docType as MoaAoaDocType,
            source,
          )
        : await clientsApi.downloadCompanyMiscDocument(
            appNo,
            section.docType as CompanyMiscDocType,
            source,
          );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (
    section: DocumentSection,
    source: "admin" | "client",
  ) => {
    const file = source === "admin" ? section.adminFile : section.clientFile;
    if (!file) return;

    try {
      await downloadBlob(section, source, file.name);
      toast.success(`Downloaded ${source} file successfully`);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast("Failed to download document", { variant: "danger" });
    }
  };

  const handlePreview = async (
    section: DocumentSection,
    source: "admin" | "client",
  ) => {
    const file = source === "admin" ? section.adminFile : section.clientFile;
    if (!file) return;

    try {
      const blob =
        section.kind === "moa-aoa"
          ? await clientsApi.downloadMoaAoaDocument(
              appNo,
              section.docType as MoaAoaDocType,
              source,
            )
          : await clientsApi.downloadCompanyMiscDocument(
              appNo,
              section.docType as CompanyMiscDocType,
              source,
            );

      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(file.name);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast("Failed to preview document", { variant: "danger" });
    }
  };

  const handleAdminUpload = async (section: DocumentSection, file: File) => {
    if (!file) return;
    if (!requireEdit()) return;
    // Consent template unlocks client download — allow even when installment is due
    if (isLocked && section.docType !== "consentToAct") {
      toast("Action locked. Installment payment is due.", {
        variant: "danger",
      });
      return;
    }

    try {
      if (section.kind === "moa-aoa") {
        await clientsApi.uploadMoaAoaDocument(
          appNo,
          section.docType as MoaAoaDocType,
          file,
        );
      } else {
        await clientsApi.uploadCompanyMiscDocument(
          appNo,
          section.docType as CompanyMiscDocType,
          file,
        );
      }

      toast.success(
        "Draft uploaded. Client will see it in the Download button.",
      );
      const updated = await loadSectionStatus(section);
      setSections((prev) =>
        prev.map((s) => (s.key === section.key ? updated : s)),
      );
    } catch (error) {
      console.error("Error uploading document:", error);
      notifyApiError(error, {
        fallback: "Could not upload document.",
        actionLabel: "upload MOA/AOA documents",
      });
    }
  };

  const renderUploadCard = (section: DocumentSection) => (
    <div
      key={section.key}
      className="rounded-xl bg-white p-4 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-secondary">
          {section.label}
        </h2>
        <div className="flex items-center gap-3">
          <div title="Refresh status">
            <RefreshCw
              size={18}
              onClick={() => refreshSection(section.key)}
              className={`cursor-pointer text-secondary hover:text-primary ${
                refreshingKey === section.key ? "animate-spin" : ""
              }`}
            />
          </div>
          <DocumentIssueButton
            applicationNo={appNo}
            target={{
              entityType: "company",
              entityId: "company",
              entityLabel: "Company Documents",
              fieldKey: section.docType,
              documentLabel: section.label,
              clientRoute: "document-upload",
            }}
            className="inline-flex items-center text-primary hover:text-secondary"
          />
          <FileUploadComponent
            context="clients"
            allowedFileTypes=".pdf,.doc,.docx"
            title={`Upload ${section.label}`}
            subtitle="Upload from your computer, Google Drive, or existing documents."
            dropLabel="Drag and drop your file here"
            onBeforeOpen={() => {
              if (isLocked) {
                toast("Action locked. Installment payment is due.", {
                  variant: "danger",
                });
                return false;
              }
              return requireEdit();
            }}
            onFileSelect={(file) => handleAdminUpload(section, file)}
            renderTrigger={(openPicker) => (
              <div
                title={
                  isLocked
                    ? "Locked - installment due"
                    : `Upload ${section.label} (Admin)`
                }
              >
                <Upload
                  size={20}
                  onClick={isLocked ? undefined : openPicker}
                  className={
                    isLocked
                      ? "text-gray-300 cursor-not-allowed"
                      : "cursor-pointer text-primary hover:text-secondary"
                  }
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {section.adminFile ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-orange-700">
                📤 Admin Upload (CorpE)
              </span>
              <div className="flex items-center gap-2">
                <div title="Preview">
                  <Eye
                    size={16}
                    onClick={() => handlePreview(section, "admin")}
                    className="cursor-pointer text-orange-600 hover:text-orange-700"
                  />
                </div>
                <div title="Download">
                  <Download
                    size={16}
                    onClick={() => handleDownload(section, "admin")}
                    className="cursor-pointer text-orange-600 hover:text-orange-700"
                  />
                </div>
              </div>
            </div>
            <div className="text-sm text-secondary truncate">
              {getFileName(section.adminFile.name)}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-medium text-gray-400 mb-1">
              📤 Admin Upload (CorpE)
            </div>
            <div className="text-sm text-gray-400">No file uploaded</div>
          </div>
        )}

        {section.clientFile ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-700">
                👤 Client Upload (Signed)
              </span>
              <div className="flex items-center gap-2">
                <div title="Preview">
                  <Eye
                    size={16}
                    onClick={() => handlePreview(section, "client")}
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  />
                </div>
                <div title="Download">
                  <Download
                    size={16}
                    onClick={() => handleDownload(section, "client")}
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  />
                </div>
              </div>
            </div>
            <div className="text-sm text-secondary truncate">
              {getFileName(section.clientFile.name)}
            </div>
            {section.clientFile.uploadedAt && (
              <div className="text-xs text-blue-600 mt-1">
                {new Date(section.clientFile.uploadedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-medium text-gray-400 mb-1">
              👤 Client Upload (Signed)
            </div>
            <div className="text-sm text-gray-400">No file uploaded</div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="inline-block px-6 py-3 rounded-lg bg-linear-to-br from-white to-orange-100 text-secondary shadow-md font-medium">
            {isOpc ? "Company Documents" : "MOA & AOA"}
          </div>
        </div>

        {isLocked && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm font-semibold">
            <span>
              ⚠️ Stage locked. Outstanding installment payments are due for this
              client. Document upload actions are disabled.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => renderUploadCard(section))}
        </div>

        <div className="mt-5 p-3 rounded-lg bg-white shadow-sm text-xs text-gray-600">
          💡 Orange = CorpE draft for client to download. Blue = signed copy
          uploaded by client.
        </div>
      </div>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
        title={`Preview: ${previewFileName}`}
        maxWidth="md:max-w-[85vw]"
      >
        {!previewUrl ? (
          <p>No preview available</p>
        ) : (
          <>
            {getFileType(previewFileName) === "image" && (
              <img
                src={previewUrl}
                alt={previewFileName}
                className="w-full max-h-[70vh] object-contain rounded"
              />
            )}

            {getFileType(previewFileName) === "pdf" && (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded"
                title={previewFileName}
              />
            )}

            {getFileType(previewFileName) === "other" && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Preview not available for this file type
                </p>
                <button
                  onClick={() =>
                    previewUrl && window.open(previewUrl, "_blank")
                  }
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  Open in New Tab
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
