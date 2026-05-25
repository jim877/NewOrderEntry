// Pure reducers + readers for the order's loss-detail shape:
//   data.severityCodes: string[]                 (e.g. ["F1", "W2"])
//   data.lossDetails:   Record<type, { causes: string[]; origins: string[]; [...] }>
// The setData wrappers in App.tsx delegate to these so the React glue stays
// thin and the per-type logic is easy to scan / test.

// toggleSeverityCode — severity codes look like "<TYPE>-<LEVEL>" (e.g.
// "fire-2"); each type carries at most one level at a time. Toggling a code
// either removes it (if present) or replaces the type's current level with
// the new one.
export const toggleSeverityCode = (currentCodes: string[] = [], code: string): string[] => {
  const type = code.split("-")[0];
  const others = currentCodes.filter((c) => !c.startsWith(type + "-"));
  return currentCodes.includes(code) ? others : [...others, code];
};

type LossTypeDetails = { causes?: string[]; origins?: string[]; [k: string]: any };
type LossDetailsMap = Record<string, LossTypeDetails>;

// updateLossDetailField — patch one field of one loss type. Array fields
// (causes/origins) are treated as single-select: re-selecting clears, picking
// a different value replaces. Scalar fields are written through.
export const updateLossDetailField = (
  current: LossDetailsMap | undefined,
  type: string,
  field: string,
  value: any,
): LossDetailsMap => {
  const details = current || {};
  const typeDetails = details[type] || { causes: [], origins: [] };
  const prevValue = typeDetails[field];
  const nextValue = Array.isArray(prevValue)
    ? (prevValue.includes(value) ? [] : [value])
    : value;
  return { ...details, [type]: { ...typeDetails, [field]: nextValue } };
};

// getLossSummary — human-readable one-liner for a loss type ("causes; origins").
// Returns the placeholder string when no details are recorded for the type.
export const getLossSummary = (lossDetails: LossDetailsMap | undefined, type: string): string => {
  const d = (lossDetails || {})[type];
  if (!d) return "No details selected";
  const parts: string[] = [];
  if (d.causes && d.causes.length) parts.push(d.causes.join(", "));
  if (d.origins && d.origins.length) parts.push(d.origins.join(", "));
  return parts.join("; ");
};
