"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { FileText, Users } from "lucide-react";

import { clientsApi } from "@/lib/api/clients";
import { useClientCompanyLabels } from "@/contexts/ClientCompanyTypeContext";
import { toStakeholderId } from "@/utils/stakeholderIds";

type EntityType = "director" | "shareholder";

type StakeholderTabItem = {
  id: string;
  label: string;
  name: string;
};

type StakeholderNavTabsProps = {
  entityType: EntityType;
};

function resolvePersonName(record: any, fallback: string): string {
  return (
    record?.name ||
    record?.directorName ||
    record?.shareholderName ||
    [record?.firstName, record?.lastName].filter(Boolean).join(" ").trim() ||
    fallback
  );
}

export default function StakeholderNavTabs({
  entityType,
}: StakeholderNavTabsProps) {
  const params = useParams() || {};
  const pathname = usePathname() || "";
  const { labels } = useClientCompanyLabels();

  const appNo = String((params as { appNo?: string }).appNo || "");
  const currentId = String((params as { id?: string }).id || "");

  const [directors, setDirectors] = useState<StakeholderTabItem[]>([]);
  const [shareholders, setShareholders] = useState<StakeholderTabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDocumentsPath = pathname.includes("/documents");

  useEffect(() => {
    if (!appNo) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await clientsApi.getDirectorAndShareHolders(
          appNo,
          false,
        );
        if (cancelled || !response?.data) return;

        const mappedDirectors = (response.data.directors || []).map(
          (d: any, idx: number) => ({
            id: toStakeholderId(d, idx),
            label: `${labels.director} ${idx + 1}`,
            name: resolvePersonName(d, `${labels.director} ${idx + 1}`),
          }),
        );

        const mappedShareholders = (response.data.shareholders || []).map(
          (s: any, idx: number) => ({
            id: toStakeholderId(s, idx),
            label: `${labels.shareholder} ${idx + 1}`,
            name: resolvePersonName(s, `${labels.shareholder} ${idx + 1}`),
          }),
        );

        setDirectors(mappedDirectors);
        setShareholders(mappedShareholders);
      } catch (err) {
        console.error("Failed to load stakeholder tabs:", err);
        if (!cancelled) {
          setDirectors([]);
          setShareholders([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [appNo, labels.director, labels.shareholder]);

  const items = entityType === "director" ? directors : shareholders;

  const buildHref = (type: EntityType, id: string, documents = false) => {
    const segment = type === "director" ? "directors" : "shareholders";
    const base = `/clients/${appNo}/${segment}/${id}`;
    return documents ? `${base}/documents` : base;
  };

  if (!appNo || isLoading) {
    return (
      <div className="mb-5 h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
    );
  }

  if (items.length === 0) return null;

  const activeItem =
    items.find((item) => String(item.id) === String(currentId)) || items[0];

  const directorsHref = directors[0]
    ? buildHref("director", directors[0].id, isDocumentsPath)
    : `/clients/${appNo}?tab=directors`;
  const shareholdersHref = shareholders[0]
    ? buildHref("shareholder", shareholders[0].id, isDocumentsPath)
    : `/clients/${appNo}?tab=shareholders`;

  const listHref =
    entityType === "director"
      ? `/clients/${appNo}?tab=directors`
      : `/clients/${appNo}?tab=shareholders`;

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Top bar: back + app + entity switch + details/docs */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Link
            href={listHref}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-[#2B4C7E]"
          >
            ← Back
          </Link>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <Link
            href={`/clients/${appNo}?tab=tracking-status`}
            className="text-base font-bold tracking-wide text-[#2B4C7E] hover:underline"
          >
            {appNo}
          </Link>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            role="tablist"
            aria-label="Stakeholder type"
          >
            <Link
              href={directorsHref}
              role="tab"
              aria-selected={entityType === "director"}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                entityType === "director"
                  ? "bg-[#2B4C7E] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {labels.directors}
            </Link>
            {shareholders.length > 0 && (
              <Link
                href={shareholdersHref}
                role="tab"
                aria-selected={entityType === "shareholder"}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  entityType === "shareholder"
                    ? "bg-[#2B4C7E] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {labels.shareholders}
              </Link>
            )}
          </div>
        </div>

        <div
          className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start sm:self-auto"
          role="tablist"
          aria-label="Profile section"
        >
          <Link
            href={buildHref(entityType, activeItem.id, false)}
            role="tab"
            aria-selected={!isDocumentsPath}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              !isDocumentsPath
                ? "bg-white text-[#2B4C7E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Profile
          </Link>
          <Link
            href={buildHref(entityType, activeItem.id, true)}
            role="tab"
            aria-selected={isDocumentsPath}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              isDocumentsPath
                ? "bg-white text-[#2B4C7E] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Documents
          </Link>
        </div>
      </div>

      {/* Person switcher - only one row */}
      <div
        className="flex gap-1 overflow-x-auto px-2 sm:px-3"
        role="tablist"
        aria-label={`${labels.director} list`}
      >
        {items.map((item, index) => {
          const active = String(item.id) === String(currentId);
          return (
            <Link
              key={`${entityType}-${item.id}-${index}`}
              href={buildHref(entityType, item.id, isDocumentsPath)}
              role="tab"
              aria-selected={active}
              title={item.name}
              className={`relative shrink-0 whitespace-nowrap px-3 py-3 text-sm transition-colors ${
                active
                  ? "font-semibold text-[#2B4C7E]"
                  : "font-medium text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{item.label}</span>
              {item.name && item.name !== item.label ? (
                <span
                  className={`ml-1.5 font-normal ${
                    active ? "text-[#2B4C7E]/80" : "text-slate-400"
                  }`}
                >
                  · {item.name}
                </span>
              ) : null}
              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#E28743]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
