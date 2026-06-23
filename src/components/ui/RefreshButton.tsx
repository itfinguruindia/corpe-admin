"use client";

import { forwardRef } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import clsx from "clsx";

type RefreshButtonProps = {
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  ariaLabel?: string;
  className?: string;
  size?: number;
};

const RefreshButton = forwardRef<HTMLButtonElement, RefreshButtonProps>(
  function RefreshButton(
    {
      onClick,
      isLoading = false,
      isDisabled = false,
      ariaLabel = "Refresh",
      className,
      size = 18,
    },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        isIconOnly
        onPress={onClick}
        isDisabled={isDisabled || isLoading}
        className={clsx(
          "h-10 w-10 min-w-10 shrink-0 rounded-lg border border-gray-200 bg-white p-0 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900",
          className,
        )}
        aria-label={ariaLabel}
        type="button"
        variant="ghost"
      >
        <RefreshCw size={size} className={isLoading ? "animate-spin" : ""} />
      </Button>
    );
  },
);

export default RefreshButton;
