import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      <Sidebar />
      <div className="ml-65 flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
