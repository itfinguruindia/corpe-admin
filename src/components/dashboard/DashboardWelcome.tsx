"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  Star,
  Users,
  MessageSquare,
  Ticket,
  ArrowUpRight,
  ClipboardList,
  Clock,
  CircleCheck,
} from "lucide-react";
import { RootState } from "@/redux/store";
import { adminApi } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";
import clsx from "clsx";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type HeroStat = {
  label: string;
  value: string;
  icon: typeof ClipboardList;
};

const QUICK_CHIPS = [
  { href: "/clients", label: "Clients", icon: Users, permission: PERMISSIONS.CLIENT_VIEW },
  { href: "/messages", label: "Messages", icon: MessageSquare, permission: PERMISSIONS.MSG_VIEW },
  { href: "/tickets", label: "Tickets", icon: Ticket, permission: PERMISSIONS.TICKET_VIEW },
] as const;

export default function DashboardWelcome() {
  const admin = useSelector((state: RootState) => state.auth.admin);
  const { hasPermission } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.DASH_VIEW);

  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const firstName = admin?.name?.trim().split(/\s+/)[0] || "there";
  const visibleChips = QUICK_CHIPS.filter(
    (chip) => !chip.permission || hasPermission(chip.permission),
  );

  useEffect(() => {
    if (!canViewDashboard) return;

    let mounted = true;

    adminApi
      .getDashboardData()
      .then((data) => {
        if (!mounted || !data) return;
        setHeroStats([
          {
            label: "Total Applications",
            value: String(data.totalApplication ?? 0),
            icon: ClipboardList,
          },
          {
            label: "Approved",
            value: String(data.approveNameApplication ?? 0),
            icon: CircleCheck,
          },
          {
            label: "Pending",
            value: String(data.pendingApplication ?? 0),
            icon: Clock,
          },
        ]);
      })
      .catch(() => {
        if (mounted) setHeroStats([]);
      });

    return () => {
      mounted = false;
    };
  }, [canViewDashboard]);

  return (
    <section className="relative">
      {/* Main hero card */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#1a3260] via-[#2d4a8a] to-[#3d5f9a] shadow-[0_20px_60px_-12px_rgba(45,74,138,0.45)]">
        <div className="dashboard-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="dashboard-hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#FF6A3D]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-white/5 blur-2xl"
          aria-hidden
        />

        {/* Inner highlight border */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" />

        <div className="relative grid gap-8 p-7 md:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          {/* Left — copy */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-[#F7C948] text-[#F7C948]" />
                {today}
              </span>
              {admin?.role?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-blue-100/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {admin.isSuperAdmin ? "Super Admin" : admin.role.name}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium text-blue-100/80 md:text-lg">
                {getGreeting()},
              </p>
              <h1 className="text-[2.5rem] font-black leading-[1.05] tracking-tight md:text-5xl lg:text-[3.25rem]">
                <span className="bg-gradient-to-r from-[#FFD0C2] via-[#FFB89E] to-[#FF8A65] bg-clip-text text-transparent">
                  {firstName}
                </span>
              </h1>
            </div>

            <p className="max-w-lg text-sm leading-relaxed text-blue-100/75 md:text-[15px] md:leading-relaxed">
              Track applications, manage clients, and stay on top of your
              team&apos;s workflow — all from one place.
            </p>

            {visibleChips.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {visibleChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <Link
                      key={chip.href}
                      href={chip.href}
                      className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/20"
                    >
                      <Icon className="h-4 w-4 text-[#FFB89E]" strokeWidth={2.25} />
                      {chip.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — live stat cards */}
          {heroStats.length > 0 && (
            <div className="flex flex-col gap-3 lg:min-w-[280px]">
              {heroStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={clsx(
                      "flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md transition-transform",
                      i === 1 && "dashboard-hero-float lg:ml-6",
                      i === 2 && "dashboard-hero-float-delayed lg:ml-3",
                    )}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/70">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-black tabular-nums text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
