"use client";

import React from "react";
import { useRouter } from "next/navigation";
import UserManagement from "@/components/settings/UserManagement";

export default function UserManagementPage() {
  const router = useRouter();

  const handleEditUser = (userId: string) => {
    router.push(`/settings/users/${userId}`);
  };

  return (
    <div className="min-h-screen">
      <UserManagement onEditUser={handleEditUser} />
    </div>
  );
}
