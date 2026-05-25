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
