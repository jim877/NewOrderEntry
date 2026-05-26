// Action Items "Missing Fields" grouping — the Action Items panel splits the
// missing-field list into category buckets so the user can scan/jump by area
// (Customer, Insurance/Adjuster, Billing, etc.). Pure data + pure grouping.

export type MissingItem = { section?: string; label?: string; [k: string]: any };

export type ActionItemGroup = {
  id: string;
  label: string;
  defaultOpen: boolean;
  match: (item: MissingItem) => boolean;
};

// Order matters: the first matching group wins, so put narrower matchers (e.g.
// the Insurance subset of sec4) BEFORE the broader sec4 catch-all.
export const ACTION_ITEM_GROUPS: ActionItemGroup[] = [
  { id: "customer",  label: "Customer",             defaultOpen: false, match: (m) => m.section === "sec2" },
  { id: "insurance", label: "Insurance / Adjuster", defaultOpen: false, match: (m) => m.section === "sec4" && /insur|adjust|claim|carrier|polic/i.test(m.label || "") },
  { id: "billing",   label: "Billing & Companies",  defaultOpen: true,  match: (m) => m.section === "sec4" },
  { id: "order",     label: "Order Details",        defaultOpen: true,  match: (m) => m.section === "sec1" },
  { id: "address",   label: "Address",              defaultOpen: true,  match: (m) => m.section === "sec3" },
  { id: "scope",     label: "Scope & Schedule",     defaultOpen: true,  match: (m) => m.section === "sec5" },
];

// groupActionItems — bucket the missing-field items by ACTION_ITEM_GROUPS; any
// item that no group claims lands in `remainder` (rendered without a header).
export const groupActionItems = (items: MissingItem[]) => {
  const grouped: Record<string, MissingItem[]> = {};
  const remainder: MissingItem[] = [];
  items.forEach((item) => {
    const g = ACTION_ITEM_GROUPS.find((g) => g.match(item));
    if (g) (grouped[g.id] = grouped[g.id] || []).push(item);
    else remainder.push(item);
  });
  return { grouped, remainder };
};
