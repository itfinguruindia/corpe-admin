"use client";
import React, { useState } from "react";
import { adminApi } from "@/lib/api";
import { Role } from "@/types/roles";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] pr-10"
            placeholder="min. 8 chars, 1 uppercase, 1 special char"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // remove non-digits
            if (value.length <= 10) {
              setForm({ ...form, phoneNumber: value });
            }
          }}
          className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Enter 10-digit number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]"
          required
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-[#FF6A3D] text-white py-2 rounded font-semibold hover:bg-[#e55a35] transition-colors"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
};

export default UserCreateForm;
