"use client";

import { useParams } from "next/navigation";
import CompanyOverviewContent from "@/components/clients/tabs/CompanyOverviewContent";

export default function CompanyOverviewPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <CompanyOverviewContent appNo={String(appNo)} />;
}
