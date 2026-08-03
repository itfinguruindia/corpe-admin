"use client";

import React, { use } from "react";
import FixedBackButton from "@/components/ui/FixedBackButton";
import BankAccountServiceContent from "@/components/addons/bank-account/BankAccountServiceContent";

export default function BankAccountServicePage({
  params,
}: {
  params: Promise<{ appNo: string }>;
}) {
  const { appNo } = use(params);

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <FixedBackButton href="/addon-services/bank-account-setup" label="Back to Bank Account Clients" />
      <h1 className="text-xl font-bold text-primary sm:text-2xl">
        Bank Account Service - {appNo}
      </h1>
      <BankAccountServiceContent appNo={appNo} />
    </div>
  );
}
