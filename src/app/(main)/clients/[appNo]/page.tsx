"use client";

import React, { Suspense } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, Spinner } from "@heroui/react";

import CompanyOverviewContent from "@/components/clients/tabs/CompanyOverviewContent";
import DirectorsContent from "@/components/clients/tabs/DirectorsContent";
import MoaAoaContent from "@/components/clients/tabs/MoaAoaContent";
import TrackingStatusContent from "@/components/clients/tabs/TrackingStatusContent";
import NameApplicationContent from "@/components/clients/tabs/NameApplicationContent";
import ShareholdersContent from "@/components/clients/tabs/ShareholdersContent";
import UploadedDocumentsContent from "@/components/clients/tabs/UploadedDocumentsContent";
import RegistrationDocumentsContent from "@/components/clients/tabs/RegistrationDocumentsContent";
import PricingAndPaymentContent from "@/components/clients/tabs/PricingAndPaymentContent";

const TABS = [
  { key: "company-overview", label: "Company Overview" },
  { key: "application", label: "Name Application" },
  { key: "tracking-status", label: "Tracking Status" },
  { key: "directors", label: "Directors" },
  { key: "shareholders", label: "Shareholders" },
  { key: "uploaded-documents", label: "Uploaded Documents" },
  { key: "moa-aoa", label: "MOA & AOA" },
  { key: "registration-documents", label: "Registration Documents" },
  { key: "pricing-and-payment", label: "Pricing & Payment" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_KEYS = TABS.map((t) => t.key) as readonly TabKey[];

function isTabKey(value: string): value is TabKey {
  return (TAB_KEYS as readonly string[]).includes(value);
}

function ClientDetailsTabs() {
  const { appNo } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appNoStr = appNo ? String(appNo) : "";

  const tabFromUrl = searchParams.get("tab") ?? "";
  const [activeTab, setActiveTab] = React.useState<TabKey>(
    isTabKey(tabFromUrl) ? tabFromUrl : "company-overview",
  );

  // Keep state in sync if the URL ?tab= changes from elsewhere (back/forward nav).
  React.useEffect(() => {
    const next = searchParams.get("tab") ?? "";
    if (isTabKey(next) && next !== activeTab) {
      setActiveTab(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (key: React.Key) => {
    const keyStr = String(key);
    if (!isTabKey(keyStr)) return;
    setActiveTab(keyStr);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", keyStr);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full p-4 sm:p-5">
      <h1 className="mb-4 text-xl font-bold text-primary sm:mb-6 sm:text-2xl">
        {appNoStr}
      </h1>

      <Tabs
        aria-label="Client sections"
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
        variant="secondary"
        orientation="horizontal"
        className="w-full pb-4 sm:pb-6"
      >
        <Tabs.ListContainer className="pb-2">
          <Tabs.List className="gap-2">
            {TABS.map((t) => (
              <Tabs.Tab
                key={t.key}
                id={t.key}
                className="h-auto rounded-full border bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-secondary border-gray-200 transition-colors hover:border-primary hover:text-primary data-[selected=true]:border-primary data-[selected=true]:text-primary data-[selected=true]:font-semibold"
              >
                <span>{t.label}</span>
                <Tabs.Indicator className="hidden" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {TABS.map((t) => (
          <Tabs.Panel key={t.key} id={t.key} className="pb-6">
            {activeTab === t.key && t.key === "company-overview" && (
              <CompanyOverviewContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "directors" && (
              <DirectorsContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "moa-aoa" && (
              <MoaAoaContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "tracking-status" && (
              <TrackingStatusContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "application" && (
              <NameApplicationContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "shareholders" && (
              <ShareholdersContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "uploaded-documents" && (
              <UploadedDocumentsContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "registration-documents" && (
              <RegistrationDocumentsContent appNo={appNoStr} />
            )}
            {activeTab === t.key && t.key === "pricing-and-payment" && (
              <PricingAndPaymentContent appNo={appNoStr} />
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

export default function ClientDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      <ClientDetailsTabs />
    </Suspense>
  );
}
