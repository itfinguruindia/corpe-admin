"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TrackingStatus as TrackingStatusType } from "@/types/trackingStatus";
import { fetchTrackingStatus } from "@/lib/data/mockTrackingStatusData";
import { Check, FileText, Edit3, Building2, Clock } from "lucide-react";

export default function TrackingStatusPage() {
  const { appNo } = useParams();
  const [trackingData, setTrackingData] = useState<TrackingStatusType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call when available
        const data = await fetchTrackingStatus(appNo as string);
        setTrackingData(data);
      } catch (error) {
        console.error("Error fetching tracking status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (appNo) {
      loadData();
    }
  }, [appNo]);

  const toggleStepUpdates = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (iconType: string) => {
    const iconProps = { className: "w-6 h-6" };

    switch (iconType) {
      case "check":
        return <Check {...iconProps} />;
      case "document":
        return <FileText {...iconProps} />;
      case "draft":
        return <Edit3 {...iconProps} />;
      case "building":
        return <Building2 {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getStepColorClasses = (status: string, isAllCompleted: boolean) => {
    // If all steps are completed, everything should be green
    if (isAllCompleted) {
      return {
        bg: "bg-green-500",
        text: "text-green-700",
        border: "border-green-500",
        line: "bg-green-500",
      };
    }

    // Otherwise, use status-based colors
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-500",
          text: "text-green-700",
          border: "border-green-500",
          line: "bg-green-500",
        };
      case "in-progress":
        return {
          bg: "bg-[#F46A45]",
          text: "text-primary",
          border: "border-[#F46A45]",
          line: "bg-gray-300",
        };
      case "pending":
        return {
          bg: "bg-gray-300",
          text: "text-gray-400",
          border: "border-gray-300",
          line: "bg-gray-300",
        };
      default:
        return {
          bg: "bg-gray-300",
          text: "text-gray-400",
          border: "border-gray-300",
          line: "bg-gray-300",
        };
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">No tracking data found</div>
      </div>
    );
  }

  const isAllCompleted = trackingData.overallStatus === "completed";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-6">{appNo}</h1>

        {/* Tracking Status Tab */}
        <div className="mb-6">
          {/* Card */}
          <div
            className="
      mt-4
      rounded-xl px-6 py-4 text-center text-[20px] font-normal max-w-xs
      text-secondary
      shadow-sm cursor-pointer transition-all duration-300
      ring-1 ring-orange-200
      bg-[linear-gradient(114.98deg,rgba(255,255,255,0)_43.6%,#F36541_133.03%)]
      hover:bg-[linear-gradient(114.98deg,rgba(255,255,255,0)_20%,#F36541_100%)]
    "
          >
            Tracking Status
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Overall Status Banner */}
          {isAllCompleted && (
            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-lg font-semibold text-green-700">
                    Process Completed!
                  </p>
                  <p className="text-sm text-green-600">
                    All steps have been successfully completed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {trackingData.steps.map((step, index) => {
              const colors = getStepColorClasses(step.status, isAllCompleted);
              const isExpanded = expandedSteps.has(step.id);
              const hasUpdates = step.updates.length > 0;

              return (
                <div key={step.id} className="relative flex gap-6 pb-10">
                  {/* Timeline Line */}
                  {index < trackingData.steps.length - 1 && (
                    <div
                      className={`absolute left-[22px] top-[48px] w-0.5 h-[calc(100%-48px)] ${colors.line}`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-white shadow-md`}
                    >
                      {getStepIcon(step.icon)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isAllCompleted
                            ? "bg-green-100 text-green-700"
                            : step.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : step.status === "in-progress"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isAllCompleted
                          ? "Completed"
                          : step.status === "completed"
                            ? "Completed"
                            : step.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                      </span>
                      {step.completedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDateTime(step.completedAt)}
                        </span>
                      )}
                    </div>

                    {/* Updates Toggle */}
                    {hasUpdates && (
                      <button
                        onClick={() => toggleStepUpdates(step.id)}
                        className="text-sm text-secondary hover:text-[#2d4d84] font-medium transition-colors"
                      >
                        {isExpanded ? "Hide Updates" : "View Updates"} (
                        {step.updates.length})
                      </button>
                    )}

                    {/* Updates List */}
                    {isExpanded && hasUpdates && (
                      <div className="mt-4 space-y-3 bg-gray-50 rounded-lg p-4">
                        {step.updates.map((update) => (
                          <div
                            key={update.id}
                            className="flex items-start gap-3"
                          >
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                update.type === "success"
                                  ? "bg-green-500"
                                  : update.type === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                {update.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDateTime(update.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Updates Message */}
                    {!hasUpdates && step.status === "pending" && (
                      <p className="text-sm text-gray-400 italic">
                        No updates yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
