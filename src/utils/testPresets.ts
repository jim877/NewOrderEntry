// Test-preset persistence — the Settings → Test Presets panel saves and loads
// snapshots of the order shape via localStorage. Pure (modulo the browser
// localStorage call). Used by App() to hydrate the testPresets useState and
// keep storage in sync.

import { SAMPLE_PRESET_DATA } from "../data/samplePreset";

export const TEST_PRESETS_KEY = "noe-test-presets";

export type TestPreset = {
  id: string;
  name: string;
  createdAt: string;
  data: any;
  scopePhotos?: any;
};

// buildSampleTestPreset — the "Sample Order (Auto)" entry seeded when the
// user has no saved presets yet. Re-runs SAMPLE_PRESET_DATA() each call so a
// fresh createdAt + ids land on every hydration.
export const buildSampleTestPreset = (): TestPreset => ({
  id: "preset-sample",
  name: "Sample Order (Auto)",
  createdAt: new Date().toISOString(),
  data: SAMPLE_PRESET_DATA(),
});

// loadTestPresetsFromStorage — hydrate the testPresets list. Returns the
// saved array when present and non-empty; otherwise returns a single-element
// array containing the sample preset. Always returns the sample preset on
// any error (parse failure, storage unavailable) so the UI is never empty.
export const loadTestPresetsFromStorage = (): TestPreset[] => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(TEST_PRESETS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as TestPreset[];
    }
  } catch { /* fall through to seed */ }
  return [buildSampleTestPreset()];
};

// saveTestPresetsToStorage — JSON-serialize + write. Swallows storage errors
// (e.g. quota exceeded, private mode) since presets are convenience-only.
export const saveTestPresetsToStorage = (presets: TestPreset[]): void => {
  try { localStorage.setItem(TEST_PRESETS_KEY, JSON.stringify(presets)); } catch { /* storage unavailable */ }
};

// upsertTestPresetByName — pure reducer for saveTestPreset. Replace any
// existing entry with the same case-insensitive name (preserving its id), or
// prepend the new one so the most recent appears first.
export const upsertTestPresetByName = (prev: TestPreset[], payload: TestPreset): TestPreset[] => {
  const existingIndex = prev.findIndex((p) => p.name.toLowerCase() === payload.name.toLowerCase());
  if (existingIndex >= 0) {
    const next = [...prev];
    next[existingIndex] = { ...payload, id: prev[existingIndex].id };
    return next;
  }
  return [payload, ...prev];
};
