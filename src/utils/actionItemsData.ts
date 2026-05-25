// @ts-nocheck
// Pure builders for the Action Items side-panel. The panel header
// shows aggregate counts (placeholders + missing-field count +
// blockers); the body groups them by source. Extracting the
// pre-render data prep keeps the JSX-heavy callsite focused on
// rendering.

import { hasMeaningfulValue, isPlaceholderFlagActive, isAddressPlaceholder } from "./order";

export type ActionItemPlaceholder = {
  label: string;
  section: string;
  type: "customer" | "address" | "company";
};

// buildActionItemPlaceholders — emit one row per "unfinished" entity
// on the order. Different from auditMissing in that it includes
// customers/addresses that are partially filled but missing critical
// fields (e.g. customer with first name but no contact info).
export const buildActionItemPlaceholders = (data: any): ActionItemPlaceholder[] => {
  const placeholders: ActionItemPlaceholder[] = [];

  (data.customers || []).forEach((c: any) => {
    const hasPlaceholderFlag = isPlaceholderFlagActive(c?.placeholder);
    const hasName = hasMeaningfulValue(c?.first) && hasMeaningfulValue(c?.last);
    const hasContact = hasMeaningfulValue(c?.phone) || hasMeaningfulValue(c?.email);
    const needsAttention = hasPlaceholderFlag || !hasName || (hasMeaningfulValue(c?.first) && !hasContact);
    if (!needsAttention) return;
    placeholders.push({
      label: [c.first, c.last].filter(Boolean).join(" ") || "Customer",
      section: "sec2",
      type: "customer",
    });
  });

  (data.addresses || []).forEach((a: any) => {
    if (a.inactive) return;
    if (!isAddressPlaceholder(a)) return;
    const typeLabel = a.type && a.type !== "Address" && a.type !== "Primary" ? `${a.type} Address` : "";
    placeholders.push({
      label: typeLabel || a.purpose || a.name || a.placeholder?.reason || "Address needed",
      section: "sec3",
      type: "address",
    });
  });

  (data.vendors || []).forEach((v: any) => {
    if (!v.incomplete) return;
    placeholders.push({
      label: v.contact || v.company || "Company",
      section: "sec4",
      type: "company",
    });
  });

  return placeholders;
};

// buildBillToBlockers — the "soft" blockers that appear once the
// order has a scheduled pickup but the customer/bill-to coordination
// is still pending. Soft because they don't block the scope bridge,
// just flag follow-ups.
export const buildBillToBlockers = (data: any): string[] => {
  if (!data.pickupDate) return [];
  const blockers: string[] = [];
  if (!data.eventCustomerContacted) blockers.push("Customer/POC not yet contacted");
  if (!data.eventBillToContacted && (data as any).billToPaymentDirection !== "self-pay") {
    blockers.push("Bill To not yet contacted");
  }
  if (!(data as any).billToPaymentDirection) blockers.push("Direction of Payment not confirmed");
  if (!(data as any).billToApprovalStatus) blockers.push("Scope approval pending");
  return blockers;
};
