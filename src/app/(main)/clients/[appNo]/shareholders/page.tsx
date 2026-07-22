"use client";

import { useParams } from "next/navigation";
import ShareholdersContent from "@/components/clients/tabs/ShareholdersContent";
import FixedBackButton from "@/components/ui/FixedBackButton";

export default function ShareholdersPage() {
  const { appNo } = useParams();
  if (!appNo) return null;
  const appNoStr = String(appNo);

  return (
    <div className="w-full">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <FixedBackButton
          href={`/clients/${appNoStr}?tab=shareholders`}
          label="Back to Client"
        />
      </div>
      <ShareholdersContent appNo={appNoStr} />
    </div>
  );
}
