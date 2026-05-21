import {
  isGoogleDriveConfigured,
  pickFileFromGoogleDrive,
  type GoogleDrivePickOptions as DrivePickerOptions,
} from "@/lib/google/drivePicker";
import { acceptToDriveMimeTypes } from "@/lib/upload/acceptToMimeTypes";
import type { FileValidationResult } from "@/lib/upload/types";

export { isGoogleDriveConfigured };

export interface GoogleDrivePickOptions {
  accept?: string;
  pickerTitle?: string;
  validateFile?: (file: File) => FileValidationResult;
  signal?: AbortSignal;
}

export async function pickFileFromGoogleDriveForUpload(
  options: GoogleDrivePickOptions = {},
): Promise<{ file: File; driveFileId: string }> {
  const { accept, signal, pickerTitle, validateFile } = options;
  const driveOptions: DrivePickerOptions = {
    mimeTypes: acceptToDriveMimeTypes(accept),
    pickerTitle: pickerTitle ?? "Select a file from Google Drive",
    validateFile,
    signal,
  };
  return pickFileFromGoogleDrive(driveOptions);
}
