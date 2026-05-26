// @ts-nocheck
// Load-list (what to bring) runtime helpers. The static DEFAULT_LOAD_TARGETS list
// lives in config; this file holds the localStorage hydration + rule-matching logic.

import { DEFAULT_LOAD_TARGETS } from "../config";
import type { LoadTarget } from "../config";

// loadTargetsFromStorage — read user-customized list from localStorage, fall back to defaults.
// SSR-safe via the `typeof window` check.
export const loadTargetsFromStorage = (): LoadTarget[] => {
  if (typeof window === "undefined") return DEFAULT_LOAD_TARGETS;
  try {
    const raw = window.localStorage.getItem("noe.loadTargets");
    if (!raw) return DEFAULT_LOAD_TARGETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LoadTarget[];
    return DEFAULT_LOAD_TARGETS;
  } catch { return DEFAULT_LOAD_TARGETS; }
};

// Mapping from a few human-readable interview labels to internal condition flag keys.
// Used by matchLoadTargets to resolve "interview"-type triggers.
const LABEL_TO_COND: Record<string, string> = {
  "Still Wet": "damageWasWet",
  "Visible Mold": "damageMoldMildew",
  "Structural Damage": "structuralDamage",
  "No Electricity": "noLights",
  "No Heat": "noHeat",
  "Boarded Up": "boardedUp",
};

// SMART_TRIGGER_LABELS — friendly labels for the condition flags that drive auto-load-list updates.
// Used by smart-update confirmations to explain "we added X because you turned on Y".
export const SMART_TRIGGER_LABELS: Record<string, string> = {
  noHeat: "No Heat",
  noLights: "No Electricity",
  boardedUp: "Boarded Up",
  damageWasWet: "Still Wet",
  damageMoldMildew: "Visible Mold",
};

// TRIGGER_TYPES — picker options shown in the Settings UI when editing a
// load-target trigger. The `type` strings line up with LoadTrigger["type"]
// (condition / loss / packout / service / interview); changing one here
// without updating the union breaks the dropdown.
export const TRIGGER_TYPES: Array<{ type: LoadTrigger["type"]; label: string }> = [
  { type: "condition", label: "Condition flag" },
  { type: "loss",      label: "Loss type" },
  { type: "packout",   label: "Packout item" },
  { type: "service",   label: "Service" },
  { type: "interview", label: "Interview answer" },
];

// ACTION_TYPE_LABELS — friendly labels for interview-action types in the
// Settings → Interview Actions admin grid. Each key matches an action-type
// dispatched by executeInterviewActions in App.tsx.
export const ACTION_TYPE_LABELS: Record<string, string> = {
  loadList:           "Load List",
  handlingCode:       "Handling Code",
  eventInstruction:   "Event Instruction",
  sdsObservation:     "SDS Observation",
  suggestGroup:       "Suggest Group",
  blocker:            "Blocker",
  contactNote:        "Contact Note",
  addressPlaceholder: "Address Prompt",
  suggestOrderType:   "Order Type",
  openMoldLimit:      "Open Mold Limit",
};

// shouldRetainSharedLoadItem — when a condition flag goes OFF, decide whether to keep the
// shared load item that was added by another still-active flag. Today only "Lights" is shared
// (between noLights and boardedUp); turning one off should NOT remove Lights if the other is on.
export const shouldRetainSharedLoadItem = (fieldKey: string, item: string, nextValue: any, currentData: any) => {
  const nextOn = nextValue === true || nextValue === "Y";
  if (item !== "Lights") return false;
  if (fieldKey === "noLights")  return !nextOn && !!currentData.boardedUp;
  if (fieldKey === "boardedUp") return !nextOn && !!currentData.noLights;
  return false;
};

// matchLoadTargets — given current order data, return the labels of any targets
// whose triggers match. A target is matched if ANY of its triggers fires.
export const matchLoadTargets = (data: any, targets: LoadTarget[] = DEFAULT_LOAD_TARGETS): string[] => {
  const out: string[] = [];
  const conds = (data && data.conditions) || {};
  const losses: string[] = (data && data.orderTypes) || [];
  const packout: string[] = (data && data.packoutSummary) || [];
  const services: string[] = (data && data.serviceOfferings) || [];
  for (const t of targets) {
    let hit = false;
    for (const tr of (t.triggers || [])) {
      if (tr.type === "condition" && conds[tr.value]) { hit = true; break; }
      if (tr.type === "loss" && losses.includes(tr.value)) { hit = true; break; }
      if (tr.type === "packout" && packout.includes(tr.value)) { hit = true; break; }
      if (tr.type === "service" && services.includes(tr.value)) { hit = true; break; }
      if (tr.type === "interview") {
        const key = LABEL_TO_COND[tr.value];
        if (key && conds[key]) { hit = true; break; }
      }
    }
    if (hit) out.push(t.label);
  }
  return out;
};
