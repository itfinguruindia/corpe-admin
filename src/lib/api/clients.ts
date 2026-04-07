import axiosInstance from "@/lib/axios";
import type { NameStatus } from "@/types/company";

type MoaAoaDocType = "moa" | "aoa";

type MoaAoaStatus = "open" | "clientUpload" | "TeamUpload";

// Company-level miscellaneous document slots
type CompanyMiscDocType =
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

  // Delete a client by application number
  deleteClient: async (applicationNo: string) => {
    const response = await axiosInstance.delete(
      `/admin/clients/${applicationNo}`,
    );
    return response.data;
  },

  // Update assignee for a client
  updateAssignee: async (applicationNo: string, adminId: string) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${applicationNo}/assignee`,
      { adminId },
    );
    return response.data;
  },

  // Update assigner for a client
  updateAssigner: async (applicationNo: string, adminId: string) => {
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

  // Get directors and shareholders by application number
  getDirectorAndShareHolders: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/getDirectorAndShareHolders`,
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

  // Update kycVerified / dscApplication for a director
  updateDirectorStatus: async (
    applicationNo: string,
    directorId: string,
    updates: { kycVerified?: boolean; dscApplication?: boolean },
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
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/moa-aoa/${docType}/status`,
      );
      const data = response.data?.data ?? response.data;
      const status = data?.status?.toLowerCase?.();
      return status === "uploaded" ? "uploaded" : "pending";
    } catch {
      return "pending";
    }
  },

  uploadMoaAoaDocument: async (
    applicationNo: string,
    docType: MoaAoaDocType,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("documentType", docType.toUpperCase());
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
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/moa-aoa/${docType}/download`,
      {
        responseType: "blob",
      },
    );
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

  getCompanyMiscDocuments: async (applicationNo: string) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/company-documents/misc`,
    );
    return response.data.data;
  },

  getCompanyMiscDocStatus: async (
    applicationNo: string,
    docType: CompanyMiscDocType,
  ): Promise<MiscDocStatusResult> => {
    try {
      const response = await axiosInstance.get(
        `/admin/clients/${applicationNo}/company-documents/misc/${docType}/status`,
      );
      const data = response.data?.data ?? response.data;
      const status = data?.status?.toLowerCase?.();
      return {
        status: status === "uploaded" ? "uploaded" : "pending",
        name: data?.name ?? null,
      };
    } catch {
      return { status: "pending", name: null };
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
  ) => {
    const response = await axiosInstance.get(
      `/admin/clients/${applicationNo}/company-documents/misc/${docType}/download`,
      {
        responseType: "blob",
      },
    );
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
};
