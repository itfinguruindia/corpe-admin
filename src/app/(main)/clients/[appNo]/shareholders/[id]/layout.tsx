"use client";

import StakeholderNavTabs from "@/components/clients/StakeholderNavTabs";

export default function ShareholderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5">
        <StakeholderNavTabs entityType="shareholder" />
      </div>
      {children}
    </div>
  );
}
