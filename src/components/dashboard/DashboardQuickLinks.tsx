"use client";

import Link from "next/link";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Rss,
  UserRoundPlus,
  UserRoundX,
  Mail,
  Library,
  MessageSquare,
  Ticket,
  Settings,
  Bell,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

type Accent = "primary" | "secondary";

type QuickLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  permission?: string;
};

const ALL_LINKS: QuickLink[] = [
  {
    href: "/clients",
    label: "Clients",
    description: "Applications & onboarding",
    icon: Users,
    accent: "secondary",
    permission: PERMISSIONS.CLIENT_VIEW,
  },
  {
    href: "/feedbacks",
    label: "Feedbacks",
    description: "Ratings & reviews",
    icon: Rss,
    accent: "primary",
    permission: PERMISSIONS.FEEDBACK_VIEW,
  },
  {
    href: "/notifications",
    label: "Notifications",
    description: "Alerts & updates",
    icon: Bell,
    accent: "secondary",
  },
  {
    href: "/compliance-calendar",
    label: "Compliance",
    description: "Deadlines & filings",
    icon: Calendar,
    accent: "primary",
  },
  {
    href: "/marketing/leads",
    label: "Leads",
    description: "Inbound enquiries",
    icon: UserRoundPlus,
    accent: "primary",
    permission: PERMISSIONS.MARKETING_VIEW,
  },
  {
    href: "/marketing/pending-registrations",
    label: "Pending Reg.",
    description: "Incomplete sign-ups",
    icon: UserRoundX,
    accent: "secondary",
    permission: PERMISSIONS.MARKETING_VIEW,
  },
  {
    href: "/marketing/newsletter",
    label: "Newsletter",
    description: "Subscribers",
    icon: Mail,
    accent: "primary",
    permission: PERMISSIONS.NEWSLETTER_VIEW,
  },
  {
    href: "/documents/templates",
    label: "Templates",
    description: "MOA, AOA & docs",
    icon: Library,
    accent: "secondary",
    permission: PERMISSIONS.DOC_VIEW,
  },
  {
    href: "/messages",
    label: "Messages",
    description: "Live client chat",
    icon: MessageSquare,
    accent: "primary",
    permission: PERMISSIONS.MSG_VIEW,
  },
  {
    href: "/tickets",
    label: "Tickets",
    description: "Support tracking",
    icon: Ticket,
    accent: "secondary",
    permission: PERMISSIONS.TICKET_VIEW,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Users & roles",
    icon: Settings,
    accent: "primary",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];

function QuickLinkTile({ link }: { link: QuickLink }) {
  const Icon = link.icon;
  const isPrimary = link.accent === "primary";

  return (
    <Link
      href={link.href}
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        isPrimary
          ? "border-primary/15 bg-gradient-to-br from-primary/[0.06] to-white hover:border-primary/30 hover:shadow-primary/10"
          : "border-secondary/15 bg-gradient-to-br from-secondary/[0.06] to-white hover:border-secondary/30 hover:shadow-secondary/10",
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105",
            isPrimary ? "bg-primary" : "bg-secondary",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <ArrowUpRight
          className={clsx(
            "h-4 w-4 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            isPrimary ? "text-primary/30 group-hover:text-primary" : "text-secondary/30 group-hover:text-secondary",
          )}
        />
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-bold text-secondary">{link.label}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{link.description}</p>
      </div>
    </Link>
  );
}

export default function DashboardQuickLinks() {
  const { hasPermission } = usePermissions();

  const visibleLinks = ALL_LINKS.filter(
    (link) => !link.permission || hasPermission(link.permission),
  );

  if (visibleLinks.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {visibleLinks.map((link) => (
        <QuickLinkTile key={link.href} link={link} />
      ))}
    </div>
  );
}
