"use client";

import { useParams } from "next/navigation";
import RegistrationDocumentsContent from "@/components/clients/tabs/RegistrationDocumentsContent";

export default function RegistrationDocumentsPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <RegistrationDocumentsContent appNo={String(appNo)} />;
}
