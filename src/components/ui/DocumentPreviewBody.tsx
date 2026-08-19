"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";

import { resolvePreviewKind, sniffBlobType } from "@/utils/documentPreview";

interface DocumentPreviewBodyProps {
  url: string | null;
  fileName?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Renders an image or PDF preview inside a modal.
 * Expects a blob: URL or an inline-friendly remote URL.
 */
export default function DocumentPreviewBody({
  url,
  fileName = "",
  loading = false,
  className = "",
}: DocumentPreviewBodyProps) {
  const [kind, setKind] = useState<"image" | "pdf" | "other">(
    resolvePreviewKind(fileName || url || ""),
  );

  useEffect(() => {
    const initial = resolvePreviewKind(fileName || url || "");
    if (initial !== "other") {
      setKind(initial);
      return;
    }

    if (url && url.startsWith("blob:")) {
      let isMounted = true;
      fetch(url)
        .then((r) => r.blob())
        .then(async (b) => {
          if (!isMounted) return;
          const detected = await sniffBlobType(b);
          if (detected !== "other") {
            setKind(detected);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [url, fileName]);

  if (loading) {
    return (
      <div
        className={`flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-gray-50 ${className}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">Loading preview…</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex min-h-[40vh] flex-col items-center justify-center gap-2 bg-gray-50 ${className}`}
      >
        <FileText className="h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">No preview available</p>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div
        className={`flex max-h-[75vh] min-h-[40vh] items-center justify-center overflow-auto bg-gray-100 p-4 ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={fileName || "Document preview"}
          className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
        />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className={`min-h-[70vh] overflow-hidden bg-gray-100 ${className}`}>
        <iframe
          src={`${url}#toolbar=1&navpanes=0`}
          title={fileName || "PDF preview"}
          className="h-[70vh] w-full border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center ${className}`}
    >
      <FileText className="h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-700">
        Inline preview is not available for this file type.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Open in new tab
      </a>
    </div>
  );
}
