"use client";

import { useEffect } from "react";
import { Toast } from "@heroui/react";
import ReduxProvider from "@/redux/ReduxProvider";
import { isSkippedTransitionError } from "@/utils/navigation";

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

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
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
