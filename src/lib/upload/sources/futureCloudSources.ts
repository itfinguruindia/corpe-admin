/**
 * Placeholder module for future cloud upload integrations.
 * Implement pickFileFromDropbox / pickFileFromOneDrive here when ready.
 */
import type { FutureCloudUploadSource } from "@/lib/upload/types";

export type SupportedFutureSource = FutureCloudUploadSource;

export function isFutureCloudSourceConfigured(
  _source: SupportedFutureSource,
): boolean {
  return false;
}
