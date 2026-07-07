"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  X,
} from "lucide-react";
import { EmptyState, Modal, Spinner, useOverlayState } from "@heroui/react";
import FileUploadDropzone from "@/components/upload/FileUploadDropzone";
import { Chip } from "@/components/ui/Chip";
import { acceptToDriveMimeTypes } from "@/lib/upload/acceptToMimeTypes";
import { formatAcceptHint } from "@/lib/upload/formatAcceptHint";
import {
  fetchExistingDocuments,
  resolveExistingDocumentAsFile,
} from "@/lib/upload/sources/existingDocumentsSource";
import { isGoogleDriveConfigured } from "@/lib/google/drivePicker";
import { useGoogleDrivePick } from "@/hooks/useGoogleDrivePick";
import type {
  FileUploadSelectMeta,
  FileUploadSource,
  FileValidator,
} from "@/lib/upload/types";
import { validateAcceptedFile } from "@/lib/upload/validateAcceptedFile";
import type { DocumentTemplate } from "@/types/documentTemplate";
import { formatFileSize, formatUploadDate } from "@/utils/fileFromSource";

interface FileUploadPickerModalProps {
  /** When omitted, modal is open for the lifetime of the component (use with conditional render). */
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  allowedFileTypes?: string;
  multiple?: boolean;
  enableDrive?: boolean;
  enableExistingDocuments?: boolean;
  maxSizeBytes?: number;
  dropLabel?: string;
  validateFile?: FileValidator;
  onFileSelect: (
    file: File,
    meta: FileUploadSelectMeta,
  ) => void | Promise<void>;
  onError?: (message: string) => void;
}

function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-gray-200" />
      </div>
      <span className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-gray-500">or</span>
      </span>
    </div>
  );
}

function resetPickerState(
  setters: {
    setView: (v: "main" | "existing") => void;
    setExistingDocs: (d: DocumentTemplate[]) => void;
    setIsExistingLoading: (v: boolean) => void;
    setResolvingTemplateId: (v: string | null) => void;
  },
) {
  setters.setView("main");
  setters.setExistingDocs([]);
  setters.setIsExistingLoading(false);
  setters.setResolvingTemplateId(null);
}

export default function FileUploadPickerModal({
  isOpen = true,
  onClose,
  title = "Upload file",
  subtitle = "Upload from your computer or import from Google Drive.",
  allowedFileTypes,
  multiple: _multiple = false,
  enableDrive = true,
  enableExistingDocuments = true,
  maxSizeBytes,
  dropLabel = "Drag and drop your file here",
  validateFile,
  onFileSelect,
  onError,
}: FileUploadPickerModalProps) {
  const [view, setView] = useState<"main" | "existing">("main");
  const [isExistingLoading, setIsExistingLoading] = useState(false);
  const {
    isDriveLoading,
    pickFromDrive,
    abortDrivePick,
    isGoogleDriveAbortError,
  } = useGoogleDrivePick();
  const [existingDocs, setExistingDocs] = useState<DocumentTemplate[]>([]);
  const [resolvingTemplateId, setResolvingTemplateId] = useState<string | null>(
    null,
  );
  const [hideModalForDrivePicker, setHideModalForDrivePicker] =
    useState(false);
  const drivePickInFlightRef = useRef(false);

  const driveConfigured = isGoogleDriveConfigured();
  const acceptHint = formatAcceptHint(allowedFileTypes, maxSizeBytes);

  const resetState = useCallback(() => {
    resetPickerState({
      setView,
      setExistingDocs,
      setIsExistingLoading,
      setResolvingTemplateId,
    });
    setHideModalForDrivePicker(false);
  }, []);

  const overlay = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) {
        if (drivePickInFlightRef.current) return;
        abortDrivePick();
        resetState();
        onClose();
      }
    },
  });

  useEffect(() => {
    if (!isOpen && !drivePickInFlightRef.current) {
      abortDrivePick();
      resetState();
    }
  }, [isOpen, abortDrivePick, resetState]);

  const reportError = useCallback(
    (error: unknown) => {
      if (isGoogleDriveAbortError(error)) return;
      const message =
        error instanceof Error
          ? error.message
          : "File selection failed. Please try again.";
      if (message.toLowerCase().includes("cancelled")) return;
      onError?.(message);
    },
    [isGoogleDriveAbortError, onError],
  );

  const runValidation = useCallback(
    (file: File) => {
      if (validateFile) return validateFile(file);
      return validateAcceptedFile(file, allowedFileTypes, maxSizeBytes);
    },
    [allowedFileTypes, maxSizeBytes, validateFile],
  );

  const emitSelection = useCallback(
    async (
      file: File,
      source: FileUploadSource,
      meta?: Partial<FileUploadSelectMeta>,
    ) => {
      const validation = runValidation(file);
      if (!validation.valid) {
        onError?.(validation.error ?? "Invalid file.");
        return;
      }

      try {
        await onFileSelect(file, { source, ...meta });
      } finally {
        drivePickInFlightRef.current = false;
        overlay.close();
      }
    },
    [onError, onFileSelect, overlay, runValidation],
  );

  const handleLocalFile = (file: File) => {
    void emitSelection(file, "local");
  };

  const handleDriveUpload = async () => {
    drivePickInFlightRef.current = true;
    // Hide our modal while the Google Picker is open. Modal overlays mark the
    // rest of the page inert, which blocks clicks inside the picker iframe.
    setHideModalForDrivePicker(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    try {
      const { file, driveFileId } = await pickFromDrive({
        mimeTypes: acceptToDriveMimeTypes(allowedFileTypes),
        validateFile: (file) => runValidation(file),
      });
      await emitSelection(file, "drive", { driveFileId });
    } catch (error) {
      reportError(error);
      setHideModalForDrivePicker(false);
    } finally {
      drivePickInFlightRef.current = false;
    }
  };

  const handleClose = () => {
    if (drivePickInFlightRef.current) return;
    abortDrivePick();
    overlay.close();
  };

  const loadExistingDocuments = async () => {
    setIsExistingLoading(true);
    try {
      const docs = await fetchExistingDocuments(allowedFileTypes);
      setExistingDocs(docs);
      setView("existing");
    } catch (error) {
      reportError(error);
    } finally {
      setIsExistingLoading(false);
    }
  };

  const handleExistingSelect = async (template: DocumentTemplate) => {
    setResolvingTemplateId(template.id);
    try {
      const file = await resolveExistingDocumentAsFile(template);
      if (!file) {
        onError?.(
          "Could not load the selected document. It may have been removed.",
        );
        return;
      }
      await emitSelection(file, "existing", { templateId: template.id });
    } catch (error) {
      reportError(error);
    } finally {
      setResolvingTemplateId(null);
    }
  };

  const formLocked =
    isDriveLoading || isExistingLoading || resolvingTemplateId !== null;

  if (hideModalForDrivePicker) {
    return null;
  }

  return (
    <Modal state={overlay}>
      <Modal.Backdrop
        className="bg-black/50 backdrop-blur-sm"
        isDismissable={!formLocked}
      >
        <Modal.Container placement="center" className="p-4">
          <Modal.Dialog className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl outline-none">
            <Modal.Header className="relative border-b border-gray-200 px-6 py-4 pr-12">
              <Modal.Heading className="text-lg font-semibold text-gray-900">
                {view === "existing" ? "Select document" : title}
              </Modal.Heading>
              <p className="mt-1 text-sm text-gray-500">
                {view === "existing"
                  ? "Pick a file from your uploaded document templates."
                  : subtitle}
              </p>
              <Modal.CloseTrigger
                className="absolute right-4 top-4 shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Close"
                isDisabled={formLocked}
              >
                <X className="h-5 w-5" />
              </Modal.CloseTrigger>
            </Modal.Header>

            <Modal.Body className="space-y-5 px-6 py-5">
              {view === "main" ? (
                <>
                  <FileUploadDropzone
                    disabled={formLocked}
                    accept={allowedFileTypes}
                    dropLabel={dropLabel}
                    hintLabel={acceptHint}
                    onFileSelected={handleLocalFile}
                  />

                  {enableDrive && (
                    <>
                      <OrDivider />

                      <button
                        type="button"
                        disabled={isDriveLoading || !driveConfigured}
                        onClick={() => {
                          void handleDriveUpload();
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
                          in your environment. Restart the dev server after
                          changing <code className="rounded bg-amber-50 px-1">.env</code>.
                        </p>
                      )}
                    </>
                  )}

                  {enableExistingDocuments && (
                    <>
                      <OrDivider />

                      <button
                        type="button"
                        disabled={isExistingLoading}
                        onClick={() => {
                          void loadExistingDocuments();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isExistingLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FolderOpen className="h-4 w-4" />
                        )}
                        Select from existing uploaded documents
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <button
                    type="button"
                    disabled={formLocked}
                    onClick={() => setView("main")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  {isExistingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" className="text-primary-600" />
                    </div>
                  ) : existingDocs.length === 0 ? (
                    <EmptyState className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10">
                      <FolderOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-sm font-medium text-gray-600">
                        No matching documents
                      </p>
                      <p className="mt-1 text-center text-xs text-gray-400">
                        Upload templates from the Document Templates page first.
                      </p>
                    </EmptyState>
                  ) : (
                    <div className="max-h-[min(50vh,360px)] overflow-y-auto rounded-lg border border-gray-100">
                      {existingDocs.map((doc, index) => (
                        <button
                          key={doc.id}
                          type="button"
                          disabled={formLocked}
                          onClick={() => {
                            void handleExistingSelect(doc);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary-50/40 disabled:cursor-not-allowed disabled:opacity-60 ${
                            index < existingDocs.length - 1
                              ? "border-b border-gray-50"
                              : ""
                          }`}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {doc.templateName}
                              </span>
                              <Chip
                                label={doc.fileType.toUpperCase()}
                                variant="orange"
                                className="px-2 py-0.5 text-[10px]"
                              />
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-gray-500">
                              {doc.fileName} · {formatFileSize(doc.sizeBytes)}
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-400">
                              {formatUploadDate(doc.uploadedAt)}
                            </span>
                          </span>
                          {resolvingTemplateId === doc.id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={formLocked}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
