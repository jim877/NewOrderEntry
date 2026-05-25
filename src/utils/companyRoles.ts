// @ts-nocheck
// Pure builder for the per-role Company assignment rows shown in
// Section 4's Companies & Contacts grid. Walks COMPANY_ROLE_DEFS once
// and, for each defined role (Insurance, Public Adjuster, Independent
// Adjuster, TPA, ...), emits a normalized row that merges:
//   - the live additionalCompanies[<role.type>] entry the user has
//     filled in (or a placeholder thereof),
//   - the top-level "source" fields (e.g. insuranceCompany /
//     insuranceAdjuster) that mirror the entry's company + contact,
//   - any directory matches by company name (so we can offer "use
//     this contact" suggestions even when the role's contacts list
//     is empty).
// The resulting row carries pending / filled / placeholder booleans
// that drive the row's visual state — extracted so the App.tsx
// useMemo body collapses to a one-line delegation.

import { normalizeCompany, normalizeContact } from "./strings";
import {
  syncCompanyEntryPlaceholders,
  entryContactList,
  isCompanyPlaceholder,
  isContactPlaceholder,
  companyTypeRequiresContact,
} from "./companyEntry";

export type CompanyRoleDef = {
  type: string;
  label?: string;
  source?: string;
  contactSource?: string;
  [k: string]: any;
};

export type CompanyRoleAssignment = CompanyRoleDef & {
  companyName: string;
  contactName: string;
  pending: boolean;
  filled: boolean;
  companyPlaceholder: boolean;
  contactPlaceholder: boolean;
  entry: any;
  contacts: { name: string }[];
};

// dedupeAdditionalCompanyEntries — pure folding pass over the
// additionalCompanies map that:
//   1. Re-runs syncCompanyEntryPlaceholders on every entry so the
//      placeholder flags stay in sync with the company/contact fields.
//   2. Merges any two entries whose normalized company name matches,
//      keeping the first-seen type and accumulating contacts from
//      both sides.
//   3. Drops the now-orphaned type key from additionalCompanyTypes.
// Returns { cleaned, nextTypes, changed } — call site applies via
// setData when changed is true.
export const dedupeAdditionalCompanyEntries = (
  entries: Record<string, any>,
  additionalCompanyTypes: string[],
): { cleaned: Record<string, any>; nextTypes: string[]; changed: boolean } => {
  const seen = new Map<string, string>();
  let changed = false;
  const cleaned = { ...(entries || {}) };

  Object.entries(entries || {}).forEach(([type, entry]: [string, any]) => {
    const normalizedCurrent = syncCompanyEntryPlaceholders(cleaned[type] || entry);
    if (JSON.stringify(normalizedCurrent) !== JSON.stringify(cleaned[type] || entry)) {
      cleaned[type] = normalizedCurrent;
      changed = true;
    }
    const key = normalizedCurrent?.company ? normalizeCompany(normalizedCurrent.company) : "";
    if (!key) return;

    if (seen.has(key)) {
      const keepType = seen.get(key)!;
      const keepEntry = syncCompanyEntryPlaceholders(cleaned[keepType] || {});
      const keepContacts = keepEntry.contacts && keepEntry.contacts.length
        ? keepEntry.contacts
        : (keepEntry.contact ? [{ name: keepEntry.contact, inactive: false }] : []);
      const entryContacts = normalizedCurrent.contacts && normalizedCurrent.contacts.length
        ? normalizedCurrent.contacts
        : (normalizedCurrent.contact ? [{ name: normalizedCurrent.contact, inactive: false }] : []);
      const merged = [...keepContacts];
      entryContacts.forEach((c: any) => {
        if (!c?.name) return;
        if (!merged.find((x: any) => normalizeContact(x.name) === normalizeContact(c.name))) {
          merged.push({ name: c.name, inactive: !!c.inactive, placeholder: c.placeholder || null });
        }
      });
      cleaned[keepType] = syncCompanyEntryPlaceholders({
        ...keepEntry,
        ...normalizedCurrent,
        contacts: merged,
        contact: merged[0]?.name || keepEntry.contact || normalizedCurrent.contact || "",
        placeholder: keepEntry.placeholder || normalizedCurrent.placeholder || null,
        contactPlaceholder: keepEntry.contactPlaceholder || normalizedCurrent.contactPlaceholder || null,
      });
      delete cleaned[type];
      changed = true;
      return;
    }
    seen.set(key, type);
  });

  const nextTypes = (additionalCompanyTypes || []).filter((t) => cleaned[t]);
  return { cleaned, nextTypes, changed };
};

// buildCompanyRoleAssignments — emit one assignment row per role def.
// `globalDirectoryByCompany` is a Map<normalizedCompanyName, contacts[]>
// built upstream from the saved address book; we use it to suggest
// contacts when the entry itself has none.
export const buildCompanyRoleAssignments = (
  data: any,
  roleDefs: CompanyRoleDef[],
  globalDirectoryByCompany: Map<string, { name: string }[]>,
): CompanyRoleAssignment[] => {
  return roleDefs.map((role) => {
    const rawEntry = data.additionalCompanies?.[role.type];
    const entry = rawEntry ? syncCompanyEntryPlaceholders(rawEntry) : null;
    const sourceCompany = role.source ? (data[role.source] || "") : "";
    const sourceContact = role.contactSource ? (data[role.contactSource] || "") : "";
    const contactsFromEntry = entryContactList(entry);
    const companyName = sourceCompany || entry?.company || "";

    // Best-effort directory lookup — exact match first, then any keys
    // that contain the target (or vice versa) so trailing ", Inc." /
    // "LLC" suffix variants still match.
    const contactsFromSample = (() => {
      if (!companyName) return [];
      const target = normalizeCompany(companyName);
      if (!target) return [];
      const direct = globalDirectoryByCompany.get(target) || [];
      if (direct.length) return direct.map((c) => ({ name: c.name }));
      const matches: { name: string }[] = [];
      globalDirectoryByCompany.forEach((list, key) => {
        if (key.includes(target) || target.includes(key)) {
          list.forEach((c) => matches.push({ name: c.name }));
        }
      });
      return matches;
    })();

    const mergedContacts = [
      ...contactsFromEntry,
      ...contactsFromSample.filter(
        (c) => !contactsFromEntry.find((e: any) => normalizeContact(e.name) === normalizeContact(c.name))
      ),
    ];
    const contactName = sourceContact || mergedContacts[0]?.name || "";

    const normalizedEntry = syncCompanyEntryPlaceholders({
      ...(entry || {}),
      company: companyName || entry?.company || "",
      contact: contactName || entry?.contact || "",
      contacts: mergedContacts,
      placeholder: entry?.placeholder || null,
      contactPlaceholder: entry?.contactPlaceholder || null,
    });
    if (!companyTypeRequiresContact(role.type)) {
      normalizedEntry.contactPlaceholder = null;
    }

    const companyPlaceholder = !!entry && !sourceCompany && isCompanyPlaceholder(normalizedEntry);
    const contactPlaceholder =
      !!entry &&
      !sourceContact &&
      !companyPlaceholder &&
      companyTypeRequiresContact(role.type) &&
      isContactPlaceholder(normalizedEntry);
    const pending = companyPlaceholder || contactPlaceholder;
    const filled = !!companyName;

    return {
      ...role,
      companyName,
      contactName,
      pending,
      filled,
      companyPlaceholder,
      contactPlaceholder,
      entry: normalizedEntry,
      contacts: mergedContacts,
    };
  });
};
