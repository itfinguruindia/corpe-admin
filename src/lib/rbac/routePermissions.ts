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
    path: "/settings",
    prefix: true,
    permissions: [PERMISSIONS.SETTINGS_VIEW],
  },

  // Main app areas
  { path: "/dashboard", permissions: [PERMISSIONS.DASH_VIEW] },
  { path: "/clients", prefix: true, permissions: [PERMISSIONS.CLIENT_VIEW] },
  {
    path: "/marketing",
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
    href: "/marketing/leads",
    permissions: [PERMISSIONS.MARKETING_VIEW],
    prefix: true,
  },
  {
    href: "/marketing/newsletter",
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
