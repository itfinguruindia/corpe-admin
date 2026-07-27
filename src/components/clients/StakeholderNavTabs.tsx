"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

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

  const buildHref = (type: EntityType, id: string) => {
    const segment = type === "director" ? "directors" : "shareholders";
    const base = `/clients/${appNo}/${segment}/${id}`;
    return isDocumentsPath ? `${base}/documents` : base;
  };

  if (!appNo || isLoading || items.length === 0) {
    return null;
  }

  const directorsHref = directors[0]
    ? buildHref("director", directors[0].id)
    : `/clients/${appNo}?tab=directors`;
  const shareholdersHref = shareholders[0]
    ? buildHref("shareholder", shareholders[0].id)
    : `/clients/${appNo}?tab=shareholders`;

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={directorsHref}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
            entityType === "director"
              ? "bg-primary text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {labels.directors}
        </Link>
        {shareholders.length > 0 && (
          <Link
            href={shareholdersHref}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              entityType === "shareholder"
                ? "bg-primary text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {labels.shareholders}
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {items.map((item, index) => {
          const active = String(item.id) === String(currentId);
          return (
            <Link
              key={`${entityType}-${item.id}-${index}`}
              href={buildHref(entityType, item.id)}
              title={item.name}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {item.name && item.name !== item.label ? (
                <span className="ml-1.5 font-normal text-slate-500">
                  · {item.name}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
