"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import {
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import CustomSelect from "@/components/ui/CustomSelect";

const ADDON_ID = "accounting-bookkeeping";

interface AccountingBookkeepingAdminTrackerViewProps {
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

const getOwnerTag = (owner?: string) => {
  if (owner === "client") return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Client</span>;
  if (owner === "admin") return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>;
  return null;
};

const getStatusColorClass = (val: string) =>
  val === "Done"
    ? "text-green-600 font-bold"
    : val === "Action Needed"
    ? "text-red-600 font-bold"
    : val === "In Progress"
    ? "text-blue-600 font-bold"
    : "text-gray-500 font-bold";

export default function AccountingBookkeepingAdminTrackerView({
  appNo,
  orgId,
  isPaid = true,
}: AccountingBookkeepingAdminTrackerViewProps) {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState("s1");
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAddonTrackingStatus(appNo, ADDON_ID);
      setTracker(data);
      if (data?.stages?.length > 0) {
        const targetStage = data.stages[data.currentStageIndex || 0] || data.stages[0];
        if (targetStage) {
          setActiveStageId(targetStage.stageId || targetStage.id || "s1");
        }
      }
    } catch (error) {
      console.error("Failed to load Accounting & Bookkeeping tracker:", error);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    if (appNo) loadTracker();
  }, [appNo, loadTracker]);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await clientsApi.initializeAddonTracker(orgId, ADDON_ID);
      toast.success("Accounting & Bookkeeping Tracker initialized!");
      loadTracker();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to initialize tracker." });
      setLoading(false);
    }
  };

  const handleStepStatusChange = async (
    stageId: string,
    sectionId: string,
    stepId: string,
    newStatus: string
  ) => {
    setUpdatingStep(stepId);
    try {
      await clientsApi.updateAddonStepStatus(orgId, ADDON_ID, stageId, sectionId, stepId, newStatus);
      toast.success("Step status updated successfully");
      await loadTracker();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update step status" });
    } finally {
      setUpdatingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!tracker || !tracker.stages || tracker.stages.length === 0) {
    return (
      <div className="space-y-4">
        {!isPaid && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Payment Pending</p>
              <p className="text-xs text-amber-700 mt-0.5">
                The tracker will be initialized once payment is confirmed.
              </p>
            </div>
          </div>
        )}
        <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-6">
          <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-800 mb-2">
            Add-on Tracker Pending Setup
          </h4>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            The tracking workspace for this Accounting &amp; Bookkeeping addon service hasn&apos;t been initialized yet.
          </p>
          <button
            type="button"
            onClick={handleInitialize}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow"
          >
            Initialize Accounting Tracker
          </button>
        </div>
      </div>
    );
  }

  const stages = tracker.stages || [];
  const activeStage = stages.find((s: any) => (s.stageId || s.id) === activeStageId) || stages[0];
  const activeStageIndex = stages.findIndex((s: any) => (s.stageId || s.id) === (activeStage?.stageId || activeStage?.id));
  const bankSyncInfo = tracker.bankSyncInfo || { connected: false, accounts: [] };
  const bankSyncConnected = !!bankSyncInfo.connected && (bankSyncInfo.accounts?.length || 0) > 0;
  const cycleLabel = tracker.billingCycle || "monthly";

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
                The client has not completed payment for the Accounting &amp; Bookkeeping add-on service yet.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md uppercase tracking-wider shrink-0 border border-amber-200">
            Payment Pending
          </span>
        </div>
      )}

      {/* Bank Sync Summary Card */}
      <div className="flex items-center gap-3.5 bg-white border border-[#E3E6EB] rounded-[13px] px-5 py-4 shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-[#fdf3d9] text-[#7a5711] flex items-center justify-center text-[17px] shrink-0">
          {bankSyncConnected ? "🔄" : "📤"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-800">
            {bankSyncConnected
              ? `Bank Sync — ${bankSyncInfo.accounts.length} account${bankSyncInfo.accounts.length > 1 ? "s" : ""} connected`
              : "Bank Sync — Not Connected"}
          </div>
          <div className="text-[11.5px] text-gray-400 mt-0.5">
            {bankSyncConnected
              ? `Statements pulled automatically every ${cycleLabel} cycle — no manual upload needed going forward.`
              : `We're using your manually uploaded statements. Connect your bank for automatic ${cycleLabel} syncing.`}
          </div>
        </div>
        <span
          className={`ml-auto text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
            bankSyncConnected ? "bg-[#eaf7f0] text-[#2fa66d]" : "bg-[#fdf1e7] text-[#e0602f]"
          }`}
        >
          {bankSyncConnected ? "Synced" : "Manual"}
        </span>
      </div>

      {/* Bank Sync Account Details (provided by client) */}
      {(bankSyncInfo.accounts || []).length > 0 && (
        <div className="bg-white border border-[#E3E6EB] rounded-[13px] px-5 py-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Connected Bank Account{(bankSyncInfo.accounts || []).length > 1 ? "s" : ""}
            </h4>
            {bankSyncInfo.permissionGranted && (
              <span className="text-[10.5px] font-bold text-[#2fa66d]">
                ✓ Permission granted by client
              </span>
            )}
          </div>
          {(bankSyncInfo.accounts || []).map((acc: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-slate-50/40 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-800 truncate">
                  {acc.name || "Bank Account"} {acc.last4 ? `•••• ${acc.last4}` : ""}
                </div>
                {acc.holder && (
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Account Holder: {acc.holder}
                  </div>
                )}
              </div>
              <span className="shrink-0 ml-3 text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-[#eaf7f0] text-[#2fa66d]">
                {acc.status || "Synced"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stage Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {stages.map((stage: any, idx: number) => {
          const sid = stage.stageId || stage.id || `stage-${idx}`;
          const isActive = sid === activeStageId;
          const isComplete = stage.status === "Completed" || idx < (tracker.currentStageIndex || 0);
          return (
            <button
              key={sid}
              type="button"
              onClick={() => setActiveStageId(sid)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all focus:outline-none cursor-pointer ${
                isActive
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isComplete
                    ? "bg-green-600 text-white"
                    : isActive
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isComplete ? "✓" : idx + 1}
              </span>
              <span>{stage.label || stage.title || `Stage ${idx + 1}`}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Tasks Card */}
      {activeStage && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800">
              {activeStage.label || activeStage.title || `Stage ${activeStageIndex + 1}`} Tasks
            </h3>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">
              {activeStage.sections?.[0]?.estimation && activeStage.sections[0].estimation !== "Pending"
                ? `Est: ${activeStage.sections[0].estimation}`
                : `Stage ${activeStageIndex + 1} of ${stages.length}`}
            </span>
          </div>

          {(activeStage.sections || []).map((section: any, secIdx: number) => (
            <div key={section._id || section.id || `sec-${secIdx}`} className="space-y-3">
              {section.label && (
                <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  {section.label}
                </div>
              )}

              <div className="space-y-3">
                {(section.steps || []).filter((s: any) => !s.isHidden).map((step: any, stepIdx: number) => {
                  const stepId = step._id || step.id || step.stepId || `step-${stepIdx}`;
                  const isUpdating = updatingStep === stepId;

                  return (
                    <div
                      key={stepId}
                      className="border border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/30 hover:border-gray-300 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold ${
                                step.status === "Done" ? "text-gray-400 line-through" : "text-gray-800"
                              }`}
                            >
                              {step.title}
                            </span>
                            {getOwnerTag(step.ownerType)}
                            {step.status === "Action Needed" && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Action Required
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {isUpdating && <Loader2 className="animate-spin h-3.5 w-3.5 text-primary shrink-0" />}
                          <CustomSelect
                            value={step.status || "Pending"}
                            options={statusOptions.filter((opt) => {
                              if (step.ownerType === "client") {
                                return (
                                  opt.id === "Pending" ||
                                  opt.id === "In Progress" ||
                                  opt.id === "Action Needed" ||
                                  opt.id === "Done"
                                );
                              }
                              if (opt.id === "Action Needed") return false;
                              return true;
                            })}
                            isDisabled={updatingStep === stepId}
                            ariaLabel="Update step status"
                            className="min-w-32 text-xs"
                            onChange={(val) =>
                              handleStepStatusChange(
                                activeStage.stageId || activeStage.id,
                                section._id || section.id || String(secIdx),
                                stepId,
                                val
                              )
                            }
                            renderValue={(val) => (
                              <span className={`text-xs ${getStatusColorClass(val)}`}>{val}</span>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
