/**
 * Role-Based Access Control (RBAC)
 *
 * Roles:
 * - owner:  full access, including billing and irreversible actions
 * - admin:  full operational access + settings/team management
 * - member: standard operational access (read + write resources)
 * - viewer: read-only access
 */

export type Role = "owner" | "admin" | "member" | "viewer";

export type Permission =
  // Resources
  | "resources:read"
  | "resources:write"
  | "resources:delete"
  // Billing
  | "billing:manage"
  // Settings
  | "settings:manage"
  // Team
  | "team:manage"
  | "team:invite"
  // Audit
  | "audit:read";

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  owner: new Set<Permission>([
    "resources:read",
    "resources:write",
    "resources:delete",
    "billing:manage",
    "settings:manage",
    "team:manage",
    "team:invite",
    "audit:read",
  ]),
  admin: new Set<Permission>([
    "resources:read",
    "resources:write",
    "resources:delete",
    "settings:manage",
    "team:manage",
    "team:invite",
    "audit:read",
  ]),
  member: new Set<Permission>([
    "resources:read",
    "resources:write",
    "team:invite",
  ]),
  viewer: new Set<Permission>([
    "resources:read",
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}
