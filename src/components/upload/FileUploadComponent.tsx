"use client";

import { useCallback, useState, type ReactNode } from "react";
import { toast } from "@heroui/react";
import FileUploadPickerModal from "@/components/upload/FileUploadPickerModal";
import type {
  FileUploadContext,
  FileUploadSelectMeta,
  FileValidator,
} from "@/lib/upload/types";

export interface FileUploadComponentProps {
  /** Called with the selected file; parent owns upload/API logic */
  onFileSelect: (file: File, meta?: FileUploadSelectMeta) => void | Promise<void>;
  allowedFileTypes?: string;
  multiple?: boolean;
  context?: FileUploadContext;
  disabled?: boolean;
  title?: string;
  subtitle?: string;
  dropLabel?: string;
  enableDrive?: boolean;
  enableExistingDocuments?: boolean;
  maxSizeBytes?: number;
  validateFile?: FileValidator;
  onError?: (message: string) => void;
  /** Renders the trigger control (e.g. existing Upload icon) */
  renderTrigger: (openPicker: () => void) => ReactNode;
}

export default function FileUploadComponent({
  onFileSelect,
  allowedFileTypes,
  multiple = false,
  context = "general",
  disabled = false,
  title,
  subtitle,
  dropLabel,
  enableDrive = true,
  enableExistingDocuments = true,
  maxSizeBytes,
  validateFile,
  onError,
  renderTrigger,
}: FileUploadComponentProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleError = useCallback(
    (message: string) => {
      if (onError) {
        onError(message);
        return;
      }
      toast(message, { variant: "danger" });
    },
    [onError],
  );

  const openPicker = useCallback(() => {
    if (disabled) return;
    setIsPickerOpen(true);
  }, [disabled]);

  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File, meta: FileUploadSelectMeta) => {
      await onFileSelect(file, meta);
    },
    [onFileSelect],
  );

  const modalTitle =
    title ??
    (context === "clients"
      ? "Upload file"
      : context === "templates"
        ? "Import Template"
        : "Upload file");

  const defaultSubtitle =
    context === "clients"
      ? "Upload from your computer, Google Drive, or existing documents."
      : "Upload from your computer or import from Google Drive.";

  return (
    <>
      {renderTrigger(openPicker)}

      {isPickerOpen ? (
        <FileUploadPickerModal
          onClose={closePicker}
          title={modalTitle}
          subtitle={subtitle ?? defaultSubtitle}
          dropLabel={dropLabel}
          allowedFileTypes={allowedFileTypes}
          multiple={multiple}
          enableDrive={enableDrive}
          enableExistingDocuments={enableExistingDocuments}
          maxSizeBytes={maxSizeBytes}
          validateFile={validateFile}
          onFileSelect={(file, meta) => {
            void handleFileSelect(file, meta);
          }}
          onError={handleError}
        />
      ) : null}
    </>
  );
}
