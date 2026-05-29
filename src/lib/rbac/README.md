# RBAC (admin UI)

Next.js/Turbopack cannot import from `../../shared/rbac` via symlinks, so the admin app uses copies of the shared modules in this folder.

**When editing permissions or route rules**, update both:

- `project1/shared/rbac/` (backend + source of truth)
- `project1/corpe-admin/src/lib/rbac/` (this folder)
