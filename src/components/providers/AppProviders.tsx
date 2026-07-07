"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toast } from "@heroui/react";
import ReduxProvider from "@/redux/ReduxProvider";
import { isSkippedTransitionError } from "@/utils/navigation";
import { markNavigationActivity } from "@/utils/safeToast";

function NavigationRejectionHandler() {
  useEffect(() => {
    const swallowIfBenign = (error: unknown) =>
      isSkippedTransitionError(error);

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (swallowIfBenign(event.reason)) {
        event.preventDefault();
      }
    };

    const onError = (event: ErrorEvent) => {
      if (swallowIfBenign(event.error ?? event.message)) {
        event.preventDefault();
      }
    };

    const originalConsoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const first = args[0];
      if (
        swallowIfBenign(first) ||
        (typeof first === "string" && swallowIfBenign({ message: first }))
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    const onNavigationIntent = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }
      markNavigationActivity();
    };
    document.addEventListener("click", onNavigationIntent, true);

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);
    return () => {
      console.error = originalConsoleError;
      document.removeEventListener("click", onNavigationIntent, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}

function NavigationActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    markNavigationActivity();
  }, [pathname]);

  return null;
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <NavigationRejectionHandler />
      <NavigationActivityTracker />
      {children}
      <Toast.Provider placement="bottom end" />
    </ReduxProvider>
  );
}
