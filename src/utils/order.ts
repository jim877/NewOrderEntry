// @ts-nocheck
// Lightweight order-shape helpers: presence checks, placeholder flags, header-toggle DOM helper.
// Pure (modulo `Element` for DOM matching). No React, no setState.

// summarizeConditions — comma-joined list of currently-active condition flags from the order data.
// Used as the "Conditions: ..." line in event instructions and as a small badge elsewhere.
export const summarizeConditions = (data: any) => {
  const items: string[] = [];
  if (data?.damageWasWet === "Y" || data?.damageWasWet === true) items.push("Still Wet");
  if (data?.damageMoldMildew) items.push("Visible Mold");
  if (data?.structuralElectricDamage === "Y") items.push("Structural Damage");
  if (data?.noLights) items.push("No Electricity");
  if (data?.noHeat) items.push("No Heat");
  if (data?.boardedUp) items.push("Boarded Up");
  return items.join(", ");
};

// createPlaceholderFlag — construct a fresh placeholder marker { active, kind, reason, createdAt }.
export const createPlaceholderFlag = (kind: string, reason = "") => ({
  active: true,
  kind,
  reason,
  createdAt: new Date().toISOString(),
});

export const isPlaceholderFlagActive = (flag: any) => !!flag && flag.active !== false;

export const hasMeaningfulValue = (value: any) => !!(value || "").toString().trim();

export const hasCustomerDetails = (customer: any = {}) =>
  [customer.first, customer.last, customer.phone, customer.email, customer.type].some(hasMeaningfulValue);

// isHeaderToggleIgnoredTarget — when a click bubbles up to a section header that
// also acts as a toggle, ignore the toggle if the click originated on an interactive
// child (button, input, etc.) or anything marked with data-header-toggle-ignore.
export const isHeaderToggleIgnoredTarget = (target: any) => {
  if (!(target instanceof Element)) return false;
  return !!target.closest('button, input, select, textarea, a, [role="button"], [data-header-toggle-ignore="true"]');
};

// summarizeAddress — one-line "street, city, state zip" string or "No address yet".
export const summarizeAddress = (addr: any = {}) => {
  const parts = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean);
  return parts.length ? parts.join(", ") : "No address yet";
};

// formatOrderAddressLine — same idea but includes `apt`. Returns "" (not "No address yet")
// when nothing's filled in — callers expect to test for truthiness.
export const formatOrderAddressLine = (addr: any = {}) =>
  [addr.street, addr.apt, addr.city, addr.state, addr.zip].filter(Boolean).join(", ");

// formatOrderAddressChoiceLabel — "Primary — 123 Main St, ...". Falls back to "TBD" when blank.
export const formatOrderAddressChoiceLabel = (addr: any = {}, idx = 0) => {
  const type = addr.type || `Address ${idx + 1}`;
  const line = formatOrderAddressLine(addr);
  return `${type} — ${line || "TBD"}`;
};

// isAddressPlaceholder — address is a placeholder if its placeholder flag is on,
// street is empty, street says "TBD", or type contains "placeholder".
export const isAddressPlaceholder = (addr: any = {}) => {
  if (isPlaceholderFlagActive(addr?.placeholder)) return true;
  const street = (addr?.street || "").trim();
  const type = (addr?.type || "").trim().toLowerCase();
  if (!street) return true;
  return street.toUpperCase() === "TBD" || type.includes("placeholder");
};

// useCurrentLocation — geolocation lookup. Not a hook (despite the name); call directly
// with onResult/onError callbacks. Kept as a function for backwards compatibility.
export const useCurrentLocation = (
  onResult: (coords: { lat: number; lng: number }) => void,
  onError?: (msg: string) => void,
) => {
  if (!navigator.geolocation) { onError?.("Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => onResult({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    (err) => onError?.(err.message || "Location unavailable"),
    { enableHighAccuracy: true, timeout: 10000 },
  );
};
