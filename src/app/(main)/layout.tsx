"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useNotifications } from "@/hooks/useNotifications";
import { useActivityLogTracker } from "@/hooks/useActivityLogTracker";
import RoutePermissionGuard from "@/components/rbac/RoutePermissionGuard";
import AuthSessionSync from "@/components/providers/AuthSessionSync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize real-time notification listeners
  useNotifications();
  useActivityLogTracker();

  return (
    <>
      <AuthSessionSync />
      <div className="flex h-screen w-full bg-[#F6FAFF]">
        <Sidebar />
        <div className="sidebar-content flex h-full overflow-hidden flex-1 flex-col max-md:!ml-0 bg-[#F6FAFF]">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-[#F6FAFF]">
            <RoutePermissionGuard>{children}</RoutePermissionGuard>
          </main>
        </div>
      </div>
    </>
  );
}
