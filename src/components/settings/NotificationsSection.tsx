"use client";

import React, { useState, useEffect } from "react";
import useSwal from "@/utils/useSwal";
import {
  fetchAdminPreferences,
  updateAdminPreferences,
} from "@/services/preference.service";
import { AdminPreferences } from "@/types/admin";

export default function NotificationsSection() {
  const swal = useSwal();
  const [preferences, setPreferences] = useState<AdminPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminPreferences();
        setPreferences(data);
      } catch (err) {
        console.error("Could not load preferences.", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleNotificationToggle = async (
    key: keyof AdminPreferences["notification"],
  ) => {
    if (!preferences) return;

    // Optimistic UI update
    const newValue = !preferences.notification[key];
    const updatedPreferences = {
      ...preferences,
      notification: {
        ...preferences.notification,
        [key]: newValue,
      },
    };
    setPreferences(updatedPreferences);

    try {
      setIsSaving(true);
      await updateAdminPreferences({
        notification: {
          [key]: newValue,
        } as any,
        // backend logic merges nested objects, we can cast to any if partial update
      });
    } catch (err: any) {
      setPreferences(preferences); // Revert
      await swal({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update notification setting",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSoundToggle = async () => {
    if (!preferences) return;

    const newValue = !preferences.sound;
    const updatedPreferences = { ...preferences, sound: newValue };
    setPreferences(updatedPreferences);

    try {
      setIsSaving(true);
      await updateAdminPreferences({ sound: newValue });
    } catch (err: any) {
      setPreferences(preferences); // Revert
      await swal({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update sound setting",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white shadow-sm p-6 flex flex-col justify-center items-center h-full">
        <p className="text-gray-500">Loading preferences...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="rounded-xl bg-white shadow-sm p-6 flex flex-col justify-center items-center h-full">
        <p className="text-red-500">Failed to load preferences.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary">
          Notification Preference
        </h3>
      </div>

      <div className="space-y-4">
        {/* Toggle Switches */}
        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700">System Notification</span>
          <button
            onClick={() => handleNotificationToggle("systemNotification")}
            disabled={isSaving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              preferences.notification.systemNotification
                ? "bg-[#3D63A4]"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.notification.systemNotification
                  ? "translate-x-8"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700">Chat Messages</span>
          <button
            onClick={() => handleNotificationToggle("chatMessages")}
            disabled={isSaving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              preferences.notification.chatMessages
                ? "bg-[#3D63A4]"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.notification.chatMessages
                  ? "translate-x-8"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700">New Company</span>
          <button
            onClick={() => handleNotificationToggle("newCompany")}
            disabled={isSaving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              preferences.notification.newCompany
                ? "bg-[#3D63A4]"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.notification.newCompany
                  ? "translate-x-8"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700">Statutes Updates</span>
          <button
            onClick={() => handleNotificationToggle("statutesUpdates")}
            disabled={isSaving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              preferences.notification.statutesUpdates
                ? "bg-[#3D63A4]"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.notification.statutesUpdates
                  ? "translate-x-8"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700">Sound preferences</span>
          <button
            onClick={handleSoundToggle}
            disabled={isSaving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              preferences.sound ? "bg-[#3D63A4]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                preferences.sound ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
