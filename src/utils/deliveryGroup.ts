// Delivery-group helpers — pure mapping logic used by the auto-derive
// useEffects that fill in deliveryGroup addresses and the order's processType
// from the user's living timeline / Final group's address type.

type LivingStop = { type?: string; [k: string]: any };

// pickAutoAddressForDeliveryGroup — choose which living-timeline stop a
// delivery group should default to:
//   * RD / RFD  (rush)        → first stay (often the home-during-pickup)
//   * LT* / LTFD (final)      → last stay (where they end up)
//   * ST* (short-term)        → first non-"Staying in home" stay
// Returns null when the timeline is empty or the group id isn't recognized.
export const pickAutoAddressForDeliveryGroup = (
  groupId: string,
  livingTimeline: LivingStop[] = [],
): LivingStop | null => {
  if (!livingTimeline.length) return null;
  if (groupId === "RD" || groupId === "RFD") return livingTimeline[0];
  if (groupId.startsWith("LT") || groupId === "LTFD") return livingTimeline[livingTimeline.length - 1];
  if (groupId.startsWith("ST")) return livingTimeline.find((s) => s.type !== "Staying in home") || livingTimeline[0];
  return null;
};

// deliveryAddressTypeToProcessType — map the Final delivery group's address
// type to the order's processType field. Returns "" when the address type
// doesn't map to a known process type (caller leaves processType untouched).
export const deliveryAddressTypeToProcessType = (addrType: string | undefined | null): string => {
  const t = (addrType || "").toLowerCase();
  if (t === "primary" || t === "home") return "Deliver ASAP";
  if (["hotel", "rental", "temp", "temporary"].includes(t)) return "Deliver to Temp";
  if (["moving", "new home"].includes(t)) return "Deliver to New Home";
  return "";
};
