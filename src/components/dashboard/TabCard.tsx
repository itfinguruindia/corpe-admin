import React from "react";
import clsx from "clsx";

interface TabCardProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string; // Added to support customization like text-left
}

export default function TabCard({
  label,
  active,
  onClick,
  className = "",
}: TabCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-xl px-6 py-4 text-center text-lg font-medium shadow-sm cursor-pointer transition-all duration-300 border",
        active
          ? "bg-white text-secondary border-primary/30 ring-4 ring-primary/5 shadow-md scale-[1.02]"
          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:shadow-md hover:text-secondary",
        className,
      )}
    >
      {label}
    </div>
  );
}
