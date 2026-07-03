import React from "react";
import {
  ContentCard,
  TableCard,
  ChartCard,
} from "@/components/dashboard/DashboardCard";
import RaisedTicketsWidget from "@/components/dashboard/RaisedTicketsWidget";
import RecentlyOnboardedWidget from "@/components/dashboard/RecentlyOnboardedWidget";
import DashboardStatsWidget from "@/components/dashboard/DashboardStatsWidget";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";
import DashboardQuickLinks from "@/components/dashboard/DashboardQuickLinks";
import CompanyTypesPanel from "@/components/dashboard/CompanyTypesPanel";
import DashboardSection from "@/components/dashboard/DashboardSection";
import { Chip } from "@heroui/react";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1520px] space-y-10 pb-12">
      {/* Hero */}
      <div className="animate-fade-slide-up">
        <DashboardWelcome />
      </div>

      {/* Stats — slightly overlap hero for depth */}
      <div className="relative z-10 -mt-2 animate-fade-slide-up">
        <DashboardSection
          title="Overview"
          description="Application metrics at a glance"
        >
          <DashboardStatsWidget />
        </DashboardSection>
      </div>

      <div className="animate-fade-slide-up space-y-10">
        <DashboardSection
          title="Quick Access"
          description="All admin sections"
        >
          <DashboardQuickLinks />
        </DashboardSection>

        <DashboardSection
          title="Activity & Progress"
          description="Live tickets and monthly performance"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger-children">
            <TableCard
              id="raised-tickets"
              title="Raised Tickets"
              className="min-h-[360px] lg:col-span-2"
            >
              <RaisedTicketsWidget />
            </TableCard>

            <ChartCard
              id="monthly-target"
              title="Monthly Target"
              className="min-h-[360px]"
            >
              <MonthlyTargetChart />
            </ChartCard>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Clients & Directory"
          description="Browse by entity type or view recent onboardings"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 stagger-children">
            <ContentCard
              id="company-types"
              title="Company Types"
              className="min-h-[380px] lg:col-span-2"
            >
              <CompanyTypesPanel />
            </ContentCard>

            <ContentCard
              id="recent-onboarded"
              title="Recently Onboarded"
              className="min-h-[380px] lg:col-span-3"
            >
              <RecentlyOnboardedWidget />
            </ContentCard>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}

function MonthlyTargetChart() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-2">
      <div className="relative">
        <div
          className="animate-donut-reveal relative h-44 w-44 rounded-full md:h-48 md:w-48"
          style={{
            background: `conic-gradient(
              #F36541 0% 59%,
              #3D63A4 59% 80%,
              #F7C948 80% 100%
            )`,
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full border border-gray-100 bg-white shadow-inner">
            <span className="text-2xl font-black text-secondary md:text-3xl">
              20.9%
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Achieved
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid w-full grid-cols-3 gap-2">
        <LegendItem color="#F36541" label="Done" value="59%" />
        <LegendItem color="#3D63A4" label="Active" value="21%" />
        <LegendItem color="#F7C948" label="Pending" value="20%" />
      </div>

      <Chip
        variant="soft"
        size="sm"
        className="mt-4 bg-emerald-50 font-semibold text-emerald-700"
      >
        On Track
      </Chip>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-[#F6FAFF] px-2 py-2.5 text-center">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-sm font-bold text-secondary">{value}</span>
    </div>
  );
}
