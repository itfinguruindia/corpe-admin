"use client";

import { useParams } from "next/navigation";
import TrackingStatusContent from "@/components/clients/tabs/TrackingStatusContent";

export default function TrackingStatusPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <TrackingStatusContent appNo={String(appNo)} />;
}
