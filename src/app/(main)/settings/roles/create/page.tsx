"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RoleForm from "@/components/settings/RoleForm";
import { roleApi } from "@/lib/api/roles";
import { Button, toast } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

export default function CreateRolePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      await roleApi.createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        color: formData.color,
      });
      toast.success("Role created successfully!");
      router.push("/settings/roles");
    } catch (error: any) {
      console.error("Error creating role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create role";
      toast.danger(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/settings/roles");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          className="mb-4 h-auto min-w-0 justify-start gap-2 px-2 py-1 text-gray-600 hover:text-secondary"
        >
          <ArrowLeft size={20} />
          <span>Back to Roles</span>
        </Button>
        <h1 className="text-4xl font-bold text-[#FF6A3D]">Create New Role</h1>
        <p className="mt-2 text-base text-gray-600">
          Define a new role with specific permissions for your team members
        </p>
      </div>

      {/* Form */}
      <RoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
