"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleSidebar, closeMobileSidebar } from "@/redux/slices/layoutSlice";
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
  Rss,
  LogOut,
  UserRoundX,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { setProfilePictureUrl } from "@/redux/slices/authSlice";
import { performLogout } from "@/utils/auth";
import useSwal from "@/utils/useSwal";
import { Button } from "@heroui/react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 68;

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { admin, profilePictureUrl } = useSelector(
    (state: RootState) => state.auth,
  );
  const { isCollapsed: collapsed, isMobileOpen } = useSelector(
    (state: RootState) => state.layout,
  );
  const swal = useSwal();
  const { hasPermission } = usePermissions();

  const showDashboard = hasPermission(PERMISSIONS.DASH_VIEW);
  const showClients = hasPermission(PERMISSIONS.CLIENT_VIEW);
  const showFeedbacks = hasPermission(PERMISSIONS.FEEDBACK_VIEW);
  const showMarketing = hasPermission(PERMISSIONS.MARKETING_VIEW);
  const showNewsletter = hasPermission(PERMISSIONS.NEWSLETTER_VIEW);
  const showDocuments = hasPermission(PERMISSIONS.DOC_VIEW);
  const showMessages = hasPermission(PERMISSIONS.MSG_VIEW);
  const showTickets = hasPermission(PERMISSIONS.TICKET_VIEW);
  const showSettings = hasPermission(PERMISSIONS.SETTINGS_VIEW);

  /* Detect mobile to override collapsed behavior */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
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

  const fetchProfilePictureUrl = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(
        "/auth/admin-profile-picture-url",
        {
          headers: {
            "x-access-token": token || "",
            "x-access-token-type": "accessToken",
          },
        },
      );
      if (response.data.success && response.data.data?.profilePictureUrl) {
        dispatch(setProfilePictureUrl(response.data.data.profilePictureUrl));
      }
    } catch (error) {
      console.error("Failed to fetch profile picture URL", error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (admin?.profilePicture && !profilePictureUrl) {
      fetchProfilePictureUrl();
    }
  }, [admin, profilePictureUrl, fetchProfilePictureUrl]);

  const handleLogout = async () => {
    const result = await swal({
      title: "Log out?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF6A3D",
    });

    if (!result.isConfirmed) return;

    await performLogout({ recordActivity: true, redirectTo: "/login" });
  };

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
          "sidebar flex h-screen min-h-0 flex-col overflow-hidden bg-[#2d4a8a] fixed left-0 top-0 z-50",
          /* Mobile: full-width drawer, slides in/out */
          "max-md:w-[260px] max-md:transition-transform max-md:duration-300",
          isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
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

        <div className="relative flex shrink-0 flex-col items-center px-4 pt-8 pb-6">
          <Link
            href="/settings"
            aria-label="Go to settings"
            className="flex flex-col items-center rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <div
              className="sidebar-avatar relative rounded-full bg-yellow-400 flex items-center justify-center my-5 overflow-hidden border-2 border-white/20 shadow-lg transition-all duration-300"
              style={{
                width: collapsed ? 44 : 88,
                height: collapsed ? 44 : 88,
              }}
            >
              {profilePictureUrl ? (
                <Image
                  src={profilePictureUrl}
                  alt={admin?.name || "User"}
                  fill
                  sizes={collapsed ? "44px" : "88px"}
                  priority
                  className="object-cover"
                />
              ) : (
                <span
                  className="font-extrabold text-[#2d4a8a] tracking-wide leading-none"
                  style={{
                    fontSize: collapsed ? 16 : 28,
                  }}
                >
                  {getInitials(admin?.name)}
                </span>
              )}
            </div>

            {/* Role label — clip with overflow */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: collapsed ? 0 : 32,
                opacity: collapsed ? 0 : 1,
              }}
            >
              <p className="text-[10px] text-blue-300 text-center font-medium uppercase tracking-widest whitespace-nowrap">
                {admin?.isSuperAdmin
                  ? "Super Admin"
                  : admin?.role?.name || "Admin"}
              </p>
              <p className="text-sm text-primary text-center font-semibold uppercase tracking-widest whitespace-nowrap">
                {admin?.name || ""}
              </p>
            </div>
          </Link>

          {/* Desktop: collapse toggle */}
          <Button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={clsx(
              "absolute top-4 text-blue-200 hover:text-white transition-colors hidden md:block",
              "bg-transparent shadow-none border-0 ring-0 outline-none min-h-0 h-auto p-0 rounded-md",
              collapsed ? "right-1/2 translate-x-1/2" : "right-4",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </Button>

          {/* Mobile: close button */}
          <Button
            type="button"
            onClick={() => dispatch(closeMobileSidebar())}
            className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors md:hidden bg-transparent shadow-none border-0 ring-0 outline-none min-h-0 h-auto p-0 rounded-md"
          >
            <X size={22} />
          </Button>
        </div>

        <Divider />

        <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide [&>*]:shrink-0">
          {showDashboard && (
            <SidebarLink
              label="Dashboard"
              href="/dashboard"
              icon={<LayoutDashboard size={18} />}
              active={pathname === "/dashboard"}
              collapsed={effectiveCollapsed}
            />
          )}

          {showDashboard && (showClients || showFeedbacks) && <Divider />}

          {showClients && (
            <SidebarLink
              label="Clients"
              href="/clients"
              icon={<Users size={18} />}
              active={pathname.startsWith("/clients")}
              collapsed={effectiveCollapsed}
            />
          )}

          {showClients && showFeedbacks && <Divider />}

          {showFeedbacks && (
            <SidebarLink
              label="Feedbacks"
              href="/feedbacks"
              icon={<Rss size={18} />}
              active={pathname.startsWith("/feedbacks")}
              collapsed={effectiveCollapsed}
            />
          )}

          {(showMarketing || showNewsletter) && <Divider />}

          {(showMarketing || showNewsletter) && (
            <SidebarSection
              title="Marketing"
              icon={<Megaphone size={18} />}
              active={pathname.startsWith("/marketing")}
              collapsed={effectiveCollapsed}
            >
              {showMarketing && (
                <SubItem
                  label="Leads"
                  href="/marketing/leads"
                  icon={<UserRoundPlus size={15} />}
                  active={pathname === "/marketing/leads"}
                  collapsed={effectiveCollapsed}
                />
              )}
              {showMarketing && (
                <SubItem
                  label="Pending Registration"
                  href="/marketing/pending-registrations"
                  icon={<UserRoundX size={15} />}
                  active={pathname === "/marketing/pending-registrations"}
                  collapsed={effectiveCollapsed}
                />
              )}
              {showNewsletter && (
                <SubItem
                  label="Newsletter"
                  href="/marketing/newsletter"
                  icon={<Mail size={15} />}
                  active={pathname === "/marketing/newsletter"}
                  collapsed={effectiveCollapsed}
                />
              )}
            </SidebarSection>
          )}

          {showDocuments && <Divider />}

          {showDocuments && (
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
          )}

          {(showMessages || showTickets) && <Divider />}

          {(showMessages || showTickets) && (
            <SidebarSection
              title="Communication"
              icon={<MessageSquare size={18} />}
              active={
                pathname.startsWith("/messages") ||
                pathname.startsWith("/tickets")
              }
              collapsed={effectiveCollapsed}
            >
              {showMessages && (
                <SubItem
                  label="Client Message"
                  href="/messages"
                  icon={<MessageSquare size={15} />}
                  active={pathname === "/messages"}
                  collapsed={effectiveCollapsed}
                />
              )}
              {showTickets && (
                <SubItem
                  label="Raised Tickets"
                  href="/tickets"
                  icon={<Ticket size={15} />}
                  active={pathname === "/tickets"}
                  collapsed={effectiveCollapsed}
                />
              )}
            </SidebarSection>
          )}
        </nav>

        <div className="shrink-0 pb-2">
          <Divider />

          {showSettings && (
            <SidebarLink
              label="Settings"
              href="/settings"
              icon={<Settings size={18} />}
              active={pathname.startsWith("/settings")}
              collapsed={effectiveCollapsed}
            />
          )}

          <Divider />

          <SidebarTooltip
            label="Logout"
            active={false}
            collapsed={effectiveCollapsed}
            icon={<LogOut size={18} />}
          >
            <Button
              onClick={handleLogout}
              type="button"
              className="text-left w-full justify-start bg-transparent shadow-none border-0 ring-0 outline-none min-h-0 h-auto rounded-none px-0 py-0 font-[inherit]"
            >
              Logout
            </Button>
          </SidebarTooltip>
        </div>
      </aside>
    </>
  );
}

/* -------------------- Components -------------------- */

function Divider() {
  return <div className="h-px shrink-0 bg-white/10 mx-5 my-1" />;
}

function SidebarTooltip({
  collapsed,
  label,
  active,
  icon,
  children,
}: {
  collapsed: boolean;
  label: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  const showTip = useCallback(() => {
    if (!collapsed || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTip({ top: r.top + r.height / 2, left: r.right + 10 });
  }, [collapsed]);

  const hideTip = useCallback(() => setTip(null), []);

  const handleRowClick = (e: React.MouseEvent) => {
    if (collapsed && ref.current) {
      const clickable = ref.current.querySelector("a, button") as HTMLElement;
      if (clickable && !clickable.contains(e.target as Node)) {
        clickable.click();
      }
    }
  };

  return (
    <>
      <div
        ref={ref}
        onClick={handleRowClick}
        className={clsx(
          "sidebar-row relative z-0 w-full! shrink-0 gap-3 px-6 py-3.5 text-sm font-semibold transition-colors duration-150",
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
        <div className="overflow-hidden">{children}</div>
      </div>

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

/* ---- SidebarLink ---- */

function SidebarLink(linkProps: {
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarTooltip {...linkProps}>
      <div className="flex">
        <Link href={linkProps.href} className="flex-1">
          {linkProps.label}
        </Link>
      </div>
    </SidebarTooltip>
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
        <Button
          ref={btnRef}
          type="button"
          className={clsx(
            "sidebar-row relative z-0 grid! w-full shrink-0 gap-x-3 px-6 py-3.5 text-sm font-bold transition-colors duration-150",
            "shadow-none border-0 ring-0 outline-none min-h-0 h-auto rounded-none [background-image:none]",
            active
              ? "text-yellow-400 bg-yellow-400/10"
              : "bg-transparent text-blue-100 hover:bg-white/8 hover:text-white",
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
        </Button>

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
    <div className="shrink-0">
      <Button
        type="button"
        onClick={handleClick}
        className={clsx(
          "sidebar-row relative z-0 grid! w-full shrink-0 gap-x-3 px-6 py-3.5 text-sm font-bold transition-colors duration-150",
          "shadow-none border-0 ring-0 outline-none min-h-0 h-auto rounded-none [background-image:none]",
          active
            ? "text-yellow-400 bg-yellow-400/10"
            : "bg-transparent text-blue-100 hover:bg-white/8 hover:text-white",
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
      </Button>

      {/* Accordion body */}
      <div
        className={clsx(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col pb-1">{children}</div>
        </div>
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
        <span
          className={clsx("shrink-0", active ? "opacity-100" : "opacity-60")}
        >
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
        "sidebar-row-sub shrink-0 gap-2.5 pl-12 pr-6 py-2.5 text-[13px] font-medium transition-colors duration-150",
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
