"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import { Layers } from "lucide-react";

const GSTServiceListContent = dynamic(
  () => import("@/components/addons/gst/GSTServiceListContent"),
  { loading: () => <div className="flex items-center justify-center p-12 text-slate-500 text-sm">Loading...</div> }
);

const BankAccountServiceListContent = dynamic(
  () => import("@/components/addons/bank-account/BankAccountServiceListContent"),
  { loading: () => <div className="flex items-center justify-center p-12 text-slate-500 text-sm">Loading...</div> }
);

const TrademarkServiceListContent = dynamic(
  () => import("@/components/addons/trademark/TrademarkServiceListContent"),
  { loading: () => <div className="flex items-center justify-center p-12 text-slate-500 text-sm">Loading...</div> }
);

const ADDON_MAP: Record<string, {
  title: string;
  desc: string;
  Component: React.ComponentType<{ addonId: string }>;
}> = {
  "gst-registration": {
    title: "GST Registration",
    desc: "View and manage all clients enrolled in GST Registration (both standalone & incorporated).",
    Component: GSTServiceListContent,
  },
  "bank-account-setup": {
    title: "Bank Account Setup",
    desc: "View and manage all clients enrolled in Bank Account Setup (full incorporation only).",
    Component: BankAccountServiceListContent,
  },
  "trademark-registration": {
    title: "Trademark Registration",
    desc: "View and manage all clients enrolled in Trademark Registration (both standalone & incorporated).",
    Component: TrademarkServiceListContent,
  },
};

export default function AddonServiceClientsPage({
  params,
}: {
  params: Promise<{ addonId: string }>;
}) {
  const resolvedParams = use(params);
  const addonId = resolvedParams.addonId;
  const config = ADDON_MAP[addonId];

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <p className="text-center text-slate-500">Invalid Add-on</p>
      </div>
    );
  }

  const { title, desc, Component } = config;

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" /> {title} Clients
          </h1>
          <p className="text-sm text-slate-500 mt-1">{desc}</p>
        </div>
      </div>
      <Component addonId={addonId} />
    </div>
  );
}
