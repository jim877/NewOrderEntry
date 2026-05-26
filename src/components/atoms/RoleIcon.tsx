// @ts-nocheck
import React from "react";
import { CreditCard, Globe, Shield, Star, Tag, UserRound } from "lucide-react";

// Mapping from role keys to lucide icon components.
const ROLE_ICON_COMPONENTS = {
  referrer: Tag,
  insurance: Shield,
  billto: CreditCard,
  billing: CreditCard,
  adjuster: UserRound,
  national: Globe,
  poc: Star,
};

// resolveRoleIconKey — derive an icon key from a role's iconKey/id/icon/title.
// Fallback chain lets older data (with emoji `icon` fields) keep working.
const resolveRoleIconKey = (role: any = {}) => {
  if (role.iconKey && ROLE_ICON_COMPONENTS[role.iconKey]) return role.iconKey;
  const id = (role.id || "").toLowerCase();
  if (ROLE_ICON_COMPONENTS[id]) return id;
  const icon = (role.icon || "").trim();
  if (icon === "🏷️") return "referrer";
  if (icon === "🛡️") return "insurance";
  if (icon === "💳") return "billto";
  if (icon === "🧑‍💼") return "adjuster";
  if (icon === "🌐") return "national";
  const title = (role.title || role.label || "").toLowerCase();
  if (title.includes("referrer"))  return "referrer";
  if (title.includes("insurance")) return "insurance";
  if (title.includes("bill"))      return "billto";
  if (title.includes("adjuster"))  return "adjuster";
  if (title.includes("national"))  return "national";
  if (title.includes("poc"))       return "poc";
  return "";
};

// RoleIcon — lucide icon picked from the role's identity. Returns null if no match.
export const RoleIcon = ({ role, className = "h-3.5 w-3.5", strokeWidth = 2.1 }) => {
  const iconKey = resolveRoleIconKey(role);
  const Icon = ROLE_ICON_COMPONENTS[iconKey];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};
