export interface SearchItem {
  id: string;
  title: string;
  category: string;
  path: string;
  keywords: string[];
  description?: string;
}

export const navigationIndex: SearchItem[] = [
  // Primary Pages
  {
    id: "dashboard",
    title: "Dashboard",
    category: "Page",
    path: "/dashboard",
    keywords: ["home", "main", "overview", "stats"],
    description: "Main dashboard with overview stats and company highlights.",
  },
  {
    id: "clients",
    title: "Clients",
    category: "Page",
    path: "/clients",
    keywords: ["users", "customers", "applications", "client list"],
    description: "Manage all clients and their application statuses.",
  },
  {
    id: "leads",
    title: "Marketing Leads",
    category: "Marketing",
    path: "/marketing/leads",
    keywords: ["marketing", "leads", "potential clients", "new sales"],
    description: "View and manage marketing leads.",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    category: "Marketing",
    path: "/marketing/newsletter",
    keywords: ["email", "campaign", "marketing", "newsletter"],
    description: "Manage newsletter subscriptions and campaigns.",
  },
  {
    id: "templates",
    title: "Document Templates",
    category: "Documents",
    path: "/documents/templates",
    keywords: ["docs", "templates", "library", "forms"],
    description: "Access and manage document templates.",
  },
  {
    id: "messages",
    title: "Client Messages",
    category: "Communication",
    path: "/messages",
    keywords: ["chat", "inbox", "communication", "support"],
    description: "View and respond to client messages.",
  },
  {
    id: "tickets",
    title: "Raised Tickets",
    category: "Communication",
    path: "/tickets",
    keywords: ["support", "tickets", "issues", "helpdesk"],
    description: "Manage support tickets and issues.",
  },
  {
    id: "settings",
    title: "Settings",
    category: "System",
    path: "/settings",
    keywords: ["profile", "account", "config", "admin"],
    description: "Manage your account settings and application config.",
  },

  // Sub-Pages
  {
    id: "settings-roles",
    title: "Access Roles",
    category: "System",
    path: "/settings/roles",
    keywords: ["permissions", "roles", "access", "security"],
    description: "Manage user roles and permissions.",
  },
  {
    id: "settings-users",
    title: "Admin Users",
    category: "System",
    path: "/settings/users",
    keywords: ["admins", "team", "staff", "users"],
    description: "Manage administrative users.",
  },

  // Sections on Dashboard
  {
    id: "stats-summary",
    title: "Stats Summary",
    category: "Section",
    path: "/dashboard#stats-overview",
    keywords: ["total applications", "approved stats", "performance"],
    description: "Quick summary of application statistics.",
  },
  {
    id: "highlights",
    title: "Highlights/Notifications",
    category: "Section",
    path: "/dashboard#highlights",
    keywords: ["alerts", "updates", "recent activity"],
    description: "Recent highlights and notification updates.",
  },
  {
    id: "company-types",
    title: "Company Types",
    category: "Section",
    path: "/dashboard#company-types",
    keywords: ["entity", "opc", "private", "public", "pvt ltd"],
    description: "Distribution of company entity types.",
  },
  {
    id: "recent-onboarded",
    title: "Recently Onboarded",
    category: "Section",
    path: "/dashboard#recent-onboarded",
    keywords: ["history", "timeline", "latest companies"],
    description: "Timeline of recently onboarded clients.",
  },
  {
    id: "monthly-target",
    title: "Monthly Target Chart",
    category: "Section",
    path: "/dashboard#monthly-target",
    keywords: ["goals", "kpi", "performance", "charts"],
    description: "Progress towards monthly incorporation targets.",
  },
  {
    id: "raised-tickets-dashboard",
    title: "Recent Tickets (Dashboard)",
    category: "Section",
    path: "/dashboard#raised-tickets",
    keywords: ["support", "issues", "pending help"],
    description: "Recent raised tickets overview.",
  },

  // Sections on Clients
  {
    id: "clients-table",
    title: "Clients Table",
    category: "Section",
    path: "/clients#clients-table",
    keywords: ["client-list", "table", "grid"],
    description: "The main client management table.",
  },

  // Sections on Marketing
  {
    id: "leads-table",
    title: "Marketing Leads Table",
    category: "Section",
    path: "/marketing/leads#leads-table",
    keywords: ["leads-list", "sales-leads"],
    description: "Detailed table of marketing leads.",
  },
  {
    id: "subscribers-table",
    title: "Newsletter Subscribers",
    category: "Section",
    path: "/marketing/newsletter#subscribers-table",
    keywords: ["emails", "subs", "list"],
    description: "Manage newsletter subscription list.",
  },

  // Sections on Documents
  {
    id: "templates-grid",
    title: "Templates Library",
    category: "Section",
    path: "/documents/templates#templates-grid",
    keywords: ["docs-grid", "available-templates"],
    description: "Grid view of available document templates.",
  },

  // Sections on Communication
  {
    id: "messages-table",
    title: "Messages Feed",
    category: "Section",
    path: "/messages#messages-table",
    keywords: ["inbox", "chats", "client-comms"],
    description: "Feed of incoming client messages.",
  },
  {
    id: "tickets-table",
    title: "Support Tickets List",
    category: "Section",
    path: "/tickets#tickets-table",
    keywords: ["all-tickets", "support-grid"],
    description: "Categorized list of support tickets.",
  },

  // Sections on Settings
  {
    id: "profile-section",
    title: "Profile Settings",
    category: "Section",
    path: "/settings#profile-section",
    keywords: ["personal info", "avatar", "display name"],
    description: "Manage your personal profile information.",
  },
  {
    id: "password-section",
    title: "Change Password",
    category: "Section",
    path: "/settings#password-section",
    keywords: ["security", "update password", "creds"],
    description: "Update your account login password.",
  },
  {
    id: "roles-section",
    title: "Access Roles Summary",
    category: "Section",
    path: "/settings#roles-section",
    keywords: ["permissions overview", "access control"],
    description: "Summary of your access roles and permissions.",
  },
  {
    id: "notifications-section",
    title: "Notification Preferences",
    category: "Section",
    path: "/settings#notifications-section",
    keywords: ["email alerts", "push notifications", "comms"],
    description: "Configure how you receive system notifications.",
  },
  {
    id: "data-management-section",
    title: "Data Management",
    category: "Section",
    path: "/settings#data-management-section",
    keywords: ["export data", "privacy", "account status"],
    description: "Tools for managing your data and privacy.",
  },
];
