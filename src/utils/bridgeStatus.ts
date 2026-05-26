// @ts-nocheck
// Pure derivations + Tailwind class mappers for the scope-bridge "project
// status" indicator (green / yellow / red / none). The bridge represents
// the order's production readiness — any pending blocker or operational
// hold flips it to yellow; a manual red flag keeps it red.

// bridgeStatusClass — Tailwind classes for the status-pill border + light
// background + text color shown at the top of Detailed mode.
export const bridgeStatusClass = (projectStatus: string): string => {
  if (projectStatus === "green") return "border-emerald-300 bg-emerald-50 text-slate-700";
  if (projectStatus === "yellow") return "border-amber-300 bg-amber-50 text-slate-700";
  if (projectStatus === "red") return "border-rose-300 bg-rose-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-500";
};

// bridgeSectionClass — same status tint applied to the section-wrapper
// border + bg + ring used by the bridge subsection in sec5.
export const bridgeSectionClass = (projectStatus: string): string => {
  if (projectStatus === "green") return "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-100";
  if (projectStatus === "yellow") return "border-amber-300 bg-amber-50/20 ring-1 ring-amber-100";
  if (projectStatus === "red") return "border-rose-300 bg-rose-50/20 ring-1 ring-rose-100";
  return "";
};

// Legacy operational-hold step ids — older orders stored these in
// scopeBridge.nextStep before the pickup/processing/delivery picker split.
// Listed here so deriveScopeBridgeStatus catches them too.
const LEGACY_OPERATIONAL_STEPS = new Set([
  "pickup_hold",
  "processing_hold",
  "emergency_groups_only",
  "cod",
  "delivery_hold",
  "wait_approval",
  "wait_test",
  "delivery_priority",
  "delivery_hold_cod",
]);

// deriveScopeBridgeStatus — compute the bridge's projectStatus from its
// other fields. Red wins (manual override). Otherwise: any pending blocker
// or any operational hold (pickup wait/urgent, processing hold/urgent/cod/
// specific, delivery priority/hold_cod, or any legacy nextStep) flips
// status to yellow. Everything clear → green.
export const deriveScopeBridgeStatus = (bridge: any): "red" | "yellow" | "green" => {
  if ((bridge?.projectStatus || "") === "red") return "red";
  const hasPending = (bridge?.pendingIssues || []).length > 0;
  const processingOption = (bridge?.processingOption || "").toString();
  const deliveryOption = (bridge?.deliveryOption || "").toString();
  const nextStep = (bridge?.nextStep || "").toString();
  const hasOperationalHold =
    (bridge?.pickupOption || "") === "wait" ||
    (bridge?.pickupOption || "") === "urgent" ||
    ["tag_hold", "urgent", "cod", "specific"].includes(processingOption) ||
    ["priority", "hold_cod"].includes(deliveryOption) ||
    LEGACY_OPERATIONAL_STEPS.has(nextStep);
  return hasPending || hasOperationalHold ? "yellow" : "green";
};
