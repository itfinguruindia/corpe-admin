import axiosInstance from "@/lib/axios";
import type {
  DocumentTemplate,
  TemplateUploadSource,
} from "@/types/documentTemplate";

export const templatesApi = {
  list: async (): Promise<DocumentTemplate[]> => {
    const response = await axiosInstance.get("/admin/document-templates");
    return (response.data?.data ?? []) as DocumentTemplate[];
  },

  upload: async (
    file: File,
    options: {
      templateName?: string;
      uploadSource: TemplateUploadSource;
      driveFileId?: string;
    },
  ): Promise<DocumentTemplate> => {
    const formData = new FormData();
    formData.append("file", file);
    if (options.templateName?.trim()) {
      formData.append("templateName", options.templateName.trim());
    }
    formData.append("uploadSource", options.uploadSource);
    if (options.driveFileId) {
      formData.append("driveFileId", options.driveFileId);
    }

    const response = await axiosInstance.post(
      "/admin/document-templates",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      },
    );
    return response.data?.data as DocumentTemplate;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/document-templates/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/admin/document-templates/${id}/download`,
      { responseType: "blob", timeout: 120000 },
    );
    return response.data as Blob;
  },
};
