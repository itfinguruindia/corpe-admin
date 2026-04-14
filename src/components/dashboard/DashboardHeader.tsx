"use client";

import { useRouter, usePathname } from "next/navigation";
import { Bell, RefreshCcw, Undo2, Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { openMobileSidebar } from "@/redux/slices/layoutSlice";
import GlobalSearch from "@/components/layout/GlobalSearch";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Determine if we should show navigation actions (back/refresh)
  // Usually shown on non-root dashboard pages
  const isRootDashboard = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-20 grid grid-cols-2 grid-rows-1 md:grid-cols-[1fr_auto] gap-y-6 md:gap-x-6 w-full bg-white px-4 md:px-8 shadow-sm border-b border-gray-100 py-4 md:py-8">
      {/* Left Side: Mobile Menu, Navigation & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => dispatch(openMobileSidebar())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-500 hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Global Search Component */}
      <div className="md:row-[1/2] row-[2/3] md:col-[1/2] col-span-full">
        <GlobalSearch />
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6 ml-4 col-[-2/-1] row-[1/2] justify-self-end">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-6 w-6 md:h-8 md:w-8" />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </button>

        {/* Add/Plus Icon */}
        {/* <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary-500 hover:bg-gray-100 transition-colors">
          <Image
            src="/plus.png"
            width={32}
            height={32}
            alt="Add item"
            className="h-6 w-6 md:h-8 md:w-8 object-contain"
          />
        </button> */}

        {/* Navigation Actions (Back/Refresh) */}
        <div className="flex items-center gap-2">
          {!isRootDashboard && (
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary-500 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
              title="Go Back"
            >
              <Undo2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => router.refresh()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary-500 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
            title="Refresh Page"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
