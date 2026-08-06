"use client";

import StakeholderNavTabs from "@/components/clients/StakeholderNavTabs";

export default function ShareholderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <StakeholderNavTabs entityType="shareholder" />
        {children}
      </div>
    </div>
  );
}
