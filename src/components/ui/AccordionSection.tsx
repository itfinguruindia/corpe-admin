import { ChevronDown, LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";

interface AccordionSectionProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  activeCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors duration-150 group"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`w-4 h-4 transition-colors ${
                isOpen
                  ? "text-orange-500"
                  : "text-slate-400 group-hover:text-slate-600"
              }`}
            />
          )}

          <span
            className={`text-sm font-semibold transition-colors ${
              isOpen
                ? "text-orange-500"
                : "text-slate-700 group-hover:text-slate-900"
            }`}
          >
            {title}
          </span>

          {activeCount > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
              {activeCount}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 transition-all duration-300 ${
            isOpen
              ? "rotate-180 text-orange-500"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3 pt-1 flex flex-col gap-0.5">{children}</div>
      </div>
    </div>
  );
};

export default AccordionSection;
