// @ts-nocheck
// Pure derivations of the per-order document obligations — Special
// Documents (e.g. "Hold harmless", "Subrogation form") that must be
// signed, and Customer Forms (the text-form variants the customer
// receives directly). Both walk the order's company + contact lists
// and merge the document lists from each entity's saved profile.

import { mergeUniqueStrings } from "./strings";

// buildCurrentOrderSpecialDocs — flat de-duped list of the
// specialDocuments declared by any company OR contact on the order.
export const buildCurrentOrderSpecialDocs = (
  orderCompanyNames: string[],
  orderContactNames: string[],
  getCompanyProfile: (name: string) => any,
  getContactProfile: (name: string) => any,
): string[] => {
  return mergeUniqueStrings(
    (orderCompanyNames || []).flatMap((companyName) =>
      getCompanyProfile(companyName).specialDocuments || []
    ),
    (orderContactNames || []).flatMap((contactName) =>
      getContactProfile(contactName).specialDocuments || []
    ),
  );
};

// buildCurrentOrderCustomerForms — same shape but for the customer-
// facing text forms. Falls back to specialDocuments when the entity
// hasn't declared customerTextForms explicitly (so we still send
// something rather than nothing).
export const buildCurrentOrderCustomerForms = (
  orderCompanyNames: string[],
  orderContactNames: string[],
  getCompanyProfile: (name: string) => any,
  getContactProfile: (name: string) => any,
): string[] => {
  return mergeUniqueStrings(
    (orderCompanyNames || []).flatMap((companyName) => {
      const profile = getCompanyProfile(companyName);
      return profile.customerTextForms?.length ? profile.customerTextForms : profile.specialDocuments;
    }),
    (orderContactNames || []).flatMap((contactName) => {
      const profile = getContactProfile(contactName);
      return profile.customerTextForms?.length ? profile.customerTextForms : profile.specialDocuments;
    }),
  );
};
