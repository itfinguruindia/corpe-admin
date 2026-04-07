import React from "react";
import clsx from "clsx";
import { Zap } from "lucide-react";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function DashboardCard({
  children,
  className,
  title,
}: DashboardCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string; // e.g. "40%"
  className?: string;
}

export function StatCard({ label, value, subValue, className }: StatCardProps) {
  return (
    <DashboardCard
      className={clsx("flex flex-col h-full min-h-[140px]", className)}
    >
      {/* Value on top */}
      <div className="flex items-end gap-8">
        <span className="text-6xl font-bold text-[#F36541]">{value}</span>
        {subValue && (
          <span className="mb-1 text-sm font-medium text-gray-400">
            {subValue}
          </span>
        )}
      </div>

      {/* Label below */}
      <span className="mt-2 text-lg font-bold text-secondary">{label}</span>
    </DashboardCard>
  );
}

interface ContentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentCard({ title, children, className }: ContentCardProps) {
  return (
    <DashboardCard className={clsx("h-full min-h-[140px]", className)}>
      {title && (
        <h3 className="mb-2 text-lg font-bold text-secondary">{title}</h3>
      )}
      {children}
    </DashboardCard>
  );
}

interface tableCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function TableCard({ title, children, className }: tableCardProps) {
  return (
    <DashboardCard
      className={clsx(
        "relative h-full rounded-xl bg-white p-4 shadow-sm ",
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 text-[20px] font-bold text-secondary">{title}</h3>
      )}
      <Zap className="absolute right-3 top-1 h-7 w-7 text-[#FF6A3D]" />
      {children}
    </DashboardCard>
  );
}
interface ChartCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <DashboardCard className={clsx("h-full min-h-[300px] p-6", className)}>
      {title && (
        <h3 className="mb-4 text-xl font-bold text-secondary">{title}</h3>
      )}
      {children}
    </DashboardCard>
  );
}
