"use client";

import React, { useState, useEffect } from "react";
import useSwal from "@/utils/useSwal";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ProfileSection,
  ChangePasswordSection,
  AccessRolesSection,
  NotificationsSection,
  DataManagementSection,
} from "@/components/settings";
import { requestEmailChange } from "@/utils/auth";

export default function SettingPage() {
  const router = useRouter();
  const swal = useSwal();
  const [profileData, setProfileData] = useState({
    displayName: "",
    phoneNumber: "",
    email: "",
  });
  const [initialProfileData, setInitialProfileData] = useState({
    displayName: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    const adminStr = localStorage.getItem("adminInfo");
    if (adminStr) {
      try {
        const admin = JSON.parse(adminStr);
        const data = {
          displayName: admin.name || "",
          phoneNumber:
            admin.phoneNumber || admin.phone || admin.contactNumber || "",
          email: admin.email || "",
        };
        setProfileData(data);
        setInitialProfileData(data);
      } catch (e) {
        console.error("Failed to parse admin info", e);
      }
    }
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Removed showLogoutModal, not needed with useSwal

  const handleProfileSave = async () => {
    if (!/^\d{10}$/.test(profileData.phoneNumber)) {
      await swal({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits",
      });
      setIsSavingProfile(false);
      return;
    }

    setIsSavingProfile(true);
    try {
      const emailChanged = profileData.email !== initialProfileData.email;
      const otherChanged =
        profileData.displayName !== initialProfileData.displayName ||
        profileData.phoneNumber !== initialProfileData.phoneNumber;

      if (emailChanged) {
        await requestEmailChange(profileData.email);
        await swal({
          icon: "success",
          title: "Check your email",
          text: "Verification link sent to your current email",
        });
        // Revert email in UI since it's not changed yet
        setProfileData((prev) => ({
          ...prev,
          email: initialProfileData.email,
        }));
      }

      if (otherChanged) {
        const token = localStorage.getItem("accessToken");
        const response = await axiosInstance.put(
          "/auth/admin-update-profile",
          {
            name: profileData.displayName,
            phoneNumber: profileData.phoneNumber,
          },
          {
            headers: {
              "x-access-token": token || "",
              "x-access-token-type": "accessToken",
            },
          },
        );

        if (response.data.success) {
          const updatedAdmin = response.data.data.admin;
          if (updatedAdmin) {
            localStorage.setItem("adminInfo", JSON.stringify(updatedAdmin));
          }

          setInitialProfileData((prev) => ({
            ...prev,
            displayName: profileData.displayName,
            phoneNumber: profileData.phoneNumber,
          }));

          if (!emailChanged) {
            await swal({
              icon: "success",
              title: "Profile Updated",
              text: "Your profile has been updated successfully.",
            });
          }
        } else {
          throw new Error(response.data.message || "Failed to update profile");
        }
      }

      setIsEditingProfile(false);
    } catch (error: any) {
      await swal({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters long";
      isValid = false;
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordData.newPassword)) {
        errors.newPassword =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        isValid = false;
      }
    }

    // Check not same as current
    if (
      passwordData.newPassword &&
      passwordData.newPassword === passwordData.currentPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.post(
        "/auth/admin-update-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            "x-access-token": token || "",
            "x-access-token-type": "access_token",
          },
        },
      );

      if (response.data.success) {
        const { accessToken, refreshToken, admin } = response.data.data;
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          Cookies.set("accessToken", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
          Cookies.set("refreshToken", refreshToken);
        }
        if (admin) {
          localStorage.setItem("adminInfo", JSON.stringify(admin));
        }

        await swal({
          icon: "success",
          title: "Success",
          text: "Password changed successfully!",
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to update password";

      // If the error message indicates current password mismatch, you can choose to show it inline vs. swal
      if (errorMsg.toLowerCase().includes("current password")) {
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: errorMsg,
        }));
      } else {
        await swal({
          icon: "error",
          title: "Error",
          text: errorMsg,
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const result = await swal({
      title: "Log out?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF6A3D",
    });

    if (!result.isConfirmed) return;

    try {
      // ✅ Clear tokens ONLY on success
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("adminInfo");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");

      // ✅ Success alert
      await swal({
        icon: "success",
        title: "Logged out!",
        text: "You have been logged out successfully.",
        timer: 1200,
        showConfirmButton: false,
      });

      router.push("/login");
    } catch (error: any) {
      // ❌ Failure alert
      await swal({
        icon: "error",
        title: "Logout failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  const handleDeleteAccount = () => {
    swal({
      title: "Delete Account?",
      text: "Are you sure you want to delete your account? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result: any) => {
      if (result.isConfirmed) {
        // TODO: API call to delete account
        swal({
          title: "Deleted!",
          text: "Your account has been deleted.",
          icon: "success",
        });
        console.log("Account deleted");
      }
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#FF6A3D]">Settings</h1>
        <p className="mt-2 text-base text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ProfileSection
            profileData={profileData}
            setProfileData={setProfileData}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            profileImage={profileImage}
            handleImageUpload={handleImageUpload}
            handleProfileSave={handleProfileSave}
            isLoading={isSavingProfile}
          />

          <ChangePasswordSection
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            passwordErrors={passwordErrors}
            setPasswordErrors={setPasswordErrors}
            handlePasswordChange={handlePasswordChange}
            isLoading={isChangingPassword}
          />

          <AccessRolesSection />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <NotificationsSection />

          <DataManagementSection />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          onClick={handleDeleteAccount}
          className="text-base font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          Delete Account
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-[#FF6A3D] px-8 py-2 text-base font-medium text-white transition-all hover:bg-[#e55a2d]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
