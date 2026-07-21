"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  Trash2,
  ExternalLink,
  Inbox,
  Calendar,
  ChevronRight,
  Info,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  User,
  Ticket,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";
import { Button, Card, Chip, Spinner, Tooltip } from "@heroui/react";
import Pagination from "@/components/ui/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import notificationService from "@/services/notification.service";
import {
  Notification,
  NotificationCategory,
  NotificationSeverity,
} from "@/types/notification";
import {
  setUnreadCount,
  markNotificationRead,
} from "@/redux/slices/notificationSlice";
import clsx from "clsx";
import Link from "next/link";
import RefreshButton from "@/components/ui/RefreshButton";
import { resolveNotificationLink } from "@/utils/notificationLink";

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  all: { label: "All", icon: Bell, color: "primary" },
  clients: { label: "Clients", icon: User, color: "primary" },
  tickets: { label: "Tickets", icon: Ticket, color: "secondary" },
  payments: { label: "Payments", icon: CreditCard, color: "success" },
  messages: { label: "Messages", icon: MessageSquare, color: "warning" },
  documents: { label: "Documents", icon: FileText, color: "danger" },
  admin: { label: "Admin", icon: User, color: "danger" },
};

const SEVERITY_INFO: Record<
  NotificationSeverity,
  { icon: any; bg: string; text: string; border: string }
> = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  critical: {
    icon: AlertCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
};

function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (activeTab !== "all") filters.category = activeTab;
      if (unreadOnly) filters.isRead = false;

      const data = await notificationService.getNotifications(
        filters,
        page,
        limit,
      );
      if (data) {
        setNotifications(data.notifications);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, unreadOnly, page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      dispatch(markNotificationRead(id));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(
        activeTab === "all" ? undefined : activeTab,
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      // Refresh unread count
      const count = await notificationService.getUnreadCount();
      dispatch(setUnreadCount(count));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Refresh unread count if it was unread
      const count = await notificationService.getUnreadCount();
      dispatch(setUnreadCount(count));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-xl">
              <Bell className="text-primary-500 h-6 w-6 md:h-8 md:w-8" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            Manage your alerts and activities across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <RefreshButton
            onClick={fetchNotifications}
            isLoading={loading}
            ariaLabel="Refresh notifications"
          />
          <Button
            className="bg-primary-500 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleMarkAllAsRead}
          >
            <Check size={18} className="mr-2" />
            Mark all read
          </Button>
          <Link
            href="/settings?tab=notifications"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 shadow-sm bg-white hover:bg-gray-50 transition-colors"
          >
            <Settings size={20} className="text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop & Mobile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col space-y-4">
            <h4 className="hidden lg:block text-xs font-extrabold text-gray-400 uppercase tracking-widest px-2">
              Categories
            </h4>

            {/* Horizontal scroll container for mobile, vertical for desktop */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {Object.entries(CATEGORY_MAP).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setPage(1);
                    }}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 shrink-0 lg:w-full",
                      isActive
                        ? "bg-primary-500 text-white shadow-md shadow-primary-500/10"
                        : "bg-white border border-gray-100 lg:border-transparent text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-400",
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap">
                      {config.label}
                    </span>
                    {isActive && (
                      <ChevronRight
                        size={16}
                        className="hidden lg:block ml-auto"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Card className="hidden lg:block border border-gray-100 shadow-sm rounded-2xl p-5 bg-white/80 backdrop-blur-sm">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
              View Options
            </h4>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={clsx(
                    "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center",
                    unreadOnly
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-200 group-hover:border-primary-300",
                  )}
                  onClick={() => {
                    setUnreadOnly(!unreadOnly);
                    setPage(1);
                  }}
                >
                  {unreadOnly && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm font-bold text-gray-700">
                  Unread only
                </span>
              </label>
            </div>
          </Card>

          {/* Mobile View Option */}
          <div className="lg:hidden flex items-center justify-between px-2">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
              Filter
            </h4>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={() => {
                  setUnreadOnly(!unreadOnly);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500"
              />
              <span className="text-xs font-bold text-gray-700">
                Unread only
              </span>
            </label>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className={clsx(
              "space-y-4",
              "lg:overflow-y-auto lg:h-[calc(100vh-220px)] lg:pr-2 lg:scrollbar-thin lg:scrollbar-thumb-gray-200 lg:scrollbar-track-transparent",
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Spinner />
                <p className="text-gray-500 font-bold mt-4">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <NotificationCard
                    key={notif._id}
                    notification={notif}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}

                {/* Pagination */}
                {total > limit && (
                  <div className="flex justify-center pt-6 pb-2">
                    <Pagination
                      totalPages={Math.ceil(total / limit)}
                      currentPage={page}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                  <Inbox size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800">
                  All caught up!
                </h3>
                <p className="text-gray-500 mt-2 max-w-sm font-medium">
                  No notifications found for this category. You're completely up
                  to date with everything.
                </p>
                <Button
                  className="mt-6 font-bold rounded-xl bg-primary-500 text-white px-8"
                  onClick={() => {
                    setActiveTab("all");
                    setUnreadOnly(false);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sev = SEVERITY_INFO[notification.severity || "info"];
  const isRead = notification.isRead;
  const config = CATEGORY_MAP[notification.category] || CATEGORY_MAP.all;
  const CategoryIcon = config.icon;

  return (
    <div
      className={clsx(
        "group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
        !isRead
          ? "bg-white border-primary-100 shadow-md ring-1 ring-primary-50"
          : "bg-white/60 border-gray-100 opacity-85 hover:opacity-100 hover:shadow-sm",
      )}
    >
      {/* Unread Indicator Bar */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
      )}

      {/* Category Icon */}
      <div
        className={clsx(
          "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105",
          sev.bg,
          sev.border,
          sev.text,
        )}
      >
        <CategoryIcon size={24} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span
            className={clsx(
              "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md",
              `bg-${config.color}-500 text-white`,
            )}
          >
            {notification.category}
          </span>
          {notification.severity === "critical" && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500 text-white animate-pulse">
              Urgent
            </span>
          )}
          <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1 ml-auto">
            <Calendar size={12} />
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <h4
          className={clsx(
            "text-base tracking-tight",
            !isRead
              ? "font-extrabold text-secondary-900"
              : "font-bold text-gray-700",
          )}
        >
          {notification.title}
        </h4>
        <p
          className={clsx(
            "text-[13px] mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none",
            !isRead ? "text-gray-700 font-medium" : "text-gray-500 font-medium",
          )}
        >
          {notification.body}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0 border-gray-50">
        <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          {!isRead && (
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  onClick={() => onMarkRead(notification._id)}
                  isIconOnly
                  className="rounded-xl w-10 h-10 border border-green-100 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                >
                  <Check size={18} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Mark as read</Tooltip.Content>
            </Tooltip>
          )}

          <Tooltip>
            <Tooltip.Trigger>
              <Button
                onClick={() => onDelete(notification._id)}
                isIconOnly
                className="rounded-xl w-10 h-10 border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Delete</Tooltip.Content>
          </Tooltip>

          {notification.metadata?.link && (
            <Tooltip>
              <Tooltip.Trigger>
                <Link
                  href={resolveNotificationLink(notification.metadata.link)}
                  className="flex items-center justify-center rounded-xl w-10 h-10 border border-primary-100 bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                >
                  <ExternalLink size={18} />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content>Go to item</Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
