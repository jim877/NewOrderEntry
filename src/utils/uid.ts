// @ts-nocheck
// safeUid — crypto-backed UUID with a base36 timestamp fallback for older browsers.
export function safeUid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* fallback */ }
  return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}
