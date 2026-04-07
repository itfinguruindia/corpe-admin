import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import ClientsHeader from "@/components/dashboard/ClientsHeader";

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#F6FAFF]">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-65 min-h-screen flex flex-col">
        {/* Header (reusable) */}
        <ClientsHeader />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
