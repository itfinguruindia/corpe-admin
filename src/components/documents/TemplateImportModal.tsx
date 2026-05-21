"use client";

import { useCallback, useState } from "react";
import { HardDrive, Loader2 } from "lucide-react";
import {
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from "@heroui/react";
import TemplateFileDropzone from "@/components/documents/TemplateFileDropzone";
import { isGoogleDriveConfigured } from "@/lib/google/drivePicker";
import { validateTemplateFile } from "@/lib/templates/templateValidation";
import { useGoogleDrivePick } from "@/hooks/useGoogleDrivePick";
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
  const driveConfigured = isGoogleDriveConfigured();
  const {
    isDriveLoading,
    pickFromDrive,
    abortDrivePick,
    isGoogleDriveAbortError,
  } = useGoogleDrivePick();

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) {
        abortDrivePick();
        setTemplateName("");
        onOpenChange(false);
        return;
      }
      onOpenChange(true);
    },
  });

  const reportError = useCallback(
    (error: unknown) => {
      if (isGoogleDriveAbortError(error)) return;
      const message =
        error instanceof Error
          ? error.message
          : "Import failed. Please try again.";
      if (message.toLowerCase().includes("cancelled")) return;
      onError?.(message);
    },
    [isGoogleDriveAbortError, onError],
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

  const handleLocalFile = async (file: File) => {
    try {
      await processFile(file, "local");
    } catch (error) {
      reportError(error);
    }
  };

  const handleGoogleDrive = async () => {
    try {
      const { file, driveFileId } = await pickFromDrive();
      await processFile(file, "drive", driveFileId);
    } catch (error) {
      reportError(error);
    }
  };

  const handleClose = () => {
    abortDrivePick();
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
                Upload from your computer or import from Google Drive.
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

              <TemplateFileDropzone
                disabled={isSubmitting}
                onFileSelected={(file) => {
                  void handleLocalFile(file);
                }}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <span className="w-full border-t border-gray-200" />
                </div>
                <span className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </span>
              </div>

              <button
                type="button"
                disabled={isSubmitting || isDriveLoading || !driveConfigured}
                onClick={() => {
                  void handleGoogleDrive();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDriveLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4" />
                )}
                Import from Google Drive
              </button>

              {!driveConfigured && (
                <p className="text-xs text-amber-700">
                  Google Drive import requires{" "}
                  <code className="rounded bg-amber-50 px-1">
                    NEXT_PUBLIC_GOOGLE_CLIENT_ID
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-amber-50 px-1">
                    NEXT_PUBLIC_GOOGLE_API_KEY
                  </code>{" "}
                  in your environment.
                </p>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
