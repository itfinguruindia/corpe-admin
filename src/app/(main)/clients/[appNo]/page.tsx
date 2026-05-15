"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Upload, FileEdit, Building2 } from "lucide-react";
import TabCard from "@/components/dashboard/TabCard";

const TIMELINE_STEPS = [
  {
    icon: <Check size={18} />,
    label: "Name Application",
    state: "completed" as const,
  },
  {
    icon: <Upload size={18} />,
    label: "Documents and information for business incorporation",
    state: "current" as const,
  },
  {
    icon: <FileEdit size={18} />,
    label: "MoA And AoA Drafting",
    state: "upcoming" as const,
  },
  {
    icon: <Building2 size={18} />,
    label: "Business Incorporated!",
    state: "upcoming" as const,
  },
];

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

      <div className="w-full pt-8 sm:pt-16 lg:pt-24 xl:pt-32">
        <TrackingTimeline />
      </div>
    </div>
  );
}

function TrackingTimeline() {
  return (
    <div className="mt-8 px-2 sm:mt-12 sm:px-4 lg:mt-16 lg:px-8">
      <div className="relative flex flex-col gap-8 lg:hidden">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#3D63A4]" />
        {TIMELINE_STEPS.map((step) => (
          <TimelineStep key={step.label} {...step} layout="horizontal" />
        ))}
      </div>

      <div className="relative hidden w-full lg:block">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-[#3D63A4]" />
        <div className="relative grid grid-cols-4">
          {TIMELINE_STEPS.map((step) => (
            <div key={step.label} className="flex justify-center">
              <TimelineStep {...step} layout="vertical" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineStep({
  icon,
  label,
  state,
  layout = "vertical",
}: {
  icon: React.ReactNode;
  label: string;
  state: "completed" | "current" | "upcoming";
  layout?: "vertical" | "horizontal";
}) {
  const styles = {
    completed: "bg-[#F46A45] text-white",
    current: "bg-[#F7C948] text-primary ring-2 ring-[#F46A45]",
    upcoming: "bg-[#F7C948] text-primary",
  };

  const iconCircle = (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles[state]}`}
    >
      {icon}
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div className="relative z-10 flex items-start gap-4 pl-2">
        {iconCircle}
        <p className="pt-2 text-sm font-medium text-secondary">{label}</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex max-w-[11rem] flex-col items-center text-center xl:max-w-[12.5rem]">
      {iconCircle}
      <p className="mt-2 text-xs font-medium text-secondary">{label}</p>
    </div>
  );
}
