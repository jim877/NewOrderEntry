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

// Escape a string so it's safe to embed inside a `new RegExp(...)` literal.
export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Equality on normalized company/contact strings (case-insensitive, trimmed).
// Returns false if either side is empty (avoids "" === "" treating empty as a match).
export const sameNormalizedCompany = (left = "", right = "") => {
  const a = normalizeCompany(left || "");
  const b = normalizeCompany(right || "");
  return !!a && !!b && a === b;
};
export const sameNormalizedContact = (left = "", right = "") => {
  const a = normalizeContact(left || "");
  const b = normalizeContact(right || "");
  return !!a && !!b && a === b;
};

// normalizePlaceholderKeyPart — slug-ify any value into a dash-joined token suitable for a key.
// "Bill To Address" → "bill-to-address". Empty input returns "item".
export const normalizePlaceholderKeyPart = (value: string = "") =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
