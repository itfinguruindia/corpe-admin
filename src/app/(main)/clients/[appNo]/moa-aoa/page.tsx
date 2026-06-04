"use client";

import { useParams } from "next/navigation";
import MoaAoaContent from "@/components/clients/tabs/MoaAoaContent";

export default function MoaAoaPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <MoaAoaContent appNo={String(appNo)} />;
}
