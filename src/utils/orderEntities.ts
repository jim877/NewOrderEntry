// @ts-nocheck
// Pure derivations of the unique company/contact names that appear on the
// current order. Used by the order-attention / instructions resolver paths
// to look up saved guidance per entity, and elsewhere to feed pickers.
// Both helpers de-dupe via the normalize* helpers so case/whitespace
// variants collapse to a single canonical entry.

import { normalizeCompany, normalizeContact } from "./strings";
import { entryContactList } from "./companyEntry";

// getOrderCompanyNames — flatten the half-dozen "company" fields on the order
// (referring / billing / insurance / public-adjusting / independent /
// tpa / each additionalCompanies entry) into a unique list of display names.
// Preserves first-seen casing/spacing.
export const getOrderCompanyNames = (data: any): string[] => {
  const names = new Map<string, string>();
  const add = (value: any) => {
    const trimmed = (value || "").toString().trim();
    if (!trimmed) return;
    const key = normalizeCompany(trimmed);
    if (!names.has(key)) names.set(key, trimmed);
  };
  add(data.referringCompany);
  add(data.billingCompany);
  add(data.insuranceCompany);
  add(data.publicAdjustingCompany);
  add(data.independentAdjustingCo);
  add(data.tpaCompany);
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => add(entry?.company));
  return Array.from(names.values());
};

// getOrderContactNames — same shape but for contact names. Includes the
// per-additional-company contact lists in addition to the top-level role
// holders (referrer / billing / adjuster / public-adjuster / independent /
// tpa).
export const getOrderContactNames = (data: any): string[] => {
  const names = new Map<string, string>();
  const add = (value: any) => {
    const trimmed = (value || "").toString().trim();
    if (!trimmed) return;
    const key = normalizeContact(trimmed);
    if (!names.has(key)) names.set(key, trimmed);
  };
  add(data.referrer);
  add(data.billingContact);
  add(data.insuranceAdjuster);
  add(data.publicAdjuster);
  add(data.independentAdjuster);
  add(data.tpaContact);
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => {
    entryContactList(entry || {}).forEach((contact: any) => add(contact?.name));
  });
  return Array.from(names.values());
};

export type OrderPoc =
  | { kind: "customer"; id: string; name: string; company: string; phone: string; role: string }
  | { kind: "vendor"; id: string; name: string; company: string; phone: string; role: string };

// resolveOrderPoc — find the single entity carrying isPoc:true on the order.
// Customers are checked first (the customer-record path is the primary way
// the user marks a POC). Returns null when no entity has the flag.
export const resolveOrderPoc = (data: any): OrderPoc | null => {
  const pocCust = (data.customers || []).find((c: any) => c.isPoc);
  if (pocCust) {
    return {
      kind: "customer",
      id: pocCust.id,
      name: [pocCust.first, pocCust.last].filter(Boolean).join(" ") || "(unnamed)",
      company: "",
      phone: pocCust.phone || "",
      role: pocCust.type || "",
    };
  }
  const pocVend = (data.vendors || []).find((v: any) => v.isPoc);
  if (pocVend) {
    return {
      kind: "vendor",
      id: pocVend.id,
      name: pocVend.contact || "",
      company: pocVend.company || "",
      phone: pocVend.phone || "",
      role: pocVend.type || "",
    };
  }
  return null;
};

// appendCustomerPlaceholderReducer — pure reducer that removes
// "empty" non-primary customer slots and appends a new placeholder
// at the end. The newCustomer payload is built at the call site so
// the helper stays free of orderFactories imports.
export const appendCustomerPlaceholderReducer = (prev: any, newCustomer: any) => {
  const cleaned = (prev.customers || []).filter(
    (c: any, i: number) =>
      i === 0 ||
      (
        // hasMeaningfulValue isn't imported here — inline check matches order.ts.
        (c?.first !== "" && c?.first != null) ||
        (c?.last !== "" && c?.last != null) ||
        (c?.phone !== "" && c?.phone != null) ||
        (c?.email !== "" && c?.email != null)
      )
  );
  return { ...prev, customers: [...cleaned, newCustomer] };
};

// appendAddressPlaceholderReducer — pure reducer for the "add new
// address" button. Removes empty non-first addresses and appends the
// new one (marked Primary when no existing address holds that flag).
// Builds the newAddress inline using the supplied id + initAddress +
// createPlaceholderFlag callables so the helper stays free of
// orderFactories imports.
export const appendAddressPlaceholderReducer = (prev: any, newAddress: any) => {
  const cleaned = (prev.addresses || []).filter(
    (a: any, i: number) => i === 0 || (a?.street !== "" && a?.street != null) || (a?.city !== "" && a?.city != null)
  );
  const hasPrimary = cleaned.some((a: any) => a.isPrimary);
  return {
    ...prev,
    addresses: [...cleaned, { ...newAddress, isPrimary: newAddress.isPrimary ?? !hasPrimary }],
  };
};

// togglePlanStepReducer — pure reducer for the Plan-of-Action step
// completion toggle. Flips the `done` flag on the matching step and
// stamps doneAt + doneBy (current user, falling back to assignee or
// "Unknown") when transitioning to done; clears those fields when
// un-checking.
export const togglePlanStepReducer = (prev: any, id: string) => ({
  ...prev,
  planSteps: (prev.planSteps || []).map((s: any) => {
    if (s.id !== id) return s;
    const nextDone = !s.done;
    return {
      ...s,
      done: nextDone,
      doneAt: nextDone ? new Date().toISOString() : "",
      doneBy: nextDone ? (prev.currentUser || s.assignee || "Unknown") : "",
    };
  }),
});

// applyPrimaryPolicyHolderReducer — pure reducer that flips the
// primary customer's policyHolder flag + type based on whether the
// order is currently insurance-related. When insurance-related, marks
// the primary customer as Policyholder; when not, clears the flag and
// "Policyholder" type. Returns prev when no change needed.
export const applyPrimaryPolicyHolderReducer = (prev: any, insuranceRelated: boolean) => {
  const customers = prev.customers || [];
  if (!customers.length) return prev;
  if (!insuranceRelated) {
    return {
      ...prev,
      customers: customers.map((c: any, idx: number) =>
        idx === 0 ? { ...c, policyHolder: false, type: c.type === "Policyholder" ? "" : c.type } : c
      ),
    };
  }
  const first = customers[0];
  if (first.policyHolder && first.type === "Policyholder") return prev;
  return {
    ...prev,
    customers: customers.map((c: any, idx: number) =>
      idx === 0 ? { ...c, policyHolder: true, type: "Policyholder" } : c
    ),
  };
};

// applyOrderPocReducer — pure reducer that walks customers + vendors
// and flips isPoc exclusively to the target. Pass null to clear all
// POC flags. Customer rows hold POC for customer-flagged entries;
// vendor rows hold POC for vendor-flagged entries.
export const applyOrderPocReducer = (
  prev: any,
  target: { kind: "customer" | "vendor"; id: string } | null,
) => {
  const customers = (prev.customers || []).map((c: any) => {
    const want = target?.kind === "customer" && target.id === c.id;
    return c.isPoc === want ? c : { ...c, isPoc: want };
  });
  const vendors = (prev.vendors || []).map((v: any) => {
    const want = target?.kind === "vendor" && target.id === v.id;
    return v.isPoc === want ? v : { ...v, isPoc: want };
  });
  return { ...prev, customers, vendors };
};

// applyContactPocReducer — pure reducer used when the user flags a
// company/contact pair (e.g. an additional-company contact) as the
// order POC. Finds the matching vendor row, or appends a new one with
// the supplied type, then flips isPoc exclusively to that vendor and
// clears any customer-side isPoc flags.
export const applyContactPocReducer = (
  prev: any,
  companyName: string,
  contactName: string,
  contactType: string,
  newVendorId: string,
) => {
  const existingIdx = (prev.vendors || []).findIndex(
    (v: any) =>
      normalizeCompany(v.company || "") === normalizeCompany(companyName || "") &&
      normalizeContact(v.contact || "") === normalizeContact(contactName || "")
  );
  let vendors = [...(prev.vendors || [])];
  let targetId: string;
  if (existingIdx >= 0) {
    targetId = vendors[existingIdx].id;
  } else {
    targetId = newVendorId;
    vendors.push({
      id: targetId,
      company: companyName || "",
      contact: contactName || "",
      type: contactType,
      isPoc: false,
    });
  }
  vendors = vendors.map((v: any) => {
    const want = v.id === targetId;
    return v.isPoc === want ? v : { ...v, isPoc: want };
  });
  const customers = (prev.customers || []).map((c: any) => (c.isPoc ? { ...c, isPoc: false } : c));
  return { ...prev, vendors, customers };
};

// isPocContact — true when the given company+contact pair matches
// the resolved orderPoc (compared by normalized company + contact).
export const isPocContact = (
  orderPoc: OrderPoc | null,
  companyName: string,
  contactName: string,
): boolean => {
  if (!orderPoc) return false;
  return (
    normalizeCompany(orderPoc.company || "") === normalizeCompany(companyName || "") &&
    normalizeContact((orderPoc as any).name || "") === normalizeContact(contactName || "")
  );
};

// getEstimateRequesterQuickOptions — flat list of "Name (Role)" labels for
// the Estimate Requester picker. Pulls primary customer + every named role
// holder on the order, de-duped case-insensitively. Empty names skipped.
export const getEstimateRequesterQuickOptions = (data: any): string[] => {
  const options: string[] = [];
  const seen = new Set<string>();
  const add = (name: any, roleLabel = "") => {
    const trimmed = (name || "").toString().trim();
    if (!trimmed) return;
    const value = roleLabel ? `${trimmed} (${roleLabel})` : trimmed;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    options.push(value);
  };
  (data.customers || []).forEach((customer: any) => {
    const fullName = [customer.first, customer.last].filter(Boolean).join(" ").trim();
    add(fullName, "Customer");
  });
  add(data.insuranceAdjuster, "Adjuster");
  add(data.publicAdjuster, "Public Adjuster");
  add(data.independentAdjuster, "Independent Adjuster");
  add(data.tpaContact, "TPA");
  add(data.billingContact, "Bill To");
  add(data.referrer, "Referrer");
  return options;
};
