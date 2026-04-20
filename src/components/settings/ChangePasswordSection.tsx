"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                });
                setPasswordErrors({
                  ...passwordErrors,
                  currentPassword: "",
                });
              }}
              className={`w-full rounded-lg border ${
                passwordErrors.currentPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {passwordErrors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                });
                setPasswordErrors({
                  ...passwordErrors,
                  newPassword: "",
                });
              }}
              className={`w-full rounded-lg border ${
                passwordErrors.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                });
                setPasswordErrors({
                  ...passwordErrors,
                  confirmPassword: "",
                });
              }}
              className={`w-full rounded-lg border ${
                passwordErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } bg-white px-4 py-2 pr-10 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {passwordErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordErrors.confirmPassword}
            </p>
          )}
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={isLoading}
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
        </button>
      </div>
    </div>
  );
}
