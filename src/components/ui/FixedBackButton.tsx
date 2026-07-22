"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type FixedBackButtonProps = {
  href: string;
  label: string;
  className?: string;
};

/** Navigates to a fixed route (not browser history). */
export default function FixedBackButton({
  href,
  label,
  className = "",
}: FixedBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`group mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 cursor-pointer ${className}`}
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
