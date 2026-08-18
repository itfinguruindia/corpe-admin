"use client";

import React, { use } from "react";
import FixedBackButton from "@/components/ui/FixedBackButton";

import TaxationServiceContent from "@/components/addons/taxation/TaxationServiceContent";

export default function TaxationServicePage({
  params,
}: {
  params: Promise<{ appNo: string }>;
}) {
  const { appNo } = use(params);

  return (
    <div className="w-full space-y-6">
      <FixedBackButton
        href="/addon-services/taxation"
        label="Back to Taxation Clients"
      />
      <h1 className="text-xl font-bold text-primary sm:text-2xl">
        Taxation - {appNo}
      </h1>
      <TaxationServiceContent appNo={appNo} />
    </div>
  );
}
