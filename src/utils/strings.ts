// @ts-nocheck
// Tiny string utilities used across normalization + dedup logic.
// Pure functions — safe to import anywhere.

export const normalizeContact = (value: string) => value.trim().toLowerCase();
export const normalizeCompany = (value: string) => value.trim().toLowerCase();

export const normalizeStringList = (value: any) => {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(
      raw
        .map((item: any) => (item || "").toString().trim())
        .filter(Boolean),
    ),
  );
};

export const mergeUniqueStrings = (...lists: any[]) => normalizeStringList(lists.flat());
