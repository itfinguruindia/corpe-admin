"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RoleForm from "@/components/settings/RoleForm";
import { roleApi } from "@/lib/api/roles";
import { Button, Spinner, toast } from "@heroui/react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Role } from "@/types/roles";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.roleId as string;

  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleId) {
      loadRole();
    }
  }, [roleId]);

  const loadRole = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleApi.getRoleById(roleId);
      setRole(data);
    } catch (error: any) {
      console.error("Error loading role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load role";
      setError(errorMessage);
      toast.danger(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      await roleApi.updateRole(roleId, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        color: formData.color,
      });
      toast.success("Role updated successfully!");
      router.push("/settings/roles");
    } catch (error: any) {
      console.error("Error updating role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update role";
      toast.danger(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/settings/roles");
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center flex flex-col items-center gap-4">
              <Spinner className="text-[#3D63A4]" size="lg" />
              <p className="text-lg text-gray-600">Loading role...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !role) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 h-auto min-w-0 justify-start gap-2 px-2 py-1 text-gray-600 hover:text-secondary"
          >
            <ArrowLeft size={20} />
            <span>Back to Roles</span>
          </Button>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Role
            </h2>
            <p className="text-gray-600 mb-6">{error || "Role not found"}</p>
            <Button
              type="button"
              onClick={loadRole}
              className="rounded-lg bg-[#FF6A3D] px-6 py-2.5 font-medium text-white hover:bg-[#e55a35]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (role.isSystemRole) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="mb-4 h-auto min-w-0 justify-start gap-2 px-2 py-1 text-gray-600 hover:text-secondary"
          >
            <ArrowLeft size={20} />
            <span>Back to Roles</span>
          </Button>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              System Role
            </h2>
            <p className="text-gray-600 mb-6">
              System roles cannot be modified. They are essential for the
              application&apos;s functionality.
            </p>
            <Button
              type="button"
              onClick={handleCancel}
              className="rounded-lg bg-[#3D63A4] px-6 py-2.5 font-medium text-white hover:bg-[#2d4d8a]"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-4xl font-bold text-[#FF6A3D]">Edit Role</h1>
        <p className="mt-2 text-base text-gray-600">
          Update role information and permissions
        </p>
      </div>

      {/* Form */}
      <RoleForm
        initialValues={role}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
}
