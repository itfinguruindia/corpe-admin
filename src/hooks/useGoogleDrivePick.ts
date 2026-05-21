"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isGoogleDriveAbortError,
  pickFileFromGoogleDrive,
  type GoogleDrivePickOptions,
} from "@/lib/google/drivePicker";

type PickOptions = Omit<GoogleDrivePickOptions, "signal">;

/**
 * Wraps Google Drive pick with abort on unmount / modal close and resets loading state.
 */
export function useGoogleDrivePick() {
  const abortRef = useRef<AbortController | null>(null);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  const abortDrivePick = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsDriveLoading(false);
  }, []);

  const pickFromDrive = useCallback(
    async (options: PickOptions = {}) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsDriveLoading(true);

      try {
        return await pickFileFromGoogleDrive({
          ...options,
          signal: controller.signal,
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsDriveLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    return () => abortDrivePick();
  }, [abortDrivePick]);

  return {
    isDriveLoading,
    pickFromDrive,
    abortDrivePick,
    isGoogleDriveAbortError,
  };
}
