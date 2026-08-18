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

const ADDON_ID = "taxation";

const SERVICES: { id: string; icon: string; name: string }[] = [
  { id: "gst", icon: "📄", name: "GST Filing" },
  { id: "itr", icon: "🧾", name: "Income Tax (ITR)" },
  { id: "tds", icon: "📊", name: "TDS Returns" },
  { id: "advance", icon: "⏱️", name: "Advance Tax" },
];

interface TaxationAdminTrackerViewProps {
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

const stageStatus = (stage: any) => {
  if (stage.status === "Completed") return "Completed";
  const steps = (stage.sections || []).flatMap((s: any) => s.steps || []).filter((s: any) => !s.isHidden);
  if (steps.length === 0) return "Pending";
  if (steps.every((s: any) => s.status === "Done" || s.status === "Completed")) return "Completed";
  if (steps.some((s: any) => s.status !== "Pending")) return "In Progress";
  return "Pending";
};

const stagePill = (status: string) => {
  if (status === "Completed") return <span className="bg-[#E1F5EE] text-[#0F6E56] text-[10.5px] font-bold px-2.5 py-1 rounded-full">Completed</span>;
  if (status === "In Progress") return <span className="bg-[#FAEEDA] text-[#854F0B] text-[10.5px] font-bold px-2.5 py-1 rounded-full">In Progress</span>;
  return <span className="bg-[#F0F2F7] text-[#9CA3AF] text-[10.5px] font-bold px-2.5 py-1 rounded-full">Pending</span>;
};

export default function TaxationAdminTrackerView({
  appNo,
  orgId,
  isPaid = true,
}: TaxationAdminTrackerViewProps) {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSvc, setActiveSvc] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<number | "active">("active");

  const loadTracker = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await clientsApi.getAddonTrackingStatus(appNo, ADDON_ID);
      setTracker(data);
      if (isInitial && data?.stages?.length > 0) {
        const svcIds = SERVICES.map((s) => s.id).filter((id) =>
          data.stages.some((st: any) => st.svcId === id)
        );
        const preferred = Array.isArray(data.selectedSvcs) ? data.selectedSvcs : [];
        const target = preferred.find((id: string) => svcIds.includes(id)) || svcIds[0] || null;
        setActiveSvc(target);
        if (target) {
          const stgs = data.stages.filter((st: any) => st.svcId === target);
          const firstIncomplete = stgs.findIndex((s: any) => stageStatus(s) !== "Completed");
          const defaultStage = stgs[firstIncomplete === -1 ? stgs.length - 1 : firstIncomplete] || stgs[0];
          if (defaultStage) setActiveStageId(defaultStage.stageId || defaultStage.id || null);
        }
      }
    } catch (error) {
      console.error("Failed to load Taxation tracker:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    if (appNo) loadTracker(true);
  }, [appNo, loadTracker]);

  useEffect(() => {
    if (!tracker?.stages?.length || !activeSvc) return;
    const stgs = tracker.stages.filter((st: any) => st.svcId === activeSvc);
    if (stgs.length === 0) return;
    setActiveStageId((prev) => {
      if (prev && stgs.some((s: any) => (s.stageId || s.id) === prev)) return prev;
      const firstIncomplete = stgs.findIndex((s: any) => stageStatus(s) !== "Completed");
      const target = stgs[firstIncomplete === -1 ? stgs.length - 1 : firstIncomplete] || stgs[0];
      return target?.stageId || target?.id || null;
    });
  }, [activeSvc, tracker]);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await clientsApi.initializeAddonTracker(orgId, ADDON_ID);
      toast.success("Taxation Tracker initialized!");
      loadTracker(true);
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
    // Optimistic UI update to prevent UI flickering / full page refresh
    setTracker((prev: any) => {
      if (!prev || !prev.stages) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      for (const stage of copy.stages) {
        if (stage.stageId === stageId || stage.id === stageId || !stageId) {
          for (const sec of stage.sections || []) {
            for (const stp of sec.steps || []) {
              const sid = stp.stepId || stp._id?.toString() || stp.id;
              if (sid === stepId || stp.title === stepId) {
                stp.status = newStatus;
              }
            }
          }
        }
      }
      return copy;
    });

    try {
      const res = await clientsApi.updateAddonStepStatus(orgId, ADDON_ID, stageId, sectionId, stepId, newStatus);
      if (res) setTracker(res);
      toast.success("Step status updated successfully");
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update step status" });
      await loadTracker(false);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleAdvanceCycle = async () => {
    if (!currentSvc) return;
    try {
      setLoading(true);
      await clientsApi.advanceAddonCycle(orgId, ADDON_ID, currentSvc);
      toast.success("Filing cycle advanced successfully!");
      await loadTracker(false);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to advance cycle." });
    } finally {
      setLoading(false);
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
            The tracking workspace for this Taxation addon service hasn&apos;t been initialized yet.
          </p>
          <button
            type="button"
            onClick={handleInitialize}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow"
          >
            Initialize Taxation Tracker
          </button>
        </div>
      </div>
    );
  }

  const stages = tracker.stages || [];
  const svcIds = SERVICES.map((s) => s.id).filter((id) =>
    stages.some((st: any) => st.svcId === id)
  );
  const currentSvc = activeSvc && svcIds.includes(activeSvc) ? activeSvc : svcIds[0];
  const filingStages = stages.filter((st: any) => st.svcId === currentSvc);
  const svcMeta = SERVICES.find((s) => s.id === currentSvc);
  const activeStageIdx = Math.max(
    filingStages.findIndex((st: any) => (st.stageId || st.id) === activeStageId),
    0
  );
  const activeStage = filingStages[activeStageIdx] || filingStages[0];
  const activeStageStatus = activeStage ? stageStatus(activeStage) : "Pending";

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
                The client has not completed payment for the Taxation add-on service yet.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md uppercase tracking-wider shrink-0 border border-amber-200">
            Payment Pending
          </span>
        </div>
      )}



      {/* Per-filing Tabs */}
      {svcIds.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {svcIds.map((id) => {
            const meta = SERVICES.find((s) => s.id === id);
            const isActive = id === currentSvc;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveSvc(id);
                  setSelectedCycle("active");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#fcd34d] text-[#92400e] border-[#fcd34d] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#fcd34d] hover:text-[#92400e]"
                }`}
              >
                {meta?.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Cycle History Selector */}
      {Boolean(tracker?.cycles?.[currentSvc]?.history?.length) && (
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs">
          <span className="text-xs font-bold text-gray-700">Filing Cycle:</span>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value === "active" ? "active" : Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="active">
              Cycle {tracker?.cycles?.[currentSvc]?.cycleNumber || 1} (Active Cycle)
            </option>
            {tracker.cycles[currentSvc].history.map((h: any) => (
              <option key={h.cycleNumber} value={h.cycleNumber}>
                Cycle {h.cycleNumber} ({h.periodLabel?.replace("SECTION: ", "") || "Completed"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stage Tabs (stepper within the filing) */}
      {filingStages.length > 0 && (
        <div className="flex gap-1 border-b border-gray-200 pb-px overflow-x-auto">
          {filingStages.map((stage: any, idx: number) => {
            const sid = stage.stageId || stage.id || `stage-${idx}`;
            const st = stageStatus(stage);
            const isActive = sid === activeStageId;
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
                    st === "Completed"
                      ? "bg-[#0F6E56] text-white"
                      : isActive
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {st === "Completed" ? "✓" : idx + 1}
                </span>
                <span>{stage.label || stage.title || `Stage ${idx + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Stage Card or Historical Cycle View */}
      {selectedCycle !== "active" && tracker?.cycles?.[currentSvc]?.history ? (
        (() => {
          const pastHist = tracker.cycles[currentSvc].history.find((h: any) => h.cycleNumber === selectedCycle);
          if (!pastHist) return null;
          const pastSections = [...(pastHist.stage2Steps || []), ...(pastHist.stage3Steps || [])];
          return (
            <div className="bg-white border border-[#E3E6EB] rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="text-sm font-bold text-gray-800">
                  Cycle {pastHist.cycleNumber} History - {pastHist.periodLabel}
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
                  Completed on {new Date(pastHist.completedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {pastSections.map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="py-3">
                    <div className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase mb-2">
                      {sec.label}
                    </div>
                    <div className="space-y-2">
                      {(sec.steps || []).map((t: any, tIdx: number) => (
                        <div key={tIdx} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5">
                          <span className="text-xs font-bold text-gray-700">{t.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
                            Done
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()
      ) : currentSvc && activeStage && (
        <div className="bg-white border border-[#E3E6EB] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  activeStageStatus === "Completed"
                    ? "bg-[#0F6E56] text-white"
                    : activeStageStatus === "In Progress"
                      ? "bg-[#fcd34d] text-[#92400e]"
                      : "bg-[#F0F2F7] text-[#9CA3AF]"
                }`}
              >
                {activeStageStatus === "Completed" ? "✓" : activeStageIdx + 1}
              </div>
              <h4 className="text-sm font-bold text-gray-800">
                {activeStage.label || activeStage.title || `Stage ${activeStageIdx + 1}`}
              </h4>
            </div>
            {stagePill(activeStageStatus)}
          </div>

          <div className="divide-y divide-gray-100">
            {(activeStage.sections || []).map((section: any, secIdx: number) => (
              <div key={section._id || section.id || `sec-${secIdx}`} className="px-5 py-4">
                {section.label && (
                  <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-3">
                    {section.label}
                  </div>
                )}

                <div className="space-y-2.5">
                  {(section.steps || []).filter((s: any) => !s.isHidden).map((step: any, stepIdx: number) => {
                    const stepId = step.stepId || step._id?.toString() || step.id || step.title;
                    const isUpdating = updatingStep === stepId;

                    return (
                      <div
                        key={stepId || stepIdx}
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
        </div>
      )}
    </div>
  );
}
