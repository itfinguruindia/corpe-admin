"use client";

import { Plus, Upload } from "lucide-react";

interface AddTemplateCardProps {
  onClick: () => void;
}

export default function AddTemplateCard({ onClick }: AddTemplateCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group flex h-full min-h-[22rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 p-6 shadow-sm transition-all duration-300 hover:border-green-500 hover:bg-green-50/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 transition group-hover:scale-105 group-hover:bg-green-600 group-hover:text-white">
        <Plus className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-gray-900">Import template</h3>
      <p className="mt-2 max-w-[12rem] text-center text-sm text-gray-500">
        Upload from your computer or Google Drive
      </p>
      <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-green-700">
        <Upload className="h-4 w-4" />
        Import
      </span>
    </div>
  );
}
