"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import {
  Loader2,
  Settings,
  AlertCircle,
  HelpCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Send,
  RotateCcw,
  ExternalLink,
  Clock,
} from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import CustomSelect from "@/components/ui/CustomSelect";

interface AdminAddonTrackerViewProps {
  appNo: string;
  orgId: string;
  isPaid?: boolean;
}

const statusOptions = [
  { id: "Pending", label: "Pending" },
  { id: "In Progress", label: "In Progress" },
  { id: "Action Needed", label: "Action Needed" },
  { id: "Done", label: "Done" },
];

export default function GSTAddonTrackerView({ appNo, orgId, isPaid = true }: AdminAddonTrackerViewProps) {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState("s1");
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  // Addon Query State (ROC Query Style)
  const [queryFormText, setQueryFormText] = useState("");
  const [queryNeedsDoc, setQueryNeedsDoc] = useState(true);
  const [queryNeedsText, setQueryNeedsText] = useState(true);
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [showRaiseQueryForm, setShowRaiseQueryForm] = useState(false);

  // Admin Response Action States
  const [adminSendBackNote, setAdminSendBackNote] = useState("");
  const [isSendingBack, setIsSendingBack] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(data);
      if (data && data.stages) {
        const activeStage = data.stages.find((s: any) => s.status === "In Progress");
        if (activeStage) {
          setActiveStageId(activeStage.stageId);
        }
      }
    } catch {
      setTracker(null);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    loadTracker();
  }, [loadTracker]);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await clientsApi.initializeAddonTracker(orgId, "gst-registration");
      toast.success("GST Registration Tracker initialized!");
      loadTracker();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to initialize tracker." });
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    stageId: string,
    sectionId: string,
    stepId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingStep(stepId);
      await clientsApi.updateAddonStepStatus(
        orgId,
        "gst-registration",
        stageId,
        sectionId,
        stepId,
        newStatus
      );
      toast.success("Step status updated successfully!");
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update step status." });
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleRaiseQuery = async (stepId: string) => {
    if (!queryFormText.trim()) {
      toast.danger("Please enter query text from the Ministry");
      return;
    }
    try {
      setIsSubmittingQuery(true);
      await clientsApi.raiseAddonQuery(orgId, {
        addonId: "gst-registration",
        stepId,
        queryText: queryFormText.trim(),
        needsDocument: queryNeedsDoc,
        needsTextResponse: queryNeedsText,
      });
      toast.success("Ministry query raised successfully!");
      setQueryFormText("");
      setShowRaiseQueryForm(false);
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to raise Ministry query." });
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const handleApproveResubmit = async () => {
    try {
      setIsApproving(true);
      await clientsApi.approveAddonQueryResubmit(orgId, "gst-registration");
      toast.success("Client response approved & resubmitted to Ministry!");
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to approve response." });
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendBack = async () => {
    if (!adminSendBackNote.trim()) {
      toast.danger("Please enter a note explaining why the response is insufficient");
      return;
    }
    try {
      setIsSendingBack(true);
      await clientsApi.sendBackAddonQuery(orgId, adminSendBackNote.trim(), "gst-registration");
      toast.success("Query sent back to client as insufficient!");
      setAdminSendBackNote("");
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to send back query." });
    } finally {
      setIsSendingBack(false);
    }
  };

  const handleResolveQuery = async () => {
    try {
      setIsResolving(true);
      await clientsApi.resolveAddonQuery(orgId, "gst-registration");
      toast.success("Ministry query marked as resolved!");
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to resolve query." });
    } finally {
      setIsResolving(false);
    }
  };

  const handleResetQuery = async () => {
    try {
      setIsResetting(true);
      setShowRaiseQueryForm(false);
      await clientsApi.resetAddonQueryToPending(orgId, "gst-registration");
      toast.success("Ministry query reset to Pending.");
      const updated = await clientsApi.getAddonTrackingStatus(appNo, "gst-registration");
      setTracker(updated);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to reset query." });
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-6">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-gray-800 mb-2">
          Add-on Tracker Pending Setup
        </h4>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          The tracking workspace for this GST registration addon service hasn't been initialized yet.
        </p>
        <button
          type="button"
          onClick={handleInitialize}
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow"
        >
          Initialize GST Tracker
        </button>
      </div>
    );
  }

  const activeStage = tracker.stages.find((s: any) => s.stageId === activeStageId) || tracker.stages[0];

  const getOwnerTag = (owner: string) => {
    if (owner === "client") return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Client</span>;
    if (owner === "admin") return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>;
    return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Govt / Auto</span>;
  };

  return (
    <div className="space-y-6 min-w-0 font-sans">
      {/* Payment Pending Banner */}
      {!isPaid && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Payment Pending from Client</h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                The client has not completed payment for the GST Registration add-on service yet.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md uppercase tracking-wider shrink-0 border border-amber-200">
            Payment Pending
          </span>
        </div>
      )}

      {/* Stage Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {tracker.stages.map((stage: any, idx: number) => {
          const isActive = stage.stageId === activeStageId;
          const isComplete = stage.status === "Completed";
          return (
            <button
              key={stage.stageId}
              type="button"
              onClick={() => setActiveStageId(stage.stageId)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all focus:outline-none ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isComplete
                  ? "bg-green-600 text-white"
                  : isActive
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
              }`}>
                {isComplete ? "✓" : idx + 1}
              </span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Details Tasks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800">{activeStage.label} Tasks</h3>
          <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">
            Est: {activeStage.sections[0]?.estimation || "~1 day"}
          </span>
        </div>

        {activeStage.sections.map((section: any, secIdx: number) => (
          <div key={secIdx} className="space-y-4">
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{section.label}</div>
            
            <div className="space-y-4">
              {section.steps.filter((s: any) => !s.isHidden).map((step: any) => {
                const isMinistryQueryStep = step.title === "Respond to Ministry queries (if any)";
                const queryMeta = step.addonQueryMetadata;

                return (
                  <div
                    key={step._id}
                    className="border border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/30 hover:border-gray-300 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${step.status === "Done" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                            {step.title}
                          </span>
                          {getOwnerTag(step.ownerType)}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                      </div>

                      {/* Status Dropdown */}
                      <div className="shrink-0 flex items-center gap-2">
                        {updatingStep === step._id && <Loader2 className="animate-spin h-3.5 w-3.5 text-primary shrink-0" />}
                        {isMinistryQueryStep ? (
                          <CustomSelect
                            value={
                              showRaiseQueryForm
                                ? "query"
                                : queryMeta?.status || "pending"
                            }
                            isDisabled={updatingStep === step._id}
                            ariaLabel="Ministry Query Status"
                            className="min-w-44 text-xs"
                            onChange={async (val) => {
                              if (val === "query") {
                                setShowRaiseQueryForm(true);
                              } else if (val === "pending") {
                                setShowRaiseQueryForm(false);
                                await handleResetQuery();
                              } else if (val === "resubmitted") {
                                setShowRaiseQueryForm(false);
                                await handleApproveResubmit();
                              } else if (val === "resolved") {
                                setShowRaiseQueryForm(false);
                                await handleResolveQuery();
                              }
                            }}
                            options={[
                              { id: "pending", label: "Pending" },
                              { id: "query", label: "Resubmission Required" },
                              { id: "client_submitted", label: "Submitted - Under Review" },
                              { id: "resubmitted", label: "Resubmitted to Ministry" },
                              { id: "resolved", label: "Resolved" },
                            ]}
                            renderValue={(val) => {
                              const labelMap: Record<string, { label: string; color: string }> = {
                                pending: { label: "Pending", color: "text-gray-500 font-bold" },
                                query: { label: "Resubmission Required", color: "text-amber-600 font-bold" },
                                client_submitted: { label: "Submitted - Under Review", color: "text-blue-600 font-bold" },
                                resubmitted: { label: "Resubmitted to Ministry", color: "text-emerald-600 font-bold" },
                                resolved: { label: "Resolved", color: "text-green-700 font-bold" },
                              };
                              const item = labelMap[val] || { label: val, color: "text-gray-700 font-bold" };
                              return <span className={`text-xs ${item.color}`}>{item.label}</span>;
                            }}
                          />
                        ) : (
                          <CustomSelect
                            value={step.status}
                            options={statusOptions.filter((opt) => {
                              if (step.ownerType === "client") {
                                return (
                                  opt.id === "Pending" ||
                                  opt.id === "Done" ||
                                  opt.id === "Action Needed" || 
                                  opt.id === "In Progress"
                                );
                              }
                              if (opt.id === "Action Needed") return false;
                              return true;
                            })}
                            ariaLabel="Update step status"
                            isDisabled={updatingStep === step._id}
                            className="min-w-32 text-xs"
                            onChange={(val) =>
                              handleStatusChange(
                                activeStage.stageId,
                                section._id || String(section.order),
                                step._id,
                                val
                              )
                            }
                            renderValue={(val) => {
                              const colorClass =
                                val === "Done"
                                  ? "text-green-600 font-bold"
                                  : val === "Action Needed"
                                  ? "text-red-600 font-bold"
                                  : val === "In Progress"
                                  ? "text-blue-600 font-bold"
                                  : "text-gray-500 font-bold";
                              return <span className={`text-xs ${colorClass}`}>{val}</span>;
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* ───────────────────────────────────────────────────────────── */}
                    {/* INLINE PANELS FOR MINISTRY QUERY             */}
                    {/* ───────────────────────────────────────────────────────────── */}
                    {isMinistryQueryStep && (
                      <div className="pt-2">
                        {/* PANEL 1: Raise a query from Ministry (when pending / showRaiseQueryForm active) */}
                        {(showRaiseQueryForm || (!queryMeta || queryMeta.status === "Action Needed")) && (
                          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-4 max-w-xl text-left">
                            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              Raise a query from Ministry (Form GST REG-03)
                            </h4>
                            
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                What is the Ministry asking for? (shown to client) <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={queryFormText}
                                onChange={(e) => setQueryFormText(e.target.value)}
                                rows={3}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                                placeholder="e.g. Ministry has raised a clarification notice regarding address proof for principal place of business..."
                              />
                            </div>

                            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={queryNeedsDoc}
                                  onChange={(e) => setQueryNeedsDoc(e.target.checked)}
                                  className="rounded text-amber-500 focus:ring-amber-400"
                                />
                                Requires document upload
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={queryNeedsText}
                                  onChange={(e) => setQueryNeedsText(e.target.checked)}
                                  className="rounded text-amber-500 focus:ring-amber-400"
                                />
                                Requires written clarification
                              </label>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={isSubmittingQuery || !queryFormText.trim()}
                                onClick={() => handleRaiseQuery(step._id)}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                {isSubmittingQuery && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Send query to client
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PANEL 2: Query sent to client - waiting for response */}
                        {queryMeta?.status === "query" && (
                          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3 max-w-xl text-left">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                Query sent to client - waiting for response
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono uppercase">
                                Round {queryMeta.roundNumber}
                              </span>
                            </div>

                            <div className="p-3 bg-white border border-amber-100 rounded-lg space-y-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Query Description
                              </div>
                              <p className="text-xs text-slate-800 leading-normal">
                                {queryMeta.queryText}
                              </p>
                            </div>

                            {queryMeta.rejectNote && (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                                  Send Back Note
                                </div>
                                <p className="text-xs text-rose-700 leading-normal">
                                  {queryMeta.rejectNote}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isResetting}
                                onClick={handleResetQuery}
                                className="px-3 py-1 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1"
                              >
                                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                Reset Query
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PANEL 3: Client response received - review before resubmitting to Ministry */}
                        {queryMeta?.status === "client_submitted" && (
                          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4 max-w-xl text-left">
                            <h4 className="text-sm font-bold text-blue-900">
                              Client response received - review before resubmitting to Ministry
                            </h4>

                            <div className="p-3 bg-white border border-blue-100 rounded-lg space-y-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Original Ministry Query
                              </div>
                              <p className="text-xs text-slate-800 leading-normal">
                                {queryMeta.queryText}
                              </p>
                            </div>

                            <div className="p-3 bg-white border border-blue-100 rounded-lg space-y-2">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Client Submitted Content
                              </div>

                              <div className="space-y-1 text-xs font-semibold text-slate-700">
                                {queryMeta.needsDocument && (
                                  <div className="flex items-center gap-1.5">
                                    {queryMeta.clientDocumentUrl ? (
                                      <>
                                        <span className="text-green-600 font-bold">✓</span>
                                        <span>Document attached:</span>
                                        <span
                                          onClick={async () => {
                                            try {
                                              const blob = await clientsApi.downloadAddonQueryDocument(orgId, "gst-registration");
                                              const blobUrl = window.URL.createObjectURL(blob);
                                              window.open(blobUrl, "_blank");
                                            } catch {
                                              toast.danger("Failed to download document");
                                            }
                                          }}
                                          className="text-blue-600 underline font-medium hover:text-blue-700 cursor-pointer flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          {queryMeta.clientDocumentName || "Download document"}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-red-500 font-bold">✗</span>
                                        <span className="text-red-600">No document attached</span>
                                      </>
                                    )}
                                  </div>
                                )}

                                {queryMeta.needsTextResponse && (
                                  <div className="space-y-1 pt-1">
                                    <div className="flex items-center gap-1.5">
                                      {queryMeta.clientTextResponse ? (
                                        <>
                                          <span className="text-green-600 font-bold">✓</span>
                                          <span>Clarification response:</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-red-500 font-bold">✗</span>
                                          <span className="text-red-600">No written response</span>
                                        </>
                                      )}
                                    </div>
                                    {queryMeta.clientTextResponse && (
                                      <p className="p-2 bg-slate-50 border border-slate-100 rounded text-xs text-slate-800 font-normal leading-normal">
                                        {queryMeta.clientTextResponse}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-600">
                                Note (required if sending back to client)
                              </label>
                              <textarea
                                value={adminSendBackNote}
                                onChange={(e) => setAdminSendBackNote(e.target.value)}
                                rows={2}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-400"
                                placeholder="State clearly why the response or document is insufficient..."
                              />
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <button
                                type="button"
                                disabled={isApproving}
                                onClick={handleApproveResubmit}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                              >
                                {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Client response reviewed - resubmit to Ministry
                              </button>

                              <button
                                type="button"
                                disabled={isSendingBack || !adminSendBackNote.trim()}
                                onClick={handleSendBack}
                                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                              >
                                {isSendingBack ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                Send back to client as insufficient
                              </button>

                              <button
                                type="button"
                                disabled={isResolving}
                                onClick={handleResolveQuery}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
                              >
                                {isResolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                Mark Resolved
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PANEL 4: Resubmitted / Resolved Panel */}
                        {(queryMeta?.status === "resubmitted" || queryMeta?.status === "resolved") && (
                          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 max-w-xl text-left">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {queryMeta.status === "resolved" ? "Ministry Query Resolved" : "Response Resubmitted to Ministry"}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase font-mono">
                                {queryMeta.status}
                              </span>
                            </div>

                            <p className="text-xs text-emerald-800 leading-relaxed">
                              {queryMeta.status === "resolved"
                                ? "The query raised by the Ministry has been marked as resolved."
                                : "The client's clarification has been verified and resubmitted to the Ministry of GST."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
