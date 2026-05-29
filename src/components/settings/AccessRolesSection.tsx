"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, Users, UserPlus, History } from "lucide-react";
import InviteUserModal from "./InviteUserModal";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/permissions";
import { ACTIVITY_LOG_VIEW_IDS } from "@/lib/rbac/permissions";
import { showRouteAccessDeniedToast } from "@/lib/rbac/routeAccessDenied";

interface AccessRolesSectionProps {
  id?: string;
}

type MenuItem = {
  label: string;
  icon: typeof Users;
  permission: string | string[];
  mode?: "any" | "all";
  onAllowed: () => void;
};

export default function AccessRolesSection({ id }: AccessRolesSectionProps) {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { hasPermission, isSuperAdmin } = usePermissions();

  const requireAccess = (
    permission: string | string[],
    mode: "any" | "all" = "any",
  ): boolean => {
    if (isSuperAdmin || hasPermission(permission, mode)) return true;
    showRouteAccessDeniedToast();
    return false;
  };

  const handleItemClick = (item: MenuItem) => {
    if (!requireAccess(item.permission, item.mode)) return;
    item.onAllowed();
  };

  const menuItems: MenuItem[] = [
    {
      label: "User management",
      icon: Users,
      permission: PERMISSIONS.USER_VIEW,
      onAllowed: () => router.push("/settings/users"),
    },
    {
      label: "Invite new users",
      icon: UserPlus,
      permission: PERMISSIONS.USER_CREATE,
      onAllowed: () => setIsInviteModalOpen(true),
    },
    {
      label: "Role & permissions matrix",
      icon: Shield,
      permission: PERMISSIONS.ROLE_VIEW,
      onAllowed: () => router.push("/settings/roles"),
    },
    {
      label: "Role creation / deletion",
      icon: Shield,
      permission: PERMISSIONS.ROLE_CREATE,
      onAllowed: () => router.push("/settings/roles/create"),
    },
    {
      label: "Audit log",
      icon: History,
      permission: [...ACTIVITY_LOG_VIEW_IDS],
      onAllowed: () => router.push("/settings/activity-logs"),
    },
  ];

  if (!isSuperAdmin && !hasPermission(PERMISSIONS.SETTINGS_VIEW)) {
    return null;
  }

  return (
    <div id={id} className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary">Access & Roles</h3>
        <div className="h-10 w-10 rounded-full bg-[#E91E63] flex items-center justify-center">
          <span className="text-base font-semibold text-white">V</span>
        </div>
      </div>

      <ul className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const allowed =
            isSuperAdmin || hasPermission(item.permission, item.mode ?? "any");
          return (
            <li
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={`flex items-center gap-3 text-base p-2 rounded-md group transition-colors ${
                allowed
                  ? "text-gray-700 hover:text-secondary hover:bg-gray-50 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors ${
                  allowed
                    ? "text-gray-400 group-hover:text-secondary"
                    : "text-gray-300"
                }`}
              />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>

      {isInviteModalOpen && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
}
