import React from "react";

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
      style={{
        background: active
          ? "linear-gradient(114.98deg, rgba(255, 255, 255, 0) 43.6%, #F36541 133.03%)"
          : "white",
      }}
      className={`rounded-xl px-6 py-4 text-center text-[20px] font-normal shadow-sm cursor-pointer transition-all duration-300
        ${
          active
            ? "text-secondary ring-1 ring-orange-200" // active state
            : "text-secondary hover:shadow-md hover:scale-[1.02]" // inactive state
        }
        hover:bg-gradient-to-br from-white to-orange-50
        ${className}
      `}
    >
      {label}
    </div>
  );
}
