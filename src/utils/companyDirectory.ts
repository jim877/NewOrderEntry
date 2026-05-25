// @ts-nocheck
// Pure derivations over the order's company/contact directory. Three
// builders sit together here because they all walk the same shape
// (additionalCompanies entries + sampleContacts seed list) and were
// originally a cluster of inline useMemos in App.tsx.

import { normalizeCompany, normalizeContact } from "./strings";
import { normalizeSampleContacts } from "./normalizeSampleContacts";
import { inferRoleCapabilities } from "./companyProfiles";

export type DirectoryEntry = { name: string; title?: string };

// buildContactCompanyMap — Map<normalizedContactName, companyName>
// for back-resolving "what company is this contact at?" lookups.
// Merges three sources: additionalCompanies (both single contact +
// contacts[]), the top-level billing contact pair, and the seeded
// sampleContacts list.
export const buildContactCompanyMap = (data: any, sampleContacts: any[]): Map<string, string> => {
  const map = new Map<string, string>();
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => {
    if (entry?.contact && entry?.company) {
      map.set(normalizeContact(entry.contact), entry.company);
    }
    if (entry?.contacts?.length && entry.company) {
      entry.contacts.forEach((c: any) => {
        if (c?.name) map.set(normalizeContact(c.name), entry.company);
      });
    }
  });
  if (data.billingContact && data.billingCompany) {
    map.set(normalizeContact(data.billingContact), data.billingCompany);
  }
  (sampleContacts || []).forEach((c: any) => {
    if (c?.name && c?.company) map.set(normalizeContact(c.name), c.company);
  });
  return map;
};

// buildExistingCompanyOptions — flat de-duped list of company names
// available for picker dropdowns. Combines saved company shortlist
// with the live additionalCompanies entries on the order.
export const buildExistingCompanyOptions = (companies: string[], data: any): string[] => {
  const set = new Set<string>();
  (companies || []).forEach((c) => c && set.add(c));
  Object.values(data.additionalCompanies || {}).forEach((entry: any) => {
    if (entry?.company) set.add(entry.company);
  });
  return Array.from(set);
};

// buildGlobalDirectoryByCompany — Map<normalizedCompanyName,
// DirectoryEntry[]> built from the sampleContacts seed list. Used by
// the role-assignment merger so we can suggest known contacts at a
// company even before the user has filled them in.
export const buildGlobalDirectoryByCompany = (sampleContacts: any[]): Map<string, DirectoryEntry[]> => {
  const map = new Map<string, DirectoryEntry[]>();
  (sampleContacts || []).forEach((c: any) => {
    const key = normalizeCompany(c.company || "");
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ name: c.name, title: c.title });
  });
  return map;
};

// upsertSampleContactReducer — pure reducer for the setSampleContacts
// callback in registerContactCompany. Finds the row whose name
// matches the given contact (case-insensitive); if present, patches
// its company; otherwise appends a fresh row with inferred company
// type + role capabilities. Caller supplies the auto-classifier
// (App.tsx's autoTypeForCompany) so the helper doesn't import config.
export const upsertSampleContactReducer = (
  prev: any[],
  contact: string,
  company: string,
  newRowId: string,
  classifyCompanyName: (name: string) => string,
): any[] => {
  const normalized = normalizeSampleContacts(prev);
  const existingIndex = normalized.findIndex(
    (c: any) => normalizeContact(c.name) === normalizeContact(contact)
  );
  if (existingIndex >= 0) {
    const next = [...normalized];
    const existing = next[existingIndex];
    next[existingIndex] = { ...existing, company: company || existing.company };
    return next;
  }
  const companyType = classifyCompanyName(company);
  const defaults = inferRoleCapabilities(companyType, company);
  return [
    ...normalized,
    {
      id: newRowId,
      name: contact,
      company,
      companyType,
      title: "",
      salesRep: "",
      isAdjuster: false,
      canRefer: defaults.canRefer,
      canBill: defaults.canBill,
      canInsure: defaults.canInsure,
    },
  ];
};

// orderCompanyRoles — apply the Section 4 "visible roles" filter +
// stable sort. Filled rows first, pending next, the rest last; ties
// broken alphabetically by label, then by original index.
export const orderCompanyRoles = (assignments: any[], expanded: boolean): any[] => {
  const base = expanded ? assignments : assignments.filter((r) => r.pending || r.filled);
  return base
    .map((r, idx) => ({ ...r, _idx: idx }))
    .sort((a, b) => {
      const rank = (r: any) => (r.filled ? 0 : r.pending ? 1 : 2);
      const diff = rank(a) - rank(b);
      if (diff !== 0) return diff;
      const aLabel = (a.label || "").toLowerCase();
      const bLabel = (b.label || "").toLowerCase();
      if (aLabel === bLabel) return a._idx - b._idx;
      return aLabel.localeCompare(bLabel);
    })
    .map(({ _idx, ...r }: any) => r);
};
