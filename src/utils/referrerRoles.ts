// @ts-nocheck
// Pure derivation of the "suggested referrer roles" badge list that
// appears on the Lead Info card. When the user picks a referrer the
// system inspects the company name against the national-carrier list
// and the contact's role to suggest follow-up role assignments
// (insurance, billing, national-carrier, adjuster).

import { normalizeCompany } from "./strings";

// computeSuggestedReferrerRoles — emit the ordered list of suggested
// role badge ids ("adjuster", "insurance", "billing", "national") for
// the current referrer pair. Filters out roles whose target field is
// already filled with a different value (so we don't redundantly
// suggest overwriting an existing assignment).
export const computeSuggestedReferrerRoles = (
  data: any,
  nationalCarriers: string[],
): string[] => {
  const company = data.referringCompany || "";
  const contact = data.referrer || "";
  const roles: string[] = [];
  if (contact) roles.push("adjuster");
  const isCarrier = (nationalCarriers || []).some(
    (c) => normalizeCompany(c) === normalizeCompany(company)
  );
  if (isCarrier) roles.push("insurance", "billing", "national");
  return roles.filter((r) => {
    if (r === "adjuster") return !data.insuranceAdjuster || data.insuranceAdjuster === contact;
    if (r === "billing") return !data.billingCompany || data.billingCompany === company;
    if (r === "insurance") return !data.insuranceCompany || data.insuranceCompany === company;
    if (r === "national") return !data.nationalCarrier || data.nationalCarrier === company;
    return true;
  });
};
