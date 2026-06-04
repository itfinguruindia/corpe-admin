"use client";

import { useParams } from "next/navigation";
import PricingAndPaymentContent from "@/components/clients/tabs/PricingAndPaymentContent";

export default function PricingAndPaymentPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <PricingAndPaymentContent appNo={String(appNo)} />;
}
