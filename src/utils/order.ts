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
