"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

interface ComplianceCalendarSectionProps {
  id?: string;
}

export default function ComplianceCalendarSection({
  id,
}: ComplianceCalendarSectionProps) {
  const router = useRouter();
  const { hasPermission, isSuperAdmin } = usePermissions();

  const canView =
    isSuperAdmin || hasPermission(PERMISSIONS.SETTINGS_VIEW);

  if (!canView) return null;

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={() => router.push("/compliance-calendar")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push("/compliance-calendar");
        }
      }}
      className="rounded-xl bg-white shadow-sm p-6 cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-[#FF6A3D]/20 group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-secondary">
          Compliance Calendar
        </h3>
        <div className="h-10 w-10 rounded-full bg-[#FF6A3D] flex items-center justify-center">
          <CalendarDays size={20} className="text-white" />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Manage statutory filing deadlines, penalty details, and compliance
        status across GST, TDS / TCS, Income Tax, ROC, MSME, and Advance Tax.
      </p>

      <div className="flex items-center gap-2 text-[#FF6A3D] text-sm font-medium group-hover:gap-3 transition-all">
        <span>Open calendar</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
