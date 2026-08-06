"use client";

import React, { use } from "react";
import FixedBackButton from "@/components/ui/FixedBackButton";
import TrademarkServiceContent from "@/components/addons/trademark/TrademarkServiceContent";

export default function TrademarkServicePage({
  params,
}: {
  params: Promise<{ appNo: string }>;
}) {
  const { appNo } = use(params);

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <FixedBackButton href="/addon-services/trademark-registration" label="Back to Trademark Clients" />
      <h1 className="text-xl font-bold text-primary sm:text-2xl">
        Trademark Service - {appNo}
      </h1>
      <TrademarkServiceContent appNo={appNo} />
    </div>
  );
}
