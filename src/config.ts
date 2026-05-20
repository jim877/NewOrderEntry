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

// --- Simple lists / pick-list constants ---
export const LOSS_TYPES: string[]                 = config.lists.lossTypes;
export const NON_RESTORATION_PRIMARY: string      = config.lists.nonRestorationPrimary;
export const NON_RESTORATION_SUBTYPES: string[]   = config.lists.nonRestorationSubtypes;
export const ORIGINS: string[]                    = config.lists.origins;
export const ESTIMATE_TYPES: string[]             = config.lists.estimateTypes;
export const PRICING_PLATFORMS: string[]          = config.lists.pricingPlatforms;
export const TECHS: string[]                      = config.lists.techs;
export const VEHICLES: string[]                   = config.lists.vehicles;
export const LEAD_SOURCES: string[]               = config.lists.leadSources;
export const CONTACT_METHODS: string[]            = config.lists.contactMethods;
export const MARKETING_SOURCES: string[]          = config.lists.marketingSources;
export const INTERNAL_TYPES: string[]             = config.lists.internalTypes;
export const CUSTOMER_QUICK_NOTES: string[]       = config.lists.customerQuickNotes;
export const NATIONAL_CARRIERS: string[]          = config.lists.nationalCarriers;
export const LOAD_ITEMS: string[]                 = config.lists.loadItems;
export const QUALITY_CODES: string[]              = config.lists.qualityCodes;
export const SEVERITY_GROUPS: string[]            = config.lists.severityGroups;
export const SEVERITY_LEVELS: string[]            = config.lists.severityLevels;
export const CAUSES: Record<string, string[]>     = config.lists.causes;
export const COMPATIBLE_SECONDARY_LOSS: Record<string, string[]> = config.lists.compatibleSecondaryLoss;
export const PACKOUT_LOAD_MAP: Record<string, string[]>          = config.lists.packoutLoadMap;
export type CoachingCategory = { key: string; label: string; prefix: string };
export const COACHING_CATEGORIES: CoachingCategory[] = config.lists.coachingCategories;

// --- Blockers / rules ---
export type BlockerRule = { id: string; enabled: boolean; trigger: string; blockerText: string };
export const DEFAULT_BLOCKER_RULES: BlockerRule[] = config.blockerRules;

// --- Interview answer actions (per-answer coaching + auto-actions) ---
export type InterviewAction =
  | { type: "loadList"; value: string }
  | { type: "handlingCode"; value: string }
  | { type: "eventInstruction"; value: string }
  | { type: "sdsObservation"; value: string }
  | { type: "suggestGroup"; value: string }
  | { type: "blocker"; value: string }
  | { type: "contactNote"; value: string }
  | { type: "addressPlaceholder"; value: string }
  | { type: "suggestOrderType"; value: string }
  | { type: "openMoldLimit" };

export type InterviewActionConfig = { coaching: string; actions: InterviewAction[] };
export const DEFAULT_INTERVIEW_ACTIONS: Record<string, InterviewActionConfig> = config.interviewActions;

// --- Company / contact / SDS seed data ---
export type CompanyRoleDef = {
  id: string;
  label: string;
  isCore: boolean;
  type: string;
  source?: string;
  contactSource?: string;
};
export type ContactRoleBadge = { id: string; title: string };

export const COMPANY_TYPES: string[]                 = config.lists.companyTypes;
export const COMPANY_ROLE_DEFS: CompanyRoleDef[]     = config.lists.companyRoleDefs;
export const CONTACT_ROLE_BADGES: ContactRoleBadge[] = config.lists.contactRoleBadges;
export const SDS_CONSIDERATIONS: string[]            = config.lists.sdsConsiderations;
export const SDS_OBSERVATIONS: string[]              = config.lists.sdsObservations;
export const SDS_SERVICES: string[]                  = config.lists.sdsServices;
export const SDS_ICON_MAP: Record<string, string>            = config.lists.sdsIconMap;
export const SDS_ICON_CLASS_OVERRIDES: Record<string, string> = config.lists.sdsIconClassOverrides;
export const QUICK_INSTRUCTION_NOTES: string[]       = config.lists.quickInstructionNotes;
export const LEAD_SOURCE_HELP: Record<string, string> = config.lists.leadSourceHelp;

// --- AI usage guidance ---
export const AI_USAGE_GUIDELINES: string[] = config.lists.aiUsageGuidelines;
export const AI_TIME_SAVING_TIPS: string[]  = config.lists.aiTimeSavingTips;
