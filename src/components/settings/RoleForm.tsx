"use client";

import React, { useState } from "react";
import { PermissionModule, PermissionAction, Role } from "@/types/roles";
import {
  allPermissions,
  getPermissionsByModule,
} from "@/lib/data/mockRolesData";
import { Check, X, ChevronDown, ChevronUp, Shield } from "lucide-react";

interface RoleFormProps {
  initialValues?: Partial<Role>;
  onSubmit: (formData: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const defaultRole = {
  name: "",
  description: "",
  permissions: [] as string[],
  color: "#3D63A4",
};

const colorOptions = [
  { name: "Blue", value: "#3D63A4" },
  { name: "Orange", value: "#FF6A3D" },
  { name: "Green", value: "#4CAF50" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Red", value: "#F44336" },
  { name: "Teal", value: "#009688" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Pink", value: "#E91E63" },
];

export default function RoleForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: RoleFormProps) {
  const [form, setForm] = useState({
    ...defaultRole,
    ...initialValues,
    permissions: initialValues?.permissions || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({});

  const permissionsByModule = getPermissionsByModule();
  const modules = Object.keys(permissionsByModule) as PermissionModule[];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Role name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Role name must be at least 3 characters";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (form.permissions.length === 0) {
      newErrors.permissions = "Please select at least one permission";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePermissionToggle = (permId: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id: string) => id !== permId)
        : [...prev.permissions, permId],
    }));
    // Clear permission error when user selects
    if (errors.permissions) {
      setErrors({ ...errors, permissions: "" });
    }
  };

  const handleModuleToggle = (module: PermissionModule) => {
    const modulePerms = permissionsByModule[module];
    const modulePermIds = modulePerms.map((p) => p.id);
    const allSelected = modulePermIds.every((id) =>
      form.permissions.includes(id),
    );

    if (allSelected) {
      // Deselect all permissions in this module
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (id) => !modulePermIds.includes(id),
        ),
      }));
    } else {
      // Select all permissions in this module
      setForm((prev) => ({
        ...prev,
        permissions: [
          ...prev.permissions,
          ...modulePermIds.filter((id) => !prev.permissions.includes(id)),
        ],
      }));
    }
  };

  const toggleModuleExpansion = (module: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(form);
    }
  };

  const getModulePermissionCount = (module: PermissionModule) => {
    const modulePerms = permissionsByModule[module];
    const selectedCount = modulePerms.filter((p) =>
      form.permissions.includes(p.id),
    ).length;
    return `${selectedCount}/${modulePerms.length}`;
  };

  const isModuleFullySelected = (module: PermissionModule) => {
    const modulePerms = permissionsByModule[module];
    return modulePerms.every((p) => form.permissions.includes(p.id));
  };

  const isModulePartiallySelected = (module: PermissionModule) => {
    const modulePerms = permissionsByModule[module];
    const selectedCount = modulePerms.filter((p) =>
      form.permissions.includes(p.id),
    ).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Basic Information Card */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-secondary" size={24} />
          <h3 className="text-xl font-bold text-secondary">
            Basic Information
          </h3>
        </div>

        <div className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Sales Manager, Support Agent"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] transition-colors resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the purpose and responsibilities of this role..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: colorOption.value })}
                  className={`relative h-10 w-10 rounded-full transition-transform hover:scale-110 ${
                    form.color === colorOption.value
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                  disabled={isLoading}
                >
                  {form.color === colorOption.value && (
                    <Check
                      className="absolute inset-0 m-auto text-white"
                      size={20}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="text-[#FF6A3D]" size={24} />
            <h3 className="text-xl font-bold text-secondary">
              Permissions <span className="text-red-500">*</span>
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            {form.permissions.length} of {allPermissions.length} selected
          </div>
        </div>

        {errors.permissions && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.permissions}</p>
          </div>
        )}

        <div className="space-y-3">
          {modules.map((module) => {
            const isExpanded = expandedModules[module] ?? true;
            const modulePerms = permissionsByModule[module];
            const isFullySelected = isModuleFullySelected(module);
            const isPartiallySelected = isModulePartiallySelected(module);

            return (
              <div
                key={module}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Module Header */}
                <div className="bg-gray-50  flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleModuleToggle(module)}
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isFullySelected
                          ? "bg-[#3D63A4] border-[#3D63A4]"
                          : isPartiallySelected
                            ? "bg-gray-400 border-gray-400"
                            : "border-gray-300 bg-white"
                      }`}
                      disabled={isLoading}
                    >
                      {(isFullySelected || isPartiallySelected) && (
                        <Check className="text-white" size={14} />
                      )}
                    </button>
                    <span className="font-semibold text-gray-900">
                      {module}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({getModulePermissionCount(module)})
                    </span>
                  </div>
                  <div
                    className="w-full h-full flex justify-end px-4 py-3"
                    onClick={() => toggleModuleExpansion(module)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleModuleExpansion(module)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Module Permissions */}
                {isExpanded && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modulePerms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="mt-0.5 h-4 w-4 text-secondary border-gray-300 rounded focus:ring-[#3D63A4]"
                          disabled={isLoading}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {perm.action}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                perm.action === "delete"
                                  ? "bg-red-100 text-red-700"
                                  : perm.action === "create"
                                    ? "bg-green-100 text-green-700"
                                    : perm.action === "edit"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {perm.action.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#e55a35] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialValues ? "Update Role" : "Create Role"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
