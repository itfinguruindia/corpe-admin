"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, Upload, Download, RefreshCw, Eye } from "lucide-react";
import toast from "react-hot-toast";
import TabCard from "@/components/dashboard/TabCard";
import Modal from "@/components/ui/Modal";
import { clientsApi } from "@/lib/api/clients";
import { getFileType } from "@/utils/helpers";
import type { NameStatus } from "@/types/company";

export default function NameApplicationPage() {
  const { appNo } = useParams();

  const STATUS_OPTIONS: NameStatus[] = [
    "Pending",
    "Approved",
    "Resubmission",
    "Rejected",
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<
    Record<number, "Approved" | "Resubmission" | "Rejected" | "Pending">
  >({});
  const [companyNames, setCompanyNames] = useState<any[]>([]);
  const [businessBrief, setBusinessBrief] = useState("");
  const [adminFile, setAdminFile] = useState<{
    name: string;
    path: string;
  } | null>(null);
  const [clientFile, setClientFile] = useState<{
    name: string;
    path: string;
    uploadedAt?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  /* ---------------- HELPERS ---------------- */

  const getFileName = (value: string) => {
    if (!value) return "";
    return value.split("/").pop();
  };

  const resolveStatus = (company: any) => {
    if (company?.isApproved) return "Approved";
    if (company?.nameRejected) return "Rejected";
    if (company?.nameResubmission) return "Resubmission";
    return "Pending";
  };

  /* ---------------- HANDLERS ---------------- */

  const refreshObjectClauseStatus = async () => {
    if (!appNo) return;
    try {
      setIsRefreshing(true);
      const statusData = await clientsApi.getObjectClauseStatus(
        appNo as string,
      );
      setAdminFile(statusData.adminFile);
      setClientFile(statusData.clientFile);
      toast.success("Status refreshed");
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast.error("Failed to refresh status");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (index: number, status: NameStatus) => {
    setStatusMap((prev) => ({ ...prev, [index]: status }));
    if (!appNo) return;
    try {
      await clientsApi.updateCompanyStatus(appNo as string, index, status);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleObjectClauseUpload = () => {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !appNo) return;
      try {
        await clientsApi.uploadObjectClauseDocument(appNo as string, file);
        toast.success("Object Clause uploaded. Client can now download it.");

        // Refresh status to update UI
        const statusData = await clientsApi.getObjectClauseStatus(
          appNo as string,
        );
        setAdminFile(statusData.adminFile);
        setClientFile(statusData.clientFile);
      } catch (error) {
        console.error("Error uploading Object Clause:", error);
        toast.error("Failed to upload Object Clause");
      }
    };
    input.click();
  };

  const handleObjectClauseDownload = async (source?: "admin" | "client") => {
    if (!appNo) return;
    try {
      const blob = await clientsApi.downloadObjectClauseDocument(
        appNo as string,
        source,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Determine filename based on source
      let fileName = "object-clause.pdf";
      if (source === "admin" && adminFile) {
        fileName = adminFile.name;
      } else if (source === "client" && clientFile) {
        fileName = clientFile.name;
      } else {
        fileName = adminFile?.name || clientFile?.name || "object-clause.pdf";
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${source || "file"} successfully`);
    } catch (error) {
      console.error("Error downloading Object Clause:", error);
      toast.error("Failed to download Object Clause");
    }
  };

  const handleObjectClausePreview = async (source: "admin" | "client") => {
    if (!appNo) return;
    try {
      const blob = await clientsApi.downloadObjectClauseDocument(
        appNo as string,
        source,
      );
      const url = window.URL.createObjectURL(blob);

      // Determine filename
      const fileName =
        source === "admin" && adminFile
          ? adminFile.name
          : source === "client" && clientFile
            ? clientFile.name
            : "object-clause.pdf";

      setPreviewUrl(url);
      setPreviewFileName(fileName);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error previewing Object Clause:", error);
      toast.error("Failed to preview Object Clause");
    }
  };

  /* ---------------- API ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getNameApplication(appNo as string);

        if (response?.data) {
          const data = response.data;

          const names: any[] = [];
          if (data.companyName1) names.push(data.companyName1);
          if (data.companyName2) names.push(data.companyName2);
          if (data.companyName3) names.push(data.companyName3);

          setCompanyNames(names);
          setBusinessBrief(data?.businessBrief || "");

          const initialStatus: Record<
            number,
            "Approved" | "Resubmission" | "Rejected" | "Pending"
          > = {};
          names.forEach((company, index) => {
            initialStatus[index] = resolveStatus(company);
          });
          setStatusMap(initialStatus);
        }

        // Fetch object clause status (both admin and client files)
        const statusData = await clientsApi.getObjectClauseStatus(
          appNo as string,
        );
        setAdminFile(statusData.adminFile);
        setClientFile(statusData.clientFile);
      } catch (error) {
        console.error("Error fetching name application:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo) fetchData();
  }, [appNo]);

  // Auto-refresh object clause status every 30 seconds to detect client uploads
  useEffect(() => {
    if (!appNo) return;

    const interval = setInterval(async () => {
      try {
        const statusData = await clientsApi.getObjectClauseStatus(
          appNo as string,
        );
        setAdminFile(statusData.adminFile);
        setClientFile(statusData.clientFile);
      } catch (error) {
        console.error("Error auto-refreshing status:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [appNo]);

  // Cleanup blob URLs when preview changes or closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const companies =
    companyNames.length > 0
      ? companyNames
      : [
          { name: "company name 1", fullName: "company name 1", comment: "" },
          { name: "company name 2", fullName: "company name 2", comment: "" },
          { name: "company name 3", fullName: "company name 3", comment: "" },
        ];

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full p-8 min-h-[110vh]">
      <h1 className="mb-4 text-[36px] font-bold text-primary">{appNo}</h1>

      <div className="grid grid-cols-4 gap-6 mb-8 mt-10">
        <TabCard label="Name Application" active />
      </div>

      <div className="mb-8 text-[16px] font-bold text-secondary">
        Name resubmission ( Takes 7–15 days for approval )
      </div>

      <div className="grid grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="col-span-2">
          <div className="space-y-12">
            {companies.map((company, index) => (
              <div
                key={company._id || index}
                className="grid grid-cols-[220px_160px_260px_160px] gap-x-6 gap-y-4 items-start"
              >
                <div className={"font-medium text-primary"}>
                  {company.fullName || company.name}
                </div>

                {/* STATUS */}
                <div className="relative">
                  <div
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="flex cursor-pointer items-center gap-1 text-secondary"
                  >
                    {statusMap[index] || "Status"} <ChevronDown size={16} />
                  </div>

                  {openIndex === index && (
                    <div className="absolute z-10 mt-2 w-40 rounded-md bg-white shadow-md">
                      {STATUS_OPTIONS.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            handleStatusChange(
                              index,
                              option as
                                | "Approved"
                                | "Resubmission"
                                | "Rejected"
                                | "Pending",
                            );
                            setOpenIndex(null);
                          }}
                          className={`cursor-pointer px-3 py-2 text-sm ${
                            statusMap[index] === option
                              ? "text-primary font-semibold"
                              : "text-secondary hover:bg-orange-50"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold text-secondary">
                    Comments
                  </h2>

                  {/* COMMENTS */}
                  <textarea
                    className="rounded-lg bg-white text-sm outline-none border border-gray-200 p-2 focus:border-primary"
                    placeholder="Detailed comments"
                    defaultValue={company.comment || ""}
                    onBlur={async (e) => {
                      const newComment = e.target.value;
                      if (!appNo || newComment === company?.comment) return;
                      try {
                        await clientsApi.updateCompanyComment(
                          appNo as string,
                          index,
                          newComment,
                        );
                      } catch (error) {
                        console.error("Failed to update comment", error);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-1">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary">
                Object Clause of Company
              </h2>
              <div className="flex items-center gap-3">
                <div title="Refresh status">
                  <RefreshCw
                    size={18}
                    onClick={refreshObjectClauseStatus}
                    className={`cursor-pointer text-secondary hover:text-primary ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </div>
                <div title="Upload Object Clause (Admin)">
                  <Upload
                    size={20}
                    onClick={handleObjectClauseUpload}
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
                          onClick={() => handleObjectClausePreview("admin")}
                          className="cursor-pointer text-orange-600 hover:text-orange-700"
                        />
                      </div>
                      <div title="Download">
                        <Download
                          size={16}
                          onClick={() => handleObjectClauseDownload("admin")}
                          className="cursor-pointer text-orange-600 hover:text-orange-700"
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
                          onClick={() => handleObjectClausePreview("client")}
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                        />
                      </div>
                      <div title="Download">
                        <Download
                          size={16}
                          onClick={() => handleObjectClauseDownload("client")}
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-secondary truncate">
                    {getFileName(clientFile.name)}
                  </div>
                  {clientFile.uploadedAt && (
                    <div className="text-xs text-blue-600 mt-1">
                      {new Date(clientFile.uploadedAt).toLocaleDateString()}
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

            {(adminFile || clientFile) && (
              <div className="mt-4 p-2 rounded bg-gray-50 text-xs text-gray-600">
                💡 Tip: Use eye icon to preview, download icon to save file
              </div>
            )}
          </div>

          <div className="w-full mt-4 bg-white p-4 rounded-xl shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              About Their business
            </h2>

            <textarea
              className="rounded-lg w-full bg-white text-sm outline-none border border-gray-200 p-2"
              value={businessBrief}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
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
