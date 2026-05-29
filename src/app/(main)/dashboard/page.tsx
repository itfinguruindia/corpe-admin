import React from "react";
import {
  StatCard,
  ContentCard,
  TableCard,
  ChartCard,
} from "@/components/dashboard/DashboardCard";
import FloatingActionButton from "@/components/dashboard/FloatingActionButton";
import RaisedTicketsWidget from "@/components/dashboard/RaisedTicketsWidget";
import RecentlyOnboardedWidget from "@/components/dashboard/RecentlyOnboardedWidget";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { Chip } from "@heroui/react";

export default async function Dashboard() {
  const data = await adminApi.getDashboardData();
  const {
    totalApplication = "N/A",
    pendingApplication = "N/A",
    approveNameApplication = "N/A",
    rejectedOrResubmitted = "N/A",
  } = data ?? {
    totalApplication: "N/A",
    pendingApplication: "N/A",
    approveNameApplication: "N/A",
    rejectedOrResubmitted: "N/A",
  };

  return (
    <div className="space-y-8 pb-10">
      {/* SECTION 1: Overview Stats (4 columns) */}
      <section
        id="stats-overview"
        className="grid md:grid-cols-4 grid-cols-2 gap-6 stagger-children"
      >
        <StatCard label="Total name application" value={totalApplication} />
        <StatCard
          label="Name application approved"
          value={approveNameApplication}
        />
        <StatCard label="Pending application" value={pendingApplication} />
        <StatCard
          label="Name re-submission, rejected"
          value={rejectedOrResubmitted}
        />

        <StatCard label="Delay status" value="40%" subValue="" />
      </section>

      {/* SECTION 2: Active Monitoring (Raised Tickets & Target) */}
      <section className="grid lg:grid-cols-3 grid-cols-1 gap-6 stagger-children">
        {/* Raised Tickets — Dynamic Widget (Spans 2 columns) */}
        <TableCard
          id="raised-tickets"
          title="Raised Tickets"
          className="lg:col-span-2"
        >
          <RaisedTicketsWidget />
        </TableCard>

        {/* Monthly Target Donut Chart — Static, visually polished */}
        <ChartCard
          id="monthly-target"
          title="Monthly Target Progress"
          className="min-h-80"
        >
          <div className="flex flex-col items-center justify-center py-6">
            {/* Donut */}
            <div
              className="animate-donut-reveal relative h-56 w-56 rounded-full shadow-inner-lg"
              style={{
                background: `conic-gradient(
                  #F36541 0% 59%,
                  #3D63A4 59% 80%,
                  #F7C948 80% 100%
                )`,
              }}
            >
              <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center shadow-lg border border-gray-50">
                <span className="text-3xl font-black text-secondary">
                  20.9%
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  Achieved
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-10 grid grid-cols-2 gap-4 w-full px-4">
              <LegendItem color="#F36541" label="Completed" value="59%" />
              <LegendItem color="#3D63A4" label="In Progress" value="21%" />
              <LegendItem color="#F7C948" label="Pending" value="20%" />
              <div className="col-span-2 flex justify-center pt-2">
                <Chip variant="soft" size="sm" className="bg-green-50 text-green-700 font-semibold">
                  On Track
                </Chip>
              </div>
            </div>
          </div>
        </ChartCard>
      </section>

      {/* SECTION 3: Directory & Activity (Company Types & Recently Onboarded) */}
      <section className="grid lg:grid-cols-3 grid-cols-1 gap-6 stagger-children">
        {/* Company Types List */}
        <ContentCard
          id="company-types"
          title="Company Types"
          className="min-h-[400px]"
        >
          <ul className="space-y-4">
            <li>
              <Link
                href={"/clients?entity=opcs"}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-125"></div>
                OPCs
              </Link>
            </li>
            <li className="space-y-3">
              <Link
                href={"/clients?entity=privateIndividual%2CprivateCorporate"}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-125"></div>
                Private Companies
              </Link>
              <ul className="ml-6 space-y-2 border-l-2 border-primary/10 pl-4">
                <li>
                  <Link
                    href={"/clients?entity=privateIndividual"}
                    className="text-sm text-gray-600 hover:text-secondary transition-colors"
                  >
                    Individual Shareholding
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/clients?entity=privateCorporate"}
                    className="text-sm text-gray-600 hover:text-secondary transition-colors"
                  >
                    Corporate Shareholders
                  </Link>
                </li>
              </ul>
            </li>

            <li className="space-y-3">
              <Link
                href={"/clients?entity=publicIndividual%2CpublicCorporate"}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-125"></div>
                Public Companies
              </Link>
              <ul className="ml-6 space-y-2 border-l-2 border-primary/10 pl-4">
                <li>
                  <Link
                    href={"/clients?entity=publicIndividual"}
                    className="text-sm text-gray-600 hover:text-secondary transition-colors"
                  >
                    Individual Shareholding
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/clients?entity=publicCorporate"}
                    className="text-sm text-gray-600 hover:text-secondary transition-colors"
                  >
                    Corporate Shareholders
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                href={"/clients?entity=foreignIndividual"}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:scale-125"></div>
                Foreign Individual
              </Link>
            </li>
          </ul>
        </ContentCard>

        {/* Recently Onboarded — Dynamic Widget (Spans 2 columns) */}
        <ContentCard
          id="recent-onboarded"
          title="Recently onboarded"
          className="min-h-[400px] lg:col-span-2"
        >
          <RecentlyOnboardedWidget />
        </ContentCard>
      </section>

      <FloatingActionButton />
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
    <div className="flex flex-col items-start gap-1.5 p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all shadow-sm hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold text-secondary">{value}</span>
    </div>
  );
}
