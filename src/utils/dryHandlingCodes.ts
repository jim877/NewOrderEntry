// @ts-nocheck
// Pure mapping from the customer's preferred dry method to the
// handling codes that should be auto-added/removed. The Detailed
// mode laundry question + Quick Entry interview share this logic.

export type DryHandlingPatch = {
  addCodes: string[];
  removeCodes: string[];
};

// dryHandlingPatch — given the new how-dry value, return the codes
// to add and remove from the handling codes list.
//   "Air-Dry" -> add "NoDry", remove "Low"
//   "Low Heat" -> add "Low", remove "NoDry"
//   "Dryer" -> remove both
export const dryHandlingPatch = (value: string): DryHandlingPatch => {
  const addCodes: string[] = [];
  const removeCodes: string[] = [];
  if (value === "Air-Dry") { addCodes.push("NoDry"); removeCodes.push("Low"); }
  if (value === "Low Heat") { addCodes.push("Low"); removeCodes.push("NoDry"); }
  if (value === "Dryer") { removeCodes.push("NoDry", "Low"); }
  return { addCodes, removeCodes };
};
