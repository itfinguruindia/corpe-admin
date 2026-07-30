"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@heroui/react";
import {
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
  Send,
  RotateCcw,
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

export default function TrademarkAddonTrackerView({ appNo, orgId, isPaid = true }: AdminAddonTrackerViewProps) {
  const [tracker, setTracker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState("s1");
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  // Addon Query State
  const [queryFormText, setQueryFormText] = useState("");
  const [queryNeedsDoc, setQueryNeedsDoc] = useState(true);
  const [queryNeedsText, setQueryNeedsText] = useState(true);
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [showRaiseQueryForm, setShowRaiseQueryForm] = useState(false);

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAddonTrackingStatus(appNo, "trademark-registration");
      setTracker(data);
      if (data?.stages && data.stages.length > 0) {
        const currentStageIndex = data.currentStageIndex || 0;
        if (data.stages[currentStageIndex]) {
          setActiveStageId(data.stages[currentStageIndex].id);
        }
      }
    } catch (error) {
      console.error("Failed to load trademark tracker:", error);
    } finally {
      setLoading(false);
    }
  }, [appNo]);

  useEffect(() => {
    if (appNo) {
      loadTracker();
    }
  }, [appNo, loadTracker]);

  const handleStepStatusChange = async (stepId: string, newStatus: string) => {
    setUpdatingStep(stepId);
    try {
      await clientsApi.updateAddonStepStatus(appNo, "trademark-registration", stepId, newStatus);
      toast.success("Step status updated successfully");
      await loadTracker();
    } catch (error) {
      notifyApiError(error, "Failed to update step status");
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleRaiseQuery = async (stepId: string) => {
    if (!queryFormText.trim()) {
      toast.error("Please enter query instructions");
      return;
    }
    setIsSubmittingQuery(true);
    try {
      await clientsApi.raiseAddonQuery(appNo, "trademark-registration", {
        stepId,
        queryText: queryFormText,
        needsDocument: queryNeedsDoc,
        needsTextResponse: queryNeedsText,
      });
      toast.success("Query raised successfully");
      setQueryFormText("");
      setShowRaiseQueryForm(false);
      await loadTracker();
    } catch (error) {
      notifyApiError(error, "Failed to raise query");
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span>Loading Trademark Tracker...</span>
      </div>
    );
  }

  if (!tracker || !tracker.stages) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
        No active tracker found for this application.
      </div>
    );
  }

  const activeStage = tracker.stages.find((s: any) => s.id === activeStageId) || tracker.stages[0];

  return (
    <div className="space-y-6">
      {/* Stages Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tracker.stages.map((stage: any, idx: number) => {
          const isActive = stage.id === activeStageId;
          const isCompleted = idx < (tracker.currentStageIndex || 0);

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : isCompleted
                  ? "border-transparent text-emerald-600 hover:text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}>
                {isCompleted ? "✓" : idx + 1}
              </span>
              <span>{stage.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Sections & Steps */}
      {activeStage && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeStage.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeStage.description}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Stage {tracker.stages.findIndex((s: any) => s.id === activeStage.id) + 1} of {tracker.stages.length}
            </span>
          </div>

          <div className="space-y-4">
            {activeStage.sections?.map((section: any) => (
              <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {section.title}
                </h4>

                <div className="space-y-3">
                  {section.steps?.map((step: any) => (
                    <div
                      key={step.id}
                      className="p-3.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.title}</span>
                          {step.isActionable && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <CustomSelect
                          value={step.status || "Pending"}
                          onChange={(val) => handleStepStatusChange(step.id, val)}
                          options={statusOptions}
                          size="sm"
                          className="w-36"
                          disabled={updatingStep === step.id}
                        />

                        {step.isActionable && (
                          <button
                            onClick={() => setShowRaiseQueryForm(!showRaiseQueryForm)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Raise Query
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
