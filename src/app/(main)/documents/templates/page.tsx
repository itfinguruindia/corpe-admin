"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Search, Upload, X } from "lucide-react";
import {
  EmptyState,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import DocxPreview from "@/components/documents/DocxPreview";
import TemplateCard from "@/components/documents/TemplateCard";
import TemplateCardSkeleton from "@/components/documents/TemplateCardSkeleton";
import TemplateImportModal from "@/components/documents/TemplateImportModal";
import { FILE_TYPE_LABELS } from "@/lib/templates/constants";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import useSwal from "@/utils/useSwal";
import { downloadBlob } from "@/utils/fileFromSource";
import type { DocumentTemplate } from "@/types/documentTemplate";
import { usePermissions } from "@/hooks/usePermissions";
import {
  requireDocCreate,
  requireDocDelete,
  requireDocView,
} from "@/utils/documentPermissions";
import { notifyApiError } from "@/utils/apiErrors";
import RefreshButton from "@/components/ui/RefreshButton";

const SKELETON_COUNT = 8;

const TemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<DocumentTemplate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [actionTemplateId, setActionTemplateId] = useState<string | null>(null);

  const swal = useSwal();
  const { admin } = usePermissions();
  const {
    templates,
    isLoading,
    isSubmitting,
    loadError,
    loadForbidden,
    refresh,
    importTemplate,
    removeTemplate,
    getBlob,
  } = useDocumentTemplates();

  const previewOverlay = useOverlayState({
    onOpenChange: (open) => {
      if (!open) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewBlob(null);
        setPreviewTemplate(null);
      }
    },
  });

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.templateName.toLowerCase().includes(q) ||
        t.fileName.toLowerCase().includes(q) ||
        t.fileType.toLowerCase().includes(q),
    );
  }, [templates, searchQuery]);

  const handleImport = async (
    file: File,
    options: Parameters<typeof importTemplate>[1],
  ) => {
    if (!requireDocCreate(admin)) {
      throw new Error("Permission denied");
    }
    try {
      await importTemplate(file, options);
      toast.success("Template imported successfully.");
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to import template.",
        actionLabel: "import document templates",
      });
      throw error;
    }
  };

  const handleDelete = async (template: DocumentTemplate) => {
    if (!requireDocDelete(admin)) return;
    const result = await swal({
      title: "Delete template?",
      text: `"${template.templateName}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    setActionTemplateId(template.id);
    try {
      await removeTemplate(template.id);
      toast.success("Template deleted successfully.");
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to delete template.",
        actionLabel: "delete document templates",
      });
    } finally {
      setActionTemplateId(null);
    }
  };

  const handleDownload = async (template: DocumentTemplate) => {
    if (!requireDocView(admin, "download document templates")) return;
    setActionTemplateId(template.id);
    try {
      const blob = await getBlob(template);
      if (!blob) {
        toast.danger("Template file not found in storage.");
        return;
      }
      downloadBlob(blob, template.fileName);
      toast.success("Download started.");
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to download template.",
        actionLabel: "download document templates",
      });
    } finally {
      setActionTemplateId(null);
    }
  };

  const handlePreview = async (template: DocumentTemplate) => {
    if (!requireDocView(admin, "preview document templates")) return;
    setIsPreviewLoading(true);
    setPreviewTemplate(template);
    setPreviewUrl(null);
    setPreviewBlob(null);
    previewOverlay.open();

    try {
      const blob = await getBlob(template);
      if (!blob) {
        toast.danger("Template file not found in storage.");
        previewOverlay.close();
        return;
      }

      if (template.fileType === "pdf") {
        setPreviewUrl(URL.createObjectURL(blob));
      } else if (template.fileType === "docx") {
        setPreviewBlob(blob);
      }
    } catch (error) {
      notifyApiError(error, {
        fallback: "Failed to load preview.",
        actionLabel: "view document templates",
      });
      previewOverlay.close();
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const openImport = () => {
    if (!requireDocCreate(admin)) return;
    setIsImportOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <TextField value={searchQuery} onChange={setSearchQuery} name="search">
              <Label className="sr-only">Search templates</Label>
              <Input
                type="text"
                placeholder="Search templates..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </TextField>
          </div>
          <RefreshButton
            onClick={() => void refresh()}
            isLoading={isLoading}
            ariaLabel="Refresh templates"
          />
          <button
            type="button"
            onClick={openImport}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
          >
            <Upload className="h-5 w-5" />
            Import
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        {filteredTemplates.length}{" "}
        {filteredTemplates.length === 1 ? "template" : "templates"} found
      </p>

      {loadError && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            loadForbidden
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTemplates.length === 0 && !searchQuery.trim() ? (
        <EmptyState className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 py-16 text-center">
          <FileText className="mx-auto h-14 w-14 text-gray-400" />
          <h3 className="mt-4 text-base font-medium text-gray-900">
            No templates yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Import your first PDF, DOCX, XLSX, or PPTX template from your
            computer or Google Drive.
          </p>
          <button
            type="button"
            onClick={openImport}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Upload className="h-4 w-4" />
            Import template
          </button>
        </EmptyState>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query
          </p>
        </EmptyState>
      ) : (
        <div
          id="templates-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              busy={actionTemplateId === template.id}
              getBlob={getBlob}
              onPreview={(t) => void handlePreview(t)}
              onDownload={(t) => void handleDownload(t)}
              onDelete={(t) => void handleDelete(t)}
            />
          ))}
        </div>
      )}

      {isImportOpen && (
        <TemplateImportModal
          isOpen={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImport={handleImport}
          onError={(message) => toast.danger(message)}
          isSubmitting={isSubmitting}
        />
      )}

      {previewTemplate && (
      <Modal state={previewOverlay}>
        <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
          <Modal.Container placement="center" className="p-4">
            <Modal.Dialog className="flex h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-2xl outline-none">
              <Modal.Header className="flex shrink-0 items-center justify-between border-b border-gray-200 p-4">
                <div className="flex min-w-0 items-center gap-2 pr-2">
                  <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                  <Modal.Heading className="truncate text-lg font-semibold text-gray-900">
                    {previewTemplate?.templateName}
                  </Modal.Heading>
                </div>
                <Modal.CloseTrigger
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </Modal.CloseTrigger>
              </Modal.Header>

              <Modal.Body className="min-h-0 flex-1 overflow-hidden bg-gray-100 p-0">
                {isPreviewLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : previewTemplate?.fileType === "pdf" && previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title={previewTemplate.templateName}
                    className="h-full w-full border-0"
                  />
                ) : previewTemplate?.fileType === "docx" && previewBlob ? (
                  <DocxPreview
                    blob={previewBlob}
                    title={previewTemplate.templateName}
                    className="h-full"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="text-sm font-medium text-gray-800">
                      Inline preview is available for PDF and DOCX files.
                    </p>
                    <p className="text-xs text-gray-500">
                      {previewTemplate?.fileType
                        ? `${FILE_TYPE_LABELS[previewTemplate.fileType]} files can be downloaded and opened on your computer.`
                        : "Use Download to open this template."}
                    </p>
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer className="flex shrink-0 justify-end gap-3 border-t border-gray-200 p-4">
                <button
                  type="button"
                  onClick={() => previewOverlay.close()}
                  className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleDownload(previewTemplate);
                    previewOverlay.close();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-5 w-5" />
                  Download
                </button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
      )}
    </div>
  );
};

export default TemplatesPage;
