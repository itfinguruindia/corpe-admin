"use client";

import { useParams } from "next/navigation";
import UploadedDocumentsContent from "@/components/clients/tabs/UploadedDocumentsContent";

export default function UploadedDocumentsPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  return <UploadedDocumentsContent appNo={String(appNo)} />;
}
