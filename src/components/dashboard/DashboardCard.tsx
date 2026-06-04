import React from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export type StatCardAccent = "primary" | "secondary" | "success" | "warning" | "danger";

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

const accentStyles: Record<
  StatCardAccent,
  { border: string; icon: string; value: string; bg: string }
> = {
  primary: {
    border: "border-l-primary",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
    bg: "bg-gradient-to-br from-primary-50/80 via-white to-white",
  },
  secondary: {
    border: "border-l-secondary",
    icon: "bg-secondary/10 text-secondary",
    value: "text-secondary",
    bg: "bg-gradient-to-br from-secondary-50/80 via-white to-white",
  },
  success: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-600",
    bg: "bg-gradient-to-br from-emerald-50/60 via-white to-white",
  },
  warning: {
    border: "border-l-amber-500",
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50/60 via-white to-white",
  },
  danger: {
    border: "border-l-rose-500",
    icon: "bg-rose-50 text-rose-600",
    value: "text-rose-600",
    bg: "bg-gradient-to-br from-rose-50/60 via-white to-white",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
  icon?: LucideIcon;
  accent?: StatCardAccent;
  featured?: boolean;
}

export function StatCard({
  label,
  value,
  subValue,
  className,
  icon: Icon,
  accent = "primary",
  featured = false,
}: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <DashboardCard
      className={clsx(
        "flex flex-col h-full justify-between border-l-[3px]",
        styles.border,
        styles.bg,
        featured ? "min-h-[160px] lg:min-h-[172px]" : "min-h-[132px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={clsx(
            "font-bold text-secondary/70 tracking-wide uppercase leading-snug",
            featured ? "text-xs" : "text-[10px] sm:text-xs",
          )}
        >
          {label}
        </span>
        {Icon && (
          <span
            className={clsx(
              "shrink-0 flex items-center justify-center rounded-xl",
              styles.icon,
              featured ? "h-11 w-11" : "h-9 w-9",
            )}
          >
            <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.25} />
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 mt-4">
        <span
          className={clsx(
            "font-extrabold tracking-tighter",
            styles.value,
            featured ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
          )}
        >
          {value}
        </span>
        {subValue ? (
          <span className="mb-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
            {subValue}
          </span>
        ) : null}
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
