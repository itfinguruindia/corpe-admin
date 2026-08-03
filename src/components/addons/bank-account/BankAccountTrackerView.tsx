"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import { Loader2, Settings, RefreshCw } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { notifyApiError } from "@/utils/apiErrors";
import CustomSelect from "@/components/ui/CustomSelect";

interface BankAccountTrackerViewProps {
  appNo: string;
  orgId: string;
}

interface StepData {
  _id: string;
  title: string;
  description: string;
  status: string;
  ownerType: "admin" | "client" | "govt";
  visibleTo: "both" | "admin-only";
  notes?: { text: string; createdAt: string; createdByName?: string }[];
  addonQueryMetadata?: any;
}

interface SectionData {
  _id: string;
  label: string;
  estimation: string | null;
  order: number;
  steps: StepData[];
}

interface StageData {
  _id: string;
  stageId: string;
  label: string;
  order: number;
  status: "Pending" | "In Progress" | "Completed";
  completionRule: "sequential" | "parallel";
  sections: SectionData[];
}

interface TrackerData {
  _id: string;
  org: string;
  applicationNo: string;
  addonId: string;
  stages: StageData[];
  overallProgress: number;
  currentStageIndex: number;
  startedAt: string;
  completedAt?: string;
}

const statusOptions = [
  { id: "Pending", label: "Pending" },
  { id: "In Progress", label: "In Progress" },
  { id: "Action Needed", label: "Action Needed" },
  { id: "Done", label: "Done" },
];

export default function BankAccountTrackerView({ appNo, orgId }: BankAccountTrackerViewProps) {
  const [tracker, setTracker] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState<string>("");
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  const fetchTracker = useCallback(
    async (isSilent = false) => {
      if (!orgId) return;
      if (!isSilent) setLoading(true);
      try {
        const data = await clientsApi.getAddonTrackingStatus(appNo, "bank-account-setup");
        setTracker(data);
        if (data && data.stages && data.stages.length > 0) {
          setActiveStageId((prev) => {
            const exists = data.stages.some(
              (s: StageData) => (s.stageId || s._id) === prev,
            );
            if (exists && prev) return prev;
            const inProgressStage = data.stages.find(
              (s: StageData) => s.status === "In Progress",
            );
            return (
              inProgressStage?.stageId ||
              inProgressStage?._id ||
              data.stages[0].stageId ||
              data.stages[0]._id
            );
          });
        }
      } catch (err) {
        console.error("Failed to fetch bank account tracker:", err);
        setTracker(null);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [appNo, orgId],
  );

  useEffect(() => {
    fetchTracker();
  }, [fetchTracker]);

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await clientsApi.initializeAddonTracker(orgId, "bank-account-setup");
      toast.success("Bank Account Setup Tracker initialized!");
      fetchTracker();
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to initialize tracker." });
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    stageId: string,
    sectionId: string,
    stepId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingStep(stepId);
      await clientsApi.updateAddonStepStatus(
        orgId,
        "bank-account-setup",
        stageId,
        sectionId,
        stepId,
        newStatus,
      );
      toast.success("Step status updated successfully!");
      fetchTracker(true);
    } catch (error) {
      notifyApiError(error, { fallback: "Failed to update step status." });
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

  if (!tracker) {
    return (
      <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-6">
        <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-gray-800 mb-2">
          Bank Account Tracker Pending Setup
        </h4>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          The tracking workspace for this Bank Account Setup addon service hasn't been initialized yet.
        </p>
        <button
          type="button"
          onClick={handleInitialize}
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow"
        >
          Initialize Bank Tracker
        </button>
      </div>
    );
  }

  const activeStage =
    tracker.stages.find(
      (s) => (s.stageId || s._id) === activeStageId,
    ) || tracker.stages[0];

  const getOwnerTag = (owner: string) => {
    if (owner === "client")
      return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Client</span>;
    if (owner === "admin")
      return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>;
    return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Govt / Auto</span>;
  };

  return (
    <div className="space-y-6 min-w-0 font-sans">
      {/* Overall Progress Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold uppercase text-gray-500">Overall Progress</span>
            <span className="ml-2 text-sm font-bold text-gray-800">{tracker.overallProgress}%</span>
          </div>
          <button
            type="button"
            onClick={() => fetchTracker(false)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all rounded-full"
            style={{ width: `${tracker.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stage Navigation Tabs Strip */}
      <div className="flex gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {tracker.stages.map((stage, idx) => {
          const idKey = stage.stageId || stage._id || `s${idx + 1}`;
          const isActive = idKey === activeStageId || stage.stageId === activeStageId;
          const isComplete = stage.status === "Completed";

          return (
            <button
              key={idKey}
              type="button"
              onClick={() => setActiveStageId(idKey)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all focus:outline-none ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isComplete
                    ? "bg-green-600 text-white"
                    : isActive
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {isComplete ? "✓" : idx + 1}
              </span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Tasks Card */}
      {activeStage && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800">{activeStage.label} Tasks</h3>
            <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide">
              Est: {activeStage.sections[0]?.estimation || "~1 day"}
            </span>
          </div>

          {activeStage.sections.map((section, secIdx) => (
            <div key={section._id || secIdx} className="space-y-4">
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                {section.label}
              </div>

              <div className="space-y-4">
                {section.steps.map((step) => (
                  <div
                    key={step._id}
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
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                      </div>

                      {/* Status Dropdown */}
                      <div className="shrink-0 flex items-center gap-2">
                        {updatingStep === step._id && (
                          <Loader2 className="animate-spin h-3.5 w-3.5 text-primary shrink-0" />
                        )}
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
                              activeStage.stageId || activeStage._id,
                              section._id || String(section.order),
                              step._id,
                              val,
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
