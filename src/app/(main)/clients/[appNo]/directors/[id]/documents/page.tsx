"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Eye, Download, Upload, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@heroui/react";

import { Director } from "@/types/director";
import { DirectorDocument } from "@/types/directorDocuments";
import { clientsApi } from "@/lib/api/clients";
import Modal from "@/components/ui/Modal";
import { getFileType } from "@/utils/helpers";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { notifyApiError } from "@/utils/apiErrors";
import { DocumentIssueButton } from "@/components/clients/DocumentIssueModal";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import {
  getDirectorDualSourceDocumentFields,
  getDirectorRegularDocumentFields,
  resolveIsForeignResident,
} from "@/utils/stakeholderDocumentFields";

/* =======================
   CONFIG / RULES
======================= */

const canPreviewOrDownload = (
  status: string,
  documentType: string,
  dualSourceLabels: string[],
) => {
  if (dualSourceLabels.includes(documentType)) {
    return false; // Dual-source docs use separate section
  }
  return status !== "pending";
};

/* =======================
   TYPES
======================= */

type DualSourceFile = {
  name: string;
  path: string;
  uploadedAt?: string;
} | null;

type DualSourceState = {
  adminFile: DualSourceFile;
  clientFile: DualSourceFile;
};

/* =======================
   COMPONENT
======================= */

export default function DirectorDocumentsPage() {
  const { appNo, id } = useParams();
  const { requireEdit } = useClientTabEdit("director");
  const { labels, isLlp, isLoading: isCompanyTypeLoading } = useClientCompanyLabels();

  const [director, setDirector] = useState<Director | null>(null);
  const [rawDocumentsData, setRawDocumentsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [installmentInfo, setInstallmentInfo] = useState<{
    firstInstallmentDue: boolean;
    firstInstallmentPaid: boolean;
    secondInstallmentDue: boolean;
    secondInstallmentPaid: boolean;
  } | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DirectorDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewFileName, setPreviewFileName] = useState<string>("");

  // Dual-source document states
  const [dir2Files, setDir2Files] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });
  const [inc9Files, setInc9Files] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });
  const [noPanFiles, setNoPanFiles] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });
  const [misc1Files, setMisc1Files] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });
  const [misc2Files, setMisc2Files] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });
  const [misc3Files, setMisc3Files] = useState<DualSourceState>({
    adminFile: null,
    clientFile: null,
  });

  const [isRefreshing, setIsRefreshing] = useState({
    dir2: false,
    inc9Director: false,
    noPanDeclaration: false,
    miscellaneous1: false,
    miscellaneous2: false,
    miscellaneous3: false,
  });

  const isForeignResident = useMemo(
    () => resolveIsForeignResident(director as Record<string, unknown> | null),
    [director],
  );

  const dualSourceDocumentFields = useMemo(
    () =>
      getDirectorDualSourceDocumentFields({
        isForeignResident,
        isLlp,
        labels,
      }),
    [isForeignResident, isLlp, labels],
  );

  const dualSourceDocLabels = useMemo(
    () => dualSourceDocumentFields.map((field) => field.label),
    [dualSourceDocumentFields],
  );

  const primaryDualSourceFields = useMemo(
    () =>
      dualSourceDocumentFields.filter(
        (field) => !field.key.startsWith("miscellaneous"),
      ),
    [dualSourceDocumentFields],
  );

  const miscDualSourceFields = useMemo(
    () =>
      dualSourceDocumentFields.filter((field) =>
        field.key.startsWith("miscellaneous"),
      ),
    [dualSourceDocumentFields],
  );

  /* =======================
     DATA TRANSFORM
  ======================= */

  const documents = useMemo((): DirectorDocument[] => {
    if (!rawDocumentsData) return [];

    const documentTypes = getDirectorRegularDocumentFields({
      isForeignResident,
      isLlp,
      labels,
      rawDocumentsData,
    });

    return documentTypes.map((docType, index) => {
      const doc = rawDocumentsData[docType.key];
      return {
        id: `${docType.key}-${index}`,
        fieldKey: docType.key,
        directorId: id as string,
        documentType: docType.label,
        status: doc ? doc.status || "uploaded" : "pending",
        fileUrl: doc?.url || "",
        fileName: doc?.name || "",
        uploadedAt: doc?.uploadedAt || "",
      };
    });
  }, [rawDocumentsData, labels, isLlp, isForeignResident, id]);

  /* =======================
     HELPER FUNCTIONS
  ======================= */

  const getFileName = (value: string) => {
    if (!value) return "";
    return value.split("/").pop() || "";
  };

  const getDocTypeKey = (documentType: string): string => {
    const fromDualSource = dualSourceDocumentFields.find(
      (field) => field.label === documentType,
    );
    if (fromDualSource) return fromDualSource.key;

    const fromRegular = getDirectorRegularDocumentFields({
      isForeignResident,
      isLlp,
      labels,
      rawDocumentsData,
    }).find((field) => field.label === documentType);

    return fromRegular?.key || "";
  };

  const getSetterForDocType = (docType: string) => {
    const map: Record<
      string,
      React.Dispatch<React.SetStateAction<DualSourceState>>
    > = {
      dir2: setDir2Files,
      inc9Director: setInc9Files,
      noPanDeclaration: setNoPanFiles,
      miscellaneous1: setMisc1Files,
      miscellaneous2: setMisc2Files,
      miscellaneous3: setMisc3Files,
    };
    return map[docType];
  };

  /* =======================
     API CALLS
  ======================= */

  const refreshDocStatus = async (documentType: string, docTypeKey: string) => {
    if (!appNo || !id) return;
    try {
      setIsRefreshing((prev) => ({ ...prev, [docTypeKey]: true }));
      const status = await clientsApi.getDirectorDocStatus(
        appNo as string,
        id as string,
        docTypeKey,
      );
      const setter = getSetterForDocType(docTypeKey);
      if (setter) {
        setter({
          adminFile: status.adminFile || null,
          clientFile: status.clientFile || null,
        });
      }
      toast.success(`${documentType} status refreshed`);
    } catch (error) {
      console.error(`Error refreshing ${documentType} status:`, error);
      toast.danger(`Failed to refresh ${documentType} status`);
    } finally {
      setIsRefreshing((prev) => ({ ...prev, [docTypeKey]: false }));
    }
  };

  const getDualSourceFiles = (docTypeKey: string): DualSourceState => {
    const map: Record<string, DualSourceState> = {
      dir2: dir2Files,
      inc9Director: inc9Files,
      noPanDeclaration: noPanFiles,
      miscellaneous1: misc1Files,
      miscellaneous2: misc2Files,
      miscellaneous3: misc3Files,
    };
    return map[docTypeKey] ?? { adminFile: null, clientFile: null };
  };

  const loadAllDualSourceDocs = async () => {
    if (!appNo || !id) return;

    const docTypes = dualSourceDocumentFields.map((field) => ({
      key: field.key,
      setter: getSetterForDocType(field.key),
    }));

    const promises = docTypes.map(async ({ key, setter }) => {
      if (!setter) return;
      try {
        const status = await clientsApi.getDirectorDocStatus(
          appNo as string,
          id as string,
          key,
        );
        setter({
          adminFile: status.adminFile || null,
          clientFile: status.clientFile || null,
        });
      } catch (error) {
        console.error(`Error loading ${key} status:`, error);
        setter({ adminFile: null, clientFile: null });
      }
    });

    await Promise.all(promises);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [directorData, documentsData, trackerResponse] = await Promise.all([
          clientsApi.getDirectorById(appNo as string, id as string),
          clientsApi.getDirectorDocuments(appNo as string, id as string),
          clientsApi.getTrackingStatus(appNo as string).catch(() => null),
        ]);

        setDirector(directorData);
        setRawDocumentsData(documentsData);

        if (trackerResponse && trackerResponse.installmentInfo) {
          setInstallmentInfo(trackerResponse.installmentInfo);
        }
      } catch (err) {
        console.error("Error loading director documents", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo && id) loadData();
  }, [appNo, id]);

  useEffect(() => {
    if (!appNo || !id || isLoading || isCompanyTypeLoading || !director) {
      return;
    }
    void loadAllDualSourceDocs();
  }, [
    appNo,
    id,
    director,
    isLoading,
    isCompanyTypeLoading,
    dualSourceDocumentFields,
  ]);

  /* =======================
     ACTIONS
  ======================= */

  const handleView = (doc: DirectorDocument) => {
    if (dualSourceDocLabels.includes(doc.documentType)) {
      return; // Handled in separate section
    }
    if (!doc.fileUrl) return;
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleDownload = (doc: DirectorDocument) => {
    if (dualSourceDocLabels.includes(doc.documentType)) {
      return; // Handled in separate section
    }
    if (!doc.fileUrl || !doc.fileName) return;

    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.click();
  };

  const handleDocPreview = async (
    docTypeKey: string,
    source: "admin" | "client",
    documentType: string,
    fileName: string,
  ) => {
    if (!appNo || !id) return;
    try {
      const blob = await clientsApi.downloadDirectorDocument(
        appNo as string,
        id as string,
        docTypeKey,
        source,
      );
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(fileName);
      setPreviewTitle(
        `${documentType} - ${source === "admin" ? "Admin Upload" : "Client Upload"}`,
      );
      setIsPreviewOpen(true);
    } catch {
      toast.danger("Could not open document.");
    }
  };

  const handleDocDownload = async (
    docTypeKey: string,
    source: "admin" | "client",
    fileName: string,
  ) => {
    if (!appNo || !id) return;
    try {
      const blob = await clientsApi.downloadDirectorDocument(
        appNo as string,
        id as string,
        docTypeKey,
        source,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `${docTypeKey}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Document downloaded");
    } catch {
      toast.danger("Could not download document.");
    }
  };

  const handleDocDelete = async (
    documentType: string,
    docTypeKey: string,
    source: "admin" | "client",
  ) => {
    if (!appNo || !id) return;
    if (!requireEdit()) return;

    const fileSource = source === "admin" ? "Admin Upload" : "Client Upload";
    if (!confirm(`Are you sure you want to delete the ${fileSource}?`)) {
      return;
    }

    try {
      await clientsApi.deleteDirectorDocument(
        appNo as string,
        id as string,
        docTypeKey,
        source,
      );
      toast.success(`${fileSource} deleted successfully`);

      // Refresh status after deletion
      await refreshDocStatus(documentType, docTypeKey);
    } catch (error) {
      console.error(`Error deleting ${fileSource}:`, error);
      notifyApiError(error, {
        fallback: `Failed to delete ${fileSource}.`,
        actionLabel: "delete this document",
      });
    }
  };

  const handleUpload = (documentType: string) => {
    if (!requireEdit()) return;
    const docTypeKey = getDocTypeKey(documentType);
    if (!docTypeKey) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !appNo || !id) return;
      try {
        await clientsApi.uploadDirectorDocument(
          appNo as string,
          id as string,
          docTypeKey,
          file,
        );
        toast.success(
          `${documentType} draft uploaded. Client will see it in the Download button.`,
        );
        // Refresh status after upload
        await refreshDocStatus(documentType, docTypeKey);
      } catch (error) {
        notifyApiError(error, {
          fallback: `Could not upload ${documentType} document.`,
          actionLabel: "upload director documents",
        });
      }
    };
    input.click();
  };

  /* =======================
     RENDER HELPERS
  ======================= */

  const renderDualSourceCard = (
    documentType: string,
    docTypeKey: string,
    files: DualSourceState,
  ) => {
    const { adminFile, clientFile } = files;
    const isRefreshingDoc =
      isRefreshing[docTypeKey as keyof typeof isRefreshing];
    const isStage3Gated = !!(
      installmentInfo?.firstInstallmentDue || !installmentInfo?.secondInstallmentPaid
    );
    const isClientUploadLocked =
      isStage3Gated &&
      [
        "dir2",
        "inc9Director",
        "noPanDeclaration",
        "miscellaneous1",
        "miscellaneous2",
        "miscellaneous3",
      ].includes(docTypeKey);

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary">
            {documentType}
          </h2>
          <div className="flex items-center gap-3">
            <DocumentIssueButton
              applicationNo={appNo as string}
              target={{
                entityType: "director",
                entityId: id as string,
                entityLabel: `${director?.name || labels.director} ${labels.entityDirector}`,
                fieldKey: docTypeKey,
                documentLabel: documentType,
                clientRoute: "document-upload",
              }}
              className="inline-flex items-center text-primary hover:text-secondary"
            />
            <div title="Refresh status">
              <RefreshCw
                size={18}
                onClick={() => refreshDocStatus(documentType, docTypeKey)}
                className={`cursor-pointer text-secondary hover:text-primary ${isRefreshingDoc ? "animate-spin" : ""}`}
              />
            </div>
            <div title={`Upload ${documentType} template (Admin)`}>
              <Upload
                size={20}
                onClick={() => handleUpload(documentType)}
                className="cursor-pointer text-primary hover:text-secondary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Admin Upload */}
          {adminFile ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-orange-700">
                  📤 Admin Upload
                </span>
                <div className="flex items-center gap-2">
                  <div title="Preview">
                    <Eye
                      size={16}
                      onClick={() =>
                        handleDocPreview(
                          docTypeKey,
                          "admin",
                          documentType,
                          adminFile.name,
                        )
                      }
                      className="cursor-pointer text-orange-600 hover:text-orange-700"
                    />
                  </div>
                  <div title="Download">
                    <Download
                      size={16}
                      onClick={() =>
                        handleDocDownload(docTypeKey, "admin", adminFile.name)
                      }
                      className="cursor-pointer text-orange-600 hover:text-orange-700"
                    />
                  </div>
                  <div title="Delete template">
                    <Trash2
                      size={16}
                      onClick={() =>
                        handleDocDelete(documentType, docTypeKey, "admin")
                      }
                      className="cursor-pointer text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary truncate">
                {getFileName(adminFile.name)}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-400 mb-1">
                📤 Admin Upload
              </div>
              <div className="text-sm text-gray-400">No file uploaded</div>
            </div>
          )}

          {/* Client Upload */}
          {clientFile ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700">
                  👤 Client Upload
                </span>
                <div className="flex items-center gap-2">
                  <div title="Preview">
                    <Eye
                      size={16}
                      onClick={() =>
                        handleDocPreview(
                          docTypeKey,
                          "client",
                          documentType,
                          clientFile.name,
                        )
                      }
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    />
                  </div>
                  <div title="Download">
                    <Download
                      size={16}
                      onClick={() =>
                        handleDocDownload(docTypeKey, "client", clientFile.name)
                      }
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    />
                  </div>
                  <div
                    title={
                      isClientUploadLocked
                        ? "Locked — installment due"
                        : "Delete"
                    }
                  >
                    <Trash2
                      size={16}
                      onClick={
                        isClientUploadLocked
                          ? undefined
                          : () =>
                              handleDocDelete(
                                documentType,
                                docTypeKey,
                                "client",
                              )
                      }
                      className={
                        isClientUploadLocked
                          ? "text-gray-300 cursor-not-allowed"
                          : "cursor-pointer text-red-600 hover:text-red-700"
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm text-secondary truncate">
                {getFileName(clientFile.name)}
              </div>
              {clientFile.uploadedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(clientFile.uploadedAt).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-400 mb-1">
                👤 Client Upload
              </div>
              <div className="text-sm text-gray-400">No file uploaded</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const pendingCount = documents.filter(
    (doc) => doc.status === "pending",
  ).length;

  /* =======================
     UI STATES
  ======================= */

  if (isLoading || isCompanyTypeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!director) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">{labels.directorNotFound}</div>
      </div>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">{appNo}</h1>
          {pendingCount > 0 && (
            <span className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
              highlights pending documents
            </span>
          )}
        </div>

        {!!(installmentInfo?.firstInstallmentDue || installmentInfo?.secondInstallmentDue) && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
            <p className="font-semibold">
              Outstanding installment payments are due for this client.
            </p>
            <p className="mt-1">
              Client document actions are locked, but you can still upload
              templates on the right (Admin Upload) so the client can download,
              sign, and return them.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Regular Documents */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-secondary mb-6">
                {director.name} - Documents
              </h2>

              <div>
                {documents
                  .filter(
                    (doc) => !dualSourceDocLabels.includes(doc.documentType),
                  )
                  .map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between py-4 border-b border-gray-200"
                    >
                      <span className="text-base font-medium text-gray-900">
                        {document.documentType}
                      </span>

                      <div className="flex items-center gap-4">
                        {/* View */}
                        <button
                          onClick={() => handleView(document)}
                          disabled={
                            !canPreviewOrDownload(
                              document.status,
                              document.documentType,
                              dualSourceDocLabels,
                            )
                          }
                          className={
                            canPreviewOrDownload(
                              document.status,
                              document.documentType,
                              dualSourceDocLabels,
                            )
                              ? "text-primary hover:text-secondary"
                              : "text-gray-300 cursor-not-allowed"
                          }
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Download */}
                        <button
                          onClick={() => handleDownload(document)}
                          disabled={
                            !canPreviewOrDownload(
                              document.status,
                              document.documentType,
                              dualSourceDocLabels,
                            )
                          }
                          className={
                            canPreviewOrDownload(
                              document.status,
                              document.documentType,
                              dualSourceDocLabels,
                            )
                              ? "text-primary hover:text-secondary"
                              : "text-gray-300 cursor-not-allowed"
                          }
                        >
                          <Download className="w-5 h-5" />
                        </button>

                        <DocumentIssueButton
                          applicationNo={appNo as string}
                          target={{
                            entityType: "director",
                            entityId: id as string,
                            entityLabel: `${director.name} ${labels.entityDirector}`,
                            fieldKey: document.fieldKey || "",
                            documentLabel: document.documentType,
                            clientRoute: "document-upload",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: Dual-Source Documents */}
          <div className="col-span-1 space-y-4">
            {primaryDualSourceFields.map((field) =>
              renderDualSourceCard(
                field.label,
                field.key,
                getDualSourceFiles(field.key),
              ),
            )}
          </div>
        </div>

        {/* Bottom: Miscellaneous Documents (standard company types only) */}
        {miscDualSourceFields.length > 0 && (
        <div className="grid grid-cols-3 gap-6 mt-6">
          {miscDualSourceFields.map((field) =>
            renderDualSourceCard(
              field.label,
              field.key,
              getDualSourceFiles(field.key),
            ),
          )}
        </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDoc(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setPreviewFileName("");
          }
        }}
        title={selectedDoc?.documentType || previewTitle}
      >
        {/* Regular document preview */}
        {selectedDoc?.fileUrl && !previewUrl ? (
          <>
            {getFileType(selectedDoc.fileUrl) === "image" && (
              <img
                src={selectedDoc.fileUrl}
                className="w-full max-h-[70vh] object-contain rounded"
              />
            )}

            {getFileType(selectedDoc.fileUrl) === "pdf" && (
              <iframe
                src={selectedDoc.fileUrl}
                className="w-full h-[70vh] border rounded"
              />
            )}
          </>
        ) : null}

        {/* Dual-source document preview */}
        {previewUrl ? (
          <>
            {getFileType(previewFileName) === "image" && (
              <img
                src={previewUrl}
                className="w-full max-h-[70vh] object-contain rounded"
              />
            )}

            {getFileType(previewFileName) === "pdf" && (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded"
              />
            )}
          </>
        ) : null}

        {!selectedDoc?.fileUrl && !previewUrl && <p>No preview available</p>}
      </Modal>
    </div>
  );
}
