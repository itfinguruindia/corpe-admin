"use client";

import { useParams } from "next/navigation";
import { ClientAssignmentProvider } from "@/contexts/ClientAssignmentContext";
import { ClientCompanyTypeProvider } from "@/contexts/ClientCompanyTypeContext";
import ClientViewOnlyBanner from "@/components/clients/ClientViewOnlyBanner";

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const appNo = params?.appNo ? String(params.appNo) : "";

  if (!appNo) {
    return <>{children}</>;
  }

  return (
    <ClientAssignmentProvider appNo={appNo}>
      <ClientCompanyTypeProvider appNo={appNo}>
        <div className="w-full">
          <div className="px-4 pt-4 sm:px-5 sm:pt-5">
            <ClientViewOnlyBanner />
          </div>
          {children}
        </div>
      </ClientCompanyTypeProvider>
    </ClientAssignmentProvider>
  );
}
