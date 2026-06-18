"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Eye,
  Download,
  FileText,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { Spinner, toast } from "@heroui/react";

import { clientsApi } from "@/lib/api/clients";
import TabCard from "@/components/dashboard/TabCard";
import Modal from "@/components/ui/Modal";
import { getFileType } from "@/utils/helpers";
import { usePermissions } from "@/hooks/usePermissions";
import { requireClientTabEdit } from "@/utils/clientPermissions";
import { DocumentIssueButton } from "@/components/clients/DocumentIssueModal";

interface UploadedDocumentsContentProps {
  appNo: string;
}

export default function UploadedDocumentsContent({
  appNo,
}: UploadedDocumentsContentProps) {
  const router = useRouter();
  const { admin } = usePermissions();
  const [directors, setDirectors] = useState<
    { id: string; directorNumber: number }[]
  >([]);
  const [shareholders, setShareholders] = useState<
    { id: string; shareholderNumber: number }[]
  >([]);
  const [officeDocs, setOfficeDocs] = useState<{
    proofOfOffice?: { name: string; path: string } | null;
    proofOfOfficeAddress?: { name: string; path: string } | null;
    proofOfOfficeAddressAdminDraft?: { name: string; path: string } | null;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Preview Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [response, overviewResponse] = await Promise.all([
          clientsApi.getDirectorAndShareHolders(appNo),
          clientsApi.getCompanyOverview(appNo),
        ]);

        if (response && response.data) {
          // Map directors
          const mappedDirectors = (response.data.directors || []).map(
            (d: any, idx: number) => ({
              id: d.directorId || `${idx}`,
              directorNumber: idx + 1,
            }),
          );

          // Map shareholders
          const mappedShareholders = (response.data.shareholders || []).map(
            (s: any, idx: number) => ({
              id: s.shareholderId || `${idx}`,
              shareholderNumber: idx + 1,
            }),
          );

          setDirectors(mappedDirectors);
          setShareholders(mappedShareholders);
        }

        if (overviewResponse && overviewResponse.data) {
          const registeredOffice =
            overviewResponse.data.corporateStructure?.registeredOffice;
          setOfficeDocs({
            proofOfOffice: registeredOffice?.proofOfOffice ?? null,
            proofOfOfficeAddress:
              registeredOffice?.proofOfOfficeAddress ?? null,
            proofOfOfficeAddressAdminDraft:
              registeredOffice?.proofOfOfficeAddressAdminDraft ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [appNo]);

  const handleDirectorClick = (director: { id: string }) => {
    router.push(`/clients/${appNo}/directors/${director.id}/documents`);
  };

  const handleShareholderClick = (shareholder: { id: string }) => {
    router.push(`/clients/${appNo}/shareholders/${shareholder.id}/documents`);
  };

  const handleDocPreview = async (
    docType: string,
    documentType: string,
    fileName: string,
  ) => {
    try {
      const blob = await clientsApi.downloadCorporateStructureDocument(
        appNo,
        docType,
      );
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(fileName);
      setPreviewTitle(documentType);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Failed to preview document:", error);
      toast.danger("Could not open document.");
    }
  };

  const handleDocDownload = async (docType: string, fileName: string) => {
    try {
      const blob = await clientsApi.downloadCorporateStructureDocument(
        appNo,
        docType,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `${docType}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Document downloaded successfully.");
    } catch (error) {
      console.error("Failed to download document:", error);
      toast.danger("Could not download document.");
    }
  };

  const handleDocUpload = (docType: string, label: string) => {
    if (!requireClientTabEdit(admin, "company")) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await clientsApi.uploadCorporateStructureDocument(appNo, docType, file);
        toast.success(`${label} uploaded successfully.`);
        // Reload data to reflect the changes
        const overviewResponse = await clientsApi.getCompanyOverview(appNo);
        if (overviewResponse && overviewResponse.data) {
          const registeredOffice =
            overviewResponse.data.corporateStructure?.registeredOffice;
          setOfficeDocs({
            proofOfOffice: registeredOffice?.proofOfOffice ?? null,
            proofOfOfficeAddress:
              registeredOffice?.proofOfOfficeAddress ?? null,
            proofOfOfficeAddressAdminDraft:
              registeredOffice?.proofOfOfficeAddressAdminDraft ?? null,
          });
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        toast.danger(`Failed to upload ${label}.`);
      }
    };
    input.click();
  };

  const handleDocDelete = async (docType: string, label: string) => {
    if (!requireClientTabEdit(admin, "company")) return;

    if (!confirm(`Are you sure you want to delete the ${label}?`)) {
      return;
    }

    try {
      await clientsApi.deleteCorporateStructureDocument(appNo, docType);
      toast.success(`${label} deleted successfully.`);
      // Reload data
      const overviewResponse = await clientsApi.getCompanyOverview(appNo);
      if (overviewResponse && overviewResponse.data) {
        const registeredOffice =
          overviewResponse.data.corporateStructure?.registeredOffice;
        setOfficeDocs({
          proofOfOffice: registeredOffice?.proofOfOffice ?? null,
          proofOfOfficeAddress: registeredOffice?.proofOfOfficeAddress ?? null,
          proofOfOfficeAddressAdminDraft:
            registeredOffice?.proofOfOfficeAddressAdminDraft ?? null,
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.danger(`Failed to delete ${label}.`);
    }
  };

  const loadOfficeDocs = async () => {
    const overviewResponse = await clientsApi.getCompanyOverview(appNo);
    if (overviewResponse && overviewResponse.data) {
      const registeredOffice =
        overviewResponse.data.corporateStructure?.registeredOffice;
      setOfficeDocs({
        proofOfOffice: registeredOffice?.proofOfOffice ?? null,
        proofOfOfficeAddress: registeredOffice?.proofOfOfficeAddress ?? null,
        proofOfOfficeAddressAdminDraft:
          registeredOffice?.proofOfOfficeAddressAdminDraft ?? null,
      });
    }
  };

  const refreshOfficeDocs = async () => {
    try {
      setIsRefreshing(true);
      await loadOfficeDocs();
      toast.success("Office documents refreshed");
    } catch (error) {
      console.error("Error refreshing office documents:", error);
      toast.danger("Failed to refresh office documents.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderOfficeDocCard = (
    label: string,
    docType: string,
    fileObj: { name: string; path: string } | null | undefined,
    allowUpload: boolean = true,
  ) => {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-base font-bold text-secondary">{label}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {allowUpload && (
                <button
                  onClick={() => handleDocUpload(docType, label)}
                  title="Upload document"
                  className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
              {fileObj && (
                <button
                  onClick={() => handleDocDelete(docType, label)}
                  title="Delete document"
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <DocumentIssueButton
                applicationNo={appNo}
                target={{
                  entityType: "registeredOffice",
                  entityId: "registeredOffice",
                  entityLabel: "Registered Office",
                  fieldKey: docType,
                  documentLabel: label,
                  clientRoute: "corporate-structure",
                }}
                className="inline-flex items-center text-primary hover:text-secondary p-1"
              />
            </div>
          </div>
          {fileObj ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <p
                className="text-sm text-gray-600 truncate flex-1"
                title={fileObj.name}
              >
                {fileObj.name}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No document uploaded yet
            </p>
          )}
        </div>

        {fileObj && (
          <div className="flex items-center gap-4 mt-4 border-t pt-4 border-gray-100">
            <button
              onClick={() => handleDocPreview(docType, label, fileObj.name)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => handleDocDownload(docType, fileObj.name)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDualOfficeDocCard = (
    label: string,
    docTypeClient: string,
    docTypeAdmin: string,
    clientFile: { name: string; path: string } | null | undefined,
    adminFile: { name: string; path: string } | null | undefined,
    onRefresh?: () => void,
    refreshing?: boolean,
  ) => {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-base font-bold text-secondary">{label}</h3>
            {onRefresh && (
              <div title="Refresh status" className="shrink-0">
                <RefreshCw
                  size={18}
                  onClick={refreshing ? undefined : onRefresh}
                  className={`cursor-pointer text-secondary hover:text-primary ${refreshing ? "animate-spin" : ""}`}
                />
              </div>
            )}
            <DocumentIssueButton
              applicationNo={appNo}
              target={{
                entityType: "registeredOffice",
                entityId: "registeredOffice",
                entityLabel: "Registered Office",
                fieldKey: docTypeClient,
                documentLabel: label,
                clientRoute: "corporate-structure",
              }}
              className="inline-flex items-center text-primary hover:text-secondary p-1 shrink-0"
            />
          </div>

          <div className="space-y-4">
            {/* Admin Template Slot */}
            <div className="border border-orange-100 bg-orange-50/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-700 tracking-wider">
                  📤 ADMIN TEMPLATE
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleDocUpload(docTypeAdmin, "Admin Template")
                    }
                    title="Upload template"
                    className="p-1.5 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  {adminFile && (
                    <button
                      onClick={() =>
                        handleDocDelete(docTypeAdmin, "Admin Template")
                      }
                      title="Delete template"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {adminFile ? (
                <div className="bg-white border border-orange-100 rounded-lg p-3 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={adminFile.name}
                    >
                      {adminFile.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        handleDocPreview(
                          docTypeAdmin,
                          "Admin Template",
                          adminFile.name,
                        )
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() =>
                        handleDocDownload(docTypeAdmin, adminFile.name)
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic pl-1">
                  No template uploaded yet. (Upload required to enable client
                  upload)
                </p>
              )}
            </div>

            {/* Client Signed Copy Slot */}
            <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 tracking-wider">
                  👤 CLIENT SIGNED COPY
                </span>
                <div className="flex items-center gap-2">
                  {clientFile && (
                    <button
                      onClick={() =>
                        handleDocDelete(docTypeClient, "Client Signed Copy")
                      }
                      title="Delete client copy"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {clientFile ? (
                <div className="bg-white border border-blue-100 rounded-lg p-3 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={clientFile.name}
                    >
                      {clientFile.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        handleDocPreview(
                          docTypeClient,
                          "Client Signed Copy",
                          clientFile.name,
                        )
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() =>
                        handleDocDownload(docTypeClient, clientFile.name)
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic pl-1">
                  No document uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-gray-500 mt-2 text-lg">
            Manage and view uploaded documents for directors, shareholders, and
            registered office proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Directors Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <UserCheck className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Directors</h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-medium ml-auto">
                {directors.length}
              </span>
            </div>

            {directors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {directors.map((director) => (
                  <TabCard
                    key={director.id}
                    label={`Director ${director.directorNumber}`}
                    onClick={() => handleDirectorClick(director)}
                    className="text-left hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No directors listed for this application." />
            )}
          </section>

          {/* Shareholders Section */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">
                Shareholders
              </h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full text-sm font-medium ml-auto">
                {shareholders.length}
              </span>
            </div>

            {shareholders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shareholders.map((shareholder) => (
                  <TabCard
                    key={shareholder.id}
                    label={`Shareholder ${shareholder.shareholderNumber}`}
                    onClick={() => handleShareholderClick(shareholder)}
                    className="text-left hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No shareholders listed for this application." />
            )}
          </section>
        </div>

        {/* Registered Office Documents Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
            <div className="bg-amber-50 p-2 rounded-lg">
              <FileText className="text-amber-600 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">
              Registered Office Documents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderOfficeDocCard(
              "Upload latest electricity bill",
              "proofOfOffice",
              officeDocs.proofOfOffice,
              false,
            )}
            {renderDualOfficeDocCard(
              "Proof of office address along with NOC, if applicable (Conveyance/ Lease deed/ Rent Agreement along with rent receipts)",
              "proofOfOfficeAddress",
              "proofOfOfficeAddressAdminDraft",
              officeDocs.proofOfOfficeAddress,
              officeDocs.proofOfOfficeAddressAdminDraft,
              refreshOfficeDocs,
              isRefreshing,
            )}
          </div>
        </section>

        {directors.length === 0 &&
          shareholders.length === 0 &&
          !officeDocs.proofOfOffice &&
          !officeDocs.proofOfOfficeAddress && (
            <div className="mt-20">
              <EmptyState message="No entities or registered office documents found. Please check the application status." />
            </div>
          )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewFileName("");
          }
        }}
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
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="text-gray-300 w-8 h-8" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
