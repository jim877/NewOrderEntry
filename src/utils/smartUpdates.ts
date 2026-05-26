// @ts-nocheck
// Pure logic for the "smart updates" cascade that fires when a condition
// flag (still wet / mold / no heat / no lights / boarded up) toggles.
// Each toggle: pulls in / pushes out linked loadList items + handling
// codes + (for mold) order types. The React glue at the call site
// stays in App.tsx — this module handles the deterministic add/remove
// shape derivation and the final reducer over `prev`.

import { shouldRetainSharedLoadItem } from "./loadTargets";

// Reason text shown in the "Bring: X, Y added because <reason>"
// SmartNotification toast. Falls back to "condition selected" via the
// caller when the key isn't mapped.
export const SMART_TRIGGER_REASONS: Record<string, string> = {
  damageWasWet: "Still Wet",
  damageMoldMildew: "Visible Mold",
  noHeat: "No Heat",
  noLights: "No Electricity",
  boardedUp: "Boarded Up",
};

export const smartIsOn = (v: any) => v === true || v === "Y";
export const smartIsOff = (v: any) => v === false || v === "N" || v === "" || v === null;

// computeSmartUpdateAdds — for the on-toggle direction, return the
// loadList items and handling codes that should be added when (k, v)
// fires. Each item is filtered against the current set so duplicates
// don't re-enter.
export const computeSmartUpdateAdds = (
  k: string,
  v: any,
  currentLoadList: Set<string>,
  currentHandling: Set<string>,
): { loadListAdded: string[]; addHandling: string[] } => {
  const loadListAdded: string[] = [];
  const addHandling: string[] = [];
  const isOn = smartIsOn(v);

  if (k === "noHeat" && isOn && !currentLoadList.has("Heater")) loadListAdded.push("Heater");
  if ((k === "noLights" && isOn) || (k === "boardedUp" && isOn)) {
    if (!currentLoadList.has("Lights")) loadListAdded.push("Lights");
  }
  if (k === "damageWasWet" && isOn && !currentLoadList.has("Plastic Bags")) loadListAdded.push("Plastic Bags");
  if (k === "damageMoldMildew" && isOn && !currentLoadList.has("Tyvek")) loadListAdded.push("Tyvek");

  if (k === "damageWasWet" && isOn) addHandling.push("Wet");
  if (k === "damageMoldMildew" && isOn) addHandling.push("PPE");

  return { loadListAdded, addHandling };
};

// computeSmartUpdateRemovals — for the off-toggle direction, return
// the loadList / handling-code / orderType candidates the call site
// should ask the user to remove (or auto-remove for auto-added types).
// Returns empty arrays when v is not "off".
export const computeSmartUpdateRemovals = (
  k: string,
  v: any,
  currentLoadList: Set<string>,
  currentHandling: Set<string>,
  currentOrderTypes: Set<string>,
  data: any,
): { load: string[]; handling: string[]; orderTypes: string[] } => {
  if (!smartIsOff(v)) return { load: [], handling: [], orderTypes: [] };

  const candidates: { load: string[]; handling: string[]; orderTypes: string[] } = {
    load: [],
    handling: [],
    orderTypes: [],
  };
  if (k === "noHeat") candidates.load.push("Heater");
  if (k === "noLights" || k === "boardedUp") candidates.load.push("Lights");
  if (k === "damageWasWet") {
    candidates.load.push("Plastic Bags");
    candidates.handling.push("Wet");
  }
  if (k === "damageMoldMildew") {
    candidates.load.push("Tyvek");
    candidates.handling.push("PPE");
    candidates.orderTypes.push("Mold");
  }
  // If Mold remains selected, PPE is still auto-required elsewhere.
  if (k === "damageMoldMildew" && currentOrderTypes.has("Mold")) {
    candidates.handling = candidates.handling.filter((code) => code !== "PPE");
  }

  return {
    load: candidates.load.filter((item) => {
      if (!currentLoadList.has(item)) return false;
      if (shouldRetainSharedLoadItem(k, item, v, data)) return false;
      return true;
    }),
    handling: candidates.handling.filter((code) => currentHandling.has(code)),
    orderTypes: candidates.orderTypes.filter((type) => currentOrderTypes.has(type)),
  };
};

// applySmartUpdateReducer — pure reducer that writes the new field
// value + the additive loadList/handlingCodes/orderTypes patches into
// `prev`. The Mold order-type cascade lives here (turning on
// damageMoldMildew auto-adds "Mold" to orderTypes + autoAddedOrderTypes
// when it wasn't already selected).
export const applySmartUpdateReducer = (
  prev: any,
  k: string,
  v: any,
  loadListAdded: string[],
  addHandling: string[],
) => {
  const isOn = smartIsOn(v);
  const newData: any = { ...prev, [k]: v };
  const newLoadList = new Set(prev.loadList || []);
  loadListAdded.forEach((i) => newLoadList.add(i));
  newData.loadList = Array.from(newLoadList);
  if (k === "damageMoldMildew" && isOn && !(prev.orderTypes || []).includes("Mold")) {
    newData.orderTypes = [...(prev.orderTypes || []), "Mold"];
    newData.autoAddedOrderTypes = [...(prev.autoAddedOrderTypes || []), "Mold"];
  }
  if (addHandling.length) {
    const handling = new Set(prev.handlingCodes || []);
    addHandling.forEach((c) => handling.add(c));
    newData.handlingCodes = Array.from(handling);
  }
  return newData;
};

// applySmartRemovalReducer — pure reducer for the user-confirmed
// removal action triggered by the SmartConfirm dialog. Removes the
// passed-in loadList items, handling codes, and manual orderTypes
// from prev.
export const applySmartRemovalReducer = (
  prev: any,
  removals: { load: string[]; handling: string[]; orderTypes: string[] },
) => {
  const next: any = { ...prev };
  if (removals.load.length) {
    const list = new Set(prev.loadList || []);
    removals.load.forEach((item) => list.delete(item));
    next.loadList = Array.from(list);
  }
  if (removals.handling.length) {
    const handling = new Set(prev.handlingCodes || []);
    removals.handling.forEach((code) => handling.delete(code));
    next.handlingCodes = Array.from(handling);
  }
  if (removals.orderTypes.length) {
    next.orderTypes = (prev.orderTypes || []).filter((type: string) => !removals.orderTypes.includes(type));
  }
  return next;
};
