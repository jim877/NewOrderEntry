// @ts-nocheck
// Helpers that build / strip the "system" block of event instructions —
// the auto-generated lines like "Conditions: ...", "Bring: ...", "Services: ...".

export const EVENT_SYSTEM_PREFIXES = [
  "Conditions:", "Bring:", "Service Offerings:", "Services:", "Picking Up:",
  "Quick Notes:", "Scope Notes:", "Estimate Required:",
];

// stripEventSystemLines — remove any line that begins with a known system prefix.
// Used when re-deriving the system block so we don't double-up.
export const stripEventSystemLines = (text = "") =>
  text
    .split("\n")
    .filter((line) => !EVENT_SYSTEM_PREFIXES.some((prefix) => line.trim().startsWith(prefix)))
    .join("\n");

// buildEventSystemEntries — derive { label, value } pairs from the current order state.
// Order intentionally matches the order they should appear in the instructions block.
export const buildEventSystemEntries = (data: any, conditionSummary: string) => {
  const entries: { label: string; value: string }[] = [];
  if (conditionSummary) entries.push({ label: "Conditions", value: conditionSummary });
  if ((data.loadList || []).length) {
    const note = (data as any).loadListNote ? ` — ${(data as any).loadListNote}` : "";
    entries.push({ label: "Bring", value: (data.loadList || []).join(", ") + note });
  }
  if ((data.serviceOfferings || []).length) {
    const subs = data.serviceSubCategories || [];
    const serviceDetails = (data.serviceOfferings || []).map((s) => {
      const subItems = subs.filter((x) => x.startsWith(`${s}: `)).map((x) => x.replace(`${s}: `, ""));
      return subItems.length > 0 ? `${s} (${subItems.join(", ")})` : s;
    });
    entries.push({ label: "Services", value: serviceDetails.join(", ") });
  }
  if ((data.packoutSummary || []).length) {
    entries.push({ label: "Picking Up", value: (data.packoutSummary || []).join(", ") });
  }
  if ((data as any).packoutScope && (data as any).packoutScope !== "No Packout") {
    const note = (data as any).packoutNote ? ` — ${(data as any).packoutNote}` : "";
    entries.push({ label: "Packout", value: (data as any).packoutScope + note });
  }
  if ((data.quickInstructionNotes || []).length) entries.push({ label: "Quick Notes", value: (data.quickInstructionNotes || []).join(", ") });
  if ((data.quickScopeNotes || []).length)       entries.push({ label: "Scope Notes", value: (data.quickScopeNotes || []).join(", ") });
  if (data.rushDeliveryNeeded === "N") {
    const note = (data as any).rushDeclinedNote ? ` — ${(data as any).rushDeclinedNote}` : "";
    entries.push({ label: "Rush Service", value: "Declined" + note });
  }
  if (data.estimateRequested) {
    let value = data.estimateType || "Yes";
    if (data.estimateRequestedBy) value += ` (Requested By: ${data.estimateRequestedBy})`;
    entries.push({ label: "Estimate Required", value });
  }
  return entries;
};

// buildEventSystemLines — the entries collapsed into a string. Override wins if set.
export const buildEventSystemLines = (data: any, conditionSummary: string) => {
  const override = (data?.eventSystemOverride || "").trim();
  if (override) return override;
  return buildEventSystemEntries(data, conditionSummary)
    .map((entry) => `${entry.label}: ${entry.value}`)
    .join("\n");
};

// composeEventInstructions — base user text + the system block, separated by a newline.
// If `base` already contains system lines, callers should pre-strip them with stripEventSystemLines.
export const composeEventInstructions = (base: string, data: any, conditionSummary: string) => {
  const cleaned = base || "";
  const system = buildEventSystemLines(data, conditionSummary);
  if (!system) return cleaned;
  return cleaned ? `${cleaned}\n${system}` : system;
};
