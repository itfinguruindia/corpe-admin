"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Clock,
} from "lucide-react";
import { toast } from "@heroui/react";

import { FileUploadComponent } from "@/components/upload";
import Modal from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";

import { clientsApi } from "@/lib/api/clients";
import { getFileType } from "@/utils/helpers";
import type { NameStatus } from "@/types/company";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";
import { notifyApiError } from "@/utils/apiErrors";
import { isRunFilingStepTitle } from "@/utils/trackerStepLabels";

interface NameApplicationContentProps {
  appNo: string;
}

export default function NameApplicationContent({
  appNo,
}: NameApplicationContentProps) {
  const { requireEdit } = useClientTabEdit("app");

  const STATUS_OPTIONS: NameStatus[] = [
    "Pending",
    "Approved",
    "Resubmission",
    "Rejected",
  ];

  const [openDropdown, setOpenDropdown] = useState<{
    index: number;
    field: "status" | "mca" | "trade";
  } | null>(null);
  const [mcaApprovalMap, setMcaApprovalMap] = useState<Record<number, string>>(
    {},
  );
  const [tradeConflictMap, setTradeConflictMap] = useState<
    Record<number, string>
  >({});
  const [statusMap, setStatusMap] = useState<
    Record<number, "Approved" | "Resubmission" | "Rejected" | "Pending">
  >({});
  const [companyNames, setCompanyNames] = useState<any[]>([]);
  const [businessBrief, setBusinessBrief] = useState("");
  const [resubmitOriginal, setResubmitOriginal] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [expandedAttempts, setExpandedAttempts] = useState<
    Record<string, boolean>
  >({ current: true });
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
  const [companyNameStatus, setCompanyNameStatus] = useState("new");
  const [mcaQueryText, setMcaQueryText] = useState("");
  const [mcaQueryFiles, setMcaQueryFiles] = useState<
    Array<{ name: string; path: string }>
  >([]);
  const [clientClarification, setClientClarification] = useState("");
  const [clientClarificationFiles, setClientClarificationFiles] = useState<
    Array<{ name: string; path: string; uploadedAt?: string }>
  >([]);
  const [isSavingMcaQuery, setIsSavingMcaQuery] = useState(false);
  const [isUploadingMcaFile, setIsUploadingMcaFile] = useState(false);

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

  const refreshMcaQueryStatus = async () => {
    try {
      const statusData = await clientsApi.getMcaQueryStatus(appNo);
      setMcaQueryText(statusData?.mcaQuery?.text || "");
      setMcaQueryFiles(statusData?.mcaQuery?.files || []);
      setClientClarification(statusData?.clarification || "");
      setClientClarificationFiles(statusData?.clarificationFiles || []);
      if (statusData?.companyNameStatus) {
        setCompanyNameStatus(statusData.companyNameStatus);
      }
    } catch (error) {
      console.error("Error refreshing MCA query status:", error);
    }
  };

  const handleSaveMcaQueryText = async () => {
    if (!requireEdit()) return;
    try {
      setIsSavingMcaQuery(true);
      await clientsApi.updateMcaQueryText(appNo, mcaQueryText);
      toast.success("MCA query saved");
      await refreshMcaQueryStatus();
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to save MCA query.",
        actionLabel: "save MCA query",
      });
    } finally {
      setIsSavingMcaQuery(false);
    }
  };

  const handleMcaQueryFileSelected = async (file: File) => {
    if (!requireEdit()) return;
    try {
      setIsUploadingMcaFile(true);
      await clientsApi.uploadMcaQueryFile(appNo, file);
      toast.success("MCA query file uploaded");
      await refreshMcaQueryStatus();
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to upload MCA query file.",
        actionLabel: "upload MCA query file",
      });
    } finally {
      setIsUploadingMcaFile(false);
    }
  };

  const handleDeleteMcaQueryFile = async (filePath: string) => {
    if (!requireEdit()) return;
    try {
      await clientsApi.deleteMcaQueryFile(appNo, filePath);
      toast.success("File removed");
      await refreshMcaQueryStatus();
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to remove file.",
        actionLabel: "remove MCA query file",
      });
    }
  };

  const handleDownloadMcaClarificationFile = async (
    source: "mca" | "client",
    filePath: string,
    fileName: string,
  ) => {
    try {
      const blob = await clientsApi.downloadMcaClarificationFile(
        appNo,
        source,
        filePath,
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast("Failed to download file", { variant: "danger" });
    }
  };

  const handleClarificationFilePreview = async (
    source: "mca" | "client",
    filePath: string,
    fileName: string,
  ) => {
    try {
      const blob = await clientsApi.downloadMcaClarificationFile(
        appNo,
        source,
        filePath,
      );
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewFileName(fileName);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error previewing clarification file:", error);
      toast("Failed to preview file", { variant: "danger" });
    }
  };

  const refreshObjectClauseStatus = async () => {
    try {
      setIsRefreshing(true);
      const statusData = await clientsApi.getObjectClauseStatus(appNo);
      setAdminFile(statusData.adminFile);
      setClientFile(statusData.clientFile);
      toast.success("Status refreshed");
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast("Failed to refresh status", { variant: "danger" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (index: number, status: NameStatus) => {
    setStatusMap((prev) => ({ ...prev, [index]: status }));
    if (!requireEdit()) return;
    try {
      await clientsApi.updateCompanyStatus(appNo, index, status);
    } catch (error) {
      console.error("Failed to update status", error);
      notifyApiError(error, {
        fallback: "Failed to update status.",
        actionLabel: "update name application status",
      });
    }
  };

  const handleMcaApprovalChange = async (index: number, value: string) => {
    setMcaApprovalMap((prev) => ({ ...prev, [index]: value }));
    if (!requireEdit()) return;
    try {
      await clientsApi.updateCompanyMcaApproval(appNo, index, value);
      toast.success("MCA approval status updated");
    } catch (error) {
      console.error("Failed to update MCA approval", error);
      toast("Failed to update MCA approval", { variant: "danger" });
    }
  };

  const handleTradeConflictChange = async (index: number, value: string) => {
    setTradeConflictMap((prev) => ({ ...prev, [index]: value }));
    if (!requireEdit()) return;
    try {
      await clientsApi.updateCompanyTradeConflict(appNo, index, value);
      toast.success("Trademark status updated");
    } catch (error) {
      console.error("Failed to update Trademark status", error);
      toast("Failed to update Trademark status", { variant: "danger" });
    }
  };

  const handleResubmitOriginalToggle = async (checked: boolean) => {
    if (!requireEdit()) return;

    setResubmitOriginal(checked);
    try {
      await clientsApi.toggleResubmitOriginal(appNo, checked);
      toast.success("Resubmission switch updated");
    } catch (error) {
      console.error("Error toggling resubmit original", error);
      toast("Failed to update switch", { variant: "danger" });
      setResubmitOriginal(!checked); // revert
    }
  };

  const handleObjectClauseFileSelected = async (file: File) => {
    if (!file) return;
    if (!requireEdit()) return;
    try {
      await clientsApi.uploadObjectClauseDocument(appNo, file);
      toast.success("Object Clause uploaded. Client can now download it.");

      const statusData = await clientsApi.getObjectClauseStatus(appNo);
      setAdminFile(statusData.adminFile);
      setClientFile(statusData.clientFile);
    } catch (error) {
      console.error("Error uploading Object Clause:", error);
      notifyApiError(error, {
        fallback: "Failed to upload Object Clause.",
        actionLabel: "upload the Object Clause document",
      });
    }
  };

  const handleObjectClauseDownload = async (source?: "admin" | "client") => {
    try {
      const blob = await clientsApi.downloadObjectClauseDocument(appNo, source);
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
      toast("Failed to download Object Clause", { variant: "danger" });
    }
  };

  const handleObjectClausePreview = async (source: "admin" | "client") => {
    try {
      const blob = await clientsApi.downloadObjectClauseDocument(appNo, source);
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
      toast("Failed to preview Object Clause", { variant: "danger" });
    }
  };

  /* ---------------- API ---------------- */

  const [isRocReviewed, setIsRocReviewed] = useState(false);
  const [isTrademarkDone, setIsTrademarkDone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await clientsApi.getNameApplication(appNo);

        if (response?.data) {
          const data = response.data;

          const names: any[] = [];
          if (data.companyName1) names.push(data.companyName1);
          if (data.companyName2) names.push(data.companyName2);
          if (data.companyName3) names.push(data.companyName3);

          setCompanyNames(names);
          setBusinessBrief(data?.businessBrief || "");
          setResubmitOriginal(data?.resubmitOriginal || false);
          setCompanyNameStatus(data?.companyNameStatus || "new");
          setMcaQueryText(data?.mcaQuery?.text || "");
          setMcaQueryFiles(data?.mcaQuery?.files || []);
          setClientClarification(data?.clarification || "");
          setClientClarificationFiles(data?.clarificationFiles || []);
          setAttempts(data.attempts || []);

          const initialStatus: Record<
            number,
            "Approved" | "Resubmission" | "Rejected" | "Pending"
          > = {};
          const initialMcaApproval: Record<number, string> = {};
          const initialTradeConflict: Record<number, string> = {};
          names.forEach((company, index) => {
            initialStatus[index] = resolveStatus(company);
            initialMcaApproval[index] = company?.mcaApproval || "Pending";
            initialTradeConflict[index] = company?.tradeConflict || "Pending";
          });
          setStatusMap(initialStatus);
          setMcaApprovalMap(initialMcaApproval);
          setTradeConflictMap(initialTradeConflict);
        }

        try {
          const trackerRes = await clientsApi.getTrackingStatus(appNo);
          if (trackerRes) {
            const stage1Attempts = trackerRes.stages?.filter(
              (s: any) =>
                s.stageId === "stage_1_name_application" ||
                s.stageId.startsWith("stage_1_name_application_attempt_"),
            );
            const activeStage1 = stage1Attempts?.[stage1Attempts.length - 1];
            if (activeStage1) {
              const sectionA = activeStage1.sections?.find(
                (sec: any) =>
                  sec.label === "Name Search & Submission" || sec.order === 1,
              );
              if (sectionA && sectionA.steps) {
                const findLastStep = (steps: any[], title: string) => {
                  for (let i = steps.length - 1; i >= 0; i--) {
                    if (steps[i].title === title) {
                      return steps[i];
                    }
                  }
                  return null;
                };
                const stepTrade = findLastStep(
                  sectionA.steps,
                  "Trademark Check",
                );
                setIsTrademarkDone(stepTrade?.status === "Done");
              }

              const sectionB = activeStage1.sections?.find(
                (sec: any) =>
                  sec.label === "Object Clause & RUN Filing" || sec.order === 2,
              );
              const partAStep = sectionB?.steps?.find((st: any) =>
                isRunFilingStepTitle(st.title),
              );
              setIsRocReviewed(partAStep?.status === "Done");
            }
          }
        } catch (trackerErr) {
          console.error("Error fetching tracker status:", trackerErr);
        }

        // Fetch object clause status (both admin and client files)
        const statusData = await clientsApi.getObjectClauseStatus(appNo);
        setAdminFile(statusData.adminFile);
        setClientFile(statusData.clientFile);

        await refreshMcaQueryStatus();
      } catch (error) {
        console.error("Error fetching name application:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appNo]);

  // Auto-refresh object clause status every 30 seconds to detect client uploads
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statusData = await clientsApi.getObjectClauseStatus(appNo);
        setAdminFile(statusData.adminFile);
        setClientFile(statusData.clientFile);
        await refreshMcaQueryStatus();
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

  const renderNameCards = (companiesList: any[], isReadOnly: boolean) => {
    return (
      <div className="space-y-6">
        {companiesList.map((company, index) => {
          const companyStatus = isReadOnly
            ? resolveStatus(company)
            : statusMap[index] || "Pending";
          const companyMca = isReadOnly
            ? company.mcaApproval || "Pending"
            : mcaApprovalMap[index] || "Pending";
          const companyTrade = isReadOnly
            ? company.tradeConflict || "Pending"
            : tradeConflictMap[index] || "Pending";
          const companyComment = company.comment || "";

          const hasAnyApproved =
            !isReadOnly &&
            Object.values(statusMap).some((s) => s === "Approved");
          const isDisabled =
            isReadOnly ||
            (hasAnyApproved && statusMap[index] !== "Approved") ||
            (companyMca === "Not Available" && companyTrade === "Conflict");
          const isNameStatusDisabled =
            isDisabled || (!isReadOnly && !isRocReviewed);

          return (
            <div
              key={company._id || index}
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-5 transition-all ${
                isDisabled ? "border-gray-100 opacity-80" : "border-gray-100"
              }`}
            >
              {/* HEADER WITH TITLE & PRIORITY */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3
                  className={`text-base font-bold sm:text-lg ${isDisabled ? "text-gray-400" : "text-[#a84420]"}`}
                >
                  {company.fullName || company.name}
                </h3>
              </div>

              {/* 3-COLUMN DROPDOWNS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* NAME STATUS */}
                <div className="flex flex-col gap-2 relative">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                    NAME STATUS
                  </span>
                  <div
                    onClick={() => {
                      if (isNameStatusDisabled) return;
                      setOpenDropdown(
                        openDropdown?.index === index &&
                          openDropdown?.field === "status"
                          ? null
                          : { index, field: "status" },
                      );
                    }}
                    className={`flex items-center justify-between border rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      isNameStatusDisabled
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-secondary border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <span>{companyStatus}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>

                  {!isReadOnly &&
                    openDropdown?.index === index &&
                    openDropdown?.field === "status" && (
                      <div className="absolute left-0 right-0 z-20 mt-[68px] w-full rounded-lg bg-white shadow-lg border border-gray-100 py-1">
                        {STATUS_OPTIONS.map((option) => {
                          const isOptionDisabled =
                            option === "Rejected" && !isRocReviewed;
                          return (
                            <div
                              key={option}
                              onClick={() => {
                                if (isOptionDisabled) return;
                                handleStatusChange(index, option);
                                setOpenDropdown(null);
                              }}
                              className={`px-4 py-2 text-sm transition-colors ${
                                isOptionDisabled
                                  ? "text-gray-300 cursor-not-allowed bg-gray-50"
                                  : statusMap[index] === option
                                    ? "text-primary font-semibold bg-orange-50/50 cursor-pointer"
                                    : "text-secondary hover:bg-gray-50 cursor-pointer"
                              }`}
                            >
                              {option}
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>

                {/* MCA APPROVAL */}
                <div className="flex flex-col gap-2 relative">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                    MCA APPROVAL
                  </span>
                  <div
                    onClick={() => {
                      if (isDisabled || isTrademarkDone) return;
                      setOpenDropdown(
                        openDropdown?.index === index &&
                          openDropdown?.field === "mca"
                          ? null
                          : { index, field: "mca" },
                      );
                    }}
                    className={`flex items-center justify-between border rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      isDisabled || isTrademarkDone
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-secondary border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <span>{companyMca}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>

                  {!isReadOnly &&
                    openDropdown?.index === index &&
                    openDropdown?.field === "mca" && (
                      <div className="absolute left-0 right-0 z-20 mt-[68px] w-full rounded-lg bg-white shadow-lg border border-gray-100 py-1">
                        {["Available", "Not Available", "Pending"].map(
                          (option) => (
                            <div
                              key={option}
                              onClick={() => {
                                handleMcaApprovalChange(index, option);
                                setOpenDropdown(null);
                              }}
                              className={`px-4 py-2 text-sm transition-colors ${
                                mcaApprovalMap[index] === option
                                  ? "text-primary font-semibold bg-orange-50/50 cursor-pointer"
                                  : "text-secondary hover:bg-gray-50 cursor-pointer"
                              }`}
                            >
                              {option}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>

                {/* TRADEMARK CHECK */}
                <div className="flex flex-col gap-2 relative">
                  <span className="text-[11px] font-bold text-gray-500 tracking-wider">
                    TRADEMARK CHECK
                  </span>
                  <div
                    onClick={() => {
                      if (isDisabled || isTrademarkDone) return;
                      setOpenDropdown(
                        openDropdown?.index === index &&
                          openDropdown?.field === "trade"
                          ? null
                          : { index, field: "trade" },
                      );
                    }}
                    className={`flex items-center justify-between border rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      isDisabled || isTrademarkDone
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : companyTrade === "Conflict"
                          ? "bg-[#fff8f8] text-[#b83232] border-[#f5c2c2] hover:border-[#e0a6a6] cursor-pointer"
                          : "bg-white text-secondary border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <span>{companyTrade}</span>
                    <ChevronDown
                      size={16}
                      className={
                        companyTrade === "Conflict"
                          ? "text-[#b83232]"
                          : "text-gray-400"
                      }
                    />
                  </div>

                  {!isReadOnly &&
                    openDropdown?.index === index &&
                    openDropdown?.field === "trade" && (
                      <div className="absolute left-0 right-0 z-20 mt-[68px] w-full rounded-lg bg-white shadow-lg border border-gray-100 py-1">
                        {["Conflict", "No Conflict", "Pending"].map(
                          (option) => (
                            <div
                              key={option}
                              onClick={() => {
                                handleTradeConflictChange(index, option);
                                setOpenDropdown(null);
                              }}
                              className={`px-4 py-2 text-sm transition-colors ${
                                tradeConflictMap[index] === option
                                  ? "text-primary font-semibold bg-orange-50/50 cursor-pointer"
                                  : "text-secondary hover:bg-gray-50 cursor-pointer"
                              }`}
                            >
                              {option}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* COMMENTS */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`company-comment-${isReadOnly ? "read" : "edit"}-${index}`}
                  className="text-[11px] font-bold text-gray-500 tracking-wider"
                >
                  Comments
                </label>
                <textarea
                  id={`company-comment-${isReadOnly ? "read" : "edit"}-${index}`}
                  aria-label={`Comments for ${company.fullName || company.name || `company ${index + 1}`}`}
                  className={`w-full min-h-[90px] rounded-lg text-sm placeholder:text-gray-400 outline-none border p-3.5 transition-all resize-y ${
                    isDisabled
                      ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-900 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                  placeholder={
                    isDisabled
                      ? isReadOnly
                        ? "No comments."
                        : "Rejected - disabled"
                      : "Detailed comments"
                  }
                  defaultValue={companyComment}
                  disabled={isDisabled}
                  onBlur={async (e) => {
                    if (isDisabled) return;
                    const newComment = e.target.value;
                    if (newComment === companyComment) return;
                    try {
                      await clientsApi.updateCompanyComment(
                        appNo,
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
          );
        })}
      </div>
    );
  };

  /* ---------------- UI ---------------- */

  const hasMcaQuery = Boolean(mcaQueryText.trim()) || mcaQueryFiles.length > 0;
  const hasClientClarification =
    Boolean(clientClarification.trim()) || clientClarificationFiles.length > 0;
  const showMcaQuerySection =
    companyNameStatus === "change-request" ||
    hasMcaQuery ||
    hasClientClarification;
  const isMcaQueryEditable = companyNameStatus === "change-request";

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 min-h-[110vh]">
      <div className="mb-8 flex items-center justify-between">
        <div className="text-[16px] font-bold text-secondary">
          Name resubmission ( Takes 7–15 days for approval )
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={resubmitOriginal}
            onChange={handleResubmitOriginalToggle}
            label="Submit another new names"
            disabled={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Historical Attempts Accordions */}
            {attempts.map((attempt) => {
              const isOpen = expandedAttempts[attempt._id];
              const attemptNames = [
                attempt.companyName1,
                attempt.companyName2,
                attempt.companyName3,
              ].filter(Boolean);

              return (
                <div
                  key={attempt._id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs"
                >
                  <div
                    onClick={() =>
                      setExpandedAttempts((prev) => ({
                        ...prev,
                        [attempt._id]: !prev[attempt._id],
                      }))
                    }
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                        {attempt.attemptNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Attempt {attempt.attemptNumber} (
                          {attempt.companyNameStatus?.toUpperCase()})
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Submitted on{" "}
                          {new Date(attempt.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="p-6 space-y-6 bg-slate-50/10">
                      {renderNameCards(attemptNames, true)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active/Current Attempt Accordion */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() =>
                  setExpandedAttempts((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="flex items-center justify-between p-4 bg-orange-50/30 hover:bg-orange-50/50 cursor-pointer select-none border-b border-orange-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {attempts.length + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-orange-950">
                      Current Attempt (Attempt {attempts.length + 1}) - Active
                    </h4>
                    <p className="text-xs text-orange-700/60 font-mono mt-0.5">
                      Currently editable tracking status
                    </p>
                  </div>
                </div>
                <div>
                  {expandedAttempts.current ? (
                    <ChevronUp className="w-5 h-5 text-orange-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </div>
              {expandedAttempts.current && (
                <div className="p-6 space-y-6">
                  {renderNameCards(companies, false)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-1">
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
                <FileUploadComponent
                  context="clients"
                  allowedFileTypes=".pdf,.doc,.docx"
                  title="Upload Object Clause"
                  subtitle="Upload from your computer, Google Drive, or existing documents."
                  dropLabel="Drag and drop your file here"
                  disabled={!isTrademarkDone}
                  onBeforeOpen={() => requireEdit()}
                  onFileSelect={handleObjectClauseFileSelected}
                  renderTrigger={(openPicker) => (
                    <div
                      title={
                        isTrademarkDone
                          ? "Upload Object Clause (Admin)"
                          : "Available after Trademark Check is marked Done"
                      }
                    >
                      <Upload
                        size={20}
                        onClick={isTrademarkDone ? openPicker : undefined}
                        className={
                          isTrademarkDone
                            ? "cursor-pointer text-primary hover:text-secondary"
                            : "cursor-not-allowed text-gray-300 opacity-50"
                        }
                      />
                    </div>
                  )}
                />
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

          {showMcaQuerySection && (
            <div className="w-full mt-4 bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-secondary">
                  MCA Query (to Client)
                </h2>
                <RefreshCw
                  size={16}
                  onClick={refreshMcaQueryStatus}
                  className="cursor-pointer text-secondary hover:text-primary"
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {isMcaQueryEditable
                  ? "Enter the MCA name-application query. The client will see this on their resubmission form."
                  : "Original MCA query sent to the client. This remains visible after the client submits their clarification."}
              </p>
              {isMcaQueryEditable ? (
                <>
                  <textarea
                    className="rounded-lg w-full bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 p-3 min-h-[100px] scheme-light"
                    value={mcaQueryText}
                    onChange={(e) => setMcaQueryText(e.target.value)}
                    placeholder="Enter MCA query text..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSaveMcaQueryText}
                      disabled={isSavingMcaQuery}
                      className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50"
                    >
                      {isSavingMcaQuery ? "Saving..." : "Save Query"}
                    </button>
                  </div>
                </>
              ) : mcaQueryText.trim() ? (
                <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3 text-sm text-gray-800 whitespace-pre-wrap mb-3">
                  {mcaQueryText}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-3">
                  No query text provided
                </p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Query attachments
                  </span>
                  {isMcaQueryEditable && (
                    <FileUploadComponent
                      context="clients"
                      allowedFileTypes=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      title="Upload MCA Query File"
                      subtitle="Attach files received from MCA."
                      dropLabel="Drag and drop file here"
                      disabled={isUploadingMcaFile}
                      onBeforeOpen={() => requireEdit()}
                      onFileSelect={handleMcaQueryFileSelected}
                      renderTrigger={(openPicker) => (
                        <Upload
                          size={18}
                          onClick={isUploadingMcaFile ? undefined : openPicker}
                          className={
                            isUploadingMcaFile
                              ? "cursor-not-allowed text-gray-300"
                              : "cursor-pointer text-primary hover:text-secondary"
                          }
                        />
                      )}
                    />
                  )}
                </div>
                {mcaQueryFiles.length > 0 ? (
                  mcaQueryFiles.map((file) => (
                    <div
                      key={file.path}
                      className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-secondary truncate">
                        {getFileName(file.name)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div title="Preview">
                          <Eye
                            size={16}
                            className="cursor-pointer text-orange-600 hover:text-orange-700"
                            onClick={() =>
                              handleClarificationFilePreview(
                                "mca",
                                file.path,
                                file.name,
                              )
                            }
                          />
                        </div>
                        <Download
                          size={16}
                          className="cursor-pointer text-orange-600 hover:text-orange-700"
                          onClick={() =>
                            handleDownloadMcaClarificationFile(
                              "mca",
                              file.path,
                              file.name,
                            )
                          }
                        />
                        {isMcaQueryEditable && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMcaQueryFile(file.path)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400 border border-dashed rounded-lg p-3">
                    No query files uploaded
                  </div>
                )}
              </div>
            </div>
          )}

          {(clientClarification || clientClarificationFiles.length > 0) && (
            <div className="w-full mt-4 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <h2 className="text-lg font-semibold text-secondary mb-3">
                Client Clarification Response
              </h2>
              {clientClarification ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-sm text-gray-800 whitespace-pre-wrap mb-3">
                  {clientClarification}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-3">No text provided</p>
              )}
              {clientClarificationFiles.length > 0 && (
                <div className="space-y-2">
                  {clientClarificationFiles.map((file) => (
                    <div
                      key={file.path}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-secondary truncate">
                        {getFileName(file.name)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div title="Preview">
                          <Eye
                            size={16}
                            onClick={() =>
                              handleClarificationFilePreview(
                                "client",
                                file.path,
                                file.name,
                              )
                            }
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                          />
                        </div>
                        <div title="Download">
                          <Download
                            size={16}
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                            onClick={() =>
                              handleDownloadMcaClarificationFile(
                                "client",
                                file.path,
                                file.name,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="w-full mt-4 bg-white p-4 rounded-xl shadow-sm">
            <label
              htmlFor="business-brief"
              className="mb-4 block text-lg font-semibold text-secondary"
            >
              About Their business
            </label>

            <textarea
              id="business-brief"
              aria-label="About their business"
              className="rounded-lg w-full bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none border border-gray-200 p-2 scheme-light"
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
