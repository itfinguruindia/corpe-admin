"use client";

import React, { use } from "react";
import FixedBackButton from "@/components/ui/FixedBackButton";
import GSTServiceContent from "@/components/addons/gst/GSTServiceContent";

export default function GSTServicePage({
  params,
}: {
  params: Promise<{ appNo: string }>;
}) {
  const { appNo } = use(params);

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <FixedBackButton href="/addon-services/gst-registration" label="Back to GST Clients" />
      <h1 className="text-xl font-bold text-primary sm:text-2xl">
        GST Service - {appNo}
      </h1>
      <GSTServiceContent appNo={appNo} />
    </div>
  );
}