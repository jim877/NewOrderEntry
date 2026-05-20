// @ts-nocheck
// Company-entry shape helpers. A "company entry" pairs a company with one or more contacts
// (e.g. an insurance company + adjuster). Tracks placeholder flags for company and contact slots.

import {
  hasMeaningfulValue,
  isPlaceholderFlagActive,
  createPlaceholderFlag,
} from "./order";
import { normalizePlaceholderKeyPart } from "./strings";

// Some company types (e.g. TPAs) can be entered without a named contact.
const CONTACT_OPTIONAL_COMPANY_TYPES = new Set(["tpa"]);

// entryContactList — normalize the contact slot into an array of { name, inactive, placeholder }.
// Falls back to a single-element array built from entry.contact if `contacts` is missing.
export const entryContactList = (entry: any = {}) => {
  const fromContacts = Array.isArray(entry?.contacts) ? entry.contacts : [];
  if (fromContacts.length) return fromContacts;
  if (hasMeaningfulValue(entry?.contact)) {
    return [{ name: entry.contact, inactive: false, placeholder: entry?.contactPlaceholder || null }];
  }
  return [];
};

export const isCompanyPlaceholder = (entry: any = {}) => {
  if (isPlaceholderFlagActive(entry?.placeholder)) return true;
  return !hasMeaningfulValue(entry?.company);
};

export const isContactPlaceholder = (entry: any = {}) => {
  if (isPlaceholderFlagActive(entry?.contactPlaceholder)) return true;
  const contacts = entryContactList(entry);
  if (!contacts.length) return true;
  return contacts.some((c) => isPlaceholderFlagActive(c?.placeholder) || !hasMeaningfulValue(c?.name));
};

export const companyTypeRequiresContact = (type: string = "") =>
  !CONTACT_OPTIONAL_COMPANY_TYPES.has(normalizePlaceholderKeyPart(type));

// syncCompanyEntryPlaceholders — coerce an entry into a canonical shape:
// - placeholder flag set when company is missing, cleared when present
// - contactPlaceholder flag set when no named contact, cleared when at least one exists
// - contacts array normalized (trim names, default inactive=false, keep placeholder flag only if active)
// - entry.contact mirrors the first named contact for backwards compat
export const syncCompanyEntryPlaceholders = (entry: any = {}) => {
  const normalized = { ...(entry || {}) };
  const hasCompany = hasMeaningfulValue(normalized.company);
  const contacts = entryContactList(normalized).map((contact) => ({
    ...(contact || {}),
    name: (contact?.name || "").trim(),
    inactive: !!contact?.inactive,
    placeholder: isPlaceholderFlagActive(contact?.placeholder) ? contact.placeholder : null,
  }));
  const hasNamedContact = contacts.some((c) => hasMeaningfulValue(c.name));
  if (hasCompany) normalized.placeholder = null;
  else if (!isPlaceholderFlagActive(normalized.placeholder)) {
    normalized.placeholder = createPlaceholderFlag("company", "Company needed");
  }
  if (hasNamedContact) normalized.contactPlaceholder = null;
  else if (!isPlaceholderFlagActive(normalized.contactPlaceholder)) {
    normalized.contactPlaceholder = createPlaceholderFlag("contact", "Contact needed");
  }
  normalized.company = hasCompany ? normalized.company : "";
  normalized.contacts = contacts;
  if (!hasNamedContact) normalized.contact = "";
  else if (!hasMeaningfulValue(normalized.contact)) {
    normalized.contact = contacts.find((c) => hasMeaningfulValue(c.name))?.name || "";
  }
  return normalized;
};
