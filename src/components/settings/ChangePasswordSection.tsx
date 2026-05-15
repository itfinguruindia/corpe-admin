"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input, Label, TextField } from "@heroui/react";

interface ChangePasswordSectionProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordData: React.Dispatch<
    React.SetStateAction<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  passwordErrors: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordErrors: React.Dispatch<
    React.SetStateAction<{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>
  >;
  handlePasswordChange: () => void;
  isLoading?: boolean;
  id?: string;
}

export default function ChangePasswordSection({
  passwordData,
  setPasswordData,
  passwordErrors,
  setPasswordErrors,
  handlePasswordChange,
  isLoading = false,
  id,
}: ChangePasswordSectionProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div id={id} className="rounded-xl bg-white shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#FF6A3D] mb-2">
        Change Password
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Update your password to keep your account secure
      </p>

      <div className="space-y-4">
        <TextField
          value={passwordData.currentPassword}
          onChange={(v) => {
            setPasswordData({
              ...passwordData,
              currentPassword: v,
            });
            setPasswordErrors({
              ...passwordErrors,
              currentPassword: "",
            });
          }}
          type={showCurrentPassword ? "text" : "password"}
          name="currentPassword"
        >
          <Label className="block text-sm font-medium text-secondary mb-2">
            Current Password
          </Label>
          <div className="relative">
            <Input
              placeholder="Enter current password"
              className={`w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 ${
                passwordErrors.currentPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 h-auto min-h-8 min-w-8 -translate-y-1/2 p-0 text-gray-600 hover:bg-transparent hover:text-[#FF6A3D] focus:outline-none"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5 text-current" />
              ) : (
                <Eye className="h-5 w-5 text-current" />
              )}
            </Button>
          </div>
          {passwordErrors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.currentPassword}
            </p>
          )}
        </TextField>

        <TextField
          value={passwordData.newPassword}
          onChange={(v) => {
            setPasswordData({
              ...passwordData,
              newPassword: v,
            });
            setPasswordErrors({
              ...passwordErrors,
              newPassword: "",
            });
          }}
          type={showNewPassword ? "text" : "password"}
          name="newPassword"
        >
          <Label className="block text-sm font-medium text-secondary mb-2">
            New Password
          </Label>
          <div className="relative">
            <Input
              placeholder="Enter new password"
              className={`w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 ${
                passwordErrors.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 h-auto min-h-8 min-w-8 -translate-y-1/2 p-0 text-gray-600 hover:bg-transparent hover:text-[#FF6A3D] focus:outline-none"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-current" />
              ) : (
                <Eye className="h-5 w-5 text-current" />
              )}
            </Button>
          </div>
          {passwordErrors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.newPassword}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase,
            and numbers
          </p>
        </TextField>

        <TextField
          value={passwordData.confirmPassword}
          onChange={(v) => {
            setPasswordData({
              ...passwordData,
              confirmPassword: v,
            });
            setPasswordErrors({
              ...passwordErrors,
              confirmPassword: "",
            });
          }}
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
        >
          <Label className="block text-sm font-medium text-secondary mb-2">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              placeholder="Confirm new password"
              className={`w-full rounded-lg border bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 ${
                passwordErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 h-auto min-h-8 min-w-8 -translate-y-1/2 p-0 text-gray-600 hover:bg-transparent hover:text-[#FF6A3D] focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-current" />
              ) : (
                <Eye className="h-5 w-5 text-current" />
              )}
            </Button>
          </div>
          {passwordErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.confirmPassword}
            </p>
          )}
        </TextField>

        <Button
          type="button"
          isDisabled={isLoading}
          onClick={handlePasswordChange}
          className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF6A3D] px-6 py-2 text-sm sm:text-base font-medium text-white transition-all hover:bg-[#e55a2d] ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </div>
    </div>
  );
}
