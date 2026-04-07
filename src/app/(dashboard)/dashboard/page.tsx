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
  } = data;

  return (
    <div className="space-y-8 pb-10">
      {/* SECTIONS 1 & 2: Top Grid (4 columns) */}
      <section className="grid grid-cols-4 gap-6">
        {/* Row 1 */}
        <StatCard label="Total name application" value={totalApplication} />
        <StatCard
          label="Name application approved"
          value={approveNameApplication}
        />
        <StatCard label="Delay status" value="40%" subValue="" />

        {/* Highlight/Notification Card */}
        <ContentCard title="Highlights/Notifications" className="bg-white">
          <div className="text-sm text-gray-600">
            <p className="mb-2 font-normal text-secondary text-[20px]">
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
        <TableCard title="Raised Tickets" className="col-span-2">
          {/* Horizontal row - Compact with reduced gaps */}
          <div className="flex justify-between  gap-15">
            {/* Application No - Compact width */}
            <div className="shrink-0">
              <p className="text-[12px] text-secondary font-normal ml-5 ">
                Application No.
              </p>
              <p className="truncate text-[20px] font-normal text-[#FF6A3D] ml-5">
                GUJC000001
              </p>
            </div>

            {/* View Message - Compact */}
            <div className="shrink-0 flex flex-col items-center px-2">
              <p className="text-[12px] text-secondary font-normal">
                View Message
              </p>
              <div className="flex items-center justify-center mt-1">
                <MessageSquareText className="h-7 w-7 text-[#FF6A3D]" />
              </div>
            </div>

            {/* Assignee - Compact */}
            <div className="shrink-0">
              <p className="text-[12px] text-secondary font-normal">Assignee</p>
              <p className="truncate text-[20px] font-normal text-black">
                Shaili
              </p>
            </div>

            {/* Time -  */}
            <span className="ml-auto mt-16 whitespace-nowrap text-[14px] font-normal text-[#FF6A3D]">
              11:11 AM
            </span>
          </div>
        </TableCard>

        {/* Empty Placeholder to keep alignment */}
        <div className="hidden lg:block"></div>
      </section>

      {/* SECTION 3: Bottom Grid (3 columns, taller cards) */}
      <section className="grid grid-cols-3 gap-6">
        {/* Company Types List */}
        <ContentCard title="Company Types" className="min-h-75">
          <ul className="list-disc space-y-2 pl-5 text-sm text-secondary text-[20px] font-bold">
            <li>
              <Link href={"/clients?entity=opcs"}>OPCs</Link>
            </li>
            <li>
              <Link
                href={"/clients?entity=privateIndividual%2CprivateCorporate"}
              >
                Private Companies
              </Link>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-secondary text-[20px] font-normal">
                <li>
                  <Link href={"/clients?entity=privateIndividual"}>
                    Individual Shareholding
                  </Link>
                </li>
                <li>
                  <Link href={"/clients?entity=privateCorporate"}>
                    Corporate Shareholders
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link href={"/clients?entity=publicIndividual%2CpublicCorporate"}>
                Public Companies
              </Link>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-secondary text-[20px] font-normal">
                <li>
                  <Link href={"/clients?entity=publicIndividual"}>
                    Individual Shareholding
                  </Link>
                </li>
                <li>
                  <Link href={"/clients?entity=publicCorporate"}>
                    Corporate Shareholders
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link href={"/clients?entity=foreignIndividual"}>
                Foreign Individual
              </Link>
            </li>
          </ul>
        </ContentCard>

        {/* Monthly Target Donut Chart Placeholder */}
        <ChartCard
          title="Total company incorporated/ Monthly target"
          className="min-h-80"
        >
          <div className="flex flex-col items-center justify-center">
            {/* Donut */}
            <div
              className="relative h-48 w-48 rounded-full"
              style={{
                background: `conic-gradient(
          #F7C948 0% 38%,
          #3D63A4 38% 59%,
          #F46A45 59% 100%
        )`,
              }}
            >
              {/* Inner hole */}
              <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-semibold text-secondary">
                  20.93%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-3">
              <LegendItem color="#F7C948" label="Completed" value="65%" />
              <LegendItem color="#F46A45" label="Yet to achived" value="45%" />
            </div>
          </div>
        </ChartCard>

        {/* Recently Onboarded Companies */}
        <ContentCard title="Recently onboarded" className="min-h-75">
          <div className="mt-4">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-8 text-secondary text-lg font-medium">
              <div>Name of companies</div>
              <div>Handled by</div>
              <div>Reviewed by</div>
            </div>

            {/* Divider */}
            <div className="my-3 h-px w-full bg-[#3D63A4]" />

            {/* Rows */}
            <div className="grid grid-cols-3 gap-8 text-sm text-gray-800">
              {[
                ["Alpha Tech Pvt Ltd", "Rohit Sharma", "Anita Verma"],
                ["BlueSky Solutions", "Neha Gupta", "Sanjay Mehta"],
                ["NextGen Systems", "Aman Khanna", "Pooja Singh"],
                ["Vertex Innovations", "Karan Malhotra", "Ritu Jain"],
              ].map((row, i) => (
                <React.Fragment key={i}>
                  {row.map((cell, j) => (
                    <div key={j}>
                      <p className="pb-2">{cell}</p>
                    </div>
                  ))}
                </React.Fragment>
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
    <div className="flex items-center gap-3 text-sm">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-secondary">{label}</span>
      <span className="ml-6 font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
