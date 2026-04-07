"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MoaAoaDocument } from "@/types/moaAoa";
import { clientsApi } from "@/lib/api/clients";
import { Eye, Download, Edit, Upload } from "lucide-react";

export default function MoaAoaPage() {
  const { appNo } = useParams();
  const [documents, setDocuments] = useState<MoaAoaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  type CompanyMiscRow = {
    key: "miscellaneous1" | "miscellaneous2" | "miscellaneous3";
    label: string;
    status: "uploaded" | "pending";
    fileName?: string;
  };

  const baseMiscRows: CompanyMiscRow[] = [
    { key: "miscellaneous1", label: "Miscellaneous 1", status: "pending" },
    { key: "miscellaneous2", label: "Miscellaneous 2", status: "pending" },
    { key: "miscellaneous3", label: "Miscellaneous 3", status: "pending" },
  ];

  const [companyMiscDocs, setCompanyMiscDocs] =
    useState<CompanyMiscRow[]>(baseMiscRows);

  const mapApiDataToDocuments = (
    data: any,
    applicationNo: string,
  ): MoaAoaDocument[] => {
    if (!data) return [];

    const { moa, aoa } = data as any;

    const toDoc = (
      source: any | null | undefined,
      type: "MOA" | "AOA",
    ): MoaAoaDocument => ({
      id: type.toLowerCase(),
      applicationNo,
      documentType: type,
      fileName: source?.fileName ?? source?.name,
      fileUrl: source?.fileUrl ?? source?.url,
      status:
        source && (source.fileUrl || source.url) ? "uploaded" : "pending",
      uploadedAt: source?.uploadedAt,
      updatedAt: source?.updatedAt,
    });

    const docs: MoaAoaDocument[] = [];
    docs.push(toDoc(moa, "MOA"));
    docs.push(toDoc(aoa, "AOA"));
    return docs;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!appNo) return;
      setIsLoading(true);
      try {
        const appNoStr = appNo as string;
        let docs: MoaAoaDocument[];

        try {
          const data = await clientsApi.getMoaAoaDocuments(appNoStr);
          docs = mapApiDataToDocuments(data, appNoStr);
        } catch (error: any) {
          const status = error?.response?.status;
          const message = error?.response?.data?.message;
          if (status === 404 && message === "Corporate documents not found") {
            docs = [
              {
                id: "moa",
                applicationNo: appNoStr,
                documentType: "MOA",
                status: "pending",
              },
              {
                id: "aoa",
                applicationNo: appNoStr,
                documentType: "AOA",
                status: "pending",
              },
            ];
          } else {
            throw error;
          }
        }

        const [moaStatus, aoaStatus] = await Promise.all([
          clientsApi.getMoaAoaDocStatus(appNoStr, "moa"),
          clientsApi.getMoaAoaDocStatus(appNoStr, "aoa"),
        ]);

        setDocuments(
          docs.map((doc) => {
            const apiStatus =
              doc.documentType.toLowerCase() === "aoa" ? aoaStatus : moaStatus;
            const hasFileFromList = !!(doc.fileUrl || (doc as any).url);
            const status =
              apiStatus === "uploaded" || hasFileFromList ? "uploaded" : "pending";
            return { ...doc, status };
          }),
        );

        // Load company-level Misc documents (Misc 1–3)
        try {
          const miscData = await clientsApi.getCompanyMiscDocuments(appNoStr);
          const [misc1Status, misc2Status, misc3Status] = await Promise.all([
            clientsApi.getCompanyMiscDocStatus(appNoStr, "miscellaneous1"),
            clientsApi.getCompanyMiscDocStatus(appNoStr, "miscellaneous2"),
            clientsApi.getCompanyMiscDocStatus(appNoStr, "miscellaneous3"),
          ]);

          const rows: CompanyMiscRow[] = baseMiscRows.map((row) => {
            const slot = miscData?.[row.key];
            const statusResult =
              row.key === "miscellaneous1"
                ? misc1Status
                : row.key === "miscellaneous2"
                  ? misc2Status
                  : misc3Status;
            const finalName =
              statusResult.name ?? slot?.name ?? row.fileName ?? undefined;

            return {
              ...row,
              status: statusResult.status,
              fileName: finalName ?? undefined,
            };
          });

          setCompanyMiscDocs(rows);
        } catch (miscError) {
          console.error("Error fetching company misc documents:", miscError);
          // Keep base rows with pending status if API fails
          setCompanyMiscDocs(baseMiscRows);
        }
      } catch (error) {
        console.error("Error fetching MOA & AOA:", error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [appNo]);

  const handleView = async (doc: MoaAoaDocument) => {
    if (!appNo) return;
    try {
      const docType =
        doc.documentType.toLowerCase() === "aoa" ? "aoa" : "moa";
      const blob = await clientsApi.downloadMoaAoaDocument(
        appNo as string,
        docType,
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing MOA/AOA document:", error);
    }
  };

  const handleDownload = async (doc: MoaAoaDocument) => {
    if (!appNo) return;
    try {
      const docType =
        doc.documentType.toLowerCase() === "aoa" ? "aoa" : "moa";
      const blob = await clientsApi.downloadMoaAoaDocument(
        appNo as string,
        docType,
      );
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = doc.fileName || docType.toUpperCase();
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading MOA/AOA document:", error);
    }
  };

  const handleEdit = (doc: MoaAoaDocument) => {
    console.log("Edit document:", doc.documentType);
  };

  const handleMiscUpload = (row: CompanyMiscRow) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !appNo) return;
      try {
        await clientsApi.uploadCompanyMiscDocument(
          appNo as string,
          row.key,
          file,
        );
        toast.success("Draft uploaded. Client will see it in the Download button.");
        const statusResult = await clientsApi.getCompanyMiscDocStatus(
          appNo as string,
          row.key,
        );
        setCompanyMiscDocs((prev) =>
          prev.map((item) =>
            item.key === row.key
              ? {
                  ...item,
                  status: statusResult.status,
                  fileName: statusResult.name ?? item.fileName,
                }
              : item,
          ),
        );
      } catch (error) {
        console.error("Error uploading misc document:", error);
        toast.error("Could not upload document.");
      }
    };
    input.click();
  };

  const handleMiscView = async (row: CompanyMiscRow) => {
    if (!appNo) return;
    try {
      const blob = await clientsApi.downloadCompanyMiscDocument(
        appNo as string,
        row.key,
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        toast.error("No document available yet.");
        setCompanyMiscDocs((prev) =>
          prev.map((item) =>
            item.key === row.key
              ? { ...item, status: "pending", fileName: undefined }
              : item,
          ),
        );
      } else {
        console.error("Error viewing misc document:", error);
        toast.error("Could not open document.");
      }
    }
  };

  const handleMiscDownload = async (row: CompanyMiscRow) => {
    if (!appNo) return;
    try {
      const blob = await clientsApi.downloadCompanyMiscDocument(
        appNo as string,
        row.key,
      );
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;

      if (row.fileName) {
        // Use exact name returned by backend for consistency
        link.download = row.fileName;
      } else {
        // Fallback: infer extension from MIME type
        const mime = blob.type;
        let ext = "";
        if (mime === "application/pdf") ext = ".pdf";
        else if (mime === "image/png") ext = ".png";
        else if (mime === "image/jpeg") ext = ".jpg";
        else if (mime === "image/webp") ext = ".webp";

        const baseName = row.label.replace(/\s+/g, "-");
        link.download = `${baseName}${ext}`;
      }
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        toast.error("No document available yet.");
        setCompanyMiscDocs((prev) =>
          prev.map((item) =>
            item.key === row.key
              ? { ...item, status: "pending", fileName: undefined }
              : item,
          ),
        );
      } else {
        console.error("Error downloading misc document:", error);
        toast.error("Could not download document.");
      }
    }
  };

  const handleUpload = (documentType: string) => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !appNo) return;
      try {
        const docType =
          documentType.toLowerCase() === "aoa" ? "aoa" : "moa";
        await clientsApi.uploadMoaAoaDocument(appNo as string, docType, file);
        toast.success("Draft uploaded. Client will see it in the Download button.");
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.documentType.toLowerCase() === docType
              ? { ...doc, status: "uploaded" as const }
              : doc,
          ),
        );
        const [moaStatus, aoaStatus] = await Promise.all([
          clientsApi.getMoaAoaDocStatus(appNo as string, "moa"),
          clientsApi.getMoaAoaDocStatus(appNo as string, "aoa"),
        ]);
        setDocuments((prev) =>
          prev.map((doc) => ({
            ...doc,
            status:
              doc.documentType.toLowerCase() === "aoa" ? aoaStatus : moaStatus,
          })),
        );
      } catch (error) {
        console.error("Error uploading MOA/AOA document:", error);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-6">{appNo}</h1>

        {/* MOA & AOA Tab */}
        <div className="mb-6">
          <div className="inline-block px-6 py-3 rounded-lg bg-linear-to-br from-white to-orange-100 text-secondary shadow-md font-medium">
            MOA & AOA
          </div>
        </div>

        {/* MOA, AOA & Company Misc Documents Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Documents List */}
          <div className="space-y-0">
            {documents.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                No MOA/AOA uploaded yet.
              </div>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between py-6 border-b border-[#F9A826]"
                >
                  <span className="text-base font-medium text-gray-900">
                    {document.documentType}
                  </span>

                  <div className="flex items-center gap-6">
                    {/* View Icon */}
                    <button
                      onClick={() => handleView(document)}
                      disabled={document.status === "pending"}
                      className={`transition-colors ${
                        document.status === "pending"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-primary hover:text-[#d55a39]"
                      }`}
                      title="View"
                    >
                      <Eye className="w-6 h-6" />
                    </button>

                    {/* Download Icon */}
                    <button
                      onClick={() => handleDownload(document)}
                      disabled={document.status === "pending"}
                      className={`transition-colors ${
                        document.status === "pending"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-primary hover:text-[#d55a39]"
                      }`}
                      title="Download"
                    >
                      <Download className="w-6 h-6" />
                    </button>

                    {/* Edit Icon
                    <button
                      onClick={() => handleEdit(document)}
                      disabled={document.status === "pending"}
                      className={`transition-colors ${
                        document.status === "pending"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-primary hover:text-[#d55a39]"
                      }`}
                      title="Edit"
                    >
                      <Edit className="w-6 h-6" />
                    </button> */}

                    {/* Upload Icon */}
                    <button
                      onClick={() => handleUpload(document.documentType)}
                      className="text-primary hover:text-[#d55a39] transition-colors"
                      title="Upload"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Company Misc Documents rows (Misc 1–3) – same design as MOA/AOA, shown just after AOA */}
            {companyMiscDocs.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between py-6 border-b border-[#F9A826]"
              >
                <span className="text-base font-medium text-gray-900">
                  {row.label}
                </span>

                <div className="flex items-center gap-6">
                  {/* View Icon */}
                  <button
                    onClick={() => handleMiscView(row)}
                    disabled={row.status === "pending"}
                    className={`transition-colors ${
                      row.status === "pending"
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-primary hover:text-[#d55a39]"
                    }`}
                    title="View"
                  >
                    <Eye className="w-6 h-6" />
                  </button>

                  {/* Download Icon */}
                  <button
                    onClick={() => handleMiscDownload(row)}
                    disabled={row.status === "pending"}
                    className={`transition-colors ${
                      row.status === "pending"
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-primary hover:text-[#d55a39]"
                    }`}
                    title="Download"
                  >
                    <Download className="w-6 h-6" />
                  </button>

                  {/* Upload Icon */}
                  <button
                    onClick={() => handleMiscUpload(row)}
                    className="text-primary hover:text-[#d55a39] transition-colors"
                    title="Upload"
                  >
                    <Upload className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

