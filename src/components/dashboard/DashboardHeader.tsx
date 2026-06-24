"use client";

import { useRouter, usePathname } from "next/navigation";
import { safeRouterRefresh } from "@/utils/navigation";
import { Undo2, Menu, RefreshCw } from "lucide-react";
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
    <header
      className={
        isRootDashboard
          ? "sticky top-0 z-20 w-full border-b border-gray-100/80 bg-[#F6FAFF]/90 px-4 py-4 backdrop-blur-md md:px-8"
          : "sticky top-0 z-20 grid w-full grid-cols-2 grid-rows-1 gap-y-4 border-b border-gray-100 bg-white px-4 py-4 shadow-sm md:grid-cols-[1fr_auto] md:gap-x-6 md:gap-y-0 md:py-6 md:px-8"
      }
    >
      {isRootDashboard ? (
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            onPress={() => dispatch(openMobileSidebar())}
            className="shrink-0 bg-transparent text-primary md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="min-w-0 flex-1">
            <GlobalSearch />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationBell />
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  aria-label="Refresh page"
                  onPress={() => safeRouterRefresh(router)}
                  className="h-10 w-10 min-w-10 rounded-xl border border-gray-200/80 bg-white text-gray-500 shadow-sm hover:bg-white hover:text-primary"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Refresh Page</Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-start gap-4 md:flex-row md:items-center">
            <Button
              isIconOnly
              onPress={() => dispatch(openMobileSidebar())}
              className="shrink-0 bg-transparent text-primary-500 hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <div className="col-span-full row-[2/3] md:col-[1/2] md:row-[1/2]">
            <GlobalSearch />
          </div>

          <div className="col-[-2/-1] row-[1/2] ml-4 flex items-center gap-3 justify-self-end md:gap-6">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    aria-label="Go back"
                    onPress={() => router.back()}
                    className="h-9 w-9 rounded-full border border-gray-100 bg-white text-primary-500 shadow-sm hover:bg-gray-50"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Go Back</Tooltip.Content>
              </Tooltip>
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    aria-label="Refresh page"
                    onPress={() => safeRouterRefresh(router)}
                    className="h-9 w-9 min-w-9 rounded-full border border-gray-100 bg-white text-primary-500 shadow-sm hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Refresh Page</Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
