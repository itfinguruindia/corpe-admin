import React from "react";
import clsx from "clsx";

export type ChipVariant =
  | "blue"
  | "gray"
  | "yellow"
  | "red"
  | "orange"
  | "green";

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({ label, variant = "gray", icon, className }: ChipProps) {
  const variantColors: Record<ChipVariant, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    red: "bg-red-100 text-red-700 border-red-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    green: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium",
        variantColors[variant],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
