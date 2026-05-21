// @ts-nocheck
// Central config loader. All help text, tooltips, feature flags, and rule-driven data
// live in /config.json. UI modules import typed views from this file — never inline.
import config from "../config.json";

// --- Help / coaching text ---
export const DEFAULT_COACHING: Record<string, string> = config.coaching;

// Derived views over DEFAULT_COACHING — strip the prefix so callers can look up by bare key.
const stripPrefix = (prefix: string): Record<string, string> =>
  Object.fromEntries(
    Object.keys(DEFAULT_COACHING)
      .filter((k) => k.startsWith(prefix))
      .map((k) => [k.replace(prefix, ""), DEFAULT_COACHING[k]]),
  );
export const LOSS_TYPE_COACHING:    Record<string, string> = stripPrefix("loss.");
export const ROLE_COACHING:         Record<string, string> = stripPrefix("role.");
export const SUGGESTED_GROUP_HELP:  Record<string, string> = stripPrefix("group.");
export const SERVICE_OFFERING_HELP: Record<string, string> = stripPrefix("service.");

// Coaching accessor — checks user overrides (localStorage) then defaults.
export const getCoaching = (key: string, overrides?: Record<string, string>): string => {
  if (overrides?.[key] !== undefined) return overrides[key];
  return DEFAULT_COACHING[key] || "";
};

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

// --- Order pick-lists (states, types, statuses, vendor seeds) ---
export const STATES: string[]                = config.lists.states;
export const CUSTOMER_TYPES: string[]        = config.lists.customerTypes;
export const ORDER_STATUSES: string[]        = config.lists.orderStatuses;
export const MEETING_TYPES: string[]         = config.lists.meetingTypes;
export const DEFAULT_COMPANIES: string[]     = config.lists.defaultCompanies;
export const DEFAULT_CONTACTS: string[]      = config.lists.defaultContacts;
export const SALES_REPS: string[]            = config.lists.salesReps;
export const SERVICE_OFFERINGS: string[]     = config.lists.serviceOfferings;
export const SERVICE_SUB_CATEGORIES: Record<string, string[]> = config.lists.serviceSubCategories;
export const SUGGESTED_GROUPS: string[]      = config.lists.suggestedGroups;
export const LIVING_STATUS_ADDRESS_TYPES: string[] = config.lists.livingStatusAddressTypes;

// --- Handling-code meta + insurance-eligible types ---
export const HANDLING_META: [string, string][] = config.lists.handlingMeta;
export const INSURANCE_ELIGIBLE_COMPANY_TYPES: Set<string> = new Set(config.lists.insuranceEligibleCompanyTypes);
export const PICKUP_DEPARTMENTS: Record<string, string[]> = config.lists.pickupDepartments;
export const SCOPE_WIZARD_STEP_TOASTS: Record<string, string> = config.lists.scopeWizardStepToasts;
export const PHOTO_REASONS: string[] = config.lists.photoReasons;
export const PHOTO_SUB_MAP: Record<string, string[]> = config.lists.photoSubMap;
export const QUICK_COMPANY_TYPES: string[] = config.lists.quickCompanyTypes;

// --- Field config (sections + per-field defaults) ---
export type FieldConfigSection = { id: string; label: string };
export type FieldConfigEntry = {
  label: string;
  section: string;
  category: string;
  requiredInAudit: boolean;
  requiredAtStatus: string;
  visible: boolean;
  coaching?: string;
  selectType?: string;
  checkFn?: string;
  dataPath?: string;
  condition?: { field: string; equals?: string; oneOf?: string[]; includes?: string };
};
export const FIELD_CONFIG_SECTIONS: FieldConfigSection[] = config.lists.fieldConfigSections;
export const DEFAULT_FIELD_CONFIG: Record<string, FieldConfigEntry> = config.lists.defaultFieldConfig;

// --- Order instructions ---
export const INSTRUCTION_TYPES: string[] = config.lists.instructionTypes;
export const ORDER_INSTRUCTION_PRESETS: Record<string, string[]> = config.lists.orderInstructionPresets;

// --- Bridge (Scope Update / Blockers) ---
export type BridgeStepOption = { id: string; label: string; tone: string };
export type BridgeMilestoneField = { id: string; atId: string; byId: string; label: string };
export type BridgeBlockerGroup = { id: string; label: string; issues: string[] };

export const SPECIAL_PAPERWORK_BLOCKER: string  = config.lists.bridge.specialPaperworkBlocker;
export const UNKNOWN_INSURANCE_BLOCKER: string  = config.lists.bridge.unknownInsuranceBlocker;
export const BRIDGE_CUSTOMER_BLOCKERS: string[] = config.lists.bridge.customerBlockers;
export const BRIDGE_INSURANCE_BLOCKERS: string[] = config.lists.bridge.insuranceBlockers;
export const BRIDGE_BLOCKER_ALIASES: Record<string, string> = config.lists.bridge.blockerAliases;
export const BRIDGE_AUTO_MANAGED_BLOCKERS: string[] = config.lists.bridge.autoManagedBlockers;
export const BRIDGE_PICKUP_STEP_OPTIONS: BridgeStepOption[]   = config.lists.bridge.pickupStepOptions;
export const BRIDGE_PROCESS_STEP_OPTIONS: BridgeStepOption[]  = config.lists.bridge.processStepOptions;
export const BRIDGE_DELIVERY_STEP_OPTIONS: BridgeStepOption[] = config.lists.bridge.deliveryStepOptions;
export const BRIDGE_MILESTONE_FIELDS: BridgeMilestoneField[]  = config.lists.bridge.milestoneFields;

// Derived view: blocker groups by category. Built once at module load.
export const BRIDGE_BLOCKER_GROUPS: BridgeBlockerGroup[] = [
  { id: "customer",            label: "Customer",            issues: BRIDGE_CUSTOMER_BLOCKERS },
  { id: "insurance_adjuster",  label: "Insurance/Adjuster",  issues: BRIDGE_INSURANCE_BLOCKERS },
];
export const BRIDGE_BLOCKER_ITEMS: string[] = [
  ...BRIDGE_CUSTOMER_BLOCKERS,
  ...BRIDGE_INSURANCE_BLOCKERS,
];

// --- Header progress nav ---
export type HeaderSubsection = { id: string; label: string };
export type HeaderStep = { id: string; label: string; subsections: HeaderSubsection[] };
export const HEADER_STEPS: HeaderStep[] = config.lists.headerSteps;

// --- Global search items (used by GlobalSearch) ---
export type GlobalSearchItem = {
  id: string;
  sub?: string;
  label: string;
  keywords: string;
  navAction?: string;
  actionHit?: string;
};
export const GLOBAL_SEARCH_ITEMS: GlobalSearchItem[] = config.lists.globalSearchItems;
