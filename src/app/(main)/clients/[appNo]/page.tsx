"use client";

import React, { Suspense } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
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
import CommentsContent from "@/components/clients/tabs/CommentsContent";
import { safeRouterReplace } from "@/utils/navigation";

const TABS = [
  {
    key: "company-overview",
    label: "Company Overview",
    component: CompanyOverviewContent,
  },
  {
    key: "tracking-status",
    label: "Tracking Status",
    component: TrackingStatusContent,
  },
  {
    key: "application",
    label: "Name Application",
    component: NameApplicationContent,
  },
  { key: "directors", label: "Directors", component: DirectorsContent },
  {
    key: "shareholders",
    label: "Shareholders",
    component: ShareholdersContent,
  },
  {
    key: "uploaded-documents",
    label: "Uploaded Documents",
    component: UploadedDocumentsContent,
  },
  { key: "moa-aoa", label: "MOA & AOA", component: MoaAoaContent },
  {
    key: "registration-documents",
    label: "Registration Documents",
    component: RegistrationDocumentsContent,
  },
  { key: "comments", label: "Comments", component: CommentsContent },
  {
    key: "pricing-and-payment",
    label: "Pricing & Payment",
    component: PricingAndPaymentContent,
  },
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
    safeRouterReplace(router, `${pathname}?${params.toString()}`, {
      scroll: false,
    });
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
        orientation="horizontal"
      >
        <Tabs.ListContainer>
          <Tabs.List className="overflow-x-auto bg-white shadow *:text-sm *:data-[selected=true]:text-white">
            {TABS.map((t, idx) => (
              <Tabs.Tab key={t.key} id={t.key} className="w-max">
                {idx > 0 && <Tabs.Separator />}
                <span className="w-max">{t.label}</span>
                <Tabs.Indicator className="bg-primary" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {TABS.map((tab) => (
          <Tabs.Panel key={tab.key} id={tab.key}>
            {tab.component && <tab.component appNo={appNoStr} />}
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
