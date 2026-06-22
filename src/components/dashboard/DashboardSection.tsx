import clsx from "clsx";
import type { ReactNode } from "react";

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function DashboardSection({
  title,
  description,
  children,
  className,
  id,
}: DashboardSectionProps) {
  return (
    <section id={id} className={clsx("space-y-5", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-secondary md:text-xl">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
