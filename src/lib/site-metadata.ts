import type { Metadata } from "next";

export const SITE_NAME = "CorpE Admin";
export const SITE_BRAND = "CorpE";

export const DEFAULT_DESCRIPTION =
  "CorpE admin portal for managing company incorporation, clients, documents, and MCA filings in India.";

type RouteMeta = {
  title: string;
  description?: string;
};

type RouteRule = {
  pattern: RegExp;
  meta: RouteMeta | ((pathname: string, match: RegExpMatchArray) => RouteMeta);
};

/** Longest / most specific patterns first */
const ROUTE_RULES: RouteRule[] = [
  {
    pattern: /^\/clients\/([^/]+)\/directors\/([^/]+)\/documents$/,
    meta: (_, m) => ({
      title: `Director Documents – ${m[1]}`,
      description: `Manage director KYC and compliance documents for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/shareholders\/([^/]+)\/documents$/,
    meta: (_, m) => ({
      title: `Shareholder Documents – ${m[1]}`,
      description: `Manage shareholder documents for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/directors\/([^/]+)$/,
    meta: (_, m) => ({
      title: `Director Details – ${m[1]}`,
      description: `View and edit director information for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/shareholders\/([^/]+)$/,
    meta: (_, m) => ({
      title: `Shareholder Details – ${m[1]}`,
      description: `View and edit shareholder information for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/registration-documents$/,
    meta: (_, m) => ({
      title: `Registration Documents – ${m[1]}`,
      description: `Review registration documents for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/uploaded-documents$/,
    meta: (_, m) => ({
      title: `Uploaded Documents – ${m[1]}`,
      description: `View documents uploaded by client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/pricing-and-payment$/,
    meta: (_, m) => ({
      title: `Pricing & Payment – ${m[1]}`,
      description: `Manage pricing, invoices, and payments for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/tracking-status$/,
    meta: (_, m) => ({
      title: `Tracking Status – ${m[1]}`,
      description: `Track incorporation progress for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/company-overview$/,
    meta: (_, m) => ({
      title: `Company Overview – ${m[1]}`,
      description: `View company details and overview for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/application$/,
    meta: (_, m) => ({
      title: `Application – ${m[1]}`,
      description: `Review and manage incorporation application for ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/moa-aoa$/,
    meta: (_, m) => ({
      title: `MoA & AoA – ${m[1]}`,
      description: `Manage Memorandum and Articles of Association for ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/directors$/,
    meta: (_, m) => ({
      title: `Directors – ${m[1]}`,
      description: `Manage directors for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)\/shareholders$/,
    meta: (_, m) => ({
      title: `Shareholders – ${m[1]}`,
      description: `Manage shareholders for client ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/clients\/([^/]+)$/,
    meta: (_, m) => ({
      title: `Client – ${m[1]}`,
      description: `Client workspace and incorporation details for ${m[1]}.`,
    }),
  },
  {
    pattern: /^\/settings\/users\/([^/]+)$/,
    meta: () => ({
      title: "Edit Admin User",
      description: "Update admin user profile, role, and account status.",
    }),
  },
  {
    pattern: /^\/settings\/roles\/create$/,
    meta: {
      title: "Create Access Role",
      description: "Define a new role and assign permissions.",
    },
  },
  {
    pattern: /^\/settings\/roles\/([^/]+)$/,
    meta: () => ({
      title: "Edit Access Role",
      description: "Update role permissions and settings.",
    }),
  },
  {
    pattern: /^\/messages\/([^/]+)$/,
    meta: () => ({
      title: "Message Thread",
      description: "View and reply to a client conversation.",
    }),
  },
  {
    pattern: /^\/dashboard$/,
    meta: {
      title: "Dashboard",
      description:
        "Overview of clients, tickets, targets, and incorporation activity.",
    },
  },
  {
    pattern: /^\/clients$/,
    meta: {
      title: "Clients",
      description: "Manage client applications and incorporation statuses.",
    },
  },
  {
    pattern: /^\/marketing\/leads$/,
    meta: {
      title: "Marketing Leads",
      description: "View and manage inbound marketing leads.",
    },
  },
  {
    pattern: /^\/marketing\/newsletter$/,
    meta: {
      title: "Newsletter Subscribers",
      description: "Manage newsletter subscribers and campaigns.",
    },
  },
  {
    pattern: /^\/documents\/templates$/,
    meta: {
      title: "Document Templates",
      description: "Access and manage incorporation document templates.",
    },
  },
  {
    pattern: /^\/messages$/,
    meta: {
      title: "Client Messages",
      description: "Inbox for client chat and support conversations.",
    },
  },
  {
    pattern: /^\/tickets$/,
    meta: {
      title: "Support Tickets",
      description: "Manage raised support tickets and resolutions.",
    },
  },
  {
    pattern: /^\/feedbacks$/,
    meta: {
      title: "Client Feedbacks",
      description: "Review feedback submitted by clients.",
    },
  },
  {
    pattern: /^\/notifications$/,
    meta: {
      title: "Notifications",
      description: "View system and activity notifications.",
    },
  },
  {
    pattern: /^\/settings\/users$/,
    meta: {
      title: "Admin Users",
      description: "Invite and manage administrative users.",
    },
  },
  {
    pattern: /^\/settings\/roles$/,
    meta: {
      title: "Access Roles",
      description: "Configure roles and permission matrices.",
    },
  },
  {
    pattern: /^\/settings$/,
    meta: {
      title: "Settings",
      description: "Profile, password, notifications, and account settings.",
    },
  },
  {
    pattern: /^\/login$/,
    meta: {
      title: "Login",
      description: `Sign in to the ${SITE_NAME} portal.`,
    },
  },
  {
    pattern: /^\/register$/,
    meta: {
      title: "Register",
      description: `Create an account for the ${SITE_NAME} portal.`,
    },
  },
  {
    pattern: /^\/forgot-password$/,
    meta: {
      title: "Forgot Password",
      description: "Reset your admin account password.",
    },
  },
  {
    pattern: /^\/verify-email-change$/,
    meta: {
      title: "Verify Email Change",
      description: "Confirm your new email address for your admin account.",
    },
  },
];

function resolveRouteMeta(pathname: string): RouteMeta {
  const normalized = pathname.split("?")[0].replace(/\/$/, "") || "/";

  for (const rule of ROUTE_RULES) {
    const match = normalized.match(rule.pattern);
    if (!match) continue;

    if (typeof rule.meta === "function") {
      return rule.meta(normalized, match);
    }
    return rule.meta;
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  };
}

export function formatPageTitle(pageTitle: string): string {
  if (pageTitle === SITE_NAME) {
    return SITE_NAME;
  }
  return `${pageTitle} | ${SITE_NAME}`;
}

export function getMetadataForPathname(pathname: string): Metadata {
  const { title, description } = resolveRouteMeta(pathname);
  const desc = description ?? DEFAULT_DESCRIPTION;
  const fullTitle = formatPageTitle(title);

  return {
    title: { absolute: fullTitle },
    description: desc,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      siteName: SITE_BRAND,
      type: "website",
    },
  };
}
