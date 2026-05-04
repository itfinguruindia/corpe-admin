"use client";

import { useState, useEffect } from "react";

import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

import { clientsApi } from "@/lib/api";

interface OnboardedClient {
  appNo: string;
  entity: string;
  assignee: string;
  assigner: string;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-gray-100">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-3 w-22" />
      </div>
      {/* Rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-3 gap-4 py-3">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function RecentlyOnboardedWidget() {
  const [clients, setClients] = useState<OnboardedClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsApi
      .getAllClients(1, 4)
      .then((data) => {
        const mapped = (data.clients || []).map((c: any) => ({
          appNo: c.appNo || c.applicationNo || "",
          entity: c.entity || "—",
          assignee: c.assignee || "—",
          assigner: c.assigner || "—",
        }));
        setClients(mapped);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <TableSkeleton />;
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Users className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No clients onboarded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="grid grid-cols-3 gap-4 pb-2 border-b-2 border-gray-100">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Application & Entity
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Handled By
        </div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Reviewed By
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {clients.map((client, i) => (
          <div
            key={client.appNo || i}
            className="grid grid-cols-3 gap-4 py-3 group hover:bg-gray-50/50 rounded-lg transition-colors -mx-2 px-2"
          >
            <div className="flex flex-col">
              <Link
                href={`/clients/${client.appNo}`}
                className="text-sm font-bold text-primary hover:underline transition-all"
              >
                {client.appNo}
              </Link>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight mt-0.5">
                {client.entity}
              </span>
            </div>
            <div className="text-sm text-gray-600 self-center">
              {client.assignee}
            </div>
            <div className="text-sm text-gray-600 self-center">
              {client.assigner}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <Link
        href="/clients"
        className="flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-secondary/60 hover:text-primary transition-colors uppercase tracking-wider"
      >
        View all clients
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
