import React from "react";
import clsx from "clsx";

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
        "card-accent-top rounded-2xl bg-white border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 text-xs font-bold text-secondary uppercase tracking-widest">
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
  subValue?: string;
  className?: string;
}

export function StatCard({ label, value, subValue, className }: StatCardProps) {
  return (
    <DashboardCard
      className={clsx(
        "flex flex-col h-full min-h-[140px] justify-between border-l-[3px] border-l-primary/40",
        className,
      )}
    >
      <div>
        <span className="text-xs font-bold text-secondary/70 block mb-2 tracking-wide uppercase">
          {label}
        </span>
      </div>

      <div className="flex items-end gap-3 mt-auto">
        <span className="text-4xl md:text-5xl font-extrabold text-primary tracking-tighter">
          {value}
        </span>
        {subValue && (
          <span className="mb-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
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
        <h3 className="mb-3 text-xs font-bold text-secondary uppercase tracking-widest">
          {title}
        </h3>
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
        <h3 className="mb-4 text-xs font-bold text-secondary flex items-center gap-2 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow inline-block" />
          {title}
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
        <h3 className="mb-4 text-xs font-bold text-secondary uppercase tracking-widest">
          {title}
        </h3>
      )}
      {children}
    </DashboardCard>
  );
}
