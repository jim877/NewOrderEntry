// Service-offering → scope-instruction-type mapping used by the per-room scope
// instruction picker in ScopeWizard. "Inhome" and "Dispose" are always shown;
// other types appear only when at least one of their gating service offerings
// is selected. When the order has no offerings yet, ALL default types show so
// the wizard isn't empty.

const SERVICE_TO_SCOPE: Record<string, string[]> = {
  "Pack-out":     ["Pickup"],
  "Contents":     ["Pickup"],
  "Rugs":         ["Pickup"],
  "Textiles":     ["Pickup"],
  "Furniture":    ["Furniture", "Pickup"],
  "Art":          ["Pickup"],
  "Appliance":    ["Pickup"],
  "TLI":          ["TLI"],
  "Storage Only": ["Storage"],
  "Consulting":   ["Test"],
};

const ALWAYS_SHOWN_SCOPE_TYPES = ["Inhome", "Dispose"];
const ALL_SCOPE_TYPES_WHEN_EMPTY = ["Pickup", "Inhome", "Furniture", "TLI", "Test", "Dispose", "Storage"];

// relevantScopeInstructionTypes — pick the per-room scope-instruction-type chips
// to display, given the order's selected service offerings.
export const relevantScopeInstructionTypes = (serviceOfferings: string[] = []): string[] => {
  const relevant = new Set(ALWAYS_SHOWN_SCOPE_TYPES);
  serviceOfferings.forEach((s) => (SERVICE_TO_SCOPE[s] || []).forEach((t) => relevant.add(t)));
  if (serviceOfferings.length === 0) ALL_SCOPE_TYPES_WHEN_EMPTY.forEach((t) => relevant.add(t));
  return [...relevant];
};
