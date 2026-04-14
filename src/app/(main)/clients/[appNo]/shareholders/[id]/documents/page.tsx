"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Download, Upload, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Shareholder } from "@/types/shareholder";
import { ShareholderDocument } from "@/types/shareholderDocuments";
import { clientsApi } from "@/lib/api/clients";
import Modal from "@/components/ui/Modal";
import { getFileType } from "@/utils/helpers";

export default function ShareholderDocumentsPage() {
  const { appNo, id } = useParams();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [documents, setDocuments] = useState<ShareholderDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ShareholderDocument | null>(
    null,
  );
  const [inc9AdminFile, setInc9AdminFile] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [inc9ClientFile, setInc9ClientFile] = useState<{
    name: string;
    path: string;
    uploadedAt?: string;
  } | null>(null);
  const [isRefreshingInc9, setIsRefreshingInc9] = useState(false);

  // Upload allowed for these doc types (admin can upload INC-9 Shareholder draft)
  const UPLOAD_ALLOWED_DOCS = [
    "INC-9 Shareholder",
    "Miscellaneous",
    "Miscellaneous 1",
    "Miscellaneous 2",
    "Miscellaneous 3",
  ];
  const canUpload = (documentType: string) =>
    UPLOAD_ALLOWED_DOCS.includes(documentType);

  const canPreviewOrDownload = (doc: ShareholderDocument) => {
    if (doc.documentType === "INC-9 Shareholder") {
      return false; // INC-9 uses separate section below
    }
    return doc.status !== "pending";
  };

  const getFileName = (value: string) => {
    if (!value) return "";
    return value.split("/").pop();
  };

  const refreshInc9Status = async () => {
    if (!appNo || !id) return;
    try {
      setIsRefreshingInc9(true);
      const inc9Status = await clientsApi.getInc9ShareholderDocStatus(
        appNo as string,
        id as string,
      );
      setInc9AdminFile(inc9Status.adminFile || null);
      setInc9ClientFile(inc9Status.clientFile || null);
      toast.success("INC-9 status refreshed");
    } catch (error) {
      console.error("Error refreshing INC-9 status:", error);
      toast.error("Failed to refresh INC-9 status");
    } finally {
      setIsRefreshingInc9(false);
    }
  };

  // Transform API data to array
  const transformDocumentsToArray = (docData: any): ShareholderDocument[] => {
    const documentTypes = [
      { key: "adhar", label: "Aadhaar Card" },
      { key: "panCard", label: "PAN Card" },
      {
        key: "passportOrDrivingOrVoter",
        label: "Passport/Driving License/Voter ID",
      },
      // { key: "presentAddressProof", label: "Present Address Proof" },
      { key: "addressProofIndia", label: "Present Address Proof (India)" },
      { key: "addressProofForeign", label: "Present Address Proof (Foreign)" },

      { key: "passportForeign", label: "Passport (Foreign)" },
      { key: "inc9Shareholder", label: "INC-9 Shareholder" },
    ];
    return documentTypes.map((docType, index) => {
      const doc = docData[docType.key];
      return {
        id: `${docType.key}-${index}`,
        shareholderId: id as string,
        documentType: docType.label,
        status: doc ? doc.status || "uploaded" : "pending",
        fileUrl: doc?.url || "",
        fileName: doc?.name || "",
        uploadedAt: doc?.uploadedAt || "",
      };
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [shareholderData, documentsData, inc9Status] = await Promise.all([
          clientsApi.getShareholderById(appNo as string, id as string),
          clientsApi.getShareholderDocuments(appNo as string, id as string),
          clientsApi.getInc9ShareholderDocStatus(appNo as string, id as string),
        ]);
        setShareholder(shareholderData);
        setDocuments(transformDocumentsToArray(documentsData));
        setInc9AdminFile(inc9Status.adminFile || null);
        setInc9ClientFile(inc9Status.clientFile || null);
      } catch (err) {
        console.error("Error loading shareholder documents", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (appNo && id) loadData();
  }, [appNo, id]);

  const handleView = async (doc: ShareholderDocument) => {
    if (doc.documentType === "INC-9 Shareholder") {
      return; // Handled in separate section
    }
    if (!doc.fileUrl) return;
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (doc: ShareholderDocument) => {
    if (doc.documentType === "INC-9 Shareholder") {
      return; // Handled in separate section
    }
    if (!doc.fileUrl || !doc.fileName) return;
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.click();
  };

  const handleInc9Preview = async (source: "admin" | "client") => {
    if (!appNo || !id) return;
    try {
      const blob = await clientsApi.downloadInc9ShareholderDocument(
        appNo as string,
        id as string,
        source,
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("Opening INC-9 Shareholder document");
    } catch {
      toast.error("Could not open INC-9 Shareholder document.");
    }
  };

  const handleInc9Download = async (source: "admin" | "client") => {
    if (!appNo || !id) return;
    try {
      const blob = await clientsApi.downloadInc9ShareholderDocument(
        appNo as string,
        id as string,
        source,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName =
        source === "admin" && inc9AdminFile
          ? inc9AdminFile.name
          : source === "client" && inc9ClientFile
            ? inc9ClientFile.name
            : "INC-9-Shareholder.pdf";

      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("INC-9 Shareholder document downloaded");
    } catch {
      toast.error("Could not download INC-9 Shareholder document.");
    }
  };

  const handleInc9Delete = async (source: "admin" | "client") => {
    if (!appNo || !id) return;

    const fileSource = source === "admin" ? "Admin Upload" : "Client Upload";
    if (!confirm(`Are you sure you want to delete the ${fileSource}?`)) {
      return;
    }

    try {
      await clientsApi.deleteInc9ShareholderDocument(
        appNo as string,
        id as string,
        source,
      );
      toast.success(`${fileSource} deleted successfully`);

      // Refresh status after deletion
      const inc9Status = await clientsApi.getInc9ShareholderDocStatus(
        appNo as string,
        id as string,
      );
      setInc9AdminFile(inc9Status.adminFile || null);
      setInc9ClientFile(inc9Status.clientFile || null);
    } catch (error) {
      console.error(`Error deleting ${fileSource}:`, error);
      toast.error(`Failed to delete ${fileSource}`);
    }
  };

  const handleUpload = (documentType: string) => {
    if (documentType === "INC-9 Shareholder") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !appNo || !id) return;
        try {
          await clientsApi.uploadInc9ShareholderDocument(
            appNo as string,
            id as string,
            file,
          );
          toast.success(
            "INC-9 Shareholder draft uploaded. Client will see it in the Download button.",
          );
          const inc9Status = await clientsApi.getInc9ShareholderDocStatus(
            appNo as string,
            id as string,
          );
          setInc9AdminFile(inc9Status.adminFile || null);
          setInc9ClientFile(inc9Status.clientFile || null);
        } catch {
          toast.error("Could not upload INC-9 Shareholder document.");
        }
      };
      input.click();
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Uploading:", file.name, "for", documentType);
        // TODO: API upload logic for other doc types
      }
    };
    input.click();
  };

  const pendingCount = documents.filter(
    (doc) => doc.status === "pending",
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!shareholder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Shareholder not found</div>
      </div>
    );
  }

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

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Regular Documents */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold text-secondary mb-6">
                {shareholder.name} - Documents
              </h2>

              <div>
                {documents
                  .filter((doc) => doc.documentType !== "INC-9 Shareholder")
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
                          disabled={!canPreviewOrDownload(document)}
                          className={
                            canPreviewOrDownload(document)
                              ? "text-primary hover:text-secondary"
                              : "text-gray-300 cursor-not-allowed"
                          }
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Download */}
                        <button
                          onClick={() => handleDownload(document)}
                          disabled={!canPreviewOrDownload(document)}
                          className={
                            canPreviewOrDownload(document)
                              ? "text-primary hover:text-secondary"
                              : "text-gray-300 cursor-not-allowed"
                          }
                        >
                          <Download className="w-5 h-5" />
                        </button>

                        {/* Upload */}
                        {canUpload(document.documentType) && (
                          <button
                            onClick={() => handleUpload(document.documentType)}
                            className="text-primary hover:text-secondary"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: INC-9 Shareholder Section */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary">
                  INC-9 Shareholder
                </h2>
                <div className="flex items-center gap-3">
                  <div title="Refresh status">
                    <RefreshCw
                      size={18}
                      onClick={refreshInc9Status}
                      className={`cursor-pointer text-secondary hover:text-primary ${isRefreshingInc9 ? "animate-spin" : ""}`}
                    />
                  </div>
                  <div title="Upload INC-9 (Admin)">
                    <Upload
                      size={20}
                      onClick={() => handleUpload("INC-9 Shareholder")}
                      className="cursor-pointer text-primary hover:text-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Admin Upload */}
                {inc9AdminFile ? (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-orange-700">
                        📤 Admin Upload
                      </span>
                      <div className="flex items-center gap-2">
                        <div title="Preview">
                          <Eye
                            size={16}
                            onClick={() => handleInc9Preview("admin")}
                            className="cursor-pointer text-orange-600 hover:text-orange-700"
                          />
                        </div>
                        <div title="Download">
                          <Download
                            size={16}
                            onClick={() => handleInc9Download("admin")}
                            className="cursor-pointer text-orange-600 hover:text-orange-700"
                          />
                        </div>
                        <div title="Delete">
                          <Trash2
                            size={16}
                            onClick={() => handleInc9Delete("admin")}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-secondary truncate">
                      {getFileName(inc9AdminFile.name)}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      📤 Admin Upload
                    </div>
                    <div className="text-sm text-gray-400">
                      No file uploaded
                    </div>
                  </div>
                )}

                {/* Client Upload */}
                {inc9ClientFile ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-700">
                        👤 Client Upload
                      </span>
                      <div className="flex items-center gap-2">
                        <div title="Preview">
                          <Eye
                            size={16}
                            onClick={() => handleInc9Preview("client")}
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          />
                        </div>
                        <div title="Download">
                          <Download
                            size={16}
                            onClick={() => handleInc9Download("client")}
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          />
                        </div>
                        <div title="Delete">
                          <Trash2
                            size={16}
                            onClick={() => handleInc9Delete("client")}
                            className="cursor-pointer text-red-600 hover:text-red-700"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-secondary truncate">
                      {getFileName(inc9ClientFile.name)}
                    </div>
                    {inc9ClientFile.uploadedAt && (
                      <div className="text-xs text-blue-600 mt-1">
                        {new Date(
                          inc9ClientFile.uploadedAt,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      👤 Client Upload
                    </div>
                    <div className="text-sm text-gray-400">
                      No file uploaded
                    </div>
                  </div>
                )}
              </div>

              {(inc9AdminFile || inc9ClientFile) && (
                <div className="mt-4 p-2 rounded bg-gray-50 text-xs text-gray-600">
                  💡 Tip: Use eye icon to preview, download icon to save file
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDoc(null);
        }}
        title={selectedDoc?.documentType}
      >
        {!selectedDoc?.fileUrl ? (
          <p>No preview available</p>
        ) : (
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
        )}
      </Modal>
    </div>
  );
}
