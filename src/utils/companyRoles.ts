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
import { hasMeaningfulValue, createPlaceholderFlag } from "./order";
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

// addPlaceholderCompanyTypeReducer — pure reducer that adds an
// empty placeholder entry for the given company type, or a no-op
// when one already exists. The contactPlaceholder flag is set only
// for company types that require a contact (companyTypeRequiresContact).
export const addPlaceholderCompanyTypeReducer = (prev: any, type: string) => {
  const types = new Set(prev.additionalCompanyTypes || []);
  types.add(type);
  const existing = prev.additionalCompanies?.[type];
  return {
    ...prev,
    additionalCompanyTypes: Array.from(types),
    additionalCompanies: {
      ...(prev.additionalCompanies || {}),
      [type]: syncCompanyEntryPlaceholders(
        existing || {
          contact: "",
          company: "",
          placeholder: createPlaceholderFlag("company", `${type} pending`),
          contactPlaceholder: companyTypeRequiresContact(type)
            ? createPlaceholderFlag("contact", `${type} contact pending`)
            : null,
        }
      ),
    },
  };
};

// addContactToCompanyReducer — pure reducer for adding a single
// contact to the contacts list of an additionalCompanies entry.
// Returns prev unchanged when the contact already exists (matched by
// normalized name). Side-effect-free: company name + role flash are
// handled at the call site.
export const addContactToCompanyReducer = (
  prev: any,
  type: string,
  contactName: string,
  companyName: string,
) => {
  const entries = { ...(prev.additionalCompanies || {}) };
  const entry = syncCompanyEntryPlaceholders(entries[type] || { contact: "", company: companyName, contacts: [] });
  const list = entry.contacts && entry.contacts.length
    ? entry.contacts
    : (entry.contact ? [{ name: entry.contact, inactive: false, placeholder: null }] : []);
  if (list.find((c: any) => normalizeContact(c.name) === normalizeContact(contactName))) return prev;
  const next = [...list, { name: contactName, inactive: false, placeholder: null }];
  entries[type] = syncCompanyEntryPlaceholders({
    ...entry,
    company: companyName,
    contacts: next,
    contact: entry.contact || next[0]?.name || "",
    contactPlaceholder: null,
  });
  return { ...prev, additionalCompanies: entries };
};

// removeAdditionalCompanyTypeReducer — pure reducer that drops a
// type from additionalCompanyTypes and removes its entry. Used when
// the user un-toggles a role that has only a placeholder entry.
export const removeAdditionalCompanyTypeReducer = (prev: any, type: string) => {
  const nextTypes = (prev.additionalCompanyTypes || []).filter((t: string) => t !== type);
  const nextCompanies = { ...(prev.additionalCompanies || {}) };
  delete nextCompanies[type];
  return { ...prev, additionalCompanyTypes: nextTypes, additionalCompanies: nextCompanies };
};

// applyBillingContactChangeReducer — pure reducer for the billing
// contact picker. Writes contact + best-guess company (resolved or
// fall through to the existing value). Empty contact clears
// billingCompany only when the user explicitly typed a company.
export const applyBillingContactChangeReducer = (
  prev: any,
  contact: string,
  parsedCompany: string,
  resolvedCompany: string,
) => ({
  ...prev,
  billingContact: contact,
  billingCompany: contact
    ? (resolvedCompany || prev.billingCompany || "")
    : (parsedCompany || prev.billingCompany || ""),
});

// applyAdjusterContactChangeReducer — same shape as billing but writes
// insuranceAdjuster + adjusterCompany, and also fills in
// insuranceCompany when it's empty (the adjuster's company is usually
// the insurance carrier).
export const applyAdjusterContactChangeReducer = (
  prev: any,
  contact: string,
  parsedCompany: string,
  resolvedCompany: string,
) => ({
  ...prev,
  insuranceAdjuster: contact,
  adjusterCompany: contact
    ? (resolvedCompany || prev.adjusterCompany || "")
    : (parsedCompany || prev.adjusterCompany || ""),
  insuranceCompany: prev.insuranceCompany || parsedCompany || resolvedCompany || "",
});

// applyInsuranceCompanyChangeReducer — pure reducer for the
// Insurance Company picker. Writes the new company name, flips
// insuranceClaim/involvesInsurance to "Yes" when a company is set
// (and we're not in non-restoration mode), and updates the linked
// national carrier (or clears it when the company changed away).
export const applyInsuranceCompanyChangeReducer = (
  prev: any,
  company: string,
  linkedCarrier: string,
  isNonRestorationProject: boolean,
) => {
  const companyChanged = normalizeCompany(prev.insuranceCompany || "") !== normalizeCompany(company);
  return {
    ...prev,
    insuranceCompany: company,
    insuranceClaim: company ? "Yes" : prev.insuranceClaim,
    involvesInsurance: company && !isNonRestorationProject ? "Yes" : prev.involvesInsurance,
    nationalCarrier: linkedCarrier
      ? linkedCarrier
      : (companyChanged ? "" : prev.nationalCarrier || ""),
    nationalCarrierRequested: linkedCarrier
      ? false
      : (companyChanged ? false : !!prev.nationalCarrierRequested),
  };
};

// applyAdditionalContactChangeReducer — pure reducer used by
// handleAdditionalContactChange. Patches the additionalCompanies[type]
// entry with the new contact + best-guess company (the existing one,
// or the contactCompanyMap suggestion). Maintains the
// contactPlaceholder flag for company types that require a contact.
export const applyAdditionalContactChangeReducer = (
  prev: any,
  type: string,
  contact: string,
  suggestedCompany: string,
) => ({
  ...prev,
  additionalCompanies: {
    ...(prev.additionalCompanies || {}),
    [type]: syncCompanyEntryPlaceholders({
      ...(prev.additionalCompanies?.[type] || { contact: "", company: "" }),
      contact,
      company: prev.additionalCompanies?.[type]?.company || suggestedCompany || "",
      contactPlaceholder: hasMeaningfulValue(contact)
        ? null
        : (
            companyTypeRequiresContact(type)
              ? (
                  prev.additionalCompanies?.[type]?.contactPlaceholder
                    || createPlaceholderFlag("contact", `${type} contact pending`)
                )
              : null
          ),
    }),
  },
});

// upsertAdditionalCompanyReducer — pure reducer body for the
// upsertAdditionalCompany flow. Walks the existing additionalCompanies
// looking for an entry whose company or contact matches the incoming
// one; if found, that entry's type wins and the rows merge (contacts
// accumulate, placeholders carry forward). Otherwise the entry slots
// under `nextType`. When the user is replacing a different-company
// entry under nextType (existingForType provided), the old contacts
// are cleared first so the new company gets fresh contact slots.
export const upsertAdditionalCompanyReducer = (
  prev: any,
  nextType: string,
  entry: any,
  existingForType: any,
  incomingCompany: string,
): { next: any; targetType: string } => {
  const types = new Set(prev.additionalCompanyTypes || []);
  const entries = { ...(prev.additionalCompanies || {}) };
  const incomingEntry = syncCompanyEntryPlaceholders(entry || {});
  const incomingContacts = entryContactList(incomingEntry);
  const keyContact = incomingEntry.contact ? normalizeContact(incomingEntry.contact) : "";
  const keyCompany = incomingEntry.company ? normalizeCompany(incomingEntry.company) : "";

  const existingType = Object.entries(entries).find(([, e]: [string, any]) => {
    const existingContacts = entryContactList(e || {});
    const sameContact = keyContact && e?.contact && normalizeContact(e.contact) === keyContact;
    const sameContactInList = incomingContacts.some((incoming: any) =>
      existingContacts.some((existing: any) =>
        normalizeContact(existing?.name || "") === normalizeContact(incoming?.name || "")
      )
    );
    const sameCompany = keyCompany && e?.company && normalizeCompany(e.company) === keyCompany;
    return sameContact || sameContactInList || sameCompany;
  })?.[0];
  const targetType = existingType || nextType;

  // Different-company replacement under nextType — clear old contacts.
  if (
    !existingType &&
    targetType === nextType &&
    existingForType?.company &&
    normalizeCompany(existingForType.company) !== normalizeCompany(incomingCompany)
  ) {
    entries[targetType] = { ...(entries[targetType] || {}), contacts: [], contact: "" };
  }
  if (existingType && existingType !== targetType) {
    delete entries[existingType];
    types.delete(existingType);
  }

  const existingEntry = syncCompanyEntryPlaceholders(entries[targetType] || {});
  const existingContacts = entryContactList(existingEntry);
  const mergedContacts = [...existingContacts];
  incomingContacts.forEach((c: any) => {
    if (!c?.name) return;
    if (!mergedContacts.find((x: any) => normalizeContact(x.name) === normalizeContact(c.name))) {
      mergedContacts.push({ name: c.name, inactive: !!c.inactive, placeholder: c.placeholder || null });
    }
  });
  types.add(targetType);
  entries[targetType] = syncCompanyEntryPlaceholders({
    ...(existingEntry || {}),
    ...incomingEntry,
    contacts: mergedContacts,
    contact: mergedContacts.find((c: any) => hasMeaningfulValue(c?.name))?.name
      || incomingEntry.contact
      || existingEntry.contact
      || "",
    placeholder: hasMeaningfulValue(incomingEntry.company)
      ? null
      : (incomingEntry.placeholder || existingEntry.placeholder || null),
    contactPlaceholder: mergedContacts.some((c: any) => hasMeaningfulValue(c?.name))
      ? null
      : (
          companyTypeRequiresContact(targetType)
            ? (incomingEntry.contactPlaceholder || existingEntry.contactPlaceholder || createPlaceholderFlag("contact", `${targetType} contact pending`))
            : null
        ),
  });
  return {
    next: { ...prev, additionalCompanyTypes: Array.from(types), additionalCompanies: entries },
    targetType,
  };
};

// migrateReferringCompanyEntryReducer — legacy data shape migration.
// Older saves stored the referrer under additionalCompanies["Referring
// Company"]; we now key by inferred company type (Public Adjusting /
// Insurance / etc.). This reducer rewrites the legacy key into the
// inferred type slot, merging with any existing entry there.
export const migrateReferringCompanyEntryReducer = (
  prev: any,
  legacyEntry: any,
  inferredType: string,
) => {
  const nextTypes = new Set(
    (prev.additionalCompanyTypes || []).filter((t: string) => t !== "Referring Company")
  );
  nextTypes.add(inferredType);
  const nextCompanies = { ...(prev.additionalCompanies || {}) };
  delete nextCompanies["Referring Company"];
  const existing = nextCompanies[inferredType] || { contact: "", company: "" };
  nextCompanies[inferredType] = syncCompanyEntryPlaceholders({
    contact: legacyEntry.contact || existing.contact || "",
    company: legacyEntry.company || existing.company || "",
  });
  return {
    ...prev,
    additionalCompanyTypes: Array.from(nextTypes),
    additionalCompanies: nextCompanies,
  };
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
