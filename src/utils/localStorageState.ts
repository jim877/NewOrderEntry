// Generic localStorage hydration helpers. Pure (modulo the browser
// localStorage call), SSR-safe via the typeof check. Used by App.tsx's
// useState initializers to load saved fieldConfig / blockerRules /
// interviewActions / etc. without each one re-implementing the same
// try/catch/parse boilerplate.

// loadJsonFromStorage — read a JSON-serialized value at `key`, falling back
// to `fallback()` on missing, parse error, or any thrown exception. The
// fallback is a factory so callers don't accidentally share a mutable
// default across hydrations.
export const loadJsonFromStorage = <T>(key: string, fallback: () => T): T => {
  try {
    if (typeof localStorage === "undefined") return fallback();
    const s = localStorage.getItem(key);
    if (!s) return fallback();
    return JSON.parse(s) as T;
  } catch { return fallback(); }
};

// loadMergedRecordFromStorage — variant for "defaults override-merged with
// saved" shape (fieldConfig / interviewActions): start from a fresh clone of
// the defaults, then shallow-merge each saved key's properties on top. Saved
// keys that don't exist in defaults are skipped — keeps removed/renamed
// keys from leaking back in.
export const loadMergedRecordFromStorage = <V>(
  key: string,
  defaults: Record<string, V>,
): Record<string, V> => {
  const merged: Record<string, V> = { ...defaults };
  try {
    if (typeof localStorage === "undefined") return merged;
    const s = localStorage.getItem(key);
    if (!s) return merged;
    const saved = JSON.parse(s) as Record<string, V>;
    Object.keys(merged).forEach((k) => {
      if (saved[k]) merged[k] = { ...(merged[k] as any), ...(saved[k] as any) } as V;
    });
    return merged;
  } catch { return { ...defaults }; }
};
