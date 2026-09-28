/**
 * Admin roles & permissions.
 * Enforced SERVER-SIDE in every API route handler (never frontend-only).
 * Roles map to effective permission sets; per-admin `permissions` act as overrides.
 */

export const PERMISSIONS = [
  "VIEW_USERS",
  "EDIT_USERS",
  "MANAGE_DEMOS",
  "MANAGE_SETUP",
  "ACTIVATE_USERS",
  "DEACTIVATE_USERS",
  "MANAGE_ADMINS",
  "MANAGE_PERMISSIONS",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ["SUPER_ADMIN", "ADMIN", "ONBOARDING_ADMIN", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: [
    "VIEW_USERS",
    "EDIT_USERS",
    "MANAGE_DEMOS",
    "MANAGE_SETUP",
    "ACTIVATE_USERS",
    "DEACTIVATE_USERS",
  ],
  ONBOARDING_ADMIN: ["VIEW_USERS", "MANAGE_DEMOS", "MANAGE_SETUP"],
  VIEWER: ["VIEW_USERS"],
};

/** Effective permissions = union of role permissions and explicit per-admin overrides. */
export function effectivePermissions(role: Role, overrides: string[] = []): Permission[] {
  const set = new Set<string>(ROLE_PERMISSIONS[role] ?? []);
  for (const p of overrides) if ((PERMISSIONS as readonly string[]).includes(p)) set.add(p);
  return Array.from(set) as Permission[];
}

export function hasPermission(perms: string[], needed: Permission | Permission[]): boolean {
  const list = Array.isArray(needed) ? needed : [needed];
  return list.every((p) => perms.includes(p));
}
