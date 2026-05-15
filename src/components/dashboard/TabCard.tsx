import React from "react";
import { Card, cn } from "@heroui/react";

interface TabCardProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TabCard({
  label,
  active,
  onClick,
  className = "",
}: TabCardProps) {
  return (
    <Card
      className={cn(
        "flex min-h-[3.25rem] w-full items-center justify-center px-3 py-3 text-center text-sm font-medium shadow-sm cursor-pointer transition-all duration-300 border sm:min-h-[3.5rem] sm:px-4 sm:py-4 sm:text-base lg:text-lg",
        active
          ? "bg-white text-secondary border-primary/30 ring-2 ring-primary/5 shadow-md sm:ring-4 sm:scale-[1.02]"
          : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:shadow-md hover:text-secondary",
        className,
      )}
      onClick={onClick}
    >
      <span className="leading-snug break-words">{label}</span>
    </Card>
  );
}
