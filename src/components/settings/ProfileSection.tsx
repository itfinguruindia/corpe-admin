"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, Edit2, Trash2, Loader2 } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface ProfileSectionProps {
  profileData: {
    displayName: string;
    phoneNumber: string;
    email: string;
  };
  setProfileData: React.Dispatch<
    React.SetStateAction<{
      displayName: string;
      phoneNumber: string;
      email: string;
    }>
  >;
  isEditingProfile: boolean;
  setIsEditingProfile: React.Dispatch<React.SetStateAction<boolean>>;
  profileImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveProfilePicture?: () => void;
  handleProfileSave: () => void;
  isLoading?: boolean;
  isUploadingImage?: boolean;
  id?: string;
}

export default function ProfileSection({
  profileData,
  setProfileData,
  isEditingProfile,
  setIsEditingProfile,
  profileImage,
  handleImageUpload,
  handleRemoveProfilePicture,
  handleProfileSave,
  isLoading = false,
  isUploadingImage = false,
  id,
}: ProfileSectionProps) {
  return (
    <div id={id} className="rounded-xl bg-white shadow-sm p-6">
      <div className="flex items-center gap-6 mb-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="h-32 w-32 rounded-full bg-[#3D63A4] flex items-center justify-center overflow-hidden">
            {isUploadingImage ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={128}
                height={128}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <Upload className="h-12 w-12 text-[#FFD54F]" />
            )}
          </div>
          <label
            htmlFor="profile-upload"
            className={`absolute bottom-0 right-0 h-10 w-10 rounded-full bg-[#FF6A3D] flex items-center justify-center cursor-pointer hover:bg-[#e55a2d] transition-colors ${isUploadingImage ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-5 w-5 text-white" />
            <input
              id="profile-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
          {/* Remove picture button */}
          {profileImage && handleRemoveProfilePicture && !isUploadingImage && (
            <button
              onClick={handleRemoveProfilePicture}
              className="absolute top-0 right-0 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-md"
              title="Remove photo"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-secondary mb-1">
            {profileData.displayName}
          </h3>
          <p className="text-sm text-gray-500">Account Settings</p>
        </div>

        {/* Centralized Edit Button */}
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="flex items-center gap-2 rounded-lg bg-[#FF6A3D] px-4 py-2 text-white hover:bg-[#e55a2d] transition-colors"
        >
          <Edit2 className="h-5 w-5" />
          <span className="font-medium">
            {isEditingProfile ? "Cancel" : "Edit"}
          </span>
        </button>
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={profileData.displayName}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                displayName: e.target.value,
              })
            }
            disabled={!isEditingProfile}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm sm:text-base text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Phone Number
          </label>
          <PhoneInput
            international
            defaultCountry="US"
            value={profileData.phoneNumber}
            onChange={(value) =>
              setProfileData({
                ...profileData,
                phoneNumber: value || "",
              })
            }
            disabled={!isEditingProfile}
            className="phone-input-custom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
            disabled={!isEditingProfile}
            className="w-full rounded-lg text-sm sm:text-base border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20 disabled:bg-gray-50"
          />
        </div>

        {/* Save Button */}
        <button
          disabled={!isEditingProfile || isLoading}
          onClick={handleProfileSave}
          className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF6A3D] px-6 py-3 text-sm sm:text-base font-medium text-white transition-all hover:bg-[#e55a2d] ${(!isEditingProfile || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
