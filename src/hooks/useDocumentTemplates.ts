"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addTemplate,
  deleteTemplate,
  getTemplateFileBlob,
  listTemplates,
} from "@/lib/templates/templateStore";
import type {
  DocumentTemplate,
  TemplateUploadSource,
} from "@/types/documentTemplate";
import {
  getApiErrorMessage,
  isPermissionDenied,
} from "@/utils/apiErrors";

export function useDocumentTemplates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadForbidden, setLoadForbidden] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setLoadForbidden(false);
    try {
      const data = await listTemplates();
      setTemplates(data);
    } catch (error) {
      const forbidden = isPermissionDenied(error);
      setLoadForbidden(forbidden);
      setLoadError(
        getApiErrorMessage(error, {
          fallback: "Failed to load document templates.",
          actionLabel: forbidden ? "view document templates" : undefined,
        }),
      );
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const importTemplate = useCallback(
    async (
      file: File,
      options: {
        templateName?: string;
        uploadSource: TemplateUploadSource;
        driveFileId?: string;
      },
    ) => {
      setIsSubmitting(true);
      try {
        const created = await addTemplate({
          file,
          templateName: options.templateName,
          uploadSource: options.uploadSource,
          driveFileId: options.driveFileId,
        });
        setTemplates((prev) => [created, ...prev]);
        return created;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const removeTemplate = useCallback(async (id: string) => {
    await deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getBlob = useCallback(async (template: DocumentTemplate) => {
    return getTemplateFileBlob(template);
  }, []);

  return {
    templates,
    isLoading,
    isSubmitting,
    loadError,
    loadForbidden,
    refresh,
    importTemplate,
    removeTemplate,
    getBlob,
  };
}
