import type { User } from "@supabase/supabase-js";
import { adminEmails } from "@/config/env";

const normalizeRole = (role?: string | null) => (role ?? "").toLowerCase();

export const hasAdminRole = (user?: User | null): boolean => {
  if (!user) return false;

  const appRole = normalizeRole((user.app_metadata as any)?.role);
  const userRole = normalizeRole((user.user_metadata as any)?.role);

  if (appRole === "admin" || appRole === "superadmin") return true;
  if (userRole === "admin" || userRole === "superadmin") return true;

  const appRoles = (user.app_metadata as any)?.roles;
  const userRoles = (user.user_metadata as any)?.roles;

  if (Array.isArray(appRoles) && appRoles.map(normalizeRole).includes("admin")) return true;
  if (Array.isArray(userRoles) && userRoles.map(normalizeRole).includes("admin")) return true;

  const appClaims = (user.app_metadata as any)?.claims;
  const userClaims = (user.user_metadata as any)?.claims;

  if (normalizeRole(appClaims?.role) === "admin") return true;
  if (normalizeRole(userClaims?.role) === "admin") return true;

  const appClaimRoles = appClaims?.roles;
  const userClaimRoles = userClaims?.roles;

  if (Array.isArray(appClaimRoles) && appClaimRoles.map(normalizeRole).includes("admin")) return true;
  if (Array.isArray(userClaimRoles) && userClaimRoles.map(normalizeRole).includes("admin")) return true;

  return false;
};

export const isAdminUser = (user?: User | null): boolean => {
  if (!user) return false;
  if (hasAdminRole(user)) return true;

  const email = user.email?.toLowerCase() ?? "";
  if (email && adminEmails.includes(email)) return true;

  return false;
};
