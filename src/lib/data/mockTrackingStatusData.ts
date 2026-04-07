import { TrackingStatus } from "@/types/trackingStatus";

// Mock data for tracking status
const mockTrackingData: Record<string, TrackingStatus> = {
  GUJC000001: {
    applicationNo: "GUJC000001",
    overallStatus: "in-progress",
    lastUpdatedAt: "2024-02-07T10:30:00Z",
    steps: [
      {
        id: "1",
        title: "Name Approval",
        status: "completed",
        icon: "check",
        completedAt: "2024-02-01T14:30:00Z",
        updates: [
          {
            id: "u1",
            message: "Name approval application submitted",
            timestamp: "2024-01-28T09:00:00Z",
            type: "info",
          },
          {
            id: "u2",
            message: "Name approved by RoC",
            timestamp: "2024-02-01T14:30:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "2",
        title: "Documents and information for business incorporation",
        status: "in-progress",
        icon: "document",
        updates: [
          {
            id: "u3",
            message: "Document collection in progress",
            timestamp: "2024-02-02T10:00:00Z",
            type: "info",
          },
          {
            id: "u4",
            message: "Awaiting director KYC documents",
            timestamp: "2024-02-05T11:20:00Z",
            type: "warning",
          },
          {
            id: "u5",
            message: "MOA and AOA prepared",
            timestamp: "2024-02-07T10:30:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "3",
        title: "MoA and AoA Drafting",
        status: "pending",
        icon: "draft",
        updates: [],
      },
      {
        id: "4",
        title: "Business Incorporated",
        status: "pending",
        icon: "building",
        updates: [],
      },
    ],
  },
  GUJC00001: {
    applicationNo: "GUJC00001",
    overallStatus: "completed",
    lastUpdatedAt: "2024-01-25T16:45:00Z",
    steps: [
      {
        id: "1",
        title: "Name Approval",
        status: "completed",
        icon: "check",
        completedAt: "2024-01-10T14:30:00Z",
        updates: [
          {
            id: "u1",
            message: "Name approved successfully",
            timestamp: "2024-01-10T14:30:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "2",
        title: "Documents and information for business incorporation",
        status: "completed",
        icon: "document",
        completedAt: "2024-01-15T16:20:00Z",
        updates: [
          {
            id: "u2",
            message: "All documents collected and verified",
            timestamp: "2024-01-15T16:20:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "3",
        title: "MoA and AoA Drafting",
        status: "completed",
        icon: "draft",
        completedAt: "2024-01-20T12:00:00Z",
        updates: [
          {
            id: "u3",
            message: "MoA and AoA drafted and approved",
            timestamp: "2024-01-20T12:00:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "4",
        title: "Business Incorporated",
        status: "completed",
        icon: "building",
        completedAt: "2024-01-25T16:45:00Z",
        updates: [
          {
            id: "u4",
            message: "Certificate of Incorporation issued",
            timestamp: "2024-01-25T16:45:00Z",
            type: "success",
          },
        ],
      },
    ],
  },
  RAJC00002: {
    applicationNo: "RAJC00002",
    overallStatus: "pending",
    lastUpdatedAt: "2024-02-05T08:00:00Z",
    steps: [
      {
        id: "1",
        title: "Name Approval",
        status: "in-progress",
        icon: "check",
        updates: [
          {
            id: "u1",
            message: "Name approval application submitted to RoC",
            timestamp: "2024-02-05T08:00:00Z",
            type: "info",
          },
        ],
      },
      {
        id: "2",
        title: "Documents and information for business incorporation",
        status: "pending",
        icon: "document",
        updates: [],
      },
      {
        id: "3",
        title: "MoA and AoA Drafting",
        status: "pending",
        icon: "draft",
        updates: [],
      },
      {
        id: "4",
        title: "Business Incorporated",
        status: "pending",
        icon: "building",
        updates: [],
      },
    ],
  },
  BHIC00001: {
    applicationNo: "BHIC00001",
    overallStatus: "in-progress",
    lastUpdatedAt: "2024-02-06T15:30:00Z",
    steps: [
      {
        id: "1",
        title: "Name Approval",
        status: "completed",
        icon: "check",
        completedAt: "2024-02-03T11:00:00Z",
        updates: [
          {
            id: "u1",
            message: "Name approved",
            timestamp: "2024-02-03T11:00:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "2",
        title: "Documents and information for business incorporation",
        status: "completed",
        icon: "document",
        completedAt: "2024-02-05T14:00:00Z",
        updates: [
          {
            id: "u2",
            message: "Documents verified",
            timestamp: "2024-02-05T14:00:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "3",
        title: "MoA and AoA Drafting",
        status: "in-progress",
        icon: "draft",
        updates: [
          {
            id: "u3",
            message: "Drafting in progress",
            timestamp: "2024-02-06T15:30:00Z",
            type: "info",
          },
        ],
      },
      {
        id: "4",
        title: "Business Incorporated",
        status: "pending",
        icon: "building",
        updates: [],
      },
    ],
  },
  DLEC00001: {
    applicationNo: "DLEC00001",
    overallStatus: "in-progress",
    lastUpdatedAt: "2024-02-07T09:15:00Z",
    steps: [
      {
        id: "1",
        title: "Name Approval",
        status: "completed",
        icon: "check",
        completedAt: "2024-02-04T10:30:00Z",
        updates: [
          {
            id: "u1",
            message: "Name approval completed",
            timestamp: "2024-02-04T10:30:00Z",
            type: "success",
          },
        ],
      },
      {
        id: "2",
        title: "Documents and information for business incorporation",
        status: "in-progress",
        icon: "document",
        updates: [
          {
            id: "u2",
            message: "Document verification in progress",
            timestamp: "2024-02-07T09:15:00Z",
            type: "info",
          },
        ],
      },
      {
        id: "3",
        title: "MoA and AoA Drafting",
        status: "pending",
        icon: "draft",
        updates: [],
      },
      {
        id: "4",
        title: "Business Incorporated",
        status: "pending",
        icon: "building",
        updates: [],
      },
    ],
  },
};

// Fetch tracking status for an application
export async function fetchTrackingStatus(
  applicationNo: string,
): Promise<TrackingStatus> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/tracking-status/${applicationNo}`);
  // return response.json();

  return new Promise((resolve) => {
    setTimeout(() => {
      const data =
        mockTrackingData[applicationNo] || mockTrackingData["GUJC000001"];
      resolve(data);
    }, 500);
  });
}

// Update tracking status (for admin/system use)
export async function updateTrackingStep(
  applicationNo: string,
  stepId: string,
  status: "completed" | "in-progress" | "pending",
  updateMessage?: string,
): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/tracking-status/${applicationNo}/steps/${stepId}`, {
  //   method: 'PUT',
  //   body: JSON.stringify({ status, updateMessage })
  // });

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        `Updated step ${stepId} to ${status} for ${applicationNo}`,
        updateMessage,
      );
      resolve();
    }, 300);
  });
}
