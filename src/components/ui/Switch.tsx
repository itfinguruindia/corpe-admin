import React from "react";
import clsx from "clsx";

interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F46A45] focus:ring-offset-2",
          checked ? "bg-[#F46A45]" : "bg-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      {label && (
        <label
          className={clsx(
            "text-sm font-medium text-gray-700",
            !disabled && "cursor-pointer",
            disabled && "opacity-50",
          )}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
