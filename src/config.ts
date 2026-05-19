// @ts-nocheck
// Central config loader. All help text, tooltips, feature flags, and rule-driven data
// live in /config.json. UI modules import typed views from this file — never inline.
import config from "../config.json";

// --- Help / coaching text ---
export const DEFAULT_COACHING: Record<string, string> = config.coaching;

// --- Loading list (what to bring) ---
export type LoadTrigger =
  | { type: "condition"; value: string }
  | { type: "loss"; value: string }
  | { type: "packout"; value: string }
  | { type: "service"; value: string }
  | { type: "interview"; value: string };

export type LoadTarget = {
  id: string;
  label: string;
  category: string;
  triggers: LoadTrigger[];
  description?: string;
};

export const DEFAULT_LOAD_TARGETS: LoadTarget[] = config.loadTargets;

// --- Rush Guide config ---
export type RushRepairTimeline = { id: string; label: string; days: number; group: string };
export type RushLivingSituation = { id: string; label: string; desc: string };
export type RushEventType = { id: string; label: string };
export type RushInterest = { id: string; label: string; desc: string };
export type RushSeason = { name: string; months: number[] };

export const RUSH_REPAIR_TIMELINES: RushRepairTimeline[] = config.rushGuide.repairTimelines;
export const RUSH_LIVING_SITUATIONS: RushLivingSituation[] = config.rushGuide.livingSituations;
export const RUSH_EVENT_TYPES: RushEventType[] = config.rushGuide.eventTypes;
export const RUSH_INTERESTS: RushInterest[] = config.rushGuide.interests;
export const RUSH_SEASONS: Record<string, RushSeason> = config.rushGuide.seasons;
