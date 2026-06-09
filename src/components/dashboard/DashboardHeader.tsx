"use client";

import { useRouter, usePathname } from "next/navigation";
import { RefreshCcw, Undo2, Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { openMobileSidebar } from "@/redux/slices/layoutSlice";
import GlobalSearch from "@/components/layout/GlobalSearch";
import NotificationBell from "@/components/layout/NotificationBell";
import { Button, Tooltip } from "@heroui/react";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const isRootDashboard = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-20 grid grid-cols-2 grid-rows-1 md:grid-cols-[1fr_auto] gap-y-4 md:gap-y-0 md:gap-x-6 w-full bg-white px-4 md:px-8 shadow-sm border-b border-gray-100 py-4 md:py-8">
      {/* Left Side: Mobile Menu, Navigation & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            isIconOnly
            onPress={() => dispatch(openMobileSidebar())}
            className="shrink-0 text-primary-500 bg-transparent hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Global Search Component */}
      <div className="md:row-[1/2] row-[2/3] md:col-[1/2] col-span-full">
        <GlobalSearch />
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-6 ml-4 col-[-2/-1] row-[1/2] justify-self-end">
        <NotificationBell />

        <div className="flex items-center gap-2">
          {!isRootDashboard && (
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  aria-label="Go back"
                  onPress={() => router.back()}
                  className="rounded-full text-primary-500 border border-gray-100 shadow-sm bg-white hover:bg-gray-50 h-9 w-9"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Go Back</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                aria-label="Refresh page"
                onPress={() => router.refresh()}
                className="rounded-full text-primary-500 border border-gray-100 shadow-sm bg-white hover:bg-gray-50 h-9 w-9"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Refresh Page</Tooltip.Content>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
