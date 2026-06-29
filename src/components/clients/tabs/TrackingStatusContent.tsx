"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clientsApi } from "@/lib/api/clients";

import {
  Spinner,
  Button,
  Card,
  CardContent,
  Chip,
  TextArea,
} from "@heroui/react";
import {
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  X,
} from "lucide-react";

import CustomSelect from "@/components/ui/CustomSelect";
import { useClientTabEdit } from "@/hooks/useClientTabEdit";

// Types matching updated backend application tracker
interface TrackerNote {
  _id?: string;
  text: string;
  createdAt: string;
}

interface TrackerStep {
  _id: string;
  title: string;
  description: string;
  status:
    | "Done"
    | "In Progress"
    | "Action Needed"
    | "Pending"
    | "Not Available"
    | "Rejected";
  ownerType: "admin" | "client" | "govt";
  visibleTo: "both" | "admin-only";
  statusChangedAt?: string | null;
  statusChangedBy?: any;
  notes: TrackerNote[];
  isEditable?: boolean;
  isAutoSynced?: boolean;
  isHidden?: boolean;
  isLocked?: boolean;
}

interface TrackerSection {
  _id: string;
  label: string;
  estimation?: string;
  order: number;
  steps: TrackerStep[];
}

interface TrackerStage {
  _id: string;
  stageId: string;
  label: string;
  order: number;
  status: "Pending" | "In Progress" | "Completed";
  completionRule: "sequential" | "parallel";
  sections: TrackerSection[];
  attempts?: TrackerStage[];
}

interface InstallmentInfo {
  firstInstallmentDue: boolean;
  firstInstallmentPaid: boolean;
  secondInstallmentDue: boolean;
  secondInstallmentPaid: boolean;
}

interface TrackerData {
  _id: string;
  org: {
    _id: string;
    companyType: string;
    companyStatus: string;
    applicationNo: string;
    assignee?: any;
  };
  applicationNo: string;
  companyType: string;
  startedAt: string;
  completedAt?: string | null;
  overallProgress: number;
  currentStageIndex: number;
  stages: TrackerStage[];
  installmentInfo?: InstallmentInfo;
  assignee?: {
    _id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface TrackingStatusContentProps {
  appNo: string;
}

export default function TrackingStatusContent({
  appNo,
}: TrackingStatusContentProps) {
  const router = useRouter();
  const { requireEdit, canEdit } = useClientTabEdit("track");

  const [tracker, setTracker] = useState<TrackerData | null>(null);
  const [companyOverview, setCompanyOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<
    Record<string, boolean>
  >({});
  const [selectedAttemptIdxs, setSelectedAttemptIdxs] = useState<
    Record<string, number>
  >({});

  // Notes state
  const [selectedStepId, setSelectedStepId] = useState<string>("");
  const [noteText, setNoteText] = useState<string>("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isRequestingRestart, setIsRequestingRestart] = useState(false);

  // Extension status from API
  const [extensionStatus, setExtensionStatus] = useState<any>(null);

  // Countdown timer for name extension step
  const [extTimeLeft, setExtTimeLeft] = useState<string | null>(null);
  const expiryExtRef = useRef(false);

  useEffect(() => {
    if (appNo) {
      clientsApi
        .getNameExtensionStatus(appNo)
        .then((res) => {
          if (res?.data) setExtensionStatus(res.data);
        })
        .catch(() => {});
    }
  }, [appNo]);

  useEffect(() => {
    const currentAttemptNum = extensionStatus?.currentAttempt || 1;
    const attempt = extensionStatus?.attempts?.find(
      (a: any) => a.attemptNumber === currentAttemptNum,
    );

    if (!attempt || !attempt.countdownStartDate) {
      setExtTimeLeft(null);
      return;
    }

    const tryAutoExpire = () => {
      if (expiryExtRef.current) return;
      expiryExtRef.current = true;
      clientsApi.autoExpireNameExtension(appNo).catch(() => {});
    };

    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(attempt.countdownStartDate).getTime();
      const end = new Date(attempt.windowEndDate).getTime();

      if (now < start) {
        setExtTimeLeft(null);
        return;
      }

      if (now >= end) {
        setExtTimeLeft(null);
        tryAutoExpire();
        return;
      }

      const diff = end - now;

      if (diff <= 0) {
        setExtTimeLeft("00d : 00h : 00m : 00s");
        tryAutoExpire();
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        setExtTimeLeft(
          `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [extensionStatus, appNo]);

  useEffect(() => {
    if (tracker && tracker.stages) {
      setSelectedAttemptIdxs((prev) => {
        const next = { ...prev };
        tracker.stages.forEach((stage) => {
          if (stage.attempts && stage.attempts.length > 0) {
            const currentIdx = prev[stage._id];
            if (
              currentIdx === undefined ||
              currentIdx >= stage.attempts.length
            ) {
              next[stage._id] = stage.attempts.length - 1;
            }
          }
        });
        return next;
      });
    }
  }, [tracker]);

  useEffect(() => {
    if (appNo) {
      loadData();
    }
  }, [appNo]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Always fetch company overview first (needed for Initialize button if tracker is missing)
      try {
        const overview = await clientsApi.getCompanyOverview(appNo);
        if (overview && overview.data) {
          setCompanyOverview(overview.data);
        }
      } catch (err) {
        console.error("Error fetching company overview:", err);
      }

      let trackerData = null;
      try {
        trackerData = await clientsApi.getTrackingStatus(appNo);
      } catch (err) {
        console.error("Error fetching tracker:", err);
      }
      setTracker(trackerData);

      if (trackerData && trackerData.stages) {
        // For stages with re-attempts (e.g. Name Application after a rejection),
        // use the last attempt's sections/steps for the first-step selection.
        const getEffectiveStage = (stage: TrackerStage): TrackerStage => {
          if (stage.attempts && stage.attempts.length > 0) {
            return stage.attempts[stage.attempts.length - 1];
          }
          return stage;
        };

        // Open the first stage whose own status is "In Progress";
        // (stage.status on the grouped entry is always current —
        //  the backing store's JSON copies in stage.attempts are not
        //  updated by recomputeStageStatuses, so we never use them here.)
        // otherwise fall back to stage 1 (order 1).
        const firstInProgressIndex = trackerData.stages.findIndex(
          (stage: TrackerStage) => stage.status === "In Progress",
        );
        const openIndex = firstInProgressIndex >= 0 ? firstInProgressIndex : 0;

        const initialCollapsed: Record<string, boolean> = {};
        trackerData.stages.forEach((stage: TrackerStage, index: number) => {
          initialCollapsed[stage._id] = index !== openIndex;
        });
        setCollapsedStages(initialCollapsed);

        const openStage = getEffectiveStage(trackerData.stages[openIndex]);
        if (openStage && openStage.sections.length > 0) {
          const firstStep = openStage.sections[0].steps[0];
          if (firstStep) {
            setSelectedStepId(firstStep._id);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeTracker = async () => {
    if (!requireEdit()) return;
    if (!companyOverview || !companyOverview._id) {
      alert("Cannot initialize tracker: Organization not loaded.");
      return;
    }
    try {
      setInitializing(true);
      await clientsApi.initializeTracker(companyOverview._id);
      await loadData();
    } catch (error) {
      console.error("Error initializing tracker:", error);
      alert("Failed to initialize tracker.");
    } finally {
      setInitializing(false);
    }
  };

  const handleStatusChange = async (
    stageId: string,
    sectionId: string,
    stepId: string,
    newStatus: string,
  ) => {
    if (!requireEdit()) return;
    if (!tracker) return;
    try {
      await clientsApi.updateStepStatus(
        tracker.org._id,
        stageId,
        sectionId,
        stepId,
        newStatus,
      );
      const updated = await clientsApi.getTrackingStatus(appNo);
      setTracker(updated);
    } catch (error: any) {
      console.error("Failed to update status", error);
      const errMsg =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert(`Failed to update status: ${errMsg}`);
    }
  };

  const handleAddNote = async () => {
    if (!requireEdit()) return;
    if (!tracker || !selectedStepId || !noteText.trim()) return;
    try {
      setIsSavingNote(true);
      await clientsApi.addNoteToStep(
        tracker.org._id,
        selectedStepId,
        noteText.trim(),
      );
      setNoteText("");
      const updated = await clientsApi.getTrackingStatus(appNo);
      setTracker(updated);
    } catch (error: any) {
      console.error("Failed to add note", error);
      const errMsg =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert(`Failed to add note: ${errMsg}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRequestRestart = async () => {
    try {
      setIsRequestingRestart(true);
      await clientsApi.requestNameExtensionRestart(appNo);
      const res = await clientsApi.getNameExtensionStatus(appNo);
      if (res && res.data) {
        setExtensionStatus(res.data);
      }
      alert(
        "Restart requested successfully. Client has been notified and rejection flow initialized.",
      );
    } catch (err: any) {
      console.error("Failed to request restart:", err);
      alert(err.response?.data?.message || "Failed to request restart.");
    } finally {
      setIsRequestingRestart(false);
    }
  };

  const toggleStageCollapse = (stageId: string) => {
    setCollapsedStages((prev) => {
      const isCurrentlyCollapsed = prev[stageId] ?? true;
      const nextCollapsed: Record<string, boolean> = {};

      // Collapse everything
      tracker?.stages.forEach((stage) => {
        nextCollapsed[stage._id] = true;
      });

      // Toggle the clicked stage
      nextCollapsed[stageId] = !isCurrentlyCollapsed;
      return nextCollapsed;
    });
  };

  const handleStageSelect = (stageId: string) => {
    // 1. Collapse all stages except this one
    setCollapsedStages(() => {
      const nextCollapsed: Record<string, boolean> = {};
      tracker?.stages.forEach((stage) => {
        nextCollapsed[stage._id] = stage._id !== stageId;
      });
      return nextCollapsed;
    });

    // 2. Scroll to the element
    setTimeout(() => {
      const element = document.getElementById(`stage-card-${stageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-semibold text-gray-500">
            Loading application tracker...
          </p>
        </div>
      </div>
    );
  }

  if (!tracker) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md p-6">
          <CardContent className="flex flex-col items-center text-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Tracker Not Initialized
            </h3>
            <p className="text-sm text-gray-500">
              The application tracker infrastructure has not been initialized
              for this organization yet.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push(`/clients/${appNo}`)}
              >
                Back to Client Profile
              </Button>
              <Button
                variant="primary"
                onClick={handleInitializeTracker}
                isDisabled={initializing}
              >
                {initializing ? "Initializing..." : "Initialize Tracker Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusChipColor = (
    status: string,
  ): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "Done":
        return "success";
      case "In Progress":
        return "warning";
      case "Action Needed":
      case "Not Available":
      case "Rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <Check className="w-3.5 h-3.5 text-white" />;
      case "In Progress":
        return (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
        );
      case "Action Needed":
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      case "Not Available":
      case "Rejected":
        return <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
      default:
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getStageStatusLabel = (status: string) => {
    switch (status) {
      case "Completed":
        return "Completed";
      case "In Progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getStageStatusColorClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const statusOptions = [
    { id: "In Progress", label: "In Progress" },
    { id: "Done", label: "Done" },
    { id: "Pending", label: "Pending" },
    { id: "Action Needed", label: "Action Needed" },
    { id: "Not Available", label: "Not Available" },
    { id: "Rejected", label: "Rejected" },
  ];

  const allSteps: TrackerStep[] = [];
  const clientActionSteps: TrackerStep[] = [];
  tracker.stages.forEach((stage) => {
    stage.sections.forEach((section) => {
      section.steps.forEach((step) => {
        if (step.isHidden) return;
        allSteps.push(step);
        if (step.ownerType === "client") {
          clientActionSteps.push(step);
        }
      });
    });
  });

  const allNotes = allSteps
    .flatMap((step) =>
      step.notes.map((note) => ({
        ...note,
        stepTitle: step.title,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const blockedCount = allSteps.filter(
    (s) => s.status === "Action Needed",
  ).length;

  // Build step options for HeroUI Select
  const stepSelectItems = tracker.stages.flatMap((stage) =>
    stage.sections.flatMap((section) =>
      section.steps
        .filter((step) => !step.isHidden)
        .map((step) => ({
          key: step._id,
          label: `Stage ${stage.order} — ${step.title}`,
        })),
    ),
  );

  return (
    <div className="min-h-screen p-2 font-sans text-sm text-[#1A1D23]">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-4">
        {/* Banner Card — company info header flush to card edges, no gap */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl p-0">
          {/* Gradient header flush to rounded card */}
          <div className="p-6! bg-linear-to-r from-[#1E3A6E] to-[#2D5499] px-5 py-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white text-base font-bold shrink-0">
                {appNo.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-base font-semibold">
                  Application: {tracker.applicationNo || `#${appNo}`}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Company ID: {tracker.org?._id || "—"} • Entity Type:{" "}
                  {tracker.companyType}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-bold text-amber-500 font-mono leading-none">
                {tracker.overallProgress}%
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">
                Overall Completion
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white border-t border-slate-100 text-center rounded-b-xl">
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Current Stage
              </div>
              <div className="text-lg font-bold text-slate-800 font-mono">
                {tracker.currentStageIndex + 1}/4
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[200px] mx-auto mt-0.5">
                {tracker.stages[tracker.currentStageIndex]?.label || "N/A"}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Days Elapsed
              </div>
              <div className="text-lg font-bold text-slate-800 font-mono">
                {Math.ceil(
                  (new Date().getTime() -
                    new Date(tracker.startedAt).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Started {new Date(tracker.startedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                Blocked Items
              </div>
              <div className="text-lg font-bold font-mono text-red-600">
                {blockedCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Require action to proceed
              </div>
            </div>
          </div>
        </Card>

        {/* Installment Payment Warning Banners */}
        {tracker.installmentInfo?.firstInstallmentDue && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                1st Installment Payment Required
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                The Digital Signature Certificate (DSC) section in Stage 2 and
                all of Stages 3 &amp; 4 are locked until the client pays the 1st
                Installment.
                <a
                  href={`/clients/${appNo}/pricing-and-payment`}
                  className="underline font-semibold ml-1"
                >
                  Go to Pricing &amp; Payment
                </a>
              </p>
            </div>
          </div>
        )}

        {tracker.installmentInfo?.secondInstallmentDue && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                2nd Installment Payment Required
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Stages 3 &amp; 4 are locked until the client pays the 2nd
                Installment.
                <a
                  href={`/clients/${appNo}/pricing-and-payment`}
                  className="underline font-semibold ml-1"
                >
                  Go to Pricing &amp; Payment
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Name Extension Status Banner */}
        {extensionStatus &&
          extensionStatus.overallStatus !== "inactive" &&
          extensionStatus.overallStatus !== "done" && (
            <div
              className={`rounded-xl p-4 flex items-center gap-3 shadow-sm border ${
                extensionStatus.overallStatus === "restart_required" ||
                extensionStatus.overallStatus === "expired"
                  ? "bg-red-50 border-red-300"
                  : extensionStatus.overallStatus === "paid" ||
                      extensionStatus.overallStatus === "in_progress"
                    ? "bg-blue-50 border-blue-300"
                    : "bg-amber-50 border-amber-300"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 shrink-0 self-start mt-1 ${
                  extensionStatus.overallStatus === "restart_required" ||
                  extensionStatus.overallStatus === "expired"
                    ? "text-red-600"
                    : extensionStatus.overallStatus === "paid" ||
                        extensionStatus.overallStatus === "in_progress"
                      ? "text-blue-600"
                      : "text-amber-600"
                }`}
              />
              {extensionStatus.overallStatus === "restart_required" ? (
                <div className="flex-1 flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-red-900 uppercase tracking-wide">
                      Application Restart Required
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed font-medium max-w-2xl">
                      Both name extension payments were missed and SPICe+ Part B
                      was not filed within 20 days — the current MCA name
                      reservation has lapsed.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-red-900 bg-red-100/50 rounded-lg p-3 w-fit">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        Ext 1 — Missed
                      </span>
                      <span className="text-red-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        Ext 2 — Missed
                      </span>
                      <span className="text-red-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        SPICe B — Not Filed
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col lg:flex-row gap-3 w-full md:w-auto shrink-0">
                    <button
                      onClick={handleRequestRestart}
                      disabled={isRequestingRestart}
                      className="flex-1 md:flex-initial text-center bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer border-none disabled:opacity-50"
                    >
                      {isRequestingRestart
                        ? "Requesting..."
                        : "Request Restart from Client"}
                    </button>
                    <button
                      onClick={() =>
                        setExtensionStatus((prev: any) =>
                          prev
                            ? { ...prev, overallStatus: "expired" as const }
                            : prev,
                        )
                      }
                      className="flex-1 md:flex-initial text-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Dismiss for now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      extensionStatus.overallStatus === "expired"
                        ? "text-red-900"
                        : extensionStatus.overallStatus === "paid" ||
                            extensionStatus.overallStatus === "in_progress"
                          ? "text-blue-900"
                          : "text-amber-900"
                    }`}
                  >
                    {extensionStatus.overallStatus === "monitoring" &&
                      "Name Hold Monitoring — SPICe+ Part B pending"}
                    {extensionStatus.overallStatus === "countdown" &&
                      `Name Hold Expiring — Attempt ${extensionStatus.currentAttempt}`}
                    {extensionStatus.overallStatus === "pay_now" &&
                      `Payment Required — Name Extension Attempt ${extensionStatus.currentAttempt}`}
                    {extensionStatus.overallStatus === "paid" &&
                      "Name Extension — Payment Received"}
                    {extensionStatus.overallStatus === "in_progress" &&
                      "Name Extension — MCA Processing"}
                    {extensionStatus.overallStatus === "expired" &&
                      "Name Extension Expired"}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      extensionStatus.overallStatus === "expired"
                        ? "text-red-700"
                        : extensionStatus.overallStatus === "paid" ||
                            extensionStatus.overallStatus === "in_progress"
                          ? "text-blue-700"
                          : "text-amber-700"
                    }`}
                  >
                    {extensionStatus.overallStatus === "monitoring" &&
                      "Monitoring 20-day window. Name extension will activate at 5 days remaining."}
                    {extensionStatus.overallStatus === "countdown" &&
                      `Attempt ${extensionStatus.currentAttempt} — ${extensionStatus.currentAttempt === 1 ? "₹1,000" : "₹2,000"} fee required before expiry.`}
                    {extensionStatus.overallStatus === "pay_now" &&
                      `Client can pay now. Send payment link or wait for auto-enable.`}
                    {extensionStatus.overallStatus === "paid" &&
                      "Payment confirmed. Admin can mark the extension step as Done after MCA processing."}
                    {extensionStatus.overallStatus === "in_progress" &&
                      "Admin is working on MCA portal to extend the name hold."}
                    {extensionStatus.overallStatus === "expired" &&
                      "Extension window lapsed. Contact client to discuss next steps."}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
          {/* Left Column: Stage Cards */}
          <div className="flex flex-col gap-3">
            {/* Quick Navigation Stages Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-1">
              {tracker.stages.map((stage, idx) => {
                const isOpen = !collapsedStages[stage._id];

                return (
                  <button
                    key={`nav-${stage._id}`}
                    onClick={() => handleStageSelect(stage._id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      isOpen
                        ? "bg-blue-50/70 border-blue-200 ring-2 ring-blue-100 font-bold"
                        : "bg-slate-50/30 border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        stage.status === "Completed"
                          ? "bg-emerald-500 text-white"
                          : stage.status === "In Progress"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {stage.order}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                        {stage.label}
                      </div>
                      <div className="text-[9px] font-semibold text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                        {stage.status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {tracker.stages.map((stage, stageIdx) => {
              const isCollapsed = collapsedStages[stage._id];
              const isCurrent = tracker.currentStageIndex === stageIdx;

              const selectedAttemptIdx =
                selectedAttemptIdxs[stage._id] ??
                (stage.attempts ? stage.attempts.length - 1 : 0);
              const currentStage =
                stage.attempts && stage.attempts[selectedAttemptIdx]
                  ? stage.attempts[selectedAttemptIdx]
                  : stage;

              return (
                <Card
                  key={stage._id}
                  id={`stage-card-${stage._id}`}
                  className={`border border-slate-200 shadow-sm overflow-hidden bg-white rounded-xl transition-all scroll-mt-24 ${
                    isCurrent ? "ring-1 ring-blue-500" : ""
                  }`}
                >
                  {/* Stage Card Header */}
                  <div
                    className="p-3 border-b border-slate-100 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50"
                    onClick={() => toggleStageCollapse(stage._id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          stage.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : stage.status === "In Progress"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {stage.order}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          {stage.label}
                          {isCurrent && (
                            <Chip
                              size="sm"
                              color="accent"
                              variant="soft"
                              className="h-4 text-[10px]"
                            >
                              Active
                            </Chip>
                          )}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStageStatusColorClass(
                          stage.status,
                        )}`}
                      >
                        {getStageStatusLabel(stage.status)}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Stage Card Content */}
                  {!isCollapsed && (
                    <div className="p-0 divide-y divide-slate-100">
                      {stage.attempts && stage.attempts.length > 1 && (
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/50 flex flex-wrap items-center gap-2 font-sans">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Attempt History:
                          </span>
                          <div className="flex items-center gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-200/30">
                            {stage.attempts.map((att, idx) => {
                              const isActive = idx === selectedAttemptIdx;
                              return (
                                <button
                                  key={`${att.stageId || att._id || idx}-${idx}`}
                                  type="button"
                                  onClick={() =>
                                    setSelectedAttemptIdxs((prev) => ({
                                      ...prev,
                                      [stage._id]: idx,
                                    }))
                                  }
                                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                                    isActive
                                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                                      : "text-slate-500 hover:text-slate-900 hover:bg-white/30"
                                  }`}
                                >
                                  Attempt {idx + 1}{" "}
                                  {idx === (stage.attempts?.length || 0) - 1
                                    ? "(Active)"
                                    : ""}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {currentStage.sections.map((section) => (
                        <div key={section._id} className="bg-white">
                          {/* Section Header */}
                          <div className="px-4 py-2 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Section: {section.label}
                              </span>
                              {(section.label ===
                                "Digital Signature Certificate (DSC)" ||
                                section.label ===
                                  "Digital Signature Certificate (DSC) procedure" ||
                                section.label === "DSC procedure") &&
                                tracker.installmentInfo
                                  ?.firstInstallmentDue && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                    <svg
                                      className="w-3 h-3"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Locked — 1st Installment Due
                                  </span>
                                )}
                            </div>
                            {section.estimation && (
                              <span className="text-xs text-slate-400 font-mono shrink-0 ml-2">
                                Est: {section.estimation}
                              </span>
                            )}
                          </div>

                          {/* Steps Checklist */}
                          <div className="divide-y divide-slate-100">
                            {section.steps
                              .filter((step) => !step.isHidden)
                              .map((step) => {
                                const isUrgent =
                                  step.status === "Action Needed";
                                const extCurrentAttNum =
                                  extensionStatus?.currentAttempt || 1;
                                const extActiveAtt =
                                  extensionStatus?.attempts?.find(
                                    (a: any) =>
                                      a.attemptNumber === extCurrentAttNum,
                                  );

                                return (
                                  <div
                                    key={step._id}
                                    className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                                      isUrgent
                                        ? "bg-amber-50/30"
                                        : "hover:bg-slate-50/50"
                                    }`}
                                  >
                                    {/* Step Details */}
                                    <div className="flex items-start gap-3 flex-1">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                          step.status === "Done"
                                            ? "bg-emerald-500 border-emerald-500"
                                            : step.status === "In Progress"
                                              ? "bg-amber-100 border-amber-300 animate-pulse"
                                              : step.status === "Action Needed"
                                                ? "bg-rose-100 border-rose-300"
                                                : step.status ===
                                                      "Not Available" ||
                                                    step.status === "Rejected"
                                                  ? "bg-red-500 border-red-500"
                                                  : "bg-slate-50 border-slate-200"
                                        }`}
                                      >
                                        {getStatusIcon(step.status)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4
                                            className={`text-sm font-semibold text-slate-800 ${
                                              step.status === "Done" ||
                                              step.status === "Not Available" ||
                                              step.status === "Rejected"
                                                ? "text-slate-400 line-through font-normal"
                                                : ""
                                            }`}
                                          >
                                            {step.title}
                                          </h4>
                                          <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                              step.ownerType === "client"
                                                ? "bg-amber-100 text-amber-800"
                                                : step.ownerType === "govt"
                                                  ? "bg-emerald-100 text-emerald-800"
                                                  : "bg-blue-100 text-blue-800"
                                            }`}
                                          >
                                            {step.ownerType.toUpperCase()}
                                          </span>
                                          {step.visibleTo === "admin-only" && (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                              ADMIN ONLY
                                            </span>
                                          )}
                                          {step.isAutoSynced && (
                                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">
                                              AUTO-MANAGED
                                            </span>
                                          )}
                                          {step.isLocked && (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                                              🔒 LOCKED
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-slate-500 text-sm mt-0.5">
                                          {step.description}
                                        </p>

                                        {/* Extension Metadata — countdown + attempt history */}
                                        {(step as any).extensionMetadata && (
                                          <div className="mt-2 flex flex-col gap-2">
                                            {/* Status-based card */}
                                            {extActiveAtt?.status === "paid" ||
                                            extActiveAtt?.status ===
                                              "in_progress" ? (
                                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                                    Name Extension — Payment
                                                    Received
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                                                  Payment confirmed for attempt{" "}
                                                  {extActiveAtt.attemptNumber}.{" "}
                                                  {extActiveAtt.status ===
                                                  "in_progress"
                                                    ? "Admin is working on MCA portal."
                                                    : "Awaiting admin action on MCA portal."}
                                                </p>
                                              </div>
                                            ) : extActiveAtt?.status ===
                                              "done" ? (
                                              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 shadow-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>
                                                  Name reservation extended —{" "}
                                                  {extActiveAtt.attemptNumber ===
                                                  1
                                                    ? "1st"
                                                    : "2nd"}{" "}
                                                  attempt ✓
                                                </span>
                                              </div>
                                            ) : extActiveAtt?.status ===
                                              "expired" ? (
                                              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-sm">
                                                <span className="text-[10px] font-bold text-red-800">
                                                  Name extension expired —
                                                  restart required
                                                </span>
                                              </div>
                                            ) : extTimeLeft ? (
                                              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                                                    Name Hold Expires In
                                                  </span>
                                                  <span className="font-mono text-xs font-bold text-amber-600 bg-white border border-amber-100 px-2.5 py-1 rounded-lg">
                                                    {extTimeLeft}
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">
                                                  Payment must be completed
                                                  before expiry to prevent name
                                                  loss.
                                                </p>
                                              </div>
                                            ) : null}
                                            {/* Attempt history chips */}
                                            <div className="flex flex-wrap gap-2">
                                              {(
                                                (step as any).extensionMetadata
                                                  .attempts || []
                                              ).map(
                                                (att: any, attIdx: number) => (
                                                  <span
                                                    key={attIdx}
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${
                                                      att.status === "done"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : att.status ===
                                                              "paid" ||
                                                            att.status ===
                                                              "in_progress"
                                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                                          : att.status ===
                                                              "expired"
                                                            ? "bg-red-50 text-red-700 border-red-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}
                                                  >
                                                    Ext {att.attemptNumber}:{" "}
                                                    {att.status}
                                                  </span>
                                                ),
                                              )}
                                              {(step as any).extensionMetadata
                                                .spiceBSubmitted && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono bg-green-50 text-green-700 border border-green-200">
                                                  SPICe+ B ✓
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Timestamp / Notes Indicator */}
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap font-mono">
                                          {step.statusChangedAt && (
                                            <span>
                                              Updated{" "}
                                              {new Date(
                                                step.statusChangedAt,
                                              ).toLocaleString()}
                                            </span>
                                          )}
                                          {step.notes &&
                                            step.notes.length > 0 && (
                                              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                                <FileText className="w-3 h-3" />
                                                {step.notes.length} note(s)
                                              </span>
                                            )}
                                        </div>

                                        {/* Inline Notes Display */}
                                        {step.notes &&
                                          step.notes.length > 0 && (
                                            <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1.5">
                                              {step.notes.map((note, nIdx) => (
                                                <div
                                                  key={nIdx}
                                                  className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100"
                                                >
                                                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5 font-mono">
                                                    <span>Admin Note</span>
                                                    <span>
                                                      {new Date(
                                                        note.createdAt,
                                                      ).toLocaleString()}
                                                    </span>
                                                  </div>
                                                  <p className="whitespace-pre-wrap">
                                                    {note.text}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                      </div>
                                    </div>

                                    {/* Step Dropdown Control — no + button */}
                                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                      <div className="w-36">
                                        <CustomSelect
                                          value={step.status}
                                          isDisabled={
                                            step.isEditable === false ||
                                            step.title ===
                                              "All documents delivered to you"
                                          }
                                          onChange={(val) =>
                                            handleStatusChange(
                                              currentStage.stageId || stage._id,
                                              section._id,
                                              step._id,
                                              val,
                                            )
                                          }
                                          ariaLabel={`Status for ${step.title}`}
                                          options={statusOptions.filter(
                                            (opt) => {
                                              if (
                                                step.title ===
                                                "Name reservation letter received"
                                              ) {
                                                return (
                                                  opt.id === "In Progress" ||
                                                  opt.id === "Done" ||
                                                  opt.id === "Pending" ||
                                                  opt.id === "Rejected"
                                                );
                                              }

                                              if (
                                                step.title.startsWith(
                                                  "Name reservation extension",
                                                ) ||
                                                step.title.startsWith(
                                                  "Name reservation extended",
                                                )
                                              ) {
                                                return (
                                                  opt.id === "Done" ||
                                                  opt.id === "In Progress" ||
                                                  opt.id === "Pending" ||
                                                  opt.id === "Action Needed"
                                                );
                                              }

                                              if (step.ownerType === "client") {
                                                return (
                                                  opt.id === "Pending" ||
                                                  opt.id === "Done" ||
                                                  opt.id === "Action Needed"
                                                );
                                              }

                                              if (opt.id === "Not Available") {
                                                return (
                                                  step.title ===
                                                    "Name availability check" ||
                                                  step.title ===
                                                    "Trademark Check"
                                                );
                                              }

                                              if (opt.id === "Action Needed") {
                                                return false;
                                              }

                                              return true;
                                            },
                                          )}
                                          renderValue={(val) => (
                                            <Chip
                                              color={getStatusChipColor(val)}
                                              variant="soft"
                                              size="sm"
                                              className="font-bold border-0 bg-transparent p-0 flex items-center gap-1"
                                            >
                                              <span>{val}</span>
                                            </Chip>
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
                </Card>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Client Info Card */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Client Information</h3>
              </div>
              <div className="p-0 divide-y divide-slate-50">
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Company Name
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {companyOverview?.companyName || "ABC Ventures"}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Application Ref
                  </span>
                  <span className="font-mono text-xs text-slate-600 text-right font-semibold">
                    {appNo}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Client Name
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {companyOverview?.clientName ||
                      `${companyOverview?.client?.firstName || "—"} ${companyOverview?.client?.lastName || ""}`}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Entity Type
                  </span>
                  <span className="font-semibold text-slate-800 text-right">
                    {tracker.companyType}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Contact Email
                  </span>
                  <span className="text-slate-600 font-medium text-right font-mono text-xs">
                    {companyOverview?.contactEmail ||
                      companyOverview?.client?.email ||
                      "—"}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">
                    Contact Phone
                  </span>
                  <span className="text-slate-600 font-medium text-right">
                    {companyOverview?.contactNo ||
                      companyOverview?.client?.phoneNumber ||
                      "—"}
                  </span>
                </div>
                <div className="px-4 py-2 flex justify-between gap-3">
                  <span className="text-slate-400 font-medium">State</span>
                  <span className="text-slate-600 font-medium text-right">
                    {companyOverview?.state || "—"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Client Actions Required */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">
                  Client Actions Required
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">
                  {clientActionSteps.filter((s) => s.status === "Done").length}{" "}
                  / {clientActionSteps.length}
                </span>
              </div>
              <div className="p-0 divide-y divide-slate-50">
                {clientActionSteps.map((step) => (
                  <div
                    key={step._id}
                    className="p-3 flex items-start gap-2.5 justify-between"
                  >
                    <div className="flex gap-2 items-start">
                      <div className="mt-0.5 shrink-0">
                        {step.status === "Done" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : step.status === "Action Needed" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 leading-tight">
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Status:{" "}
                          <span className="font-medium text-slate-600">
                            {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {clientActionSteps.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No client-side action items configured.
                  </div>
                )}
              </div>
            </Card>

            {/* Internal Case Notes — HeroUI Select + Textarea */}
            <Card
              id="internal-notes-card"
              className="border border-slate-200 shadow-sm bg-white rounded-xl overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">
                  Internal Case Notes
                </h3>
              </div>

              {/* Note Creator Form */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                    Target Step
                  </label>
                  <select
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={selectedStepId}
                    onChange={(e) => setSelectedStepId(e.target.value)}
                  >
                    <option value="" disabled>
                      — Choose step —
                    </option>
                    {stepSelectItems.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <TextArea
                  placeholder="Add internal note to the step..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full"
                  rows={3}
                />

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs h-8 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5"
                    onClick={handleAddNote}
                    isDisabled={
                      isSavingNote || !selectedStepId || !noteText.trim()
                    }
                  >
                    {isSavingNote ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Save Note</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Note History */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {allNotes.map((note, nIdx) => (
                  <div key={nIdx} className="p-3 text-[11px] leading-relaxed">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-1">
                      <span className="font-semibold text-blue-900">
                        Case Manager
                      </span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded inline-block mb-1.5 font-mono max-w-full truncate">
                      Step: {note.stepTitle}
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                ))}

                {allNotes.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No notes logged for this case.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
