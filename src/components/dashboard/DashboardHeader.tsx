import React from "react";
import { Search, Bell, Plus } from "lucide-react";
import Image from "next/image";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-[150px] w-full items-center justify-between bg-white px-8 shadow-sm border-b border-[#F36541]">
      {/* Left Side: Search & Action */}
      {/* Left Side: Search & Action */}
      <div className="flex flex-col items-start gap-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="h-10 w-96 rounded-full border border-[#F36541]
 bg-white
      pl-6 pr-10 text-md text-secondary placeholder-[#3D63A4]
      focus:outline-none focus:border-[#F36541] focus:ring-2 focus:ring-[#F36541]"
          />
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
        </div>

        {/* Action Text */}
        {/* <button className="text-xl font-normal text-secondary hover:underline">
    + Create New Company
  </button> */}
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#F36541] hover:bg-gray-100 transition-colors">
          <Bell className="h-8 w-8" />
        </button>

        {/* Plus Icon */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#F36541] hover:bg-gray-100 transition-colors">
          <Image
            src="/plus.png"
            width={20}
            height={20}
            alt=""
            className="w-8 h-8"
          />
        </button>
      </div>
    </header>
  );
}
