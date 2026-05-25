// @ts-nocheck

// Pure derivation of the auto-generated order name. Format:
// "LastName-CityState" with whitespace stripped. Returns null when
// neither last name nor city+state are available, so the call site
// can short-circuit without rewriting an empty string.

// computeAutoOrderName — given the order data, return the
// auto-derived order name, or null when no signal is available.
// Caller is responsible for skipping when orderNameLocked or
// orderNameAuto is off.
export const computeAutoOrderName = (data: any): string | null => {
  const primaryCustomer = (data.customers || []).find((c: any) => c.isPrimary) || {};
  const primaryAddr = (data.addresses || []).find((a: any) => a.isPrimary) || {};
  const last = (primaryCustomer.last || "").trim();
  const city = (primaryAddr.city || "").trim();
  const state = (primaryAddr.state || "").trim();
  if (!last && !city && !state) return null;
  const town = [city, state].filter(Boolean).join("");
  const nextName = [last || "Order", town].filter(Boolean).join("-").replace(/\s+/g, "");
  return nextName || null;
};
