"use client";
import React, { useMemo, useState } from "react";
import { adminApi } from "@/lib/api";
import { Role } from "@/types/roles";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

interface UserCreateFormProps {
  roles: Role[];
  onSuccess?: () => void;
}

const UserCreateForm = ({ roles, onSuccess }: UserCreateFormProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = useMemo(
    () => [
      { id: "", label: "Select Role" },
      ...roles.map((role) => ({
        id: String(role._id),
        label: role.name,
      })),
    ],
    [roles],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      );
      setLoading(false);
      return;
    }
    try {
      await adminApi.registerAdmin(form);
      toast.success("User created successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        roleId: "",
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <TextField
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        name="name"
      >
        <Label className="mb-1 block text-sm font-medium text-black">Name</Label>
        <Input
          className="w-full rounded border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
        />
      </TextField>

      <TextField
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        type="email"
        name="email"
      >
        <Label className="mb-1 block text-sm font-medium text-black">Email</Label>
        <Input
          className="w-full rounded border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
        />
      </TextField>

      <TextField
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        type={showPassword ? "text" : "password"}
        name="password"
      >
        <Label className="mb-1 block text-sm font-medium text-black">Password</Label>
        <div className="relative">
          <Input
            placeholder="min. 8 chars, 1 uppercase, 1 special char"
            className="w-full rounded border border-gray-400 py-2 pr-10 pl-3 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
            required
            minLength={8}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 min-h-8 min-w-8 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        </div>
      </TextField>

      <TextField
        value={form.phoneNumber}
        onChange={(v) => {
          const digits = v.replace(/\D/g, "");
          if (digits.length <= 10) {
            setForm({ ...form, phoneNumber: digits });
          }
        }}
        name="phoneNumber"
      >
        <Label className="mb-1 block text-sm font-medium text-black">Phone Number</Label>
        <Input
          className="w-full rounded border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter 10-digit number"
        />
      </TextField>

      <div>
        <Label className="mb-1 block text-sm font-medium text-black">Role</Label>
        <CustomSelect
          ariaLabel="Role"
          value={form.roleId}
          onChange={(v) => setForm({ ...form, roleId: v })}
          options={roleOptions}
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button
        type="submit"
        isDisabled={loading}
        className="w-full rounded bg-[#FF6A3D] py-2 font-semibold text-white hover:bg-[#e55a35] data-[disabled]:opacity-70"
      >
        {loading ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
};

export default UserCreateForm;
