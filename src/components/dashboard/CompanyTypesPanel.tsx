"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Building2, ChevronRight, ArrowRight } from "lucide-react";

type CompanyTypeLink = {
  href: string;
  label: string;
  subLabel?: string;
  variant: "primary" | "secondary";
};

const COMPANY_TYPES: CompanyTypeLink[] = [
  {
    href: "/clients?entity=opcs",
    label: "OPCs",
    subLabel: "One Person Companies",
    variant: "primary",
  },
  {
    href: "/clients?entity=privateIndividual%2CprivateCorporate",
    label: "Private Companies",
    subLabel: "Individual & corporate",
    variant: "secondary",
  },
  {
    href: "/clients?entity=publicIndividual%2CpublicCorporate",
    label: "Public Companies",
    subLabel: "Listed entities",
    variant: "secondary",
  },
  {
    href: "/clients?entity=foreignIndividual",
    label: "Foreign Individual",
    subLabel: "Non-resident",
    variant: "primary",
  },
];

const PRIVATE_SUB_LINKS = [
  { href: "/clients?entity=privateIndividual", label: "Individual Shareholding" },
  { href: "/clients?entity=privateCorporate", label: "Corporate Shareholders" },
];

const PUBLIC_SUB_LINKS = [
  { href: "/clients?entity=publicIndividual", label: "Individual Shareholding" },
  { href: "/clients?entity=publicCorporate", label: "Corporate Shareholders" },
];

function TypeCard({
  link,
  children,
}: {
  link: CompanyTypeLink;
  children?: ReactNode;
}) {
  const isPrimary = link.variant === "primary";

  return (
    <div className="space-y-2">
      <Link
        href={link.href}
        className={clsx(
          "group flex items-center gap-3 rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-sm",
          isPrimary
            ? "border-primary/15 bg-primary/[0.04] hover:border-primary/30 hover:bg-primary/[0.07]"
            : "border-secondary/15 bg-secondary/[0.04] hover:border-secondary/30 hover:bg-secondary/[0.07]",
        )}
      >
        <span
          className={clsx(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105",
            isPrimary ? "bg-primary" : "bg-secondary",
          )}
        >
          <Building2 className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={clsx(
              "text-sm font-semibold transition-colors",
              isPrimary
                ? "text-secondary group-hover:text-primary"
                : "text-secondary",
            )}
          >
            {link.label}
          </p>
          {link.subLabel && (
            <p className="truncate text-xs text-gray-500">{link.subLabel}</p>
          )}
        </div>
        <ChevronRight
          className={clsx(
            "h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5",
            isPrimary ? "text-primary/40 group-hover:text-primary" : "text-secondary/40 group-hover:text-secondary",
          )}
        />
      </Link>
      {children}
    </div>
  );
}

function SubLinks({
  links,
  variant,
}: {
  links: { href: string; label: string }[];
  variant: "primary" | "secondary";
}) {
  return (
    <div
      className={clsx(
        "ml-5 space-y-1 border-l-2 pl-4",
        variant === "primary" ? "border-primary/20" : "border-secondary/20",
      )}
    >
      {links.map((sub) => (
        <Link
          key={sub.href}
          href={sub.href}
          className={clsx(
            "block py-1 text-xs font-medium text-gray-500 transition-colors",
            variant === "primary"
              ? "hover:text-primary"
              : "hover:text-secondary",
          )}
        >
          {sub.label}
        </Link>
      ))}
    </div>
  );
}

export default function CompanyTypesPanel() {
  return (
    <div className="space-y-3">
      <TypeCard link={COMPANY_TYPES[0]} />

      <TypeCard link={COMPANY_TYPES[1]}>
        <SubLinks links={PRIVATE_SUB_LINKS} variant="secondary" />
      </TypeCard>

      <TypeCard link={COMPANY_TYPES[2]}>
        <SubLinks links={PUBLIC_SUB_LINKS} variant="secondary" />
      </TypeCard>

      <TypeCard link={COMPANY_TYPES[3]} />

      <Link
        href="/clients"
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F6FAFF] py-2.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/10 hover:text-secondary"
      >
        Browse all clients
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
