// @ts-nocheck
// Order-type predicates + selection mutators. All take/return the orderTypes string array.
// Non-Restoration is a single string ("Non-Restoration") + an optional subtype like
// "Commercial Cleaning"; Restoration is an arbitrary subset of LOSS_TYPES (Fire/Water/...).

import { LOSS_TYPES, NON_RESTORATION_PRIMARY, NON_RESTORATION_SUBTYPES } from "../config";
import { stringListMatches } from "./strings";

export const getNonRestorationSubtype = (orderTypes: string[] = []) =>
  NON_RESTORATION_SUBTYPES.find((type) => (orderTypes || []).includes(type)) || "";

export const isNonRestorationSelected = (orderTypes: string[] = []) =>
  (orderTypes || []).includes(NON_RESTORATION_PRIMARY) || !!getNonRestorationSubtype(orderTypes);

export const hasRestorationOrderType = (orderTypes: string[] = []) =>
  (orderTypes || []).some((type) => LOSS_TYPES.includes(type));

export const projectTypeFromOrderTypes = (orderTypes: string[] = []) => {
  if (isNonRestorationSelected(orderTypes)) return "Non-Restoration Project";
  if (hasRestorationOrderType(orderTypes)) return "Restoration Project";
  return "";
};

export const hasPrimaryOrderTypeDecision = (orderTypes: string[] = []) =>
  isNonRestorationSelected(orderTypes) || hasRestorationOrderType(orderTypes);

export const hasRequiredNonRestorationSubtype = (orderTypes: string[] = []) =>
  !isNonRestorationSelected(orderTypes) || !!getNonRestorationSubtype(orderTypes);

// normalizeOrderTypes — dedupe, drop empties, prefer non-restoration canonical pair if both flavors present.
export const normalizeOrderTypes = (orderTypes: string[] = []) => {
  const unique = Array.from(new Set((orderTypes || []).filter(Boolean)));
  const subtype = getNonRestorationSubtype(unique);
  const nonRestoration = unique.includes(NON_RESTORATION_PRIMARY) || !!subtype;
  const restoration = unique.filter((type) => LOSS_TYPES.includes(type));
  if (nonRestoration) return [NON_RESTORATION_PRIMARY, ...(subtype ? [subtype] : [])];
  if (restoration.length) return restoration;
  return unique;
};

// Click handler for the "Non-Restoration" toggle: present → clear all; absent → set just non-restoration.
export const toggleNonRestorationPrimarySelection = (orderTypes: string[] = []) => {
  const normalized = normalizeOrderTypes(orderTypes);
  if (isNonRestorationSelected(normalized)) return [];
  return [NON_RESTORATION_PRIMARY];
};

// Click handler for a single restoration loss type toggle.
export const toggleRestorationTypeSelection = (orderTypes: string[] = [], type = "") => {
  if (!LOSS_TYPES.includes(type)) return normalizeOrderTypes(orderTypes);
  const normalized = normalizeOrderTypes(orderTypes);
  const activeRestoration = normalized.filter((item) => LOSS_TYPES.includes(item));
  if (activeRestoration.includes(type)) return activeRestoration.filter((item) => item !== type);
  return [...activeRestoration, type];
};

// Picking a non-restoration subtype (Commercial Cleaning, Residential Cleaning, Other) implies the primary.
export const selectNonRestorationSubtypeSelection = (orderTypes: string[] = [], subtype = "") => {
  if (!NON_RESTORATION_SUBTYPES.includes(subtype)) return normalizeOrderTypes(orderTypes);
  return [NON_RESTORATION_PRIMARY, subtype];
};

// computeInsuranceInferencePatch — pure reducer for the "infer
// insurance company + national carrier from billing/insurance
// contact" useEffect. Given the inferred billing/insurance carriers
// (already resolved by the caller through isInsuranceCarrierCompany +
// resolveInsuranceCarrierFromContact) and the linked national
// carrier name, return only the fields that need to change. Empty
// patch means no change.
export const computeInsuranceInferencePatch = (
  prev: any,
  inferredBillingCarrier: string,
  inferredInsuranceCarrier: string,
  primaryCarrier: string,
  linkedCarrier: string,
) => {
  const patch: any = {};
  if (!prev.billingCompany && inferredBillingCarrier) patch.billingCompany = inferredBillingCarrier;
  if (!prev.insuranceCompany && primaryCarrier) patch.insuranceCompany = primaryCarrier;
  if (!prev.adjusterCompany && inferredInsuranceCarrier && prev.insuranceAdjuster) {
    patch.adjusterCompany = inferredInsuranceCarrier;
  }
  if (prev.insuranceClaim !== "Yes") patch.insuranceClaim = "Yes";
  if (prev.involvesInsurance !== "Yes") patch.involvesInsurance = "Yes";
  if (!prev.billingPayer && inferredBillingCarrier) patch.billingPayer = "Insurance";
  if (linkedCarrier && prev.nationalCarrier !== linkedCarrier) {
    patch.nationalCarrier = linkedCarrier;
    patch.nationalCarrierRequested = false;
  }
  return patch;
};

// computeOrderTypeNormalizationPatch — pure reducer for the
// "normalize order types + cascade non-restoration cleanup" useEffect.
// Returns the diff to apply (empty -> no change). When the resolved
// project type flips to Non-Restoration, clears insurance fields that
// no longer apply.
export const computeOrderTypeNormalizationPatch = (prev: any) => {
  const currentTypes = prev.orderTypes || [];
  const nextTypes = normalizeOrderTypes(currentTypes);
  const nextProjectType = projectTypeFromOrderTypes(nextTypes);
  const patch: any = {};

  if (!stringListMatches(nextTypes, currentTypes)) patch.orderTypes = nextTypes;
  if ((prev.restorationType || "") !== nextProjectType) patch.restorationType = nextProjectType;

  if (nextProjectType === "Non-Restoration Project") {
    patch.involvesInsurance = "No";
    patch.payorQuick = prev.payorQuick === "Insurance" ? "" : prev.payorQuick;
    patch.insuranceClaim = "No";
    patch.insuranceCompany = "";
    patch.insuranceAdjuster = "";
    patch.claimNumber = "";
    patch.dateOfLoss = "";
  }

  return patch;
};
