"use client";

import { useEffect } from "react";
import { Toast } from "@heroui/react";
import ReduxProvider from "@/redux/ReduxProvider";
import { isSkippedTransitionError } from "@/utils/navigation";

function NavigationRejectionHandler() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isSkippedTransitionError(event.reason)) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

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
      {children}
      <Toast.Provider placement="bottom end" />
    </ReduxProvider>
  );
}
