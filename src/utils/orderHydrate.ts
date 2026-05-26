// @ts-nocheck
// Shared order-shape hydration logic. Used by App.tsx's initial `data` load
// (from localStorage) and by loadTestPreset (from a saved snapshot). Both
// flows merge `parsed` over DEFAULT_FORM, then normalize the scope bridge,
// the sds services list, and the suggested groups/selectedGroups pair.

import { DEFAULT_FORM } from "../data/defaultForm";
import { normalizeScopeBridgeState, withScopeBridgeSnippet } from "../scopeBridgeUtils";

// hydrateOrderFromParsed — apply the shared merge rules used by both the
// initial-load and load-test-preset paths. Caller may pass extra fields
// (e.g. orderInstructions normalization) via `extras` to layer on top.
export const hydrateOrderFromParsed = (parsed: any, extras: Partial<any> = {}): any => {
  const normalizedSdsServices = (parsed.sdsServices || []).map((item: string) =>
    item === "Drying Needed" ? "Drying" : item,
  );
  const parsedScopeBridge = normalizeScopeBridgeState(parsed.scopeBridge || {});
  const mergedSelectedGroups = Array.isArray(parsed.suggestedGroups) && parsed.suggestedGroups.length
    ? parsed.suggestedGroups
    : (parsedScopeBridge.selectedGroups || []);
  return {
    ...DEFAULT_FORM,
    ...parsed,
    addresses: parsed.addresses?.length ? parsed.addresses : DEFAULT_FORM.addresses,
    customers: parsed.customers?.length ? parsed.customers : DEFAULT_FORM.customers,
    sdsServices: normalizedSdsServices,
    suggestedGroups: mergedSelectedGroups,
    scopeBridge: withScopeBridgeSnippet({
      ...parsedScopeBridge,
      selectedGroups: mergedSelectedGroups,
    }),
    ...extras,
  };
};
