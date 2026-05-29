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
    <div className="w-full p-5">
      {/* Application No */}
      <h1 className="text-2xl font-bold text-primary mb-6">{appNo}</h1>

      {/* Tabs / Cards */}
      <div className="grid grid-cols-4 gap-6 mb-12">
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

