import React from "react";
import clsx from "clsx";
import { Zap } from "lucide-react";

interface DashboardCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function DashboardCard({
  id,
  children,
  className,
  title,
}: DashboardCardProps) {
  return (
    <div
      id={id}
      className={clsx(
        "rounded-xl bg-white border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 text-sm font-semibold text-secondary uppercase tracking-wider">
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
      className={clsx(
        "flex flex-col h-full min-h-[140px] justify-between",
        className,
      )}
    >
      <div>
        <span className="text-sm font-semibold text-secondary block mb-2 tracking-wide">
          {label}
        </span>
      </div>

      <div className="flex items-end gap-3 mt-auto">
        <span className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
          {value}
        </span>
        {subValue && (
          <span className="mb-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center">
            {subValue}
          </span>
        )}
      </div>
    </DashboardCard>
  );
}

interface ContentCardProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentCard({
  id,
  title,
  children,
  className,
}: ContentCardProps) {
  return (
    <DashboardCard id={id} className={clsx("h-full min-h-[140px]", className)}>
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-secondary">{title}</h3>
      )}
      {children}
    </DashboardCard>
  );
}

interface tableCardProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function TableCard({ id, title, children, className }: tableCardProps) {
  return (
    <DashboardCard id={id} className={clsx("relative h-full", className)}>
      {title && (
        <h3 className="mb-4 text-sm font-bold text-secondary flex items-center gap-2">
          {title}
          <Zap className="h-5 w-5 text-gray-400" />
        </h3>
      )}
      {children}
    </DashboardCard>
  );
}
interface ChartCardProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}
export function ChartCard({ id, title, children, className }: ChartCardProps) {
  return (
    <DashboardCard id={id} className={clsx("h-full min-h-[300px]", className)}>
      {title && (
        <h3 className="mb-4 text-sm font-bold text-secondary">{title}</h3>
      )}
      {children}
    </DashboardCard>
  );
}
