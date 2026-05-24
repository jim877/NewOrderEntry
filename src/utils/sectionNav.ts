// Detailed-mode section/subsection navigation maps. The Detailed entry form
// has 5 top-level Sections (sec1..sec5) and each contains 0-N SubSections
// (e.g. sec1 → order/source/interview/codes). These lookups let the search,
// audit, and toggle helpers translate between subsection keys, parent sec IDs,
// and the DOM ids they scroll to / focus into.

export const SUBSECTION_TO_SECTION: Record<string, string> = {
  order: "sec1",
  source: "sec1",
  interview: "sec1",
  codes: "sec1",
  customer: "sec2",
  address: "sec3",
  companies: "sec4",
  billing: "sec4",
  finance: "sec4",
  insurance: "sec4",
  schedule: "sec5",
  bridge: "sec5",
  "sds-icons": "sec5",
};

export const DEFAULT_SUBSECTION_BY_SECTION: Record<string, string> = {
  sec1: "order",
  sec2: "customer",
  sec3: "address",
  sec4: "companies",
  sec5: "schedule",
};

// Subsection key → DOM id its container renders with. Several entries map to
// the parent section id when the subsection doesn't have its own scroll anchor
// (customer/address) or shares one with another (sds-icons sits inside bridge).
export const SUBSECTION_DOM_ID: Record<string, string> = {
  order: "sec1-order",
  source: "sec1-source",
  interview: "sec1-interview",
  codes: "sec1-codes",
  companies: "sec4-companies",
  billing: "sec4-billing",
  finance: "sec4-finance",
  insurance: "sec4-insurance",
  schedule: "sec5-schedule",
  bridge: "sec5-bridge",
  "sds-icons": "sec5-bridge",
  customer: "sec2",
  address: "sec3",
};
