import axiosInstance from "@/lib/axios";
import type { NameStatus } from "@/types/company";

export type MoaAoaDocType = "moa" | "aoa";

type MoaAoaStatus = "open" | "clientUpload" | "TeamUpload";

// Company-level miscellaneous document slots
export type CompanyMiscDocType =
  | "miscellaneous"
  | "miscellaneous1"
  | "miscellaneous2"
  | "miscellaneous3";

type MiscDocStatusResult = {
  status: "uploaded" | "pending";
  name?: string | null;
};

// Clients API endpoints
export const clientsApi = {
  // Get all clients with pagination
  getAllClients: async (
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>,
  ) => {
    // Flatten filters for query params
    const params: Record<string, any> = { page, limit };
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // For nested objects, flatten boolean filters (status, entityType, dateRange)
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === "boolean" && subValue) {
              params[`${key}[${subKey}]`] = true;
            } else if (
              subKey === "selected" &&
              Array.isArray(subValue) &&
              subValue.length > 0
            ) {
              // Multi-select filter (assignee / assigner) — join all selected IDs
              const ids = (subValue as { id: string }[])
                .map((item) => item.id)
                .filter(Boolean)
                .join(",");
              if (ids) params[key] = ids;
            }
          });
        } else if (typeof value === "string" && value) {
          params[key] = value;
        }
      });
    }
    const response = await axiosInstance.get("/admin/clients", {
      params,
    });
    return response.data.data;
  },

  // Get lightweight payment status
  getPaymentStatus: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/payment-status`,
    );
    return response.data?.data ?? response.data;
  },

  // Delete a client by application number
  deleteClient: async (applicationNo: string) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}`,
    );
    return response.data;
  },

  // Update assignee for a client (pass null to unassign)
  updateAssignee: async (applicationNo: string, adminId: string | null) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/assignee`,
      { adminId },
    );
    return response.data;
  },

  // Update assigner for a client (pass null to unassign)
  updateAssigner: async (applicationNo: string, adminId: string | null) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/assigner`,
      { adminId },
    );
    return response.data;
  },

  // Get company overview by application number
  getCompanyOverview: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/getCompanyOverview`,
    );
    return response.data;
  },

  // Get corporate structure step data (registered office, proofs, directors/shareholders summary)
  getCorporateStructure: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/corporate-structure`,
    );
    return response.data?.data ?? response.data;
  },

  // Get directors and shareholders by application number
  getDirectorAndShareHolders: async (applicationNo: string, includeDraft: boolean = true) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/getDirectorAndShareHolders`,
      { params: { includeDraft } },
    );
    return response.data;
  },

  // Get name application by application number
  getNameApplication: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/getNameApplication`,
    );
    return response.data;
  },

  // Toggle resubmitOriginal for name application
  toggleResubmitOriginal: async (applicationNo: string, resubmitOriginal: boolean) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/name-application/resubmit-original`,
      { resubmitOriginal },
    );
    return response.data;
  },

  // Update company status
  updateCompanyStatus: async (
    applicationNo: string,
    companyIndex: number,
    status: NameStatus,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/company/${companyIndex}/status`,
      { status },
    );
    return response.data;
  },

  // Update company comment
  updateCompanyComment: async (
    applicationNo: string,
    companyIndex: number,
    comment: string,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/company/${companyIndex}/comment`,
      { comment },
    );
    return response.data;
  },

  // Update company MCA approval
  updateCompanyMcaApproval: async (
    applicationNo: string,
    companyIndex: number,
    mcaApproval: string,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/company/${companyIndex}/mca-approval`,
      { mcaApproval },
    );
    return response.data;
  },

  // Update company Trade conflict
  updateCompanyTradeConflict: async (
    applicationNo: string,
    companyIndex: number,
    tradeConflict: string,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/company/${companyIndex}/trade-conflict`,
      { tradeConflict },
    );
    return response.data;
  },

  // Update kycVerified / dscApplication / dinStatus for a director
  updateDirectorStatus: async (
    applicationNo: string,
    directorId: string,
    updates: { kycVerified?: boolean; dscApplication?: boolean; dinStatus?: string },
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/directors/${directorId}/status`,
      updates,
    );
    return response.data;
  },

  // Update kycVerified / dscApplication for a shareholder
  updateShareholderStatus: async (
    applicationNo: string,
    shareholderId: string,
    updates: { kycVerified?: boolean; dscApplication?: boolean },
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/shareholders/${shareholderId}/status`,
      updates,
    );
    return response.data;
  },

  // Update areAllDocsVerified for a client
  updateAllDocsVerified: async (
    applicationNo: string,
    areAllDocsVerified: boolean,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/all-docs-verified`,
      { areAllDocsVerified },
    );
    return response.data;
  },

  // Get director by ID
  getDirectorById: async (applicationNo: string, directorId: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/directors/${directorId}`,
    );
    return response.data.data;
  },

  // Get shareholder by ID
  getShareholderById: async (applicationNo: string, directorId: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/shareholders/${directorId}`,
    );
    return response.data.data;
  },

  // Get director documents by director ID
  getDirectorDocuments: async (applicationNo: string, directorId: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/directors/${directorId}/documents`,
    );
    return response.data.data;
  },

  // Get shareholder documents by director ID
  getShareholderDocuments: async (
    applicationNo: string,
    directorId: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/shareholders/${directorId}/documents`,
    );
    return response.data.data;
  },

  // Get MOA & AOA details for an application
  getMoaAoaDocuments: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/moa-aoa`,
    );
    return response.data.data;
  },

  getMoaAoaDocStatus: async (
    applicationNo: string,
    docType: MoaAoaDocType,
  ): Promise<"uploaded" | "pending"> => {
    const result = await clientsApi.getMoaAoaDocFilesStatus(
      applicationNo,
      docType,
    );
    return result.status;
  },

  getMoaAoaDocFilesStatus: async (
    applicationNo: string,
    docType: MoaAoaDocType,
  ): Promise<{
    status: "uploaded" | "pending";
    adminFile: { name: string; path: string } | null;
    clientFile: { name: string; path: string; uploadedAt?: string } | null;
  }> => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/moa-aoa/${docType}/status`,
      );
      const data = response.data?.data ?? response.data;
      const status = data?.status?.toLowerCase?.();
      return {
        status: status === "uploaded" ? "uploaded" : "pending",
        adminFile: data?.adminFile ?? null,
        clientFile: data?.clientFile ?? null,
      };
    } catch {
      return { status: "pending", adminFile: null, clientFile: null };
    }
  },

  uploadMoaAoaDocument: async (
    applicationNo: string,
    docType: MoaAoaDocType,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("documentType", docType);
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/moa-aoa`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data?.data ?? response.data;
  },

  // Update MOA/AOA workflow status
  updateMoaAoaStatus: async (
    applicationNo: string,
    docType: MoaAoaDocType,
    status: MoaAoaStatus,
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/moa-aoa/${docType}/status`,
      { status },
    );
    return response.data.data;
  },

  // Download MOA/AOA document as a Blob
  downloadMoaAoaDocument: async (
    applicationNo: string,
    docType: MoaAoaDocType,
    source?: "admin" | "client",
  ) => {
    const url = source
      ? `/admin/clients/${applicationNo}/moa-aoa/${docType}/download?source=${source}`
      : `/admin/clients/${applicationNo}/moa-aoa/${docType}/download`;

    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  // Object Clause methods
  getObjectClauseStatus: async (applicationNo: string) => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/object-clause/status`,
      );
      return response.data?.data ?? response.data;
    } catch {
      return { status: "pending", adminFile: null, clientFile: null };
    }
  },

  uploadObjectClauseDocument: async (applicationNo: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/object-clause`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data?.data ?? response.data;
  },

  downloadObjectClauseDocument: async (
    applicationNo: string,
    source?: "admin" | "client",
  ) => {
    const url = source
      ? `/admin/clients/${applicationNo}/object-clause/download?source=${source}`
      : `/admin/clients/${applicationNo}/object-clause/download`;

    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  getMcaQueryStatus: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/mca-query/status`,
    );
    return response.data?.data ?? response.data;
  },

  updateMcaQueryText: async (applicationNo: string, text: string) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/mca-query/text`,
      { text },
    );
    return response.data?.data ?? response.data;
  },

  uploadMcaQueryFile: async (applicationNo: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/mca-query/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data?.data ?? response.data;
  },

  deleteMcaQueryFile: async (applicationNo: string, filePath: string) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/mca-query/files?filePath=${encodeURIComponent(filePath)}`,
    );
    return response.data?.data ?? response.data;
  },

  downloadMcaClarificationFile: async (
    applicationNo: string,
    source: "mca" | "client",
    filePath: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/mca-query/download?source=${source}&filePath=${encodeURIComponent(filePath)}`,
      { responseType: "blob" },
    );
    return response.data as Blob;
  },

  getCompanyMiscDocuments: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/company-documents/misc`,
    );
    return response.data.data;
  },

  getCompanyMiscDocStatus: async (
    applicationNo: string,
    docType: CompanyMiscDocType,
  ): Promise<
    MiscDocStatusResult & {
      adminFile: { name: string; path: string } | null;
      clientFile: { name: string; path: string; uploadedAt?: string } | null;
    }
  > => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/company-documents/misc/${docType}/status`,
      );
      const data = response.data?.data ?? response.data;
      const status = data?.status?.toLowerCase?.();
      return {
        status: status === "uploaded" ? "uploaded" : "pending",
        name: data?.name ?? null,
        adminFile: data?.adminFile ?? null,
        clientFile: data?.clientFile ?? null,
      };
    } catch {
      return {
        status: "pending",
        name: null,
        adminFile: null,
        clientFile: null,
      };
    }
  },

  uploadCompanyMiscDocument: async (
    applicationNo: string,
    docType: CompanyMiscDocType,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/company-documents/misc/${docType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data?.data ?? response.data;
  },

  downloadCompanyMiscDocument: async (
    applicationNo: string,
    docType: CompanyMiscDocType,
    source?: "admin" | "client",
  ) => {
    const url = source
      ? `/admin/clients/${applicationNo}/company-documents/misc/${docType}/download?source=${source}`
      : `/admin/clients/${applicationNo}/company-documents/misc/${docType}/download`;

    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  // INC-9 Shareholder admin-upload flow
  getInc9ShareholderDocStatus: async (
    applicationNo: string,
    shareholderId: string,
  ): Promise<{
    adminFile: { name: string; path: string } | null;
    clientFile: { name: string; path: string; uploadedAt?: string } | null;
  }> => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/inc9-shareholder/${shareholderId}/status`,
      );
      const data = response.data?.data ?? response.data;

      // Check if backend returns adminFile and clientFile directly
      if (data?.adminFile || data?.clientFile) {
        return {
          adminFile: data?.adminFile || null,
          clientFile: data?.clientFile || null,
        };
      }

      // Legacy format: single file with status
      // If status is "uploaded" and there's a name/path, treat it as admin file
      if (data?.status === "uploaded" && data?.name && data?.path) {
        return {
          adminFile: {
            name: data.name,
            path: data.path,
          },
          clientFile: null,
        };
      }

      return { adminFile: null, clientFile: null };
    } catch {
      return { adminFile: null, clientFile: null };
    }
  },

  uploadInc9ShareholderDocument: async (
    applicationNo: string,
    shareholderId: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/inc9-shareholder/${shareholderId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data?.data ?? response.data;
  },

  downloadInc9ShareholderDocument: async (
    applicationNo: string,
    shareholderId: string,
    source?: "admin" | "client",
  ) => {
    const queryParam = source ? `?source=${source}` : "";
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/inc9-shareholder/${shareholderId}/download${queryParam}`,
      {
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  deleteInc9ShareholderDocument: async (
    applicationNo: string,
    shareholderId: string,
    source: "admin" | "client",
  ) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/inc9-shareholder/${shareholderId}?source=${source}`,
    );
    return response.data?.data ?? response.data;
  },

  // Director document admin-upload flow (dir2, inc9Director, noPanDeclaration, miscellaneous1/2/3)
  getDirectorDocStatus: async (
    applicationNo: string,
    directorId: string,
    docType: string,
  ): Promise<{
    adminFile: { name: string; path: string } | null;
    clientFile: { name: string; path: string; uploadedAt?: string } | null;
  }> => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/directors/${directorId}/documents/${docType}/status`,
      );
      const data = response.data?.data ?? response.data;

      // Backend returns adminFile and clientFile directly
      if (data?.adminFile || data?.clientFile) {
        return {
          adminFile: data?.adminFile || null,
          clientFile: data?.clientFile || null,
        };
      }

      return { adminFile: null, clientFile: null };
    } catch {
      return { adminFile: null, clientFile: null };
    }
  },

  uploadDirectorDocument: async (
    applicationNo: string,
    directorId: string,
    docType: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/directors/${directorId}/documents/${docType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data?.data ?? response.data;
  },

  downloadDirectorDocument: async (
    applicationNo: string,
    directorId: string,
    docType: string,
    source?: "admin" | "client",
  ) => {
    const queryParam = source ? `?source=${source}` : "";
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/directors/${directorId}/documents/${docType}/download${queryParam}`,
      {
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  deleteDirectorDocument: async (
    applicationNo: string,
    directorId: string,
    docType: string,
    source: "admin" | "client",
  ) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/directors/${directorId}/documents/${docType}?source=${source}`,
    );
    return response.data?.data ?? response.data;
  },

  // Get company registration data (CIN, companyStatus, and files: PAN, TAN, COI)
  getRegistrationData: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/registration-data`,
    );
    return response.data?.data ?? response.data;
  },

  // Update CIN and Company Status
  updateCinAndStatus: async (
    applicationNo: string,
    cin: string,
    companyStatus: string,
  ) => {
    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/registration-data/cin-status`,
      { cin, companyStatus },
    );
    return response.data;
  },

  // Upload registration document (docType can be "pan", "tan", "coi")
  uploadRegistrationDocument: async (
    applicationNo: string,
    docType: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/registration-data/upload/${docType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data?.data ?? response.data;
  },

  // Download registration document
  downloadRegistrationDocument: async (
    applicationNo: string,
    docType: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/registration-data/download/${docType}`,
      {
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  // Download corporate structure document
  downloadCorporateStructureDocument: async (
    applicationNo: string,
    docType: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/corporate-structure/download/${docType}`,
      {
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  // Upload corporate structure document
  uploadCorporateStructureDocument: async (
    applicationNo: string,
    docType: string,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("proof", file);

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/corporate-structure/upload/${docType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data?.data ?? response.data;
  },

  // Delete corporate structure document
  deleteCorporateStructureDocument: async (
    applicationNo: string,
    docType: string,
  ) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/corporate-structure/delete/${docType}`,
    );
    return response.data?.data ?? response.data;
  },

  // Get tracking status by appNo
  getTrackingStatus: async (applicationNo: string) => {
    const response = await axiosInstance.get(`/admin/tracker/app/${applicationNo}`);
    return response.data?.data ?? response.data;
  },
  
  // Update step status
  updateStepStatus: async (
    orgId: string,
    stageId: string,
    sectionId: string,
    stepId: string,
    status: string
  ) => {
    const response = await axiosInstance.put(`/admin/tracker/${orgId}/step/status`, {
      stageId,
      sectionId,
      stepId,
      status
    });
    return response.data?.data ?? response.data;
  },

  // Add note to a step
  addNoteToStep: async (orgId: string, stepId: string, text: string) => {
    const response = await axiosInstance.post(`/admin/tracker/${orgId}/step/note`, {
      stepId,
      text
    });
    return response.data?.data ?? response.data;
  },

  // Initialize tracker
  initializeTracker: async (orgId: string) => {
    const response = await axiosInstance.post(`/admin/tracker/${orgId}/initialize`);
    return response.data?.data ?? response.data;
  },

  getGlobalComments: async (applicationNo: string, area?: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/global-comments`,
      { params: area && area !== "all" ? { area } : {} },
    );
    return response.data?.data ?? response.data;
  },

  createGlobalComment: async (
    applicationNo: string,
    payload: { content: string; area: string; files?: File[] },
  ) => {
    const formData = new FormData();
    formData.append("content", payload.content);
    formData.append("area", payload.area);
    (payload.files || []).forEach((file) => formData.append("file", file));

    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/global-comments`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data?.data ?? response.data;
  },

  deleteGlobalComment: async (applicationNo: string, commentId: string) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/global-comments/${commentId}`,
    );
    return response.data;
  },

  downloadGlobalCommentFile: async (
    applicationNo: string,
    commentId: string,
    filePath: string,
    fileName: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/global-comments/download`,
      {
        params: { commentId, filePath },
        responseType: "blob",
      },
    );
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  },

  getGlobalCommentFileBlob: async (
    applicationNo: string,
    commentId: string,
    filePath: string,
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/global-comments/download`,
      {
        params: { commentId, filePath },
        responseType: "blob",
      },
    );
    return response.data as Blob;
  },

  listDocumentIssues: async (
    applicationNo: string,
    status?: "open" | "resolved",
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/document-issues`,
      { params: status ? { status } : undefined },
    );
    return response.data?.data?.issues ?? response.data?.issues ?? [];
  },

  createDocumentIssue: async (
    applicationNo: string,
    payload: {
      entityType: string;
      entityId: string;
      entityLabel?: string;
      fieldKey: string;
      documentLabel: string;
      clientRoute: string;
      comment: string;
    },
  ) => {
    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/document-issues`,
      payload,
    );
    return response.data?.data ?? response.data;
  },

  resolveDocumentIssue: async (applicationNo: string, issueId: string) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/document-issues/${issueId}/resolve`,
    );
    return response.data?.data ?? response.data;
  },

  deleteDocumentIssue: async (applicationNo: string, issueId: string) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}/document-issues/${issueId}`,
    );
    return response.data?.data ?? response.data;
  },

  getNameExtensionStatus: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/name-extension/status`
    );
    return response.data;
  },

  sendNameExtensionPaymentLink: async (
    applicationNo: string,
    notificationType?: string,
    reason?: string
  ) => {
    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/name-extension/send-payment-link`,
      { notificationType, reason }
    );
    return response.data;
  },

  requestNameExtensionRestart: async (applicationNo: string) => {
    const response = await axiosInstance.post(
      `/admin/clients/${applicationNo}/name-extension/request-restart`
    );
    return response.data;
  },
};
