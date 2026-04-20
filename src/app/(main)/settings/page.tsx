"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { parsePhoneNumber } from "react-phone-number-input";

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchProfilePictureUrl = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/auth/admin-profile-picture-url", {
        headers: {
          "x-access-token": token || "",
          "x-access-token-type": "accessToken",
        },
      });
      if (response.data.success && response.data.data?.profilePictureUrl) {
        setProfileImage(response.data.data.profilePictureUrl);
      }
    } catch (error) {
      console.error("Failed to fetch profile picture URL", error);
    }
  }, []);

  const handleProfileSave = async () => {
    // Parse the E.164 number from react-phone-number-input
    let countryCode = "+1";
    let nationalNumber = profileData.phoneNumber;

    if (profileData.phoneNumber) {
      try {
        const parsed = parsePhoneNumber(profileData.phoneNumber);
        if (parsed) {
          countryCode = `+${parsed.countryCallingCode}`;
          nationalNumber = parsed.nationalNumber;
        }
      } catch {
        // If parsing fails, send raw
      }
    }

    if (!nationalNumber || nationalNumber.length < 4) {
      await swal({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Please enter a valid phone number",
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
            phoneNumber: nationalNumber,
            countryCode: countryCode,
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

          // Rebuild E.164 for the state
          const newFullPhone = `${countryCode}${nationalNumber}`;
          setInitialProfileData((prev) => ({
            ...prev,
            displayName: profileData.displayName,
            phoneNumber: newFullPhone,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      await swal({
        icon: "error",
        title: "Invalid File Type",
        text: "Only JPEG, PNG, and WebP images are allowed.",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      await swal({
        icon: "error",
        title: "File Too Large",
        text: "Please select an image smaller than 10 MB.",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        "/auth/admin-upload-profile-picture",
        formData,
        {
          headers: {
            "x-access-token": token || "",
            "x-access-token-type": "accessToken",
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30s for upload
        },
      );

      if (response.data.success) {
        const { profilePictureUrl, admin } = response.data.data;
        if (profilePictureUrl) {
          setProfileImage(profilePictureUrl);
        }
        if (admin) {
          localStorage.setItem("adminInfo", JSON.stringify(admin));
        }
        await swal({
          icon: "success",
          title: "Success",
          text: "Profile picture uploaded successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      await swal({
        icon: "error",
        title: "Upload Failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to upload profile picture.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    const result = await swal({
      title: "Remove Photo?",
      text: "Are you sure you want to remove your profile picture?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.delete(
        "/auth/admin-remove-profile-picture",
        {
          headers: {
            "x-access-token": token || "",
            "x-access-token-type": "accessToken",
          },
        },
      );

      if (response.data.success) {
        setProfileImage(null);
        const admin = response.data.data?.admin;
        if (admin) {
          localStorage.setItem("adminInfo", JSON.stringify(admin));
        }
        await swal({
          icon: "success",
          title: "Removed",
          text: "Profile picture removed successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      await swal({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to remove profile picture.",
      });
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

  useEffect(() => {
    const adminStr = localStorage.getItem("adminInfo");
    if (adminStr) {
      try {
        const admin = JSON.parse(adminStr);

        // Rebuild the E.164 phone number from stored countryCode + phoneNumber
        const countryCode = admin.countryCode || "+1";
        const rawPhone = admin.phoneNumber ||"";
        // If rawPhone already starts with +, use it as-is; otherwise combine
        const fullPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone}`;

        const data = {
          displayName: admin.name || "",
          phoneNumber: fullPhone,
          email: admin.email || "",
        };
        setProfileData(data);
        setInitialProfileData(data);

        // Fetch profile picture signed URL if admin has a profile picture
        if (admin.profilePicture) {
          fetchProfilePictureUrl();
        }
      } catch (e) {
        console.error("Failed to parse admin info", e);
      }
    }
  }, [fetchProfilePictureUrl]);

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
            id="profile-section"
            profileData={profileData}
            setProfileData={setProfileData}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            profileImage={profileImage}
            handleImageUpload={handleImageUpload}
            handleRemoveProfilePicture={handleRemoveProfilePicture}
            handleProfileSave={handleProfileSave}
            isLoading={isSavingProfile}
            isUploadingImage={isUploadingImage}
          />

          <ChangePasswordSection
            id="password-section"
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            passwordErrors={passwordErrors}
            setPasswordErrors={setPasswordErrors}
            handlePasswordChange={handlePasswordChange}
            isLoading={isChangingPassword}
          />

          <AccessRolesSection id="roles-section" />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <NotificationsSection id="notifications-section" />

          <DataManagementSection id="data-management-section" />
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
