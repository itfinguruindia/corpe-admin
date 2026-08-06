"use client";

import React, { use } from "react";
import FixedBackButton from "@/components/ui/FixedBackButton";

import AccountingBookkeepingServiceContent from "@/components/addons/accounting-bookkeeping/AccountingBookkeepingServiceContent";

export default function AccountingBookkeepingServicePage({
  params,
}: {
  params: Promise<{ appNo: string }>;
}) {
  const { appNo } = use(params);

  return (
    <div className="w-full space-y-6">
      <FixedBackButton
        href="/addon-services/accounting-bookkeeping"
        label="Back to Accounting & Bookkeeping Clients"
      />
      <h1 className="text-xl font-bold text-primary sm:text-2xl">
        Accounting & Bookkeeping - {appNo}
      </h1>
      <AccountingBookkeepingServiceContent appNo={appNo} />
    </div>
  );
}
