// @ts-nocheck
// Instruction helpers — normalize, classify, dedupe, and deterministically pick from a pool.
// Pure functions used by sample-seed data, instruction editors, and panels.

import { INSTRUCTION_TYPES } from "../config";

const INSTRUCTION_TYPE_SET = new Set(INSTRUCTION_TYPES.map((type) => type.toLowerCase()));

// Stable key that ignores case + whitespace for de-dup checks.
export const getInstructionTypeTextKey = (type = "", text = "") =>
  `${(type || "").toString().trim().toLowerCase()}|${(text || "").toString().trim().toLowerCase()}`;

// inferInstructionType — pattern-match an instruction's text to one of the 9 instruction types.
// Falls back to `fallbackType` (default "Communication") if nothing matches.
export const inferInstructionType = (text = "", fallbackType = "Communication") => {
  const normalized = (text || "").toString().trim().toLowerCase();
  if (!normalized) return fallbackType;
  if (/\b(tag|hanger|bins?)\b/.test(normalized)) return "Tagging";
  if (/\b(clean|press|starch|dc\b|machine clean|free & clear|allerg|pets?|reject)\b/.test(normalized)) return "Cleaning";
  if (/\b(box|bag|poly|pack|hanger)\b/.test(normalized)) return "Packing";
  if (/\b(deliver|delivery|cos\b|check\b)\b/.test(normalized)) return "Delivery";
  if (/\b(call|email|text|contact|update|spanish|english|hearing|elderly|primary contact|prefers)\b/.test(normalized)) return "Communication";
  if (/\b(schedule|appointment|send customer|photos?)\b/.test(normalized)) return "Scheduling";
  if (/\b(pickup|pick up|room by room|cost-conscious|rush|ballpark|inventory|required|appliance|electronics|take)\b/.test(normalized)) return "Pickup";
  if (/\b(invoice|bill|estimate|fpp|simbility|xactimate|esx|mika|m i c a|portal|vendor)\b/.test(normalized)) return "Billing";
  if (/\b(payment|pay us|pays us|pay customer|deductible|electronically|direct payment|2-party|1-party|collections?)\b/.test(normalized)) return "Collections";
  return fallbackType;
};

// normalizeInstructionEntry — accept string, {text}, {label}, or {value}; coerce to canonical
// { id, type, text } shape. Empty entries return null.
export const normalizeInstructionEntry = (entry, fallbackType = "Communication") => {
  if (!entry) return null;
  if (typeof entry === "string") {
    const text = entry.trim();
    if (!text) return null;
    return { id: "", type: inferInstructionType(text, fallbackType), text };
  }
  const text = (entry.text || entry.label || entry.value || "").toString().trim();
  if (!text) return null;
  const rawType = (entry.type || "").toString().trim();
  const normalizedType = rawType && INSTRUCTION_TYPE_SET.has(rawType.toLowerCase())
    ? INSTRUCTION_TYPES.find((type) => type.toLowerCase() === rawType.toLowerCase()) || rawType
    : inferInstructionType(text, fallbackType);
  return { id: (entry.id || "").toString(), type: normalizedType, text };
};

export const normalizeInstructionEntries = (entries = [], fallbackType = "Communication") =>
  (Array.isArray(entries) ? entries : [entries])
    .map((entry) => normalizeInstructionEntry(entry, fallbackType))
    .filter(Boolean);

// hashInstructionSeed — simple deterministic hash of a seed string (mod prime).
// Used by pickSeededInstructionEntries to make the seed → pick mapping stable per key.
export const hashInstructionSeed = (value = "") =>
  Array.from((value || "").toString()).reduce(
    (acc, char, index) => (acc + (char.charCodeAt(0) * (index + 1))) % 1000003,
    0,
  );

// pickSeededInstructionEntries — deterministically choose `count` items from `pool`
// using `seedKey` as the seed. Distinct picks; wraps around the pool if seed + step overlap.
export const pickSeededInstructionEntries = (seedKey = "", pool = [], count = 1) => {
  const normalizedPool = normalizeInstructionEntries(pool);
  if (!normalizedPool.length || count <= 0) return [];
  const targetCount = Math.min(count, normalizedPool.length);
  const seed = hashInstructionSeed(seedKey);
  const start = seed % normalizedPool.length;
  const step = normalizedPool.length > 1 ? ((seed % (normalizedPool.length - 1)) + 1) : 1;
  const picks = [];
  const seen = new Set();
  let cursor = start;
  let attempts = 0;
  while (picks.length < targetCount && attempts < normalizedPool.length * 2) {
    const candidate = normalizedPool[cursor % normalizedPool.length];
    const key = getInstructionTypeTextKey(candidate.type, candidate.text);
    if (!seen.has(key)) { seen.add(key); picks.push({ ...candidate, id: "" }); }
    cursor += step;
    attempts += 1;
  }
  return picks;
};

// dedupeInstructionEntries — remove duplicates by (type, text, sourceKind, sourceName).
export const dedupeInstructionEntries = (entries = []) => {
  const seen = new Set();
  return (entries || []).filter((entry) => {
    const key = [
      (entry.type || "").toLowerCase(),
      (entry.text || "").toLowerCase(),
      (entry.sourceKind || "").toLowerCase(),
      (entry.sourceName || "").toLowerCase(),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const mergeInstructionEntries = (...groups) =>
  dedupeInstructionEntries(groups.flatMap((group) => normalizeInstructionEntries(group || [])));

export const getInstructionIdentity = (entry = {}) =>
  (entry.id || `${(entry.type || "").toString().trim().toLowerCase()}|${(entry.text || "").toString().trim().toLowerCase()}`).toString();
