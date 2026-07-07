"use client";

import { useCallback, useState } from "react";
import { CloudUpload } from "lucide-react";
import {
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { FileUploadComponent } from "@/components/upload";
import {
  FILE_TYPE_ACCEPT,
  MAX_TEMPLATE_FILE_SIZE_BYTES,
} from "@/lib/templates/constants";
import { validateTemplateFile } from "@/lib/templates/templateValidation";
import type { TemplateUploadSource } from "@/types/documentTemplate";

interface TemplateImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    file: File,
    options: {
      templateName?: string;
      uploadSource: TemplateUploadSource;
      driveFileId?: string;
    },
  ) => Promise<void>;
  onError?: (message: string) => void;
  isSubmitting?: boolean;
}

export default function TemplateImportModal({
  isOpen,
  onOpenChange,
  onImport,
  onError,
  isSubmitting = false,
}: TemplateImportModalProps) {
  const [templateName, setTemplateName] = useState("");

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) {
        setTemplateName("");
        onOpenChange(false);
        return;
      }
      onOpenChange(true);
    },
  });

  const reportError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Import failed. Please try again.";
      if (message.toLowerCase().includes("cancelled")) return;
      onError?.(message);
    },
    [onError],
  );

  const processFile = useCallback(
    async (
      file: File,
      uploadSource: TemplateUploadSource,
      driveFileId?: string,
    ) => {
      const validation = validateTemplateFile(file);
      if (!validation.valid) {
        onError?.(validation.error ?? "Invalid file.");
        return;
      }

      await onImport(file, {
        templateName: templateName.trim() || undefined,
        uploadSource,
        driveFileId,
      });

      setTemplateName("");
      overlay.close();
    },
    [onImport, onError, overlay, templateName],
  );

  const handleClose = () => {
    overlay.close();
  };

  return (
    <Modal state={overlay}>
      <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
        <Modal.Container placement="center" className="p-4">
          <Modal.Dialog className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl outline-none">
            <Modal.Header className="border-b border-gray-200 px-6 py-4">
              <Modal.Heading className="text-lg font-semibold text-gray-900">
                Import Template
              </Modal.Heading>
              <p className="mt-1 text-sm text-gray-500">
                Upload from your computer, Google Drive, or existing documents.
              </p>
            </Modal.Header>

            <Modal.Body className="space-y-5 px-6 py-5">
              <TextField
                value={templateName}
                onChange={setTemplateName}
                name="templateName"
                isDisabled={isSubmitting}
              >
                <Label>Template name (optional)</Label>
                <Input
                  placeholder="Defaults to file name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </TextField>

              <FileUploadComponent
                context="templates"
                allowedFileTypes={FILE_TYPE_ACCEPT}
                maxSizeBytes={MAX_TEMPLATE_FILE_SIZE_BYTES}
                validateFile={(file) => validateTemplateFile(file)}
                disabled={isSubmitting}
                title="Import Template"
                subtitle="Upload from your computer, Google Drive, or existing documents."
                dropLabel="Drag and drop your template here"
                onFileSelect={(file, meta) => {
                  void processFile(
                    file,
                    meta?.source === "drive" ? "drive" : "local",
                    meta?.driveFileId,
                  ).catch(reportError);
                }}
                onError={onError}
                renderTrigger={(openPicker) => (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={openPicker}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/40 disabled:pointer-events-none disabled:opacity-60"
                  >
                    <CloudUpload className="mb-3 h-10 w-10 text-primary-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Choose a template file
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOCX, XLSX, PPTX - local, Drive, or existing docs
                    </p>
                  </button>
                )}
              />
            </Modal.Body>

            <Modal.Footer className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
