"use client";

import React, { useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  className,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 hover:text-[#FF6A3D] transition-colors"
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
              className={clsx(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                value === option.value
                  ? "bg-blue-50 text-secondary font-medium"
                  : "text-gray-700",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
