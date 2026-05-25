// @ts-nocheck
// Pure derivations of the "this role overlaps with that role" assignment-
// cue lists used by the Billing and Insurance section headers. When the
// billing company/contact also fills the referrer or insurance role on the
// same order, we surface a small pill so the user knows the records are
// linked (saving them from re-entering the same firm twice).

import { sameNormalizedCompany, sameNormalizedContact } from "./strings";

// buildBillingAssignmentCues — items to show next to the Billing role
// (Referrer / Insurance overlap detection).
export const buildBillingAssignmentCues = (data: any, buildAssignmentCueItems: (items: any[]) => any[]) =>
  buildAssignmentCueItems([
    {
      label: "Referrer",
      companyMatch: sameNormalizedCompany(data.billingCompany, data.referringCompany),
      contactMatch: sameNormalizedContact(data.billingContact, data.referrer),
    },
    {
      label: "Insurance",
      companyMatch: sameNormalizedCompany(data.billingCompany, data.insuranceCompany),
      contactMatch: sameNormalizedContact(data.billingContact, data.insuranceAdjuster),
    },
  ]);

// buildInsuranceAssignmentCues — mirror for the Insurance role, detecting
// overlap with Referrer or Bill To.
export const buildInsuranceAssignmentCues = (data: any, buildAssignmentCueItems: (items: any[]) => any[]) =>
  buildAssignmentCueItems([
    {
      label: "Referrer",
      companyMatch: sameNormalizedCompany(data.insuranceCompany, data.referringCompany),
      contactMatch: sameNormalizedContact(data.insuranceAdjuster, data.referrer),
    },
    {
      label: "Bill To",
      companyMatch: sameNormalizedCompany(data.insuranceCompany, data.billingCompany),
      contactMatch: sameNormalizedContact(data.insuranceAdjuster, data.billingContact),
    },
  ]);
