"use client";

import { useState, useEffect } from "react";

import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton, Chip, Button } from "@heroui/react";

import { clientsApi } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

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
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-3 w-22 rounded-md" />
      </div>
      {/* Rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-3 gap-4 py-3">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function RecentlyOnboardedWidget() {
  const { hasPermission } = usePermissions();
  const canViewClients = hasPermission(PERMISSIONS.CLIENT_VIEW);
  const [clients, setClients] = useState<OnboardedClient[]>([]);
  const [loading, setLoading] = useState(canViewClients);

  useEffect(() => {
    if (!canViewClients) {
      setLoading(false);
      return;
    }

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
  }, [canViewClients]);

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
              <Chip
                variant="soft"
                size="sm"
                className="mt-1 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-tight"
              >
                {client.entity}
              </Chip>
            </div>
            <div className="text-sm text-gray-600 self-center font-medium">
              {client.assignee}
            </div>
            <div className="text-sm text-gray-600 self-center font-medium">
              {client.assigner}
            </div>
          </div>
        ))}
      </div>

      {canViewClients && (
        <Link href="/clients">
          <Button
            className="w-full text-secondary/60 hover:text-primary font-bold uppercase tracking-wider text-xs bg-transparent"
          >
            View all clients
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
