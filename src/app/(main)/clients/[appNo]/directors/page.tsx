"use client";

import { useParams } from "next/navigation";
import DirectorsContent from "@/components/clients/tabs/DirectorsContent";
import FixedBackButton from "@/components/ui/FixedBackButton";

export default function DirectorsPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  const appNoStr = String(appNo);

  return (
    <div className="w-full">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <FixedBackButton
          href={`/clients/${appNoStr}?tab=directors`}
          label="Back to Client"
        />
      </div>
      <DirectorsContent appNo={appNoStr} />
    </div>
  );
}
