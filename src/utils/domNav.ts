// DOM-level navigation helpers used by Detailed mode section toggles and the
// audit/search jump utilities. All pure (no React, no closure deps) — they
// reach into document and window directly. Kept together because they share
// the same focusable-selector and viewport math.

// Tailwind-y selector for focusable controls inside a section root.
const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// focusFirstFieldInSection — focus the first interactive control inside the
// element with the given id. Silently no-ops if the section or any focusable
// is missing.
export const focusFirstFieldInSection = (sectionKey: string): void => {
  const section = document.getElementById(sectionKey);
  if (!section) return;
  const firstFocusable = section.querySelector(FOCUSABLE_SELECTOR);
  if (firstFocusable instanceof HTMLElement) firstFocusable.focus();
};

// focusLastFieldInSection — mirror of focusFirstFieldInSection for the last
// focusable. Used by "shift-tab into previous section" / reverse-jump paths.
export const focusLastFieldInSection = (sectionKey: string): void => {
  const section = document.getElementById(sectionKey);
  if (!section) return;
  const focusables = Array.from(section.querySelectorAll(FOCUSABLE_SELECTOR));
  const last = focusables[focusables.length - 1];
  if (last instanceof HTMLElement) last.focus();
};

// scrollToSection — smooth-scroll the window so the named element sits ~120px
// from the top (room for the sticky header). No-op if the id isn't in the DOM.
export const scrollToSection = (key: string): void => {
  const el = document.getElementById(key);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 120;
  window.scrollTo({ top: y, behavior: "smooth" });
};

// animateNavigationFocus — restart the .animate-nav-focus glow animation on
// the given element. The class is toggled off + reflow + on so re-clicking the
// same target replays the animation (otherwise CSS skips the second run).
export const animateNavigationFocus = (el: unknown): void => {
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove("animate-nav-focus");
  // Force reflow so the next add restarts the animation.
  void el.offsetWidth;
  el.classList.add("animate-nav-focus");
};
