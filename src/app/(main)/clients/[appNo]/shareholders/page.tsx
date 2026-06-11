"use client";

import { useParams } from "next/navigation";
import ShareholdersContent from "@/components/clients/tabs/ShareholdersContent";

export default function ShareholdersPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <ShareholdersContent appNo={String(appNo)} />;
}
