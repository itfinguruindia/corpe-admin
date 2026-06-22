"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/react";
import {
  ClipboardList,
  CircleCheck,
  Clock,
  RotateCcw,
  Timer,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/DashboardCard";
import { adminApi } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";
import clsx from "clsx";

type DashboardStats = {
  totalApplication: number;
  pendingApplication: number;
  approveNameApplication: number;
  rejectedOrResubmitted: number;
};

function StatCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-between rounded-3xl border border-gray-100/80 bg-white p-5 shadow-sm ring-1 ring-primary/10",
        featured ? "min-h-[148px] p-6 lg:min-h-[160px]" : "min-h-[120px]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      </div>
      <Skeleton className="h-10 w-16 rounded-md mt-4" />
    </div>
  );
}

export default function DashboardStatsWidget() {
  const { hasPermission } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.DASH_VIEW);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(canViewDashboard);

  useEffect(() => {
    let mounted = true;

    if (!canViewDashboard) {
      setLoading(false);
      return;
    }

    adminApi
      .getDashboardData()
      .then((data) => {
        if (!mounted || !data) return;
        setStats({
          totalApplication: data.totalApplication ?? 0,
          pendingApplication: data.pendingApplication ?? 0,
          approveNameApplication: data.approveNameApplication ?? 0,
          rejectedOrResubmitted: data.rejectedOrResubmitted ?? 0,
        });
      })
      .catch(() => {
        if (mounted) setStats(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [canViewDashboard]);

  const formatValue = (value: number | undefined) =>
    canViewDashboard && stats ? String(value ?? 0) : "—";

  if (loading) {
    return (
      <section
        id="stats-overview"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 stagger-children"
        aria-busy="true"
        aria-label="Loading dashboard statistics"
      >
        <StatCardSkeleton featured />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </section>
    );
  }

  return (
    <section
      id="stats-overview"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 stagger-children"
      aria-label="Application overview"
    >
      {/* Row 1: hero total + approved + pending */}
      <StatCard
        className="sm:col-span-2 lg:col-span-6"
        label="Total name application"
        value={formatValue(stats?.totalApplication)}
        icon={ClipboardList}
        accent="primary"
        featured
      />

      <StatCard
        className="lg:col-span-3"
        label="Name application approved"
        value={formatValue(stats?.approveNameApplication)}
        icon={CircleCheck}
        accent="success"
      />

      <StatCard
        className="lg:col-span-3"
        label="Pending application"
        value={formatValue(stats?.pendingApplication)}
        icon={Clock}
        accent="warning"
      />

      {/* Row 2: rejected + delay */}
      <StatCard
        className="sm:col-span-2 lg:col-span-6"
        label="Name re-submission, rejected"
        value={formatValue(stats?.rejectedOrResubmitted)}
        icon={RotateCcw}
        accent="danger"
      />

      <StatCard
        className="sm:col-span-2 lg:col-span-6"
        label="Delay status"
        value="40%"
        icon={Timer}
        accent="secondary"
      />
    </section>
  );
}
