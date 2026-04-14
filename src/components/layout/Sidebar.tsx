"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  toggleSidebar,
  closeMobileSidebar,
} from "@/redux/slices/layoutSlice";
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
  ChevronDown,
  PanelRightOpen,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { admin } = useSelector((state: RootState) => state.auth);
  const { isCollapsed: collapsed, isMobileOpen } = useSelector(
    (state: RootState) => state.layout,
  );

  /* Detect mobile to override collapsed behavior */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* On mobile, always treat sidebar as "expanded" for child components */
  const effectiveCollapsed = isMobile ? false : collapsed;

  /* Sync CSS variable for layout margin */
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}px`,
    );
  }, [collapsed]);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    dispatch(closeMobileSidebar());
  }, [pathname, dispatch]);

  /* Lock body scroll when mobile sidebar is open */
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

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
    <>
      {/* Mobile backdrop */}
      <div
        className={clsx(
          "sidebar-backdrop fixed inset-0 z-40 bg-black/50 md:hidden",
          isMobileOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
        onClick={() => dispatch(closeMobileSidebar())}
      />

      <aside
        className={clsx(
          "sidebar min-h-screen bg-[#2d4a8a] flex flex-col fixed left-0 top-0 z-50",
          /* Mobile: full-width drawer, slides in/out */
          "max-md:w-[260px] max-md:transition-transform max-md:duration-300",
          isMobileOpen
            ? "max-md:translate-x-0"
            : "max-md:-translate-x-full",
        )}
        style={{
          /* Desktop width controlled by collapsed state (mobile uses CSS class) */
          width: undefined,
        }}
      >
        {/* Desktop-only dynamic width */}
        <style>{`
          @media (min-width: 768px) {
            .sidebar {
              width: ${collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}px !important;
            }
          }
        `}</style>

        {/* Avatar + toggle */}
        <div className="relative flex flex-col items-center px-4 pt-8 pb-6">
          <div
            className="sidebar-avatar rounded-full bg-yellow-400 flex items-center justify-center my-5"
            style={{
              width: collapsed ? 40 : 80,
              height: collapsed ? 40 : 80,
              fontSize: collapsed ? 14 : 24,
            }}
          >
            <span className="font-extrabold text-[#2d4a8a] tracking-wide leading-none">
              {getInitials(admin?.name)}
            </span>
          </div>

          {/* Role label — clip with overflow */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: collapsed ? 0 : 24,
              opacity: collapsed ? 0 : 1,
            }}
          >
            <p className="text-xs text-blue-300 font-medium uppercase tracking-widest whitespace-nowrap">
              {admin?.isSuperAdmin ? "Super Admin" : admin?.role?.name || "Admin"}
            </p>
          </div>

          {/* Desktop: collapse toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={clsx(
              "absolute top-4 text-blue-200 hover:text-white transition-colors hidden md:block",
              collapsed ? "right-1/2 translate-x-1/2" : "right-4",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </button>

          {/* Mobile: close button */}
          <button
            type="button"
            onClick={() => dispatch(closeMobileSidebar())}
            className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <Divider />

        <nav className="flex flex-col flex-1 py-2 overflow-y-auto overflow-x-hidden">
          <SidebarLink
            label="Dashboard"
            href="/dashboard"
            icon={<LayoutDashboard size={18} />}
            active={pathname === "/dashboard"}
            collapsed={effectiveCollapsed}
          />

          <Divider />

          <SidebarLink
            label="Clients"
            href="/clients"
            icon={<Users size={18} />}
            active={pathname.startsWith("/clients")}
            collapsed={effectiveCollapsed}
          />

          <Divider />

          <SidebarSection
            title="Marketing"
            icon={<Megaphone size={18} />}
            active={pathname.startsWith("/marketing")}
            collapsed={effectiveCollapsed}
          >
            <SubItem
              label="Leads"
              href="/marketing/leads"
              icon={<UserRoundPlus size={15} />}
              active={pathname === "/marketing/leads"}
              collapsed={effectiveCollapsed}
            />
            <SubItem
              label="Newsletter"
              href="/marketing/newsletter"
              icon={<Mail size={15} />}
              active={pathname === "/marketing/newsletter"}
              collapsed={effectiveCollapsed}
            />
          </SidebarSection>

          <Divider />

          <SidebarSection
            title="Documents"
            icon={<FileText size={18} />}
            active={pathname.startsWith("/documents")}
            collapsed={effectiveCollapsed}
          >
            <SubItem
              label="Template Library"
              href="/documents/templates"
              icon={<Library size={15} />}
              active={pathname === "/documents/templates"}
              collapsed={effectiveCollapsed}
            />
          </SidebarSection>

          <Divider />

          <SidebarSection
            title="Communication"
            icon={<MessageSquare size={18} />}
            active={
              pathname.startsWith("/messages") || pathname.startsWith("/tickets")
            }
            collapsed={effectiveCollapsed}
          >
            <SubItem
              label="Client Message"
              href="/messages"
              icon={<MessageSquare size={15} />}
              active={pathname === "/messages"}
              collapsed={effectiveCollapsed}
            />
            <SubItem
              label="Raised Tickets"
              href="/tickets"
              icon={<Ticket size={15} />}
              active={pathname === "/tickets"}
              collapsed={effectiveCollapsed}
            />
          </SidebarSection>

          <Divider />

          <SidebarLink
            label="Settings"
            href="/settings"
            icon={<Settings size={18} />}
            active={pathname === "/settings"}
            collapsed={effectiveCollapsed}
          />
        </nav>
      </aside>
    </>
  );
}

/* -------------------- Components -------------------- */

function Divider() {
  return <div className="h-px bg-white/10 mx-5 my-1" />;
}

/* ---- SidebarLink ---- */

function SidebarLink({
  label,
  href,
  icon,
  active,
  collapsed,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  const showTip = useCallback(() => {
    if (!collapsed || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTip({ top: r.top + r.height / 2, left: r.right + 10 });
  }, [collapsed]);

  const hideTip = useCallback(() => setTip(null), []);

  return (
    <>
      <Link
        ref={ref}
        href={href}
        className={clsx(
          "sidebar-row gap-3 px-6 py-3.5 text-sm font-semibold transition-colors duration-150",
          active
            ? "text-yellow-400 bg-yellow-400/10"
            : "text-blue-100 hover:bg-white/8 hover:text-white",
        )}
        data-collapsed={collapsed}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
      >
        <span
          className={clsx("shrink-0", active ? "opacity-100" : "opacity-70")}
        >
          {icon}
        </span>
        <span className="sidebar-label">{label}</span>
      </Link>

      {/* Fixed tooltip */}
      {collapsed && (
        <span
          className="sidebar-tooltip"
          data-visible={!!tip}
          style={
            tip
              ? { top: tip.top, left: tip.left, transform: "translateY(-50%)" }
              : { top: -9999, left: -9999 }
          }
        >
          {label}
        </span>
      )}
    </>
  );
}

/* ---- SidebarSection ---- */

function SidebarSection({
  title,
  icon,
  active,
  collapsed,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  /* When expanded: normal accordion toggle. */
  const handleClick = () => {
    if (!collapsed) setOpen(!open);
  };

  const btnRef = useRef<HTMLButtonElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const [flyPos, setFlyPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const showFlyout = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setFlyPos({ top: r.top, left: r.right + 6 });
  }, []);

  const hideFlyout = useCallback(() => {
    hideTimer.current = setTimeout(() => setFlyPos(null), 120);
  }, []);

  /* ---- Collapsed: flyout mode ---- */
  if (collapsed) {
    return (
      <>
        <button
          ref={btnRef}
          type="button"
          className={clsx(
            "sidebar-row w-full gap-x-3 px-6 py-3.5 text-sm font-bold transition-colors duration-150",
            active
              ? "text-yellow-400 bg-yellow-400/10"
              : "text-blue-100 hover:bg-white/8 hover:text-white",
          )}
          data-collapsed={collapsed}
          onMouseEnter={showFlyout}
          onMouseLeave={hideFlyout}
        >
          <span
            className={clsx("shrink-0", active ? "opacity-100" : "opacity-70")}
          >
            {icon}
          </span>
          <span className="sidebar-label">{title}</span>
        </button>

        {/* Fixed flyout popover */}
        <div
          ref={flyRef}
          className="sidebar-flyout"
          data-visible={!!flyPos}
          style={
            flyPos
              ? { top: flyPos.top, left: flyPos.left }
              : { top: -9999, left: -9999 }
          }
          onMouseEnter={showFlyout}
          onMouseLeave={hideFlyout}
        >
          <div className="sidebar-flyout-title">{title}</div>
          {children}
        </div>
      </>
    );
  }

  /* ---- Expanded: normal accordion ---- */
  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          "sidebar-row w-full gap-x-3 px-6 py-3.5 text-sm font-bold transition-colors duration-150",
          active
            ? "text-yellow-400 bg-yellow-400/10"
            : "text-blue-100 hover:bg-white/8 hover:text-white",
        )}
        data-collapsed={collapsed}
      >
        <span
          className={clsx("shrink-0", active ? "opacity-100" : "opacity-70")}
        >
          {icon}
        </span>
        <span className="sidebar-label flex items-center justify-between flex-1">
          <span>{title}</span>
          {open ? (
            <ChevronDown size={14} className="opacity-40 shrink-0 ml-2" />
          ) : (
            <ChevronRight size={14} className="opacity-40 shrink-0 ml-2" />
          )}
        </span>
      </button>

      {/* Accordion body */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div className="flex flex-col pb-1">{children}</div>
      </div>
    </div>
  );
}

/* ---- SubItem ---- */

function SubItem({
  label,
  href,
  icon,
  active,
  collapsed,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  /* Inside a flyout (collapsed) — render as a simple styled link */
  if (collapsed) {
    return (
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors duration-150",
          active
            ? "text-yellow-400 bg-yellow-400/8"
            : "text-blue-200 hover:bg-white/8 hover:text-white",
        )}
      >
        <span className={clsx("shrink-0", active ? "opacity-100" : "opacity-60")}>
          {icon}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={clsx(
        "sidebar-row-sub gap-2.5 pl-12 pr-6 py-2.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "text-yellow-400 bg-yellow-400/8"
          : "text-blue-300 hover:bg-white/6 hover:text-blue-100",
      )}
      data-collapsed={collapsed}
    >
      <span className={clsx("shrink-0", active ? "opacity-100" : "opacity-60")}>
        {icon}
      </span>
      <span className="sidebar-label">{label}</span>
    </Link>
  );
}
