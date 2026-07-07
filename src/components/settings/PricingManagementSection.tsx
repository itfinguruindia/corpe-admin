"use client";

import { useRouter } from "next/navigation";
import { IndianRupee, ChevronRight } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { canViewPricingPlans } from "@/utils/pricingPermissions";

interface PricingManagementSectionProps {
  id?: string;
}

export default function PricingManagementSection({
  id,
}: PricingManagementSectionProps) {
  const router = useRouter();
  const { admin } = usePermissions();

  const canView = canViewPricingPlans(admin);

  if (!canView) return null;

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={() => router.push("/settings/pricing")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push("/settings/pricing");
        }
      }}
      className="rounded-xl bg-white shadow-sm p-6 cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-[#FF6A3D]/20 group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-secondary">
          Pricing Management
        </h3>
        <div className="h-10 w-10 rounded-full bg-[#FF6A3D] flex items-center justify-center">
          <IndianRupee size={20} className="text-white" />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Edit incorporation pricing for all company types. Changes apply to new
        registrations only - existing clients keep their frozen pricing
        snapshot.
      </p>

      <div className="flex items-center gap-2 text-[#FF6A3D] text-sm font-medium group-hover:gap-3 transition-all">
        <span>Manage pricing plans</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
