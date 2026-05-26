// @ts-nocheck
// normalizeSampleContacts — coerce a raw `sampleContacts` array (from localStorage / preset)
// into the canonical shape App expects: required SAMPLE_CONTACTS rows always present, role
// capabilities defaulted from companyType+name, instructions merged with seed rows, all string
// fields normalized.

import { normalizeContact, normalizeCompany, mergeUniqueStrings } from "./strings";
import { mergeInstructionEntries } from "./instructions";
import { inferRoleCapabilities } from "./companyProfiles";
import { safeUid } from "./uid";
import { SAMPLE_CONTACTS } from "../data/sampleSeed";

export const normalizeSampleContacts = (rows: any[] = []) => {
  const mergedRows = [...(rows || [])];
  // Ensure every required seed contact is present (matched by name + company).
  SAMPLE_CONTACTS.forEach((required) => {
    const exists = mergedRows.some(
      (row) =>
        normalizeContact(row.name || "") === normalizeContact(required.name || "") &&
        normalizeCompany(row.company || "") === normalizeCompany(required.company || ""),
    );
    if (!exists) mergedRows.push(required);
  });
  return mergedRows.map((r) => {
    const defaults = inferRoleCapabilities(r.companyType || "", r.company || "");
    const seededRow = SAMPLE_CONTACTS.find(
      (required) =>
        normalizeContact(required.name || "") === normalizeContact(r.name || "") &&
        normalizeCompany(required.company || "") === normalizeCompany(r.company || ""),
    );
    const companyInstructions = mergeInstructionEntries(
      seededRow?.companyInstructions || seededRow?.companyPreferences || [],
      r.companyInstructions || r.companyPreferences || [],
    );
    const contactInstructions = mergeInstructionEntries(
      seededRow?.contactInstructions || seededRow?.contactPreferences || [],
      r.contactInstructions || r.contactPreferences || [],
    );
    return {
      id: r.id || safeUid(),
      name: r.name || "",
      company: r.company || "",
      companyType: r.companyType || "",
      title: r.title || "",
      salesRep: r.salesRep || "",
      isAdjuster: !!r.isAdjuster,
      canRefer:  typeof r.canRefer  === "boolean" ? r.canRefer  : defaults.canRefer,
      canBill:   typeof r.canBill   === "boolean" ? r.canBill   : defaults.canBill,
      canInsure: typeof r.canInsure === "boolean" ? r.canInsure : defaults.canInsure,
      companyInstructions,
      contactInstructions,
      companyPreferences: companyInstructions.map((entry) => entry.text),
      contactPreferences: contactInstructions.map((entry) => entry.text),
      specialDocuments:   mergeUniqueStrings(seededRow?.specialDocuments   || [], r.specialDocuments   || []),
      customerTextForms:  mergeUniqueStrings(seededRow?.customerTextForms  || [], r.customerTextForms  || []),
      nationalCarrier:    (r.nationalCarrier || seededRow?.nationalCarrier || "").toString(),
    };
  });
};
