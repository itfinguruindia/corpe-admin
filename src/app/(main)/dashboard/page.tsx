import React from "react";
import {
  StatCard,
  ContentCard,
  TableCard,
  ChartCard,
} from "@/components/dashboard/DashboardCard";
import FloatingActionButton from "@/components/dashboard/FloatingActionButton";
import { MessageSquareText, Zap } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api";

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
      {/* SECTIONS 1 & 2: Top Grid (4 columns) */}
      <section
        id="stats-overview"
        className="grid md:grid-cols-4 grid-cols-2 gap-6"
      >
        {/* Row 1 */}
        <StatCard label="Total name application" value={totalApplication} />
        <StatCard
          label="Name application approved"
          value={approveNameApplication}
        />
        <StatCard label="Delay status" value="40%" subValue="" />

        {/* Highlight/Notification Card */}
        <ContentCard
          id="highlights"
          title="Highlights/Notifications"
          className="bg-gray-50/50"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-secondary italic">
              “Chhaya completed KYC”
            </p>
          </div>
        </ContentCard>

        {/* Row 2 */}
        <StatCard label="Pending application" value={pendingApplication} />
        <StatCard
          label="Name re-submission, rejected"
          value={rejectedOrResubmitted}
        />

        {/* Raised Tickets Table Placeholder */}
        <TableCard
          id="raised-tickets"
          title="Raised Tickets"
          className="col-span-2"
        >
          <div className="flex flex-wrap justify-between gap-2 items-center bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            {/* Application No */}
            <div className="shrink-0">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Application No.
              </p>
              <p className="text-lg font-bold text-primary">GUJC000001</p>
            </div>

            {/* View Message */}
            <div className="shrink-0 flex flex-col items-center border-gray-200 px-6">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Message
              </p>
              <button className="flex items-center justify-center p-2 rounded-lg hover:bg-white transition-all text-primary border border-transparent hover:border-gray-200 hover:shadow-sm">
                <MessageSquareText className="h-6 w-6" />
              </button>
            </div>

            {/* Assignee */}
            <div className="shrink-0 px-4">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Assignee
              </p>
              <p className="text-lg font-bold text-secondary">Shaili</p>
            </div>

            {/* Time */}
            <div className="ml-auto text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Time
              </p>
              <span className="text-sm font-semibold text-primary">
                11:11 AM
              </span>
            </div>
          </div>
        </TableCard>

        {/* Empty Placeholder to keep alignment */}
        <div className="hidden lg:block"></div>
      </section>

      {/* SECTION 3: Bottom Grid (3 columns, taller cards) */}
      <section className="grid lg:grid-cols-3 grid-cols-1 gap-6">
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
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                OPCs
              </Link>
            </li>
            <li className="space-y-3">
              <Link
                href={"/clients?entity=privateIndividual%2CprivateCorporate"}
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                Private Companies
              </Link>
              <ul className="ml-6 space-y-2 border-l-2 border-gray-100 pl-4">
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
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                Public Companies
              </Link>
              <ul className="ml-6 space-y-2 border-l-2 border-gray-100 pl-4">
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
                className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                Foreign Individual
              </Link>
            </li>
          </ul>
        </ContentCard>

        {/* Monthly Target Donut Chart */}
        <ChartCard
          id="monthly-target"
          title="Monthly Target Progress"
          className="min-h-80"
        >
          <div className="flex flex-col items-center justify-center py-6">
            {/* Donut */}
            <div
              className="relative h-56 w-56 rounded-full shadow-inner-lg"
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
            </div>
          </div>
        </ChartCard>

        {/* Recently Onboarded Companies */}
        <ContentCard
          id="recent-onboarded"
          title="Recently onboarded"
          className="min-h-[400px]"
        >
          <div className="space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-gray-100">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Company Name
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Handled By
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Reviewed By
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {[
                ["Alpha Tech Pvt Ltd", "Rohit Sharma", "Anita Verma"],
                ["BlueSky Solutions", "Neha Gupta", "Sanjay Mehta"],
                ["NextGen Systems", "Aman Khanna", "Pooja Singh"],
                ["Vertex Innovations", "Karan Malhotra", "Ritu Jain"],
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-4 py-3 group hover:bg-gray-50/50 transition-colors"
                >
                  <div className="text-sm font-semibold text-secondary">
                    {row[0]}
                  </div>
                  <div className="text-sm text-gray-600">{row[1]}</div>
                  <div className="text-sm text-gray-600">{row[2]}</div>
                </div>
              ))}
            </div>
          </div>
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
    <div className="flex flex-col items-start gap-1 p-3 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-all shadow-sm hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
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
