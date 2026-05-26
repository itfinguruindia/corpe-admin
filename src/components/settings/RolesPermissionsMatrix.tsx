"use client";

import React, { useState, useEffect } from "react";
import { Role, Permission, PermissionModule } from "@/types/roles";
import {
  allPermissions,
  getPermissionsByModule,
} from "@/lib/data/mockRolesData";
import { roleApi } from "@/lib/api";
import { Chip } from "@/components/ui";
import PermissionGate from "@/components/rbac/PermissionGate";
import { PERMISSIONS } from "@/utils/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { Check, X, Plus, Edit2, Trash2, Users, Shield } from "lucide-react";
import { Button, toast } from "@heroui/react";

interface RolesPermissionsMatrixProps {
  onCreateRole?: () => void;
  onEditRole?: (roleId: string) => void;
  onDeleteRole?: (roleId: string) => void;
}

export default function RolesPermissionsMatrix({
  onCreateRole,
  onEditRole,
  onDeleteRole,
}: RolesPermissionsMatrixProps) {
  const { canCreateRoles, canEditRoles, canDeleteRoles } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<
    Record<PermissionModule, Permission[]>
  >({} as Record<PermissionModule, Permission[]>);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<
    PermissionModule | "all"
  >("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch roles from API
      const fetchedRoles = await roleApi.getAllRoles();

      // Use static permissions from mockRolesData
      const allPerms = allPermissions;
      const permsByModule = getPermissionsByModule();

      setRoles(fetchedRoles);
      setPermissions(allPerms);
      setPermissionsByModule(permsByModule);
    } catch (error) {
      console.error("Error loading roles and permissions:", error);
      // Fallback to empty state
      setRoles([]);
      setPermissions(allPermissions);
      setPermissionsByModule(getPermissionsByModule());
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (role: Role, permissionId: string): boolean => {
    return role.permissions.includes(permissionId);
  };

  const getPermissionsToDisplay = (): Permission[] => {
    if (selectedModule === "all") {
      return permissions;
    }
    return permissionsByModule[selectedModule] || [];
  };

  const modules = Object.keys(permissionsByModule) as PermissionModule[];

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystemRole) {
      toast.success("System roles cannot be deleted!");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete the role "${role.name}"? This will affect ${role.userCount} user(s).`,
      )
    ) {
      try {
        const roleId = role._id || String(role.id);
        await roleApi.deleteRole(roleId);
        onDeleteRole?.(roleId);
        // Reload data after deletion
        loadData();
      } catch (error: any) {
        console.error("Error deleting role:", error);
        toast.danger(error.response?.data?.message || "Failed to delete role");
      }
    }
  };

  const handleEditRole = (role: Role) => {
    const roleId = role._id || String(role.id);
    onEditRole?.(roleId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#FF6A3D] sm:text-4xl">
            Roles & Permissions Matrix
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage roles and their associated permissions
          </p>
        </div>
        <PermissionGate permissions={PERMISSIONS.ROLE_CREATE}>
          <Button
            type="button"
            onClick={onCreateRole}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF6A3D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a35] sm:w-auto sm:justify-start"
          >
            <Plus size={18} />
            Create New Role
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#3D63A4]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Roles</p>
              <p className="text-3xl font-bold text-secondary mt-1">
                {roles.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#3D63A4]/10 flex items-center justify-center">
              <Shield className="text-secondary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#FF6A3D]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total Permissions
              </p>
              <p className="text-3xl font-bold text-[#FF6A3D] mt-1">
                {permissions.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#FF6A3D]/10 flex items-center justify-center">
              <Check className="text-[#FF6A3D]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#4CAF50]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Permission Modules
              </p>
              <p className="text-3xl font-bold text-[#4CAF50] mt-1">
                {modules.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
              <Users className="text-[#4CAF50]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Module Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Filter by Module:
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => setSelectedModule("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedModule === "all"
                ? "bg-[#3D63A4] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Modules
          </Button>
          {modules.map((module) => (
            <Button
              type="button"
              key={module}
              onClick={() => setSelectedModule(module)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedModule === module
                  ? "bg-[#3D63A4] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {module}{" "}
              <span className="text-xs opacity-75">
                ({permissionsByModule[module]?.length || 0})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Roles Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role._id}
            className="bg-white rounded-lg shadow-sm p-5 border-t-4"
            style={{ borderTopColor: role.color }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                {role.isSystemRole && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    System Role
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {canEditRoles() && (
                  <span title="Edit Role" className="inline-flex">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleEditRole(role)}
                      aria-label="Edit role"
                      className="min-h-0 min-w-0 p-1.5 text-gray-600 hover:bg-gray-100 hover:text-secondary"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </span>
                )}
                {!role.isSystemRole && canDeleteRoles() && (
                  <span title="Delete Role" className="inline-flex">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleDeleteRole(role)}
                      aria-label="Delete role"
                      className="min-h-0 min-w-0 p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {role.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Users size={16} />
                <span>{role.userCount} users</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Shield size={16} />
                <span>{role.permissions.length} permissions</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-secondary">
            Permissions Matrix
            {selectedModule !== "all" && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {selectedModule}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            View which permissions are assigned to each role
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Permission
                  </div>
                </th>
                {roles.map((role) => (
                  <th key={role._id} className="px-4 py-4 text-center min-w-30">
                    <div
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-md text-white text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getPermissionsToDisplay().map((permission, idx) => (
                <tr
                  key={permission.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="sticky left-0 z-10 px-6 py-4 bg-inherit">
                    <div className="text-sm font-semibold text-gray-900">
                      {permission.module}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {permission.description}
                    </div>
                    <div className="mt-1">
                      <Chip
                        label={permission.action.toUpperCase()}
                        variant={
                          permission.action === "delete"
                            ? "red"
                            : permission.action === "create"
                              ? "green"
                              : permission.action === "edit"
                                ? "yellow"
                                : "blue"
                        }
                      />
                    </div>
                  </td>
                  {roles.map((role) => (
                    <td key={role._id} className="px-4 py-4 text-center">
                      {hasPermission(role, permission.id) ? (
                        <div className="flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="text-green-600" size={18} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                            <X className="text-red-400" size={18} />
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="text-green-600" size={14} />
            </div>
            <span className="text-gray-700">Permission Granted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center">
              <X className="text-red-400" size={14} />
            </div>
            <span className="text-gray-700">Permission Denied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              System Role
            </div>
            <span className="text-gray-700">Cannot be deleted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
