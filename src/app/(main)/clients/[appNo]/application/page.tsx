"use client";

import { useParams } from "next/navigation";
import NameApplicationContent from "@/components/clients/tabs/NameApplicationContent";

export default function NameApplicationPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <NameApplicationContent appNo={String(appNo)} />;
}
