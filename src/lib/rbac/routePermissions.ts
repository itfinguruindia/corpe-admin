import { PERMISSIONS } from "./permissions";

export interface RoutePermissionRule {
  /** Pathname prefix or exact path (Next.js style, no trailing slash required) */
  path?: string;
  /** If true, matches any sub-path under `path` */
  prefix?: boolean;
  pathRegex?: RegExp;
  permissions: string[];
  mode?: "any" | "all";
}

/**
 * Frontend route → required permissions (first matching rule wins).
 * Order matters: more specific paths should appear before broader prefixes.
 */
function routeRuleMatches(rule: RoutePermissionRule, normalized: string): boolean {
  if (rule.pathRegex) return rule.pathRegex.test(normalized);
  if (!rule.path) return false;
  const rulePath = rule.path.replace(/\/$/, "") || "/";
  return rule.prefix
    ? normalized === rulePath || normalized.startsWith(`${rulePath}/`)
    : normalized === rulePath;
}

export const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  // Settings sub-routes (specific first)
  {
    pathRegex: /^\/settings\/users\/[^/]+$/,
    permissions: [PERMISSIONS.USER_EDIT],
  },
  {
    path: "/settings/users",
    permissions: [PERMISSIONS.USER_VIEW],
  },
  {
    path: "/settings/roles/create",
    permissions: [PERMISSIONS.ROLE_CREATE],
  },
  {
    pathRegex: /^\/settings\/roles\/[^/]+$/,
    permissions: [PERMISSIONS.ROLE_EDIT],
  },
  {
    path: "/settings/roles",
    permissions: [PERMISSIONS.ROLE_VIEW],
  },
  {
    path: "/settings/activity-logs",
    prefix: true,
    permissions: [PERMISSIONS.ACTIVITY_LOGS_VIEW, PERMISSIONS.AUDIT_VIEW],
  },
  {
    path: "/compliance-calendar",
    permissions: [PERMISSIONS.SETTINGS_VIEW],
  },
  {
    path: "/settings/pricing",
    permissions: [PERMISSIONS.PRICING_EDIT, PERMISSIONS.SETTINGS_VIEW],
  },
  {
    path: "/settings",
    prefix: true,
    permissions: [PERMISSIONS.SETTINGS_VIEW],
  },

  // Main app areas
  { path: "/dashboard", permissions: [PERMISSIONS.DASH_VIEW] },

  // Client sub-pages (specific tab permissions — before list/hub rules)
  {
    pathRegex: /^\/clients\/[^/]+\/company-overview$/,
    permissions: [PERMISSIONS.COMPANY_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/directors(?:\/.*)?$/,
    permissions: [PERMISSIONS.DIRECTOR_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/shareholders(?:\/.*)?$/,
    permissions: [PERMISSIONS.SHAREHOLDER_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/moa-aoa$/,
    permissions: [PERMISSIONS.MOA_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/tracking-status$/,
    permissions: [PERMISSIONS.TRACK_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/application$/,
    permissions: [PERMISSIONS.APP_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/uploaded-documents$/,
    permissions: [PERMISSIONS.UPLOAD_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/registration-documents$/,
    permissions: [PERMISSIONS.REG_DOC_VIEW],
  },
  {
    pathRegex: /^\/clients\/[^/]+\/pricing-and-payment$/,
    permissions: [PERMISSIONS.PRICING_VIEW],
  },
  // Client detail hub (/clients/:appNo)
  {
    pathRegex: /^\/clients\/[^/]+$/,
    permissions: [PERMISSIONS.CLIENT_VIEW],
  },
  // Clients list
  { path: "/clients", permissions: [PERMISSIONS.CLIENT_VIEW] },
  {
    path: "/crm",
    prefix: true,
    permissions: [PERMISSIONS.MARKETING_VIEW],
  },
  {
    path: "/documents",
    prefix: true,
    permissions: [PERMISSIONS.DOC_VIEW],
  },
  { path: "/messages", prefix: true, permissions: [PERMISSIONS.MSG_VIEW] },
  { path: "/tickets", prefix: true, permissions: [PERMISSIONS.TICKET_VIEW] },
  { path: "/feedbacks", prefix: true, permissions: [PERMISSIONS.FEEDBACK_VIEW] },
];

export const ROUTE_ACCESS_DENIED_MESSAGE =
  "You do not have permission to access this page.";

/** Set before redirect; consumed on the next page to show the denial toast. */
export const RBAC_ROUTE_DENIED_STORAGE_KEY = "rbac_route_denied";

export function normalizeRoutePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

const CLIENT_APP_NO_PATTERN = /^\/clients\/([^/]+)/;

/** True when pathname is a client tab/sub-page (not list or hub). */
export function isClientSubRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized === "/clients") return false;
  const match = normalized.match(CLIENT_APP_NO_PATTERN);
  if (!match) return false;
  return normalized !== `/clients/${match[1]}`;
}

/**
 * Redirect target when route access is denied.
 * Prefers the client hub when the user can view clients; otherwise first nav route.
 */
export function getRedirectForDeniedRoute(
  pathname: string,
  hasPermissionFn: (perms: string[]) => boolean,
  isSuperAdmin = false,
): string {
  const match = pathname.match(CLIENT_APP_NO_PATTERN);
  if (match && hasPermissionFn([PERMISSIONS.CLIENT_VIEW])) {
    const hub = `/clients/${match[1]}`;
    const normalized = pathname.replace(/\/$/, "") || "/";
    if (normalized !== hub) return hub;
  }
  return getFirstAccessibleNavRoute(hasPermissionFn, isSuperAdmin);
}

export function getRequiredPermissionsForRoute(
  pathname: string,
): { permissions: string[]; mode: "any" | "all" } | null {
  const normalized = pathname.replace(/\/$/, "") || "/";

  for (const rule of ROUTE_PERMISSION_RULES) {
    if (!routeRuleMatches(rule, normalized)) continue;

    return {
      permissions: rule.permissions,
      mode: rule.mode ?? "any",
    };
  }

  return null;
}

/** Sidebar / nav item visibility */
export interface NavPermissionItem {
  href: string;
  permissions: string[];
  prefix?: boolean;
}

export const NAV_PERMISSION_ITEMS: NavPermissionItem[] = [
  { href: "/dashboard", permissions: [PERMISSIONS.DASH_VIEW] },
  { href: "/clients", permissions: [PERMISSIONS.CLIENT_VIEW], prefix: true },
  { href: "/feedbacks", permissions: [PERMISSIONS.FEEDBACK_VIEW], prefix: true },
  {
    href: "/crm/leads",
    permissions: [PERMISSIONS.MARKETING_VIEW],
    prefix: true,
  },
  {
    href: "/crm/newsletter",
    permissions: [PERMISSIONS.NEWSLETTER_VIEW],
    prefix: true,
  },
  {
    href: "/documents/templates",
    permissions: [PERMISSIONS.DOC_VIEW],
    prefix: true,
  },
  { href: "/messages", permissions: [PERMISSIONS.MSG_VIEW], prefix: true },
  { href: "/tickets", permissions: [PERMISSIONS.TICKET_VIEW], prefix: true },
  { href: "/settings", permissions: [PERMISSIONS.SETTINGS_VIEW], prefix: true },
];

/** First nav route the user may open (for "home" redirects when access is denied). */
export function getFirstAccessibleNavRoute(
  hasPermissionFn: (perms: string[]) => boolean,
  isSuperAdmin = false,
): string {
  if (isSuperAdmin) return "/dashboard";
  for (const item of NAV_PERMISSION_ITEMS) {
    if (hasPermissionFn(item.permissions)) return item.href;
  }
  return "/settings";
}

export function canAccessNavItem(
  pathname: string,
  item: NavPermissionItem,
  hasPermissionFn: (perms: string[]) => boolean,
): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const href = item.href.replace(/\/$/, "") || "/";
  const pathMatches = item.prefix
    ? normalized === href || normalized.startsWith(`${href}/`)
    : normalized === href;

  if (!pathMatches && item.prefix) {
    // For sidebar links, show if user has permission (not only when active)
    return hasPermissionFn(item.permissions);
  }
  return hasPermissionFn(item.permissions);
}
