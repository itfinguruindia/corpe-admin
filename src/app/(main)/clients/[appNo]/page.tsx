"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Upload, FileEdit, Building2 } from "lucide-react";
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
      <div className="w-full pt-40">
        <TrackingTimeline />
      </div>
    </div>
  );
}

function TrackingTimeline() {
  return (
    <div className="mt-16 px-8">
      {/* Wrapper for line + steps */}
      <div className="relative w-full">
        {/* BLUE CONNECTING LINE */}
        {/* Starts at 12.5% (center of first col) and ends at 12.5% from right (center of last col) */}
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-[#3D63A4]" />

        {/* STEPS GRID */}
        <div className="grid grid-cols-4 relative">
          {/* STEP 1 */}
          <div className="flex justify-center">
            <TimelineStep
              icon={<Check size={18} />}
              label="Name Application"
              state="completed"
            />
          </div>

          {/* STEP 2 */}
          <div className="flex justify-center">
            <TimelineStep
              icon={<Upload size={18} />}
              label="Documents and information for business incorporation"
              state="current"
            />
          </div>

          {/* STEP 3 */}
          <div className="flex justify-center">
            <TimelineStep
              icon={<FileEdit size={18} />}
              label="MoA And AoA Drafting"
              state="upcoming"
            />
          </div>

          {/* STEP 4 */}
          <div className="flex justify-center">
            <TimelineStep
              icon={<Building2 size={18} />}
              label="Business Incorporated!"
              state="upcoming"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  state,
}: {
  icon: React.ReactNode;
  label: string;
  state: "completed" | "current" | "upcoming";
}) {
  const styles = {
    completed: "bg-[#F46A45] text-white",
    current: "bg-[#F7C948] text-primary ring-2 ring-[#F46A45]",
    upcoming: "bg-[#F7C948] text-primary",
  };

  return (
    <div className="flex max-w-50 flex-col items-center text-center relative z-10">
      {/* ICON CIRCLE */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${styles[state]}`}
      >
        {icon}
      </div>

      {/* LABEL */}
      <p className="mt-2 text-xs font-medium text-secondary">{label}</p>
    </div>
  );
}
