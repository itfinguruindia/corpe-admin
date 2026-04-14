import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#F6FAFF]">
      <Sidebar />
      <div className="sidebar-content flex h-screen flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
