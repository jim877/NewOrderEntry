// Shared Tailwind classes for pill-style toggle buttons.
// Used by ToggleMulti and ToggleGroup.

export const pillBase =
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 cursor-pointer select-none";

export const pillInactive =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";

export const pillActive =
  "bg-sky-50 border-sky-300 text-sky-700 font-bold shadow-sm";
