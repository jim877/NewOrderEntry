// @ts-nocheck
// Pure functions backing the "what roles can this company play on the
// order?" decisions made when the user picks an existing company or
// types a new one. The trio of helpers here resolves:
//   resolveCompanyTypeForRoles — what company type best fits this name
//     (additionalCompanies entry > sampleContacts seed > auto-classify).
//   getCompanyRoleCapabilities — canRefer / canBill / canInsure booleans
//     (sampleContacts overrides win, otherwise inferred from type).
//   isRoleEligibleForCompany — final yes/no for a single role badge,
//     applying the contractor/insurance/national-carrier guards.
//
// Pulled together as one module because they all walk the same shape
// and were a tightly-coupled chain of useCallbacks in App.tsx.

import { normalizeCompany } from "./strings";
import { inferRoleCapabilities } from "./companyProfiles";

// classifyCompanyName — fallback name -> type classifier the caller
// supplies (App.tsx's autoTypeForCompany). Kept as a parameter rather
// than imported because the in-App implementation closes over the
// live sampleContacts list.
export type ClassifyCompanyName = (name: string) => string;

export type RoleCapabilities = {
  canRefer: boolean;
  canBill: boolean;
  canInsure: boolean;
};

export const normalizeCompanyType = (type: any) =>
  (type || "").toString().trim().toLowerCase();

// resolveCompanyTypeForRoles — best-effort company type lookup.
// Order: explicit additionalCompanies key > sampleContacts seed >
// auto-classification by name.
export const resolveCompanyTypeForRoles = (
  companyName: string,
  data: any,
  sampleContacts: any[],
  classifyCompanyName: ClassifyCompanyName,
): string => {
  if (!companyName) return "";
  const fromAdditional = Object.entries(data.additionalCompanies || {}).find(
    ([, entry]: [string, any]) => normalizeCompany(entry?.company || "") === normalizeCompany(companyName)
  );
  if (fromAdditional?.[0]) return fromAdditional[0];
  const sample = (sampleContacts || []).find(
    (c: any) => normalizeCompany(c.company || "") === normalizeCompany(companyName)
  );
  if (sample?.companyType) return sample.companyType;
  return classifyCompanyName(companyName);
};

// getCompanyRoleCapabilities — return capability booleans for a
// company name + optional explicit type. sampleContacts row overrides
// win when present; otherwise inferRoleCapabilities makes the call.
export const getCompanyRoleCapabilities = (
  companyName: string,
  typeOverride: string,
  data: any,
  sampleContacts: any[],
  classifyCompanyName: ClassifyCompanyName,
): RoleCapabilities => {
  const resolvedType =
    typeOverride || resolveCompanyTypeForRoles(companyName, data, sampleContacts, classifyCompanyName);
  const defaultCaps = inferRoleCapabilities(resolvedType, companyName);
  if (!companyName) return defaultCaps;
  const normalizedCompany = normalizeCompany(companyName);
  const sample = (sampleContacts || []).find(
    (c: any) => normalizeCompany(c.company || "") === normalizedCompany
  );
  if (!sample) return defaultCaps;
  return {
    canRefer: typeof sample.canRefer === "boolean" ? sample.canRefer : defaultCaps.canRefer,
    canBill: typeof sample.canBill === "boolean" ? sample.canBill : defaultCaps.canBill,
    canInsure: typeof sample.canInsure === "boolean" ? sample.canInsure : defaultCaps.canInsure,
  };
};

// isRoleEligibleForCompany — final eligibility gate for a single role
// badge. Referrer/Bill-To collapse to the capability flag, but
// Insurance has extra guards: contractors are explicitly excluded,
// "insurance" types fall through immediately, and a national carrier
// name match overrides an otherwise-blank type.
export const isRoleEligibleForCompany = (
  roleId: string,
  companyName: string,
  typeOverride: string,
  data: any,
  sampleContacts: any[],
  insuranceEligibleTypes: Set<string>,
  nationalCarriers: string[],
  classifyCompanyName: ClassifyCompanyName,
): boolean => {
  const capabilities = getCompanyRoleCapabilities(
    companyName, typeOverride, data, sampleContacts, classifyCompanyName
  );
  if (roleId === "referrer") return !!capabilities.canRefer;
  if (roleId === "billto") return !!capabilities.canBill;
  if (roleId !== "insurance") return true;
  if (!capabilities.canInsure) return false;
  const normalizedType = normalizeCompanyType(
    typeOverride || resolveCompanyTypeForRoles(companyName, data, sampleContacts, classifyCompanyName)
  );
  if (!normalizedType) return true;
  if (insuranceEligibleTypes.has(normalizedType)) return true;
  if (normalizedType.includes("contractor")) return false;
  if (normalizedType.includes("insurance")) return true;
  return (nationalCarriers || []).some(
    (c) => normalizeCompany(c) === normalizeCompany(companyName || "")
  );
};
