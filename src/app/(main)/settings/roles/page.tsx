"use client";

import React from "react";
import RolesPermissionsMatrix from "@/components/settings/RolesPermissionsMatrix";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RolesPermissionsPage() {
  const router = useRouter();

  const handleCreateRole = () => {
    router.push("/settings/roles/create");
  };

  const handleEditRole = (roleId: string) => {
    router.push(`/settings/roles/${roleId}`);
  };

  const handleDeleteRole = (roleId: string) => {
    // TODO: Implement delete role API call
    console.log("Delete role:", roleId);
  };

  return (
    <div className="min-h-screen">
      <RolesPermissionsMatrix
        onCreateRole={handleCreateRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
      />
    </div>
  );
}
