export type TrackingStepStatus = "completed" | "in-progress" | "pending";

export interface TrackingUpdate {
  id: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning";
}

export interface TrackingStep {
  id: string;
  title: string;
  status: TrackingStepStatus;
  icon: string; // Icon identifier like "check", "document", "draft", "building"
  updates: TrackingUpdate[];
  completedAt?: string;
}

export interface TrackingStatus {
  applicationNo: string;
  steps: TrackingStep[];
  overallStatus: "completed" | "in-progress" | "pending";
  lastUpdatedAt: string;
}

export interface TrackingStatusResponse {
  success: boolean;
  data: TrackingStatus;
}
