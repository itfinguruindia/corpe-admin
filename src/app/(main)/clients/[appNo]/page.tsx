"use client";

import React, { Suspense } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { Tabs, Spinner } from "@heroui/react";
import Link from "next/link";
import FixedBackButton from "@/components/ui/FixedBackButton";

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
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { clientsApi } from "@/lib/api/clients";
import type { Form3Status, LlpAgreementStatus } from "@/types/registrationDocuments";

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

function getTabLabel(
  key: TabKey,
  defaultLabel: string,
  labels: ReturnType<typeof useClientCompanyLabels>["labels"],
  isMoaAoaExcluded: boolean,
) {
  if (key === "directors") return labels.directorsTab;
  if (key === "shareholders") return labels.shareholdersTab;
  if (key === "moa-aoa" && isMoaAoaExcluded) return "Documents";
  return defaultLabel;
}

function ClientDetailsTabs() {
  const { appNo } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { labels, isLlp, isMoaAoaExcluded } = useClientCompanyLabels();
  const appNoStr = appNo ? String(appNo) : "";
  const [llpAgreementStatus, setLlpAgreementStatus] =
    React.useState<LlpAgreementStatus | null>(null);
  const [form3Status, setForm3Status] = React.useState<Form3Status | null>(null);
  const [form3Countdown, setForm3Countdown] = React.useState<string | null>(null);

  const visibleTabs = React.useMemo(
    () => TABS.filter((t) => !(isLlp && t.key === "moa-aoa")),
    [isLlp],
  );

  const tabFromUrl = searchParams.get("tab") ?? "";
  const [activeTab, setActiveTab] = React.useState<TabKey>(
    isTabKey(tabFromUrl) && !(isLlp && tabFromUrl === "moa-aoa")
      ? tabFromUrl
      : "company-overview",
  );

  // Keep state in sync if the URL ?tab= changes from elsewhere (back/forward nav).
  React.useEffect(() => {
    const next = searchParams.get("tab") ?? "";
    if (isTabKey(next) && !(isLlp && next === "moa-aoa") && next !== activeTab) {
      setActiveTab(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLlp]);

  React.useEffect(() => {
    if (isLlp && activeTab === "moa-aoa") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "company-overview");
      safeRouterReplace(router, `${pathname}?${params.toString()}`, {
        scroll: false,
      });
      setActiveTab("company-overview");
    }
  }, [isLlp, activeTab, pathname, router, searchParams]);

  React.useEffect(() => {
    if (!isLlp || !appNoStr) {
      setLlpAgreementStatus(null);
      setForm3Status(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const [llp, form3] = await Promise.all([
          clientsApi.getLlpAgreementStatus(appNoStr),
          clientsApi.getForm3Status(appNoStr),
        ]);
        if (cancelled) return;
        setLlpAgreementStatus(llp);
        setForm3Status(form3);
      } catch {
        if (cancelled) return;
        setLlpAgreementStatus(null);
        setForm3Status(null);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isLlp, appNoStr]);

  React.useEffect(() => {
    const startIso = llpAgreementStatus?.adminFile?.uploadedAt || null;
    const done = Boolean(form3Status?.adminFile?.path);
    if (!startIso || done) {
      setForm3Countdown(null);
      return;
    }
    const startMs = new Date(String(startIso)).getTime();
    if (!Number.isFinite(startMs)) {
      setForm3Countdown(null);
      return;
    }
    const deadlineMs = startMs + 25 * 24 * 60 * 60 * 1000;
    const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

    const tick = () => {
      const diff = deadlineMs - Date.now();
      if (diff <= 0) {
        setForm3Countdown("00d : 00h : 00m : 00s");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setForm3Countdown(
        `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      );
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [llpAgreementStatus?.adminFile?.uploadedAt, form3Status?.adminFile?.path]);

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
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <FixedBackButton href="/clients" label="Back to Clients" />
          <h1 className="text-xl font-bold text-primary sm:text-2xl">
            <Link
              href={`/clients/${appNoStr}?tab=tracking-status`}
              className="hover:underline"
            >
              {appNoStr}
            </Link>
          </h1>
        </div>
        {isLlp && form3Countdown && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Form 3 timer: {form3Countdown}
          </div>
        )}
      </div>

      <Tabs
        aria-label="Client sections"
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
        orientation="horizontal"
      >
        <Tabs.ListContainer>
          <Tabs.List className="overflow-x-auto bg-white shadow *:text-sm *:data-[selected=true]:text-white">
            {visibleTabs.map((t, idx) => (
              <Tabs.Tab key={t.key} id={t.key} className="w-max">
                {idx > 0 && <Tabs.Separator />}
                <span className="w-max">{getTabLabel(t.key, t.label, labels, isMoaAoaExcluded)}</span>
                <Tabs.Indicator className="bg-primary" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {visibleTabs.map((tab) => (
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
