import React from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export type StatCardAccent = "primary" | "secondary" | "success" | "warning" | "danger";

interface DashboardCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  live?: boolean;
}

export function DashboardCard({
  id,
  children,
  className,
  title,
  live,
}: DashboardCardProps) {
  return (
    <div
      id={id}
      className={clsx(
        "rounded-3xl border border-gray-100/80 bg-white p-6 shadow-sm ring-1 ring-black/[0.03]",
        className,
      )}
    >
      {title && (
        <div className="mb-5 flex items-center gap-2.5">
          {live && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
          <h3 className="text-sm font-bold tracking-tight text-secondary">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

const accentStyles: Record<
  StatCardAccent,
  { ring: string; icon: string; value: string; bg: string }
> = {
  primary: {
    ring: "ring-primary/15",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
    bg: "from-primary/[0.06] via-white to-white",
  },
  secondary: {
    ring: "ring-secondary/15",
    icon: "bg-secondary/10 text-secondary",
    value: "text-secondary",
    bg: "from-secondary/[0.06] via-white to-white",
  },
  success: {
    ring: "ring-emerald-500/15",
    icon: "bg-emerald-50 text-emerald-600",
    value: "text-emerald-600",
    bg: "from-emerald-50/50 via-white to-white",
  },
  warning: {
    ring: "ring-amber-500/15",
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-600",
    bg: "from-amber-50/50 via-white to-white",
  },
  danger: {
    ring: "ring-rose-500/15",
    icon: "bg-rose-50 text-rose-600",
    value: "text-rose-600",
    bg: "from-rose-50/50 via-white to-white",
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
    <div
      className={clsx(
        "flex h-full flex-col justify-between rounded-3xl border border-gray-100/80 bg-gradient-to-br p-5 shadow-sm ring-1",
        styles.ring,
        styles.bg,
        featured ? "min-h-[148px] p-6 lg:min-h-[160px]" : "min-h-[120px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={clsx(
            "font-semibold uppercase leading-snug tracking-wide text-gray-500",
            featured ? "text-[11px]" : "text-[10px] sm:text-[11px]",
          )}
        >
          {label}
        </span>
        {Icon && (
          <span
            className={clsx(
              "flex shrink-0 items-center justify-center rounded-xl",
              styles.icon,
              featured ? "h-10 w-10" : "h-9 w-9",
            )}
          >
            <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2.25} />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span
          className={clsx(
            "font-extrabold tracking-tight",
            styles.value,
            featured ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}
        >
          {value}
        </span>
        {subValue ? (
          <span className="mb-1 flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            {subValue}
          </span>
        ) : null}
      </div>
    </div>
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
    <DashboardCard id={id} title={title} className={clsx("h-full", className)}>
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
    <DashboardCard
      id={id}
      title={title}
      live
      className={clsx("relative h-full", className)}
    >
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
    <DashboardCard id={id} title={title} className={clsx("h-full", className)}>
      {children}
    </DashboardCard>
  );
}
