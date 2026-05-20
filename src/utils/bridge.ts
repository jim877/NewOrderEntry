// @ts-nocheck
// Bridge (Scope Update / Blockers) helpers.

import { BRIDGE_BLOCKER_ALIASES } from "../config";

// canonicalBridgeIssue — map an alias/legacy issue label to the canonical one,
// or return the input unchanged if no alias is found.
export const canonicalBridgeIssue = (issue: string = "") => BRIDGE_BLOCKER_ALIASES[issue] || issue;

// bridgeStageToneClass — tailwind classes for a bridge stage button given its tone + active flag.
// Tones: green (go), yellow (priority), red (hold). Falls back to sky for unknown tones.
export const bridgeStageToneClass = (tone: string, active: boolean) => {
  if (tone === "green")  return active ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300";
  if (tone === "yellow") return active ? "border-amber-300 bg-amber-100 text-amber-800"      : "border-slate-200 bg-white text-slate-700 hover:border-amber-300";
  if (tone === "red")    return active ? "border-rose-300 bg-rose-100 text-rose-800"         : "border-slate-200 bg-white text-slate-700 hover:border-rose-300";
  return active ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300";
};
