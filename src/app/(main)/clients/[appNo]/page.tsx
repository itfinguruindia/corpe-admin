"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TabCard from "@/components/dashboard/TabCard";

export default function ClientDetailsPage() {
  const { appNo } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("Tracking Status");

  const tabs = [
    { label: "Company Overview", route: "company-overview" },
    { label: "Directors", route: "directors" },
    { label: "MOA & AOA", route: "moa-aoa" },
    { label: "Tracking Status", route: "tracking-status" },
    { label: "Name Application", route: "application" },
    { label: "Shareholders", route: "shareholders" },
    { label: "Uploaded Documents", route: "uploaded-documents" },
    { label: "Registration Documents", route: "registration-documents" },
    { label: "Pricing & Payment", route: "pricing-and-payment" },
  ];

  const handleTabClick = (tab: { label: string; route: string | null }) => {
    setActiveTab(tab.label);
    if (tab.route) {
      router.push(`/clients/${appNo}/${tab.route}`);
    }
  };

  return (
    <div className="w-full p-4 sm:p-5">
      <h1 className="mb-4 text-xl font-bold text-primary sm:mb-6 sm:text-2xl">
        {appNo}
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-4 lg:gap-6 sm:mb-12">
        {tabs.map((tab) => (
          <TabCard
            key={tab.label}
            label={tab.label}
            active={activeTab === tab.label}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>
    </div>
  );
}
