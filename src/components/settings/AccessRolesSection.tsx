"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, Users, UserPlus, History } from "lucide-react";
import InviteUserModal from "./InviteUserModal";

interface AccessRolesSectionProps {
  id?: string;
}

export default function AccessRolesSection({ id }: AccessRolesSectionProps) {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const menuItems = [
    {
      label: "User management",
      icon: Users,
      onClick: () => {
        router.push("/settings/users");
      },
    },
    {
      label: "Invite new users",
      icon: UserPlus,
      onClick: () => {
        setIsInviteModalOpen(true);
      },
    },
    {
      label: "Role & permissions matrix",
      icon: Shield,
      onClick: () => {
        router.push("/settings/roles");
      },
    },
    {
      label: "Role creation / deletion",
      icon: Shield,
      onClick: () => {
        router.push("/settings/roles");
      },
    },
    {
      label: "Audit log",
      icon: History,
      onClick: () => {
        // TODO: Navigate to audit log page
        console.log("Navigate to audit log");
      },
    },
  ];

  return (
    <div id={id} className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary">Access & Roles</h3>
        <div className="h-10 w-10 rounded-full bg-[#E91E63] flex items-center justify-center">
          <span className="text-base font-semibold text-white">V</span>
        </div>
      </div>

      <ul className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              key={index}
              onClick={item.onClick}
              className="flex items-center gap-3 text-base text-gray-700 hover:text-secondary hover:bg-gray-50 cursor-pointer transition-colors p-2 rounded-md group"
            >
              <Icon
                size={18}
                className="text-gray-400 group-hover:text-secondary transition-colors"
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
