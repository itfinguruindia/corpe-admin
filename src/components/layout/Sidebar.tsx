"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  UserRoundPlus,
  Mail,
  FileText,
  Library,
  MessageSquare,
  Ticket,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { admin } = useSelector((state: RootState) => state.auth);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <aside className="w-65 min-h-screen bg-[#2d4a8a] flex flex-col fixed left-0 top-0">
      {/* Avatar */}
      <div className="flex flex-col items-center px-4 pt-8 pb-6">
        <div
          className="rounded-full bg-yellow-400 flex items-center justify-center mb-3"
          style={{ width: 80, height: 80 }}
        >
          <span className="text-2xl font-extrabold text-[#2d4a8a] tracking-wide">
            {getInitials(admin?.name)}
          </span>
        </div>
        <p className="text-xs text-blue-300 font-medium uppercase tracking-widest">
          {admin?.isSuperAdmin ? "Super Admin" : admin?.role?.name || "Admin"}
        </p>
      </div>

      <Divider />

      <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
        <SidebarLink
          label="Dashboard"
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          active={pathname === "/dashboard"}
        />

        <Divider />

        <SidebarLink
          label="Clients"
          href="/clients"
          icon={<Users size={18} />}
          active={pathname.startsWith("/clients")}
        />

        <Divider />

        <SidebarSection
          title="Marketing"
          href="/marketing/leads"
          icon={<Megaphone size={18} />}
          active={pathname.startsWith("/marketing")}
        >
          <SubItem
            label="Leads"
            href="/marketing/leads"
            icon={<UserRoundPlus size={15} />}
            active={pathname === "/marketing/leads"}
          />
          <SubItem
            label="Newsletter"
            href="/marketing/newsletter"
            icon={<Mail size={15} />}
            active={pathname === "/marketing/newsletter"}
          />
        </SidebarSection>

        <Divider />

        <SidebarSection
          title="Documents"
          href="/documents/templates"
          icon={<FileText size={18} />}
          active={pathname.startsWith("/documents")}
        >
          <SubItem
            label="Template Library"
            href="/documents/templates"
            icon={<Library size={15} />}
            active={pathname === "/documents/templates"}
          />
        </SidebarSection>

        <Divider />

        <SidebarSection
          title="Communication"
          href="/messages"
          icon={<MessageSquare size={18} />}
          active={
            pathname.startsWith("/messages") || pathname.startsWith("/tickets")
          }
        >
          <SubItem
            label="Client Message"
            href="/messages"
            icon={<MessageSquare size={15} />}
            active={pathname === "/messages"}
          />
          <SubItem
            label="Raised Tickets"
            href="/tickets"
            icon={<Ticket size={15} />}
            active={pathname === "/tickets"}
          />
        </SidebarSection>

        <Divider />

        <SidebarLink
          label="Settings"
          href="/settings"
          icon={<Settings size={18} />}
          active={pathname === "/settings"}
        />
      </nav>
    </aside>
  );
}

/* -------------------- Components -------------------- */

function Divider() {
  return <div className="h-px bg-white/10 mx-5 my-1" />;
}

function SidebarLink({
  label,
  href,
  icon,
  active,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-6 py-3.5 text-sm font-semibold transition-colors duration-150",
        active
          ? "text-yellow-400 bg-yellow-400/10"
          : "text-blue-100 hover:bg-white/8 hover:text-white",
      )}
    >
      <span className={clsx("shrink-0", active ? "opacity-100" : "opacity-70")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

function SidebarSection({
  title,
  href,
  icon,
  active,
  children,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-colors duration-150",
          active
            ? "text-yellow-400 bg-yellow-400/10"
            : "text-blue-100 hover:bg-white/8 hover:text-white",
        )}
      >
        <span
          className={clsx("shrink-0", active ? "opacity-100" : "opacity-70")}
        >
          {icon}
        </span>
        <span className="flex-1">{title}</span>
        <ChevronRight size={14} className="opacity-40" />
      </Link>
      <div className="flex flex-col pb-1">{children}</div>
    </div>
  );
}

function SubItem({
  label,
  href,
  icon,
  active,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-2.5 pl-12 pr-6 py-2.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "text-yellow-400 bg-yellow-400/8"
          : "text-blue-300 hover:bg-white/6 hover:text-blue-100",
      )}
    >
      <span className={clsx("shrink-0", active ? "opacity-100" : "opacity-60")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
