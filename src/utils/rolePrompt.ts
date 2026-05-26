// @ts-nocheck
// Pure logic for the role-assignment prompt — the modal that appears
// when the user types a new company/contact and we need to ask "what
// role does this entity play on the order?" Two builders here:
//   filterRolePromptOptions — which role badges should appear as
//     options for this company+contact, given what's already assigned
//     and the eligibility guards.
//   computeRolePromptDefaults — which of those options should be
//     pre-checked when the modal opens, based on the company's
//     inferred capabilities + contact title hints + source context.
//
// Neither helper touches React; both take the inputs they need as
// plain args so they can be unit-tested in isolation.

import { normalizeCompany, normalizeContact } from "./strings";
import { normalizeCompanyType } from "./roleEligibility";

export type RoleBadge = { id: string; title?: string; [k: string]: any };

// filterRolePromptOptions — Drop role badges that don't apply for
// this company/contact. Respects user-supplied skipRoles/forceRoles
// overrides, the "same entity already assigned" carve-out (so
// reassigning a duplicate is allowed), the public-adjuster ->
// no-insurance carve-out, and the eligibility callback.
export const filterRolePromptOptions = (params: {
  badges: RoleBadge[];
  company: string;
  contact: string;
  data: any;
  skipRoles: string[];
  forceRoles: string[];
  companyTypeHint: string;
  isRoleEligibleForCompany: (roleId: string, company: string) => boolean;
}): RoleBadge[] => {
  const { badges, company, contact, data, skipRoles, forceRoles, companyTypeHint, isRoleEligibleForCompany } = params;
  const blocked = new Set(skipRoles || []);
  const forced = new Set(forceRoles || []);

  const referrerAssigned = !!(data.referringCompany || data.referrer);
  const insuranceAssigned = !!(data.insuranceCompany || data.insuranceAdjuster);
  const billToAssigned = !!(data.billingCompany || data.billingContact);

  const normalizedCompany = normalizeCompany(company || "");
  const normalizedContact = normalizeContact(contact || "");
  const sameReferrer =
    (!!normalizedCompany && normalizeCompany(data.referringCompany || "") === normalizedCompany) ||
    (!!normalizedContact && normalizeContact(data.referrer || "") === normalizedContact);
  const sameInsurance =
    (!!normalizedCompany && normalizeCompany(data.insuranceCompany || "") === normalizedCompany) ||
    (!!normalizedContact && normalizeContact(data.insuranceAdjuster || "") === normalizedContact);
  const sameBillTo =
    (!!normalizedCompany && normalizeCompany(data.billingCompany || "") === normalizedCompany) ||
    (!!normalizedContact && normalizeContact(data.billingContact || "") === normalizedContact);

  const isPublicAdjuster = normalizeCompanyType(companyTypeHint).includes("public adjust");

  return badges.filter((role) => {
    if (blocked.has(role.id) && !forced.has(role.id)) return false;
    if (forced.has(role.id)) return isRoleEligibleForCompany(role.id, company);
    if (!isRoleEligibleForCompany(role.id, company)) return false;
    if (role.id === "referrer") return !referrerAssigned || sameReferrer;
    if (role.id === "insurance") {
      if (isPublicAdjuster) return false;
      return !insuranceAssigned || sameInsurance;
    }
    if (role.id === "billto") return !billToAssigned || sameBillTo;
    if (role.id === "poc") return true;
    return false;
  });
};

// computeRolePromptDefaults — Decide which option IDs should be
// pre-checked on the modal. Order of precedence (later additions
// outrank earlier; deduplication preserves first occurrence):
//   1. Capability flags (canRefer/canInsure/canBill).
//   2. forceRoles + preferredRoles arrays.
//   3. Source-hint (referrer/billing/insurance from the call site).
//   4. Contact title hint (e.g., "adjuster" -> insurance).
//   5. Company type hint (e.g., "insurance" -> insurance).
//   6. Fallback: if nothing matched, take the lone option (unless it's POC).
// POC is ALWAYS excluded from the final defaults — the user must opt
// in to POC explicitly.
export const computeRolePromptDefaults = (params: {
  options: RoleBadge[];
  forceRoles: string[];
  preferredRoles: string[];
  preferredFromSource: string;
  capabilities: { canRefer: boolean; canBill: boolean; canInsure: boolean };
  titleHint: string;
  companyTypeHint: string;
}): string[] => {
  const { options, forceRoles, preferredRoles, preferredFromSource, capabilities, titleHint, companyTypeHint } = params;
  const optionIds = new Set(options.map((o) => o.id));
  const suggested: string[] = [];

  if (capabilities.canRefer && optionIds.has("referrer")) suggested.push("referrer");
  if (capabilities.canInsure && optionIds.has("insurance")) suggested.push("insurance");
  if (capabilities.canBill && optionIds.has("billto")) suggested.push("billto");
  (forceRoles || []).forEach((roleId) => { if (optionIds.has(roleId)) suggested.push(roleId); });
  (preferredRoles || []).forEach((roleId) => { if (optionIds.has(roleId)) suggested.push(roleId); });
  if (preferredFromSource && optionIds.has(preferredFromSource)) suggested.push(preferredFromSource);
  if (titleHint.toLowerCase().includes("adjuster") && optionIds.has("insurance")) suggested.push("insurance");
  if (companyTypeHint.toLowerCase().includes("insurance") && optionIds.has("insurance")) suggested.push("insurance");

  if (!suggested.length && options.length === 1 && options[0].id !== "poc") suggested.push(options[0].id);
  return Array.from(new Set(suggested)).filter((id) => id !== "poc");
};

// preferredRoleFromSource — extract the role-id hint from the
// human-readable source string the call site passes ("Referrer",
// "Billing Contact", "Insurance Adjuster", etc.).
export const preferredRoleFromSource = (source: string): string => {
  const key = (source || "").toLowerCase();
  if (key.includes("referrer")) return "referrer";
  if (key.includes("billing")) return "billto";
  if (key.includes("insurance") || key.includes("adjuster")) return "insurance";
  return "";
};
