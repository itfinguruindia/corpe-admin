import { Check } from "lucide-react";
import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  indented?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  indented = false,
  indeterminate = false,
  className = "",
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return (
    <label
      className={`flex items-center gap-2.5 cursor-pointer group py-1 ${indented ? "pl-5" : ""} ${className}`}
    >
      {/* Hidden native checkbox */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      {/* Custom checkbox UI */}
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border-2 shrink-0 transition-all duration-150 
          ${
            checked
              ? "bg-orange-500 border-orange-500"
              : indeterminate
                ? "border-orange-400 bg-white"
                : "border-slate-300 group-hover:border-orange-400 bg-white"
          }`}
      >
        {(checked || indeterminate) && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
      </div>

      {/* Label text */}
      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors select-none">
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
