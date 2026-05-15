"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, Info, MessageSquare, User, Ticket, CreditCard, FileText, Settings } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setUnreadCount,
  setRecentNotifications,
  markNotificationRead,
} from "@/redux/slices/notificationSlice";
import notificationService from "@/services/notification.service";
import { Notification, NotificationCategory } from "@/types/notification";
import clsx from "clsx";
import { Button } from "@heroui/react";

const CATEGORY_ICONS: Record<NotificationCategory, React.ReactNode> = {
  clients: <User size={16} className="text-blue-500" />,
  tickets: <Ticket size={16} className="text-purple-500" />,
  payments: <CreditCard size={16} className="text-green-500" />,
  messages: <MessageSquare size={16} className="text-orange-500" />,
  documents: <FileText size={16} className="text-cyan-500" />,
  admin: <User size={16} className="text-red-500" />,
  system: <Info size={16} className="text-gray-500" />,
};

const SEVERITY_COLORS = {
  info: "bg-blue-50 border-blue-100",
  warning: "bg-amber-50 border-amber-100",
  critical: "bg-red-50 border-red-100",
};

/**
 * Simple replacement for date-fns formatDistanceToNow
 */
function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { unreadCount, recentNotifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    const initFetch = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        dispatch(setUnreadCount(count));
        
        const data = await notificationService.getNotifications({}, 1, 10);
        if (data?.notifications) {
          dispatch(setRecentNotifications(data.notifications));
        }
      } catch (error) {
        console.error("Failed to fetch initial notifications", error);
      }
    };
    
    initFetch();
  }, [dispatch]);

  // Handle Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      dispatch(markNotificationRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const updatedNotifications = recentNotifications.map(n => ({ ...n, isRead: true }));
      dispatch(setRecentNotifications(updatedNotifications));
      dispatch(setUnreadCount(0));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 outline-none",
          "shadow-none border-0 ring-0 min-h-0 min-w-0 p-0 [background-image:none]",
          isOpen
            ? "bg-primary-100 text-primary-600 shadow-inner"
            : "bg-transparent text-primary-500 hover:bg-gray-100"
        )}
      >
        <Bell className="h-6 w-6 md:h-8 md:w-8" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm scale-100 animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </Button>
      
      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-800">Notifications</h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  {unreadCount > 0 ? `You have ${unreadCount} unread items` : "You're all caught up!"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shadow-none border-0 ring-0 outline-none min-h-0 h-auto [background-image:none]"
                  >
                    <Check size={14} />
                    <span>Mark all read</span>
                  </Button>
                )}
                <Link 
                  href="/settings?tab=notifications" 
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notification Settings"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings size={14} />
                </Link>
              </div>
            </div>
            
            <div className="h-px bg-gray-100" />
            
            {/* List */}
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
              {recentNotifications.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-50">
                  {recentNotifications.map((notification) => (
                    <NotificationItem 
                      key={notification._id} 
                      notification={notification} 
                      onMarkRead={handleMarkAsRead}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Bell className="text-gray-300" size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">We'll notify you here when there are updates to your dashboard.</p>
                </div>
              )}
            </div>
            
            <div className="h-px bg-gray-100" />
            
            {/* Footer */}
            <div className="p-2 bg-gray-50/50">
              <Link 
                href="/notifications"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-primary-100"
                onClick={() => setIsOpen(false)}
              >
                <span>View all notifications</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onMarkRead,
  onClose
}: { 
  notification: Notification; 
  onMarkRead: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}) {
  const isRead = notification.isRead;
  
  return (
    <Link 
      href={notification.metadata?.link || "/notifications"}
      onClick={onClose}
      className={clsx(
        "flex gap-3 p-4 transition-all relative group border-l-4",
        !isRead ? "bg-primary-50/30 border-primary-500 hover:bg-primary-50/60" : "bg-white border-transparent hover:bg-gray-50"
      )}
    >
      {/* Icon with severity background */}
      <div className={clsx(
        "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
        SEVERITY_COLORS[notification.severity || "info"]
      )}>
        {CATEGORY_ICONS[notification.category] || <Info size={16} />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx(
            "text-[13px] line-clamp-1",
            !isRead ? "font-bold text-secondary-900" : "font-semibold text-gray-700"
          )}>
            {notification.title}
          </p>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className={clsx(
          "text-[11px] line-clamp-2 mt-1 leading-relaxed",
          !isRead ? "text-gray-700 font-medium" : "text-gray-500"
        )}>
          {notification.body}
        </p>
      </div>
      
      {/* Actions (visible on hover) */}
      {!isRead && (
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <button
            onClick={(e) => onMarkRead(notification._id, e)}
            className="h-6 w-6 flex items-center justify-center bg-white shadow-lg rounded-full border border-green-100 text-green-600 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"
            title="Mark as read"
          >
            <Check size={12} />
          </button>
        </div>
      )}
    </Link>
  );
}
