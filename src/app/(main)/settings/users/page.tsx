"use client";

import React from "react";
import { useRouter } from "next/navigation";
import UserManagement from "@/components/settings/UserManagement";
import toast from "react-hot-toast";

export default function UserManagementPage() {
  const router = useRouter();

  const handleEditUser = (userId: string) => {
    // Navigate to user detail page
    router.push(`/settings/users/${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete user API call
    console.log("Delete user:", userId);
  };

  return (
    <div className="min-h-screen">
      <UserManagement
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}
