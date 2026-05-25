// @ts-nocheck
// Pure mapping from the audit missing-field list to the Section /
// subsection ids that should be flagged in the UI when "Audit Mode"
// is enabled. Returns the discovered targets plus the booleans the
// call site needs (codesNeedsOpen — whether the Codes panel should
// auto-expand because at least one missing field lives there).

import type { AuditMissingItem } from "./auditMissing";

export type AuditTargets = {
  sections: Set<string>;
  subsections: Set<string>;
  codesNeedsOpen: boolean;
};

// Keyword -> subsection mapping. Each entry: if the missing item's
// `key` matches any of `keys`, add `subsection` to the result set.
const SUBSECTION_KEY_MAP: { subsection: string; keys: string[] }[] = [
  { subsection: "source", keys: ["leadSourceCategory", "referringCompany", "referrer", "leadSourceDetail"] },
  { subsection: "billing", keys: ["billingPayer"] },
  { subsection: "order", keys: ["orderName", "orderTypes", "nonRestorationSubtype", "moldCoverageConfirm"] },
  {
    subsection: "insurance",
    keys: [
      "insuranceClaim",
      "insuranceCompany",
      "insuranceAdjuster",
      "claimNumber",
      "dateOfLoss",
      "nationalCarrier",
      "directionOfPayment",
      "contentsCoverageLimit",
      "moldLimit",
    ],
  },
  { subsection: "address", keys: ["rentCoverageLimit"] },
  { subsection: "finance", keys: ["pricePlatform", "priceList", "multiplier", "estimateRequested"] },
];

const SUBSECTION_PREFIX_MAP: { subsection: string; prefix: string }[] = [
  { subsection: "customer", prefix: "placeholder-customer-" },
  { subsection: "companies", prefix: "placeholder-company-" },
  { subsection: "companies", prefix: "placeholder-contact-" },
  { subsection: "address", prefix: "placeholder-address-" },
];

const EXACT_KEY_MAP: Record<string, string> = {
  interview: "interview",
  codes: "codes",
};

// mapAuditMissingToTargets — fold the missing-field list into
// section + subsection target sets. Exact + prefix matching, plus
// a `codesNeedsOpen` flag so the call site can imperatively expand
// the Codes panel when at least one missing field lives there.
export const mapAuditMissingToTargets = (missing: AuditMissingItem[]): AuditTargets => {
  const sections = new Set<string>();
  const subsections = new Set<string>();
  let codesNeedsOpen = false;

  missing.forEach((item) => {
    if (item.section) sections.add(item.section);
    const key = item.key || "";

    SUBSECTION_KEY_MAP.forEach((entry) => {
      if (entry.keys.includes(key)) subsections.add(entry.subsection);
    });

    SUBSECTION_PREFIX_MAP.forEach((entry) => {
      if (key.startsWith(entry.prefix)) subsections.add(entry.subsection);
    });

    const exact = EXACT_KEY_MAP[key];
    if (exact) {
      subsections.add(exact);
      if (key === "codes") codesNeedsOpen = true;
    }
  });

  return { sections, subsections, codesNeedsOpen };
};
