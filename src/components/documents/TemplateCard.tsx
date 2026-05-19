"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Monitor,
  Presentation,
  Trash2,
} from "lucide-react";
import { Card, Spinner } from "@heroui/react";
import { Chip } from "@/components/ui/Chip";
import { FILE_TYPE_LABELS } from "@/lib/templates/constants";
import { formatFileSize, formatUploadDate } from "@/utils/fileFromSource";
import type { DocumentTemplate } from "@/types/documentTemplate";

const FILE_TYPE_STYLES: Record<
  DocumentTemplate["fileType"],
  { bg: string; icon: typeof FileText; accent: string }
> = {
  pdf: { bg: "bg-red-50", icon: FileText, accent: "text-red-600" },
  docx: { bg: "bg-blue-50", icon: FileText, accent: "text-blue-600" },
  xlsx: { bg: "bg-green-50", icon: FileSpreadsheet, accent: "text-green-600" },
  pptx: {
    bg: "bg-orange-50",
    icon: Presentation,
    accent: "text-orange-600",
  },
};

interface TemplateCardProps {
  template: DocumentTemplate;
  busy?: boolean;
  getBlob: (template: DocumentTemplate) => Promise<Blob | null>;
  onPreview: (template: DocumentTemplate) => void;
  onDownload: (template: DocumentTemplate) => void;
  onDelete: (template: DocumentTemplate) => void;
}

export default function TemplateCard({
  template,
  busy = false,
  getBlob,
  onPreview,
  onDownload,
  onDelete,
}: TemplateCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(
    template.fileType === "pdf",
  );

  const style = FILE_TYPE_STYLES[template.fileType];
  const TypeIcon = style.icon;

  useEffect(() => {
    if (template.fileType !== "pdf") {
      setPreviewLoading(false);
      return;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      try {
        const blob = await getBlob(template);
        if (revoked || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } finally {
        if (!revoked) setPreviewLoading(false);
      }
    };

    void loadPreview();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [template, getBlob]);

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onPreview(template)}
        disabled={busy}
        className="group relative h-56 w-full shrink-0 overflow-hidden bg-gray-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label={`Preview ${template.templateName}`}
      >
        {previewLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : template.fileType === "pdf" && previewUrl ? (
          <iframe
            src={previewUrl}
            title={template.templateName}
            className="pointer-events-none h-full w-full origin-top-left scale-[1.02] border-0 bg-white"
          />
        ) : (
          <div
            className={`flex h-full flex-col items-center justify-center gap-3 ${style.bg}`}
          >
            <TypeIcon className={`h-16 w-16 ${style.accent} opacity-80`} />
            <span
              className={`text-sm font-semibold uppercase tracking-wide ${style.accent}`}
            >
              {FILE_TYPE_LABELS[template.fileType]}
            </span>
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-800 shadow">
            <Eye className="h-4 w-4" />
            View
          </span>
        </span>

        <span className="absolute left-3 top-3">
          <Chip
            label={FILE_TYPE_LABELS[template.fileType]}
            variant="gray"
            className="bg-white/95 text-xs shadow-sm backdrop-blur"
          />
        </span>
      </button>

      <Card.Content className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
            {template.templateName}
          </h3>
          <p className="truncate text-xs text-gray-500">{template.fileName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            {template.uploadSource === "drive" ? (
              <HardDrive className="h-3.5 w-3.5" />
            ) : (
              <Monitor className="h-3.5 w-3.5" />
            )}
            {template.uploadSource === "drive" ? "Google Drive" : "Local"}
          </span>
          <span aria-hidden>·</span>
          <span>{formatUploadDate(template.uploadedAt)}</span>
          <span aria-hidden>·</span>
          <span>{formatFileSize(template.sizeBytes)}</span>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => onPreview(template)}
            className="inline-flex min-w-0 flex-1 items-center justify-center rounded-lg bg-gray-600 px-3 py-2 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`View ${template.templateName}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDownload(template)}
            className="inline-flex min-w-0 flex-[2] items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4 shrink-0" />
            Download
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(template)}
            className="inline-flex min-w-0 items-center justify-center rounded-lg px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Delete ${template.templateName}`}
          >
            {busy ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </Card.Content>
    </Card>
  );
}
