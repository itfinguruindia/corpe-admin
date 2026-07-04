"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileText } from "lucide-react";
import { cn } from "@heroui/react";
import {
  FILE_TYPE_ACCEPT,
  MAX_TEMPLATE_FILE_SIZE_BYTES,
} from "@/lib/templates/constants";

interface TemplateFileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export default function TemplateFileDropzone({
  onFileSelected,
  disabled = false,
  className,
}: TemplateFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  const maxMb = MAX_TEMPLATE_FILE_SIZE_BYTES / (1024 * 1024);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging
          ? "border-primary-500 bg-primary-50"
          : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/40",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        handleFiles(event.dataTransfer.files);
      }}
    >
      <CloudUpload className="mb-3 h-10 w-10 text-primary-600" />
      <p className="text-sm font-medium text-gray-900">
        Drag and drop your template here
      </p>
      <p className="mt-1 text-xs text-gray-500">
        PDF, DOCX, XLSX, PPTX - max {maxMb} MB
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        <FileText className="h-4 w-4" />
        Browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={FILE_TYPE_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
