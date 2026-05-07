"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setPreferences as setReduxPreferences } from "@/redux/slices/notificationSlice";
import notificationService from "@/services/notification.service";
import { NotificationPreference, NotificationCategory } from "@/types/notification";
import { 
  Card, 
  Spinner, 
  Button,
  Tooltip
} from "@heroui/react";
import { Switch } from "@/components/ui/Switch";
import { Bell, Mail, Volume2, ShieldOff, Info, Check } from "lucide-react";
import useSwal from "@/utils/useSwal";
import clsx from "clsx";

interface NotificationsSectionProps {
  id?: string;
}

const CATEGORIES: { value: NotificationCategory; label: string; description: string }[] = [
  { value: "clients", label: "Clients", description: "Registration, onboarding, and status changes" },
  { value: "tickets", label: "Tickets", description: "New tickets, assignments, and status updates" },
  { value: "payments", label: "Payments", description: "Successful payments and failed transactions" },
  { value: "messages", label: "Messages", description: "Chat messages from clients and colleagues" },
  { value: "documents", label: "Documents", description: "File uploads and verification status" },
  { value: "admin", label: "Admin", description: "Role changes and admin registrations" },
];

export default function NotificationsSection({ id }: NotificationsSectionProps) {
  const swal = useSwal();
  const dispatch = useDispatch();
  const reduxPrefs = useSelector((state: RootState) => state.notifications.preferences);
  
  const [preferences, setPreferences] = useState<NotificationPreference | null>(reduxPrefs);
  const [isLoading, setIsLoading] = useState(!reduxPrefs);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (reduxPrefs) {
        setPreferences(reduxPrefs);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await notificationService.getPreferences();
        setPreferences(data);
        dispatch(setReduxPreferences(data));
      } catch (err) {
        console.error("Could not load preferences.", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [reduxPrefs, dispatch]);

  const handleUpdate = async (updates: Partial<NotificationPreference>) => {
    if (!preferences) return;

    // Optimistic update
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    try {
      setIsSaving(true);
      const updated = await notificationService.updatePreferences(updates);
      dispatch(setReduxPreferences(updated));
    } catch (err: any) {
      setPreferences(preferences); // Revert
      await swal({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update notification settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMuteToggle = (category: NotificationCategory) => {
    if (!preferences) return;
    
    const isMuted = preferences.mutedCategories.includes(category);
    const newMuted = isMuted 
      ? preferences.mutedCategories.filter(c => c !== category)
      : [...preferences.mutedCategories, category];
    
    handleUpdate({ mutedCategories: newMuted });
  };

  if (isLoading) {
    return (
      <Card id={id} className="w-full border border-gray-100 shadow-sm rounded-2xl h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-gray-500 font-bold">Loading settings...</p>
        </div>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card id={id} className="w-full border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
      <Card.Header className="bg-gray-50/50 p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm">
          <Bell size={22} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-secondary-900 tracking-tight">Notification Preferences</h3>
          <p className="text-xs text-gray-500 font-medium">Control how and when you receive alerts.</p>
        </div>
      </Card.Header>
      
      <div className="h-px bg-gray-100" />
      
      <Card.Content className="p-0">
        <div className="flex flex-col">
          {/* General Settings */}
          <div className="p-6 space-y-6">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              General
            </h4>
            
            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Sound Notifications</p>
                    <p className="text-xs text-gray-500">Play a sound when a new alert arrives.</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.soundEnabled} 
                  onChange={(val) => handleUpdate({ soundEnabled: val })}
                  disabled={isSaving}
                />
              </div>

              {/* Email Digest Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-500 flex items-center justify-center border border-green-100">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Email Digest</p>
                    <p className="text-xs text-gray-500">Receive a daily summary of your notifications.</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.emailDigest} 
                  onChange={(val) => handleUpdate({ emailDigest: val })}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Mute Categories */}
          <div className="p-6 space-y-6 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Mute Categories
              </h4>
              <Tooltip>
                <Tooltip.Trigger>
                  <div className="text-gray-400 cursor-help"><Info size={14} /></div>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  Muted categories won't show in the bell or trigger sounds, but will be visible in the activity log.
                </Tooltip.Content>
              </Tooltip>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => {
                const isMuted = preferences.mutedCategories.includes(cat.value);
                return (
                  <div 
                    key={cat.value}
                    onClick={() => handleMuteToggle(cat.value)}
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                      isMuted 
                        ? "bg-white border-gray-100 grayscale-[0.8] opacity-60" 
                        : "bg-white border-primary-50 shadow-sm hover:border-primary-200"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                      isMuted ? "bg-gray-200 border-gray-200" : "bg-primary-500 border-primary-500"
                    )}>
                      {!isMuted && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "text-xs font-bold truncate",
                        isMuted ? "text-gray-500" : "text-gray-800"
                      )}>
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{cat.description}</p>
                    </div>
                    {isMuted && <ShieldOff size={14} className="text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card.Content>

      <div className="h-px bg-gray-100" />

      <div className="p-4 bg-gray-50/50 flex justify-end">
        {isSaving ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
            <Spinner />
            <span className="text-xs font-bold text-gray-500">Saving...</span>
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 italic">Settings are saved automatically</p>
        )}
      </div>
    </Card>
  );
}
