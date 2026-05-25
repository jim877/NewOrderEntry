// @ts-nocheck
// Pure builders + parser for the company/contact combo pickers used
// across the entry forms. The combined list interleaves "Name
// (Company)" contact options with "Company" options; the parser
// splits a picked label back into { contact, company }.

import { normalizeCompany, normalizeContact } from "./strings";

export type ContactOption = { label: string; value: string; type: "contact" | "company" };

// buildCombinedContactOptions — the unified picker source list.
// Includes seeded sampleContacts entries first (so directory picks
// look familiar), then any contacts the user has typed; tops up
// with the company-only entries below the contact rows.
export const buildCombinedContactOptions = (
  contacts: string[],
  companies: string[],
  contactCompanyMap: Map<string, string>,
  sampleContacts: any[],
): ContactOption[] => {
  const contactOpts: ContactOption[] = [];
  const seenContacts = new Set<string>();
  const addContact = (contact: string, company: string | undefined) => {
    if (!contact || seenContacts.has(contact)) return;
    seenContacts.add(contact);
    const label = company ? `${contact} (${company})` : contact;
    const value = company ? `${contact} — ${company}` : contact;
    contactOpts.push({ label, value, type: "contact" });
  };
  (sampleContacts || []).forEach((c: any) => addContact(c.name, c.company));
  (contacts || []).forEach((c) => {
    const company = contactCompanyMap.get(normalizeContact(c));
    addContact(c, company);
  });
  const companyOpts: ContactOption[] = (companies || []).map((c) => ({ label: c, value: c, type: "company" }));
  return [...contactOpts, ...companyOpts];
};

// parseCombinedContact — split a picker selection back into the
// underlying { contact, company } pair. Three accepted shapes:
//   "Name — Company" (em-dash separator emitted by the picker)
//   "Name (Company)" (paren form for label display)
//   bare string — treated as a company if it matches a known company,
//     otherwise treated as a contact and back-resolved via the map.
export const parseCombinedContact = (
  value: string,
  companySet: Set<string>,
  contactCompanyMap: Map<string, string>,
): { contact: string; company: string } => {
  const v = (value || "").trim();
  if (!v) return { contact: "", company: "" };
  const dashParts = v.split("—").map((p) => p.trim()).filter(Boolean);
  if (dashParts.length >= 2) return { contact: dashParts[0], company: dashParts.slice(1).join(" — ") };
  const paren = v.match(/^(.+)\s+\((.+)\)$/);
  if (paren) return { contact: paren[1].trim(), company: paren[2].trim() };
  if (companySet.has(v)) return { contact: "", company: v };
  const mappedCompany = contactCompanyMap.get(normalizeContact(v)) || "";
  if (mappedCompany) return { contact: v, company: mappedCompany };
  return { contact: v, company: "" };
};

// getContactOptionsForCompany — narrow the picker to just the
// contacts known to belong to one specific company. Pulls from both
// the seed sampleContacts list and the user-typed contacts via the
// contactCompanyMap.
export const getContactOptionsForCompany = (
  company: string,
  contacts: string[],
  contactCompanyMap: Map<string, string>,
  sampleContacts: any[],
): ContactOption[] => {
  if (!company) return [];
  const opts: ContactOption[] = [];
  const seen = new Set<string>();
  const add = (name: string) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    opts.push({ label: name, value: name, type: "contact" });
  };
  (sampleContacts || []).forEach((c: any) => {
    if (normalizeCompany(c.company) === normalizeCompany(company)) add(c.name);
  });
  (contacts || []).forEach((c) => {
    const comp = contactCompanyMap.get(normalizeContact(c));
    if (comp && normalizeCompany(comp) === normalizeCompany(company)) add(c);
  });
  return opts;
};

// findSampleContact — back-resolve a contact name to its sample
// directory row. Used to look up cached salesRep / title hints.
export const findSampleContact = (name: string, sampleContacts: any[]): any | undefined =>
  (sampleContacts || []).find((c: any) => normalizeContact(c.name) === normalizeContact(name));
