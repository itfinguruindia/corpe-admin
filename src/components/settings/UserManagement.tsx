"use client";

import React, { useState, useEffect, useMemo } from "react";
import UserCreateForm from "@/components/settings/UserCreateForm";
import { User, Role } from "@/types/roles";
import { adminApi, roleApi } from "@/lib/api";
import { Chip } from "@/components/ui";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  UserX,
  UserCheck,
  Mail,
  Calendar,
  Clock,
  Users as UsersIcon,
  Shield,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Modal,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import CustomSelect from "@/components/ui/CustomSelect";

interface UserManagementProps {
  onEditUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

export default function UserManagement({
  onEditUser,
  onDeleteUser,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const createModalState = useOverlayState({
    isOpen: isCreateModalOpen,
    onOpenChange: (open) => {
      if (!open) setIsCreateModalOpen(false);
    },
  });

  const roleFilterOptions = useMemo(
    () => [
      { id: "all", label: "All Roles" },
      ...allRoles.map((role) => ({
        id: String(role._id || role.id),
        label: role.name,
      })),
    ],
    [allRoles],
  );

  const statusFilterOptions = useMemo(
    () => [
      { id: "all", label: "All Statuses" },
      { id: "active", label: "Active" },
      { id: "in-active", label: "Inactive" },
      { id: "suspended", label: "Suspended" },
    ],
    [],
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        adminApi.getAllAdmins(),
        roleApi.getAllRoles(),
      ]);
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setAllRoles(fetchedRoles);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => {
        const userRoleId =
          typeof user.role === "object" ? user.role._id : user.roleId;
        return String(userRoleId) === String(selectedRole);
      });
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((user) => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const getRoleColor = (user: User): string => {
    if (user.isSuperAdmin) return "#E91E63";

    const userRoleId =
      typeof user.role === "object" ? user.role._id : user.roleId;
    const role = allRoles.find(
      (r) => (r._id || String(r.id)) === String(userRoleId),
    );
    return role?.color || "#9E9E9E";
  };

  const getRoleName = (user: User): string => {
    if (user.isSuperAdmin) return "Super Admin";

    if (typeof user.role === "object") {
      return user.role.name;
    }

    const userRoleId = user.roleId;
    const role = allRoles.find(
      (r) => (r._id || String(r.id)) === String(userRoleId),
    );
    return role?.name || "Unknown";
  };

  const getStatusVariant = (
    status: string,
  ): "green" | "yellow" | "red" | "gray" | "blue" => {
    if (!status) return "gray";
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

  const handleDeleteUser = (user: User) => {
    if (user.isSuperAdmin) {
      toast.danger("Super Admin cannot be deleted!");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      )
    ) {
      const userId = user._id || user.id || "";
      onDeleteUser?.(userId);
      // TODO: Implement actual delete API call
      console.log(`Deleting user: ${userId}`);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const activeUsers = users.filter((u) => u.status === "active").length;
  const inactiveUsers = users.filter((u) => u.status === "in-active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

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
            User Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage system users and their access
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF6A3D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a35] sm:w-auto sm:justify-start"
        >
          <Plus size={18} />
          Add New User
        </Button>
      </div>

      <Modal state={createModalState}>
        <Modal.Backdrop className="bg-black/50 backdrop-blur-sm">
          <Modal.Container placement="center" className="p-4">
            <Modal.Dialog className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none max-h-[90vh] md:max-w-xl lg:max-w-2xl">
              <Modal.Header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                <Modal.Heading className="text-lg font-semibold text-black">
                  Create New User
                </Modal.Heading>
                <Modal.CloseTrigger
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close modal"
                />
              </Modal.Header>
              <Modal.Body className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
                <UserCreateForm
                  roles={allRoles}
                  onSuccess={() => {
                    setIsCreateModalOpen(false);
                    loadData();
                  }}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#3D63A4]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-secondary mt-1">
                {users.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#3D63A4]/10 flex items-center justify-center">
              <UsersIcon className="text-secondary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#4CAF50]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-[#4CAF50] mt-1">
                {activeUsers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
              <UserCheck className="text-[#4CAF50]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#9E9E9E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Inactive Users
              </p>
              <p className="text-3xl font-bold text-[#9E9E9E] mt-1">
                {inactiveUsers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#9E9E9E]/10 flex items-center justify-center">
              <UserX className="text-[#9E9E9E]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#F44336]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Suspended Users
              </p>
              <p className="text-3xl font-bold text-[#F44336] mt-1">
                {suspendedUsers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#F44336]/10 flex items-center justify-center">
              <UserX className="text-[#F44336]" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <TextField
                value={searchQuery}
                onChange={setSearchQuery}
                name="userSearch"
              >
                <Label className="sr-only">Search users</Label>
                <Input
                  placeholder="Search by name or email..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3D63A4]"
                />
              </TextField>
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:w-64">
            <CustomSelect
              ariaLabel="Filter by role"
              value={selectedRole}
              onChange={(v) => setSelectedRole(v)}
              options={roleFilterOptions}
            />
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <CustomSelect
              ariaLabel="Filter by status"
              value={selectedStatus}
              onChange={(v) => setSelectedStatus(v)}
              options={statusFilterOptions}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <UsersIcon size={48} className="mb-3 opacity-30" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id || user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: getRoleColor(user) }}
                        >
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name}
                            {user.isSuperAdmin && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: getRoleColor(user) }}
                      >
                        <Shield size={12} />
                        {getRoleName(user)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.status ? (
                        <Chip
                          label={
                            user.status === "active"
                              ? "Active"
                              : user.status === "in-active"
                                ? "Inactive"
                                : user.status === "suspended"
                                  ? "Suspended"
                                  : user.status
                          }
                          variant={getStatusVariant(user.status)}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Clock size={14} className="text-gray-400" />
                          {formatTimeAgo(user.lastLogin)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <span title="Edit User" className="inline-flex">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              onEditUser?.(user._id || user.id || "")
                            }
                            aria-label="Edit user"
                            className="min-h-0 min-w-0 p-2 text-gray-600 hover:bg-blue-50 hover:text-secondary"
                          >
                            <Edit2 size={16} />
                          </Button>
                        </span>

                        <span title="Delete User" className="inline-flex">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user)}
                            aria-label="Delete user"
                            className="min-h-0 min-w-0 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary by Role */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Users by Role
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allRoles.map((role) => {
            const roleId = role._id || String(role.id);
            const roleUserCount = users.filter((u) => {
              const userRoleId =
                typeof u.role === "object" ? u.role._id : u.roleId;
              return String(userRoleId) === String(roleId);
            }).length;
            return (
              <div
                key={roleId}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                style={{ borderLeftWidth: "4px", borderLeftColor: role.color }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {role.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {roleUserCount} user{roleUserCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: role.color }}
                >
                  {roleUserCount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
