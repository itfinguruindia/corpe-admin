interface InfoFieldProps {
  label: string;
  value: string;
  sublabel?: string;
  sublabelColor?: string;
  border?: boolean;
}

export function InfoField({
  label,
  value,
  sublabel,
  sublabelColor = "text-gray-500",
  border = true,
}: InfoFieldProps) {
  return (
    <div
      className={` ${border ? "border-b border-[#F9A826]" : ""} py-4 flex items-start max-w-xl justify-between`}
    >
      <label className="text-sm font-semibold text-gray-900">
        {label}
        {sublabel && (
          <span className={`ml-2 text-xs ${sublabelColor} font-normal italic`}>
            {sublabel}
          </span>
        )}
      </label>
      <p className="text-base text-gray-700">{value}</p>
    </div>
  );
}
