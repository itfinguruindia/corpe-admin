interface InfoFieldProps {
  label: string;
  value: string;
  sublabel?: string;
  sublabelColor?: string;
  border?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function InfoField({
  label,
  value,
  sublabel,
  sublabelColor = "text-gray-500",
  border = true,
  className = "",
  fullWidth = false,
}: InfoFieldProps) {
  return (
    <div
      className={`${border ? "border-b border-[#F9A826]" : ""} py-4 flex items-start justify-between ${fullWidth ? "w-full max-w-none" : "max-w-xl"} ${className}`}
    >
      <label className="text-sm font-semibold text-gray-900 pr-4">
        {label}
        {sublabel && (
          <span className={`ml-2 text-xs ${sublabelColor} font-normal italic`}>
            {sublabel}
          </span>
        )}
      </label>
      <p className="text-base text-gray-700 shrink-0">{value}</p>
    </div>
  );
}
