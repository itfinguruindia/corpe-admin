"use client";

import { Toast } from "@heroui/react";
import ReduxProvider from "@/redux/ReduxProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      {children}
      <Toast.Provider placement="bottom end" />
    </ReduxProvider>
  );
}
