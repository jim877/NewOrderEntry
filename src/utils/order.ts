// @ts-nocheck
// Lightweight order-shape helpers: presence checks, placeholder flags, header-toggle DOM helper.
// Pure (modulo `Element` for DOM matching). No React, no setState.

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
