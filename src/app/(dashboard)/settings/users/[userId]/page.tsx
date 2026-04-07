"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Role } from "@/types/roles";
import { adminApi, roleApi } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Mail,
  Shield,
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { Chip } from "@/components/ui";
import toast from "react-hot-toast";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    roleId: "",
    status: "active" as User["status"],
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        adminApi.getAllAdmins(),
        roleApi.getAllRoles(),
      ]);

      const currentUser = fetchedUsers.find(
        (u: User) => (u._id || u.id) === userId,
      );

      if (!currentUser) {
        toast.error("User not found!");
        router.push("/settings/users");
        return;
      }

      setUser(currentUser);
      setAllRoles(fetchedRoles);

      // Populate form data
      const userRoleId =
        typeof currentUser.role === "object"
          ? currentUser.role._id
          : currentUser.roleId;

      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phoneNumber: (currentUser as any).phoneNumber || "",
        roleId: userRoleId?.toString() || "",
        status: currentUser.status,
      });
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user?.isSuperAdmin) {
      toast.error("Super Admin details cannot be modified!");
      return;
    }

    try {
      setIsSaving(true);

      // Update admin role
      await adminApi.updateAdminRole(userId, formData.roleId);

      toast.success("User updated successfully!");
      router.push("/settings/users");
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: User["status"]) => {
    if (user?.isSuperAdmin) {
      toast.error("Super Admin status cannot be changed!");
      return;
    }

    if (user?.status === newStatus) {
      return; // Already in this status
    }

    try {
      await adminApi.updateAdminStatus(userId, newStatus);
      // Reload data
      loadData();
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast.error(error.response?.data?.message || "Failed to change status");
    }
  };

  const getRoleName = (user: User): string => {
    if (user.isSuperAdmin) return "Super Admin";
    if (typeof user.role === "object") return user.role.name;
    const role = allRoles.find((r) => String(r._id) === String(user.roleId));
    return role?.name || "Unknown";
  };

  const getStatusVariant = (
    status: string,
  ): "green" | "yellow" | "red" | "gray" | "blue" => {
    switch (status) {
      case "active":
        return "green";
      case "in-active":
        return "gray";
      case "suspended":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/settings/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Users
          </button>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">User Details</h1>
          <p className="mt-2 text-base text-gray-600">
            View and edit user information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-linear-to-br from-[#FF6A3D] to-[#3D63A4] flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <Chip
                  label={getRoleName(user)}
                  variant="blue"
                  icon={<Shield size={14} />}
                  className="mt-2"
                />
                <Chip
                  label={user.status}
                  variant={getStatusVariant(user.status)}
                  className="mt-2"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} />
                  <span className="text-sm break-all">{user.email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} />
                  <div className="text-sm">
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock size={18} />
                    <div className="text-sm">
                      <p className="text-gray-500">Last Login</p>
                      <p className="font-medium">
                        {formatDate(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {!user.isSuperAdmin && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Status Management
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleStatusChange("active")}
                      disabled={user.status === "active"}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800 border-2 border-green-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800"
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      onClick={() => handleStatusChange("in-active")}
                      disabled={user.status === "in-active"}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.status === "in-active"
                          ? "bg-gray-200 text-gray-800 border-2 border-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800"
                      }`}
                    >
                      ○ Inactive
                    </button>
                    <button
                      onClick={() => handleStatusChange("suspended")}
                      disabled={user.status === "suspended"}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.status === "suspended"
                          ? "bg-red-100 text-red-800 border-2 border-red-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-800"
                      }`}
                    >
                      ✖ Suspended
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Edit User Information
              </h2>

              {user.isSuperAdmin && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm font-medium">
                    ⚠️ Super Admin details cannot be modified
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={user.isSuperAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={user.isSuperAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={user.isSuperAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Role Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    disabled={user.isSuperAdmin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D63A4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select a role</option>
                    {allRoles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Changing the role will update the user's permissions
                  </p>
                </div>

                {/* Role Details */}
                {formData.roleId && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const selectedRole = allRoles.find(
                        (r) => (r._id || r.id)?.toString() === formData.roleId,
                      );
                      return selectedRole ? (
                        <div>
                          <h3 className="text-sm font-semibold text-blue-900 mb-2">
                            Selected Role: {selectedRole.name}
                          </h3>
                          <p className="text-sm text-blue-800 mb-2">
                            {selectedRole.description}
                          </p>
                          <div className="text-sm text-blue-700">
                            <span className="font-medium">Permissions:</span>{" "}
                            {selectedRole.permissions.length} permission(s)
                            assigned
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={user.isSuperAdmin || isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6A3D] text-white rounded-lg hover:bg-[#e55a35] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/settings/users")}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
