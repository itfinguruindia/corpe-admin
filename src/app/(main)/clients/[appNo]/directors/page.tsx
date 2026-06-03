"use client";

import { useParams } from "next/navigation";
import DirectorsContent from "@/components/clients/tabs/DirectorsContent";

export default function DirectorsPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <DirectorsContent appNo={String(appNo)} />;
}
