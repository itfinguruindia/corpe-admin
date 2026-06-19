"use client";

import { Eye } from "lucide-react";
import { useClientAssignment } from "@/contexts/ClientAssignmentContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";

const CLIENT_EDIT_PERMISSIONS = [
  PERMISSIONS.CLIENT_EDIT,
  PERMISSIONS.CLIENT_DELETE,
  PERMISSIONS.COMPANY_EDIT,
  PERMISSIONS.APP_EDIT,
  PERMISSIONS.APP_CREATE,
  PERMISSIONS.DIRECTOR_EDIT,
  PERMISSIONS.DIRECTOR_CREATE,
  PERMISSIONS.DIRECTOR_DELETE,
  PERMISSIONS.SHAREHOLDER_EDIT,
  PERMISSIONS.SHAREHOLDER_CREATE,
  PERMISSIONS.SHAREHOLDER_DELETE,
  PERMISSIONS.MOA_EDIT,
  PERMISSIONS.MOA_CREATE,
  PERMISSIONS.MOA_DELETE,
  PERMISSIONS.PRICING_EDIT,
  PERMISSIONS.REG_DOC_EDIT,
  PERMISSIONS.REG_DOC_CREATE,
  PERMISSIONS.REG_DOC_DELETE,
  PERMISSIONS.TRACK_EDIT,
  PERMISSIONS.UPLOAD_CREATE,
  PERMISSIONS.UPLOAD_DELETE,
  PERMISSIONS.MSG_CREATE,
  PERMISSIONS.MSG_DELETE,
] as const;

export default function ClientViewOnlyBanner() {
  const { admin, isSuperAdmin, hasPermission } = usePermissions();
  const { isLoading, canMutate } = useClientAssignment();

  if (!admin || isSuperAdmin || isLoading || canMutate) {
    return null;
  }

  const hasEditCapability = hasPermission([...CLIENT_EDIT_PERMISSIONS], "any");

  const title = "View only";
  const description = hasEditCapability
    ? "You can browse this client, but only the assigned assignee or assigner can make changes. Ask a super admin to assign you if you need to edit."
    : "Your role allows viewing this client only. Edit, upload, and delete actions are disabled.";

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Eye size={18} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-amber-900/90">
          {description}
        </p>
      </div>
    </div>
  );
}
