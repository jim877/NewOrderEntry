// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import SameDayScope from './SameDayScope';
import SdsDocument from './SdsDocument';
import { CreditCard, Globe, Lock, LockOpen, Shield, SquarePen, Tag, UserRound } from 'lucide-react';
import {
  buildScopeBridgeSnippet,
  createScopeBridgeState,
  normalizeScopeBridgeState,
  withScopeBridgeSnippet,
} from './scopeBridgeUtils';
import {
  DEFAULT_COACHING,
  LOSS_TYPE_COACHING,
  ROLE_COACHING,
  SUGGESTED_GROUP_HELP,
  SERVICE_OFFERING_HELP,
  getCoaching,
  DEFAULT_LOAD_TARGETS,
  RUSH_REPAIR_TIMELINES,
  RUSH_LIVING_SITUATIONS,
  RUSH_EVENT_TYPES,
  RUSH_INTERESTS,
  RUSH_SEASONS,
  LOSS_TYPES,
  NON_RESTORATION_PRIMARY,
  NON_RESTORATION_SUBTYPES,
  ORIGINS,
  ESTIMATE_TYPES,
  PRICING_PLATFORMS,
  TECHS,
  VEHICLES,
  LEAD_SOURCES,
  CONTACT_METHODS,
  MARKETING_SOURCES,
  INTERNAL_TYPES,
  CUSTOMER_QUICK_NOTES,
  NATIONAL_CARRIERS,
  LOAD_ITEMS,
  QUALITY_CODES,
  SEVERITY_GROUPS,
  SEVERITY_LEVELS,
  CAUSES,
  COMPATIBLE_SECONDARY_LOSS,
  PACKOUT_LOAD_MAP,
  COACHING_CATEGORIES,
  DEFAULT_BLOCKER_RULES,
  DEFAULT_INTERVIEW_ACTIONS,
  COMPANY_TYPES,
  COMPANY_ROLE_DEFS,
  CONTACT_ROLE_BADGES,
  STATES,
  CUSTOMER_TYPES,
  ORDER_STATUSES,
  MEETING_TYPES,
  DEFAULT_COMPANIES,
  DEFAULT_CONTACTS,
  SALES_REPS,
  SERVICE_OFFERINGS,
  SERVICE_SUB_CATEGORIES,
  SUGGESTED_GROUPS,
  LIVING_STATUS_ADDRESS_TYPES,
  SPECIAL_PAPERWORK_BLOCKER,
  UNKNOWN_INSURANCE_BLOCKER,
  BRIDGE_CUSTOMER_BLOCKERS,
  BRIDGE_INSURANCE_BLOCKERS,
  BRIDGE_BLOCKER_GROUPS,
  BRIDGE_BLOCKER_ITEMS,
  BRIDGE_BLOCKER_ALIASES,
  BRIDGE_AUTO_MANAGED_BLOCKERS,
  BRIDGE_PICKUP_STEP_OPTIONS,
  BRIDGE_PROCESS_STEP_OPTIONS,
  BRIDGE_DELIVERY_STEP_OPTIONS,
  BRIDGE_MILESTONE_FIELDS,
  FIELD_CONFIG_SECTIONS,
  DEFAULT_FIELD_CONFIG,
  HANDLING_META,
  INSURANCE_ELIGIBLE_COMPANY_TYPES,
  PICKUP_DEPARTMENTS,
  SCOPE_WIZARD_STEP_TOASTS,
  PHOTO_REASONS,
  PHOTO_SUB_MAP,
  QUICK_COMPANY_TYPES,
  SECTION_ORDER,
  ORDER_ADDRESS_TYPES,
  SDS_CONSIDERATIONS,
  SDS_OBSERVATIONS,
  SDS_SERVICES,
  SDS_ICON_MAP,
  SDS_ICON_CLASS_OVERRIDES,
  QUICK_INSTRUCTION_NOTES,
  LEAD_SOURCE_HELP,
} from './config';
import type { LoadTarget, LoadTrigger } from './config';
import {
  ACTUAL_COMPANY_INSTRUCTION_LIBRARY,
  ACTUAL_CONTACT_INSTRUCTION_LIBRARY,
  SAMPLE_CONTACTS,
} from './data/sampleSeed';
import { StartScreen } from './components/screens/StartScreen';
import {
  Field,
  Input,
  Select,
  Textarea,
  AutoGrowTextarea,
  ToggleMulti,
  ToggleGroup,
  SubSection,
  EditAffordance,
  AssignmentCueStrip,
  LinkedAssignmentPanel,
  pillBase,
  pillActive,
  pillInactive,
  Chevron,
  Switch,
  ToastItem,
  ToastStack,
  SmartNotification,
  DatePicker,
  TimePicker,
  SearchSelect,
  GlobalSearch,
  FloatingCapsule,
  Section,
  Header,
  EntityPreferencePanel,
  RoleIcon,
  RoleBadge,
  CustomerItem,
  AddressItem,
  LeadInfoFields,
  BuildingIcon,
  SaveSummaryPreview,
  TestPresetsModal,
  AddNewSystemModal,
  OrderInstructionModal,
  AlertModal,
  SmartConfirmModal,
  RoleAssignModal,
  QuickAddModal,
  ReminderModal,
  EditContactModal,
  LivingAddressPrompt,
  GroupLinkModal,
  CrmLogModal,
  PlanOfActionModal,
  WelcomeMessageModal,
  SdsQuestionnaireModal,
  GlobalDirectoryModal,
  ConfirmAppointmentModal,
  OutboundActionsPanel,
  SaveSummaryGates,
  SaveSummaryActions,
  CoachingConfigCard,
  LoadingListConfigCard,
  InterviewActionsConfigCard,
  FieldConfigGrid,
  BlockerRulesCard,
  FieldConfigToolbar,
} from './components/atoms';
import { getInitials, splitName, getRepInitials } from './utils/names';
import { getOptionText, getBestMatch } from './utils/search';
import { canonicalBridgeIssue, bridgeStageToneClass } from './utils/bridge';
import {
  getNonRestorationSubtype,
  isNonRestorationSelected,
  hasRestorationOrderType,
  projectTypeFromOrderTypes,
  hasPrimaryOrderTypeDecision,
  hasRequiredNonRestorationSubtype,
  normalizeOrderTypes,
  toggleNonRestorationPrimarySelection,
  toggleRestorationTypeSelection,
  selectNonRestorationSubtypeSelection,
} from './utils/orderType';
import {
  INSURANCE_COMPANY_SHORTCUTS,
  INSURANCE_COMPANY_SHORTCUT_SET,
  NATIONAL_CARRIER_LINKS,
  DEFAULT_COMPANY_PROFILES,
  DEFAULT_CONTACT_PROFILES,
  isInsuranceShortcutCompany,
  inferCompanyTypeFromName,
  resolveLinkedNationalCarrierName,
  resolveCompanyProfile,
  resolveContactProfile,
  isInsuranceCarrierCompany,
  inferRoleCapabilities,
} from './utils/companyProfiles';
import {
  entryContactList,
  isCompanyPlaceholder,
  isContactPlaceholder,
  companyTypeRequiresContact,
  syncCompanyEntryPlaceholders,
} from './utils/companyEntry';
import {
  INSTRUCTION_TYPES, ORDER_INSTRUCTION_PRESETS,
  DAMAGE_TYPES, COMPATIBLE_SECONDARIES,
  PROPERTY_TYPES, ACCESS_FOR_TYPE, ACCESS_DEFAULTS,
  SCOPE_DEFAULTS, LINKED_ROOMS,
  SCOPE_ROOM_LIST as ROOM_LIST,
  SCOPE_REASON_CODES as REASON_CODES,
  SCOPE_DEPARTMENTS as DEPARTMENTS,
  SCOPE_HANDLING_CODES as HANDLING_CODES_SCOPE,
  SCOPE_DEPTH_LEVELS as DEPTH_LEVELS,
  INTERVIEW_PACKOUT_SCOPES, INTERVIEW_STAY_TYPES, INTERVIEW_DURATION_OPTIONS,
  OUTBOUND_ACTIONS,
  INTERVIEW_ACTION_GROUPS, LOADING_CATEGORIES, AUDIT_STATUS_GATES,
} from './config';
import {
  getInstructionTypeTextKey,
  inferInstructionType,
  normalizeInstructionEntry,
  normalizeInstructionEntries,
  hashInstructionSeed,
  pickSeededInstructionEntries,
  dedupeInstructionEntries,
  mergeInstructionEntries,
  getInstructionIdentity,
} from './utils/instructions';
import {
  normalizeContact,
  normalizeCompany,
  normalizeStringList,
  mergeUniqueStrings,
  escapeRegExp,
  sameNormalizedCompany,
  sameNormalizedContact,
  normalizePlaceholderKeyPart,
  stringListMatches,
  toggleMulti,
} from './utils/strings';
import {
  isPlaceholderFlagActive,
  hasMeaningfulValue,
  hasCustomerDetails,
  isHeaderToggleIgnoredTarget,
  summarizeAddress,
  isAddressPlaceholder,
  useCurrentLocation,
  createPlaceholderFlag,
  summarizeConditions,
  formatOrderAddressLine,
  formatOrderAddressChoiceLabel,
  buildOrderAddressChoices,
} from './utils/order';
import { formatPhoneNumber, formatCurrencyInput, getStaticMapUrl } from './utils/format';
import { safeUid } from './utils/uid';
import { initAddress, initCustomer, initLossSeverity, createOrderInstructionDraft } from './utils/orderFactories';
import { createAlertModalState, createSmartConfirmState } from './utils/modalState';
import { normalizeSampleContacts } from './utils/normalizeSampleContacts';
import { DEFAULT_FORM } from './data/defaultForm';
import { SAMPLE_PRESET_DATA } from './data/samplePreset';
import { OLIVO_SAMPLE_PRESET } from './data/olivoSamplePreset';
import { buildNarrativeProse } from './utils/narrativeProse';
import { compressImage, captureFrameFromVideo } from './utils/image';
import { useCamera } from './hooks/useCamera';
import { useVoiceNote } from './hooks/useVoiceNote';
import { getScopeInterviewSections } from './data/scopeInterviewSections';
import {
  EVENT_SYSTEM_PREFIXES,
  stripEventSystemLines,
  buildEventSystemEntries,
  buildEventSystemLines,
  composeEventInstructions,
} from './utils/eventInstructions';
import {
  normalizeDateInput,
  formatDateLabel,
  getNowDateIso,
  getNowTimeLabel,
  getNextHalfHourLabel,
  TIME_SLOTS,
  formatShortTimestamp,
  isTimeIn12AmHour,
  shouldAutoFirm,
  toIcsDate,
  parseTimeTo24h,
  formatIcsDateTime,
  addHours,
  rushAddDays,
  parseLocalDate,
  formatDateInputValue,
  rushFormatDate,
  rushGetSeasons,
  computeStorageEstimate,
} from './utils/dateTime';
import { loadTargetsFromStorage, matchLoadTargets, SMART_TRIGGER_LABELS, shouldRetainSharedLoadItem, TRIGGER_TYPES, ACTION_TYPE_LABELS } from './utils/loadTargets';
import { relevantScopeInstructionTypes } from './utils/serviceMapping';
import { interviewAnswersFromOrderData, orderUpdatesFromInterviewAnswers } from './utils/interviewMapping';
import { ACTION_ITEM_GROUPS, groupActionItems } from './utils/actionItems';
import { buildFullExportLines, copyLinesToClipboard, downloadLinesAsFile } from './utils/dataExport';
import { focusFirstFieldInSection, focusLastFieldInSection, scrollToSection, animateNavigationFocus, focusSearchLabel } from './utils/domNav';
import { pickAutoAddressForDeliveryGroup, deliveryAddressTypeToProcessType } from './utils/deliveryGroup';
import { toggleSeverityCode, updateLossDetailField, getLossSummary as getLossSummaryFor } from './utils/lossDetails';
import { downloadOrderIcs } from './utils/icsExport';
import { renderAlertMessageContent, renderAlertDetailContent } from './utils/alertContent';
import { buildRushGuideTimeline } from './utils/rushGuideTimeline';
import { getOrderCompanyNames, getOrderContactNames, getEstimateRequesterQuickOptions, resolveOrderPoc } from './utils/orderEntities';
import { buildBillingAssignmentCues, buildInsuranceAssignmentCues } from './utils/assignmentCues';
import { computeSectionAuditStatus } from './utils/auditStatus';
import { buildOrderNarrative } from './utils/orderNarrative';
import { computeAuditMissing as computeAuditMissingFor } from './utils/auditMissing';
import { buildCompanyRoleAssignments } from './utils/companyRoles';
import { updateSdsPhotoNote } from './utils/sdsPhotoEdit';
import { mergeSdsPhotos } from './utils/sdsPhotos';
import { bridgeStatusClass, bridgeSectionClass, deriveScopeBridgeStatus } from './utils/bridgeStatus';
import { loadTestPresetsFromStorage, saveTestPresetsToStorage, upsertTestPresetByName } from './utils/testPresets';
import { hydrateOrderFromParsed } from './utils/orderHydrate';
import { loadJsonFromStorage, loadMergedRecordFromStorage, saveJsonToStorage } from './utils/localStorageState';
import { SUBSECTION_TO_SECTION, DEFAULT_SUBSECTION_BY_SECTION, SUBSECTION_DOM_ID } from './utils/sectionNav';
import {
  DURATION_DAYS, BAND_COLORS, DELIVERY_COLORS, STAY_TYPE_COLORS,
  SEASON_ICONS, HOLIDAY_ICONS, EVENT_ICONS, SEASON_DATES,
} from './utils/rushGuideVisuals';


// --- UTILS ---
// safeUid, createPlaceholderFlag, normalizePlaceholderKeyPart, sameNormalizedCompany,
// sameNormalizedContact, getStaticMapUrl, formatShortTimestamp, isTimeIn12AmHour,
// shouldAutoFirm, toIcsDate, parseTimeTo24h, formatIcsDateTime, addHours, escapeRegExp
// — all imported from ./utils/{uid,order,strings,format,dateTime}

// EVENT_SYSTEM_PREFIXES, stripEventSystemLines, buildEventSystemEntries, buildEventSystemLines,
// composeEventInstructions — imported from ./utils/eventInstructions



// getOptionText, getBestMatch — imported from ./utils/search

// normalizeContact, normalizeCompany, normalizeStringList, mergeUniqueStrings — imported from ./utils/strings

// STATES, CUSTOMER_TYPES, ORDER_STATUSES, MEETING_TYPES, DEFAULT_COMPANIES, DEFAULT_CONTACTS,
// SALES_REPS, SERVICE_OFFERINGS, SERVICE_SUB_CATEGORIES, SUGGESTED_GROUPS,
// LIVING_STATUS_ADDRESS_TYPES — imported from ./config

// BRIDGE_* constants + canonicalBridgeIssue + bridgeStageToneClass — imported from ./config and ./utils/bridge
// INSURANCE_COMPANY_SHORTCUTS, NATIONAL_CARRIER_LINKS — imported from ./utils/companyProfiles
// INSTRUCTION_TYPES, ORDER_INSTRUCTION_PRESETS — imported from ./config
// instruction helpers — imported from ./utils/instructions
// DEFAULT_COMPANY_PROFILES, DEFAULT_CONTACT_PROFILES + 6 resolver/predicate helpers — imported from ./utils/companyProfiles
// EntityPreferencePanel — imported from ./components/atoms

// --- CONSTANTS FOR SELECTIONS ---
// All pick-list constants (LOSS_TYPES, ESTIMATE_TYPES, VEHICLES, etc.) and coaching text
// are imported from src/config.ts (sourced from /config.json).
// User overrides for coaching stored in localStorage take precedence at read-time via getCoaching().

// LOSS_TYPE_COACHING, ROLE_COACHING, SUGGESTED_GROUP_HELP, SERVICE_OFFERING_HELP, getCoaching — imported from ./config

// order-type helpers — imported from ./utils/orderType

// CAUSES, ORIGINS, COMPATIBLE_SECONDARY_LOSS, ESTIMATE_TYPES, PRICING_PLATFORMS, TECHS,
// VEHICLES, LEAD_SOURCES, CONTACT_METHODS, MARKETING_SOURCES, INTERNAL_TYPES,
// CUSTOMER_QUICK_NOTES, NATIONAL_CARRIERS — imported from ./config

// inferRoleCapabilities — imported from ./utils/companyProfiles

// SAMPLE_CONTACTS — imported from ./data/sampleSeed

// SAMPLE_PRESET_DATA — imported from ./data/samplePreset

// LEAD_SOURCE_HELP, COMPANY_TYPES, SDS_*, QUICK_INSTRUCTION_NOTES — imported from ./config
const getSdsIconImageClass = (item) => SDS_ICON_CLASS_OVERRIDES[item] || "h-full w-full object-contain object-center";

// LOAD_ITEMS, PACKOUT_LOAD_MAP — imported from ./config

// summarizeAddress — imported from ./utils/order

// TIME_SLOTS — imported from ./utils/dateTime

// QUALITY_CODES, SEVERITY_GROUPS, SEVERITY_LEVELS — imported from ./config

// COMPANY_ROLE_DEFS, CONTACT_ROLE_BADGES — imported from ./config
// ROLE_ICON_COMPONENTS, resolveRoleIconKey, RoleIcon — imported from ./components/atoms

// INSURANCE_ELIGIBLE_COMPANY_TYPES, HANDLING_META — imported from ./config

// initAddress, initCustomer, initLossSeverity — imported from ./utils/orderFactories
// isAddressPlaceholder — imported from ./utils/order
// company-entry helpers — imported from ./utils/companyEntry

// stringListMatches — imported from ./utils/strings

// --- FIELD CONFIGURATION ---
// FIELD_CONFIG_SECTIONS, DEFAULT_FIELD_CONFIG — imported from ./config

// DEFAULT_BLOCKER_RULES and DEFAULT_INTERVIEW_ACTIONS — imported from ./config

// loadTargetsFromStorage, matchLoadTargets — imported from ./utils/loadTargets
// rushAddDays, parseLocalDate, formatDateInputValue, rushFormatDate, rushGetSeasons — imported from ./utils/dateTime

// DEFAULT_FORM — imported from ./data/defaultForm

// --- UI PRIMITIVES ---
// Chevron — imported from ./components/atoms

// buildNarrativeProse — imported from ./utils/narrativeProse


// Field, Input, Select, Textarea, AutoGrowTextarea — imported from ./components/atoms

// date/time helpers — imported from ./utils/dateTime

// DatePicker, TimePicker — imported from ./components/atoms

// SearchSelect — imported from ./components/atoms (with its own normalizeOption helper)

// ToastItem, ToastStack, Switch, SmartNotification — imported from ./components/atoms

// pill styles + ToggleGroup/ToggleMulti/SubSection/EditAffordance/AssignmentCueStrip/LinkedAssignmentPanel
// imported from ./components/atoms

// RoleBadge — imported from ./components/atoms

// --- SHARED FIELD COMPONENTS ---

// LeadInfoFields — imported from ./components/atoms



// AI_USAGE_GUIDELINES, AI_TIME_SAVING_TIPS — imported from ./config (used by StartScreen)

// --- SCOPE WIZARD — Guided scoping flow ---
// PICKUP_DEPARTMENTS — imported from ./config

const ScopeWizard = ({ onClose, orderData, onOrderUpdate, onShowOrder, onShowSds, showCoaching: parentShowCoaching = true, onToggleCoaching }: { onClose: () => void; orderData?: typeof DEFAULT_FORM; onOrderUpdate?: (updates: Partial<typeof DEFAULT_FORM>) => void; onShowOrder?: () => void; onShowSds?: () => void; showCoaching?: boolean; onToggleCoaching?: () => void }) => {
  const [activeTab, setActiveTab] = useState<"order" | "interview" | "scope" | "photos" | "report">("scope");
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  useEffect(() => { setVisitedSteps(prev => { if (prev.has(step)) return prev; return new Set([...prev, step]); }); }, [step]);
  const [roomPass, setRoomPass] = useState<1 | 2 | 3>(1);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [autoAddRooms, setAutoAddRooms] = useState(true);
  const [expandedContext, setExpandedContext] = useState(false);
  const [walkthroughRoom, setWalkthroughRoom] = useState<{ fi: number; ri: number } | null>(null);
  const [roomSwitching, setRoomSwitching] = useState(false);
  const [coverMode, setCoverMode] = useState(false);
  const [lastCapturedIdx, setLastCapturedIdx] = useState<number | null>(null);
  const [photoTagsOpen, setPhotoTagsOpen] = useState(false);
  const [roomPhotos, setRoomPhotos] = useState<Record<string, { src: string; note: string; reason: string; ts: number; tag?: string }[]>>(() => {
    return (orderData as any)?.scopePhotos || {};
  });
  const [orderCoverPhoto, setOrderCoverPhoto] = useState<string | null>((orderData as any)?.orderCoverPhoto || null);
  const [pendingPhotoDelete, setPendingPhotoDelete] = useState<{ rKey: string; index: number; photo: any; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [walkthroughExitWarning, setWalkthroughExitWarning] = useState<{ missing: { room: string; fi: number; ri: number; issues: string[] }[] } | null>(null);
  const [photoCoverPrompt, setPhotoCoverPrompt] = useState<{ rKey: string; index: number } | null>(null);
  const [coverCameraOpen, setCoverCameraOpen] = useState(false);
  const { voiceTarget, isRecording: isVoiceRecording, toggle: toggleVoice, stop: stopVoiceRecording } = useVoiceNote();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const scopeContentRef = useRef<HTMLDivElement>(null);
  // Scroll content to top when step or tab changes
  useEffect(() => { scopeContentRef.current?.scrollTo(0, 0); }, [step, activeTab, roomPass]);

  // Camera lifecycle (start/stop/auto-cleanup) is in useCamera; we just compose UX on top.
  const { videoRef, camStreamRef, cameraActive, cameraError, setCameraError, startCamera, stopCamera } = useCamera();
  const captureFromCamera = useCallback(() => captureFrameFromVideo(videoRef.current), [videoRef]);

  // voice-recording lifecycle is auto-managed by useVoiceNote (unmount cleanup included)

  const saveCoverPhotoFile = useCallback((file: File | undefined | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      setOrderCoverPhoto(compressed);
      setCoverCameraOpen(false);
      stopCamera();
      setToastMsg("Cover photo saved");
    };
    reader.readAsDataURL(file);
  }, [compressImage, stopCamera]);

	  const openCoverCamera = useCallback(() => {
	    setCameraError("");
	    if (!navigator.mediaDevices?.getUserMedia) {
	      coverInputRef.current?.click();
	      return;
	    }
	    setCoverCameraOpen(true);
	    startCamera(coverInputRef.current);
	  }, [startCamera]);

  // Step guidance toasts — text in SCOPE_WIZARD_STEP_TOASTS (config). State + sync only here.
  const [toastMsg, setToastMsg] = useState(SCOPE_WIZARD_STEP_TOASTS["1"] || "");
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(new Set());
  const toastKey = step === 4 ? `4-${roomPass}` : `${step}`;
  useEffect(() => {
    const msg = SCOPE_WIZARD_STEP_TOASTS[toastKey];
    if (msg) setToastMsg(msg);
  }, [step, roomPass]);

  // Interview question list — built lazily so loadList options pick up live Settings edits.
  const INTERVIEW_SECTIONS = getScopeInterviewSections();
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string | string[] | boolean | null>>(
    () => interviewAnswersFromOrderData(orderData) as Record<string, string | string[] | boolean | null>,
  );


  // Sync interview answers to NOE in real-time
  const syncInterviewToNOE = useCallback((answers: Record<string, any>) => {
    if (!onOrderUpdate) return;
    onOrderUpdate(orderUpdatesFromInterviewAnswers(answers));
  }, [onOrderUpdate]);

  // Sync photos to parent in real-time
  const onOrderUpdateRef = useRef(onOrderUpdate);
  onOrderUpdateRef.current = onOrderUpdate;
  useEffect(() => {
    if (onOrderUpdateRef.current && Object.keys(roomPhotos).length > 0) {
      onOrderUpdateRef.current({ scopePhotos: roomPhotos, orderCoverPhoto } as any);
    }
  }, [roomPhotos, orderCoverPhoto]);

  // Wrap setInterviewAnswers to also sync to NOE (sync deferred to avoid setState-in-setState loop)
  const syncPendingRef = useRef(false);
  const updateInterview = useCallback((updater: (prev: Record<string, any>) => Record<string, any>) => {
    setInterviewAnswers(prev => {
      const next = updater(prev);
      // Defer sync to avoid calling onOrderUpdate inside a setState
      if (!syncPendingRef.current) {
        syncPendingRef.current = true;
        setTimeout(() => { syncPendingRef.current = false; syncInterviewToNOE(next); }, 0);
      }
      return next;
    });
  }, [syncInterviewToNOE]);

  const interviewAnswered = INTERVIEW_SECTIONS.filter(s => {
    const a = interviewAnswers[s.id];
    return a !== undefined && a !== null && (Array.isArray(a) ? a.length > 0 : a !== "");
  }).length;
  const interviewTotal = INTERVIEW_SECTIONS.length;
  const [wizSelectedRooms, setWizSelectedRooms] = useState<Set<string>>(new Set());
  const [bulkEditing, setBulkEditing] = useState(false);

  // PROPERTY_TYPES, ACCESS_FOR_TYPE, ACCESS_DEFAULTS — imported from ./config
  const noeAddr = (() => { const addrs = (orderData as any)?.addresses; return Array.isArray(addrs) ? (addrs.find((a: any) => a.isPrimary) || addrs[0] || {}) : {}; })();
  const [propType, setPropType] = useState(() => {
    const fromOrder = (orderData as any)?.propertyType;
    const fromAddr = noeAddr.buildingType;
    return fromOrder || fromAddr || "";
  });
  const [propSubType, setPropSubType] = useState("");
  const [accessDetails, setAccessDetails] = useState<Record<string, boolean>>(() => {
    const addr = noeAddr;
    if (addr.buildingParking || addr.buildingAccess) return { ...(addr.buildingParking || {}), ...(addr.buildingAccess || {}) };
    const pt = (orderData as any)?.propertyType || addr.buildingType || "";
    if (pt) { const defs: Record<string, boolean> = {}; (ACCESS_DEFAULTS[pt] || []).forEach((k: string) => { defs[k] = true; }); return defs; }
    return {};
  });
  // Unit info — for multi-unit buildings
  const isMultiUnit = ["house", "largehouse", "estate", "townhouse", "lowrise", "highrise", "storefront", "commercial"].includes(propType);
  const isHouseType = ["house", "largehouse", "estate"].includes(propType);
  // Only show scope toggle when the default might be wrong
  const showScopeToggle = ["house", "largehouse", "townhouse", "lowrise"].includes(propType);
  // SCOPE_DEFAULTS — imported from ./config (auto-defaults: houses/estates/trailers = entire, highrises/commercial = unit)
  const selectedPropObj = PROPERTY_TYPES.find(p => p.id === propType);
  // Pre-populate unit number from NOE address apt field
  const noeApt = (() => { const addr = orderData?.addresses?.[0]; return (addr as any)?.apt || ""; })();
  const [workScope, setWorkScope] = useState<"unit" | "floor" | "building" | "">(() => {
    const fromAddr = noeAddr.buildingWorkScope;
    if (fromAddr) return fromAddr as any;
    if (noeApt) return "unit";
    if (propType) return SCOPE_DEFAULTS[propType] || "building";
    return "";
  });
  const [unitNumber, setUnitNumber] = useState(noeApt);
  const [unitFloorLevel, setUnitFloorLevel] = useState<number | "">("");
  const [buildingFloorLevel, setBuildingFloorLevel] = useState<number | "">("");

  // Step 2: Size
  const [floors, setFloors] = useState<number | "">(orderData?.propertyFloors || noeAddr.buildingFloors || "");
  const [beds, setBeds] = useState<number | "">(orderData?.propertyBedrooms || (noeAddr.beds ? Number(noeAddr.beds) : ""));
  const [baths, setBaths] = useState<number | "">(orderData?.propertyBathrooms || "");
  const [sqft, setSqft] = useState(noeAddr.sqft || "");
  const [hasBasement, setHasBasement] = useState(orderData?.propertyHasBasement || false);
  const [hasAttic, setHasAttic] = useState(orderData?.propertyHasAttic || false);

  // DAMAGE_TYPES + COMPATIBLE_SECONDARIES imported from ./config (config.json#lists)
  const [damageTypes, setDamageTypes] = useState<Record<string, number>>(() => {
    if (!orderData) return {};
    const dt: Record<string, number> = {};
    const d = orderData as any;
    // Read from primaryLossType
    if (d.primaryLossType) {
      const code = d.primaryLossType.toLowerCase();
      if (code.includes("fire")) dt.fire = 1;
      if (code.includes("water")) dt.water = 1;
      if (code.includes("mold")) dt.mold = 1;
      if (code.includes("puffback")) dt.puffback = 1;
    }
    // Read from orderTypes (e.g. ["Fire", "Water"])
    (d.orderTypes || []).forEach((t: string) => {
      const code = (t || "").toLowerCase();
      if (code.includes("fire")) dt.fire = Math.max(dt.fire || 0, 1);
      else if (code.includes("water")) dt.water = Math.max(dt.water || 0, 1);
      else if (code.includes("mold")) dt.mold = Math.max(dt.mold || 0, 1);
      else if (code.includes("puffback")) dt.puffback = Math.max(dt.puffback || 0, 1);
    });
    // Read severity levels from lossSeverity
    const sev = d.lossSeverity;
    if (sev) {
      if (sev.fire?.enabled) { const vals = Object.values(sev.fire.values || {}); const max = vals.length ? Math.max(...vals as number[]) : 0; if (max > 0) dt.fire = max; }
      if (sev.water?.enabled) { const vals = Object.values(sev.water.values || {}); const max = vals.length ? Math.max(...vals as number[]) : 0; if (max > 0) dt.water = max; }
      if (sev.puffback?.enabled) { const vals = Object.values(sev.puffback.values || {}); const max = vals.length ? Math.max(...vals as number[]) : 0; if (max > 0) dt.puffback = max; }
    }
    // Read from severityCodes (e.g. ["F1", "W2"])
    (d.severityCodes || []).forEach((c: string) => {
      const match = (c || "").match(/^([FWMPD])(\d)$/);
      if (match) {
        const map: Record<string, string> = { F: "fire", W: "water", M: "mold", P: "puffback", D: "debris" };
        const key = map[match[1]];
        if (key) dt[key] = Math.max(dt[key] || 0, Number(match[2]));
      }
    });
    return dt;
  });
  const [damageDetails, setDamageDetails] = useState<Record<string, Record<string, number>>>(() => {
    if (!orderData) return {};
    const sev = (orderData as any).lossSeverity;
    if (!sev) return {};
    const dd: Record<string, Record<string, number>> = {};
    if (sev.fire?.values) dd.fire = { ...sev.fire.values };
    if (sev.water?.values) dd.water = { ...sev.water.values };
    if (sev.puffback?.values) dd.puffback = { ...sev.puffback.values };
    return dd;
  });
  const [expandedDamage, setExpandedDamage] = useState<string | null>(() => {
    // Auto-expand first active damage type if pre-populated from order
    if (!orderData) return null;
    const d = orderData as any;
    if (d.primaryLossType) return d.primaryLossType.toLowerCase().includes("fire") ? "fire" : d.primaryLossType.toLowerCase().includes("water") ? "water" : d.primaryLossType.toLowerCase().includes("mold") ? "mold" : d.primaryLossType.toLowerCase().includes("puffback") ? "puffback" : null;
    return null;
  });
  const [uniformSeverity, setUniformSeverity] = useState(true); // same severity for all rooms
  const toggleDamage = (id: string) => {
    const wasActive = (damageTypes[id] || 0) > 0;
    const hasPrimary = activeDamage.length > 0;
    const isPrimary = hasPrimary && activeDamage[0][0] === id;
    // Confirm if removing/changing primary that came from the order
    if (wasActive && isPrimary && orderData?.primaryLossType) {
      if (!window.confirm(`This will change the order-level primary loss type from "${orderData.primaryLossType}". Continue?`)) return;
    }
    setDamageTypes(p => ({ ...p, [id]: wasActive ? 0 : -1 }));
    if (!wasActive) setExpandedDamage(id); else setExpandedDamage(null);
    // If turning off and no other damage types are active, mark all rooms as not affected
    if (wasActive) {
      const remaining = Object.entries(damageTypes).filter(([k, v]) => k !== id && v > 0);
      if (remaining.length === 0) markAll(false);
    }
  };
  const setDamageLevel = (id: string, level: number) => {
    setDamageTypes(p => ({ ...p, [id]: level }));
    // If set to 0 and no other active types, mark all rooms not affected
    if (level === 0) {
      const remaining = Object.entries(damageTypes).filter(([k, v]) => k !== id && v !== 0);
      if (remaining.length === 0) markAll(false);
    }
  };
  const activeDamage = Object.entries(damageTypes).filter(([, v]) => v !== 0);

  // Sync scope → NOE via explicit function call (not useEffect, to avoid infinite loops)
  const syncScopeToNoe = useCallback(() => {
    if (!onOrderUpdate) return;
    const activeDmg = Object.entries(damageTypes).filter(([, v]) => v !== 0);
    onOrderUpdate({
      propertyType: propType,
      propertyFloors: floors,
      propertyBedrooms: beds,
      primaryLossType: activeDmg[0] ? DAMAGE_TYPES.find(d => d.id === activeDmg[0][0])?.label || "" : "",
      orderTypes: activeDmg.map(([code]) => DAMAGE_TYPES.find(d => d.id === code)?.label || code),
      severityCodes: activeDmg.filter(([, v]) => v > 0).map(([code, level]) => { const dt = DAMAGE_TYPES.find(d => d.id === code); return dt ? `${dt.label[0]}${level}` : ""; }).filter(Boolean),
    } as any);
  }, [propType, floors, beds, damageTypes, onOrderUpdate]);

  // Step 4: Impact — generate rooms then mark affected
  type RoomEntry = { name: string; affected: boolean };
  type FloorEntry = { name: string; rooms: RoomEntry[] };
  const [homeRooms, setHomeRooms] = useState<FloorEntry[]>([]);
  const tryExitWalkthrough = useCallback(() => {
    stopCamera();
    const missing: { room: string; fi: number; ri: number; issues: string[] }[] = [];
    homeRooms.forEach((f, fi) => f.rooms.forEach((r, ri) => {
      if (!r.affected) return;
      const rKey = `${fi}-${ri}`;
      const photos = roomPhotos[rKey] || [];
      const issues: string[] = [];
      if (photos.length === 0) issues.push("No photos");
      else if (!photos.some(p => p.reason) && !photos.some(p => p.tag === "cover" || p.tag === "roomCover")) issues.push("No tagged photos");
      if (issues.length > 0) missing.push({ room: r.name, fi, ri, issues });
    }));
    if (missing.length > 0) {
      setWalkthroughExitWarning({ missing });
    } else {
      setShowWalkthrough(false);
      setWalkthroughRoom(null);
    }
  }, [homeRooms, roomPhotos, stopCamera]);
  const [roomSevOverrides, setRoomSevOverrides] = useState<Record<string, Record<string, number>>>({});
  const [roomHandlingCodes, setRoomHandlingCodes] = useState<Record<string, string[]>>({});
  const [roomQualityCodes, setRoomQualityCodes] = useState<Record<string, string>>({});
  const [roomNotes, setRoomNotes] = useState<Record<string, string>>({});
  const [roomDepthOverrides, setRoomDepthOverrides] = useState<Record<string, number>>({});
  const [originRoom, setOriginRoom] = useState<string>("");
  const [editingFloorSev, setEditingFloorSev] = useState<number | null>(null);
  const [floorSevOverrides, setFloorSevOverrides] = useState<Record<number, Record<string, number>>>({}); // fi → {fire: 2, water: 1}
  const [dragRoom, setDragRoom] = useState<{fi: number; ri: number} | null>(null);
  const [highlightedRoom, setHighlightedRoom] = useState<string | null>(null);
  const [highlightedFloor, setHighlightedFloor] = useState<number | null>(null);
  const [fadingRoom, setFadingRoom] = useState<string | null>(null);
  // LINKED_ROOMS — imported from ./config
  const handleDrop = (targetFi: number) => {
    if (!dragRoom || dragRoom.fi === targetFi) { setDragRoom(null); return; }
    const roomName = homeRooms[dragRoom.fi]?.rooms[dragRoom.ri]?.name || "";
    setHomeRooms(prev => {
      const next = prev.map(f => ({ ...f, rooms: [...f.rooms] }));
      const room = next[dragRoom.fi].rooms[dragRoom.ri];
      const linkedName = LINKED_ROOMS[room.name];
      const linkedRi = linkedName ? next[dragRoom.fi].rooms.findIndex(r => r.name === linkedName) : -1;
      if (linkedRi >= 0) {
        const linked = next[dragRoom.fi].rooms[linkedRi];
        next[dragRoom.fi].rooms.splice(linkedRi, 1);
        next[targetFi].rooms.push(linked);
      }
      const adjRi = next[dragRoom.fi].rooms.findIndex(r => r === room);
      if (adjRi >= 0) { next[dragRoom.fi].rooms.splice(adjRi, 1); next[targetFi].rooms.push(room); }
      return next;
    });
    setDragRoom(null);
    // Highlight the moved room for 1.5s
    setHighlightedRoom(roomName);
    setTimeout(() => setHighlightedRoom(null), 1500);
  };
  const addRoom = (fi: number, name: string) => {
    let finalName = name;
    setHomeRooms(prev => {
      const next = [...prev];
      const existing = new Set(next.flatMap(f => f.rooms.map(r => r.name)));
      if (existing.has(name)) {
        const base = name.replace(/\s+\d+$/, "");
        let n = 2; while (existing.has(`${base} ${n}`)) n++;
        finalName = `${base} ${n}`;
      }
      next[fi] = { ...next[fi], rooms: [...next[fi].rooms, { name: finalName, affected: activeDamage.length > 0 }] };
      return next;
    });
    // Show orange entrance highlight
    setHighlightedRoom(finalName);
    setTimeout(() => setHighlightedRoom(null), 1500);
  };
  const [editingRoom, setEditingRoom] = useState<{fi: number; ri: number} | null>(null);
  const [renamingRoom, setRenamingRoom] = useState<{fi: number; ri: number} | null>(null);
  const [renameText, setRenameText] = useState("");
  const [addingToFloor, setAddingToFloor] = useState<number | null>(null);
  const [addSearch, setAddSearch] = useState("");
  // ROOM_LIST, REASON_CODES, DEPARTMENTS, HANDLING_CODES_SCOPE, QUALITY_CODES — imported from ./config
  const [roomReasonCodes, setRoomReasonCodes] = useState<Record<string, string[]>>({});
  const [roomDepartments, setRoomDepartments] = useState<Record<string, string[]>>({});
  const [impactMode, setImpactMode] = useState<"all" | "floors" | "rooms" | "">("");
  const [expandedFloor, setExpandedFloor] = useState<number | null>(null);

  const isCommercialType = ["commercial", "storefront"].includes(propType);
  const generateRooms = () => {
    const result: FloorEntry[] = [];
    const nFloors = typeof floors === "number" ? floors : 1;
    const nBeds = typeof beds === "number" ? beds : 2;
    const nBaths = typeof baths === "number" ? baths : 1;
    if (isCommercialType) {
      // Commercial/storefront: generic areas instead of bedrooms
      for (let f = 1; f <= nFloors; f++) {
        result.push({ name: nFloors === 1 ? "Main Floor" : `Floor ${f}`, rooms: [
          { name: "Main Area", affected: false },
          { name: "Office", affected: false },
          { name: "Storage", affected: false },
          { name: "Restroom", affected: false },
        ] });
      }
      setHomeRooms(result);
      return;
    }
    if (nFloors <= 1) {
      const rooms: RoomEntry[] = [{ name: "Living", affected: false }, { name: "Kitchen", affected: false }, { name: "Dining", affected: false }];
      for (let i = 1; i <= nBeds; i++) rooms.push({ name: i === 1 ? "Master" : `Bedroom ${i}`, affected: false });
      for (let i = 1; i <= nBaths; i++) rooms.push({ name: nBaths === 1 ? "Bathroom" : i === 1 ? "Master Bath" : `Bath ${i}`, affected: false });
      if (!hasBasement) rooms.push({ name: "Laundry", affected: false });
      result.push({ name: "Floor 1", rooms });
    } else {
      const f1: RoomEntry[] = [{ name: "Living", affected: false }, { name: "Kitchen", affected: false }, { name: "Dining", affected: false }, { name: "Half Bath", affected: false }];
      if (!hasBasement) f1.push({ name: "Laundry", affected: false });
      result.push({ name: "Floor 1", rooms: f1 });
      for (let f = 2; f < nFloors; f++) result.push({ name: `Floor ${f}`, rooms: [{ name: "Family", affected: false }, { name: "Office", affected: false }] });
      const top: RoomEntry[] = [];
      for (let i = 1; i <= nBeds; i++) top.push({ name: i === 1 ? "Master" : `Bedroom ${i}`, affected: false });
      for (let i = 1; i <= nBaths; i++) top.push({ name: nBaths === 1 ? "Bathroom" : i === 1 ? "Master Bath" : `Bath ${i}`, affected: false });
      result.push({ name: `Floor ${nFloors}`, rooms: top });
    }
    if (hasBasement) result.unshift({ name: "Basement", rooms: [{ name: "Rec", affected: false }, { name: "Laundry", affected: false }, { name: "Storage", affected: false }] });
    if (hasAttic) result.push({ name: "Attic", rooms: [{ name: "Attic", affected: false }] });
    // Preserve rooms that have photos or instructions
    const hasData = (fi: number, ri: number) => {
      const rKey = `${fi}-${ri}`;
      return (roomPhotos[rKey] || []).length > 0 || !!(roomNotes || {})[rKey];
    };
    if (homeRooms.length > 0 && homeRooms.some((f, fi) => f.rooms.some((_, ri) => hasData(fi, ri)))) {
      // Merge: keep rooms with data, replace empty ones
      const preserved: FloorEntry[] = [];
      homeRooms.forEach((f, fi) => {
        const keptRooms = f.rooms.filter((_, ri) => hasData(fi, ri));
        if (keptRooms.length > 0) preserved.push({ ...f, rooms: keptRooms });
      });
      // Add new generated rooms that don't conflict
      result.forEach(f => {
        const existing = preserved.find(p => p.name === f.name);
        if (existing) {
          const newRooms = f.rooms.filter(r => !existing.rooms.some(er => er.name === r.name));
          existing.rooms.push(...newRooms);
        } else {
          preserved.push(f);
        }
      });
      setHomeRooms(preserved);
    } else {
      setHomeRooms(result);
    }
  };

  const markAll = (affected: boolean) => setHomeRooms(prev => prev.map(f => ({ ...f, rooms: f.rooms.map(r => ({ ...r, affected })) })));
  const markFloor = (fi: number) => setHomeRooms(prev => { const next = [...prev]; const allOn = next[fi].rooms.every(r => r.affected); next[fi] = { ...next[fi], rooms: next[fi].rooms.map(r => ({ ...r, affected: !allOn })) }; return next; });
  const markRoom = (fi: number, ri: number) => setHomeRooms(prev => { const next = [...prev]; const rooms = [...next[fi].rooms]; rooms[ri] = { ...rooms[ri], affected: !rooms[ri].affected }; next[fi] = { ...next[fi], rooms }; return next; });
  const totalAffected = homeRooms.reduce((s, f) => s + f.rooms.filter(r => r.affected).length, 0);
  const totalRoomCount = homeRooms.reduce((s, f) => s + f.rooms.length, 0);

  // Step 5: DEPTH_LEVELS imported from ./config (SCOPE_DEPTH_LEVELS, aliased below)
  const [depthLevel, setDepthLevel] = useState(2);
  const SERVICES = ["Appliance", "Art", "Consulting", "Contents", "Furniture", "Hand Clean", "Pack-out", "Rugs", "Storage Only", "Textiles", "TLI", "Expert Stain Removal"];
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>(() => {
    if (!orderData) return {};
    const d = orderData as any;
    const offerings = d.serviceOfferings || d.sdsServices || [];
    if (!offerings.length) return {};
    const s: Record<string, boolean> = {};
    offerings.forEach((svc: string) => { if (svc) s[svc] = true; });
    return s;
  });

  // Step labels — reordered: Building → Space → Rooms → Severity
  const totalPhotos = Object.values(roomPhotos).reduce((s, arr) => s + arr.length, 0);
  const stepLabels = ["Building", "Size", "Rooms", "Severity", `Pics${totalPhotos > 0 ? ` (${totalPhotos})` : ""}`];
  const stepQuestions = [
    "Building type",
    propType === "trailer" ? "Trailer size" : isHouseType ? "Home size" : "Unit size",
    "Confirm rooms",
    roomPass === 1 ? "What type of damage occurred?" : roomPass === 2 ? "Which areas were affected?" : "Set instructions",
    "Take photos",
  ];

  // Auto-generate rooms when entering step 3 (Rooms)
  const advanceStep = () => {
    if (step === 2) {
      if (homeRooms.length === 0) generateRooms();
    }
    if (step === 3) {
      // When advancing from Rooms to Severity, default all rooms to affected
      setTimeout(() => markAll(true), 0);
      // Auto-expand the first active damage type so user sees existing severity
      const firstActive = Object.entries(damageTypes).find(([, v]) => v > 0);
      if (firstActive) setExpandedDamage(firstActive[0]);
    }
    if (step === 4) {
      // Advancing from Severity → Pics: open photo walkthrough
      setStep(5);
      setShowWalkthrough(true);
      const firstAffected = homeRooms.findIndex(f => f.rooms.some(r => r.affected));
      if (firstAffected >= 0) {
        const ri = homeRooms[firstAffected].rooms.findIndex(r => r.affected);
        if (ri >= 0) { setWalkthroughRoom({ fi: firstAffected, ri }); setTimeout(() => startCamera(), 400); }
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
    syncScopeToNoe();
  };

  const canAdvance = step === 1 ? !!propType : step === 2 ? floors !== "" : step === 3 ? true : step === 4 && roomPass === 1 ? activeDamage.length > 0 : true;

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 flex items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
    <div className="w-[393px] max-w-full bg-white rounded-[44px] shadow-2xl flex flex-col overflow-hidden relative" style={{ height: "852px", maxHeight: "95vh", boxShadow: "0 0 0 1px rgba(148,163,184,.28), 0 22px 56px rgba(15,23,42,.16)" }}>

      {/* Dynamic Island */}
      <div className="absolute top-0 left-0 right-0 h-[46px] flex items-end justify-center pb-1.5 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-[18px] bg-[#1a1a1a] px-3.5 h-7 min-w-[100px]">
          {stepLabels.map((_, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const visited = visitedSteps.has(stepNum);
            const skipped = step > stepNum && !visited;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div className={`flex-1 min-w-1 h-0.5 ${visited && !active ? "bg-blue-500/60" : skipped ? "bg-amber-400/60" : step > stepNum ? "bg-white/30" : "bg-white/30"}`} />}
                <button type="button" onClick={() => {
                  if (stepNum === 5) {
                    setStep(5); setShowWalkthrough(true);
                    const fa = homeRooms.findIndex(f => f.rooms.some(r => r.affected));
                    if (fa >= 0) { const ri = homeRooms[fa].rooms.findIndex(r => r.affected); if (ri >= 0) setWalkthroughRoom({ fi: fa, ri }); }
                  } else {
                    setStep(stepNum); setShowWalkthrough(false); setWalkthroughRoom(null);
                  }
                }} className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${active ? "bg-blue-600 text-white" : visited ? "bg-blue-500/60 text-white cursor-pointer hover:bg-blue-500" : "bg-white/25 text-white/80 cursor-pointer hover:bg-white/40"}`}>{stepNum === 5 && totalPhotos > 0 ? `${totalPhotos}` : stepNum}</button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Nav bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 bg-white/95 backdrop-blur-sm border-b border-slate-200" style={{ paddingTop: "52px", minHeight: "94px" }}>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="w-[34px] h-[34px] rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        )}
        <div className="flex-1">
          <span className="text-[17px] font-bold text-slate-900 tracking-tight">{stepLabels[step - 1]}</span>
          <div className="text-[11px] text-slate-400 mt-0.5">Step {step} of {totalSteps}</div>
        </div>
        {onToggleCoaching && <button onClick={onToggleCoaching} className={`w-[34px] h-[34px] rounded-xl border flex items-center justify-center text-[12px] ${parentShowCoaching ? "border-violet-300 bg-violet-50 text-violet-600" : "border-slate-200 bg-slate-50 text-slate-400"}`} title={parentShowCoaching ? "Hide coaching" : "Show coaching"}>🎓</button>}
        <button onClick={() => { syncScopeToNoe(); onClose(); }} className="w-[34px] h-[34px] rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 text-lg font-bold">×</button>
      </div>

      {/* ═══ ORDER TAB — mobile-optimized editable form ═══ */}
      {activeTab === "order" && (() => {
        const d = (orderData || {}) as any;
        const cust = d.customers?.[0] || {};
        const addr = d.addresses?.[0] || {};
        const upd = (key: string, val: any) => onOrderUpdate?.({ [key]: val } as any);
        const updCust = (field: string, val: string) => {
          const custs = [...(d.customers || [{ first: "", last: "", phone: "", email: "" }])];
          custs[0] = { ...custs[0], [field]: val };
          onOrderUpdate?.({ customers: custs } as any);
        };
        const updAddr = (field: string, val: string) => {
          const addrs = [...(d.addresses || [{}])];
          addrs[0] = { ...addrs[0], [field]: val };
          onOrderUpdate?.({ addresses: addrs } as any);
        };
        const MobileField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
            <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder || label} className="w-full rounded-[8px] border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-800 outline-none focus:border-blue-400 bg-white" />
          </div>
        );
        return (
        <div className="flex-1 overflow-auto bg-[#f5f7fb]" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-3 pt-3 pb-20 space-y-2">
            {/* Status bar */}
            <div className="flex items-center justify-between">
              <div className="text-[18px] font-bold text-slate-900">Order</div>
              <div className="flex gap-1.5">
                {d.primaryLossType && <span className="rounded-full bg-orange-100 text-orange-700 px-2.5 py-0.5 text-[11px] font-bold">{d.primaryLossType}</span>}
                {d.orderStatus && <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[11px] font-bold">{d.orderStatus}</span>}
              </div>
            </div>

            {/* Event Instructions — top priority for field team */}
            {d.eventInstructions && (
            <div className="rounded-[14px] border border-sky-200 bg-sky-50 p-4 space-y-1.5">
              <div className="text-[11px] font-extrabold text-sky-600 uppercase tracking-wider">Event Instructions</div>
              <div className="text-[13px] text-sky-800 leading-relaxed space-y-0.5">
                {(d.eventInstructions || "").split("\n").filter(Boolean).map((line: string, i: number) => {
                  const colonIdx = line.indexOf(":");
                  if (colonIdx > 0 && colonIdx < 25) {
                    return <div key={i}><span className="font-bold">{line.slice(0, colonIdx + 1)}</span>{line.slice(colonIdx + 1)}</div>;
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>
            </div>
            )}

            {/* Order section */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Order Info</div>
              <MobileField label="Order Name" value={d.orderName} onChange={v => upd("orderName", v)} />
              <div className="grid grid-cols-2 gap-3">
                <MobileField label="Claim #" value={d.claimNumber} onChange={v => upd("claimNumber", v)} />
                <MobileField label="Policy #" value={d.policyNumber} onChange={v => upd("policyNumber", v)} />
              </div>
            </div>

            {/* Customer section */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Customer</div>
              <div className="grid grid-cols-2 gap-3">
                <MobileField label="First Name" value={cust.first} onChange={v => updCust("first", v)} />
                <MobileField label="Last Name" value={cust.last} onChange={v => updCust("last", v)} />
              </div>
              <MobileField label="Phone" value={cust.phone} onChange={v => updCust("phone", v)} />
              <MobileField label="Email" value={cust.email} onChange={v => updCust("email", v)} />
            </div>

            {/* Address section */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Address</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3"><MobileField label="Street" value={addr.street} onChange={v => updAddr("street", v)} /></div>
                <MobileField label="Apt/Unit" value={addr.apt} onChange={v => updAddr("apt", v)} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MobileField label="City" value={addr.city} onChange={v => updAddr("city", v)} />
                <MobileField label="State" value={addr.state} onChange={v => updAddr("state", v)} />
                <MobileField label="Zip" value={addr.zip} onChange={v => updAddr("zip", v)} />
              </div>
            </div>

            {/* Loss Type */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Loss Type</div>
              <div className="flex flex-wrap gap-1.5">
                {LOSS_TYPES.map(t => (
                  <button key={t} onClick={() => upd("primaryLossType", d.primaryLossType === t ? "" : t)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${d.primaryLossType === t ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500"}`}>{t}</button>
                ))}
              </div>
              <MobileField label="Date of Loss" value={d.dateOfLoss} onChange={v => upd("dateOfLoss", v)} placeholder="YYYY-MM-DD" />
            </div>

            {/* Lead Source */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Lead Source</div>
              <div className="flex flex-wrap gap-1.5">
                {LEAD_SOURCES.map(s => (
                  <button key={s} onClick={() => upd("leadSourceCategory", d.leadSourceCategory === s ? "" : s)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${d.leadSourceCategory === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>{s}</button>
                ))}
              </div>
              {d.leadSourceCategory === "Referral" && (
                <div className="space-y-2">
                  <MobileField label="Referring Company" value={d.referringCompany} onChange={v => upd("referringCompany", v)} />
                  <MobileField label="Referrer" value={d.referrer} onChange={v => upd("referrer", v)} />
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Schedule</div>
              <div className="grid grid-cols-2 gap-2">
                <MobileField label="Date" value={d.pickupDate} onChange={v => upd("pickupDate", v)} placeholder="YYYY-MM-DD" />
                <MobileField label="Time" value={d.pickupTime} onChange={v => upd("pickupTime", v)} placeholder="HH:MM" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Scope", "Pickup", "In-Home"].map(t => (
                  <button key={t} onClick={() => upd("scheduleType", d.scheduleType === t ? "" : t)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${d.scheduleType === t ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Services — tap to toggle, expand for sub-options */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_OFFERINGS.map((s: string) => {
                  const isOn = (d.serviceOfferings || []).includes(s);
                  const hasSubs = !!SERVICE_SUB_CATEGORIES[s];
                  const subs = ((d as any).serviceSubCategories || []).filter((x: string) => x.startsWith(`${s}: `)).map((x: string) => x.replace(`${s}: `, ""));
                  const subLabel = subs.length > 0 ? ` (${subs.join(", ")})` : "";
                  return (
                    <button key={s} onClick={() => {
                      if (!isOn) {
                        upd("serviceOfferings", [...(d.serviceOfferings || []), s]);
                        if (hasSubs) setExpandedService(s);
                      } else if (hasSubs && expandedService !== s) {
                        setExpandedService(s);
                      } else {
                        upd("serviceOfferings", (d.serviceOfferings || []).filter((x: string) => x !== s));
                        // Clear sub-categories for this service
                        const cleaned = ((d as any).serviceSubCategories || []).filter((x: string) => !x.startsWith(`${s}: `));
                        onOrderUpdate?.({ serviceSubCategories: cleaned } as any);
                        if (expandedService === s) setExpandedService(null);
                      }
                    }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${isOn ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>
                      {s}{subLabel}
                    </button>
                  );
                })}
              </div>
              {/* Expanded sub-options for selected service */}
              {expandedService && SERVICE_SUB_CATEGORIES[expandedService] && (d.serviceOfferings || []).includes(expandedService) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{expandedService} Options</div>
                    <button onClick={() => setExpandedService(null)} className="text-[9px] font-bold text-slate-400 hover:text-slate-600">Done</button>
                  </div>
                  <div className="flex flex-wrap gap-1">{SERVICE_SUB_CATEGORIES[expandedService].map(sub => {
                    const subKey = `${expandedService}: ${sub}`;
                    const selected = ((d as any).serviceSubCategories || []).includes(subKey);
                    return <button key={sub} onClick={() => { const current = (d as any).serviceSubCategories || []; onOrderUpdate?.({ serviceSubCategories: selected ? current.filter((x: string) => x !== subKey) : [...current, subKey] } as any); }} className={`rounded-full border px-2 py-0.5 text-[9px] font-bold transition-all ${selected ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 text-slate-500 hover:border-blue-300"}`}>{sub}</button>;
                  })}</div>
                </div>
              )}
            </div>

            {/* Who's paying */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Billing</div>
              <div className="flex flex-wrap gap-1.5">
                {["Insurance", "Self-pay", "Referrer", "Other"].map(v => (
                  <button key={v} onClick={() => { const patch: any = { payorQuick: d.payorQuick === v ? "" : v }; if (v === "Insurance") { patch.involvesInsurance = "Yes"; patch.insuranceClaim = "Yes"; } upd("payorQuick", patch.payorQuick); if (patch.involvesInsurance) { onOrderUpdate?.({ involvesInsurance: "Yes", insuranceClaim: "Yes" } as any); } }} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${d.payorQuick === v ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>{v}</button>
                ))}
              </div>
              {d.payorQuick === "Insurance" && (
                <div className="grid grid-cols-2 gap-2">
                  <MobileField label="Insurance Co." value={d.insuranceCompany} onChange={v => upd("insuranceCompany", v)} />
                  <MobileField label="Adjuster" value={d.insuranceAdjuster} onChange={v => upd("insuranceAdjuster", v)} />
                </div>
              )}
            </div>

            {/* Event Instructions */}
            <div className="rounded-[12px] border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Event Instructions</div>
              {(d.serviceOfferings || []).length > 0 && (
                <div className="text-[10px] text-sky-600 font-semibold">Services: {(d.serviceOfferings || []).map(s => {
                  const subs = ((d as any).serviceSubCategories || []).filter((x: string) => x.startsWith(`${s}: `)).map((x: string) => x.replace(`${s}: `, ""));
                  return subs.length > 0 ? `${s} (${subs.join(", ")})` : s;
                }).join(", ")}</div>
              )}
              <textarea value={d.eventInstructions || ""} onChange={e => upd("eventInstructions", e.target.value)} placeholder="Instructions for field team..." rows={3} className="w-full rounded-[8px] border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-800 outline-none focus:border-blue-400 bg-white resize-none" />
            </div>

            {/* Save */}
            <button onClick={(e) => { syncScopeToNoe(); const btn = e.currentTarget; btn.textContent = "Saved!"; btn.classList.add("!bg-green-600"); setTimeout(() => { btn.textContent = "Save Order"; btn.classList.remove("!bg-green-600"); }, 1500); }} className="w-full rounded-[12px] bg-blue-600 py-3 text-[13px] font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm transition-colors">
              Save Order
            </button>

            {/* Open desktop order — fallback */}
            <button onClick={() => { if (onShowOrder) onShowOrder(); }} className="w-full rounded-[12px] border border-slate-200 bg-white py-3 text-[13px] font-bold text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              Open Desktop View
            </button>
          </div>
        </div>
        );
      })()}

      {/* ═══ INTERVIEW TAB ═══ */}
      {activeTab === "interview" && (
        <div className="flex-1 overflow-auto bg-white" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[17px] font-bold text-slate-900">Interview</span>
              <span className="rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-bold">{interviewAnswered}/{interviewTotal}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-[12px] text-slate-400 flex-1">Ask the customer these questions during or before the initial visit.</div>
              <button onClick={() => { const el = document.getElementById("interview-timeline-header"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="rounded-full bg-teal-50 border border-teal-300 px-3 py-1.5 text-[11px] font-bold text-teal-700 hover:bg-teal-100 shrink-0 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Timeline</button>
            </div>
          </div>
          <div className="pb-20">
            {INTERVIEW_SECTIONS.map((section, qIdx) => {
              const answer = interviewAnswers[section.id];
              const noteKey = `${section.id}_note`;
              const noteVal = (interviewAnswers[noteKey] as string) || "";
              const hasAnswer = answer !== undefined && answer !== null && answer !== "" && (!Array.isArray(answer) || answer.length > 0);
              const isFirstTimeline = (section as any).timeline && (qIdx === 0 || !(INTERVIEW_SECTIONS[qIdx - 1] as any).timeline);
              return (
                <React.Fragment key={section.id}>
                {isFirstTimeline && (
                  <div id="interview-timeline-header" className="px-5 pt-4 pb-2 bg-teal-50 border-t-2 border-teal-300">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Delivery Timeline</span>
                      <span className="text-[9px] text-teal-500">These questions inform the Timeline</span>
                    </div>
                  </div>
                )}
                <div id={`app-interview-q-${qIdx + 1}`} className={`px-5 py-4 border-b border-slate-100 ${(section as any).timeline ? "bg-teal-50/20 border-l-4 border-l-teal-400" : ""}`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${hasAnswer ? ((section as any).timeline ? "bg-green-500 text-white" : "bg-sky-500 text-white") : "bg-slate-200 text-slate-500"}`}>{hasAnswer ? "✓" : qIdx + 1}</span>
                    <span className={`text-[13px] font-bold ${(section as any).timeline ? "text-teal-700" : "text-sky-600"}`}>{section.title}</span>
                    {section.critical && !hasAnswer && <span className="text-[10px] font-bold text-orange-500">Required</span>}
                  </div>
                  {section.type === "boolean" && (
                    <div className="space-y-2.5">
                      <div className="flex gap-2.5">
                        {["Yes", "No"].map(opt => (
                          <button key={opt} onClick={() => updateInterview(p => ({ ...p, [section.id]: opt === "Yes" }))} className={`flex-1 rounded-full border py-2.5 text-[13px] font-bold transition-all ${answer === (opt === "Yes") ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600"}`}>{opt}</button>
                        ))}
                      </div>
                      {answer === true && <input value={noteVal} onChange={e => updateInterview(p => ({ ...p, [noteKey]: e.target.value }))} placeholder="Details..." className="w-full rounded-[10px] border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-violet-400" />}
                    </div>
                  )}
                  {section.type === "single" && section.options && (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-2">
                        {section.options.map(opt => (
                          <button key={opt} onClick={() => updateInterview(p => ({ ...p, [section.id]: p[section.id] === opt ? "" : opt }))} className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${answer === opt ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600"}`}>{opt}</button>
                        ))}
                      </div>
                      {answer && <input value={noteVal} onChange={e => updateInterview(p => ({ ...p, [noteKey]: e.target.value }))} placeholder="Details..." className="w-full rounded-[10px] border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-violet-400" />}
                    </div>
                  )}
                  {section.type === "multi" && section.options && (
                    <div className="flex flex-wrap gap-2">
                      {section.options.map(opt => {
                        const selected = Array.isArray(answer) && answer.includes(opt);
                        return (
                          <button key={opt} onClick={() => updateInterview(p => {
                            const curr = Array.isArray(p[section.id]) ? (p[section.id] as string[]) : [];
                            return { ...p, [section.id]: selected ? curr.filter(o => o !== opt) : [...curr, opt] };
                          })} className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${selected ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600"}`}>{opt}</button>
                        );
                      })}
                    </div>
                  )}
                  {/* Done button — scrolls to next question */}
                  <div className="flex justify-end mt-2">
                    <button onClick={() => {
                      const nextEl = document.getElementById(`app-interview-q-${qIdx + 2}`);
                      if (nextEl) nextEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }} className={`rounded-md px-3 py-1 text-xs font-bold ${hasAnswer ? "bg-sky-500 text-white hover:bg-sky-600" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}>{hasAnswer ? "Next" : "Skip"}</button>
                  </div>
                </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ REPORT TAB — summary + open SDS ═══ */}
      {activeTab === "report" && (() => {
        const totalPhotos = Object.values(roomPhotos).reduce((s, arr) => s + arr.length, 0);
        const affRooms = homeRooms.flatMap((f, fi) => f.rooms.map((r, ri) => ({ ...r, fi, ri, floor: f.name }))).filter(r => r.affected);
        return (
        <div className="flex-1 overflow-auto bg-[#f5f7fb]" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="px-4 pt-4 pb-20 space-y-3">
            <div className="text-[18px] font-bold text-slate-900">Report</div>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[12px] bg-white border border-slate-200 p-3 text-center">
                <div className="text-[20px] font-bold text-blue-600">{affRooms.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Rooms</div>
              </div>
              <div className="rounded-[12px] bg-white border border-slate-200 p-3 text-center">
                <div className="text-[20px] font-bold text-green-600">{totalPhotos}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Photos</div>
              </div>
              <div className="rounded-[12px] bg-white border border-slate-200 p-3 text-center">
                <div className="text-[20px] font-bold text-violet-600">{interviewAnswered}/{interviewTotal}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Interview</div>
              </div>
            </div>
            {/* Open SDS button */}
            <button onClick={() => { if (onShowSds) onShowSds(); }} className="w-full rounded-[14px] bg-blue-600 py-4 text-[15px] font-bold text-white hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Open SDS Document
            </button>
            {/* Damage types */}
            {activeDamage.length > 0 && (
            <div className="rounded-[14px] border border-slate-200 bg-white p-4 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Damage Types</div>
              <div className="flex flex-wrap gap-2">
                {activeDamage.map(([code, level], i) => {
                  const dt = DAMAGE_TYPES.find(d => d.id === code);
                  return dt ? <span key={code} className={`rounded-full ${dt.color} px-3 py-1 text-[12px] font-bold text-white`}>{i === 0 ? "Primary: " : ""}{dt.icon} {dt.label} {level}</span> : null;
                })}
              </div>
            </div>
            )}
            {/* Room summary */}
            {affRooms.length > 0 && (
            <div className="rounded-[14px] border border-slate-200 bg-white p-4 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Affected Rooms</div>
              {affRooms.map(r => {
                const rKey = `${r.fi}-${r.ri}`;
                const photos = roomPhotos[rKey] || [];
                const depth = DEPTH_LEVELS.find(l => l.id === (roomDepthOverrides[rKey] ?? depthLevel))?.short || "";
                return (
                  <div key={rKey} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="text-[13px] font-semibold text-slate-800">{r.name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">{r.floor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {depth && <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold">{depth}</span>}
                      {photos.length > 0 && <span className="rounded-full bg-green-100 text-green-700 px-1.5 py-0.5 text-[9px] font-bold">{photos.length} photos</span>}
                      {r.isOrigin && <span className="rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[9px] font-bold">Origin</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
            {/* Action buttons */}
            <div className="flex gap-2">
              <button onClick={() => { if (onShowSds) onShowSds(); }} className="flex-1 rounded-[12px] border border-slate-200 bg-white py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.077 48.077 0 018.5 0" /></svg>
                Print / Save
              </button>
              <button onClick={() => { if (onShowSds) onShowSds(); }} className="flex-1 rounded-[12px] border border-slate-200 bg-white py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                Email
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ═══ SCOPE TAB — existing wizard content ═══ */}
      <div style={{ display: activeTab === "scope" ? "contents" : "none" }}>

      {/* Progress bar — tap to jump to completed steps */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1 bg-white">
        <div className="flex gap-1">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const visited = visitedSteps.has(stepNum);
            return (
              <button key={i} onClick={() => {
                if (stepNum === 5) { setStep(5); setShowWalkthrough(true); const fa = homeRooms.findIndex(f => f.rooms.some(r => r.affected)); if (fa >= 0) { const ri = homeRooms[fa].rooms.findIndex(r => r.affected); if (ri >= 0) setWalkthroughRoom({ fi: fa, ri }); } }
                else { setStep(stepNum); setShowWalkthrough(false); setWalkthroughRoom(null); }
              }} className={`flex-1 flex flex-col items-center gap-1 cursor-pointer`}>
                <div className={`w-full h-1.5 rounded-full transition-all ${active ? "bg-blue-400" : visited ? "bg-blue-500" : "bg-slate-200"}`} />
                <span className={`text-[11px] font-semibold ${active ? "text-blue-600" : visited ? "text-blue-500" : "text-slate-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event context — collapsible overview of what's known */}
      {orderData && (orderData as any).orderName && (() => {
        const d = orderData as any;
        const custName = [d.customers?.[0]?.first, d.customers?.[0]?.last].filter(Boolean).join(" ");
        const addr = d.addresses?.[0];
        const addrLine = addr ? [addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(", ") : "";
        const lossType = d.primaryLossType || "";
        const services = (d.serviceOfferings || []).slice(0, 5);
        const instructions = (d.eventInstructions || "").split("\n").filter(l => !l.startsWith("Delivery:")).join("\n").trim();
        const hasContext = custName || addrLine || lossType || services.length || instructions;
        if (!hasContext) return null;
        return (
          <button onClick={() => setExpandedContext(!expandedContext)} className="flex-shrink-0 w-full text-left border-b border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                <span className="text-[12px] font-bold text-slate-700 truncate">{d.orderName}{custName ? ` - ${custName}` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {lossType && <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[9px] font-bold">{lossType}</span>}
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedContext ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </div>
            {expandedContext && (
              <div className="mt-2 space-y-1.5 text-[11px]" onClick={e => e.stopPropagation()}>
                {addrLine && <div className="text-slate-600">{addrLine}</div>}
                {services.length > 0 && <div className="flex flex-wrap gap-1">{services.map((s: string) => <span key={s} className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[9px] font-bold">{s}</span>)}</div>}
                {instructions && (
                  <div className="rounded-[8px] bg-sky-50 border border-sky-200 px-2.5 py-2 text-[11px] text-sky-800 whitespace-pre-wrap max-h-24 overflow-auto">{instructions}</div>
                )}
              </div>
            )}
          </button>
        );
      })()}

      {/* Content */}
      <div ref={scopeContentRef} className="flex-1 overflow-auto bg-[#f5f7fb]" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="px-4 pt-4 pb-28">
          {/* Question */}
          <div className="mb-4">
            <div className="text-[18px] font-bold text-slate-900 leading-tight">{stepQuestions[step - 1]}</div>
          </div>

          {/* Step guidance — static inline, controlled by coaching toggle */}
          {parentShowCoaching && toastMsg && !dismissedToasts.has(toastKey) && (
            <div className="flex items-start gap-2 rounded-[12px] bg-violet-50 border border-violet-200 px-3 py-2 mb-3" onClick={() => setDismissedToasts(p => new Set(p).add(toastKey))}>
              <span className="text-violet-500 text-[11px] mt-0.5 shrink-0">🎓</span>
              <span className="text-[11px] text-violet-600 leading-relaxed flex-1">{toastMsg}</span>
              <span className="text-[9px] text-violet-300 font-bold shrink-0 mt-0.5">×</span>
            </div>
          )}

          {/* Step 1: Property Type */}
          {step === 1 && (() => {
            // BuildingIcon — imported from ./components/atoms
            return (
            <div className="space-y-3">
              {/* Show full grid when nothing selected, compact bar when selected */}
              {!propType ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {PROPERTY_TYPES.map(pt => (
                    <button key={pt.id} onClick={() => { setPropType(pt.id); setPropSubType(""); setWorkScope(noeApt ? "unit" : (SCOPE_DEFAULTS[pt.id] || "building")); const defs: Record<string,boolean> = {}; (ACCESS_DEFAULTS[pt.id] || []).forEach(k => { defs[k] = true; }); setAccessDetails(defs); }} className="flex flex-col items-center rounded-[14px] border-2 px-1 py-1 transition-all border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500">
                      {<BuildingIcon id={pt.id} />}
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-bold leading-tight text-center text-slate-700">{pt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <button onClick={() => setPropType("")} className="w-full flex items-center gap-3 rounded-[14px] border-2 border-blue-500 bg-blue-50 px-4 py-2.5 text-left">
                  <div className="text-blue-600 shrink-0" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={`/icons/${propType}.png`} alt={propType} className="w-16 h-16 object-contain" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] font-bold text-blue-700">{selectedPropObj?.label}</span>
                    {propType === "highrise" && <span className="ml-1.5 rounded px-1 py-0.5 text-[9px] font-bold bg-blue-600 text-white">6+</span>}
                  </div>
                  <span className="text-[12px] font-bold text-blue-500">Change</span>
                </button>
              )}
              {/* Access & Logistics — contextual per type */}
              {propType && (
                <div className="space-y-3">
                  {(ACCESS_FOR_TYPE[propType] || ACCESS_FOR_TYPE.house).map(group => (
                    <div key={group.label}>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-1.5 px-1">{group.label}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map(item => (
                          <button key={item} onClick={() => setAccessDetails(p => ({ ...p, [item]: !p[item] }))} className={`rounded-full border-2 px-3.5 py-1.5 text-[12px] font-semibold transition-all ${accessDetails[item] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>{item}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Unit or Entire — for multi-unit building types */}
              {propType && (SCOPE_DEFAULTS[propType] === "unit" || showScopeToggle) && (
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-1.5 px-1">Unit / Suite</div>
                    <div className="flex gap-2">
                      <input value={unitNumber} onChange={e => { setUnitNumber(e.target.value); if (e.target.value) setWorkScope("unit"); }} placeholder="e.g. 112, Suite 4B" className="flex-1 h-11 rounded-[12px] border-2 border-slate-200 px-4 text-[15px] font-bold text-slate-800 outline-none focus:border-blue-400 bg-white" />
                      <button onClick={() => { setWorkScope("building"); setUnitNumber(""); setUnitFloorLevel(""); }} className={`rounded-[12px] border-2 px-4 h-11 text-[13px] font-bold transition-all ${workScope === "building" && !unitNumber ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>Entire Building</button>
                    </div>
                  </div>
                  {unitNumber && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-1.5 px-1">Unit is on floor</div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => setUnitFloorLevel(n)} className={`flex-1 h-10 rounded-[10px] border-2 text-[14px] font-bold transition-all ${unitFloorLevel === n ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{n}</button>
                        ))}
                        <button onClick={() => { const v = prompt("Floor:"); if (v) setUnitFloorLevel(Number(v)); }} className={`w-10 h-10 rounded-[10px] border-2 text-[13px] font-bold ${typeof unitFloorLevel === "number" && unitFloorLevel > 5 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-400"}`}>{typeof unitFloorLevel === "number" && unitFloorLevel > 5 ? unitFloorLevel : "+"}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>);
          })()}

          {/* Step 2: Unit details */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Floors — hidden for trailers (always 1) */}
              {propType === "trailer" && floors !== 1 && (() => { setFloors(1); return null; })()}
              {propType !== "trailer" && <div>
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-2">{!isHouseType && isMultiUnit && workScope !== "building" ? "Floors in Unit" : "Floors"}</div>
                <div className="flex gap-2">
                  {(isMultiUnit ? [1, 2, 3] : [1, 2, 3, 4]).map(n => (
                    <button key={n} onClick={() => setFloors(n)} className={`flex-1 h-12 rounded-[12px] border-2 text-[16px] font-bold transition-all ${floors === n ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{n}</button>
                  ))}
                  <button onClick={() => { const v = prompt("Floors:"); if (v) setFloors(Number(v)); }} className={`w-12 h-12 rounded-[12px] border-2 text-[14px] font-bold ${typeof floors === "number" && floors > (isMultiUnit ? 3 : 4) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-400"}`}>{typeof floors === "number" && floors > (isMultiUnit ? 3 : 4) ? floors : "+"}</button>
                </div>
                {/* Basement / Attic — not for trailers */}
                {propType !== "trailer" && (isHouseType || workScope === "building") && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setHasBasement(!hasBasement)} className={`flex-1 rounded-[10px] border-2 py-2 text-[13px] font-bold transition-all ${hasBasement ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>
                      {hasBasement ? "Basement ✓" : "+ Basement"}
                    </button>
                    <button onClick={() => setHasAttic(!hasAttic)} className={`flex-1 rounded-[10px] border-2 py-2 text-[13px] font-bold transition-all ${hasAttic ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>
                      {hasAttic ? "Attic ✓" : "+ Attic"}
                    </button>
                  </div>
                )}
              </div>}
              {/* Beds — hide for commercial/storefront */}
              {!["commercial", "storefront"].includes(propType) && (
              <div>
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-2">Bedrooms</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setBeds(n)} className={`flex-1 h-12 rounded-[12px] border-2 text-[16px] font-bold transition-all ${beds === n ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{n}</button>
                  ))}
                  <button onClick={() => { const v = prompt("Bedrooms:"); if (v) setBeds(Number(v)); }} className={`w-12 h-12 rounded-[12px] border-2 text-[14px] font-bold ${typeof beds === "number" && beds > 5 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-400"}`}>{typeof beds === "number" && beds > 5 ? beds : "+"}</button>
                </div>
              </div>
              )}
              {/* Sq ft slider — range adapts to property type */}
              {(() => {
                const ranges: Record<string, { min: number; max: number; step: number; def: number; marks: [string, string, string, string] }> = {
                  trailer:    { min: 200, max: 2000, step: 50, def: 800, marks: ["200", "500", "1k", "2k"] },
                  house:      { min: 500, max: 5000, step: 100, def: 1800, marks: ["500", "1.5k", "3k", "5k"] },
                  largehouse: { min: 2000, max: 10000, step: 100, def: 4000, marks: ["2k", "4k", "7k", "10k"] },
                  estate:     { min: 3000, max: 25000, step: 500, def: 8000, marks: ["3k", "8k", "15k", "25k"] },
                  townhouse:  { min: 800, max: 4000, step: 100, def: 1600, marks: ["800", "1.5k", "2.5k", "4k"] },
                  lowrise:    { min: 400, max: 3000, step: 50, def: 1000, marks: ["400", "1k", "2k", "3k"] },
                  highrise:   { min: 400, max: 5000, step: 50, def: 1200, marks: ["400", "1.5k", "3k", "5k"] },
                  storefront: { min: 500, max: 15000, step: 100, def: 2000, marks: ["500", "3k", "8k", "15k"] },
                  commercial: { min: 1000, max: 100000, step: 500, def: 10000, marks: ["1k", "10k", "50k", "100k"] },
                };
                const r = ranges[propType] || ranges.house;
                return (
                <div>
                  <div className="text-center mb-3">
                    <span className={`text-[28px] font-extrabold tabular-nums ${sqft ? "text-blue-700" : "text-slate-300"}`}>{sqft ? Number(sqft).toLocaleString() : "—"}</span>
                    <span className={`text-[14px] font-bold ml-1.5 ${sqft ? "text-blue-500" : "text-slate-300"}`}>Square Feet</span>
                  </div>
                  <input type="range" min={r.min} max={r.max} step={r.step} value={sqft || String(r.def)} onChange={e => setSqft(e.target.value)} className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-blue-600 cursor-pointer" />
                  <div className="flex justify-between mt-1.5">
                    {r.marks.map((m, i) => <span key={i} className="text-[12px] font-semibold text-slate-500">{m}</span>)}
                  </div>
                </div>
                );
              })()}
              {/* Auto-add rooms toggle */}
              <div className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 py-2.5">
                <div>
                  <div className="text-[13px] font-semibold text-slate-700">Auto-add common rooms</div>
                  <div className="text-[11px] text-slate-400">Include all rooms in photo walkthrough</div>
                </div>
                <button onClick={() => setAutoAddRooms(!autoAddRooms)} className={`relative w-11 h-6 rounded-full transition-colors ${autoAddRooms ? "bg-blue-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAddRooms ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Rooms — add, delete, rename, drag */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="text-[12px] text-slate-500 px-1">{totalRoomCount} rooms across {homeRooms.length} floors. Tap name to rename, drag to move.</div>
                  {homeRooms.map((floor, fi) => (
                    <div key={fi} className={`rounded-[14px] border overflow-hidden shadow-sm transition-all ${highlightedFloor === fi ? "outline outline-2 outline-orange-400 bg-orange-50/30" : dragRoom && dragRoom.fi !== fi ? "border-blue-300 bg-blue-50/20" : "border-slate-200 bg-white"}`} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }} onDrop={e => { e.preventDefault(); handleDrop(fi); }}>
                      <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between">
                        <span className="text-[14px] font-extrabold text-slate-800">{floor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-slate-400">{floor.rooms.length}</span>
                          <button onClick={() => {
                            if (floor.rooms.length > 0) {
                              window.alert(`${floor.name} has ${floor.rooms.length} room(s). Move or delete the rooms first.`);
                              return;
                            }
                            setHighlightedFloor(fi);
                            setTimeout(() => { setHomeRooms(prev => prev.filter((_, i) => i !== fi)); setHighlightedFloor(null); }, 1500);
                          }} className="h-6 w-6 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-sm font-bold">×</button>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {floor.rooms.map((room, ri) => (
                          renamingRoom?.fi === fi && renamingRoom?.ri === ri ? (
                            <div key={ri} className="px-4 py-2 flex items-center gap-2 bg-blue-50">
                              <input value={renameText} onChange={e => setRenameText(e.target.value)} onKeyDown={e => {
                                if (e.key === "Enter" && renameText.trim()) { setHomeRooms(prev => { const next = [...prev]; const rooms = [...next[fi].rooms]; rooms[ri] = { ...rooms[ri], name: renameText.trim() }; next[fi] = { ...next[fi], rooms }; return next; }); setRenamingRoom(null); }
                                if (e.key === "Escape") setRenamingRoom(null);
                              }} autoFocus className="flex-1 rounded-[8px] border-2 border-blue-400 px-3 py-1.5 text-[13px] font-bold text-slate-800 outline-none bg-white" />
                              <button onClick={() => { if (renameText.trim()) { setHomeRooms(prev => { const next = [...prev]; const rooms = [...next[fi].rooms]; rooms[ri] = { ...rooms[ri], name: renameText.trim() }; next[fi] = { ...next[fi], rooms }; return next; }); setRenamingRoom(null); }}} className="h-8 w-8 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">✓</button>
                              <button onClick={() => setRenamingRoom(null)} className="h-8 w-8 rounded-lg text-slate-500 text-sm font-bold flex items-center justify-center hover:bg-slate-100">×</button>
                            </div>
                          ) : (
                            <div key={ri} draggable onDragStart={() => setDragRoom({fi, ri})} onDragEnd={() => setDragRoom(null)} onMouseDown={() => setDragRoom({fi, ri})} onMouseUp={() => setDragRoom(null)} className={`px-3 py-2.5 flex items-center gap-2.5 cursor-grab active:cursor-grabbing transition-all ${dragRoom?.fi === fi && dragRoom?.ri === ri ? "outline outline-2 outline-orange-400 rounded-lg bg-orange-50/30" : highlightedRoom === room.name ? "outline outline-2 outline-orange-400 rounded-lg bg-orange-50/30" : fadingRoom === room.name ? "outline outline-2 outline-orange-400 rounded-lg bg-orange-50/30 opacity-0 transition-opacity duration-[1500ms]" : ""}`}>
                              <span onClick={() => { setRenamingRoom({fi, ri}); setRenameText(room.name); }} className="flex-1 text-[14px] font-semibold text-slate-800 cursor-text">{room.name}</span>
                              <button onClick={() => {
                                const rKey = `${fi}-${ri}`;
                                const hasInstructions = !!(roomNotes[rKey]?.trim()) || (roomHandlingCodes[rKey]?.length || 0) > 0 || (roomReasonCodes[rKey]?.length || 0) > 0;
                                if (hasInstructions && !window.confirm(`"${room.name}" has instructions. Delete anyway?`)) return;
                                setFadingRoom(room.name);
                                setTimeout(() => { setHomeRooms(prev => { const next = [...prev]; next[fi] = { ...next[fi], rooms: next[fi].rooms.filter((_, i) => i !== ri) }; return next; }); setFadingRoom(null); }, 1500);
                              }} className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0">×</button>
                            </div>
                          )
                        ))}
                        {/* Add room — inline search */}
                        {addingToFloor === fi ? (
                          <div className="px-3 py-3 bg-slate-50/80">
                            <div className="flex gap-2 items-center mb-2">
                              <input value={addSearch} onChange={e => setAddSearch(e.target.value)} onKeyDown={e => {
                                if (e.key === "Enter" && addSearch.trim()) {
                                  const match = ROOM_LIST.find(r => r.toLowerCase().startsWith(addSearch.toLowerCase()));
                                  addRoom(fi, match || addSearch.trim());
                                  setAddSearch("");
                                }
                                if (e.key === "Escape") { setAddingToFloor(null); setAddSearch(""); }
                              }} autoFocus placeholder="Type room name..." className="flex-1 rounded-[10px] border-2 border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-800 outline-none focus:border-blue-400 bg-white" />
                              <button onClick={() => { setAddingToFloor(null); setAddSearch(""); }} className="text-[13px] font-bold text-slate-500">Done</button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-auto">
                              {(() => {
                                const existing = new Set(homeRooms.flatMap(f => f.rooms.map(r => r.name)));
                                const repeatable = new Set(["Bedroom", "Bathroom", "Half Bath", "Closet", "Walk-in Closet", "Hallway", "Storage"]);
                                return (addSearch.trim() ? ROOM_LIST.filter(r => r.toLowerCase().includes(addSearch.toLowerCase())) : ROOM_LIST.slice(0, 14)).filter(r => !existing.has(r) || repeatable.has(r));
                              })().map(r => (
                                <button key={r} onClick={() => { addRoom(fi, r); setAddSearch(""); }} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700">{r}</button>
                              ))}
                              {addSearch.trim() && !ROOM_LIST.some(r => r.toLowerCase() === addSearch.toLowerCase()) && (
                                <button onClick={() => { addRoom(fi, addSearch.trim()); setAddSearch(""); }} className="rounded-full bg-blue-50 border border-blue-300 px-3 py-1 text-[11px] font-bold text-blue-700">+ "{addSearch.trim()}"</button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAddingToFloor(fi)} className="w-full px-4 py-2 text-left text-[12px] font-bold text-blue-500 hover:bg-slate-50">+ Add room</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Add floor */}
                  <div className="flex flex-wrap gap-2">
                    {!homeRooms.some(f => /basement/i.test(f.name)) && <button onClick={() => { const aff = activeDamage.length > 0; setHomeRooms(prev => [{ name: "Basement", rooms: [{ name: "Rec", affected: aff }, { name: "Laundry", affected: aff }, { name: "Storage", affected: aff }] }, ...prev]); setHighlightedFloor(0); setTimeout(() => setHighlightedFloor(null), 1500); }} className="rounded-full border-2 border-dashed border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-700">+ Basement</button>}
                    {!homeRooms.some(f => /attic/i.test(f.name)) && <button onClick={() => { const aff = activeDamage.length > 0; setHomeRooms(prev => { const next = [...prev, { name: "Attic", rooms: [{ name: "Attic", affected: aff }] }]; setHighlightedFloor(next.length - 1); setTimeout(() => setHighlightedFloor(null), 1500); return next; }); }} className="rounded-full border-2 border-dashed border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-700">+ Attic</button>}
                    <button onClick={() => setHomeRooms(prev => { const next = [...prev, { name: `Floor ${prev.length + 1}`, rooms: [] }]; setHighlightedFloor(next.length - 1); setTimeout(() => setHighlightedFloor(null), 1500); return next; })} className="rounded-full border-2 border-dashed border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-600 hover:border-blue-400 hover:text-blue-700">+ Floor</button>
                  </div>
            </div>
          )}

          {/* Step 4: Severity — 3 passes: Damage types, Impact, Instructions */}
          {step === 4 && (
            <div className="space-y-3">
              {/* Pass indicator */}
              <div className="flex rounded-[10px] bg-slate-100 p-1">
                {([
                  { id: 1 as const, label: "Severity" },
                  { id: 2 as const, label: "Impact" },
                  { id: 3 as const, label: "Instructions" },
                ]).map(pass => (
                  <button key={pass.id} onClick={() => setRoomPass(pass.id)} className={`flex-1 rounded-[8px] py-2 text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${roomPass === pass.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${roomPass > pass.id ? "bg-blue-600 text-white" : roomPass === pass.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-400"}`}>{roomPass > pass.id ? "✓" : pass.id}</span>
                    {pass.label}
                  </button>
                ))}
              </div>

              {/* Interview accessible from footer bar */}

              {/* Pass 1: Severity — damage types with expandable details */}
              {roomPass === 1 && (
                <div className="space-y-3">
                  {/* Uniform severity toggle */}
                  {activeDamage.length > 0 && (
                    <div className="flex items-center justify-between rounded-[14px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <span className="text-[13px] font-semibold text-slate-700">Same severity throughout?</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setUniformSeverity(true)} className={`rounded-[8px] border-2 px-3.5 py-1.5 text-[12px] font-bold transition-all ${uniformSeverity ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>Yes</button>
                        <button onClick={() => setUniformSeverity(false)} className={`rounded-[8px] border-2 px-3.5 py-1.5 text-[12px] font-bold transition-all ${!uniformSeverity ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>No</button>
                      </div>
                    </div>
                  )}
                  {DAMAGE_TYPES.map(dt => {
                    const level = damageTypes[dt.id] || 0;
                    const isActive = level !== 0;
                    const primaryId = activeDamage.length > 0 ? activeDamage[0][0] : null;
                    const isIncompatible = primaryId && !isActive && primaryId !== dt.id && !(COMPATIBLE_SECONDARIES[primaryId] || []).includes(dt.id);
                    const isExpanded = expandedDamage === dt.id;
                    const details = damageDetails[dt.id] || {};
                    const isPrimary = activeDamage.length > 0 && activeDamage[0][0] === dt.id;
                    const isSecondary = isActive && !isPrimary;
                    return (
                      <div key={dt.id} className={`rounded-[16px] border-2 overflow-hidden transition-all ${isActive ? dt.border : isIncompatible ? "border-slate-100 opacity-40" : "border-slate-200"} bg-white`}>
                        <button onClick={() => { if (isIncompatible) return; if (isActive) { setExpandedDamage(expandedDamage === dt.id ? null : dt.id); } else { toggleDamage(dt.id); } }} className={`w-full flex items-center justify-between px-4 py-3 text-left ${isActive ? dt.light : ""} ${isIncompatible ? "cursor-not-allowed" : ""}`}>
                          <div className="flex items-center gap-2">
                            <div className={`text-[16px] font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}><span className="mr-1.5">{dt.icon}</span>{dt.label}</div>
                            {isPrimary && <span className="rounded-full bg-slate-800 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">Primary</span>}
                            {isSecondary && (
                              <span role="button" onClick={(e) => { e.stopPropagation(); setDamageTypes(p => { const reordered: Record<string, number> = { [dt.id]: p[dt.id] || 1 }; Object.entries(p).forEach(([k, v]) => { if (k !== dt.id) reordered[k] = v; }); return reordered; }); }} className="rounded-full bg-slate-200 text-slate-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide hover:bg-slate-800 hover:text-white transition-colors cursor-pointer" title="Tap to make primary">Secondary</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isActive && level > 0 && <span className={`rounded-full ${dt.color} px-2.5 py-0.5 text-[12px] font-bold text-white`}>{dt.label[0]}{level}</span>}
                            {isActive && level < 0 && <span className={`rounded-full bg-amber-400 px-2.5 py-0.5 text-[12px] font-bold text-white`}>{dt.label[0]}?</span>}
                            {!isActive && <span className="text-[13px] text-slate-400">Tap to add</span>}
                          </div>
                        </button>
                        {isActive && expandedDamage === dt.id && (
                          <div className="px-4 py-3 border-t border-slate-100 space-y-3">
                            <div>
                              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-2">Severity</div>
                              <div className="flex gap-1.5">
                                {[1, 2, 3].map(n => (
                                  <button key={n} onClick={() => setDamageLevel(dt.id, level === n ? 0 : n)} className={`flex-1 h-9 rounded-[8px] border-2 text-[14px] font-bold transition-all ${level === n ? `${dt.color} text-white border-transparent` : "border-slate-200 text-slate-500"}`}>{n}</button>
                                ))}
                              </div>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px]">Details</div>
                            {(
                              <div className="space-y-2">
                                {dt.details.map(detail => {
                                  const dVal = details[detail] || 0;
                                  return (
                                    <div key={detail} className="flex items-center justify-between">
                                      <span className="text-[13px] font-medium text-slate-700">{detail}</span>
                                      <div className="flex gap-1.5">
                                        {[0, 1, 2, 3].map(n => (
                                          <button key={n} onClick={() => {
                                            setDamageDetails(p => ({ ...p, [dt.id]: { ...(p[dt.id] || {}), [detail]: n } }));
                                            const updated = { ...(damageDetails[dt.id] || {}), [detail]: n };
                                            const maxVal = Math.max(...Object.values(updated), 0);
                                            if (maxVal > level) setDamageLevel(dt.id, maxVal);
                                          }} className={`w-9 h-8 rounded-[8px] border-2 text-[12px] font-bold transition-all ${dVal === n ? (n > 0 ? `${dt.color} text-white border-transparent` : "border-slate-400 bg-slate-100 text-slate-600") : "border-slate-200 text-slate-500"}`}>{n}</button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pass 2: Impact — mark affected, severity badges, floor severity edit */}
              {roomPass === 2 && (
                <>
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-[13px] font-bold ${totalAffected === totalRoomCount ? "text-blue-700" : "text-slate-700"}`}>
                      {totalAffected === totalRoomCount ? "Entire Property" : `${totalAffected} of ${totalRoomCount} rooms`}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => markAll(true)} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${totalAffected === totalRoomCount ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-600"}`}>All</button>
                      <button onClick={() => markAll(false)} className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-600">Clear</button>
                    </div>
                  </div>
                  {homeRooms.map((floor, fi) => {
                    const floorAff = floor.rooms.filter(r => r.affected).length;
                    return (
                      <div key={fi} className="rounded-[14px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <button onClick={() => markFloor(fi)} className={`w-full px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-left ${floorAff === floor.rooms.length && floor.rooms.length > 0 ? "bg-blue-50" : "bg-slate-50"}`}>
                          <span className="text-[14px] font-extrabold text-slate-800">{floor.name}</span>
                          <div className="flex items-center gap-2">
                            {activeDamage.length > 0 && floorAff > 0 && (
                              <span role="button" onClick={(e) => { e.stopPropagation(); setEditingFloorSev(editingFloorSev === fi ? null : fi); }} className="flex items-center gap-0.5 cursor-pointer">
                                {activeDamage.map(([code, level]) => {
                                  const dt = DAMAGE_TYPES.find(d => d.id === code);
                                  const floorLevel = floorSevOverrides[fi]?.[code] ?? level;
                                  return dt ? <span key={code} className={`rounded-full ${dt.color} px-1.5 py-0.5 text-[9px] font-bold text-white`}>{dt.label[0]}{floorLevel}</span> : null;
                                })}
                              </span>
                            )}
                            <span className={`text-[12px] font-bold ${floorAff > 0 ? "text-blue-600" : "text-slate-400"}`}>{floorAff}/{floor.rooms.length}</span>
                          </div>
                        </button>
                        {editingFloorSev === fi && (
                          <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 space-y-2">
                            {activeDamage.map(([code, level]) => {
                              const dt = DAMAGE_TYPES.find(d => d.id === code);
                              if (!dt) return null;
                              const floorLevel = floorSevOverrides[fi]?.[code] ?? level;
                              return (
                                <div key={code} className="flex items-center justify-between">
                                  <span className="text-[12px] font-semibold text-slate-700">{dt.icon} {dt.label}</span>
                                  <div className="flex gap-1">
                                    {[0, 1, 2, 3].map(n => (
                                      <button key={n} onClick={() => {
                                        // Set floor-level override
                                        setFloorSevOverrides(p => ({ ...p, [fi]: { ...(p[fi] || {}), [code]: n } }));
                                        // Apply to all affected rooms on this floor
                                        floor.rooms.forEach((r, ri) => { if (r.affected) { setRoomSevOverrides(p => ({ ...p, [`${fi}-${ri}`]: { ...(p[`${fi}-${ri}`] || {}), [code]: n } })); }});
                                      }} className={`w-9 h-8 rounded-[7px] border-2 text-[12px] font-bold transition-all ${floorLevel === n ? (n > 0 ? `${dt.color} text-white border-transparent` : "border-slate-400 bg-slate-100 text-slate-600") : "border-slate-200 text-slate-500"}`}>{n}</button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            <button onClick={() => setEditingFloorSev(null)} className="text-[11px] font-bold text-blue-600">Done</button>
                          </div>
                        )}
                        <div className="divide-y divide-slate-100">
                          {floor.rooms.map((room, ri) => {
                            const rKey = `${fi}-${ri}`;
                            const overrides = roomSevOverrides[rKey] || {};
                            return (
                              <div key={ri} className={`px-4 py-2.5 flex items-center gap-3 ${room.affected ? "bg-blue-50/40" : ""}`}>
                                <button onClick={() => markRoom(fi, ri)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${room.affected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"}`}>
                                  {room.affected && <span className="text-[10px] font-bold">✓</span>}
                                </button>
                                <span onClick={() => markRoom(fi, ri)} className={`flex-1 text-[14px] cursor-pointer ${room.affected ? "font-semibold text-slate-800" : "text-slate-400"}`}>{room.name}</span>
                                {room.affected && (originRoom === rKey || !originRoom) && <button onClick={(e) => { e.stopPropagation(); setOriginRoom(originRoom === rKey ? "" : rKey); }} className={`rounded-full border px-2 py-0.5 text-[9px] font-bold shrink-0 ${originRoom === rKey ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-400 hover:border-red-300"}`}>{originRoom === rKey ? "Origin ✓" : "Origin"}</button>}
                                {room.affected ? (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingRoom({fi, ri}); }} className="flex items-center gap-1">
                                    {activeDamage.map(([code, level]) => {
                                      const dt = DAMAGE_TYPES.find(d => d.id === code);
                                      if (!dt) return null;
                                      const roomLevel = overrides[code] ?? floorSevOverrides[fi]?.[code] ?? level;
                                      return <span key={code} className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${roomLevel > 0 ? dt.color : "bg-slate-300"}`}>{dt.label[0]}{roomLevel}</span>;
                                    })}
                                  </button>
                                ) : (
                                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">Not Affected</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Pass 3: Instructions — multi-select + bulk apply */}
              {roomPass === 3 && (() => {
                const [selectedKeys, setSelectedKeys] = [wizSelectedRooms, setWizSelectedRooms];
                const rKey2 = (fi: number, ri: number) => `${fi}-${ri}`;
                const isSelected2 = (fi: number, ri: number) => selectedKeys.has(rKey2(fi, ri));
                const toggleSel = (fi: number, ri: number) => setSelectedKeys(p => { const n = new Set(p); n.has(rKey2(fi, ri)) ? n.delete(rKey2(fi, ri)) : n.add(rKey2(fi, ri)); return n; });
                const selectFloor2 = (fi: number) => {
                  setSelectedKeys(p => {
                    const n = new Set(p);
                    const keys = homeRooms[fi].rooms.map((r, ri) => r.affected ? rKey2(fi, ri) : "").filter(Boolean);
                    const allOn = keys.every(k => n.has(k));
                    keys.forEach(k => allOn ? n.delete(k) : n.add(k));
                    return n;
                  });
                };
                const selectAll2 = () => {
                  const keys = new Set<string>();
                  homeRooms.forEach((f, fi) => f.rooms.forEach((r, ri) => { if (r.affected) keys.add(rKey2(fi, ri)); }));
                  setSelectedKeys(keys);
                };
                const clearSel = () => setSelectedKeys(new Set());
                const applyBulkHandling = (code: string) => {
                  setRoomHandlingCodes(p => {
                    const next = { ...p };
                    selectedKeys.forEach(key => {
                      const curr = next[key] || [];
                      next[key] = curr.includes(code) ? curr : [...curr, code];
                    });
                    return next;
                  });
                };
                const applyBulkDepth = (d: number) => {
                  // Per-room depth not stored separately yet — just update the default
                  setDepthLevel(d);
                };
                const applyBulkService = (svc: string) => {
                  setSelectedServices(p => ({ ...p, [svc]: true }));
                };
                const selNames: string[] = [];
                selectedKeys.forEach(key => { const [fi, ri] = key.split("-").map(Number); const r = homeRooms[fi]?.rooms[ri]; if (r) selNames.push(r.name); });

                return (
                <>
                  {/* Selection action bar */}
                  {selectedKeys.size > 0 && (
                    <div className="sticky top-0 z-10 rounded-[14px] border-2 border-blue-400 bg-blue-50 px-4 py-3 flex items-center justify-between shadow-sm">
                      <span className="text-[14px] font-bold text-blue-800">{selNames.length === 1 ? selNames[0] : `${selNames.length} rooms selected`}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setBulkEditing(true)} className="rounded-[10px] bg-blue-600 px-5 py-2 text-[13px] font-bold text-white hover:bg-blue-700 shadow-sm" style={{ boxShadow: "0 4px 10px rgba(37,99,235,.25)" }}>Edit</button>
                        <button onClick={clearSel} className="rounded-[10px] border border-slate-300 px-3 py-2 text-[12px] font-bold text-slate-600 bg-white hover:bg-slate-50">Clear</button>
                      </div>
                    </div>
                  )}

                  {/* Select rooms, then edit */}
                  <div className="text-[12px] text-slate-500 px-1">Select rooms to apply instructions.</div>
                  <div className="flex items-center gap-2 flex-wrap px-1">
                    <button onClick={selectAll2} className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 bg-white">All</button>
                    {homeRooms.map((f, fi) => f.rooms.some(r => r.affected) ? (
                      <button key={fi} onClick={() => selectFloor2(fi)} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 bg-white">{f.name}</button>
                    ) : null)}
                  </div>

                  {/* Room list with checkboxes */}
                  {homeRooms.map((floor, fi) => {
                    const affectedRooms = floor.rooms.map((r, ri) => ({ room: r, ri })).filter(x => x.room.affected);
                    if (!affectedRooms.length) return null;
                    return (
                      <div key={fi} className="rounded-[14px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <button onClick={() => selectFloor2(fi)} className="w-full bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between text-left">
                          <span className="text-[14px] font-extrabold text-blue-800">{floor.name}</span>
                          <span className="text-[12px] font-bold text-blue-600">{affectedRooms.length}</span>
                        </button>
                        <div className="divide-y divide-slate-100">
                          {affectedRooms.map(({ room, ri }) => {
                            const rKey = `${fi}-${ri}`;
                            const roomDepth = roomDepthOverrides[rKey] ?? depthLevel;
                            const depthLabel = DEPTH_LEVELS.find(l => l.id === roomDepth)?.short || "—";
                            const overrides = roomSevOverrides[rKey] || {};
                            const sel = isSelected2(fi, ri);
                            const hasNotes = !!(roomNotes[rKey]?.trim());
                            const hasReasons = (roomReasonCodes[rKey]?.length || 0) > 0;
                            const hasCodes = (roomHandlingCodes[rKey]?.length || 0) > 0;
                            const hasQuality = !!(roomQualityCodes[rKey]);
                            const isOriginRoom = originRoom === rKey;
                            const photoCount = (room as any).photoCount || 0;
                            const instructionCount = (hasNotes ? 1 : 0) + (hasReasons ? 1 : 0) + (hasCodes ? 1 : 0) + (hasQuality ? 1 : 0);
                            return (
                              <div key={ri} onClick={() => setEditingRoom({fi, ri})} className={`px-3 py-3 flex items-start gap-2.5 cursor-pointer active:bg-blue-50 ${sel ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                                <button onClick={(e) => { e.stopPropagation(); toggleSel(fi, ri); }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${sel ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"}`}>
                                  {sel && <span className="text-[10px] font-bold">✓</span>}
                                </button>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-semibold text-slate-800 truncate">{room.name}</span>
                                    {isOriginRoom && <span className="rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[9px] font-bold shrink-0">Origin</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-bold">{depthLabel}</span>
                                    {activeDamage.map(([code, level]) => {
                                      const dt = DAMAGE_TYPES.find(d => d.id === code);
                                      if (!dt) return null;
                                      const roomLevel = overrides[code] ?? floorSevOverrides[fi]?.[code] ?? level;
                                      return <span key={code} className={`rounded-full ${dt.color} px-1.5 py-0.5 text-[10px] font-bold text-white`}>{dt.label[0]}{roomLevel}</span>;
                                    })}
                                    {hasCodes && <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold">{roomHandlingCodes[rKey].length} codes</span>}
                                    {hasQuality && <span className="rounded-full bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[9px] font-bold">{roomQualityCodes[rKey]}</span>}
                                  </div>
                                </div>
                                {/* Status icons — photos (clickable) + instructions */}
                                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                  <button onClick={(e) => { e.stopPropagation(); setShowWalkthrough(true); setWalkthroughRoom({ fi, ri }); setTimeout(() => startCamera(), 300); }} className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold hover:ring-2 hover:ring-blue-300 transition-all ${photoCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>
                                    {photoCount > 0 ? <span>{photoCount}</span> : <span>+</span>}
                                  </button>
                                  <div className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold ${instructionCount > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    {instructionCount > 0 && <span>{instructionCount}</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Bulk edit bottom sheet */}
      {bulkEditing && wizSelectedRooms.size > 0 && (() => {
        const selKeys = Array.from(wizSelectedRooms);
        const selRoomNames = selKeys.map(k => { const [fi, ri] = k.split("-").map(Number); return homeRooms[fi]?.rooms[ri]?.name || ""; }).filter(Boolean);
        const applyToAll = (fn: (rKey: string) => void) => selKeys.forEach(fn);
        // Track what's been applied in this bulk session — use first selected room as reference
        const refKey = selKeys[0];
        const refDepth = roomDepthOverrides[refKey] ?? depthLevel;
        const refHandling = roomHandlingCodes[refKey] || [];
        return (
        <>
          <div className="fixed inset-0 bg-black/30 z-[100]" onClick={() => setBulkEditing(false)} />
          <div className="fixed bottom-0 left-1/2 z-[101] bg-white rounded-t-[22px] shadow-2xl w-[393px] max-w-full" style={{ maxHeight: "85vh", boxShadow: "0 -8px 30px rgba(0,0,0,.15)", transform: "translateX(-50%)" }}>
            <div className="flex flex-col items-center pt-2.5 pb-1"><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
            <div className="px-5 pb-3 flex items-center justify-between">
              <div>
                <div className="text-[17px] font-bold text-slate-800">{selRoomNames.length} rooms</div>
                {selRoomNames.length <= 4 && <div className="text-[12px] text-slate-500 mt-0.5">{selRoomNames.join(", ")}</div>}
              </div>
              <button onClick={() => setBulkEditing(false)} className="rounded-[12px] border border-slate-200 px-4 py-2 text-[14px] font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100">Done</button>
            </div>
            <div className="overflow-auto border-t border-slate-100 pb-6" style={{ maxHeight: "calc(85vh - 70px)" }}>
              {/* Cleaning Instructions */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-3">Cleaning Instructions</div>
                <div className="flex gap-2">
                  {DEPTH_LEVELS.map(lvl => (
                    <button key={lvl.id} onClick={() => applyToAll(rKey => setRoomDepthOverrides(p => ({ ...p, [rKey]: lvl.id })))} className={`flex-1 rounded-[10px] border-2 py-2.5 text-center transition-all active:scale-95 ${refDepth === lvl.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`text-[13px] font-bold ${refDepth === lvl.id ? "text-blue-700" : "text-slate-500"}`}>{lvl.id}</div>
                      <div className={`text-[9px] font-semibold ${refDepth === lvl.id ? "text-blue-500" : "text-slate-400"}`}>{lvl.short}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Severity */}
              {activeDamage.length > 0 && (
                <div className="px-5 py-4 border-b border-slate-100 space-y-3">
                  <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px]">Severity</div>
                  {activeDamage.map(([code, level]) => {
                    const dt = DAMAGE_TYPES.find(d => d.id === code);
                    if (!dt) return null;
                    const refSev = roomSevOverrides[refKey]?.[code] ?? level;
                    return (
                      <div key={code} className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-slate-700">{dt.icon} {dt.label}</span>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3].map(n => (
                            <button key={n} onClick={() => applyToAll(rKey => setRoomSevOverrides(p => ({ ...p, [rKey]: { ...(p[rKey] || {}), [code]: n } })))} className={`w-11 h-10 rounded-[10px] border-2 text-[14px] font-bold transition-all active:scale-95 ${refSev === n ? (n > 0 ? `${dt.color} text-white border-transparent` : "border-slate-400 bg-slate-100 text-slate-600") : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{n}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Handling codes */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-3">Handling Codes</div>
                <div className="flex flex-wrap gap-2">
                  {HANDLING_CODES_SCOPE.map(hc => {
                    const isActive = refHandling.includes(hc.code);
                    return (
                    <button key={hc.code} onClick={() => applyToAll(rKey => setRoomHandlingCodes(p => {
                      const curr = p[rKey] || [];
                      return { ...p, [rKey]: curr.includes(hc.code) ? curr.filter(c => c !== hc.code) : [...curr, hc.code] };
                    }))} title={hc.desc} className={`rounded-full border-2 px-4 py-2 text-[13px] font-bold transition-all active:scale-95 ${isActive ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"}`}>{hc.code}</button>
                  );})}
                </div>
              </div>
              {/* Services */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-3">Services</div>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map(s => (
                    <button key={s} onClick={() => setSelectedServices(p => ({ ...p, [s]: !p[s] }))} className={`rounded-full border-2 px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${selectedServices[s] ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{s}</button>
                  ))}
                </div>
              </div>
              {/* Room instructions text — appears on SDS cover photo */}
              <div className="px-5 py-4">
                <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-3">Room Instructions</div>
                <textarea value={(() => { const first = selKeys[0]; return roomNotes[first] || ""; })()} onChange={e => applyToAll(rKey => setRoomNotes(p => ({ ...p, [rKey]: e.target.value })))} rows={3} placeholder="Instructions for these rooms — will appear on SDS cover photo..." className="w-full rounded-[12px] border-2 border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-blue-400 resize-none bg-white" />
                {/* Summary preview */}
                {(() => {
                  const depth = DEPTH_LEVELS.find(l => l.id === refDepth)?.short || "";
                  const sevCodes = activeDamage.map(([code, level]) => { const o = roomSevOverrides[refKey]?.[code] ?? level; return `${DAMAGE_TYPES.find(d => d.id === code)?.label[0]}${o}`; }).join(" ");
                  const hCodes = refHandling.join(", ");
                  const svcs = Object.entries(selectedServices).filter(([,v]) => v).map(([k]) => k).join(", ");
                  const note = roomNotes[selKeys[0]] || "";
                  const hasSummary = depth || sevCodes || hCodes || svcs || note;
                  return hasSummary ? (
                    <div className="mt-3 rounded-[12px] bg-slate-50 border border-slate-200 px-4 py-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-1">SDS Preview</div>
                      <div className="text-[13px] text-slate-700 space-y-0.5">
                        {depth && <div><span className="font-bold">Cleaning:</span> {depth}</div>}
                        {sevCodes && <div><span className="font-bold">Severity:</span> {sevCodes}</div>}
                        {hCodes && <div><span className="font-bold">Handling:</span> {hCodes}</div>}
                        {svcs && <div><span className="font-bold">Services:</span> {svcs}</div>}
                        {note && <div><span className="font-bold">Notes:</span> {note}</div>}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </>
        );
      })()}

      {/* Room detail bottom sheet — clean accordion */}
      {editingRoom && (() => {
        const { fi, ri } = editingRoom;
        const room = homeRooms[fi]?.rooms[ri];
        if (!room) return null;
        const rKey = `${fi}-${ri}`;
        const overrides = roomSevOverrides[rKey] || {};
        const codes = roomHandlingCodes[rKey] || [];
        const qCode = roomQualityCodes[rKey] || "";
        const note = roomNotes[rKey] || "";
        const thisRoomDepth = roomDepthOverrides[rKey] ?? depthLevel;
        const depthShort = DEPTH_LEVELS.find(l => l.id === thisRoomDepth)?.short || "—";
        const sevSummary = activeDamage.map(([code, level]) => { const o = overrides[code] ?? floorSevOverrides[fi]?.[code] ?? level; const dt = DAMAGE_TYPES.find(d => d.id === code); return dt && o > 0 ? `${dt.label[0]}${o}` : ""; }).filter(Boolean).join(" ");

        return (
        <>
          <div className="fixed inset-0 bg-black/30 z-[100]" onClick={() => setEditingRoom(null)} />
          <div className="fixed bottom-0 left-1/2 z-[101] bg-white rounded-t-[22px] shadow-2xl w-[393px] max-w-full" style={{ maxHeight: "85vh", boxShadow: "0 -8px 30px rgba(0,0,0,.15)", transform: "translateX(-50%)" }}>
            <div className="flex flex-col items-center pt-2 pb-1"><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
            {/* Header — room name + status chips + done */}
            <div className="px-4 pb-3 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-[16px] font-bold text-slate-800">{room.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <button onClick={() => markRoom(fi, ri)} className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${room.affected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>{room.affected ? "Affected" : "Not Affected"}</button>
                  {room.affected && <span className="text-[11px] font-bold text-slate-500">{depthShort}</span>}
                  {sevSummary && <span className="text-[11px] font-bold text-slate-500">{sevSummary}</span>}
                  {codes.length > 0 && <span className="text-[11px] font-bold text-blue-500">{codes.length} codes</span>}
                  {originRoom === rKey && <span className="text-[11px] font-bold text-red-500">Origin</span>}
                </div>
              </div>
              <button onClick={() => setEditingRoom(null)} className="rounded-[10px] border border-slate-200 px-3 py-1.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50">Done</button>
            </div>

            {/* Scrollable sections */}
            <div className="overflow-auto border-t border-slate-100 pb-6" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {room.affected && (<>
                {/* Cleaning + Severity — always visible */}
                <div className="px-4 py-3 border-b border-slate-100 space-y-3">
                  <div className="flex gap-1.5">
                    {DEPTH_LEVELS.map(lvl => (
                      <button key={lvl.id} onClick={() => setRoomDepthOverrides(p => ({ ...p, [rKey]: lvl.id }))} className={`flex-1 rounded-[8px] border-2 py-2 text-center transition-all ${thisRoomDepth === lvl.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className={`text-[11px] font-bold ${thisRoomDepth >= lvl.id ? "text-blue-700" : "text-slate-500"}`}>{lvl.id}</div>
                        <div className={`text-[8px] font-semibold ${thisRoomDepth >= lvl.id ? "text-blue-500" : "text-slate-400"}`}>{lvl.short}</div>
                      </button>
                    ))}
                  </div>
                  {activeDamage.map(([code, level]) => {
                    const dt = DAMAGE_TYPES.find(d => d.id === code);
                    if (!dt) return null;
                    const roomLevel = overrides[code] ?? floorSevOverrides[fi]?.[code] ?? level;
                    return (
                      <div key={code} className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-slate-700">{dt.icon} {dt.label}</span>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map(n => (
                            <button key={n} onClick={() => setRoomSevOverrides(p => ({ ...p, [rKey]: { ...(p[rKey] || {}), [code]: n } }))} className={`w-9 h-8 rounded-[7px] border-2 text-[12px] font-bold transition-all ${roomLevel === n ? (n > 0 ? `${dt.color} text-white border-transparent` : "border-slate-400 bg-slate-100 text-slate-600") : "border-slate-200 text-slate-500"}`}>{n}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Instructions — reason codes + departments */}
                <div className="px-4 py-3 border-b border-slate-100 space-y-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px]">Instructions</div>
                  <div className="space-y-1">
                    {REASON_CODES.filter(r => r.primary).map((rc, i) => {
                      const selected = (roomReasonCodes[rKey] || []).includes(rc.code);
                      return (
                        <button key={rc.code} onClick={() => setRoomReasonCodes(p => {
                          const curr = p[rKey] || [];
                          return { ...p, [rKey]: curr.includes(rc.code) ? curr.filter(c => c !== rc.code) : [...curr, rc.code] };
                        })} className={`w-full flex items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <span className={`w-5 text-[12px] font-bold ${selected ? "text-blue-600" : "text-slate-400"}`}>{i + 1}</span>
                          <span className={`flex-1 text-[13px] font-semibold ${selected ? "text-blue-700" : "text-slate-700"}`}>{rc.label}</span>
                          {selected && <span className="text-blue-500 text-[12px] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  {/* Secondary reasons — show only if any primary selected */}
                  {(roomReasonCodes[rKey] || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {REASON_CODES.filter(r => !r.primary).map(rc => {
                        const selected = (roomReasonCodes[rKey] || []).includes(rc.code);
                        return (
                          <button key={rc.code} onClick={() => setRoomReasonCodes(p => {
                            const curr = p[rKey] || [];
                            return { ...p, [rKey]: curr.includes(rc.code) ? curr.filter(c => c !== rc.code) : [...curr, rc.code] };
                          })} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{rc.label}</button>
                        );
                      })}
                    </div>
                  )}
                  {/* Departments */}
                  {(roomReasonCodes[rKey] || []).length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[.7px] mb-1.5">Departments</div>
                      <div className="flex flex-wrap gap-1.5">
                        {DEPARTMENTS.map(dept => {
                          const selected = (roomDepartments[rKey] || []).includes(dept);
                          return (
                            <button key={dept} onClick={() => setRoomDepartments(p => {
                              const curr = p[rKey] || [];
                              if (dept === "All") return { ...p, [rKey]: curr.includes("All") ? [] : ["All"] };
                              const without = curr.filter(d => d !== "All");
                              return { ...p, [rKey]: without.includes(dept) ? without.filter(d => d !== dept) : [...without, dept] };
                            })} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition-all ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{dept}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Codes — Quality + Handling + Origin in one section */}
                <div className="px-4 py-3 border-b border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {QUALITY_CODES.map(q => (
                        <button key={q} onClick={() => setRoomQualityCodes(p => ({ ...p, [rKey]: p[rKey] === q ? "" : q }))} className={`w-10 h-8 rounded-[7px] border-2 text-[11px] font-bold transition-all ${qCode === q ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}>{q}</button>
                      ))}
                    </div>
                    <button onClick={() => setOriginRoom(originRoom === rKey ? "" : rKey)} className={`rounded-full border-2 px-3 py-1 text-[11px] font-bold transition-all ${originRoom === rKey ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500"}`}>{originRoom === rKey ? "Origin ✓" : "Origin"}</button>
                  </div>
                  <details className="group">
                    <summary className="cursor-pointer text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
                      <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      Handling Codes {codes.length > 0 && <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 text-[9px]">{codes.length}</span>}
                    </summary>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {HANDLING_CODES_SCOPE.map(hc => (
                        <button key={hc.code} onClick={() => setRoomHandlingCodes(p => {
                          const curr = p[rKey] || [];
                          return { ...p, [rKey]: curr.includes(hc.code) ? curr.filter(c => c !== hc.code) : [...curr, hc.code] };
                        })} title={hc.desc} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${codes.includes(hc.code) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{hc.code}</button>
                      ))}
                    </div>
                    {codes.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                        {codes.map(c => { const m = HANDLING_CODES_SCOPE.find(h => h.code === c); return m ? <span key={c} className="text-[10px] text-blue-600"><span className="font-bold">{c}</span> {m.desc}</span> : null; })}
                      </div>
                    )}
                  </details>
                </div>

                {/* Structured Instructions */}
                <div className="px-4 py-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Instructions</div>
                  {/* Instruction type buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {relevantScopeInstructionTypes((orderData as any)?.serviceOfferings || []).map(iType => {
                      const isActive = (note || "").toLowerCase().includes(iType.toLowerCase());
                      return <button key={iType} onClick={() => {
                        const current = note || "";
                        if (isActive) {
                          setRoomNotes(p => ({ ...p, [rKey]: current.split("\n").filter(l => !l.startsWith(iType)).join("\n").trim() }));
                        } else {
                          setRoomNotes(p => ({ ...p, [rKey]: (current ? current + "\n" : "") + iType }));
                        }
                      }} className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-all ${isActive ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{iType}</button>;
                    })}
                  </div>
                  {/* Pickup departments (when Pickup is active) */}
                  {(note || "").includes("Pickup") && (
                    <div className="rounded-[8px] border border-blue-200 bg-blue-50/50 p-2 space-y-1">
                      <div className="text-[9px] font-bold text-blue-600 uppercase">Pickup Departments</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(PICKUP_DEPARTMENTS).map(([dept, items]) => {
                          const isOn = (note || "").includes(dept);
                          return <button key={dept} onClick={() => {
                            const current = note || "";
                            if (isOn) setRoomNotes(p => ({ ...p, [rKey]: current.replace(new RegExp(`\\s*${dept}[^\\n]*`), "").trim() }));
                            else setRoomNotes(p => ({ ...p, [rKey]: current.replace("Pickup", `Pickup: ${dept}`) }));
                          }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${isOn ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 text-slate-500"}`}>{dept}</button>;
                        })}
                      </div>
                    </div>
                  )}
                  {/* Free-text note */}
                  <textarea value={note} onChange={e => setRoomNotes(p => ({ ...p, [rKey]: e.target.value }))} rows={2} placeholder="Additional notes..." className="w-full rounded-[10px] border-2 border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-400 resize-none bg-white" />
                </div>
              </>)}
            </div>
          </div>
        </>
        );
      })()}

      {/* Scope tab footer — step navigation (only when scope tab active) */}
      {activeTab === "scope" && !showWalkthrough && (
      <div className="flex-shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="px-4 py-2 flex items-center justify-between gap-2">
        {step > 1 || (step === 4 && roomPass > 1) ? (
          <button onClick={() => { if (step === 4 && roomPass > 1) { setRoomPass((roomPass - 1) as 1 | 2 | 3); } else setStep(step - 1); }} className="rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm">Back</button>
        ) : <div />}
        {step < totalSteps ? (
          <div className="flex items-center gap-2">
            {step === 1 && (
              <button onClick={openCoverCamera} className="rounded-[14px] border-2 border-blue-300 bg-blue-50 px-3 py-2.5 text-[12px] font-bold text-blue-600 hover:bg-blue-100 shadow-sm transition-all flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                {orderCoverPhoto ? "Retake Cover" : "Cover Photo"}
              </button>
            )}
            <button onClick={advanceStep} disabled={!canAdvance} className="rounded-[14px] bg-blue-600 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm transition-all">
              Next
            </button>
          </div>
        ) : roomPass < 3 ? (
          <button onClick={() => setRoomPass((roomPass + 1) as 2 | 3)} className="rounded-[14px] bg-blue-600 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-blue-700 shadow-sm transition-all">
            Next
          </button>
        ) : (
          <button onClick={() => {
            // Sync ALL scope data to order — rooms, severity, instructions, access, services
            const roomsWithOverrides = homeRooms.flatMap((f, fi) => f.rooms.map((r, ri) => {
              const rKey = `${fi}-${ri}`;
              return {
                name: r.name,
                floor: f.name,
                affected: r.affected,
                depth: roomDepthOverrides[rKey] ?? depthLevel,
                severityOverrides: roomSevOverrides[rKey] || {},
                handlingCodes: roomHandlingCodes[rKey] || [],
                qualityCode: roomQualityCodes[rKey] || "",
                notes: roomNotes[rKey] || "",
                isOrigin: originRoom === rKey,
                reasonCodes: roomReasonCodes[rKey] || [],
                departments: roomDepartments[rKey] || [],
              };
            }));
            onOrderUpdate?.({
              propertyType: propType,
              propertyFloors: floors,
              propertyBedrooms: beds,
              propertyBathrooms: baths,
              propertyHasBasement: hasBasement,
              propertyHasAttic: hasAttic,
              propertyRooms: roomsWithOverrides,
              propertyImpactScope: totalAffected === totalRoomCount ? "entire" : totalAffected > 0 ? "partial" : "unknown",
              // Damage types + details
              orderTypes: activeDamage.map(([code]) => {
                const dt = DAMAGE_TYPES.find(d => d.id === code);
                return dt?.label || code;
              }),
              // Services
              serviceOfferings: Object.entries(selectedServices).filter(([, v]) => v).map(([k]) => k),
              // Sync to SDS fields
              sdsProjectFloors: homeRooms.map(f => f.name),
              sdsRooms: roomsWithOverrides.filter(r => r.affected).map(r => ({
                id: `${r.floor}-${r.name}`.replace(/\s/g, "-").toLowerCase(),
                name: r.name,
                floor: r.floor,
                affected: true,
                severitySelections: r.severityOverrides || {},
                tasks: r.reasonCodes || [],
                notes: r.notes || "",
                handlingCodes: r.handlingCodes || [],
                qualityCode: r.qualityCode || "",
                departments: r.departments || [],
                depth: r.depth,
                isOrigin: r.isOrigin || false,
              })),
              sdsServices: Object.entries(selectedServices).filter(([, v]) => v).map(([k]) => k),
              // Sync severity codes
              severityCodes: activeDamage.map(([code, level]) => {
                const dt = DAMAGE_TYPES.find(d => d.id === code);
                return dt ? `${dt.label[0]}${level}` : "";
              }).filter(Boolean),
              primaryLossType: activeDamage[0] ? DAMAGE_TYPES.find(d => d.id === activeDamage[0][0])?.label || "" : "",
              // Interview answers mapped to NOE fields
              ...(interviewAnswers.living ? { livingStatus: interviewAnswers.living as string } : {}),
              ...(interviewAnswers.repairs ? { repairsSummary: (interviewAnswers.repairs as string[]).join(", ") } : {}),
              ...(interviewAnswers.medicalIssues !== undefined ? { familyMedicalIssues: interviewAnswers.medicalIssues ? "Y" : "N", familyMedicalNote: (interviewAnswers.medicalIssues_note as string) || "" } : {}),
              ...(interviewAnswers.soapAllergies !== undefined ? { soapFragAllergies: interviewAnswers.soapAllergies ? "Y" : "N", soapFragNote: (interviewAnswers.soapAllergies_note as string) || "" } : {}),
              ...(interviewAnswers.selfCleaning !== undefined ? { selfCleaning: interviewAnswers.selfCleaning ? "Y" : "N" } : {}),
              ...(interviewAnswers.needStorage !== undefined ? { storageNeeded: interviewAnswers.needStorage ? "Y" : "N" } : {}),
              ...(interviewAnswers.useDryCleaner ? { useDryCleaner: interviewAnswers.useDryCleaner as string } : {}),
              ...(interviewAnswers.dryLaundry ? { howDryLaundry: interviewAnswers.dryLaundry as string } : {}),
              ...(interviewAnswers.loadList ? { loadList: interviewAnswers.loadList as string[] } : {}),
              ...(interviewAnswers.delivery ? { processType: interviewAnswers.delivery as string } : {}),
              ...(interviewAnswers.packout ? { packoutSummary: interviewAnswers.packout as string[] } : {}),
              ...(interviewAnswers.considerations ? { sdsConsiderations: interviewAnswers.considerations as string[] } : {}),
              ...(interviewAnswers.suggestedGroups ? { suggestedGroups: interviewAnswers.suggestedGroups as string[] } : {}),
              ...(interviewAnswers.interests ? { customerInterests: interviewAnswers.interests as string[] } : {}),
              ...(interviewAnswers.upcomingEvents ? { customerUpcomingEvents: interviewAnswers.upcomingEvents as string[] } : {}),
              // Condition flags
              ...(Array.isArray(interviewAnswers.conditions) ? {
                damageWasWet: (interviewAnswers.conditions as string[]).includes("Still Wet"),
                damageMoldMildew: (interviewAnswers.conditions as string[]).includes("Visible Mold"),
                noHeat: (interviewAnswers.conditions as string[]).includes("No Heat"),
                noLights: (interviewAnswers.conditions as string[]).includes("No Electricity"),
                boardedUp: (interviewAnswers.conditions as string[]).includes("Boarded Up"),
              } : {}),
              // Sync lossSeverity back in NOE format
              lossSeverity: {
                touched: activeDamage.length > 0,
                fire: { enabled: (damageTypes.fire || 0) > 0, values: damageDetails.fire || {} },
                water: { enabled: (damageTypes.water || 0) > 0, values: damageDetails.water || {} },
                puffback: { enabled: (damageTypes.puffback || 0) > 0, values: damageDetails.puffback || {} },
              },
              // Handling codes at order level
              handlingCodes: [...new Set(Object.values(roomHandlingCodes).flat())],
              // Walkthrough photos keyed by room
              scopePhotos: roomPhotos,
            });
            // Sync complete — enter photo capture
            setShowWalkthrough(true);
          }} className="rounded-[14px] bg-blue-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700 shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
            Take Photos
          </button>
        )}
        </div>
      </div>
      )}

      </div>{/* end scope tab wrapper */}

      {/* ═══ BOTTOM TAB BAR ═══ */}
      {!(showWalkthrough && cameraActive) && (
      <div className="flex-shrink-0 border-t border-slate-200 bg-white">
        <div className="flex">
          {([
            { id: "order" as const, label: "Order", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg> },
            { id: "interview" as const, label: "Interview", badge: `${interviewAnswered}/${interviewTotal}`, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg> },
            { id: "scope" as const, label: "Scope", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
            { id: "photos" as const, label: "Photos", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> },
            { id: "report" as const, label: "Report", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
          ]).map(tab => {
            const isActive = activeTab === tab.id;
            const color = tab.id === "interview" ? (interviewAnswered === interviewTotal ? "text-green-600" : "text-violet-600") : isActive ? "text-blue-600" : "text-slate-400";
            return (
              <button key={tab.id} onClick={() => { if (tab.id === "photos") { setActiveTab("scope"); setShowWalkthrough(true); setWalkthroughRoom(null); stopCamera(); } else { setActiveTab(tab.id); setShowWalkthrough(false); setWalkthroughRoom(null); stopCamera(); setWalkthroughExitWarning(null); } }} className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${isActive ? "border-t-2 border-blue-600 -mt-[2px]" : ""}`}>
                <div className={color}>{tab.icon}</div>
                <span className={`text-[10px] font-bold ${color}`}>{tab.label}</span>
                {tab.badge && <span className={`text-[8px] font-bold ${color}`}>{tab.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Walkthrough exit warning — missing room info */}
      {walkthroughExitWarning && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 rounded-[44px]">
          <div className="mx-6 w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-amber-50 px-5 py-4 border-b border-amber-200">
              <div className="text-[15px] font-bold text-amber-800">Rooms Missing Info</div>
              <div className="text-[12px] text-amber-600 mt-0.5">{walkthroughExitWarning.missing.length} room{walkthroughExitWarning.missing.length !== 1 ? "s" : ""} need attention</div>
            </div>
            <div className="px-5 py-3 max-h-[250px] overflow-auto space-y-2">
              {walkthroughExitWarning.missing.map((m, i) => {
                const hasNoPhotos = m.issues.includes("No photos");
                return (
                <button key={i} onClick={() => {
                  setWalkthroughExitWarning(null);
                  setWalkthroughRoom({ fi: m.fi, ri: m.ri });
                  if (hasNoPhotos) { setTimeout(() => startCamera(), 300); }
                  // If untagged, just navigate to room — don't open camera, user sees photo list
                }} className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 hover:bg-amber-50 transition-colors">
                  <div className="text-[13px] font-bold text-slate-800">{m.room}</div>
                  <div className="text-[11px] text-amber-600">{m.issues.join(" · ")}</div>
                </button>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => { setWalkthroughExitWarning(null); setShowWalkthrough(false); setWalkthroughRoom(null); }} className="rounded-lg px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50">Close Anyway</button>
              <button onClick={() => { const first = walkthroughExitWarning.missing[0]; setWalkthroughExitWarning(null); setWalkthroughRoom({ fi: first.fi, ri: first.ri }); if (first.issues.includes("No photos")) setTimeout(() => startCamera(), 300); }} className="rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-amber-600">Fix First Room</button>
            </div>
          </div>
        </div>
	      )}

	      <input
	        ref={coverInputRef}
	        type="file"
	        accept="image/*"
	        capture="environment"
	        className="hidden"
	        onChange={(e) => {
	          saveCoverPhotoFile(e.target.files?.[0]);
	          e.target.value = "";
	        }}
	      />

	      {coverCameraOpen && (
	        <div className="absolute inset-0 z-50 bg-black flex flex-col rounded-[44px] overflow-hidden">
	          <div className="absolute inset-0 bg-black">
	            {cameraActive ? (
	              <video
	                ref={(el) => {
	                  videoRef.current = el;
	                  if (el && camStreamRef.current) {
	                    el.srcObject = camStreamRef.current;
	                    el.play().catch(() => {});
	                  }
	                }}
	                autoPlay
	                playsInline
	                muted
	                className="absolute inset-0 h-full w-full object-cover"
	              />
	            ) : (
	              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/70">
	                Opening camera...
	              </div>
	            )}
	          </div>
	          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-14 pb-3 bg-gradient-to-b from-black/70 to-transparent">
	            <button onClick={() => { setCoverCameraOpen(false); stopCamera(); }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold">×</button>
	            <div className="text-white text-[14px] font-bold">Order Cover Photo</div>
	            <button onClick={() => coverInputRef.current?.click()} className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold text-white/90">Choose</button>
	          </div>
		          {cameraError && (
		            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black px-6 text-center">
		              <div className="mb-3 text-[15px] font-bold text-white">{cameraError}</div>
		              <div className="mb-5 max-w-[300px] text-[12px] font-semibold leading-relaxed text-white/55">Browser camera access can be blocked by desktop responsive mode or permissions. Choosing a photo will still save it as the cover.</div>
		              <button onClick={() => coverInputRef.current?.click()} className="rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-blue-700">Choose Photo</button>
		            </div>
		          )}
	          <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-5 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col items-center gap-3">
	            <button
	              onClick={() => {
	                const dataUrl = captureFromCamera();
	                if (!dataUrl) {
	                  coverInputRef.current?.click();
	                  return;
	                }
	                setOrderCoverPhoto(dataUrl);
	                setCoverCameraOpen(false);
	                stopCamera();
	                setToastMsg("Cover photo saved");
	              }}
	              className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center active:scale-90 transition-transform"
	            >
	              <div className="w-[58px] h-[58px] rounded-full bg-white" />
	            </button>
		            <div className="text-[11px] font-semibold text-white/70">{cameraActive ? "Tap shutter to save cover photo" : "Waiting for camera access"}</div>
	          </div>
	        </div>
	      )}

	      {/* Persistent camera input — always mounted when walkthrough is active */}
	      {showWalkthrough && (
	        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !walkthroughRoom) return;
            const rKey = `${walkthroughRoom.fi}-${walkthroughRoom.ri}`;
            const isAffected = homeRooms[walkthroughRoom.fi]?.rooms[walkthroughRoom.ri]?.affected;
            const reader = new FileReader();
            reader.onload = async () => {
              const compressed = await compressImage(reader.result as string);
              const roomName = homeRooms[walkthroughRoom.fi]?.rooms[walkthroughRoom.ri]?.name || "";
              const floorName = homeRooms[walkthroughRoom.fi]?.name || "";
              setRoomPhotos(p => ({ ...p, [rKey]: [...(p[rKey] || []), { src: compressed, note: isAffected ? "" : "Not Affected", reason: isAffected ? "" : "Condition", ts: Date.now(), roomName, floor: floorName }] }));
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
      )}

      {/* Photo Walkthrough — native, no iframe */}
      {showWalkthrough && !walkthroughRoom && (() => {
        const totalPhotos = Object.values(roomPhotos).reduce((s, arr) => s + arr.length, 0);
        // When autoAddRooms is on, show all rooms; when off, only affected rooms
        const displayFloors = homeRooms.map((f, fi) => ({ ...f, fi, displayRooms: f.rooms.map((r, ri) => ({ ...r, ri })).filter(r => autoAddRooms || r.affected) })).filter(f => f.displayRooms.length > 0);
        return (
        <div className="absolute inset-0 bottom-[52px] z-40 bg-white flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2" style={{ paddingTop: "52px" }}>
            <button onClick={() => { setShowWalkthrough(false); setWalkthroughRoom(null); setWalkthroughExitWarning(null); }} className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100">
              <span className="text-sm">←</span>
            </button>
            <span className="flex-1 text-[15px] font-bold text-slate-800">Photos</span>
            <span className="text-[12px] font-bold text-slate-400 mr-2">{totalPhotos} photos</span>
            <button onClick={() => { setShowWalkthrough(false); setWalkthroughRoom(null); setWalkthroughExitWarning(null); }} className="rounded-full px-3 py-1.5 text-xs font-bold bg-blue-600 text-white">Done</button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {homeRooms.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <div className="text-[14px] font-semibold text-slate-600">No rooms yet</div>
                <div className="text-[12px] text-slate-400 max-w-xs mx-auto">Generate default rooms, or add one room at a time and start taking photos.</div>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => { generateRooms(); }} className="rounded-full bg-blue-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700 w-48">Generate Rooms</button>
                  <div className="text-[11px] text-slate-400">or</div>
                  <button onClick={() => {
                    const floorName = "Floor 1";
                    const roomName = prompt("Room name:", "Living") || "Room 1";
                    if (!roomName.trim()) return;
                    setHomeRooms([{ name: floorName, rooms: [{ name: roomName.trim(), affected: true }] }]);
                  }} className="rounded-full border-2 border-blue-300 bg-blue-50 px-5 py-2.5 text-[13px] font-bold text-blue-600 hover:bg-blue-100 w-48">+ Add a Room</button>
                  <button onClick={() => {
                    setHomeRooms([{ name: "Floor 1", rooms: [{ name: "Room 1", affected: true }] }]);
                    setTimeout(() => { setShowWalkthrough(true); setWalkthroughRoom({ fi: 0, ri: 0 }); setTimeout(() => startCamera(), 400); }, 100);
                  }} className="rounded-full border-2 border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 w-48 flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                    Take a Photo
                  </button>
                </div>
              </div>
            ) : (
              <>
              <div className="text-[12px] text-slate-500">Tap a room to take photos. Capture damage, contents, and conditions.</div>
              {displayFloors.map(floor => (
              <div key={floor.fi} className="rounded-[14px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between">
                  <span className="text-[14px] font-extrabold text-blue-800">{floor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-blue-600">{floor.displayRooms.length} rooms</span>
                    <button onClick={(e) => { e.stopPropagation(); const name = prompt("Room name:"); if (name?.trim()) { setHomeRooms(p => { const next = [...p]; next[floor.fi] = { ...next[floor.fi], rooms: [...next[floor.fi].rooms, { name: name.trim(), affected: true }] }; return next; }); } }} className="w-6 h-6 rounded-full bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center hover:bg-blue-700">+</button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {floor.displayRooms.map(({ name, ri, affected }) => {
                    const rKey = `${floor.fi}-${ri}`;
                    const photos = roomPhotos[rKey] || [];
                    const roomDepth = roomDepthOverrides[rKey] ?? depthLevel;
                    const depthLabel = DEPTH_LEVELS.find(l => l.id === roomDepth)?.short || "";
                    const overrides = roomSevOverrides[rKey] || {};
                    const isOrigin = originRoom === rKey;
                    return (
                      <button key={ri} onClick={() => { setWalkthroughRoom({ fi: floor.fi, ri }); setTimeout(() => startCamera(), 300); }} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 active:bg-blue-50 transition-colors">
                        {/* Photo count circle */}
                        <div className={`w-11 h-11 rounded-full flex flex-col items-center justify-center shrink-0 ${photos.length > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                          {photos.length > 0 ? (
                            <>
                              <span className="text-[13px] font-bold leading-none">{photos.length}</span>
                              <span className="text-[7px] font-bold uppercase leading-none mt-0.5">photos</span>
                            </>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                          )}
                        </div>
                        {/* Room info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[14px] font-semibold ${affected ? "text-slate-800" : "text-slate-400"}`}>{name}</span>
                            {isOrigin && <span className="rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[9px] font-bold">Origin</span>}
                            {!affected && <span className="rounded-full bg-slate-100 text-slate-400 px-1.5 py-0.5 text-[9px] font-bold">Not Affected</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {affected && depthLabel && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[9px] font-bold">{depthLabel}</span>}
                            {affected && activeDamage.map(([code, level]) => {
                              const dt = DAMAGE_TYPES.find(d => d.id === code);
                              if (!dt) return null;
                              const roomLevel = overrides[code] ?? floorSevOverrides[floor.fi]?.[code] ?? level;
                              return <span key={code} className={`rounded-full ${dt.color} px-1.5 py-0.5 text-[9px] font-bold text-white`}>{dt.label[0]}{roomLevel}</span>;
                            })}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
              </>
            )}
          </div>
        </div>
        );
      })()}

      {/* Room photo capture view */}
      {showWalkthrough && walkthroughRoom && (() => {
        const { fi, ri } = walkthroughRoom;
        const room = homeRooms[fi]?.rooms[ri];
        if (!room) return null;
        const rKey = `${fi}-${ri}`;
        const photos = roomPhotos[rKey] || [];
        // PHOTO_REASONS, PHOTO_SUB_MAP — imported from ./config
        // Find next/prev affected rooms for navigation
        const allAffected: { fi: number; ri: number; name: string }[] = [];
        homeRooms.forEach((f, fIdx) => f.rooms.forEach((r, rIdx) => { if (r.affected) allAffected.push({ fi: fIdx, ri: rIdx, name: r.name }); }));
        const curIdx = allAffected.findIndex(a => a.fi === fi && a.ri === ri);
        const prevRoom = curIdx > 0 ? allAffected[curIdx - 1] : null;
        const nextRoom = curIdx < allAffected.length - 1 ? allAffected[curIdx + 1] : null;

        const openCamera = () => cameraInputRef.current?.click();
        const switchToRoom = (newFi: number, newRi: number) => {
          setRoomSwitching(true); stopCamera(); setWalkthroughRoom({ fi: newFi, ri: newRi }); setTimeout(() => { startCamera(); setRoomSwitching(false); }, 300);
        };
        const handleShutter = () => {
          // If camera video isn't rendering, fall back to file picker
          if (!videoRef.current?.videoWidth) {
            cameraInputRef.current?.click();
            return;
          }
          const dataUrl = captureFromCamera();
          if (dataUrl) {
            const totalExisting = Object.values(roomPhotos).reduce((s, arr) => s + arr.length, 0);
            const isFirstPhoto = totalExisting === 0 && (roomPhotos[rKey] || []).length === 0;
            const newIdx = (roomPhotos[rKey] || []).length;
            const isCoverMode = coverMode;
            const tag = isCoverMode ? "cover" : isFirstPhoto ? "cover" : (newIdx === 0 ? "roomCover" : "");
            setRoomPhotos(p => ({ ...p, [rKey]: [...(p[rKey] || []), { src: dataUrl, note: room.affected ? "" : "Not Affected", reason: room.affected ? "" : "Condition", ts: Date.now(), tag, roomName: room.name, floor: homeRooms[fi]?.name || "" }] }));
            // Show inline reason bar for quick tagging
            setLastCapturedIdx(newIdx);
            if (isCoverMode || isFirstPhoto) {
              setOrderCoverPhoto(`${rKey}-${newIdx}`);
              if (!isCoverMode) setPhotoCoverPrompt({ rKey, index: newIdx });
              setCoverMode(false);
            }
          }
        };

        const updatePhoto = (pi: number, field: "note" | "reason", value: string) => {
          setRoomPhotos(p => {
            const arr = [...(p[rKey] || [])];
            arr[pi] = { ...arr[pi], [field]: value };
            return { ...p, [rKey]: arr };
          });
        };

        return (
        <div className={`absolute inset-0 ${cameraActive ? "z-50 rounded-[44px]" : "bottom-[52px] z-40 rounded-t-[44px]"} ${cameraActive ? "bg-black" : "bg-white"} flex flex-col overflow-hidden`}>
          {/* Room switching overlay — covers entire view to prevent flash */}
          {roomSwitching && <div className="absolute inset-0 z-[60] bg-black" />}

          {/* Live camera viewfinder */}
          {cameraActive && (
            <div className="absolute inset-0 z-10 bg-black" style={{ position: "absolute" }}>
              <video ref={(el) => { videoRef.current = el; if (el && camStreamRef.current) { el.srcObject = camStreamRef.current; el.play().catch(() => {}); } }} autoPlay playsInline muted style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {roomSwitching && <div className="absolute inset-0 z-40 bg-black" />}
              {/* Overlay controls */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-14 pb-2 bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => stopCamera()} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-white text-[13px] font-bold">{room.name}</div>
                <span className="text-[11px] text-white/60 font-bold">{curIdx + 1}/{allAffected.length}</span>
              </div>
              {/* Photo preview + quick-tag after capture */}
              {lastCapturedIdx !== null && roomPhotos[rKey]?.[lastCapturedIdx] && (() => {
                const capturedPhoto = roomPhotos[rKey][lastCapturedIdx];
                const isOriginRoom = originRoom === rKey;
                const isCover = capturedPhoto.tag === "cover" || capturedPhoto.tag === "roomCover";
                return (
                <div className="absolute inset-0 z-20">
                  {/* Captured photo as background */}
                  <img src={capturedPhoto.src} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                  {/* Top info bar — room name, origin, cover badges */}
                  <div className="absolute top-0 left-0 right-0 px-4 pt-14 pb-3 bg-gradient-to-b from-black/70 to-transparent flex items-center gap-2">
                    <span className="text-white text-[14px] font-bold">{room.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); const newName = prompt("Rename room:", room.name); if (newName?.trim()) setHomeRooms(prev => prev.map((f, fIdx) => fIdx === fi ? { ...f, rooms: f.rooms.map((r, rIdx) => rIdx === ri ? { ...r, name: newName.trim() } : r) } : f)); }} className="text-white/50 hover:text-white" title="Rename room">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                    </button>
                    {isOriginRoom && <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[9px] font-bold">Origin</span>}
                    {isCover && <span className="rounded-full bg-blue-500 text-white px-2 py-0.5 text-[9px] font-bold">{capturedPhoto.tag === "cover" ? "Order Cover" : "Room Cover"}</span>}
                  </div>
                  {/* Tag overlay — scrollable bottom panel */}
                  <div className="absolute left-0 right-0 bottom-0 px-3 pb-14 pt-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent" style={{ maxHeight: "65%" }}>
                    <div className="space-y-2 overflow-auto" style={{ maxHeight: "calc(60vh - 40px)" }}>
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setPhotoTagsOpen(p => !p)} className="text-[12px] font-bold text-white/70 hover:text-white flex items-center gap-1">
                          {photoTagsOpen ? "▾" : "▸"} Tag & Notes
                        </button>
                        <div className="grid grid-cols-4 gap-1.5 w-full">
                          <button onClick={() => {
                            setRoomPhotos(p => {
                              const arr = [...(p[rKey] || [])];
                              arr.splice(lastCapturedIdx, 1);
                              return { ...p, [rKey]: arr };
                            });
                            setLastCapturedIdx(null);
                          }} className="rounded-xl border border-white/20 bg-white/10 px-2 py-2.5 text-white text-[11px] font-bold hover:bg-red-500/40 transition-all">Delete</button>
                          <button onClick={() => { updatePhoto(lastCapturedIdx, "scopeInclude", !(capturedPhoto as any).scopeInclude); }} className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-all ${(capturedPhoto as any).scopeInclude ? "border-violet-400 bg-violet-500/60 text-white" : "border-white/20 bg-white/10 text-white/80 hover:bg-violet-500/30"}`}>{(capturedPhoto as any).scopeInclude ? "In Scope ✓" : "Add Scope"}</button>
                          <button onClick={() => setLastCapturedIdx(null)} className="rounded-xl border border-white/20 bg-white/15 px-2 py-2.5 text-white text-[11px] font-bold hover:bg-white/25 transition-all">Another</button>
                          {(() => { const nextRoomInfo = allAffected.find((_, idx) => idx === curIdx + 1); return nextRoomInfo ? <button onClick={() => { setLastCapturedIdx(null); switchToRoom(nextRoomInfo.fi, nextRoomInfo.ri); }} className="rounded-xl border border-sky-400/40 bg-sky-500/40 px-2 py-2.5 text-white text-[11px] font-bold hover:bg-sky-500/60 transition-all">Next Room →</button> : <button onClick={() => { setLastCapturedIdx(null); stopCamera(); setWalkthroughRoom(null); tryExitWalkthrough(); }} className="rounded-xl border border-emerald-400/40 bg-emerald-500/40 px-2 py-2.5 text-white text-[11px] font-bold hover:bg-emerald-500/60 transition-all">Done ✓</button>; })()}
                        </div>
                      </div>
                      {photoTagsOpen && <>
                      {/* Primary reason tags */}
                      <div className="flex flex-wrap gap-1">
                        {PHOTO_REASONS.map(r => (
                          <button key={r} onClick={() => { updatePhoto(lastCapturedIdx, "reason", capturedPhoto.reason === r ? "" : r); }} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold text-white transition-all min-h-[36px] ${capturedPhoto.reason === r ? "border-white bg-white/30" : "border-white/30 hover:bg-white/10"}`}>{r}</button>
                        ))}
                      </div>
                      {/* Sub-selections for selected reason */}
                      {capturedPhoto.reason && capturedPhoto.reason === "Pickup" && (
                        <div className="space-y-1.5">
                          {Object.entries(PICKUP_DEPARTMENTS).map(([dept, items]) => (
                            <div key={dept}>
                              <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1">{dept}</div>
                              <div className="flex flex-wrap gap-1">
                                {/* All button for this department */}
                                {(() => {
                                  const currentSub = (capturedPhoto as any).subReason || "";
                                  const allOn = items.every(item => currentSub.includes(item));
                                  return <button onClick={() => {
                                    const parts = currentSub.split(", ").filter(Boolean);
                                    const next = allOn ? parts.filter(p => !items.includes(p)) : [...new Set([...parts, ...items])];
                                    setRoomPhotos(p => {
                                      const arr = [...(p[rKey] || [])];
                                      arr[lastCapturedIdx] = { ...arr[lastCapturedIdx], subReason: next.join(", ") };
                                      return { ...p, [rKey]: arr };
                                    });
                                  }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold text-white transition-all ${allOn ? "border-yellow-400 bg-yellow-500/30" : "border-white/40 hover:bg-white/10"}`}>All</button>;
                                })()}
                                {items.map(item => {
                                  const currentSub = (capturedPhoto as any).subReason || "";
                                  const isSelected = currentSub.includes(item);
                                  return (
                                    <button key={item} onClick={() => {
                                      const current = (capturedPhoto as any).subReason || "";
                                      const parts = current.split(", ").filter(Boolean);
                                      const next = isSelected ? parts.filter(p => p !== item).join(", ") : [...parts, item].join(", ");
                                      setRoomPhotos(p => {
                                        const arr = [...(p[rKey] || [])];
                                        arr[lastCapturedIdx] = { ...arr[lastCapturedIdx], subReason: next };
                                        return { ...p, [rKey]: arr };
                                      });
                                    }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold text-white transition-all ${isSelected ? "border-yellow-400 bg-yellow-500/30" : "border-white/20 hover:bg-white/10"}`}>{item}</button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {capturedPhoto.reason && capturedPhoto.reason !== "Pickup" && PHOTO_SUB_MAP[capturedPhoto.reason] && (
                        <div>
                          <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-1">{capturedPhoto.reason} Details</div>
                          <div className="flex flex-wrap gap-1">
                            {PHOTO_SUB_MAP[capturedPhoto.reason].map(sub => {
                              const currentSub = (capturedPhoto as any).subReason || "";
                              const isSelected = currentSub.includes(sub);
                              return (
                                <button key={sub} onClick={() => {
                                  const current = (capturedPhoto as any).subReason || "";
                                  const parts = current.split(", ").filter(Boolean);
                                  const next = isSelected ? parts.filter(p => p !== sub).join(", ") : [...parts, sub].join(", ");
                                  setRoomPhotos(p => {
                                    const arr = [...(p[rKey] || [])];
                                    arr[lastCapturedIdx] = { ...arr[lastCapturedIdx], subReason: next };
                                    return { ...p, [rKey]: arr };
                                  });
                                }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold text-white transition-all ${isSelected ? "border-yellow-400 bg-yellow-500/30" : "border-white/20 hover:bg-white/10"}`}>{sub}</button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      </>}
                      {/* Notes input + mic */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={capturedPhoto.note || ""}
                          onChange={e => updatePhoto(lastCapturedIdx, "note", e.target.value)}
                          className="flex-1 rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-[11px] text-white placeholder-white/40 outline-none focus:border-white/50"
                        />
                        <button
                          onClick={() => toggleVoice(
                            { rKey, index: lastCapturedIdx },
                            capturedPhoto.note || "",
                            (text) => updatePhoto(lastCapturedIdx, "note", text),
                          )}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isVoiceRecording({ rKey, index: lastCapturedIdx }) ? "bg-red-500 text-white animate-pulse" : "bg-white/20 text-white/70 hover:bg-white/30"}`}
                          title="Voice note"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })()}
              {/* Camera error — file picker fallback */}
              {cameraError && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
                  <div className="text-white text-[13px] font-bold mb-3">{cameraError}</div>
                  <button onClick={() => cameraInputRef.current?.click()} className="rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-blue-700">Choose Photo from Files</button>
                </div>
              )}
              {/* Shutter + room scroll picker */}
              <div className="absolute bottom-0 left-0 right-0 pb-6 pt-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col items-center gap-2">
                <button onClick={handleShutter} className="w-[72px] h-[72px] rounded-full border-[4px] border-white flex items-center justify-center active:scale-90 transition-transform">
                  <div className="w-[58px] h-[58px] rounded-full bg-white" />
                </button>
                {/* Floor selector + room scroll bar */}
                <div className="w-full px-3 space-y-1">
                  {/* Floor tabs */}
                  <div className="flex gap-1 justify-center overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                    <button onClick={() => setCoverMode(p => !p)} className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-all min-h-[32px] ${coverMode ? "bg-amber-500 text-white ring-2 ring-amber-300" : "bg-amber-500/30 text-amber-300 hover:bg-amber-500/50"}`}>Cover</button>
                    {homeRooms.map((f, fIdx) => {
                      const isCurrentFloor = fIdx === fi;
                      const floorPhotos = f.rooms.reduce((s, _, rIdx) => s + (roomPhotos[`${fIdx}-${rIdx}`] || []).length, 0);
                      return (
                        <button key={fIdx} onClick={() => {
                          const firstRoom = f.rooms.findIndex(r => autoAddRooms || r.affected);
                          if (firstRoom >= 0 && !isCurrentFloor) switchToRoom(fIdx, firstRoom);
                        }} className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition-all min-h-[32px] ${isCurrentFloor ? "bg-blue-500 text-white" : "bg-white/15 text-white/60 hover:bg-white/25"}`}>
                          {f.name}
                        </button>
                      );
                    })}
                    <button onClick={() => {
                      const newFloorName = `Floor ${homeRooms.length + 1}`;
                      setHomeRooms(prev => [...prev, { name: newFloorName, rooms: [{ name: "Room 1", affected: true }] }]);
                      setTimeout(() => {
                        const newFi = homeRooms.length;
                        stopCamera(); setWalkthroughRoom({ fi: newFi, ri: 0 }); setTimeout(() => startCamera(), 300);
                      }, 100);
                    }} className="rounded-full px-3 py-1.5 text-[12px] font-bold bg-blue-500/30 text-blue-300 hover:bg-blue-500/50 border border-dashed border-blue-300/50 min-w-[44px] min-h-[32px]" title="Add floor">+ Floor</button>
                    <button onClick={() => { stopCamera(); setWalkthroughRoom(null); tryExitWalkthrough(); }} className="rounded-full px-3 py-1.5 text-[12px] font-bold bg-green-500/30 text-green-300 hover:bg-green-500/50 min-h-[32px]">Done</button>
                  </div>
                  {/* Rooms on current floor */}
                  <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                    <div className="flex gap-1.5 min-w-max justify-center">
                      {homeRooms[fi]?.rooms.map((r, rIdx) => {
                        if (!r.affected && !autoAddRooms) return null;
                        const rk = `${fi}-${rIdx}`;
                        const isCurrent = rIdx === ri;
                        const count = (roomPhotos[rk] || []).length;
                        return (
                          <button key={rk} onClick={() => { if (!isCurrent) switchToRoom(fi, rIdx); }} className={`flex flex-col items-center rounded-lg px-3 py-2 min-w-[60px] min-h-[44px] transition-all ${isCurrent ? "bg-white/30 ring-1 ring-white" : "bg-white/10 hover:bg-white/20"}`}>
                            <span className={`text-[12px] font-bold leading-tight ${isCurrent ? "text-white" : "text-white/70"}`}>{r.name}</span>
                            <span className={`text-[10px] font-bold ${count > 0 ? "text-green-400" : "text-white/30"}`}>{count > 0 ? `${count}` : "—"}</span>
                          </button>
                        );
                      }).filter(Boolean)}
                      {/* Add Room button */}
                      <button onClick={() => {
                        const floor = homeRooms[fi];
                        if (!floor) return;
                        const newRoom = { name: `Room ${floor.rooms.length + 1}`, affected: true };
                        setHomeRooms(prev => prev.map((f, idx) => idx === fi ? { ...f, rooms: [...f.rooms, newRoom] } : f));
                        setTimeout(() => {
                          const newIdx = floor.rooms.length;
                          stopCamera(); setWalkthroughRoom({ fi, ri: newIdx }); setTimeout(() => startCamera(), 300);
                        }, 100);
                      }} className="flex flex-col items-center rounded-lg px-3 py-2 min-w-[60px] min-h-[44px] bg-white/10 hover:bg-white/20 border border-dashed border-white/30">
                        <span className="text-[10px] font-bold text-white/70">+</span>
                        <span className="text-[8px] font-bold text-white/40">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 z-0" style={{ paddingTop: cameraActive ? "12px" : "52px" }}>
            <button onClick={() => { stopCamera(); setWalkthroughRoom(null); }} className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-slate-300 text-slate-500 hover:bg-slate-100 hover:border-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="text-[15px] font-bold text-slate-800">{room.name}</span>
              <button type="button" onClick={() => {
                const newName = prompt("Rename room:", room.name);
                if (newName && newName.trim()) {
                  setHomeRooms(prev => prev.map((f, fIdx) => fIdx === fi ? { ...f, rooms: f.rooms.map((r, rIdx) => rIdx === ri ? { ...r, name: newName.trim() } : r) } : f));
                }
              }} className="text-slate-300 hover:text-slate-500 text-[10px]" title="Rename room">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
              </button>
              <span className="text-[12px] text-slate-400 ml-1">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{curIdx + 1}/{allAffected.length}</span>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <div className="p-4 space-y-3">
              {/* Scope instructions for this room */}
              {roomNotes[rKey] && (
                <div className="rounded-[10px] bg-amber-50 border border-amber-200 px-3 py-2">
                  <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-[.7px] mb-0.5">Scope Instructions</div>
                  <div className="text-[12px] text-amber-800">{roomNotes[rKey]}</div>
                </div>
              )}

              {/* Photo list — each photo with reason + note inline */}
              {photos.map((photo, pi) => (
                <div key={photo.ts} className="rounded-[14px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="relative">
                    <img src={photo.src} alt={`Photo ${pi + 1}`} className="w-full aspect-video object-cover" />
                    <button onClick={() => {
                      if (pendingPhotoDelete) { clearTimeout(pendingPhotoDelete.timer); setRoomPhotos(p => ({ ...p, [pendingPhotoDelete.rKey]: (p[pendingPhotoDelete.rKey] || []).filter((_, i) => i !== pendingPhotoDelete.index) })); }
                      const deleted = (roomPhotos[rKey] || [])[pi];
                      if (!deleted) return;
                      const timer = setTimeout(() => { setRoomPhotos(p => ({ ...p, [rKey]: (p[rKey] || []).filter((_, i) => i !== pi) })); setPendingPhotoDelete(null); }, 3000);
                      setPendingPhotoDelete({ rKey, index: pi, photo: deleted, timer });
                    }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-[13px] font-bold flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="rounded-full bg-black/60 text-white px-2.5 py-0.5 text-[11px] font-bold">#{pi + 1}</span>
                      {photo.tag === "cover" && <span className="rounded-full bg-yellow-500 text-white px-2 py-0.5 text-[9px] font-bold">COVER</span>}
                      {photo.tag === "roomCover" && <span className="rounded-full bg-blue-500 text-white px-2 py-0.5 text-[9px] font-bold">ROOM</span>}
                      {photo.tag === "origin" && <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[9px] font-bold">ORIGIN</span>}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 space-y-2">
                    {room.affected ? (
                      <>
                      <div className="flex flex-wrap gap-1.5">
                        {PHOTO_REASONS.map(r => (
                          <button key={r} onClick={() => updatePhoto(pi, "reason", photo.reason === r ? "" : r)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${photo.reason === r ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{r}</button>
                        ))}
                      </div>
                      {/* Sub-categories for reason */}
                      {photo.reason === "Pickup" && (() => {
                        // Pickup has two levels: delivery sub-reasons + departments
                        const subs = PHOTO_SUB_MAP["Pickup"] || [];
                        const selectedSubs = (photo.note || "").split(", ").filter(Boolean);
                        const toggleSub = (s: string) => {
                          const set = new Set(selectedSubs);
                          set.has(s) ? set.delete(s) : set.add(s);
                          updatePhoto(pi, "note", [...set].join(", "));
                        };
                        return (
                        <div className="rounded-[10px] border border-blue-200 bg-blue-50/50 p-2 space-y-1.5">
                          <div className="text-[10px] font-bold text-blue-600 uppercase">Pickup Type</div>
                          <div className="flex flex-wrap gap-1">
                            {subs.map(s => (
                              <button key={s} onClick={() => toggleSub(s)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedSubs.includes(s) ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 text-slate-500"}`}>{s}</button>
                            ))}
                          </div>
                          <div className="text-[10px] font-bold text-blue-600 uppercase pt-1">Department</div>
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => { const allDepts = Object.keys(PICKUP_DEPARTMENTS); const allOn = allDepts.every(d => selectedSubs.includes(d)); if (allOn) { allDepts.forEach(d => { if (selectedSubs.includes(d)) toggleSub(d); }); } else { allDepts.forEach(d => { if (!selectedSubs.includes(d)) toggleSub(d); }); } }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${Object.keys(PICKUP_DEPARTMENTS).every(d => selectedSubs.includes(d)) ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-300 text-slate-600"}`}>All</button>
                            {Object.keys(PICKUP_DEPARTMENTS).map(d => {
                              const isOn = selectedSubs.includes(d);
                              return <button key={d} onClick={() => toggleSub(d)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${isOn ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 text-slate-500"}`}>{d}</button>;
                            })}
                          </div>
                          {selectedSubs.some(s => PICKUP_DEPARTMENTS[s]) && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {selectedSubs.filter(s => PICKUP_DEPARTMENTS[s]).flatMap(s => PICKUP_DEPARTMENTS[s]).map(item => {
                                const isOn = selectedSubs.includes(item);
                                return <button key={item} onClick={() => toggleSub(item)} className={`rounded-full border px-2 py-0.5 text-[9px] font-bold transition-all ${isOn ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"}`}>{item}</button>;
                              })}
                            </div>
                          )}
                        </div>
                        );
                      })()}
                      {/* Generic sub-categories for other reasons */}
                      {photo.reason && photo.reason !== "Pickup" && PHOTO_SUB_MAP[photo.reason] && (() => {
                        const subs = PHOTO_SUB_MAP[photo.reason] || [];
                        const selectedSubs = (photo.note || "").split(", ").filter(Boolean);
                        const toggleSub = (s: string) => {
                          const set = new Set(selectedSubs);
                          set.has(s) ? set.delete(s) : set.add(s);
                          updatePhoto(pi, "note", [...set].join(", "));
                        };
                        return (
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50/50 p-2 space-y-1">
                          <div className="text-[9px] font-bold text-slate-500 uppercase">Details</div>
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => { const allOn = subs.every(s => selectedSubs.includes(s)); const next = allOn ? selectedSubs.filter(s => !subs.includes(s)) : [...new Set([...selectedSubs, ...subs])]; updatePhoto(pi, "note", next.join(", ")); }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${subs.every(s => selectedSubs.includes(s)) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-600"}`}>All</button>
                            {subs.map(s => (
                              <button key={s} onClick={() => toggleSub(s)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${selectedSubs.includes(s) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                        );
                      })()}
                      </>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-500 px-2.5 py-1 text-[11px] font-bold">Not Affected</span>
                    )}
                    {photo.reason !== "Pickup" && !PHOTO_SUB_MAP[photo.reason] && (
                      <div className="flex items-center gap-1.5">
                        <input value={photo.note} onChange={e => updatePhoto(pi, "note", e.target.value)} placeholder={room.affected ? "Add note..." : "Additional notes..."} className="flex-1 rounded-[8px] border border-slate-200 px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-blue-400" />
                        <button
                          onClick={() => toggleVoice(
                            { rKey, index: pi },
                            photo.note || "",
                            (text) => updatePhoto(pi, "note", text),
                          )}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[14px] ${isVoiceRecording({ rKey, index: pi }) ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                        >
                          {isVoiceRecording({ rKey, index: pi }) ? "⏹" : "🎙"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty state — only when camera not active */}
              {photos.length === 0 && !cameraActive && (
                <div className="text-center py-8">
                  <div className="text-[32px] mb-2">📷</div>
                  <div className="text-[14px] font-semibold text-slate-600 mb-1">No photos yet</div>
                  <div className="text-[12px] text-slate-400">Tap the camera button to start</div>
                  {cameraError && <div className="text-[11px] text-orange-500 mt-2">{cameraError}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Footer — camera + file fallback + navigation */}
          {!cameraActive && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-white">
            <div className="px-4 pt-3 pb-1 flex justify-center gap-3">
              <button onClick={startCamera} className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-blue-700 shadow-lg active:scale-95 transition-all" style={{ boxShadow: "0 6px 16px rgba(37,99,235,.3)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                Camera
              </button>
              <button onClick={openCamera} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                File
              </button>
            </div>
            {/* Room navigation */}
            <div className="px-4 py-2 flex justify-between gap-3">
              {prevRoom ? (
                <button onClick={() => switchToRoom(prevRoom.fi, prevRoom.ri)} className="rounded-[12px] border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50">← {prevRoom.name}</button>
              ) : <div />}
              {nextRoom ? (
                <button onClick={() => switchToRoom(nextRoom.fi, nextRoom.ri)} className="rounded-[12px] bg-slate-100 px-4 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-200">
                  {nextRoom.name} →
                </button>
              ) : (
                <button onClick={() => { stopCamera(); setWalkthroughRoom(null); }} className="rounded-[12px] bg-green-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-green-700">
                  All Done
                </button>
              )}
            </div>
          </div>
          )}
        </div>
        );
      })()}
      {pendingPhotoDelete && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] rounded-2xl bg-slate-800/95 backdrop-blur px-5 py-3 text-sm font-semibold text-white shadow-xl flex items-center gap-3">
          <span>Photo deleted</span>
          <button onClick={() => { clearTimeout(pendingPhotoDelete.timer); setPendingPhotoDelete(null); }} className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold hover:bg-white/30">Undo</button>
        </div>
      )}
      {photoCoverPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-[320px] space-y-3">
            <div className="text-[15px] font-bold text-slate-800">Set as Order Cover Photo?</div>
            <div className="text-[12px] text-slate-500">This will be the main photo on the SDS document.</div>
            <div className="flex gap-2">
              <button onClick={() => {
                setRoomPhotos(p => { const arr = [...(p[photoCoverPrompt.rKey] || [])]; if (arr[photoCoverPrompt.index]) arr[photoCoverPrompt.index] = { ...arr[photoCoverPrompt.index], tag: "cover" }; return { ...p, [photoCoverPrompt.rKey]: arr }; });
                setOrderCoverPhoto(`${photoCoverPrompt.rKey}-${photoCoverPrompt.index}`);
                setPhotoCoverPrompt(null);
              }} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[13px] font-bold text-white">Yes, Cover</button>
              <button onClick={() => {
                setRoomPhotos(p => { const arr = [...(p[photoCoverPrompt.rKey] || [])]; if (arr[photoCoverPrompt.index]) arr[photoCoverPrompt.index] = { ...arr[photoCoverPrompt.index], tag: "roomCover" }; return { ...p, [photoCoverPrompt.rKey]: arr }; });
                setPhotoCoverPrompt(null);
              }} className="flex-1 rounded-xl border border-slate-300 py-2.5 text-[13px] font-bold text-slate-700">Room Cover</button>
            </div>
            <button onClick={() => setPhotoCoverPrompt(null)} className="w-full text-center text-[12px] text-slate-400 hover:text-slate-600">Skip</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

// --- Scope Wizard end ---

// StartScreen — imported from ./components/screens/StartScreen

// GlobalSearch — imported from ./components/atoms

// Header — imported from ./components/atoms

// FloatingCapsule, Section — imported from ./components/atoms

// --- SUB-COMPONENTS ---
// CustomerItem — imported from ./components/atoms

// AddressItem — imported from ./components/atoms

// --- QUICK ENTRY COMPONENT ---
const QuickEntry = ({ data, update, updateMany, updateAddr, updateCust, companies, setModal, toggleMulti, handleConfirmClick, setToast, showInlineHelp, auditOn, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, quickQuestionsCollapsed, setQuickQuestionsCollapsed, compactMode, recordTypeLabel, getSalesRepForContact, onOpenCrmLog, onOpenReminder, knownPeople, onSetNowDate, onSetNowTime, dateCloseSignal, timeCloseSignal, onPromptRoleAssignment, toggleNonRestorationPrimary, toggleRestorationType, selectNonRestorationSubtype, onSwitchToDetailed, orderPoc, setOrderPoc, flagContactAsPoc }) => {
    const recordWord = data.isLead === true ? "Lead" : "Order";
    const [eventNoteDraft, setEventNoteDraft] = useState("");
    const [showQuickInstructions, setShowQuickInstructions] = useState(false);
    const [showLoadListPanel, setShowLoadListPanel] = useState(false);
    const [showAllEventNotes, setShowAllEventNotes] = useState(false);
    const [editSystemInstructions, setEditSystemInstructions] = useState(false);
    const [scheduleMoreOpen, setScheduleMoreOpen] = useState(false);
    const [quickCompanyOpen, setQuickCompanyOpen] = useState(false);
    const [quickCompanySelectedRole, setQuickCompanySelectedRole] = useState("");
    const [quickCompanyDraftCompany, setQuickCompanyDraftCompany] = useState("");
    const [quickCompanyDraftContact, setQuickCompanyDraftContact] = useState("");
    const [addNewModal, setAddNewModal] = useState(null);
    const [dismissedTips, setDismissedTips] = useState(new Set());
    const dismissTip = (key) => setDismissedTips(prev => new Set([...prev, key]));

    // Reset add-company state when data is cleared
    const vendorCount = (data.vendors || []).length;
    useEffect(() => {
      if (vendorCount === 0) {
        setQuickCompanySelectedRole("");
        setQuickCompanyDraftCompany("");
        setQuickCompanyDraftContact("");
      }
    }, [vendorCount]);

    // QUICK_COMPANY_TYPES — imported from ./config

    const quickAddedCompanies = data.vendors || [];
    const dateRef = useRef(null);
    const timeRef = useRef(null);
    const noteInputRef = useRef(null);
    const primaryAddr = data.addresses && data.addresses.length > 0 ? data.addresses[0] : {};
    const conditionSummary = summarizeConditions(data);
    const quickNotes = QUICK_INSTRUCTION_NOTES;
    const eventSystemLines = buildEventSystemLines(data, conditionSummary);
    const eventSystemEntries = buildEventSystemEntries(data, conditionSummary);
    const nonRestorationSelected = isNonRestorationSelected(data.orderTypes || []);
    const nonRestorationSubtype = getNonRestorationSubtype(data.orderTypes || []);
    const derivedProjectType = projectTypeFromOrderTypes(data.orderTypes || []);
    const isRestorationProject = derivedProjectType === "Restoration Project";
    const hasEventInstructions = !!(
      stripEventSystemLines(data.eventInstructions || "").trim() ||
      (eventSystemLines || "").trim() ||
      eventSystemEntries.length
    );
    const visibleEventNotes = showAllEventNotes ? (data.eventNotes || []) : (data.eventNotes || []).slice(0, 4);

    const appendQuickNote = (note) => {
        const nextNotes = toggleMulti(data.quickInstructionNotes || [], note);
        update("quickInstructionNotes", nextNotes);
    };

    const addEventNote = () => {
      const text = (eventNoteDraft || "").trim();
      if (!text) return;
      const next = [{ id: safeUid(), text, at: formatShortTimestamp(), user: data.currentUser || "Unknown" }, ...(data.eventNotes || [])];
      update("eventNotes", next);
      setEventNoteDraft("");
    };

    return (
        <div className={`fade-in pt-4 ${compactMode ? "" : "space-y-6"}`}>
            {showInlineHelp && !compactMode && (
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-700">Quick Entry</strong> — capture the basics fast. Need more fields? <button type="button" onClick={onSwitchToDetailed} className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2">Switch to Detailed</button> anytime, or add extra details in Event Instructions below.
                </p>
                {onSwitchToDetailed && (
                  <button type="button" onClick={onSwitchToDetailed} className="shrink-0 rounded-full border border-sky-300 bg-white px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-50 transition-all">
                    Detailed Entry
                  </button>
                )}
              </div>
            )}
            {compactMode ? (
            /* ═══ COMPACT DESKTOP 2-COLUMN LAYOUT ═══ */
            <div className="space-y-3 pb-28">
              {/* Order Name — full width */}
              <input value={data.orderName || ""} onChange={e => updateMany({ orderName: e.target.value, orderNameAuto: !e.target.value.trim() })} placeholder={`${recordWord} Name (e.g. Baker-PennsaukenNJ)`} className="w-full text-lg font-bold text-sky-700 border-b-2 border-slate-200 outline-none bg-transparent py-1 focus:border-sky-400 placeholder:text-slate-400/70 placeholder:font-normal" data-noe-field="orderName" />

              {/* ── ORDER ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
                  <ToggleGroup options={["Order", "Lead"]} value={data.isLead === true ? "Lead" : data.isLead === false ? "Order" : ""} onChange={v => update("isLead", v === "Lead")} />
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">What caused the loss?</div>
                    <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-2">
                      <div className="flex flex-wrap gap-1.5">
                        {[NON_RESTORATION_PRIMARY, ...LOSS_TYPES].map(lt => (
                          <ToggleMulti key={lt} label={lt} checked={data.primaryLossType === lt || (lt === NON_RESTORATION_PRIMARY && nonRestorationSelected)} onChange={() => { if (lt === NON_RESTORATION_PRIMARY) { toggleNonRestorationPrimary(); updateMany({ primaryLossType: NON_RESTORATION_PRIMARY }); return; } const np = data.primaryLossType === lt ? "" : lt; updateMany({ primaryLossType: np, orderTypes: np ? [np, ...(data.secondaryContaminants || []).filter(s => s !== np)] : [...(data.secondaryContaminants || [])] }); }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {data.primaryLossType && !nonRestorationSelected && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1">Additional contaminants</div>
                      <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-2">
                        <div className="flex flex-wrap gap-1.5">
                          {LOSS_TYPES.filter(t => t !== data.primaryLossType && t !== "Unknown").map(t => {
                            const ok = (COMPATIBLE_SECONDARY_LOSS[data.primaryLossType] || LOSS_TYPES).includes(t);
                            return <ToggleMulti key={t} label={t} checked={(data.secondaryContaminants || []).includes(t)} onChange={() => { if (!ok) return; const next = (data.secondaryContaminants||[]).includes(t) ? (data.secondaryContaminants||[]).filter(s=>s!==t) : [...(data.secondaryContaminants||[]),t]; updateMany({ secondaryContaminants: next, orderTypes: [data.primaryLossType, ...next] }); }} className={!ok ? "!opacity-30 !cursor-not-allowed" : ""} />;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  {nonRestorationSelected && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1">Non-Restoration Type</div>
                      <div className="flex flex-wrap gap-1.5">
                        {NON_RESTORATION_SUBTYPES.map(s => <ToggleMulti key={s} label={s} checked={nonRestorationSubtype === s} onChange={() => selectNonRestorationSubtype(s)} />)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Who is contacting the customer?</div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-1.5">
                      <div className="flex flex-wrap gap-1">
                        {[{k:"done",l:"Already contacted"},{k:"rep",l:"Contact POC only"},{k:"office",l:"Office please contact"},{k:"enter-only",l:"Enter only — do not contact"}].map(o => <ToggleMulti key={o.k} label={o.l} checked={data.contactAssignment===o.k} onChange={()=>updateMany({contactAssignment:data.contactAssignment===o.k?"":o.k})} />)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Referrer + Sales Rep + Companies */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
                  <h3 className="text-xs font-bold uppercase text-sky-600">Billing & Attribution</h3>
                  {isRestorationProject && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1">Who will be paying?</div>
                      <ToggleGroup options={["Insurance","Self-pay","Referrer","Public Adjuster","Other"]} value={data.payorQuick} onChange={v => { const patch: any = { payorQuick: v, billingPayer: v === "Self-pay" ? "Customer" : v }; if (v === "Insurance") { patch.involvesInsurance = "Yes"; patch.insuranceClaim = "Yes"; } else { patch.involvesInsurance = "No"; } updateMany(patch); }} />
                    </div>
                  )}
                  {data.payorQuick === "Insurance" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Claim #</div><Input value={data.claimNumber || ""} onChange={e => update("claimNumber", e.target.value)} placeholder="Claim number" className="!py-1 !text-xs" /></div>
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Policy #</div><Input value={data.policyNumber || ""} onChange={e => update("policyNumber", e.target.value)} placeholder="Policy number" className="!py-1 !text-xs" /></div>
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Source</div>
                    <ToggleGroup options={["Referral","Marketing","Internal"]} value={data.leadSourceCategory} onChange={v => update("leadSourceCategory", v)} />
                  </div>
                  {data.leadSourceCategory === "Marketing" && (
                    <div className="rounded-lg bg-sky-50/30 border border-sky-100 p-2">
                      <div className="text-[11px] font-bold text-slate-500 mb-1">Channel</div>
                      <div className="flex flex-wrap gap-1.5">
                        {MARKETING_SOURCES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}
                      </div>
                    </div>
                  )}
                  {data.leadSourceCategory === "Internal" && (
                    <div className="rounded-lg bg-sky-50/30 border border-sky-100 p-2">
                      <div className="text-[11px] font-bold text-slate-500 mb-1">Type</div>
                      <div className="flex flex-wrap gap-1.5">
                        {INTERNAL_TYPES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}
                      </div>
                    </div>
                  )}
                  {data.leadSourceCategory === "Referral" && <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Referrer</div>
                    <SearchSelect value={data.referrer || data.referringCompany || ""} onChange={v => { const parsed = parseCombinedContact(v); updateMany({ referrer: parsed.contact || v, referringCompany: parsed.company || "" }); }} options={combinedContactOptions} placeholder="Search referrer..." onAddNew={name => { setModal({ type: "contact", value: name, onSave: (n) => updateMany({ referrer: n }) }); }} />
                    {(data.referrer || data.referringCompany) && (
                      <div className="flex gap-1 mt-1.5">
                        <ToggleMulti label="Referrer" checked={true} onChange={() => {}} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} />
                        <ToggleMulti label="Bill To" checked={!!data.referrerIsBillTo} onChange={() => update("referrerIsBillTo", !data.referrerIsBillTo)} />
                        <ToggleMulti label="Insurance" checked={!!data.referrerIsInsurance} onChange={() => update("referrerIsInsurance", !data.referrerIsInsurance)} />
                      </div>
                    )}
                  </div>}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Sales Rep</div>
                    <div className="flex items-center gap-2">
                      {data.salesRep && <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-sm shrink-0">{getRepInitials(data.salesRep)}</span>}
                      <div className="flex-1"><SearchSelect value={data.salesRep || ""} onChange={v => update("salesRep", v)} options={["Mike S.", "Sarah J.", "Tom B."]} placeholder="Rep..." /></div>
                    </div>
                    {data.salesRep && suggestedReferrerRoles?.salesRep && data.salesRep !== suggestedReferrerRoles.salesRep && <div className="text-[11px] text-amber-600 mt-0.5">Referrer's rep is {suggestedReferrerRoles.salesRep}</div>}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">Companies & Contacts</div>
                    <SearchSelect value="" onChange={v => { const parsed = parseCombinedContact?.(v) || { contact: "", company: "" }; const entry = { company: parsed.company || v, contact: parsed.contact || "", type: "", id: safeUid(), incomplete: !combinedContactOptions.some(o => o.value === v) }; update("vendors", [...(data.vendors || []), entry]); setToast?.(`Added ${entry.company || entry.contact}`); }} options={combinedContactOptions} placeholder="Search to add..." clearOnCommit onAddNew={v => { update("vendors", [...(data.vendors || []), { company: "", contact: v, type: "", id: safeUid(), incomplete: true }]); setToast?.(`Added "${v}" as placeholder`); }} className="!border-sky-300 !rounded-lg" />
                    {(data.vendors || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{(data.vendors || []).map((v, i) => <span key={v.id || i} className={`rounded-full border px-2 py-0.5 text-[11px] font-bold inline-flex items-center gap-1 ${v.isPoc ? "border-violet-300 bg-violet-50 text-violet-700" : v.incomplete ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"}`}>{v.isPoc && <span className="text-violet-600">👤</span>}{v.company || v.contact}<button type="button" onClick={() => setOrderPoc(v.isPoc ? null : { kind: "vendor", id: v.id })} title={v.isPoc ? "Clear as Order POC" : "Flag as Order POC (only one POC per order)"} className={`ml-1 text-[10px] ${v.isPoc ? "text-violet-700 hover:text-violet-900" : "text-slate-400 hover:text-violet-600"}`}>{v.isPoc ? "✓POC" : "POC"}</button><button type="button" onClick={() => update("vendors", (data.vendors||[]).filter((_,j)=>j!==i))} className="ml-1 text-slate-400 hover:text-rose-500">×</button></span>)}</div>}
                  </div>
                </div>
              </div>

              {/* ── CUSTOMER + ADDRESS ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-sky-600 mb-2">Customer</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">First Name</div><Input value={data.customers?.[0]?.first || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { first: e.target.value })} className="!py-1.5 !text-sm" /></div>
                    <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Last Name</div><Input value={data.customers?.[0]?.last || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { last: e.target.value })} className="!py-1.5 !text-sm" /></div>
                    <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Phone</div><Input value={data.customers?.[0]?.phone || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { phone: formatPhoneNumber(e.target.value) })} placeholder="(555) 123-4567" className="!py-1.5 !text-sm" /></div>
                    <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Email</div><Input type="email" value={data.customers?.[0]?.email || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { email: e.target.value })} placeholder="email@example.com" className="!py-1.5 !text-sm" /></div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-sky-600 mb-2">Address</h3>
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <Input placeholder="Search address on Google..." value={primaryAddr.googleQuery || ""} onChange={e=>updateAddr(primaryAddr.id,{googleQuery:e.target.value})} className="!py-1.5 !text-sm flex-1" />
                      <button onClick={()=>updateAddr(primaryAddr.id,{street:"1 Main St",city:"Bloomingdale",state:"NJ",zip:"07403"})} className="rounded-lg bg-sky-500 px-3 text-[10px] font-bold text-white hover:bg-sky-600 shrink-0">Search</button>
                      <button type="button" onClick={() => useCurrentLocation(
                        coords => updateAddr(primaryAddr.id, { lat: String(coords.lat), lng: String(coords.lng), googleQuery: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` }),
                        msg => setToast?.(`Location error: ${msg}`)
                      )} className="rounded-lg border border-sky-300 bg-sky-50 px-2 text-[10px] font-bold text-sky-600 hover:bg-sky-100 shrink-0" title="Use current GPS location">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      </button>
                    </div>
                    {primaryAddr.lat && primaryAddr.lng && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <iframe title="Map" width="100%" height="100" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${primaryAddr.lat},${primaryAddr.lng}&zoom=16`} allowFullScreen />
                      </div>
                    )}
                    {!primaryAddr.lat && primaryAddr.street && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <iframe title="Map" width="100%" height="100" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent([primaryAddr.street, primaryAddr.city, primaryAddr.state, primaryAddr.zip].filter(Boolean).join(", "))}&zoom=16`} allowFullScreen />
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="col-span-3"><div className="text-[11px] font-bold text-slate-500 mb-0.5">Street</div><Input placeholder="Street address" value={primaryAddr.street || ""} onChange={e=>updateAddr(primaryAddr.id,{street:e.target.value})} className="!py-1.5 !text-sm" /></div>
                      <div className="col-span-1"><div className="text-[11px] font-bold text-slate-500 mb-0.5">Apt/Unit</div><Input placeholder="Apt" value={primaryAddr.apt || ""} onChange={e=>updateAddr(primaryAddr.id,{apt:e.target.value})} className="!py-1.5 !text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">City</div><Input placeholder="City" value={primaryAddr.city || ""} onChange={e=>updateAddr(primaryAddr.id,{city:e.target.value})} className="!py-1.5 !text-sm" /></div>
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">State</div><Select value={primaryAddr.state || ""} onChange={e=>updateAddr(primaryAddr.id,{state:e.target.value})} className="!py-1.5 !text-sm"><option value="">State</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}</Select></div>
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Zip</div><Input placeholder="Zip" value={primaryAddr.zip || ""} onChange={e=>updateAddr(primaryAddr.id,{zip:e.target.value})} className="!py-1.5 !text-sm" /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SCHEDULE + EVENT INSTRUCTIONS ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-sky-600 mb-2">Schedule</h3>
                  <div className="space-y-2">
                    <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Event Type</div><ToggleGroup options={["Scope","Pickup","In-Home","Meeting"]} value={data.scheduleType} onChange={v => update("scheduleType", v)} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="text-[11px] font-bold text-slate-500">Date</div>
                          <button type="button" onClick={() => { onSetNowDate?.(); onSetNowTime?.(); updateMany({ eventFirm: true, pickupTimeTentative: false }); }} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Now</button>
                        </div>
                        <DatePicker value={data.pickupDate} onChange={v=>update("pickupDate", v)} closeSignal={dateCloseSignal} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="text-[11px] font-bold text-slate-500">Time</div>
                          <button type="button" onClick={() => updateMany({ pickupTime: '12:00 AM', pickupTimeTentative: true, eventFirm: false })} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${data.pickupTime === '12:00 AM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border border-slate-200 text-slate-500'}`}>TBD</button>
                        </div>
                        <TimePicker value={data.pickupTime} onChange={v=>update("pickupTime", v)} closeSignal={timeCloseSignal} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Assignee</div><SearchSelect value={data.eventAssignee || ""} onChange={v=>update("eventAssignee", v)} options={TECHS} placeholder="Select..." /></div>
                      <div><div className="text-[11px] font-bold text-slate-500 mb-0.5">Vehicle</div><SearchSelect value={data.eventVehicle || ""} onChange={v=>update("eventVehicle", v)} options={VEHICLES} placeholder="Select..." /></div>
                    </div>
                    {data.pickupTime === '12:00 AM' && <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700 font-semibold">TBD — time not yet confirmed</div>}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase text-sky-600 mb-2">Event Instructions</h3>
                  <AutoGrowTextarea value={stripEventSystemLines(data.eventInstructions || "")} onChange={e => update("eventInstructions", composeEventInstructions(stripEventSystemLines(e.target.value), data, conditionSummary))} placeholder="Conditions, access, preferences, what to bring..." className="!min-h-[60px] !text-sm" />
                  {eventSystemEntries.length > 0 && (
                    <div className="mt-1.5 rounded border border-slate-100 bg-slate-50 px-2 py-1 space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Auto-filled</div>
                      {eventSystemEntries.map((entry, i) => <div key={i} className="text-[11px] text-slate-600"><span className="font-semibold">{entry.label}:</span> {entry.value}</div>)}
                    </div>
                  )}
                  <details className="mt-2">
                    <summary className="text-[11px] font-bold text-slate-400 cursor-pointer hover:text-slate-600 select-none">Quick Notes ›</summary>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["Everything Affected", "Save what you can", "Determine Impact", "Only specific items", "Pack the house"].map(n => (
                        <ToggleMulti key={n} label={n} checked={(data.quickInstructionNotes||[]).includes(n)} onChange={()=>appendQuickNote(n)} />
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
            ) : (
            /* ═══ COMFORTABLE SINGLE-COLUMN LAYOUT ═══ */
            <>
            <div id="quick-questions" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28">
              <div className="mb-4">
                <input
                  value={data.orderName || ""}
                  onChange={e => updateMany({ orderName: e.target.value, orderNameAuto: !e.target.value.trim() })}
                  placeholder={`${recordWord} Name (e.g. Baker-PennsaukenNJ)`}
                  className="w-full text-lg font-bold text-sky-700 border-none outline-none bg-transparent placeholder:text-slate-400/70 placeholder:font-normal"
                  data-noe-field="orderName"
                />
                <div className="h-px bg-slate-100 mt-1"></div>
              </div>
              <div className={`${compactMode ? "space-y-3" : "space-y-4"}`}>
                  <Field label="Is this an Order or only a Lead?">
                    <ToggleGroup options={[
                      { label: "Order", title: "Active project with confirmed billing." },
                      { label: "Lead", title: "Potential project; incomplete information or no billing yet." }
                    ]} value={data.isLead === true ? "Lead" : data.isLead === false ? "Order" : ""} onChange={v => update("isLead", v === "Lead")} />
                    {showInlineHelp && (data.isLead === true || data.isLead === false) && (
                    <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mt-1 flex items-start gap-1">
                      <span className="flex-1">🎓 {data.isLead === true ? getCoaching("field.isLead") : getCoaching("field.isOrder")}</span>
                      <button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                    </div>
                    )}
                  </Field>
                  <div className="border-t border-slate-100 pt-4">
                    <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={onApplyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={onOpenCrmLog} onPromptRoleAssignment={onPromptRoleAssignment} orderPoc={orderPoc} flagContactAsPoc={flagContactAsPoc} onAddNewToSystem={(info) => {
                      setAddNewModal({
                        firstName: info.firstName || "",
                        lastName: info.lastName || "",
                        title: "",
                        phone: "",
                        email: "",
                        companyName: "",
                        companyType: "",
                        companyPhone: "",
                        companyWebsite: "",
                        companyAddress: "",
                        isNewCompany: false,
                        source: info.source || "referrer",
                      });
                    }} />
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                  <Field label="What caused the loss?">
                    {showInlineHelp && !data.primaryLossType && !dismissedTips.has("Loss Type") && (
                      <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700 mb-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismissTip("Loss Type"); e.target.parentElement.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>
                        🎓 <span className="font-bold">Loss Type:</span> {getCoaching("field.lossType")}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {[NON_RESTORATION_PRIMARY, ...LOSS_TYPES].map((ot) => (
                        <ToggleMulti
                          key={ot}
                          label={ot}
                          title={LOSS_TYPE_COACHING[ot] || "Type of peril/damage involved."}
                          checked={data.primaryLossType === ot || (ot === NON_RESTORATION_PRIMARY && nonRestorationSelected)}
                          onChange={() => {
                            if (ot === NON_RESTORATION_PRIMARY) {
                              toggleNonRestorationPrimary();
                              updateMany({ primaryLossType: NON_RESTORATION_PRIMARY });
                              return;
                            }
                            const newPrimary = data.primaryLossType === ot ? "" : ot;
                            const newOrderTypes = newPrimary ? [newPrimary, ...(data.secondaryContaminants || []).filter(s => s !== newPrimary)] : [...(data.secondaryContaminants || [])];
                            updateMany({ primaryLossType: newPrimary, orderTypes: newOrderTypes });
                          }}
                        />
                      ))}
                    </div>
                    {showInlineHelp && data.primaryLossType && LOSS_TYPE_COACHING[data.primaryLossType] && (
                      <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mt-1 mb-2 flex items-start gap-1">
                        <span className="flex-1">🎓 <span className="font-bold">{data.primaryLossType}:</span> {LOSS_TYPE_COACHING[data.primaryLossType]}</span>
                        <button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                      </div>
                    )}
                  </Field>
                  {nonRestorationSelected && (
                    <Field label="Non-Restoration Type" missing={data.highlightMissing?.nonRestorationSubtype}>
                      <div className="flex flex-wrap gap-2">
                        {NON_RESTORATION_SUBTYPES.map((subtype) => (
                          <ToggleMulti
                            key={subtype}
                            label={subtype}
                            title="Required for non-restoration orders."
                            checked={nonRestorationSubtype === subtype}
                            onChange={() => selectNonRestorationSubtype(subtype)}
                          />
                        ))}
                      </div>
                    </Field>
                  )}
                  {data.primaryLossType && !nonRestorationSelected && (
                    <Field label="Additional contaminants?">
                      <div className="flex flex-wrap gap-2">
                        {LOSS_TYPES.filter(t => t !== data.primaryLossType && t !== "Unknown").map(t => {
                          const compatible = (COMPATIBLE_SECONDARY_LOSS[data.primaryLossType] || LOSS_TYPES).includes(t);
                          return (
                          <ToggleMulti
                            key={t}
                            label={t}
                            checked={(data.secondaryContaminants || []).includes(t)}
                            onChange={() => {
                              if (!compatible) return;
                              const next = (data.secondaryContaminants || []).includes(t)
                                ? (data.secondaryContaminants || []).filter(s => s !== t)
                                : [...(data.secondaryContaminants || []), t];
                              updateMany({ secondaryContaminants: next, orderTypes: [data.primaryLossType, ...next] });
                            }}
                            className={!compatible ? "!opacity-30 !cursor-not-allowed" : ""}
                            title={!compatible ? `${t} is not typically related to ${data.primaryLossType}` : ""}
                          />
                        );
                        })}
                      </div>
                      {showInlineHelp && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mt-1 flex items-start gap-1"><span className="flex-1">{getCoaching("field.contaminants")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                    </Field>
                  )}
                  {isRestorationProject && (
                    <Field label="Who will be paying?">
                      <ToggleGroup options={[
                        { label: "Insurance", title: "Customer is filing an insurance claim." },
                        { label: "Self-pay", title: "Customer pays directly without insurance." },
                        { label: "Referrer", title: "Referring party covers payment." },
                        { label: "Public Adjuster", title: "Public adjuster covers payment." },
                        { label: "Other", title: "Other payment arrangement." }
                      ]} value={data.payorQuick} onChange={v => {
                        const patch = { payorQuick: v, billingPayer: v === "Self-pay" ? "Customer" : (v === "Insurance" ? "Insurance" : v) };
                        if (v === "Insurance") { patch.involvesInsurance = "Yes"; patch.insuranceClaim = "Yes"; }
                        else { patch.involvesInsurance = "No"; }
                        updateMany(patch);
                      }} />
                    </Field>
                  )}
                  {data.payorQuick === "Insurance" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Claim #" noeField="claimNumber">
                        <Input value={data.claimNumber || ""} onChange={e => update("claimNumber", e.target.value)} placeholder="e.g. 70100933341" />
                      </Field>
                      <Field label="Policy #" noeField="policyNumber">
                        <Input value={data.policyNumber || ""} onChange={e => update("policyNumber", e.target.value)} placeholder="e.g. 2361416060" />
                      </Field>
                    </div>
                  )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Companies & Contacts on this Order</div>
                    <SearchSelect
                      value=""
                      onChange={v => {
                        const parsed = parseCombinedContact?.(v) || { contact: "", company: "" };
                        const companyName = parsed.company || v;
                        const contactName = parsed.contact || "";
                        const existing = (data.vendors || []).some(x =>
                          normalizeCompany(x.company || "") === normalizeCompany(companyName) &&
                          normalizeContact(x.contact || "") === normalizeContact(contactName)
                        );
                        if (existing) { setToast?.(`${contactName ? contactName + " at " : ""}${companyName} is already on this order`); return; }
                        const isKnown = combinedContactOptions.some(opt =>
                          normalizeCompany(opt.value || "") === normalizeCompany(v) ||
                          normalizeContact(opt.value || "") === normalizeContact(v)
                        );
                        const inferredType = inferCompanyTypeFromName(companyName);
                        const entry = {
                          company: companyName,
                          contact: contactName,
                          type: isKnown && inferredType !== "Other" ? inferredType : "",
                          id: safeUid(),
                          incomplete: !isKnown,
                        };
                        update("vendors", [...(data.vendors || []), entry]);
                        setToast?.(isKnown
                          ? `Added ${contactName ? contactName + " at " : ""}${companyName}`
                          : `Added "${v}" as placeholder — tap Complete to add full details`
                        );
                      }}
                      onQueryChange={() => {}}
                      options={combinedContactOptions}
                      placeholder="🔍  Search contacts and companies to add..."
                      clearOnCommit
                      onAddNew={v => {
                        const entry = { company: "", contact: v, type: "", id: safeUid(), incomplete: true };
                        update("vendors", [...(data.vendors || []), entry]);
                        setToast?.(`Added "${v}" as placeholder — tap to complete details`);
                      }}
                      className="!border-sky-300 !rounded-lg"
                    />
                    {quickAddedCompanies.length > 0 && (
                      <div className="space-y-2">
                        {quickAddedCompanies.map((v, idx) => {
                          const isReferrer = data.referringCompany && normalizeCompany(v.company || "") === normalizeCompany(data.referringCompany);
                          const isInsurance = data.insuranceCompany && normalizeCompany(v.company || "") === normalizeCompany(data.insuranceCompany);
                          const isBillTo = data.billingCompany && normalizeCompany(v.company || "") === normalizeCompany(data.billingCompany);
                          return (
                            <div key={v.id || `qc-${idx}`} className={`flex items-center gap-3 rounded-lg border px-4 py-3 flex-wrap ${v.incomplete ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
                              {v.incomplete ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nameParts = (v.contact || "").trim().split(/\s+/);
                                    setAddNewModal({
                                      firstName: nameParts[0] || "",
                                      lastName: nameParts.slice(1).join(" ") || "",
                                      title: "",
                                      phone: "",
                                      email: "",
                                      companyName: v.company || "",
                                      companyType: v.type || "",
                                      companyPhone: "",
                                      companyWebsite: "",
                                      companyAddress: "",
                                      isNewCompany: !v.company,
                                      source: "vendors",
                                      replaceIdx: idx,
                                    });
                                  }}
                                  className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-200 cursor-pointer"
                                >
                                  Needs Attention
                                </button>
                              ) : (
                                <span className="rounded-full bg-sky-100 border border-sky-200 px-2.5 py-1 text-[10px] font-bold text-sky-700">{v.type || "Company"}</span>
                              )}
                              <span className="text-base font-bold text-slate-800">{v.company || v.contact || v.name}</span>
                              {v.contact && v.company && <span className="text-base text-slate-600">— {v.contact}</span>}
                              {[
                                { active: isInsurance, label: "Insurance", toggle: () => {
                                  if (isInsurance) updateMany({ insuranceCompany: "", insuranceAdjuster: "" });
                                  else {
                                    if (data.insuranceCompany && normalizeCompany(data.insuranceCompany) !== normalizeCompany(v.company)) {
                                      if (!window.confirm(`This order already has "${data.insuranceCompany}" as insurance. Change to "${v.company}"?`)) return;
                                    }
                                    updateMany({ insuranceCompany: v.company, insuranceAdjuster: v.contact || "", insuranceClaim: "Yes", involvesInsurance: "Yes" });
                                  }
                                }},
                                { active: isBillTo, label: "Bill To", toggle: () => {
                                  if (isBillTo) updateMany({ billingCompany: "", billingContact: "" });
                                  else updateMany({ billingCompany: v.company, billingContact: v.contact || "" });
                                }},
                              ].map(role => (
                                <button key={role.label} type="button" onClick={role.toggle}
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold border transition-all ${role.active ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white border-slate-200 text-slate-400 hover:border-sky-200 hover:text-sky-600'}`}
                                >{role.label}</button>
                              ))}
                              {v.incomplete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nameParts = (v.contact || "").trim().split(/\s+/);
                                    setAddNewModal({
                                      firstName: nameParts[0] || "",
                                      lastName: nameParts.slice(1).join(" ") || "",
                                      title: "",
                                      phone: "",
                                      email: "",
                                      companyName: v.company || "",
                                      companyType: v.type || "",
                                      companyPhone: "",
                                      companyWebsite: "",
                                      companyAddress: "",
                                      isNewCompany: !v.company,
                                      source: "vendors",
                                      replaceIdx: idx,
                                    });
                                  }}
                                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800"
                                >
                                  Complete
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => update("vendors", quickAddedCompanies.filter((_, i) => i !== idx))}
                                className="ml-auto text-[10px] font-bold text-slate-400 hover:text-rose-500"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
              </div>
            </div>

            <div id="quick-customer" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28" data-noe-section="customer">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase text-sky-600">Customer</h3>
                  <span className="text-[10px] text-slate-400">Notes? Add to Event Instructions below</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First Name" noeField="customerFirstName">
                        <Input value={data.customers?.[0]?.first || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { first: e.target.value })} />
                    </Field>
                    <Field label="Last Name" noeField="customerLastName">
                        <Input value={data.customers?.[0]?.last || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { last: e.target.value })} />
                    </Field>
                    <Field label="Phone" noeField="customerPhone">
                        <Input value={data.customers?.[0]?.phone || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { phone: formatPhoneNumber(e.target.value) })} placeholder="(555) 123-4567" />
                    </Field>
                    <Field label="Email" noeField="customerEmail">
                        <Input type="email" value={data.customers?.[0]?.email || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { email: e.target.value })} placeholder="user@example.com" />
                    </Field>
                </div>
            </div>

            <div id="quick-address" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28" data-noe-section="address">
                 <div className="flex items-baseline justify-between mb-4">
                   <h3 className="text-sm font-bold uppercase text-sky-600">Address</h3>
                   <span className="text-[10px] text-slate-400">Gate codes, access notes? Add below</span>
                 </div>
                 <div className="grid gap-4">
                    <div className="rounded-lg border border-sky-50 bg-sky-50/50 p-2">
                        <Field label="Find on Google" subtle className="text-sky-700" noeField="addressSearch">
                             <div className="flex gap-2">
                                <Input placeholder="Start typing address..." value={primaryAddr.googleQuery || ""} onChange={e=>updateAddr(primaryAddr.id,{googleQuery:e.target.value})} />
                                <button data-noe-action="address-search" className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 transition-all" onClick={()=>updateAddr(primaryAddr.id,{street:"1 Main St",city:"Bloomingdale",state:"NJ",zip:"07403"})}>Search</button>
                                <button type="button" onClick={() => useCurrentLocation(
                                  coords => updateAddr(primaryAddr.id, { lat: String(coords.lat), lng: String(coords.lng), googleQuery: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` }),
                                  msg => setToast?.(`Location error: ${msg}`)
                                )} className="rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-600 hover:bg-sky-50 shrink-0 flex items-center gap-1" title="Use current GPS location">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                  <span className="hidden sm:inline">Location</span>
                                </button>
                             </div>
                        </Field>
                    </div>
                    {primaryAddr.street && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <iframe title="Map" width="100%" height="120" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent([primaryAddr.street, primaryAddr.city, primaryAddr.state, primaryAddr.zip].filter(Boolean).join(", "))}&zoom=16`} allowFullScreen />
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-3"><Field label="Street" noeField="addressStreet"><Input value={primaryAddr.street || ""} onChange={e=>updateAddr(primaryAddr.id,{street:e.target.value})} /></Field></div>
                      <div className="col-span-1"><Field label="Apt/Unit" noeField="addressApt"><Input value={primaryAddr.apt || ""} onChange={e=>updateAddr(primaryAddr.id,{apt:e.target.value})} placeholder="Apt #" /></Field></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="col-span-1" data-noe-field="addressCity"><Input placeholder="City" value={primaryAddr.city || ""} onChange={e=>updateAddr(primaryAddr.id,{city:e.target.value})} /></div>
                       <div className="col-span-1" data-noe-field="addressState"><Select value={primaryAddr.state || ""} onChange={e=>updateAddr(primaryAddr.id,{state:e.target.value})}><option value="">State</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}</Select></div>
                       <div className="col-span-1" data-noe-field="addressZip"><Input placeholder="Zip" value={primaryAddr.zip || ""} onChange={e=>updateAddr(primaryAddr.id,{zip:e.target.value})} /></div>
                    </div>
                 </div>
            </div>

            <div id="quick-scheduling" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28" data-noe-section="scheduling">
                <h3 className="mb-4 text-sm font-bold uppercase text-sky-600">Schedule & Event Instructions</h3>
                <div className="mb-4">
                  <Field label="Event Type">
                    <ToggleGroup options={["Scope","Pickup","In-Home","Meeting"]} value={data.scheduleType} onChange={v => update("scheduleType", v)} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <Field
                      label="Date"
                      action={
                        <button
                          type="button"
                          onClick={() => { onSetNowDate?.(); onSetNowTime?.(); updateMany({ eventFirm: true, pickupTimeTentative: false, scheduleStatus: "" }); }}
                          className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                          title="Set date to today, time to next half hour, and mark as firm"
                        >
                          Now
                        </button>
                      }
                    >
                      <DatePicker value={data.pickupDate} onChange={(v)=>update("pickupDate", v)} closeSignal={dateCloseSignal} />
                    </Field>
                    <Field label="Time" action={
                      <button
                        type="button"
                        onClick={() => updateMany({ pickupTime: '12:00 AM', pickupTimeTentative: true, eventFirm: false })}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${data.pickupTime === '12:00 AM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700'}`}
                        title="Set time to TBD (12:00 AM placeholder)"
                      >
                        TBD
                      </button>
                    }>
                      <TimePicker value={data.pickupTime} onChange={(v)=>update("pickupTime", v)} closeSignal={timeCloseSignal} />
                    </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Assignee">
                    <SearchSelect value={data.eventAssignee || ""} onChange={v=>update("eventAssignee", v)} options={TECHS} placeholder="Select assignee..." />
                  </Field>
                  <Field label="Vehicle">
                    <SearchSelect value={data.eventVehicle || ""} onChange={v=>update("eventVehicle", v)} options={VEHICLES} placeholder="Select vehicle..." />
                  </Field>
                </div>
                {data.pickupTime === '12:00 AM' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-semibold">
                    TBD — on the calendar but time not yet confirmed.
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="text-sm font-bold text-slate-700 mb-1">Event Instructions</div>
                  {showInlineHelp && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-2 flex items-start gap-1"><span className="flex-1">{getCoaching("section.eventInstructions")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                  <AutoGrowTextarea
                    value={stripEventSystemLines(data.eventInstructions || "")}
                    onChange={e => update("eventInstructions", composeEventInstructions(stripEventSystemLines(e.target.value), data, conditionSummary))}
                    placeholder="e.g. Fire started in basement. Water in basement too. Boarded up, no electricity — bring lights. Customer is elderly, does not text. Dog on premises."
                    className="!min-h-[100px]"
                  />
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Who is contacting the customer?</div>
                    <div className="flex flex-wrap gap-2">
                      <ToggleMulti label="Already contacted" checked={data.contactAssignment === "done"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "done" ? "" : "done" })} />
                      <ToggleMulti label="Contact POC only" checked={data.contactAssignment === "rep"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "rep" ? "" : "rep" })} />
                      <ToggleMulti label="Office please contact" checked={data.contactAssignment === "office"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "office" ? "" : "office" })} />
                      <ToggleMulti label="Enter only — do not contact" checked={data.contactAssignment === "enter-only"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "enter-only" ? "" : "enter-only" })} />
                    </div>
                  </div>
                </div>
            </div>


            {addNewModal && (
              <div className="fixed inset-0 z-[140] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-8 sm:pt-16 overflow-auto"
                onKeyDown={e => { if (e.key === "Escape") setAddNewModal(null); }}
              >
                <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden" tabIndex={-1} ref={el => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}>
                  <div className="bg-sky-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white">Add New Contact / Company</h3>
                    <p className="text-sm text-sky-100">This will add them to the system for future orders.</p>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Company section */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</div>
                      <SearchSelect
                        value={addNewModal.companyName}
                        onChange={v => setAddNewModal(p => ({ ...p, companyName: v, isNewCompany: !companies.some(c => normalizeCompany(c) === normalizeCompany(v)) }))}
                        onQueryChange={() => {}}
                        options={companies.map(c => ({ label: c, value: c, type: "company" }))}
                        placeholder="Search existing or type new company..."
                        onAddNew={v => setAddNewModal(p => ({ ...p, companyName: v, isNewCompany: true }))}
                      />
                      {addNewModal.companyName && (
                        <div className={`text-[11px] font-semibold ${addNewModal.isNewCompany ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {addNewModal.isNewCompany
                            ? `"${addNewModal.companyName}" is new — will be created`
                            : `"${addNewModal.companyName}" found`}
                        </div>
                      )}
                      {addNewModal.isNewCompany && addNewModal.companyName && (
                        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">New Company Details</div>
                            <button
                              type="button"
                              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(addNewModal.companyName)}`, '_blank')}
                              className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                            >
                              Search Google
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {QUICK_COMPANY_TYPES.map(type => (
                              <button key={type} type="button" onClick={() => setAddNewModal(p => ({ ...p, companyType: type }))}
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${addNewModal.companyType === type ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:border-sky-300'}`}
                              >{type}</button>
                            ))}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input value={addNewModal.companyPhone || ""} onChange={e => setAddNewModal(p => ({ ...p, companyPhone: formatPhoneNumber(e.target.value) }))} placeholder="Company phone" />
                            <Input value={addNewModal.companyWebsite || ""} onChange={e => setAddNewModal(p => ({ ...p, companyWebsite: e.target.value }))} placeholder="Website" />
                          </div>
                          <Input value={addNewModal.companyAddress || ""} onChange={e => setAddNewModal(p => ({ ...p, companyAddress: e.target.value }))} placeholder="Company address" />
                        </div>
                      )}
                    </div>
                    {/* Contact section */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact{addNewModal.companyName ? ` at ${addNewModal.companyName}` : ""}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input value={addNewModal.firstName || ""} onChange={e => setAddNewModal(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
                        <Input value={addNewModal.lastName || ""} onChange={e => setAddNewModal(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
                      </div>
                      <Input value={addNewModal.title || ""} onChange={e => setAddNewModal(p => ({ ...p, title: e.target.value }))} placeholder="Title (e.g. Adjuster, Project Manager, Owner)" />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input value={addNewModal.phone || ""} onChange={e => setAddNewModal(p => ({ ...p, phone: formatPhoneNumber(e.target.value) }))} placeholder="Phone" />
                        <Input value={addNewModal.email || ""} onChange={e => setAddNewModal(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex justify-between border-t border-slate-200">
                    <button onClick={() => setAddNewModal(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                    <button
                      onClick={() => {
                        const fullName = [addNewModal.firstName, addNewModal.lastName].filter(Boolean).join(" ");
                        const companyName = addNewModal.companyName || "";
                        if (!fullName && !companyName) return;
                        const inferredType = addNewModal.isNewCompany ? (addNewModal.companyType || "Other") : inferCompanyTypeFromName(companyName);
                        const entry = { company: companyName, contact: fullName, type: inferredType, title: addNewModal.title || "", id: safeUid(), incomplete: false };
                        if (addNewModal.replaceIdx !== undefined && addNewModal.replaceIdx !== null) {
                          const next = [...(data.vendors || [])];
                          next[addNewModal.replaceIdx] = entry;
                          update("vendors", next);
                        } else {
                          update("vendors", [...(data.vendors || []), entry]);
                        }
                        if (addNewModal.source === "referrer") {
                          update("referrer", fullName);
                          update("referringCompany", companyName);
                          // Auto-create CRM log for new referral
                          const referralLog = {
                            id: Date.now().toString(),
                            createdAt: new Date().toISOString(),
                            method: "System",
                            owner: data.currentUser || data.salesRep || "",
                            subject: "New Order Referral",
                            orderLink: data.orderNumber || "",
                            notes: `Referral from ${fullName ? fullName + (companyName ? " at " + companyName : "") : companyName}. Order #${data.orderNumber || "—"}.`,
                            followUp: null,
                            notify: { salesRep: true, orderLead: false, others: [] },
                          };
                          setData(prev => ({ ...prev, crmLogs: [...(prev.crmLogs || []), referralLog] }));
                        }
                        setToast?.(`Added ${fullName ? fullName + (companyName ? " at " + companyName : "") : companyName} to the system`);
                        setAddNewModal(null);
                      }}
                      disabled={!addNewModal.firstName && !addNewModal.companyName}
                      className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add to System & Order
                    </button>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
        </div>
    );
};

// --- MAIN APP ---

// createOrderInstructionDraft — imported from ./utils/orderFactories

export default function App(){
  // SECTION_ORDER — imported from ./config
  // createAlertModalState, createSmartConfirmState — imported from ./utils/modalState
  // normalizeSampleContacts — imported from ./utils/normalizeSampleContacts
  const [entryMode, setEntryMode] = useState("start"); 
  const [showCoaching, setShowCoaching] = useState(true);
  const showInlineHelp = showCoaching;
  const setShowInlineHelp = setShowCoaching;
  const [dismissedTips, setDismissedTips] = useState(new Set());
  const dismissTip = (key) => setDismissedTips(prev => new Set([...prev, key]));
  const tipVisible = (key) => showCoaching && !dismissedTips.has(key);
  const [compactMode, setCompactMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewView, setPreviewView] = useState("table");
  const [saveMissingOpen, setSaveMissingOpen] = useState(false);
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem("same-day-scope-v52");
      const parsed = s ? JSON.parse(s) : {};
      return hydrateOrderFromParsed(parsed, {
        orderInstructions: normalizeInstructionEntries(parsed.orderInstructions || []),
      });
    } catch { return DEFAULT_FORM; }
  });
  const recordWord = data.isLead === true ? "Lead" : "Order";
  const [interviewPanelOpen, setInterviewPanelOpen] = useState(false);
  const [interviewExpanded, setInterviewExpanded] = useState({});
  const [dismissedCoaching, setDismissedCoaching] = useState(new Set<string>());
  const [interviewSearch, setInterviewSearch] = useState("");
  const [rushGuideOpen, setRushGuideOpen] = useState(false);
  const [rushGuideStep, setRushGuideStep] = useState(1);
  const [rushGuideData, setRushGuideData] = useState({ interests: [], events: [] });
  const [pendingDeliveryDateChange, setPendingDeliveryDateChange] = useState<any>(null);
  const [draggingDelivery, setDraggingDelivery] = useState<{id: string; pct: number} | null>(null);
  // Timeline (Rush Guide) is opened only by explicit user action — the View Timeline
  // button in the interview footer or the "Rush Guide not ready" Action Items link.
  // The previous auto-open-on-scroll behavior fought with search filtering and made
  // the close × feel broken (closing then immediately reopening). Manual only.

  // When the user types in interview search, scroll the panel to the first matched
  // question container so they don't have to manually scroll. The first .noe-iq
  // element in the scroll container IS the first matching question (filtered ones
  // don't render). Fall back to first <mark> highlight, then to top.
  useEffect(() => {
    if (!interviewPanelOpen) return;
    if (!interviewSearch.trim()) return;
    const t = setTimeout(() => {
      const container = document.getElementById("noe-interview-scroll");
      if (!container) return;
      const firstQuestion = container.querySelector(".noe-iq");
      if (firstQuestion) { firstQuestion.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      const firstMark = container.querySelector("mark");
      if (firstMark) firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      else container.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [interviewSearch, interviewPanelOpen]);
  const [deliveryDateVersion, setDeliveryDateVersion] = useState(0);

  // Sync timeline groupOverrides → interview deliveryGroupDetails + estimatedReturnDate
  useEffect(() => {
    const overrides = (rushGuideData as any).groupOverrides;
    if (!overrides || !Object.keys(overrides).length) return;
    setData(prev => {
      const details = { ...(prev as any).deliveryGroupDetails || {} };
      let returnDate = prev.estimatedReturnDate;
      let changed = false;
	      Object.entries(overrides).forEach(([groupId, ovr]: [string, any]) => {
	        const existing = details[groupId] || {};
	        const nextDetail = { ...existing };
	        if (ovr?.dateStr) {
	          if (!existing || existing.date !== ovr.dateStr) {
	            nextDetail.date = ovr.dateStr;
	            changed = true;
	          }
	          // If this group is marked final, update estimatedReturnDate
	          if (existing?.isFinal && returnDate !== ovr.dateStr) {
	            returnDate = ovr.dateStr;
	            changed = true;
	          }
	        }
	        ["address", "addressType", "addressId"].forEach(field => {
	          if (ovr?.[field] !== undefined && nextDetail[field] !== ovr[field]) {
	            nextDetail[field] = ovr[field];
	            changed = true;
	          }
	        });
	        if (changed) details[groupId] = nextDetail;
	      });
      if (!changed) return prev;
      return { ...prev, deliveryGroupDetails: details, estimatedReturnDate: returnDate };
    });
  }, [(rushGuideData as any).groupOverrides]);

  // Sync interview deliveryGroupDetails → timeline groupOverrides
  useEffect(() => {
    const details = (data as any).deliveryGroupDetails;
    if (!details || !Object.keys(details).length) return;
    setRushGuideData(prev => {
      const overrides = { ...(prev as any).groupOverrides || {} };
      let changed = false;
	      Object.entries(details).forEach(([groupId, det]: [string, any]) => {
	        const existing = overrides[groupId] || {};
	        const nextOverride = { ...existing };
	        if (det?.date && nextOverride.dateStr !== det.date) {
	          nextOverride.dateStr = det.date;
	          changed = true;
	        }
	        ["address", "addressType", "addressId"].forEach(field => {
	          if (det?.[field] !== undefined && nextOverride[field] !== det[field]) {
	            nextOverride[field] = det[field];
	            changed = true;
	          }
	        });
	        if (changed) overrides[groupId] = nextOverride;
	      });
      if (!changed) return prev;
      return { ...prev, groupOverrides: overrides };
    });
  }, [(data as any).deliveryGroupDetails]);

  // Delivery Planner helpers
  // computeStorageEstimate — imported from ./utils/dateTime
  const computeAutoAddress = (groupId: string) => pickAutoAddressForDeliveryGroup(groupId, data.livingTimeline || []);

  // Auto-derive storageNeeded/storageMonths from Final delivery group date
  useEffect(() => {
    const details = (data as any).deliveryGroupDetails || {};
    const finalEntry = Object.entries(details).find(([, det]: [string, any]) => det?.isFinal);
    if (!finalEntry) return;
    const finalDate = (finalEntry[1] as any)?.date;
    if (!finalDate) return;
    const today = new Date().toISOString().split("T")[0];
    const months = computeStorageEstimate(today, finalDate);
    if (months > 0) {
      if (data.storageNeeded !== "Y" || data.storageMonths !== String(months)) {
        setData(p => ({ ...p, storageNeeded: "Y", storageMonths: String(months), estimatedReturnDate: finalDate }));
      }
    }
  }, [(data as any).deliveryGroupDetails]);

  // Auto-derive processType from Final group's address type
  useEffect(() => {
    const details = (data as any).deliveryGroupDetails || {};
    const finalEntry = Object.entries(details).find(([, det]: [string, any]) => det?.isFinal);
    if (!finalEntry) return;
    const pt = deliveryAddressTypeToProcessType((finalEntry[1] as any)?.addressType);
    if (pt && pt !== data.processType) update("processType", pt);
  }, [(data as any).deliveryGroupDetails]);

  const [actionItemsOpen, setActionItemsOpen] = useState(false);
  const [actionItemsBlockerOpen, setActionItemsBlockerOpen] = useState(false);
  const [actionItemsGroupOpen, setActionItemsGroupOpen] = useState<Record<string, boolean>>({});
  const [toastQueue, setToastQueue] = useState<{id: number; message: string}[]>([]);
  const toastIdRef = useRef(0);
  const setToast = useCallback((msg: string) => {
    if (!msg) return;
    const id = ++toastIdRef.current;
    setToastQueue(prev => {
      if (prev.some(t => t.message === msg)) return prev;
      return [...prev, { id, message: msg }];
    });
  }, []);
  const removeToast = useCallback((id: number) => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  }, []);
  // Keep backward compat: `toast` is truthy when queue has items
  const toast = toastQueue.length > 0 ? toastQueue[0].message : "";
  const coaching = useCallback((key: string) => getCoaching(key, (data as any)._coachingOverrides), [data]);
  const [showSearch, setShowSearch] = useState(false);
  // TEST_PRESETS_KEY, loadTestPresetsFromStorage, saveTestPresetsToStorage, upsertTestPresetByName — imported from ./utils/testPresets
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [testPresets, setTestPresets] = useState(loadTestPresetsFromStorage);
  const [fieldConfig, setFieldConfig] = useState(() => loadMergedRecordFromStorage("noe-field-config-v1", DEFAULT_FIELD_CONFIG));
  const [blockerRules, setBlockerRules] = useState(() => loadJsonFromStorage("noe-blocker-rules-v1", () => [...DEFAULT_BLOCKER_RULES]));
  const [interviewActions, setInterviewActions] = useState(() => loadMergedRecordFromStorage("noe-interview-actions-v1", DEFAULT_INTERVIEW_ACTIONS));
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [configSelectedKeys, setConfigSelectedKeys] = useState(new Set());
  const [configSearch, setConfigSearch] = useState("");
  const isFieldVisible = (key) => fieldConfig[key]?.visible !== false;
  const executeInterviewActions = (answerKey, isOn) => {
    const config = interviewActions[answerKey];
    if (!config || !config.actions) return;
    if (!isOn) return; // only execute on selection, not deselection
    const executed = [];
    const toastTemplate = (type: string, value: string) => {
      const tpl = coaching(`toast.${type}`);
      return tpl ? tpl.replace(/\{value\}/g, value) : `${type}: ${value}`;
    };
    config.actions.forEach(action => {
      switch (action.type) {
        case "loadList":
          setData(p => ({ ...p, loadList: Array.from(new Set([...(p.loadList || []), action.value])) }));
          executed.push(toastTemplate("loadList", action.value));
          break;
        case "handlingCode":
          setData(p => ({ ...p, handlingCodes: Array.from(new Set([...(p.handlingCodes || []), action.value])) }));
          executed.push(toastTemplate("handlingCode", action.value));
          break;
        case "eventInstruction": {
          const note = action.value;
          setData(p => {
            const current = stripEventSystemLines(p.eventInstructions || "").trim();
            if (current.includes(note)) return p;
            const combined = current ? `${current}\n${note}` : note;
            return { ...p, eventInstructions: composeEventInstructions(combined, p, conditionSummary) };
          });
          executed.push(toastTemplate("eventInstruction", note));
          break;
        }
        case "sdsObservation":
          setData(p => ({ ...p, sdsObservations: Array.from(new Set([...(p.sdsObservations || []), action.value])) }));
          executed.push(toastTemplate("sdsObservation", action.value));
          break;
        case "suggestGroup":
          setData(p => ({ ...p, suggestedGroups: Array.from(new Set([...(p.suggestedGroups || []), action.value])) }));
          executed.push(toastTemplate("suggestGroup", action.value));
          break;
        case "blocker":
          setData(p => {
            const current = p.scopeBridge?.pendingIssues || [];
            if (current.includes(action.value)) return p;
            return { ...p, scopeBridge: { ...(p.scopeBridge || {}), pendingIssues: [...current, action.value] } };
          });
          executed.push(toastTemplate("blocker", action.value));
          break;
        case "contactNote":
          // Add to primary customer note
          setData(p => {
            const custs = [...(p.customers || [])];
            if (custs[0]) {
              const existing = custs[0].note || "";
              if (!existing.includes(action.value)) {
                custs[0] = { ...custs[0], note: existing ? `${existing}, ${action.value}` : action.value };
              }
            }
            return { ...p, customers: custs };
          });
          break;
        case "addressPlaceholder":
          setData(p => {
            const addrs = [...(p.addresses || [])];
            const exists = addrs.some(a => a.purpose === action.value);
            if (exists) return p;
            addrs.push({ id: safeUid(), street: "", city: "", state: "", zip: "", isPrimary: false, purpose: action.value, label: `${action.value} Address`, linkedContext: "Living Situation" });
            return { ...p, addresses: addrs };
          });
          executed.push(toastTemplate("addressPlaceholder", action.value));
          break;
        case "suggestOrderType":
          setData(p => {
            const types = Array.from(new Set([...(p.orderTypes || []), action.value]));
            return { ...p, orderTypes: types };
          });
          executed.push(toastTemplate("suggestOrderType", action.value));
          break;
        case "openMoldLimit":
          setData(p => ({ ...p, moldLimitWarning: true }));
          executed.push(toastTemplate("openMoldLimit", ""));
          break;
      }
    });
    if (executed.length && localStorage.getItem("noe-action-toasts") !== "off") setToast(executed.join(" · "));
  };
  const matchesInterviewSearch = (title, ...extras) => {
    const q = interviewSearch.trim().toLowerCase();
    if (!q) return true;
    if (title.toLowerCase().includes(q)) return true;
    // extras may contain strings, arrays of strings, or null/undefined.
    // Arrays are joined so each element is searchable individually.
    return extras.some(e => {
      if (e == null) return false;
      const text = Array.isArray(e) ? e.join(" ") : String(e);
      return text.toLowerCase().includes(q);
    });
  };
  const isSearchMatch = (text) => {
    const q = interviewSearch.trim().toLowerCase();
    return q && text.toLowerCase().includes(q);
  };
  const highlightSearch = (text) => {
    const q = interviewSearch.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
  };
  const [openSections, setOpenSections] = useState({sec1:true, sec2:false, sec3:false, sec4:false, sec5:false}); 
  const [modal, setModal] = useState({type:"",value:"",onSave:null});
  const [openCodes, setOpenCodes] = useState(false);
  const [billingSubOpen, setBillingSubOpen] = useState(false);
  const [insuranceSubOpen, setInsuranceSubOpen] = useState(false);
  const [companiesSubOpen, setCompaniesSubOpen] = useState(false);
  const [financeSubOpen, setFinanceSubOpen] = useState(false);
  const [showQuickInstructions, setShowQuickInstructions] = useState(false);
  const [showLoadListPanel, setShowLoadListPanel] = useState(false);
  const [eventNoteDraft, setEventNoteDraft] = useState("");
  const [showAllEventNotes, setShowAllEventNotes] = useState(false);
  const [editSystemInstructions, setEditSystemInstructions] = useState(false);
  const [companyRolesExpanded, setCompanyRolesExpanded] = useState(false);
  
  const [visitedSections, setVisitedSections] = useState(new Set(['sec1']));

  const [alertModal, setAlertModal] = useState(createAlertModalState);
  const [smartNotification, setSmartNotification] = useState(null);
  const [conditionAutoFillHints, setConditionAutoFillHints] = useState({});
  const [smartConfirm, setSmartConfirm] = useState(createSmartConfirmState);
  const [orderInstructionModal, setOrderInstructionModal] = useState({
    isOpen: false,
    mode: "add",
    draft: createOrderInstructionDraft(),
  });
  const [roleAssignModal, setRoleAssignModal] = useState({
    isOpen: false,
    source: "",
    company: "",
    contact: "",
    options: [],
    selected: []
  });
  const [confirmDetails, setConfirmDetails] = useState(null);
  const [confirmTentativeOk, setConfirmTentativeOk] = useState(false);
  const [confirmMissingOk, setConfirmMissingOk] = useState(false);
  const [confirmContextOpen, setConfirmContextOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderDraft, setReminderDraft] = useState({ date: "", time: "", assignee: "" });
  const [dateCloseTick, setDateCloseTick] = useState(0);
  const [timeCloseTick, setTimeCloseTick] = useState(0);
  const [welcomeModal, setWelcomeModal] = useState({ isOpen: false, customerId: null, note: "", selectedSpecialDocs: [] });
  const [showWelcomeQuickNotes, setShowWelcomeQuickNotes] = useState(false);
  const [editContactModal, setEditContactModal] = useState<{ isOpen: boolean; companyName: string; contactName: string; contactTitle: string; contactEmail: string; contactPhone: string; } | null>(null);

  const [crmModal, setCrmModal] = useState({
    isOpen: false,
    method: "",
    owner: "",
    subject: "",
    orderLink: "",
    notes: "",
    followUpEnabled: false,
    followUpDate: "",
    followUpTime: "",
    notifySalesRep: true,
    notifyOrderLead: true,
    notifyOthers: ""
  });
  const [quickQuestionsCollapsed, setQuickQuestionsCollapsed] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [newPlanStep, setNewPlanStep] = useState("");
  const [planDraftSteps, setPlanDraftSteps] = useState([]);
  const [planReorderDirty, setPlanReorderDirty] = useState(false);
  const [planDragId, setPlanDragId] = useState(null);
  const [planEditingId, setPlanEditingId] = useState(null);
  const [planEditingText, setPlanEditingText] = useState("");
  const [planAssignee, setPlanAssignee] = useState("");
  const [auditTargets, setAuditTargets] = useState({ sections: new Set(), subsections: new Set() });
  const [showPrimaryCoords, setShowPrimaryCoords] = useState(false);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const [addNewSystemModal, setAddNewSystemModal] = useState(null);
  const [addCompanyType, setAddCompanyType] = useState("");
  const [, setShowTypePicker] = useState(false);
  const [companyModalCloseArmed, setCompanyModalCloseArmed] = useState(false);
  const [addCompanyPanel, setAddCompanyPanel] = useState("");
  const [newCompanyDraft, setNewCompanyDraft] = useState({ contact: "", company: "" });
  const [addContactExisting, setAddContactExisting] = useState({ contact: "", company: "" });
  const [addCompanyQuery, setAddCompanyQuery] = useState("");
  const [companyEdit, setCompanyEdit] = useState({});
  const [sampleContacts, setSampleContacts] = useState(() => {
    try {
      const s = localStorage.getItem("sample-contacts");
      return normalizeSampleContacts(s ? JSON.parse(s) : SAMPLE_CONTACTS);
    } catch {
      return normalizeSampleContacts(SAMPLE_CONTACTS);
    }
  });
  const [showSampleDataModal, setShowSampleDataModal] = useState(false);
  const [livingAddressPrompt, setLivingAddressPrompt] = useState({ open: false, type: "" });
  const [billingAssignmentUnlocked, setBillingAssignmentUnlocked] = useState(false);
  const [insuranceAssignmentUnlocked, setInsuranceAssignmentUnlocked] = useState(false);
  const addCompanyInputRef = useRef(null);
  const [autoFlash, setAutoFlash] = useState({ key: "", ts: 0 });
  const [sessionInstructionKeys, setSessionInstructionKeys] = useState(() => new Set());
  const lastNonRestorationToastRef = useRef("");
  const lastCarrierAlertKeyRef = useRef("");
  const tpaAssignmentPromptedRef = useRef(false);
  const previousInsuranceCompanyRef = useRef(data.insuranceCompany || "");

  useEffect(() => {
    if (entryMode === "quick") {
      setData(prev => ({ ...prev, isLead: true }));
    }
  }, [entryMode]);

  useEffect(() => {
    if (data.referringCompany === "Servpro of Anytown" && !data.referrer) {
      setData(prev => ({ ...prev, referringCompany: "" }));
    }
  }, [data.referringCompany, data.referrer]);

  useEffect(() => {
    if (data.moldCoverageConfirm && !data.moldLimit) {
      setData(prev => ({ ...prev, moldLimit: prev.moldCoverageConfirm || prev.moldLimit }));
    }
  }, [data.moldCoverageConfirm, data.moldLimit]);

  useEffect(() => {
    if (data.rentCoverageLimit && !data.contentsCoverageLimit) {
      setData(prev => ({ ...prev, contentsCoverageLimit: prev.rentCoverageLimit || prev.contentsCoverageLimit }));
    }
  }, [data.rentCoverageLimit, data.contentsCoverageLimit]);

  useEffect(() => {
    if (addCompanyModalOpen) {
      setTimeout(() => addCompanyInputRef.current?.focus(), 60);
      setCompanyModalCloseArmed(false);
    }
  }, [addCompanyModalOpen]);

  useEffect(() => {
    const timeValue = (data.pickupTime || "").trim();
    const autoFirm = shouldAutoFirm(timeValue);
    setData(prev => {
      let next = prev;
      let changed = false;
      if (!timeValue && prev.eventFirm) {
        next = { ...next, eventFirm: false };
        changed = true;
      }
      if (prev.pickupTimeTentative && prev.eventFirm) {
        next = { ...next, eventFirm: false };
        changed = true;
      }
      if (timeValue && autoFirm && !prev.pickupTimeTentative && !prev.eventFirm) {
        next = { ...next, eventFirm: true };
        changed = true;
      }
      if (timeValue && !autoFirm && prev.eventFirm) {
        next = { ...next, eventFirm: false };
        changed = true;
      }
      if (next.eventFirm && next.scheduleStatus) {
        next = { ...next, scheduleStatus: "" };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [data.pickupTime, data.pickupTimeTentative]);

  useEffect(() => {
    if (data.insuranceClaim !== "Yes") return;
    setData(prev => {
      const types = new Set(prev.additionalCompanyTypes || []);
      const existing = prev.additionalCompanies?.["Insurance"] || { contact: "", company: "" };
      const company = prev.insuranceCompany || existing.company || "";
      const contact = prev.insuranceAdjuster || existing.contact || "";
      const changed = !types.has("Insurance") || existing.company !== company || existing.contact !== contact;
      if (!changed) return prev;
      types.add("Insurance");
      return {
        ...prev,
        additionalCompanyTypes: Array.from(types),
        additionalCompanies: {
          ...(prev.additionalCompanies || {}),
          ["Insurance"]: syncCompanyEntryPlaceholders({ contact, company })
        }
      };
    });
  }, [data.insuranceClaim, data.insuranceCompany, data.insuranceAdjuster]);

  useEffect(() => {
    const company = data.referringCompany || "";
    const contact = data.referrer || "";
    if (!company || !contact) return;
    const isCarrier = NATIONAL_CARRIERS.some(c => normalizeCompany(c) === normalizeCompany(company));
    if (!isCarrier) return;
    setData(prev => ({
      ...prev,
      insuranceCompany: prev.insuranceCompany || company,
      billingCompany: prev.billingCompany || company,
      nationalCarrier: prev.nationalCarrier || company,
      insuranceAdjuster: prev.insuranceAdjuster || contact,
      insuranceClaim: prev.insuranceClaim || "Yes",
      involvesInsurance: prev.involvesInsurance || "Yes",
      billingPayer: prev.billingPayer || "Insurance"
    }));
  }, [data.referringCompany, data.referrer]);

  useEffect(() => {
    const isAdjusterReferrer = !!data.referrer && data.referrer === data.insuranceAdjuster;
    const billToMatch =
      (!!data.billingContact && data.billingContact === data.referrer) ||
      (!!data.billingCompany && !!data.referringCompany && normalizeCompany(data.billingCompany) === normalizeCompany(data.referringCompany));
    if (isAdjusterReferrer && billToMatch && !data.eventBillToContacted) {
      setData(prev => ({ ...prev, eventBillToContacted: true }));
      setToast("Bill To Contacted auto-selected (adjuster is referrer).");
    }
  }, [data.referrer, data.insuranceAdjuster, data.billingContact, data.billingCompany, data.referringCompany, data.eventBillToContacted]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditOn, setAuditOn] = useState(false);
  const [auditMissing, setAuditMissing] = useState([]);
  const [auditPercent, setAuditPercent] = useState(0);
  const [saveSummaryLines, setSaveSummaryLines] = useState([]);
  const [saveSummaryMissing, setSaveSummaryMissing] = useState([]);
  const [saveExportLines, setSaveExportLines] = useState([]);
  const appContentRef = useRef(null);
  const quickNudgeShownRef = useRef(false);
  const [modeButtonFlash, setModeButtonFlash] = useState(false);
  const [showSdsPreview, setShowSdsPreview] = useState(false);
  const [showSdsQuestionnaire, setShowSdsQuestionnaire] = useState(false);
  const [showScope, setShowScope] = useState(false);
  const closeSds = useCallback(() => {
    setShowSdsPreview(false);
    if ((window as any).__returnToScope) {
      (window as any).__returnToScope = false;
      setTimeout(() => setShowScope(true), 100);
    }
  }, []);
  const orderNameInputRef = useRef(null);
  const scheduleDateRef = useRef(null);
  const scheduleTimeRef = useRef(null);
  const eventNoteInputRef = useRef(null);
  const [autoScrollDone, setAutoScrollDone] = useState(false);
  const [lastLossDetailTouched, setLastLossDetailTouched] = useState(null);
  const [pendingAddressTypePromptId, setPendingAddressTypePromptId] = useState("");
  const [pendingAddressFromGoogle, setPendingAddressFromGoogle] = useState(null);
  const [orderSubOpen, setOrderSubOpen] = useState(true);
  const [sourceSubOpen, setSourceSubOpen] = useState(false);
  const [, setInterviewSubOpen] = useState(false);
  const [codesSubOpen, setCodesSubOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [scheduleSubOpen, setScheduleSubOpen] = useState(true);
  const [scheduleBridgeOpen, setScheduleBridgeOpen] = useState(false);

  useEffect(() => {
    if (entryMode !== "detailed") return;
    setOrderSubOpen(true);
    setSourceSubOpen(false);
    setInterviewSubOpen(false);
    setCodesSubOpen(false);
    setBillingSubOpen(false);
    setInsuranceSubOpen(false);
    setCompaniesSubOpen(false);
    setScheduleBridgeOpen(false);
  }, [entryMode]);
  useEffect(() => {
    if (entryMode !== "detailed") return;
    const modalOpen = document.querySelector("[data-suggested-roles-modal='true']");
    if (modalOpen) return;
    const timer = window.setTimeout(() => {
      const el = orderNameInputRef.current;
      if (!(el instanceof HTMLElement)) return;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [entryMode]);
  
  const [minimizedLossTypes, setMinimizedLossTypes] = useState({});
  const [manualEditLossTypes, setManualEditLossTypes] = useState({});

  const [companies,setCompanies]=useState(()=>{ 
    try { 
      const s=localStorage.getItem("companies-registry"); 
      const parsed = s?JSON.parse(s):[]; 
      return Array.from(new Set([...(parsed||[]), ...DEFAULT_COMPANIES])); 
    } catch { return DEFAULT_COMPANIES; }
  });
  const [contacts,setContacts]=useState(()=>{
    try { 
      const s=localStorage.getItem("contacts-registry"); 
      const parsed = s?JSON.parse(s):[]; 
      return Array.from(new Set([...(parsed||[]), ...DEFAULT_CONTACTS])); 
    } catch { return DEFAULT_CONTACTS; }
  });

  useEffect(() => saveJsonToStorage("companies-registry", companies), [companies]);
  useEffect(() => saveJsonToStorage("contacts-registry", contacts), [contacts]);
  useEffect(() => saveJsonToStorage("same-day-scope-v52", data), [data]);
  useEffect(() => saveJsonToStorage("noe-field-config-v1", fieldConfig), [fieldConfig]);
  useEffect(() => saveJsonToStorage("noe-blocker-rules-v1", blockerRules), [blockerRules]);
  useEffect(() => saveJsonToStorage("noe-interview-actions-v1", interviewActions), [interviewActions]);
  useEffect(() => saveJsonToStorage("sample-contacts", sampleContacts), [sampleContacts]);
  const [householdEditOpen, setHouseholdEditOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const onFocusIn = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (document.querySelector("[data-suggested-roles-modal='true']")) return;
      const isFocusable = target.matches("input, select, textarea, button, [tabindex]");
      if (!isFocusable) return;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      });
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  const update = useCallback((k,v) => setData(p=>({...p,[k]:v})), []);
  const updateMany = useCallback((patch) => setData(p => {
    const next = { ...p, ...patch };
    // Sync propertyType ↔ primary address buildingType
    if (patch.propertyType && next.addresses?.length) {
      next.addresses = next.addresses.map((a, i) => a.isPrimary || i === 0 ? { ...a, buildingType: patch.propertyType } : a);
    }
    return next;
  }), []);

  // --- AI / AUTOMATION API ---
  useEffect(() => {
    const schema = {
      // Core order fields
      isLead: { type: "boolean", description: "True if this is a lead, false if a confirmed order" },
      orderName: { type: "string", description: "Order name (auto-generated or manual)" },
      orderStatus: { type: "enum", options: ORDER_STATUSES, description: "Current order status" },
      orderTypes: { type: "string[]", options: [...LOSS_TYPES, NON_RESTORATION_PRIMARY], description: "Loss/order types" },
      // Customer
      "customers[0].first": { type: "string", description: "Primary customer first name" },
      "customers[0].last": { type: "string", description: "Primary customer last name" },
      "customers[0].phone": { type: "string", description: "Primary customer phone" },
      "customers[0].email": { type: "string", description: "Primary customer email" },
      "customers[0].type": { type: "enum", options: CUSTOMER_TYPES, description: "Customer relationship type" },
      // Address
      "addresses[0].street": { type: "string", description: "Primary address street" },
      "addresses[0].city": { type: "string", description: "Primary address city" },
      "addresses[0].state": { type: "enum", options: STATES, description: "Primary address state" },
      "addresses[0].zip": { type: "string", description: "Primary address zip code" },
      // Source
      leadSourceCategory: { type: "enum", options: LEAD_SOURCES, description: "How the lead was sourced" },
      contactMethod: { type: "enum", options: CONTACT_METHODS, description: "How we were contacted" },
      referringCompany: { type: "string", description: "Company that referred this order" },
      referrer: { type: "string", description: "Person who referred this order" },
      salesRep: { type: "enum", options: SALES_REPS, description: "Assigned sales rep" },
      // Insurance
      insuranceClaim: { type: "enum", options: ["Yes", "No"], description: "Whether this involves an insurance claim" },
      insuranceCompany: { type: "string", description: "Insurance carrier name" },
      insuranceAdjuster: { type: "string", description: "Insurance adjuster name" },
      claimNumber: { type: "string", description: "Insurance claim number" },
      dateOfLoss: { type: "date", description: "Date of loss (YYYY-MM-DD)" },
      policyNumber: { type: "string", description: "Insurance policy number" },
      // Billing
      billingPayer: { type: "string", description: "Who is paying (Insurance, Customer, etc.)" },
      billingCompany: { type: "string", description: "Billing company name" },
      billingContact: { type: "string", description: "Billing contact name" },
      // Scheduling
      scheduleType: { type: "enum", options: MEETING_TYPES, description: "Type of scheduled event" },
      pickupDate: { type: "date", description: "Scheduled date (YYYY-MM-DD)" },
      pickupTime: { type: "string", description: "Scheduled time (e.g. '9:00 AM')" },
      eventAssignee: { type: "string", description: "Person assigned to this event" },
      eventInstructions: { type: "string", description: "Instructions for the field team" },
      eventFirm: { type: "boolean", description: "Whether the schedule is firm" },
      // Services
      serviceOfferings: { type: "string[]", options: SERVICE_OFFERINGS, description: "Selected service offerings" },
      suggestedGroups: { type: "string[]", options: SUGGESTED_GROUPS, description: "Suggested processing groups" },
      // Conditions
      damageWasWet: { type: "string", options: ["Y", "N"], description: "Whether damage is still wet" },
      damageMoldMildew: { type: "boolean", description: "Whether visible mold/mildew is present" },
      noHeat: { type: "boolean", description: "Whether there is no heat at the site" },
      noLights: { type: "boolean", description: "Whether there is no electricity" },
      boardedUp: { type: "boolean", description: "Whether the building is boarded up" },
      // SDS
      sdsConsiderations: { type: "string[]", options: SDS_CONSIDERATIONS, description: "SDS customer considerations" },
      sdsObservations: { type: "string[]", options: SDS_OBSERVATIONS, description: "SDS site observations" },
      sdsServices: { type: "string[]", options: SDS_SERVICES, description: "SDS services requested" },
    };

    window.NOE = {
      getData: () => JSON.parse(JSON.stringify(data)),
      update: (field, value) => {
        if (field.startsWith("customers[0].")) {
          const prop = field.split(".")[1];
          const custId = data.customers?.[0]?.id;
          if (custId) setData(p => ({ ...p, customers: p.customers.map((c, i) => i === 0 ? { ...c, [prop]: value } : c) }));
          return;
        }
        if (field.startsWith("addresses[0].")) {
          const prop = field.split(".")[1];
          const addrId = data.addresses?.[0]?.id;
          if (addrId) setData(p => ({ ...p, addresses: p.addresses.map((a, i) => i === 0 ? { ...a, [prop]: value } : a) }));
          return;
        }
        setData(p => ({ ...p, [field]: value }));
      },
      updateMany: (patch) => setData(p => ({ ...p, ...patch })),
      getMode: () => entryMode,
      setMode: (mode) => { if (["start", "quick", "detailed", "same-day-scope"].includes(mode)) setEntryMode(mode); },
      getSchema: () => JSON.parse(JSON.stringify(schema)),
      getFieldValue: (field) => {
        if (field.startsWith("customers[0].")) return data.customers?.[0]?.[field.split(".")[1]] || "";
        if (field.startsWith("addresses[0].")) return data.addresses?.[0]?.[field.split(".")[1]] || "";
        return data[field];
      },
      listFields: () => Object.keys(schema),
      version: "1.0",
    };

    return () => { delete window.NOE; };
  }, [data, entryMode]);

  const setSuggestedGroupsAndSync = useCallback((list) => {
    const safeList = Array.isArray(list) ? list : [];
    setData((prev) => {
      const prevScope = normalizeScopeBridgeState(prev.scopeBridge || {});
      const groupsUnchanged = stringListMatches(prev.suggestedGroups || [], safeList);
      const scopeGroupsUnchanged = stringListMatches(prevScope.selectedGroups || [], safeList);
      if (groupsUnchanged && scopeGroupsUnchanged) return prev;
      return {
        ...prev,
        suggestedGroups: safeList,
        scopeBridge: withScopeBridgeSnippet({
          ...prevScope,
          selectedGroups: safeList,
        }),
      };
    });
  }, []);
  const applyScopeBridge = useCallback((rawBridge) => {
    setData((prev) => {
      const prevScope = normalizeScopeBridgeState(prev.scopeBridge || {});
      const incoming = normalizeScopeBridgeState(rawBridge || {});
      const mergedSelectedGroups = Array.isArray(incoming.selectedGroups) && incoming.selectedGroups.length
        ? incoming.selectedGroups
        : (prev.suggestedGroups || []);
      const nextScope = withScopeBridgeSnippet({
        ...prevScope,
        ...incoming,
        selectedGroups: mergedSelectedGroups,
      });

      const patch = {
        scopeBridge: nextScope,
      };

      if (!stringListMatches(prev.suggestedGroups || [], mergedSelectedGroups)) {
        patch.suggestedGroups = mergedSelectedGroups;
      }

      if (incoming.pickupOption === "wait") {
        patch.pickupBeforeApproval = "No";
        patch.pickupBeforeApprovalNote = "Hold pickup until schedule authorization.";
      } else if (incoming.pickupOption === "urgent") {
        patch.pickupBeforeApproval = "Yes";
        patch.pickupBeforeApprovalNote = mergedSelectedGroups.length
          ? `Urgent pickup groups only: ${mergedSelectedGroups.join(", ")}.`
          : "Urgent pickup groups only.";
      }

      if (incoming.processingOption) {
        const processMap = {
          tag_hold: "Tag & Hold",
          urgent: "Urgent Groups Only",
          cod: "COD",
          all: "Process All",
          specific: "Specific Groups Only",
        };
        patch.processType = processMap[incoming.processingOption] || prev.processType;
      }

      if (incoming.deliveryOption === "hold_cod") {
        patch.processType = "COD";
      }

      return { ...prev, ...patch };
    });
  }, []);
  const triggerAutoFlash = useCallback((key) => {
    setAutoFlash({ key, ts: Date.now() });
    setTimeout(() => setAutoFlash({ key: "", ts: 0 }), 1400);
  }, []);
  const getFlashClass = (key) => (autoFlash.key === key ? "auto-flash" : "");
  const updateAddr = useCallback((id, patch) => setData(p => ({
    ...p,
    addresses: p.addresses.map(a => {
      if (a.id !== id) {
        // If setting another address as Primary, clear Primary from this one
        if (patch.isPrimary === true) return { ...a, isPrimary: false };
        return a;
      }
      const next = { ...a, ...patch };
      const hasResolvedAddressData = [next.street, next.city, next.state, next.zip, next.googleQuery]
        .some(v => hasMeaningfulValue(v) && (v || "").toString().trim().toUpperCase() !== "TBD");
      if (hasResolvedAddressData) {
        next.placeholder = null;
        if ((next.street || "").trim().toUpperCase() === "TBD") next.street = "";
      }
      return next;
    })
  })), []);
  const updateCust = useCallback((id, patch) => setData(prev => ({
    ...prev,
    customers: prev.customers.map(customer => {
      if (customer.id !== id) return customer;
      const next = { ...customer, ...patch };
      const shouldClearPlaceholder = isPlaceholderFlagActive(next.placeholder) && hasCustomerDetails(next);
      if (shouldClearPlaceholder) {
        next.placeholder = null;
      } else if (!hasCustomerDetails(next) && !next.isPrimary && !isPlaceholderFlagActive(next.placeholder)) {
        next.placeholder = createPlaceholderFlag("customer", "Customer details needed");
      }
      return next;
    })
  })), []);

  // --- Order POC (Point of Contact) ---
  // Resolves the single POC for this order — see utils/orderEntities.
  const orderPoc = useMemo(() => resolveOrderPoc(data), [data.customers, data.vendors]);

  // setOrderPoc — exclusive: clears every existing isPoc flag, then sets the chosen one.
  // Pass null to clear without setting a new POC. When changing from one POC to a
  // different one, confirm with the user first ("POC is presently X, are you sure...").
  const setOrderPoc = useCallback((target) => {
    if (orderPoc && target) {
      const sameTarget = orderPoc.kind === target.kind && orderPoc.id === target.id;
      if (!sameTarget) {
        if (!window.confirm(`POC is presently ${orderPoc.name || "set"}, are you sure you want to change it?`)) return;
      }
    }
    setData(prev => {
      const customers = (prev.customers || []).map(c => {
        const want = target?.kind === "customer" && target.id === c.id;
        return c.isPoc === want ? c : { ...c, isPoc: want };
      });
      const vendors = (prev.vendors || []).map(v => {
        const want = target?.kind === "vendor" && target.id === v.id;
        return v.isPoc === want ? v : { ...v, isPoc: want };
      });
      return { ...prev, customers, vendors };
    });
  }, [orderPoc]);

  // flagContactAsPoc — flag a contact from Detailed mode (insurance adjuster, public adjuster,
  // additional companies, etc.) as the order POC. Finds the contact in data.vendors if present;
  // otherwise pushes a new vendor row for them, then flips isPoc exclusively to that vendor.
  // Pass empty company+contact to clear the POC.
  const flagContactAsPoc = useCallback((companyName, contactName, contactType = "") => {
    if (!companyName && !contactName) { setOrderPoc(null); return; }
    if (orderPoc) {
      const sameTarget =
        orderPoc.kind === "vendor" &&
        normalizeCompany(orderPoc.company || "") === normalizeCompany(companyName || "") &&
        normalizeContact(orderPoc.name || "") === normalizeContact(contactName || "");
      if (!sameTarget) {
        if (!window.confirm(`POC is presently ${orderPoc.name || "set"}, are you sure you want to change it?`)) return;
      }
    }
    setData(prev => {
      const existingIdx = (prev.vendors || []).findIndex(v =>
        normalizeCompany(v.company || "") === normalizeCompany(companyName || "") &&
        normalizeContact(v.contact || "") === normalizeContact(contactName || "")
      );
      let vendors = [...(prev.vendors || [])];
      let targetId;
      if (existingIdx >= 0) {
        targetId = vendors[existingIdx].id;
      } else {
        targetId = safeUid();
        vendors.push({ id: targetId, company: companyName || "", contact: contactName || "", type: contactType, isPoc: false });
      }
      vendors = vendors.map(v => {
        const want = v.id === targetId;
        return v.isPoc === want ? v : { ...v, isPoc: want };
      });
      const customers = (prev.customers || []).map(c => c.isPoc ? { ...c, isPoc: false } : c);
      return { ...prev, vendors, customers };
    });
  }, [setOrderPoc, orderPoc]);

  // isPocContact — true when the given company+contact pair is the active order POC.
  // Compares by normalized name + company against the resolved orderPoc.
  const isPocContact = (companyName, contactName) => {
    if (!orderPoc) return false;
    return normalizeCompany(orderPoc.company || "") === normalizeCompany(companyName || "") &&
           normalizeContact(orderPoc.name || "")    === normalizeContact(contactName || "");
  };

  useEffect(() => { saveTestPresetsToStorage(testPresets); }, [testPresets]);

  const saveTestPreset = useCallback(() => {
    const name = presetName.trim();
    if (!name) {
      setToast("Enter a preset name.");
      return;
    }
    const payload = {
      id: safeUid(),
      name,
      createdAt: new Date().toISOString(),
      data,
      scopePhotos: (data as any).scopePhotos || null
    };
    setTestPresets(prev => upsertTestPresetByName(prev, payload));
    setPresetName("");
    setToast("Test preset saved.");
  }, [data, presetName]);

  const loadTestPreset = useCallback((preset) => {
    if (!preset?.data) return;
    setData(hydrateOrderFromParsed(preset.data));
    if (preset.scopePhotos) {
      setData(p => ({ ...p, scopePhotos: preset.scopePhotos }));
    }
    setToast("Test preset loaded.");
  }, []);

  const deleteTestPreset = useCallback((id) => {
    setTestPresets(prev => prev.filter(p => p.id !== id));
    setToast("Test preset deleted.");
  }, []);

  const clearAllPresets = useCallback(() => {
    setTestPresets([]);
    setToast("All presets cleared.");
  }, []);
  const addEventNote = useCallback((text) => {
    const note = (text || "").trim();
    if (!note) return;
    const entry = { id: safeUid(), text: note, at: formatShortTimestamp(), user: data.currentUser || "Unknown" };
    setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])] }));
  }, [data.currentUser]);

  const downloadIcs = useCallback(() => downloadOrderIcs(data), [data]);

  // toggleMulti — imported from ./utils/strings
  const toggleHandling=(code)=> update("handlingCodes", toggleMulti(data.handlingCodes, code));

  // focusFirstFieldInSection, focusLastFieldInSection, scrollToSection, animateNavigationFocus
  // — all imported from ./utils/domNav

  const resetOpenSubSections = () => {
    setBillingSubOpen(false);
    setInsuranceSubOpen(false);
    setCompaniesSubOpen(false);
    setFinanceSubOpen(false);
    setOpenCodes(false);
  };

  const handleOpenSection = (key) => {
    resetOpenSubSections();
    setOpenSections(prev => {
      const nextOpen = !prev[key];
      if (nextOpen) {
        setVisitedSections(prevV => new Set([...prevV, key]));
        setActiveSection(key);
        setTimeout(() => scrollToSection(key), 100);
      }
      return { ...prev, [key]: nextOpen };
    });
  };

  const handleToggleSection = (key) => {
    resetOpenSubSections();
    setOpenSections(prev => {
        const isOpen = !prev[key];
        if(isOpen) {
            setVisitedSections(prevV => new Set([...prevV, key]));
            setActiveSection(key);
            setTimeout(() => scrollToSection(key), 100);
        }
        return {...prev, [key]: isOpen};
    });
  };

  const jumpToSection = (key, options = {}) => {
      const shouldScroll = options.scroll !== false;
      resetOpenSubSections();
      // Collapse other sections for a clean view
      setOpenSections(prev => ({
        sec1: key === "sec1",
        sec2: key === "sec2",
        sec3: key === "sec3",
        sec4: key === "sec4",
        sec5: key === "sec5"
      })); 
      setVisitedSections(prevV => new Set([...prevV, key]));
      setActiveSection(key);
      if (!shouldScroll) return;
      setTimeout(() => {
          const el = document.getElementById(key);
          if(el) {
              scrollToSection(key);
              animateNavigationFocus(el);
          }
      }, 100);
  };

  const goToNextSection = (currentKey) => {
    const idx = SECTION_ORDER.indexOf(currentKey);
    if (idx < 0) return null;
    const nextKey = idx === SECTION_ORDER.length - 1 ? SECTION_ORDER[0] : SECTION_ORDER[idx + 1];
    setOpenSections(prev => ({ ...prev, [currentKey]: false, [nextKey]: true }));
    setVisitedSections(prevV => new Set([...prevV, nextKey]));
    setActiveSection(nextKey);
    setTimeout(() => {
      const el = document.getElementById(nextKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('animate-purple-section-fade');
        void el.offsetWidth;
        el.classList.add('animate-purple-section-fade');
      }
      setTimeout(() => focusFirstFieldInSection(nextKey), 120);
    }, 100);
    return nextKey;
  };
  const goToPreviousSection = (currentKey) => {
    const idx = SECTION_ORDER.indexOf(currentKey);
    if (idx < 0) return null;
    const prevKey = idx === 0 ? SECTION_ORDER[SECTION_ORDER.length - 1] : SECTION_ORDER[idx - 1];
    setOpenSections(prev => ({ ...prev, [currentKey]: false, [prevKey]: true }));
    setVisitedSections(prevV => new Set([...prevV, prevKey]));
    setActiveSection(prevKey);
    setTimeout(() => {
      const el = document.getElementById(prevKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('animate-purple-section-fade');
        void el.offsetWidth;
        el.classList.add('animate-purple-section-fade');
      }
      setTimeout(() => focusLastFieldInSection(prevKey), 120);
    }, 100);
    return prevKey;
  };

  const handleNextSectionKeyDown = (e, currentKey) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      goToNextSection(currentKey);
      return;
    }
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      goToPreviousSection(currentKey);
    }
  };

  useEffect(() => {
    const focusableSelector = [
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(", ");

    const collectFocusable = (scope) => {
      if (!(scope instanceof HTMLElement)) return [];
      return Array.from(scope.querySelectorAll(focusableSelector)).filter((node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.closest("[aria-hidden='true']")) return false;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return node.getClientRects().length > 0;
      });
    };
    const resolveCurrentIndex = (scope, target, focusable) => {
      if (!(scope instanceof HTMLElement)) return -1;
      const candidates = [];
      if (target instanceof HTMLElement) {
        const nearest = target.closest(focusableSelector);
        if (nearest instanceof HTMLElement) candidates.push(nearest);
        candidates.push(target);
      }
      const active = document.activeElement;
      if (active instanceof HTMLElement && scope.contains(active)) {
        const nearestActive = active.closest(focusableSelector);
        if (nearestActive instanceof HTMLElement) candidates.push(nearestActive);
        candidates.push(active);
      }
      const seen = new Set();
      for (const node of candidates) {
        if (!(node instanceof HTMLElement)) continue;
        if (seen.has(node)) continue;
        seen.add(node);
        const idx = focusable.findIndex((el) => el === node || el.contains(node));
        if (idx >= 0) return idx;
      }
      return -1;
    };
    const isEnterAdvanceTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest("[data-enter-advance='off']")) return false;
      if (target.isContentEditable) return false;
      const tag = target.tagName;
      if (tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return false;
      if (tag === "INPUT") {
        const type = String(target.getAttribute("type") || "text").toLowerCase();
        if (["button", "submit", "reset", "file", "checkbox", "radio", "range"].includes(type)) return false;
      }
      return tag === "INPUT" || tag === "SELECT";
    };

    const handleKeyboardNavigation = (event) => {
      const isTab = event.key === "Tab";
      const isEnter = event.key === "Enter";
      if ((!isTab && !isEnter) || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.defaultPrevented && !isTab) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const modalScope = document.querySelector("[data-suggested-roles-modal='true']");
      const inModal = modalScope instanceof HTMLElement;
      const guidedKeyboardMode = entryMode === "detailed" || entryMode === "quick";
      if (!inModal && !guidedKeyboardMode) return;
      const scope = inModal
        ? modalScope
        : (appContentRef.current instanceof HTMLElement ? appContentRef.current : document.body);
      if (!(scope instanceof HTMLElement)) return;
      const activeEl = document.activeElement;
      const inScopeTarget = scope.contains(target);
      const inScopeActive = activeEl instanceof HTMLElement && scope.contains(activeEl);
      if (!inScopeTarget && !inScopeActive) return;
      if (isEnter && !isEnterAdvanceTarget(target)) return;

      const focusable = collectFocusable(scope);
      if (!focusable.length) return;
      const movingBackward = (isTab && event.shiftKey) || (isEnter && event.shiftKey);
      const origin = inScopeTarget ? target : activeEl;
      const currentIndex = resolveCurrentIndex(scope, origin, focusable);
      if (currentIndex < 0) {
        event.preventDefault();
        const fallback = movingBackward ? focusable[focusable.length - 1] : focusable[0];
        fallback?.focus();
        requestAnimationFrame(() => {
          fallback?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        });
        return;
      }
      const nextIndex = currentIndex + (movingBackward ? -1 : 1);
      if (nextIndex >= 0 && nextIndex < focusable.length) {
        event.preventDefault();
        const next = focusable[nextIndex];
        next.focus();
        requestAnimationFrame(() => {
          next.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        });
        return;
      }

      event.preventDefault();
      if (inModal) {
        const wrapIndex = movingBackward ? focusable.length - 1 : 0;
        focusable[wrapIndex]?.focus();
        return;
      }

      if (entryMode === "detailed") {
        const sectionEl = target.closest("[id^='sec']");
        const currentKey = sectionEl?.id || "sec1";
        if (movingBackward) {
          goToPreviousSection(currentKey);
          return;
        }
        goToNextSection(currentKey);
        return;
      }

      const wrapIndex = movingBackward ? focusable.length - 1 : 0;
      focusable[wrapIndex]?.focus();
    };

    document.addEventListener("keydown", handleKeyboardNavigation, true);
    return () => document.removeEventListener("keydown", handleKeyboardNavigation, true);
  }, [entryMode, goToNextSection, goToPreviousSection]);

  const toggleNonRestorationPrimary = () => {
    setData((prev) => ({
      ...prev,
      orderTypes: toggleNonRestorationPrimarySelection(prev.orderTypes || []),
    }));
  };

  const toggleRestorationType = (type) => {
    setData((prev) => ({
      ...prev,
      orderTypes: toggleRestorationTypeSelection(prev.orderTypes || [], type),
    }));
    if (!data.orderTypes.includes(type)) {
      setMinimizedLossTypes((p) => ({ ...p, [type]: false }));
    }
  };

  const selectNonRestorationSubtype = (subtype) => {
    setData((prev) => ({
      ...prev,
      orderTypes: selectNonRestorationSubtypeSelection(prev.orderTypes || [], subtype),
    }));
  };

  const toggleLossType = (type) => {
    if (!LOSS_TYPES.includes(type)) return;
    toggleRestorationType(type);
  };
  
  const toggleSeverity = (code) => {
    setData(prev => ({ ...prev, severityCodes: toggleSeverityCode(prev.severityCodes || [], code) }));
  };

  const updateLossDetail = (type, field, value) => {
    setData(prev => ({ ...prev, lossDetails: updateLossDetailField(prev.lossDetails, type, field, value) }));
    setLastLossDetailTouched({ type, ts: Date.now() });
  };

  const getLossSummary = (type) => getLossSummaryFor(data.lossDetails, type);

  const toggleMinimizeLoss = (type) => {
      setMinimizedLossTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // SMART_TRIGGER_LABELS, shouldRetainSharedLoadItem — imported from ./utils/loadTargets

  const openSmartConfirm = useCallback((config = {}) => {
    setSmartConfirm({
      isOpen: true,
      title: config.title || "Confirm Smart Update",
      message: config.message || "",
      details: Array.isArray(config.details) ? config.details : [],
      confirmLabel: config.confirmLabel || "Remove",
      cancelLabel: config.cancelLabel || "Keep",
      onConfirm: typeof config.onConfirm === "function" ? config.onConfirm : null,
      onCancel: typeof config.onCancel === "function" ? config.onCancel : null,
    });
  }, []);

  const resolveSmartConfirm = useCallback((accepted) => {
    setSmartConfirm(prev => {
      const action = accepted ? prev.onConfirm : prev.onCancel;
      if (typeof action === "function") {
        setTimeout(() => action(), 0);
      }
      return createSmartConfirmState();
    });
  }, []);

  const updateSmart = (k, v) => {
      const loadListAdded = [];
      const addHandling = [];
      const isOn = v === true || v === "Y";
      const isOff = v === false || v === "N" || v === "" || v === null;
      const currentLoadList = new Set(data.loadList || []);
      const currentHandling = new Set(data.handlingCodes || []);
      const currentOrderTypes = new Set(data.orderTypes || []);
      const pendingRemovals = { load: [], handling: [], orderTypes: [] };

      if (k === 'noHeat' && isOn && !currentLoadList.has('Heater')) loadListAdded.push('Heater');
      if ((k === 'noLights' && isOn) || (k === 'boardedUp' && isOn)) { if(!currentLoadList.has('Lights')) loadListAdded.push('Lights'); }
      if (k === 'damageWasWet' && isOn && !currentLoadList.has('Plastic Bags')) loadListAdded.push('Plastic Bags');
      if (k === 'damageMoldMildew' && isOn && !currentLoadList.has('Tyvek')) loadListAdded.push('Tyvek');

      if (k === "damageWasWet") {
        if (isOn) addHandling.push("Wet");
      }
      if (k === "damageMoldMildew") {
        if (isOn) addHandling.push("PPE");
      }

      if (isOff) {
        const candidates = {
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
        if (k === "damageMoldMildew" && currentOrderTypes.has("Mold")) {
          // If Mold remains selected, PPE is still auto-required elsewhere.
          candidates.handling = candidates.handling.filter(code => code !== "PPE");
        }

        const presentLoad = candidates.load.filter((item) => {
          if (!currentLoadList.has(item)) return false;
          if (shouldRetainSharedLoadItem(k, item, v, data)) return false;
          return true;
        });
        const presentHandling = candidates.handling.filter((code) => currentHandling.has(code));
        const presentOrderTypes = candidates.orderTypes.filter((type) => currentOrderTypes.has(type));
        pendingRemovals.load = presentLoad;
        pendingRemovals.handling = presentHandling;
        pendingRemovals.orderTypes = presentOrderTypes;
      }

      if (loadListAdded.length > 0) {
          const reasonMap = {
            damageWasWet: "Still Wet",
            damageMoldMildew: "Visible Mold",
            noHeat: "No Heat",
            noLights: "No Electricity",
            boardedUp: "Boarded Up"
          };
          const reason = reasonMap[k] || "condition selected";
          setSmartNotification({ message: `Bring: ${loadListAdded.join(', ')} added because ${reason}`, loadListToRemove: loadListAdded });
          setConditionAutoFillHints(prev => ({ ...prev, [k]: loadListAdded.join(', ') }));
          setTimeout(() => setConditionAutoFillHints(prev => { const next = { ...prev }; delete next[k]; return next; }), 4000);
      }
      
      setData(prev => {
          const newData = { ...prev, [k]: v };
          const newLoadList = new Set(prev.loadList || []);
          loadListAdded.forEach(i => newLoadList.add(i));
          newData.loadList = Array.from(newLoadList);
          if (k === "damageMoldMildew" && isOn && !(prev.orderTypes || []).includes("Mold")) {
            newData.orderTypes = [...(prev.orderTypes || []), "Mold"];
            newData.autoAddedOrderTypes = [...(prev.autoAddedOrderTypes || []), "Mold"];
          }
          if (addHandling.length) {
            const handling = new Set(prev.handlingCodes || []);
            addHandling.forEach(c => handling.add(c));
            newData.handlingCodes = Array.from(handling);
          }
          return newData;
      });

      const hasPendingRemovals =
        pendingRemovals.load.length ||
        pendingRemovals.handling.length ||
        pendingRemovals.orderTypes.length;

      if (isOff && hasPendingRemovals) {
        const label = SMART_TRIGGER_LABELS[k] || "this condition";
        const autoAdded = (data.autoAddedOrderTypes || []) as string[];

        // Auto-remove items that were auto-suggested (not user-selected)
        const autoRemoveTypes = pendingRemovals.orderTypes.filter(type => autoAdded.includes(type));
        const manualTypes = pendingRemovals.orderTypes.filter(type => !autoAdded.includes(type));

        // Silently remove auto-suggested order types
        if (autoRemoveTypes.length > 0) {
          setData(prev => ({
            ...prev,
            orderTypes: (prev.orderTypes || []).filter(type => !autoRemoveTypes.includes(type)),
            autoAddedOrderTypes: (prev.autoAddedOrderTypes || []).filter(t => !autoRemoveTypes.includes(t)),
          }));
        }

        // Build prompt only for remaining manual items
        const details = [];
        if (pendingRemovals.load.length) {
          details.push(`Bring Instructions: ${pendingRemovals.load.join(", ")}`);
        }
        if (pendingRemovals.handling.length) {
          details.push(`Handling Codes: ${pendingRemovals.handling.join(", ")}`);
        }
        if (manualTypes.length) {
          details.push(`Order Type: ${manualTypes.join(", ")}`);
        }

        if (details.length > 0) {
          openSmartConfirm({
            title: "Remove Smart-Triggered Fields?",
            message: `Since "${label}" is no longer selected, do you want to remove these linked fields?`,
            details,
            confirmLabel: "Yes, Remove",
            cancelLabel: "Keep Fields",
            onConfirm: () => {
              setData(prev => {
                const next = { ...prev };
                if (pendingRemovals.load.length) {
                  const list = new Set(prev.loadList || []);
                  pendingRemovals.load.forEach(item => list.delete(item));
                  next.loadList = Array.from(list);
                }
                if (pendingRemovals.handling.length) {
                  const handling = new Set(prev.handlingCodes || []);
                  pendingRemovals.handling.forEach(code => handling.delete(code));
                  next.handlingCodes = Array.from(handling);
                }
                if (manualTypes.length) {
                  next.orderTypes = (prev.orderTypes || []).filter(type => !manualTypes.includes(type));
                }
                return next;
              });
            }
          });
        }
      }
  };

  const prevPackoutSummaryRef = useRef(data.packoutSummary || []);

  const hasAddressType = useCallback((type) => {
    if (!type) return false;
    return (data.addresses || []).some(a => (a.type || "").trim().toLowerCase() === type.trim().toLowerCase());
  }, [data.addresses]);

  const ensureAddressType = (type, { placeholder = false } = {}) => {
    if (!type) return false;
    let created = false;
    setData(prev => {
      const exists = (prev.addresses || []).some(a => (a.type || "").toLowerCase() === type.toLowerCase());
      if (exists) return prev;
      created = true;
      return {
        ...prev,
        addresses: [
          ...(prev.addresses || []),
          initAddress({
            type,
            isPrimary: false,
            isLossSite: false,
            street: placeholder ? "TBD" : "",
            placeholder: placeholder ? createPlaceholderFlag("address", `${type} placeholder`) : null
          })
        ]
      };
    });
    return created;
  };

  const promptForLivingAddress = useCallback((type) => {
    if (!type || !LIVING_STATUS_ADDRESS_TYPES.includes(type)) return;
    if (hasAddressType(type)) return;
    setLivingAddressPrompt({ open: true, type });
  }, [hasAddressType]);

  const addLivingAddressFromPrompt = useCallback((mode) => {
    const type = livingAddressPrompt.type;
    if (!type) return;
    const added = ensureAddressType(type, { placeholder: true });
    setLivingAddressPrompt({ open: false, type: "" });
    if (!added) {
      setToast(`${type} address already exists.`);
      return;
    }
    if (mode === "placeholder") {
      // Stay where we are — just add quietly
      setToast(`${type} placeholder added — you can enter the address later.`);
      return;
    }
    // "full" mode — navigate to sec3, open the card, focus search
    setOpenSections(prev => ({ ...prev, sec3: true }));
    setVisitedSections(prevV => new Set([...prevV, "sec3"]));
    setActiveSection("sec3");
    setTimeout(() => {
      const newAddr = (data.addresses || []).find(a => a.type === type && !a.street);
      if (newAddr) updateAddr(newAddr.id, { _forceOpen: true });
      setTimeout(() => {
        const el = document.querySelector(`[data-address-item-id="${newAddr?.id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.remove("audit-pulse");
          void el.offsetWidth;
          el.classList.add("audit-pulse");
        }
      }, 200);
    }, 150);
    setToast(`${type} address added — enter the address or use Google search above.`);
  }, [livingAddressPrompt.type]);

  const closeLivingAddressPrompt = useCallback(() => {
    setLivingAddressPrompt({ open: false, type: "" });
  }, []);

  // ORDER_ADDRESS_TYPES — imported from ./config
  // formatOrderAddressLine, formatOrderAddressChoiceLabel, buildOrderAddressChoices — imported from ./utils/order
  const orderAddressChoices = useMemo(
    () => buildOrderAddressChoices(data.addresses || [], ORDER_ADDRESS_TYPES, LIVING_STATUS_ADDRESS_TYPES),
    [data.addresses],
  );
  const addressPayloadFromChoice = useCallback((choiceValue: string) => {
    if (!choiceValue) return { addressType: "", address: "", addressId: "" };
    if (choiceValue.startsWith("addr:")) {
      const addressId = choiceValue.slice(5);
      const addr = (data.addresses || []).find((a: any) => a.id === addressId);
      if (!addr) return { addressType: "", address: "", addressId: "" };
      const type = addr.type || "Address";
      return { addressType: type, address: formatOrderAddressLine(addr) || `${type} address TBD`, addressId };
    }
    if (choiceValue.startsWith("type:")) {
      const type = choiceValue.slice(5);
      const existing = (data.addresses || []).find((a: any) => (a.type || "").toLowerCase() === type.toLowerCase() && !a.inactive);
      if (!existing) ensureAddressType(type, { placeholder: true });
      return {
        addressType: type,
        address: existing ? (formatOrderAddressLine(existing) || `${type} address TBD`) : `${type} address TBD`,
        addressId: existing?.id || "",
      };
    }
    return { addressType: "", address: choiceValue, addressId: "" };
  }, [data.addresses, ensureAddressType, formatOrderAddressLine]);
  const addressChoiceValue = useCallback((record: any = {}) => {
    if (record.addressId) return `addr:${record.addressId}`;
    if (record.addressType) return `type:${record.addressType}`;
    if (record.location && ORDER_ADDRESS_TYPES.some(type => type.toLowerCase() === String(record.location).toLowerCase())) return `type:${record.location}`;
    if (record.address) {
      const match = (data.addresses || []).find((addr: any) => formatOrderAddressLine(addr) === record.address);
      if (match) return `addr:${match.id}`;
    }
    return "";
  }, [data.addresses, formatOrderAddressLine]);

  const updateLivingStatus = (value) => {
    update("livingStatus", value);
    if (!value) {
      closeLivingAddressPrompt();
      return;
    }
    promptForLivingAddress(value);
  };

  const updateLossSeverity = useCallback((next) => {
    update("lossSeverity", { ...next, touched: true });
  }, [update]);

  useEffect(() => {
    if (data.orderNameLocked) return;
    if (!data.orderNameAuto) return;
    const primaryCustomer = (data.customers || []).find(c => c.isPrimary) || {};
    const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || {};
    const last = (primaryCustomer.last || "").trim();
    const city = (primaryAddr.city || "").trim();
    const state = (primaryAddr.state || "").trim();
    if (!last && !city && !state) return;
    const town = [city, state].filter(Boolean).join("");
    const nextName = [last || "Order", town].filter(Boolean).join("-").replace(/\s+/g, "");
    if (nextName && nextName !== data.orderName) {
      update("orderName", nextName);
    }
  }, [data.orderNameLocked, data.orderNameAuto, data.customers, data.addresses, data.orderName, update]);

  const groupLinks = data.groupAddressLinks || {};
  const [groupLinkModal, setGroupLinkModal] = useState({ open: false, group: "" });
  const [groupLinkAddressMode, setGroupLinkAddressMode] = useState("select");
  const [groupLinkAddressDraft, setGroupLinkAddressDraft] = useState({
    type: "",
    street: "",
    city: "",
    state: "",
    zip: ""
  });
  const openGroupLinkModal = (group) => {
    setGroupLinkAddressMode("select");
    setGroupLinkAddressDraft({ type: "", street: "", city: "", state: "", zip: "" });
    setGroupLinkModal({ open: true, group });
  };
  const closeGroupLinkModal = () => {
    setGroupLinkModal({ open: false, group: "" });
    setGroupLinkAddressMode("select");
    setGroupLinkAddressDraft({ type: "", street: "", city: "", state: "", zip: "" });
  };
  const getGroupLink = (group) => groupLinks[group] || { addressId: "", date: "" };
  const setGroupLink = (group, patch) => {
    const current = getGroupLink(group);
    update("groupAddressLinks", { ...groupLinks, [group]: { ...current, ...patch } });
  };
  const clearGroupLink = (group) => {
    const next = { ...groupLinks };
    delete next[group];
    update("groupAddressLinks", next);
  };
  const addPlaceholderAddressToGroup = () => {
    const group = groupLinkModal.group;
    if (!group) return;
    const typeLabel = (groupLinkAddressDraft.type || "").trim() || `${group} Placeholder`;
    const newAddress = initAddress({
      type: typeLabel,
      isPrimary: false,
      isLossSite: false,
      street: "TBD",
      placeholder: createPlaceholderFlag("address", `${group} placeholder`)
    });
    setData(prev => {
      const links = { ...(prev.groupAddressLinks || {}) };
      const current = links[group] || {};
      links[group] = { ...current, addressId: newAddress.id };
      return {
        ...prev,
        addresses: [...(prev.addresses || []), newAddress],
        groupAddressLinks: links
      };
    });
    setToast("Placeholder address added and linked.");
    setGroupLinkAddressMode("select");
    setGroupLinkAddressDraft({ type: "", street: "", city: "", state: "", zip: "" });
  };
  const addFullAddressToGroup = () => {
    const group = groupLinkModal.group;
    if (!group) return;
    const hasAddressData = [groupLinkAddressDraft.street, groupLinkAddressDraft.city, groupLinkAddressDraft.state, groupLinkAddressDraft.zip]
      .some(v => (v || "").trim());
    if (!hasAddressData) {
      setToast("Enter at least one address field.");
      return;
    }
    const typeLabel = (groupLinkAddressDraft.type || "").trim() || `${group} Address`;
    const newAddress = initAddress({
      type: typeLabel,
      street: (groupLinkAddressDraft.street || "").trim(),
      city: (groupLinkAddressDraft.city || "").trim(),
      state: (groupLinkAddressDraft.state || "").trim(),
      zip: (groupLinkAddressDraft.zip || "").trim(),
      isPrimary: false,
      isLossSite: false,
      placeholder: null
    });
    setData(prev => {
      const links = { ...(prev.groupAddressLinks || {}) };
      const current = links[group] || {};
      links[group] = { ...current, addressId: newAddress.id };
      return {
        ...prev,
        addresses: [...(prev.addresses || []), newAddress],
        groupAddressLinks: links
      };
    });
    setToast("Address added and linked.");
    setGroupLinkAddressMode("select");
    setGroupLinkAddressDraft({ type: "", street: "", city: "", state: "", zip: "" });
  };

  useEffect(() => {
    const selected = data.packoutSummary || [];
    const previous = prevPackoutSummaryRef.current || [];
    const current = new Set(data.loadList || []);
    const added = [];
    selected.forEach(item => {
      (PACKOUT_LOAD_MAP[item] || []).forEach(loadItem => {
        if (!current.has(loadItem)) {
          current.add(loadItem);
          added.push(loadItem);
        }
      });
    });
    const removedSelections = previous.filter(item => !selected.includes(item));
    const removeCandidates = [];
    removedSelections.forEach(item => {
      (PACKOUT_LOAD_MAP[item] || []).forEach(loadItem => {
        const stillRequired = selected.some(sel => (PACKOUT_LOAD_MAP[sel] || []).includes(loadItem));
        if (!stillRequired && current.has(loadItem) && !removeCandidates.includes(loadItem)) {
          removeCandidates.push(loadItem);
        }
      });
    });
    if (added.length) {
      setData(prev => {
        const next = new Set(prev.loadList || []);
        added.forEach(i => next.add(i));
        return { ...prev, loadList: Array.from(next) };
      });
      setSmartNotification({
        message: `Bring: ${added.join(", ")} added because Packout Summary`,
        loadListToRemove: added
      });
    }
    if (removeCandidates.length) {
      const removedLabel = removedSelections.join(", ");
      openSmartConfirm({
        title: "Remove Packout Bring Items?",
        message: `Since ${removedLabel} ${removedSelections.length > 1 ? "were" : "was"} unselected, do you want to remove these Bring items?`,
        details: [`Bring Instructions: ${removeCandidates.join(", ")}`],
        confirmLabel: "Yes, Remove",
        cancelLabel: "Keep Items",
        onConfirm: () => {
          setData(prev => {
            const next = new Set(prev.loadList || []);
            removeCandidates.forEach(i => next.delete(i));
            return { ...prev, loadList: Array.from(next) };
          });
        }
      });
    }
    prevPackoutSummaryRef.current = selected;
  }, [data.packoutSummary, data.loadList, openSmartConfirm]);

  const updateHowDry = (v) => {
      const addCodes = [];
      const removeCodes = [];
      if (v === "Air-Dry") { addCodes.push("NoDry"); removeCodes.push("Low"); }
      if (v === "Low Heat") { addCodes.push("Low"); removeCodes.push("NoDry"); }
      if (v === "Dryer") { removeCodes.push("NoDry", "Low"); }

      const currentHandling = new Set(data.handlingCodes || []);
      const removableNow = removeCodes.filter(c => currentHandling.has(c));

      if (addCodes.length) {
          setSmartNotification({ message: `Smart Update: Added ${addCodes.join(", ")} handling code${addCodes.length > 1 ? "s" : ""}` });
      }

      setData(prev => {
          const current = new Set(prev.handlingCodes || []);
          addCodes.forEach(c => current.add(c));
          return { ...prev, howDryLaundry: v, handlingCodes: Array.from(current) };
      });

      if (removableNow.length) {
        openSmartConfirm({
          title: "Remove Linked Handling Codes?",
          message: `Since dry method changed to "${v}", do you want to remove these handling codes?`,
          details: [`Handling Codes: ${removableNow.join(", ")}`],
          confirmLabel: "Yes, Remove",
          cancelLabel: "Keep Codes",
          onConfirm: () => {
            setData(prev => {
              const current = new Set(prev.handlingCodes || []);
              removableNow.forEach(c => current.delete(c));
              return { ...prev, handlingCodes: Array.from(current) };
            });
          }
        });
      }
  };

  // Auto-suggest DET handling code when allergy-related considerations are selected
  useEffect(() => {
    const considerations = data.sdsConsiderations || [];
    const needsDet = considerations.some(c => ["Skin Sensitivity", "Respiratory Concerns", "Pregnancy"].includes(c));
    const hasDet = (data.handlingCodes || []).includes("Det");
    if (needsDet && !hasDet) {
      setData(prev => ({ ...prev, handlingCodes: [...(prev.handlingCodes || []), "Det"] }));
      setSmartNotification({ message: "Smart Update: Added Det (special detergent) handling code based on customer sensitivity." });
    }
  }, [data.sdsConsiderations]);

  const rejectSmartAction = () => {
      if (smartNotification) {
          setData(prev => ({
              ...prev, 
              loadList: prev.loadList.filter(c => !(smartNotification.loadListToRemove || []).includes(c))
          }));
          setSmartNotification(null);
      }
  };
  
  const handleSearchHit = (type) => {
      if(LOSS_TYPES.includes(type)) {
          if(!data.orderTypes.includes(type)) {
              toggleLossType(type);
          }
          setMinimizedLossTypes(p => ({...p, [type]: false}));
      }
      if (type === "Sales Rep") {
          setOpenSections(p => ({...p, sec1:true}));
          setSourceSubOpen(true);
      }
      if(type === 'Order Codes' || ['handling', 'severity', 'quality'].some(k => type.toLowerCase().includes(k))) {
          setOpenCodes(true);
      }
  };

  // SUBSECTION_TO_SECTION, DEFAULT_SUBSECTION_BY_SECTION, SUBSECTION_DOM_ID — imported from ./utils/sectionNav

  const closeSubsectionsForSection = useCallback((sectionId) => {
    if (sectionId === "sec1") {
      setOrderSubOpen(false);
      setSourceSubOpen(false);
      setInterviewSubOpen(false);
      setCodesSubOpen(false);
      setOpenCodes(false);
      return;
    }
    if (sectionId === "sec4") {
      setCompaniesSubOpen(false);
      setBillingSubOpen(false);
      setFinanceSubOpen(false);
      setInsuranceSubOpen(false);
      return;
    }
    if (sectionId === "sec5") {
      setScheduleSubOpen(false);
      setScheduleBridgeOpen(false);
    }
  }, []);

  const openSearchSubsection = useCallback((key, sectionId) => {
    const resolvedSection = sectionId || SUBSECTION_TO_SECTION[key];
    if (!resolvedSection) return;
    const resolvedKey = key || DEFAULT_SUBSECTION_BY_SECTION[resolvedSection];
    closeSubsectionsForSection(resolvedSection);

    if (resolvedSection === "sec1") {
      if (resolvedKey === "source") setSourceSubOpen(true);
      else if (resolvedKey === "interview") setInterviewSubOpen(true);
      else if (resolvedKey === "codes") {
        setCodesSubOpen(true);
        setOpenCodes(true);
      } else {
        setOrderSubOpen(true);
      }
      return;
    }

    if (resolvedSection === "sec4") {
      if (resolvedKey === "billing") setBillingSubOpen(true);
      else if (resolvedKey === "finance") setFinanceSubOpen(true);
      else if (resolvedKey === "insurance") {
        setInsuranceSubOpen(true);
        if (data.insuranceClaim !== "Yes") update("insuranceClaim", "Yes");
      }
      else setCompaniesSubOpen(true);
      return;
    }

    if (resolvedSection === "sec5") {
      if (resolvedKey === "bridge" || resolvedKey === "sds-icons") {
        setScheduleBridgeOpen(true);
      } else {
        setScheduleSubOpen(true);
      }
    }
  }, [closeSubsectionsForSection]);

  const scrollToSubsection = useCallback((key, sectionId) => {
    const resolvedSection = sectionId || SUBSECTION_TO_SECTION[key];
    const resolvedKey = key || DEFAULT_SUBSECTION_BY_SECTION[resolvedSection];
    const targetId = SUBSECTION_DOM_ID[resolvedKey] || resolvedSection;
    const scrollWithRetry = (triesRemaining = 10) => {
      const el = targetId ? document.getElementById(targetId) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        animateNavigationFocus(el);
        return;
      }
      if (triesRemaining <= 0) {
        if (resolvedSection) scrollToSection(resolvedSection);
        return;
      }
      requestAnimationFrame(() => scrollWithRetry(triesRemaining - 1));
    };
    scrollWithRetry();
  }, []);

  const jumpToSectionAndSubsection = useCallback((sectionId, subId) => {
    jumpToSection(sectionId, { scroll: false });
    openSearchSubsection(subId, sectionId);
    requestAnimationFrame(() => {
      scrollToSubsection(subId, sectionId);
    });
  }, [jumpToSection, openSearchSubsection, scrollToSubsection]);

  // focusSearchLabel — imported from ./utils/domNav

  const handleSearchNavigate = (item) => {
    if (!item) return;
    // In Quick Entry, scroll to the matching quick section
    if (entryMode === "quick") {
      const quickMap = {
        sec1: "quick-questions",
        sec2: "quick-customer",
        sec3: "quick-address",
        sec5: "quick-scheduling",
      };
      // Also check if the search label matches Quick Entry sections
      const labelLower = (item.label || "").toLowerCase();
      if (labelLower.includes("note") || labelLower.includes("instruction") || labelLower.includes("event")) {
        document.getElementById("quick-scheduling")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const quickId = item.navAction ? null : quickMap[item.id];
      if (quickId) {
        document.getElementById(quickId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Field not in Quick Entry — switch to detailed
        setEntryMode("detailed");
        setTimeout(() => {
          if (item.id) jumpToSection(item.id, { scroll: !item.sub });
          if (item.navAction === 'openPets') {
            setTimeout(() => {
              const el = document.getElementById("household-pets");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.remove("audit-pulse");
                void el.offsetWidth;
                el.classList.add("audit-pulse");
              }
            }, 200);
          } else {
            setTimeout(() => {
              if (item.sub) {
                openSearchSubsection(item.sub, item.id);
                requestAnimationFrame(() => scrollToSubsection(item.sub, item.id));
              }
            }, 80);
          }
        }, 100);
      }
      return;
    }
    if (item.id) jumpToSection(item.id, { scroll: false });
    setTimeout(() => {
      if (item.sub) {
        openSearchSubsection(item.sub, item.id);
      }
    }, 80);
    if (item.navAction === 'openInterview') {
      setInterviewPanelOpen(true);
      // Scroll to top of interview panel after opening
      setTimeout(() => { const panel = document.querySelector("[data-interview-panel]"); if (panel) panel.scrollTop = 0; }, 200);
      return;
    } else if (item.navAction === 'scrollContactLog') {
      setTimeout(() => {
        const el = document.getElementById("contact-log-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.remove("audit-pulse");
          void el.offsetWidth;
          el.classList.add("audit-pulse");
        }
      }, 400);
      return;
    } else if (item.navAction === 'openPets') {
      setTimeout(() => {
        const el = document.getElementById("household-pets");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.remove("audit-pulse");
          void el.offsetWidth;
          el.classList.add("audit-pulse");
        }
      }, 400);
    } else {
      setTimeout(() => {
        if (item.label) focusSearchLabel(item.label, 10);
      }, 400);
    }
  };

  const handleConfirmClick = () => {
      const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || {};
      const addressLine = [primaryAddr.street, primaryAddr.city, primaryAddr.state, primaryAddr.zip].filter(Boolean).join(", ");
      setConfirmDetails({
          type: data.scheduleType,
          date: data.pickupDate,
          time: data.pickupTime,
          tech: data.assignedTech,
          address: addressLine,
      });
      setConfirmTentativeOk(false);
      setConfirmMissingOk(false);
      setConfirmContextOpen(false);
  };

  const openReminderModal = useCallback(() => {
    setReminderDraft({
      date: data.reminderDate || data.pickupDate || "",
      time: data.reminderTime || data.pickupTime || ""
    });
    setReminderModalOpen(true);
  }, [data.reminderDate, data.reminderTime, data.pickupDate, data.pickupTime]);

  const setNowDate = useCallback(() => {
    update("pickupDate", getNowDateIso());
    setDateCloseTick(t => t + 1);
  }, [update]);

  const setNowTime = useCallback(() => {
    update("pickupTime", getNextHalfHourLabel());
    setTimeCloseTick(t => t + 1);
  }, [update]);

  const handleSendWelcome = (customerId, options = {}) => {
    const selectedSpecialDocs = normalizeStringList(options.selectedSpecialDocs || []);
    setWelcomeModal({ isOpen: true, customerId, note: "", selectedSpecialDocs });
    setShowWelcomeQuickNotes(false);
  };

  const crmScrollRef = useRef(0);
  const openCrmModal = () => {
    // Save scroll position to restore after close
    const scroller = document.querySelector("[data-noe-scroll]") as HTMLElement;
    if (scroller) crmScrollRef.current = scroller.scrollTop;
    const defaultMethod = data.contactMethod || "Call";
    const owner = data.salesRep || "Sales Rep";
    const subject = `New ${data.isLead === false ? "Order" : "Lead"}`;
    setCrmModal({
      isOpen: true,
      method: defaultMethod,
      owner,
      subject,
      orderLink: "",
      notes: "",
      followUpEnabled: false,
      followUpDate: "",
      followUpTime: "",
      notifySalesRep: !!data.salesRep,
      notifyOrderLead: !!data.eventAssignee,
      notifyOthers: ""
    });
  };
  
  const addNewAddress = useCallback(() => {
    const addressId = safeUid();
    setData(p => {
        // Remove any existing empty addresses (except primary)
        const cleaned = p.addresses.filter((a, i) => i === 0 || hasMeaningfulValue(a.street) || hasMeaningfulValue(a.city));
        const hasPrimary = cleaned.some(a => a.isPrimary);
        return {
          ...p,
          addresses: [
            ...cleaned,
            initAddress({
              id: addressId,
              isPrimary: !hasPrimary,
              isLossSite: false,
              type: "",
              placeholder: createPlaceholderFlag("address", "Address type needed")
            })
          ]
        };
    });
    setPendingAddressTypePromptId(addressId);
    setToast("Address placeholder added. Select a Type now, or leave it for later.");
  }, [setToast]);
  
  const addNewCustomer = useCallback(() => {
    // Remove any existing empty customers first
    setData(p => {
      const cleaned = p.customers.filter((c, i) => i === 0 || hasMeaningfulValue(c.first) || hasMeaningfulValue(c.last) || hasMeaningfulValue(c.phone) || hasMeaningfulValue(c.email));
      return {
        ...p,
        customers: [
          ...cleaned,
          initCustomer({
            type: "",
            policyHolder: false,
            isPrimary: false,
            placeholder: createPlaceholderFlag("customer", "Customer details needed")
          })
        ]
      };
    });
  }, []);

  const handleAddressTypePromptFocused = useCallback((addressId) => {
    setPendingAddressTypePromptId(prev => (prev === addressId ? "" : prev));
  }, []);

  useEffect(() => {
    const insuranceRelated = data.involvesInsurance === "Yes" && hasRestorationOrderType(data.orderTypes || []);
    if (!insuranceRelated) {
      setData(prev => ({
        ...prev,
        customers: (prev.customers || []).map((c, idx) => idx === 0 ? { ...c, policyHolder: false, type: c.type === "Policyholder" ? "" : c.type } : c)
      }));
      return;
    }
    setData(prev => {
      const customers = prev.customers || [];
      if (!customers.length) return prev;
      const first = customers[0];
      if (first.policyHolder && first.type === "Policyholder") return prev;
      const updated = customers.map((c, idx) => idx === 0 ? { ...c, policyHolder: true, type: "Policyholder" } : c);
      return { ...prev, customers: updated };
    });
  }, [data.involvesInsurance, data.orderTypes]);

  useEffect(() => {
    const lossSeverity = data.lossSeverity || initLossSeverity();
    if (lossSeverity.touched) return;
    const hasFire = (data.orderTypes || []).includes("Fire");
    const hasWater = (data.orderTypes || []).includes("Water");
    const next = {
      ...lossSeverity,
      fire: { ...lossSeverity.fire, enabled: hasFire },
      water: { ...lossSeverity.water, enabled: hasWater }
    };
    if (next.fire.enabled !== lossSeverity.fire.enabled || next.water.enabled !== lossSeverity.water.enabled) {
      update("lossSeverity", next);
    }
  }, [data.orderTypes, data.lossSeverity]);

  const addHouseholdMember = useCallback((name) => {
    setData(p => ({ ...p, peopleQuick: [...(p.peopleQuick || []), { first: name }] }));
    setToast(`Added household member: ${name}`);
  }, []);

  const addPlanStep = useCallback(() => {
    const text = newPlanStep.trim();
    if (!text) return;
    setData(p => ({ ...p, planSteps: [...(p.planSteps || []), { id: safeUid(), text, done: false, assignee: planAssignee || p.currentUser || "" }] }));
    setNewPlanStep("");
  }, [newPlanStep, planAssignee]);

  const togglePlanStep = useCallback((id) => {
    setData(p => ({ 
      ...p, 
      planSteps: (p.planSteps || []).map(s => {
        if (s.id !== id) return s;
        const nextDone = !s.done;
        return {
          ...s,
          done: nextDone,
          doneAt: nextDone ? new Date().toISOString() : "",
          doneBy: nextDone ? (p.currentUser || s.assignee || "Unknown") : ""
        };
      }) 
    }));
  }, []);

  const removePlanStep = useCallback((id) => {
    setData(p => ({ ...p, planSteps: (p.planSteps || []).filter(s => s.id !== id) }));
  }, []);

  const focusAuditItem = useCallback((item) => {
    setAuditOn(true);
    setOpenSections(p => ({ ...p, [item.section]: true }));
    if (item.section === "sec1") {
      setOrderSubOpen(true);
      setSourceSubOpen(true);
      if (item.key === "interview") setInterviewSubOpen(true);
      if (item.key === "codes") setCodesSubOpen(true);
    }
    if (item.section === "sec4") {
      if ((item.key || "").startsWith("placeholder-company-") || (item.key || "").startsWith("placeholder-contact-")) {
        setCompaniesSubOpen(true);
      } else {
        setBillingSubOpen(true);
        setInsuranceSubOpen(true);
        if (data.insuranceClaim !== "Yes") update("insuranceClaim", "Yes");
      }
    }
    if (item.key === "addrLat" || item.key === "addrLng") {
      setShowPrimaryCoords(true);
    }
    setData(p => ({ ...p, highlightMissing: { ...(p.highlightMissing || {}), [item.key]: true } }));
    setTimeout(() => {
      const sectionEl = document.getElementById(item.section);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-audit-key="${item.key}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("audit-pulse");
          setTimeout(() => el.classList.remove("audit-pulse"), 2400);
          if (el.focus) el.focus();
        }
      });
    }, 420);
  }, []);

  useEffect(() => {
    if (!planModalOpen) return;
    if (!planReorderDirty) setPlanDraftSteps(data.planSteps || []);
  }, [planModalOpen, data.planSteps, planReorderDirty]);

  const handleReset = useCallback(() => {
    localStorage.removeItem("same-day-scope-v52");
    const user = data.currentUser || "";
    setData({ ...DEFAULT_FORM, isLead: null, currentUser: user, eventAssignee: user, vendors: [], referrer: "", referringCompany: "", salesRep: "", leadSourceCategory: "", leadSourceDetail: "", contactMethod: "", insuranceCompany: "", insuranceAdjuster: "", billingCompany: "", billingContact: "" });
    setOpenSections({sec1:true, sec2:false, sec3:false, sec4:false, sec5:false});
    setVisitedSections(new Set(['sec1']));
    setQuickQuestionsCollapsed(false);
    setShowPrimaryCoords(false);
    setOrderSubOpen(true);
    setSourceSubOpen(false);
    setInterviewSubOpen(false);
    setCodesSubOpen(false);
    setBillingSubOpen(false);
    setCompaniesSubOpen(false);
    setInsuranceSubOpen(false);
    setFinanceSubOpen(false);
    setScheduleBridgeOpen(false);
    setOrderInstructionModal({
      isOpen: false,
      mode: "add",
      draft: createOrderInstructionDraft(),
    });
    setToast("Reset complete");
  }, [entryMode]);

  const verifyAddressDemo = useCallback((id) => {
    const demoLat = "40.8874";
    const demoLng = "-74.0291";
    updateAddr(id, { lat: demoLat, lng: demoLng });
    setToast("Address verified (demo).");
  }, [updateAddr]);
  
  const removeCust = useCallback((id, index) => {
    if(index===0) { setToast("Cannot delete primary customer."); return; }
    setData(p=>({...p,customers:p.customers.filter(x=>x.id!==id)}));
  }, []);
  const removeAddr = useCallback((id) => {
    setData(p=>({...p,addresses:p.addresses.filter(a=>a.id!==id)}));
  }, []);

  const buildSaveSummary = () => {
    const lines = [];
    const push = (label, value) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value) && value.length === 0) return;
      lines.push(`${label}: ${Array.isArray(value) ? value.join(", ") : value}`);
    };
    push("Record Type", data.isLead === true ? "Lead" : data.isLead === false ? "Order" : "");
    push("Order Status", data.orderStatus);
    push("Project Type", projectTypeFromOrderTypes(data.orderTypes || []));
    push("Order Name", data.orderName);
    push("Order Type", data.orderTypes);
    push("Service Offerings", data.serviceOfferings);
    if (data.leadSourceCategory) {
      push("Lead Source", data.leadSourceCategory);
      push("Lead Source Detail", data.leadSourceDetail);
      push("Referring Company", data.referringCompany);
      push("Referrer", data.referrer);
    }
    if ((data.customers || []).length) {
      (data.customers || []).forEach((c, idx) => {
        const name = [c.first, c.last].filter(Boolean).join(" ").trim();
        if (name) push(`Customer ${idx + 1}`, name);
        if (c.phone) push(`Customer ${idx + 1} Phone`, c.phone);
        if (c.email) push(`Customer ${idx + 1} Email`, c.email);
      });
    }
    if ((data.addresses || []).length) {
      (data.addresses || []).forEach((a, idx) => {
        const addr = [a.street, a.city, a.state, a.zip].filter(Boolean).join(", ");
        if (addr) push(`Address ${idx + 1}`, addr);
      });
    }
    push("Bill To", data.billingPayer);
    push("Billing Company", data.billingCompany);
    push("Billing Contact", data.billingContact);
    push("Order Instructions", normalizeInstructionEntries(data.orderInstructions || []).map((entry) => `${entry.type}: ${entry.text}`).join(" | "));
    push("Insurance Claim", data.insuranceClaim);
    push("Insurance Company", data.insuranceCompany);
    push("National Carrier", data.nationalCarrier);
    push("Adjuster", data.insuranceAdjuster);
    push("Claim #", data.claimNumber);
    push("Policy #", data.policyNumber);
    push("Work Order #", data.workOrderNumber);
    push("Order Specific Email", data.insuranceOrderEmail);
    push("Contents Limit", data.contentsCoverageLimit);
    push("Mold Limit", data.moldLimit);
    push("Schedule Type", data.scheduleType);
    push("Schedule Date", data.pickupDate);
    push("Schedule Time", data.pickupTime);
    return lines;
  };

  // copyLines — thin wrapper around copyLinesToClipboard that also toasts on success.
  const copyLines = async (lines: string[]) => {
    if (await copyLinesToClipboard(lines)) setToast("Copied to clipboard");
  };
  // buildFullExportLines, downloadLinesAsFile — imported from ./utils/dataExport

  const validateGenerateScope = () => {
    const missing = {};
    if(!hasPrimaryOrderTypeDecision(data.orderTypes || [])) missing.orderTypes=true;
    if(!hasRequiredNonRestorationSubtype(data.orderTypes || [])) missing.nonRestorationSubtype=true;
    setData(p=>({...p,highlightMissing:missing}));
    if(Object.keys(missing).length){
      setOpenSections(p => ({...p, sec1:true}));
      setToast("Please complete required fields.");
      return false;
    }
    setToast("Order Complete! Submitting...");
    return true;
  };

  const handleSaveClick = () => {
    const missing = computeAuditMissing();
    setSaveSummaryMissing(missing);
    setSaveSummaryLines(orderNarrative.map(l => `${l.section}: ${l.text}`));
    setSaveExportLines(buildFullExportLines(data));
    setPreviewOpen(true);
  };

  const computeAuditMissing = () => computeAuditMissingFor(data, fieldConfig, ORDER_STATUSES, SEVERITY_GROUPS);

  const computeAuditRequiredCount = () => {
    let total = 0;
    const primaryCustomer = (data.customers || [])[0] || {};
    const primaryAddress = (data.addresses || [])[0] || {};
    total += 1; // orderName
    total += 1; // orderTypes
    if (isNonRestorationSelected(data.orderTypes || [])) total += 1; // nonRestorationSubtype
    total += 1; // lead source category
    if (data.leadSourceCategory === "Referral") total += 2;
    if (data.leadSourceCategory === "Marketing" || data.leadSourceCategory === "Internal") total += 1;
    total += 1; // billingPayer
    total += 4; // customer fields
    total += 6; // address fields
    if ((data.orderTypes || []).includes("Mold")) total += 1;
    if (data.rentOrOwn === "Rent") total += 1;
    const needsPickupAudit = ["Pickup Complete","Ready to Bill"].includes(data.orderStatus);
    const needsFinanceAudit = ["Intake Complete","Ready to Bill"].includes(data.orderStatus);
    if (needsPickupAudit) {
      const severityGroupsNeeded = (data.orderTypes || []).reduce((acc, t) => {
        const group = t === "Dust/Debris" ? "Dust" : t;
        if (SEVERITY_GROUPS.includes(group)) acc.add(group);
        return acc;
      }, new Set());
      total += severityGroupsNeeded.size;
      total += 2; // interview + codes sections
    }
    if (needsFinanceAudit) {
      total += 4; // pricePlatform, priceList, multiplier, estimateRequested
    }
    total += (data.addresses || []).filter(addr => isAddressPlaceholder(addr)).length;
    total += (data.customers || []).filter((customer) => isPlaceholderFlagActive(customer?.placeholder)).length;
    total += Object.entries(data.additionalCompanies || {}).reduce((acc, [type, rawEntry]) => {
      const entry = syncCompanyEntryPlaceholders(rawEntry || {});
      let count = acc;
      const companyPending = isCompanyPlaceholder(entry);
      if (companyPending) count += 1;
      if (!companyPending && companyTypeRequiresContact(type) && isContactPlaceholder(entry)) count += 1;
      return count;
    }, 0);
    return total;
  };

  const getCompanyProfile = useCallback(
    (companyName = "") => resolveCompanyProfile(companyName, sampleContacts),
    [sampleContacts]
  );
  const getContactProfile = useCallback(
    (contactName = "") => resolveContactProfile(contactName, sampleContacts),
    [sampleContacts]
  );

  const orderCompanyNames = useMemo(() => getOrderCompanyNames(data), [
    data.referringCompany,
    data.billingCompany,
    data.insuranceCompany,
    data.publicAdjustingCompany,
    data.independentAdjustingCo,
    data.tpaCompany,
    data.additionalCompanies,
  ]);

  const orderContactNames = useMemo(() => getOrderContactNames(data), [
    data.referrer,
    data.billingContact,
    data.insuranceAdjuster,
    data.publicAdjuster,
    data.independentAdjuster,
    data.tpaContact,
    data.additionalCompanies,
  ]);

  const currentOrderSpecialDocs = useMemo(() => {
    return mergeUniqueStrings(
      orderCompanyNames.flatMap((companyName) => getCompanyProfile(companyName).specialDocuments || []),
      orderContactNames.flatMap((contactName) => getContactProfile(contactName).specialDocuments || [])
    );
  }, [orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile]);

  const currentOrderCustomerForms = useMemo(() => {
    return mergeUniqueStrings(
      orderCompanyNames.flatMap((companyName) => {
        const profile = getCompanyProfile(companyName);
        return profile.customerTextForms?.length ? profile.customerTextForms : profile.specialDocuments;
      }),
      orderContactNames.flatMap((contactName) => {
        const profile = getContactProfile(contactName);
        return profile.customerTextForms?.length ? profile.customerTextForms : profile.specialDocuments;
      })
    );
  }, [orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile]);
  const orderLevelInstructions = useMemo(
    () => normalizeInstructionEntries(data.orderInstructions || []),
    [data.orderInstructions]
  );
  const orderInstructionSelectionSet = useMemo(
    () => new Set(orderLevelInstructions.map((entry) => getInstructionTypeTextKey(entry.type, entry.text))),
    [orderLevelInstructions]
  );
  const markInstructionKeysSeen = useCallback((keys = []) => {
    if (!keys.length) return;
    setSessionInstructionKeys((prev) => {
      let changed = false;
      const next = new Set(prev);
      keys.forEach((key) => {
        if (!key || next.has(key)) return;
        next.add(key);
        changed = true;
      });
      return changed ? next : prev;
    });
  }, []);
  const buildAssignmentCueItems = useCallback((groups = []) => {
    return groups.flatMap((group) => {
      const matches = [];
      if (group.companyMatch) matches.push("company");
      if (group.contactMatch) matches.push("contact");
      if (!matches.length) return [];
      if (matches.length === 2) return [`${group.label} linked`];
      return [`${group.label} ${matches[0]} linked`];
    });
  }, []);

  const linkedInsuranceCarrier = useMemo(
    () => resolveLinkedNationalCarrierName(data.insuranceCompany || "", sampleContacts),
    [data.insuranceCompany, sampleContacts]
  );
  const billingAssignmentCues = useMemo(
    () => buildBillingAssignmentCues(data, buildAssignmentCueItems),
    [
      data.billingCompany,
      data.referringCompany,
      data.billingContact,
      data.referrer,
      data.insuranceCompany,
      data.insuranceAdjuster,
      buildAssignmentCueItems,
    ],
  );
  const billingAssignmentLinked =
    billingAssignmentCues.length > 0 && !!(data.billingCompany || data.billingContact);
  const insuranceAssignmentCues = useMemo(
    () => buildInsuranceAssignmentCues(data, buildAssignmentCueItems),
    [
      data.insuranceCompany,
      data.referringCompany,
      data.insuranceAdjuster,
      data.referrer,
      data.billingCompany,
      data.billingContact,
      buildAssignmentCueItems,
    ],
  );
  const insuranceAssignmentLinked =
    insuranceAssignmentCues.length > 0 &&
    !!(data.insuranceCompany || data.insuranceAdjuster || data.nationalCarrier);
  useEffect(() => {
    if (!billingAssignmentLinked) setBillingAssignmentUnlocked(false);
  }, [billingAssignmentLinked]);
  useEffect(() => {
    if (!insuranceAssignmentLinked) setInsuranceAssignmentUnlocked(false);
  }, [insuranceAssignmentLinked]);
  const showInsuranceShortcutOptions =
    !(
      !!(data.insuranceCompany || "").trim() &&
      !!linkedInsuranceCarrier &&
      !isInsuranceShortcutCompany(data.insuranceCompany)
    );
  const insuranceCarrierLinkMissing =
    data.insuranceClaim === "Yes" &&
    !!(data.insuranceCompany || "").trim() &&
    !linkedInsuranceCarrier &&
    !isInsuranceShortcutCompany(data.insuranceCompany) &&
    !isNonRestorationSelected(data.orderTypes || []);

  const openPrimaryCustomerText = useCallback((selectedSpecialDocs = []) => {
    const primaryCustomer =
      (data.customers || []).find((customer) => customer.isPrimary) ||
      (data.customers || [])[0];
    if (!primaryCustomer?.id) {
      setOpenSections((prev) => ({ ...prev, sec2: true }));
      setToast("Add a customer before sending a text.");
      return;
    }
    setOpenSections((prev) => ({ ...prev, sec2: true }));
    handleSendWelcome(primaryCustomer.id, {
      selectedSpecialDocs: selectedSpecialDocs.length ? selectedSpecialDocs : currentOrderCustomerForms,
    });
  }, [data.customers, currentOrderCustomerForms, handleSendWelcome]);
  const openAddOrderInstructionModal = useCallback(() => {
    setOrderInstructionModal({
      isOpen: true,
      mode: "add",
      draft: createOrderInstructionDraft(),
    });
  }, []);
  const openEditOrderInstructionModal = useCallback((entry = {}) => {
    setOrderInstructionModal({
      isOpen: true,
      mode: "edit",
      draft: createOrderInstructionDraft({
        id: getInstructionIdentity(entry),
        type: entry.type || "Communication",
        text: entry.text || "",
      }),
    });
  }, []);
  const closeOrderInstructionModal = useCallback(() => {
    setOrderInstructionModal({
      isOpen: false,
      mode: "add",
      draft: createOrderInstructionDraft(),
    });
  }, []);
  const saveOrderInstruction = useCallback(() => {
    const normalized = normalizeInstructionEntry(orderInstructionModal.draft, "Communication");
    if (!normalized?.text) {
      setToast("Add instruction text before saving.");
      return;
    }
    const draftIdentity = getInstructionIdentity(orderInstructionModal.draft);
    setData((prev) => {
      const existing = normalizeInstructionEntries(prev.orderInstructions || []);
      const nextEntry = {
        ...normalized,
        id: normalized.id || safeUid(),
      };
      const hasMatch = existing.some((entry) => getInstructionIdentity(entry) === draftIdentity);
      const nextInstructions = hasMatch
        ? existing.map((entry) => (
            getInstructionIdentity(entry) === draftIdentity
              ? nextEntry
              : entry
          ))
        : [...existing, nextEntry];
      return {
        ...prev,
        orderInstructions: dedupeInstructionEntries(nextInstructions),
      };
    });
    closeOrderInstructionModal();
    setToast(orderInstructionModal.mode === "edit" ? "Order instruction updated." : "Order instruction added.");
  }, [orderInstructionModal, closeOrderInstructionModal]);
  // renderAlertMessageContent, renderAlertDetailContent — imported from ./utils/alertContent
  const toggleOrderInstructionPreset = useCallback((type, text) => {
    const preset = normalizeInstructionEntry({ type, text }, type);
    if (!preset) return;
    const presetKey = getInstructionTypeTextKey(preset.type, preset.text);
    setData((prev) => {
      const existing = normalizeInstructionEntries(prev.orderInstructions || []);
      const hasPreset = existing.some((entry) => getInstructionTypeTextKey(entry.type, entry.text) === presetKey);
      return {
        ...prev,
        orderInstructions: hasPreset
          ? existing.filter((entry) => getInstructionTypeTextKey(entry.type, entry.text) !== presetKey)
          : dedupeInstructionEntries([
              ...existing,
              { ...preset, id: safeUid() },
            ]),
      };
    });
  }, []);
  const removeOrderInstruction = useCallback((entry = {}) => {
    setAlertModal({
      isOpen: true,
      title: "Remove order instruction?",
      message: entry.text || "Remove this order instruction?",
      details: entry.type ? [`Type: ${entry.type}`] : [],
      confirmLabel: "Remove",
      dismissLabel: "Cancel",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          orderInstructions: normalizeInstructionEntries(prev.orderInstructions || []).filter(
            (item) => getInstructionIdentity(item) !== getInstructionIdentity(entry)
          ),
        }));
        setToast("Order instruction removed.");
      },
    });
  }, []);

  useEffect(() => {
    const key = insuranceCarrierLinkMissing ? normalizeCompany(data.insuranceCompany || "") : "";
    if (!key) {
      lastCarrierAlertKeyRef.current = "";
      return;
    }
    if (lastCarrierAlertKeyRef.current === key) return;
    lastCarrierAlertKeyRef.current = key;
    setToast(`No national carrier link found for ${data.insuranceCompany}.`);
  }, [insuranceCarrierLinkMissing, data.insuranceCompany]);

  const estimateRequesterQuickOptions = useMemo(() => getEstimateRequesterQuickOptions(data), [
    data.customers,
    data.insuranceAdjuster,
    data.publicAdjuster,
    data.independentAdjuster,
    data.tpaContact,
    data.billingContact,
    data.referrer,
  ]);

  const sectionAuditStatus = useMemo(
    () => computeSectionAuditStatus(data, computeAuditMissing(), SEVERITY_GROUPS, SECTION_ORDER),
    [data],
  );

  const completedSections = useMemo(() => {
    return new Set(SECTION_ORDER.filter(sectionId => sectionAuditStatus?.[sectionId]?.complete));
  }, [sectionAuditStatus]);

  const runAudit = () => {
    const missing = computeAuditMissing();
    setAuditMissing(missing);
    const missingKeys = new Set(missing.map(m => m.key));
    setData(p => {
      const highlight = {};
      // Set all missing keys to true, clear previously-flagged keys that are now resolved
      Object.keys(p.highlightMissing || {}).forEach(k => { highlight[k] = missingKeys.has(k); });
      missingKeys.forEach(k => { highlight[k] = true; });
      return { ...p, highlightMissing: highlight };
    });
    const sections = new Set(missing.map(m => m.section));
    const subsections = new Set();
    missing.forEach(m => {
      if (["leadSourceCategory","referringCompany","referrer","leadSourceDetail"].includes(m.key)) subsections.add("source");
    if (["billingPayer"].includes(m.key)) subsections.add("billing");
    if (["orderName","orderTypes","nonRestorationSubtype","moldCoverageConfirm"].includes(m.key)) subsections.add("order");
      if (["insuranceClaim","insuranceCompany","insuranceAdjuster","claimNumber","dateOfLoss","nationalCarrier","directionOfPayment","contentsCoverageLimit","moldLimit"].includes(m.key)) subsections.add("insurance");
      if (["moldCoverageConfirm","orderTypes","nonRestorationSubtype"].includes(m.key)) subsections.add("order");
      if (["rentCoverageLimit"].includes(m.key)) subsections.add("address");
      if (["pricePlatform","priceList","multiplier","estimateRequested"].includes(m.key)) subsections.add("finance");
      if ((m.key || "").startsWith("placeholder-customer-")) subsections.add("customer");
      if ((m.key || "").startsWith("placeholder-company-") || (m.key || "").startsWith("placeholder-contact-")) subsections.add("companies");
      if ((m.key || "").startsWith("placeholder-address-")) subsections.add("address");
      if (m.key === "interview") subsections.add("interview");
      if (m.key === "codes") { subsections.add("codes"); setOpenCodes(true); }
    });
    setAuditTargets({ sections, subsections });
    const total = computeAuditRequiredCount();
    const pct = total ? Math.round(((total - missing.length) / total) * 100) : 100;
    setAuditPercent(pct);
    setAuditOpen(true);
  };

  useEffect(() => {
    if (!auditOpen && !auditOn) return;
    const missing = computeAuditMissing();
    setAuditMissing(missing);
    const total = computeAuditRequiredCount();
    const pct = total ? Math.round(((total - missing.length) / total) * 100) : 100;
    setAuditPercent(pct);
  }, [auditOpen, auditOn, data]);

  useEffect(() => {
    if (auditOn) return;
    setAuditTargets({ sections: new Set(), subsections: new Set() });
    setData(p => ({ ...p, highlightMissing: {} }));
  }, [auditOn]);

  const codeSummary = [...(data.severityCodes||[]), data.qualityCode||"", ...(data.handlingCodes||[])].filter(Boolean).join(" • ") || "None";
  const conditionSummary = useMemo(
    () => summarizeConditions(data),
    [data.damageWasWet, data.damageMoldMildew, data.structuralElectricDamage, data.noLights, data.noHeat, data.boardedUp],
  );
  const eventSystemLines = useMemo(() => buildEventSystemLines(data, conditionSummary), [data, conditionSummary]);
  const eventSystemEntries = useMemo(() => buildEventSystemEntries(data, conditionSummary), [data, conditionSummary]);
  const hasEventInstructions = useMemo(() => {
    const manual = stripEventSystemLines(data.eventInstructions || "").trim();
    const system = (eventSystemLines || "").trim();
    return !!(manual || system || eventSystemEntries.length);
  }, [data.eventInstructions, eventSystemLines, eventSystemEntries]);
  const scopeBridgeState = useMemo(() => {
    const normalized = normalizeScopeBridgeState(data.scopeBridge || {});
    if (normalized.selectedGroups.length) return normalized;
    return {
      ...normalized,
      selectedGroups: data.suggestedGroups || [],
    };
  }, [data.scopeBridge, data.suggestedGroups]);
  const scopeBridgeSnippet = useMemo(() => buildScopeBridgeSnippet(scopeBridgeState), [scopeBridgeState]);

  // --- Live Order Narrative ---
  const orderNarrative = useMemo(() => buildOrderNarrative(data), [data]);

  const mergedSdsPhotos = useMemo(
    () => mergeSdsPhotos(data.sdsPhotos || [], (data as any).scopePhotos || {}, data.propertyRooms || []),
    [data.sdsPhotos, (data as any).scopePhotos, data.propertyRooms],
  );

  const mergedSdsCoverPhoto = useMemo(() => {
    return data.sdsCoverPhoto || null;
  }, [data.sdsCoverPhoto]);
  const bridgeStatusClassNames = useMemo(
    () => bridgeStatusClass(scopeBridgeState.projectStatus),
    [scopeBridgeState.projectStatus],
  );
  const bridgeSectionClassNames = useMemo(
    () => bridgeSectionClass(scopeBridgeState.projectStatus),
    [scopeBridgeState.projectStatus],
  );

  const patchScopeBridge = useCallback((updater, opts = {}) => {
    const options = opts || {};
    const current = normalizeScopeBridgeState(scopeBridgeState || {});
    const candidate = typeof updater === "function"
      ? updater(current)
      : { ...current, ...(updater || {}) };
    const next = normalizeScopeBridgeState(candidate);
    if (!options.manualStatus && next.projectStatus !== "red") {
      next.projectStatus = deriveScopeBridgeStatus(next);
      if (next.projectStatus === "green") {
        next.statusReason = "Production Authorized";
      } else if (next.statusReason === "Production Authorized") {
        next.statusReason = "";
      }
    }
    applyScopeBridge(next);
  }, [scopeBridgeState, deriveScopeBridgeStatus, applyScopeBridge]);

  const toggleScopeBridgeIssue = useCallback((issue) => {
    patchScopeBridge((prev) => {
      const normalizedIssue = canonicalBridgeIssue(issue);
      const currentPending = Array.from(new Set((prev.pendingIssues || []).map(canonicalBridgeIssue).filter(Boolean)));
      const nextPending = toggleMulti(currentPending, normalizedIssue);
      return {
        ...prev,
        pendingIssues: nextPending,
      };
    });
  }, [patchScopeBridge]);

  const toggleScopeBridgeMilestone = useCallback((milestoneId, atId) => {
    patchScopeBridge((prev) => {
      const currentMilestones = prev.milestones || {};
      const currentPending = Array.from(new Set((prev.pendingIssues || []).map(canonicalBridgeIssue).filter(Boolean)));
      const nextEnabled = !currentMilestones[milestoneId];
      const isEstimateApproval = milestoneId === "estimateApproved";
      const isAuthorizationSigned = milestoneId === "authorizationOnFile";
      const clearOverridePatch = isEstimateApproval && nextEnabled
        ? {
            proceedWithoutApproval: false,
            proceedWithoutApprovalAt: "",
            proceedWithoutApprovalBy: "",
          }
        : {};
      let nextPending = [...currentPending];
      if (nextEnabled && isAuthorizationSigned) {
        nextPending = nextPending.filter((issue) => issue !== "Won't Sign Authorization");
      }
      if (nextEnabled && isEstimateApproval) {
        nextPending = nextPending.filter((issue) => issue !== "Customer Wants Estimate" && issue !== "Adjuster Wants Estimate");
      }
      return {
        ...prev,
        pendingIssues: nextPending,
        milestones: {
          ...currentMilestones,
          ...clearOverridePatch,
          [milestoneId]: nextEnabled,
          [atId]: nextEnabled ? new Date().toISOString() : "",
        }
      };
    });
  }, [patchScopeBridge]);

  const toggleProceedWithoutApproval = useCallback(() => {
    patchScopeBridge((prev) => {
      const currentMilestones = prev.milestones || {};
      const nextEnabled = !currentMilestones.proceedWithoutApproval;
      return {
        ...prev,
        milestones: {
          ...currentMilestones,
          proceedWithoutApproval: nextEnabled,
          proceedWithoutApprovalAt: nextEnabled ? new Date().toISOString() : "",
          estimateApproved: nextEnabled ? false : currentMilestones.estimateApproved,
          estimateApprovedAt: nextEnabled ? "" : currentMilestones.estimateApprovedAt,
          estimateApprovedBy: nextEnabled ? "" : currentMilestones.estimateApprovedBy,
        },
      };
    });
  }, [patchScopeBridge]);

  const updateScopeBridgeMilestone = useCallback((milestoneKey, value) => {
    patchScopeBridge((prev) => ({
      ...prev,
      milestones: {
        ...(prev.milestones || {}),
        [milestoneKey]: value
      }
    }));
  }, [patchScopeBridge]);
  const autoBridgeIssues = useMemo(() => {
    const auto = [];
    const milestones = scopeBridgeState.milestones || {};
    const authorizationOnFile = !!milestones.authorizationOnFile;
    const proceedWithoutApproval = !!milestones.proceedWithoutApproval;
    const estimateApproved = proceedWithoutApproval || !!milestones.estimateApproved || hasMeaningfulValue(data.estimateApprovedAt);
    const estimateRequestedBy = (data.estimateRequestedBy || "").toString().trim().toLowerCase();
    const estimateRequestedByInsurance = /\b(adjuster|insurance|carrier|public adjuster|pa|tpa)\b/.test(estimateRequestedBy);

    if (!authorizationOnFile) auto.push("Won't Sign Authorization");
    if (!!data.estimateRequested && !estimateApproved) {
      auto.push(estimateRequestedByInsurance ? "Adjuster Wants Estimate" : "Customer Wants Estimate");
    }
    if (currentOrderSpecialDocs.length > 0) {
      auto.push(SPECIAL_PAPERWORK_BLOCKER);
    }
    if (normalizeCompany(data.insuranceCompany || "") === normalizeCompany("Not Yet Known")) {
      auto.push(UNKNOWN_INSURANCE_BLOCKER);
    }

    return Array.from(new Set(auto));
  }, [
    scopeBridgeState.milestones,
    data.estimateRequested,
    data.estimateRequestedBy,
    data.estimateApprovedAt,
    data.insuranceCompany,
    currentOrderSpecialDocs,
  ]);
  const autoManagedBridgeBlockerSet = useMemo(
    () => new Set(BRIDGE_AUTO_MANAGED_BLOCKERS),
    []
  );
  const prevAutoBridgeIssuesRef = useRef(null);
  useEffect(() => {
    const prevAuto = prevAutoBridgeIssuesRef.current;
    if (!prevAuto) {
      prevAutoBridgeIssuesRef.current = autoBridgeIssues;
      return;
    }
    if (stringListMatches(prevAuto, autoBridgeIssues)) return;
    prevAutoBridgeIssuesRef.current = autoBridgeIssues;

    const currentPendingRaw = scopeBridgeState.pendingIssues || [];
    const currentPending = Array.from(new Set(currentPendingRaw.map(canonicalBridgeIssue).filter(Boolean)));
    const autoSet = new Set(autoBridgeIssues);
    const nextPending = currentPending.filter((issue) => !autoManagedBridgeBlockerSet.has(issue));

    BRIDGE_AUTO_MANAGED_BLOCKERS.forEach((issue) => {
      if (autoSet.has(issue) && !nextPending.includes(issue)) nextPending.push(issue);
    });

    const pendingChanged = !stringListMatches(currentPendingRaw, nextPending);
    if (!pendingChanged) return;
    patchScopeBridge((prev) => ({
      ...prev,
      pendingIssues: nextPending,
      blockerManualState: {},
    }));
  }, [
    scopeBridgeState.pendingIssues,
    autoBridgeIssues,
    autoManagedBridgeBlockerSet,
    patchScopeBridge,
  ]);
  const activeBridgeIssues = useMemo(() => {
    const raw = Array.from(new Set((scopeBridgeState.pendingIssues || []).map(canonicalBridgeIssue).filter(Boolean)));
    const orderedKnown = BRIDGE_BLOCKER_ITEMS.filter((issue) => raw.includes(issue));
    const extras = raw.filter((issue) => !BRIDGE_BLOCKER_ITEMS.includes(issue));
    return [...orderedKnown, ...extras];
  }, [scopeBridgeState.pendingIssues]);
  const activeBridgeIssueSet = useMemo(() => new Set(activeBridgeIssues), [activeBridgeIssues]);
  const groupedBridgeIssues = useMemo(
    () =>
      BRIDGE_BLOCKER_GROUPS.map((group) => ({
        ...group,
        rows: group.issues.map((issue) => ({ issue, active: activeBridgeIssueSet.has(issue) })),
      })),
    [activeBridgeIssueSet]
  );
  const bridgeEstimateDetails = useMemo(() => {
    const parts = [];
    if (hasMeaningfulValue(data.estimateType)) parts.push(`Type: ${data.estimateType}`);
    if (hasMeaningfulValue(data.estimateRequestedBy)) parts.push(`Requested by: ${data.estimateRequestedBy}`);
    return parts.join(" · ");
  }, [data.estimateType, data.estimateRequestedBy]);
  const authorizationOnFile = !!(scopeBridgeState.milestones || {}).authorizationOnFile;
  const selectedBridgePickupStep = useMemo(() => {
    const pickup = (scopeBridgeState.pickupOption || "").toString();
    if (pickup === "wait") return "hold";
    if (pickup === "urgent") return "priority";
    return "schedule";
  }, [scopeBridgeState.pickupOption]);
  const selectedBridgeProcessStep = useMemo(() => {
    const process = (scopeBridgeState.processingOption || "").toString();
    if (process === "tag_hold") return "hold";
    if (process === "urgent" || process === "specific") return "priority";
    return "yes";
  }, [scopeBridgeState.processingOption]);
  const selectedBridgeDeliveryStep = useMemo(() => {
    const delivery = (scopeBridgeState.deliveryOption || "").toString();
    if (delivery === "hold_cod") return "hold_cod";
    if (delivery === "priority") return "priority";
    if (delivery === "ok") return "ok";

    const nextStep = (scopeBridgeState.nextStep || "").toString();
    if (nextStep === "delivery_hold_cod" || nextStep === "cod" || nextStep === "delivery_hold") return "hold_cod";
    if (nextStep === "delivery_priority" || nextStep === "emergency_groups_only") return "priority";
    if ((scopeBridgeState.processingOption || "").toString() === "cod") return "hold_cod";
    return "ok";
  }, [scopeBridgeState.deliveryOption, scopeBridgeState.nextStep, scopeBridgeState.processingOption]);
  const setBridgePickupStep = useCallback((optionId) => {
    patchScopeBridge((prev) => {
      const pickupOption = optionId === "hold" ? "wait" : optionId === "priority" ? "urgent" : "";
      return { ...prev, pickupOption };
    });
  }, [patchScopeBridge]);
  const setBridgeProcessStep = useCallback((optionId) => {
    patchScopeBridge((prev) => {
      const processingOption = optionId === "hold" ? "tag_hold" : optionId === "priority" ? "urgent" : "all";
      return { ...prev, processingOption };
    });
  }, [patchScopeBridge]);
  const setBridgeDeliveryStep = useCallback((optionId) => {
    patchScopeBridge((prev) => {
      const deliveryOption = optionId === "hold_cod" ? "hold_cod" : optionId === "priority" ? "priority" : "ok";
      const nextStep = optionId === "hold_cod"
        ? "delivery_hold_cod"
        : optionId === "priority"
          ? "delivery_priority"
          : "delivery_ok";
      return { ...prev, deliveryOption, nextStep };
    });
  }, [patchScopeBridge]);
  const attentionWater = data.damageWasWet === "Y" || data.damageWasWet === true;
  const attentionMold = !!data.damageMoldMildew;
  const highlightStorageFromProcess = data.processType === "Long-Term Storage";
  const expectedSeverityGroups = useMemo(() => {
    return (data.orderTypes || []).reduce((acc, t) => {
      const group = t === "Dust/Debris" ? "Dust" : t;
      if (SEVERITY_GROUPS.includes(group)) acc.add(group);
      return acc;
    }, new Set());
  }, [data.orderTypes]);

  const contactCompanyMap = useMemo(() => {
    const map = new Map();
    Object.values(data.additionalCompanies || {}).forEach(entry => {
      if (entry?.contact && entry?.company) {
        map.set(normalizeContact(entry.contact), entry.company);
      }
      if (entry?.contacts && entry.contacts.length && entry.company) {
        entry.contacts.forEach(c => {
          if (c?.name) map.set(normalizeContact(c.name), entry.company);
        });
      }
    });
    if (data.billingContact && data.billingCompany) {
      map.set(normalizeContact(data.billingContact), data.billingCompany);
    }
    sampleContacts.forEach(c => {
      if (c?.name && c?.company) map.set(normalizeContact(c.name), c.company);
    });
    return map;
  }, [data.additionalCompanies, data.billingContact, data.billingCompany, sampleContacts]);

  const existingCompanyOptions = useMemo(() => {
    const set = new Set();
    (companies || []).forEach(c => c && set.add(c));
    Object.values(data.additionalCompanies || {}).forEach(entry => {
      if (entry?.company) set.add(entry.company);
    });
    return Array.from(set);
  }, [companies, data.additionalCompanies]);

  const globalDirectoryByCompany = useMemo(() => {
    const map = new Map();
    sampleContacts.forEach(c => {
      const key = normalizeCompany(c.company || "");
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ name: c.name, title: c.title });
    });
    return map;
  }, [sampleContacts]);

  // Per-role Company assignment rows for Section 4 — see utils/companyRoles.
  const companyRoleAssignments = useMemo(
    () => buildCompanyRoleAssignments(data, COMPANY_ROLE_DEFS, globalDirectoryByCompany),
    [
      data.additionalCompanies,
      data.insuranceCompany,
      data.insuranceAdjuster,
      data.publicAdjustingCompany,
      data.publicAdjuster,
      data.independentAdjustingCo,
      data.independentAdjuster,
      data.tpaCompany,
      data.tpaContact,
      globalDirectoryByCompany,
    ]
  );

  const visibleCompanyRoles = useMemo(() => {
    const base = companyRolesExpanded
      ? companyRoleAssignments
      : companyRoleAssignments.filter(r => r.pending || r.filled);
    return base
      .map((r, idx) => ({ ...r, _idx: idx }))
      .sort((a, b) => {
        const rank = (r) => (r.filled ? 0 : r.pending ? 1 : 2);
        const diff = rank(a) - rank(b);
        if (diff !== 0) return diff;
        const aLabel = (a.label || "").toLowerCase();
        const bLabel = (b.label || "").toLowerCase();
        if (aLabel === bLabel) return a._idx - b._idx;
        return aLabel.localeCompare(bLabel);
      })
      .map(({ _idx, ...r }) => r);
  }, [companyRoleAssignments, companyRolesExpanded]);

  const pendingCompanyRoleCount = useMemo(() => {
    return companyRoleAssignments.filter(r => r.pending).length;
  }, [companyRoleAssignments]);

  useEffect(() => {
    const base = stripEventSystemLines(data.eventInstructions || "");
    const next = composeEventInstructions(base, data, conditionSummary);
    if (next !== (data.eventInstructions || "")) {
      update("eventInstructions", next);
    }
  }, [
    conditionSummary,
    data.loadList,
    data.quickInstructionNotes,
    data.serviceOfferings,
    data.estimateRequested,
    data.estimateType,
    data.estimateRequestedBy,
    data.eventInstructions
  ]);
  useEffect(() => {
    const scopeGroups = scopeBridgeState.selectedGroups || [];
    const orderGroups = data.suggestedGroups || [];
    if (stringListMatches(scopeGroups, orderGroups)) return;
    setData((prev) => {
      const current = normalizeScopeBridgeState(prev.scopeBridge || {});
      const nextGroups = prev.suggestedGroups || [];
      if (stringListMatches(current.selectedGroups || [], nextGroups)) return prev;
      return {
        ...prev,
        scopeBridge: withScopeBridgeSnippet({
          ...current,
          selectedGroups: nextGroups,
        }),
      };
    });
  }, [data.suggestedGroups, scopeBridgeState.selectedGroups]);
  const recordTypeLabel = data.isLead === true ? "Lead" : data.isLead === false ? "Order" : "Select Type";
  const knownPeople = useMemo(()=>{
    const s=new Set();
    (data.customers||[]).forEach(c=>{ if(c.first||c.last) s.add((c.first+' '+c.last).trim()); });
    // Adjusters with company
    if(data.insuranceAdjuster) s.add(data.adjusterCompany ? `${data.insuranceAdjuster} - ${data.adjusterCompany}` : data.insuranceAdjuster);
    if(data.publicAdjuster) s.add(data.publicAdjustingCompany ? `${data.publicAdjuster} - ${data.publicAdjustingCompany}` : data.publicAdjuster);
    if(data.independentAdjuster) s.add(data.independentAdjustingCo ? `${data.independentAdjuster} - ${data.independentAdjustingCo}` : data.independentAdjuster);
    if(data.tpaContact) s.add(data.tpaCompany ? `${data.tpaContact} - ${data.tpaCompany}` : data.tpaContact);
    // Referrer with company
    if(data.referrer) s.add(data.referringCompany ? `${data.referrer} - ${data.referringCompany}` : data.referrer);
    // Vendors with company
    Object.entries(data.vendorDetails||{}).forEach(([company, v]: [string, any])=>{ if(v&&v.contact) s.add(`${v.contact} - ${company}`); });
    (data.peopleQuick||[]).forEach(m=>{ if(m.first) s.add(m.first); });
    return Array.from(s).filter(Boolean);
  },[data]);

  const companySet = useMemo(() => new Set(companies), [companies]);

  const combinedContactOptions = useMemo(() => {
    const contactOpts = [];
    const seenContacts = new Set();
    const addContact = (contact, company) => {
      if (!contact || seenContacts.has(contact)) return;
      seenContacts.add(contact);
      const label = company ? `${contact} (${company})` : contact;
      const value = company ? `${contact} — ${company}` : contact;
      contactOpts.push({ label, value, type: "contact" });
    };
    sampleContacts.forEach(c => addContact(c.name, c.company));
    contacts.forEach(c => {
      const company = contactCompanyMap.get(normalizeContact(c));
      addContact(c, company);
    });
    const companyOpts = companies.map(c => ({ label: c, value: c, type: "company" }));
    return [...contactOpts, ...companyOpts];
  }, [contacts, companies, contactCompanyMap, sampleContacts]);

  const parseCombinedContact = (value) => {
    const v = (value || "").trim();
    if (!v) return { contact: "", company: "" };
    const dashParts = v.split("—").map(p => p.trim()).filter(Boolean);
    if (dashParts.length >= 2) return { contact: dashParts[0], company: dashParts.slice(1).join(" — ") };
    const paren = v.match(/^(.+)\s+\((.+)\)$/);
    if (paren) return { contact: paren[1].trim(), company: paren[2].trim() };
    if (companySet.has(v)) return { contact: "", company: v };
    const mappedCompany = contactCompanyMap.get(normalizeContact(v)) || "";
    if (mappedCompany) return { contact: v, company: mappedCompany };
    return { contact: v, company: "" };
  };

  const normalizeCompanyType = useCallback((type) => (type || "").toString().trim().toLowerCase(), []);

  const getCompanyTypeForRoles = useCallback((companyName = "") => {
    if (!companyName) return "";
    const fromAdditional = Object.entries(data.additionalCompanies || {}).find(([, entry]) =>
      normalizeCompany(entry?.company || "") === normalizeCompany(companyName)
    );
    if (fromAdditional?.[0]) return fromAdditional[0];
    const sample = sampleContacts.find(c => normalizeCompany(c.company || "") === normalizeCompany(companyName));
    if (sample?.companyType) return sample.companyType;
    return autoTypeForCompany(companyName);
  }, [data.additionalCompanies, sampleContacts]);

  const getCompanyRoleCapabilities = useCallback((companyName = "", typeOverride = "") => {
    const defaultCaps = inferRoleCapabilities(typeOverride || getCompanyTypeForRoles(companyName), companyName);
    if (!companyName) return defaultCaps;
    const normalizedCompany = normalizeCompany(companyName);
    const sample = sampleContacts.find(c => normalizeCompany(c.company || "") === normalizedCompany);
    if (!sample) return defaultCaps;
    return {
      canRefer: typeof sample.canRefer === "boolean" ? sample.canRefer : defaultCaps.canRefer,
      canBill: typeof sample.canBill === "boolean" ? sample.canBill : defaultCaps.canBill,
      canInsure: typeof sample.canInsure === "boolean" ? sample.canInsure : defaultCaps.canInsure
    };
  }, [getCompanyTypeForRoles, sampleContacts]);

  const isRoleEligibleForCompany = useCallback((roleId, companyName, typeOverride = "") => {
    const capabilities = getCompanyRoleCapabilities(companyName, typeOverride);
    if (roleId === "referrer") return !!capabilities.canRefer;
    if (roleId === "billto") return !!capabilities.canBill;
    if (roleId !== "insurance") return true;
    if (!capabilities.canInsure) return false;
    const normalizedType = normalizeCompanyType(typeOverride || getCompanyTypeForRoles(companyName));
    if (!normalizedType) return true;
    if (INSURANCE_ELIGIBLE_COMPANY_TYPES.has(normalizedType)) return true;
    if (normalizedType.includes("contractor")) return false;
    if (normalizedType.includes("insurance")) return true;
    const carrierMatch = NATIONAL_CARRIERS.some(c => normalizeCompany(c) === normalizeCompany(companyName || ""));
    return carrierMatch;
  }, [getCompanyRoleCapabilities, getCompanyTypeForRoles, normalizeCompanyType]);

  const getEligibleRoleLabels = useCallback((companyName, typeOverride = "") => {
    return CONTACT_ROLE_BADGES
      .filter(role => isRoleEligibleForCompany(role.id, companyName, typeOverride))
      .map(role => role.title);
  }, [isRoleEligibleForCompany]);

  const closeRoleAssignmentPrompt = useCallback(() => {
    setRoleAssignModal({
      isOpen: false,
      source: "",
      company: "",
      contact: "",
      options: [],
      selected: []
    });
  }, []);

  const getRolePromptOptions = useCallback((company, contact, skipRoles = [], forceRoles = []) => {
    const blocked = new Set(skipRoles || []);
    const forced = new Set(forceRoles || []);
    const referrerAssigned = !!(data.referringCompany || data.referrer);
    const insuranceAssigned = !!(data.insuranceCompany || data.insuranceAdjuster);
    const billToAssigned = !!(data.billingCompany || data.billingContact);
    const normalizedCompany = normalizeCompany(company || "");
    const normalizedContact = normalizeContact(contact || "");
    const sameReferrer =
      (!!normalizedCompany && normalizeCompany(data.referringCompany || "") === normalizedCompany) ||
      (!!normalizedContact && normalizeContact(data.referrer || "") === normalizedContact);
    const sameInsurance =
      (!!normalizedCompany && normalizeCompany(data.insuranceCompany || "") === normalizedCompany) ||
      (!!normalizedContact && normalizeContact(data.insuranceAdjuster || "") === normalizedContact);
    const sameBillTo =
      (!!normalizedCompany && normalizeCompany(data.billingCompany || "") === normalizedCompany) ||
      (!!normalizedContact && normalizeContact(data.billingContact || "") === normalizedContact);
    const companyTypeHint = normalizeCompanyType(getCompanyTypeForRoles(company || ""));
    const isPublicAdjuster = companyTypeHint.includes("public adjust");
    return CONTACT_ROLE_BADGES.filter(role => {
      if (blocked.has(role.id) && !forced.has(role.id)) return false;
      if (forced.has(role.id)) return isRoleEligibleForCompany(role.id, company);
      if (!isRoleEligibleForCompany(role.id, company)) return false;
      if (role.id === "referrer") return !referrerAssigned || sameReferrer;
      if (role.id === "insurance") {
        if (isPublicAdjuster) return false;
        return !insuranceAssigned || sameInsurance;
      }
      if (role.id === "billto") return !billToAssigned || sameBillTo;
      if (role.id === "poc") return true;
      return false;
    });
  }, [
    data.referringCompany,
    data.referrer,
    data.insuranceCompany,
    data.insuranceAdjuster,
    data.billingCompany,
    data.billingContact,
    isRoleEligibleForCompany,
    getCompanyTypeForRoles,
    normalizeCompanyType
  ]);

  const openRoleAssignmentPrompt = useCallback(({ company, contact, source = "", skipRoles = [], preferredRoles = [], forceRoles = [] }) => {
    const nextCompany = (company || "").trim();
    const nextContact = (contact || "").trim();
    if (!nextCompany && !nextContact) return;
    const options = getRolePromptOptions(nextCompany, nextContact, skipRoles, forceRoles);
    if (!options.length) return;
    const optionIds = new Set(options.map(option => option.id));
    const sourceKey = (source || "").toLowerCase();
    const preferredFromSource =
      sourceKey.includes("referrer") ? "referrer" :
      sourceKey.includes("billing") ? "billto" :
      (sourceKey.includes("insurance") || sourceKey.includes("adjuster")) ? "insurance" :
      "";
    const matchedContact = nextContact
      ? sampleContacts.find(c => normalizeContact(c.name || "") === normalizeContact(nextContact))
      : null;
    const titleHint = (matchedContact?.title || "").toLowerCase();
    const companyTypeHint = normalizeCompanyType(getCompanyTypeForRoles(nextCompany));
    const capabilities = getCompanyRoleCapabilities(nextCompany, companyTypeHint);
    const suggested = [];
    if (capabilities.canRefer && optionIds.has("referrer")) suggested.push("referrer");
    if (capabilities.canInsure && optionIds.has("insurance")) suggested.push("insurance");
    if (capabilities.canBill && optionIds.has("billto")) suggested.push("billto");
    (forceRoles || []).forEach(roleId => { if (optionIds.has(roleId)) suggested.push(roleId); });
    (preferredRoles || []).forEach(roleId => { if (optionIds.has(roleId)) suggested.push(roleId); });
    if (preferredFromSource && optionIds.has(preferredFromSource)) suggested.push(preferredFromSource);
    if (titleHint.includes("adjuster") && optionIds.has("insurance")) suggested.push("insurance");
    if (companyTypeHint.includes("insurance") && optionIds.has("insurance")) suggested.push("insurance");
    // Never auto-suggest POC — user must opt in explicitly. If POC is the only available
    // role (e.g., Public Adjuster with Insurance hidden), leave the prompt with nothing selected.
    if (!suggested.length && options.length === 1 && options[0].id !== "poc") suggested.push(options[0].id);
    const selectedDefaults = Array.from(new Set(suggested)).filter((id) => id !== "poc");
    setRoleAssignModal({
      isOpen: true,
      source,
      company: nextCompany,
      contact: nextContact,
      options,
      selected: selectedDefaults
    });
  }, [getRolePromptOptions, getCompanyTypeForRoles, normalizeCompanyType, sampleContacts, getCompanyRoleCapabilities]);

  const applyRoleAssignments = useCallback((roles, company, contact) => {
    const selected = new Set(roles || []);
    if (!selected.size) return;
    const hasCompany = !!company;
    const hasContact = !!contact;
    setData(prev => {
      const next = { ...prev };
      if (selected.has("referrer") && hasCompany) {
        next.referringCompany = company;
        if (hasContact) next.referrer = contact;
      }
      if (selected.has("insurance") && hasCompany) {
        if (!isRoleEligibleForCompany("insurance", company)) {
          selected.delete("insurance");
        } else {
        next.insuranceCompany = company;
        if (hasContact) next.insuranceAdjuster = contact;
        next.insuranceClaim = "Yes";
        next.involvesInsurance = "Yes";
        if (!next.billingPayer) next.billingPayer = "Insurance";
        }
      }
      if (selected.has("billto") && hasCompany) {
        next.billingCompany = company;
        if (hasContact) next.billingContact = contact;
        if (!next.billingPayer) next.billingPayer = "Referrer";
      }
      return next;
    });
    if (selected.has("poc") && (hasCompany || hasContact)) {
      flagContactAsPoc(company, contact, "Order POC");
    }
    if (hasContact || hasCompany) {
      const roleNames = CONTACT_ROLE_BADGES
        .filter(role => selected.has(role.id))
        .map(role => role.title);
      if (roleNames.length) {
        setToast(`Assigned ${roleNames.join(", ")} role${roleNames.length > 1 ? "s" : ""}.`);
      }
    }
  }, [setToast, isRoleEligibleForCompany, flagContactAsPoc]);

  const toggleRoleAssignmentSelection = useCallback((roleId) => {
    setRoleAssignModal(prev => {
      const active = prev.selected.includes(roleId);
      return {
        ...prev,
        selected: active ? prev.selected.filter(id => id !== roleId) : [...prev.selected, roleId]
      };
    });
  }, []);

  const applySelectedRoleAssignments = useCallback(() => {
    if (!roleAssignModal.isOpen) return;
    applyRoleAssignments(roleAssignModal.selected, roleAssignModal.company, roleAssignModal.contact);
    closeRoleAssignmentPrompt();
  }, [roleAssignModal, applyRoleAssignments, closeRoleAssignmentPrompt]);

  const goBackFromRoleAssignmentPrompt = useCallback(() => {
    const source = roleAssignModal.source || "";
    closeRoleAssignmentPrompt();

    if (!source) return;
    if (source === "referrer") {
      setOpenSections(prev => ({ ...prev, sec1: true }));
      setSourceSubOpen(true);
      setTimeout(() => {
        const el = document.querySelector('[data-audit-key="referrer"]');
        if (el instanceof HTMLElement) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      }, 120);
      return;
    }
    if (source === "billing-contact") {
      setOpenSections(prev => ({ ...prev, sec4: true }));
      setBillingSubOpen(true);
      setTimeout(() => {
        const el = document.querySelector('[data-audit-key="billingContact"]');
        if (el instanceof HTMLElement) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      }, 120);
      return;
    }
    if (source === "insurance-contact") {
      setOpenSections(prev => ({ ...prev, sec4: true }));
      setInsuranceSubOpen(true);
      setTimeout(() => {
        const el = document.querySelector('[data-audit-key="insuranceAdjuster"]');
        if (el instanceof HTMLElement) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      }, 120);
    }
  }, [closeRoleAssignmentPrompt, roleAssignModal.source]);

  const applyReferrerRoles = (roles) => {
    setData(prev => {
      const company = prev.referringCompany || "";
      const contact = prev.referrer || "";
      const next = { ...prev };
      if (roles.includes("insurance") && company) next.insuranceCompany = company;
      if (roles.includes("billing") && company) next.billingCompany = company;
      if (roles.includes("national") && company) next.nationalCarrier = company;
      if (roles.includes("adjuster") && contact) next.insuranceAdjuster = contact;
      if (roles.includes("billing") && contact) next.billingContact = contact;
      if (roles.includes("insurance") || roles.includes("national") || roles.includes("billing")) {
        next.insuranceClaim = "Yes";
        next.involvesInsurance = "Yes";
        next.billingPayer = "Insurance";
      }
      return next;
    });
  };

  // Auto-fill insurance from referrer when referring company is an insurance carrier
  useEffect(() => {
    const company = data.referringCompany || "";
    const contact = data.referrer || "";
    if (!company) return;
    const companyType = inferCompanyTypeFromName(company);
    if (companyType !== "Insurance") return;
    // Only auto-fill if insurance fields are empty
    if (data.insuranceCompany && data.insuranceCompany !== company) return;
    const updates = {};
    if (!data.insuranceCompany) updates.insuranceCompany = company;
    if (!data.insuranceAdjuster && contact) updates.insuranceAdjuster = contact;
    if (!data.insuranceClaim) updates.insuranceClaim = "Yes";
    if (Object.keys(updates).length) {
      setData(prev => ({ ...prev, ...updates }));
      setToast("Insurance auto-filled from referrer.");
    }
  }, [data.referringCompany, data.referrer]);

  const suggestedReferrerRoles = useMemo(() => {
    const roles = [];
    const company = data.referringCompany || "";
    const contact = data.referrer || "";
    if (contact) roles.push("adjuster");
    const isCarrier = NATIONAL_CARRIERS.some(c => normalizeCompany(c) === normalizeCompany(company));
    if (isCarrier) roles.push("insurance", "billing", "national");
    return roles.filter(r => {
      if (r === "adjuster") return !data.insuranceAdjuster || data.insuranceAdjuster === contact;
      if (r === "billing") return !data.billingCompany || data.billingCompany === company;
      if (r === "insurance") return !data.insuranceCompany || data.insuranceCompany === company;
      if (r === "national") return !data.nationalCarrier || data.nationalCarrier === company;
      return true;
    });
  }, [data.referringCompany, data.referrer]);

  const updateAdditionalCompanyType = (type) => {
    const next = toggleMulti(data.additionalCompanyTypes || [], type);
    setData(prev => {
      const updated = { ...prev, additionalCompanyTypes: next };
      const entries = { ...(prev.additionalCompanies || {}) };
      if (!entries[type]) {
        entries[type] = syncCompanyEntryPlaceholders({
          contact: "",
          company: "",
          placeholder: createPlaceholderFlag("company", `${type} pending`)
        });
      } else {
        entries[type] = syncCompanyEntryPlaceholders(entries[type]);
      }
      updated.additionalCompanies = entries;
      return updated;
    });
  };

  const updateAdditionalCompanyEntry = (type, patch) => {
    setData(prev => ({
      ...prev,
      additionalCompanies: {
        ...(prev.additionalCompanies || {}),
        [type]: syncCompanyEntryPlaceholders({
          ...(prev.additionalCompanies?.[type] || { contact: "", company: "", inactive: false }),
          ...patch
        })
      }
    }));
  };

  const removeAdditionalCompany = (type) => {
    setData(prev => {
      const entry = prev.additionalCompanies?.[type];
      const nextTypes = (prev.additionalCompanyTypes || []).filter(t => t !== type);
      const nextCompanies = { ...(prev.additionalCompanies || {}) };
      delete nextCompanies[type];
      const next = { ...prev, additionalCompanyTypes: nextTypes, additionalCompanies: nextCompanies };
      if (entry?.company && prev.referringCompany === entry.company) {
        next.referringCompany = "";
        if (entry.contact && prev.referrer === entry.contact) next.referrer = "";
      }
      if (entry?.company && prev.billingCompany === entry.company) {
        next.billingCompany = "";
        if (entry.contact && prev.billingContact === entry.contact) next.billingContact = "";
      }
      if (entry?.contact && prev.insuranceAdjuster === entry.contact) {
        next.insuranceAdjuster = "";
      }
      return next;
    });
  };

  const registerContactCompany = (contact, company) => {
    if (contact && !contacts.includes(contact)) {
      setContacts(prev => Array.from(new Set([...prev, contact])));
    }
    if (company && !companies.includes(company)) {
      setCompanies(prev => Array.from(new Set([...prev, company])));
    }
    if (contact && company) {
      setSampleContacts(prev => {
        const normalized = normalizeSampleContacts(prev);
        const existingIndex = normalized.findIndex(c => normalizeContact(c.name) === normalizeContact(contact));
        if (existingIndex >= 0) {
          const next = [...normalized];
          const existing = next[existingIndex];
          next[existingIndex] = { ...existing, company: company || existing.company };
          return next;
        }
        const defaults = inferRoleCapabilities(autoTypeForCompany(company), company);
        return [...normalized, {
          id: safeUid(),
          name: contact,
          company,
          companyType: autoTypeForCompany(company),
          title: "",
          salesRep: "",
          isAdjuster: false,
          canRefer: defaults.canRefer,
          canBill: defaults.canBill,
          canInsure: defaults.canInsure
        }];
      });
    }
  };

  const addCompanyFromSearch = (type, value) => {
    if (!type) return;
      const parsed = parseCombinedContact(value);
      if (parsed.contact && !parsed.company) {
        setToast("Company required for contact.");
        return;
      }
    const exists = Object.entries(data.additionalCompanies || {}).find(([t, entry]) => {
      const sameCompany = parsed.company && entry?.company && normalizeCompany(entry.company) === normalizeCompany(parsed.company);
      const sameContact = parsed.contact && entry?.contact && normalizeContact(entry.contact) === normalizeContact(parsed.contact);
      const sameContactInList = parsed.contact && entryContactList(entry || {}).some(c => normalizeContact(c?.name || "") === normalizeContact(parsed.contact));
      return sameCompany || sameContact || sameContactInList;
    });
    if (exists && exists[0] === type) {
      triggerAutoFlash(`company-${exists[0]}`);
      return;
    }
    const applied = upsertAdditionalCompany(type, { contact: parsed.contact || "", company: parsed.company || "" });
    if (!applied) return;
    registerContactCompany(parsed.contact, parsed.company);
    triggerAutoFlash(`company-${type}`);
    setCompanyEdit(prev => ({ ...prev, [type]: false }));
    setCompanyModalCloseArmed(true);
    openRoleAssignmentPrompt({
      source: "quick-add-search",
      company: parsed.company || "",
      contact: parsed.contact || ""
    });
  };

  const addCompanyDirect = (type, contact, company) => {
    const nextType = type || autoTypeForCompany(company);
    if (contact && !company) {
      setToast("Company required for contact.");
      return;
    }
    const exists = Object.entries(data.additionalCompanies || {}).find(([t, entry]) => {
      const sameCompany = company && entry?.company && normalizeCompany(entry.company) === normalizeCompany(company);
      const sameContact = contact && entry?.contact && normalizeContact(entry.contact) === normalizeContact(contact);
      const sameContactInList = contact && entryContactList(entry || {}).some(c => normalizeContact(c?.name || "") === normalizeContact(contact));
      return sameCompany || sameContact || sameContactInList;
    });
    if (exists && exists[0] === nextType) {
      triggerAutoFlash(`company-${exists[0]}`);
      return;
    }
    const applied = upsertAdditionalCompany(nextType, { contact: contact || "", company: company || "" });
    if (!applied) return;
    registerContactCompany(contact, company);
    triggerAutoFlash(`company-${nextType}`);
    setCompanyEdit(prev => ({ ...prev, [nextType]: false }));
    setCompanyModalCloseArmed(true);
    openRoleAssignmentPrompt({
      source: "quick-add-company",
      company: company || "",
      contact: contact || ""
    });
  };

  const getContactOptionsForCompany = (company) => {
    if (!company) return [];
    const opts = [];
    const seen = new Set();
    const add = (name) => {
      if (!name || seen.has(name)) return;
      seen.add(name);
      opts.push({ label: name, value: name, type: "contact" });
    };
    sampleContacts.forEach(c => {
      if (normalizeCompany(c.company) === normalizeCompany(company)) add(c.name);
    });
    contacts.forEach(c => {
      const comp = contactCompanyMap.get(normalizeContact(c));
      if (comp && normalizeCompany(comp) === normalizeCompany(company)) add(c);
    });
    return opts;
  };

  const resolveCompanyTypeForName = (companyName) => {
    if (!companyName) return "";
    const match = Object.entries(data.additionalCompanies || {}).find(([, entry]) => normalizeCompany(entry?.company) === normalizeCompany(companyName));
    if (match) return match[0];
    const sample = sampleContacts.find(c => normalizeCompany(c.company) === normalizeCompany(companyName));
    if (sample?.companyType) return sample.companyType;
    return autoTypeForCompany(companyName);
  };

  const addContactToCompany = (type, contactName, companyName) => {
    const name = (contactName || "").trim();
    if (!name) return;
    if (!companyName) {
      setToast("Company required for contact.");
      return;
    }
    const mappedCompany = contactCompanyMap.get(normalizeContact(name)) ||
      sampleContacts.find(c => normalizeContact(c.name) === normalizeContact(name))?.company;
    if (mappedCompany && normalizeCompany(mappedCompany) !== normalizeCompany(companyName)) {
      setToast("This contact belongs to a different company.");
      return;
    }
    setData(prev => {
      const entries = { ...(prev.additionalCompanies || {}) };
      const entry = syncCompanyEntryPlaceholders(entries[type] || { contact: "", company: companyName, contacts: [] });
      const list = entry.contacts && entry.contacts.length
        ? entry.contacts
        : (entry.contact ? [{ name: entry.contact, inactive: false, placeholder: null }] : []);
      if (list.find(c => normalizeContact(c.name) === normalizeContact(name))) return prev;
      const next = [...list, { name, inactive: false, placeholder: null }];
      entries[type] = syncCompanyEntryPlaceholders({
        ...entry,
        company: companyName,
        contacts: next,
        contact: entry.contact || next[0]?.name || "",
        contactPlaceholder: null
      });
      return { ...prev, additionalCompanies: entries };
    });
    registerContactCompany(name, companyName);
    triggerAutoFlash(`company-${type}`);
    openRoleAssignmentPrompt({
      source: "quick-add-contact",
      company: companyName,
      contact: name
    });
  };

  const getSalesRepForContact = (name) => {
    const found = sampleContacts.find(c => normalizeContact(c.name) === normalizeContact(name));
    return found?.salesRep || "";
  };

  const getTitleForContact = (name) => {
    const found = sampleContacts.find(c => normalizeContact(c.name) === normalizeContact(name));
    return found?.title || "";
  };

  const updateCompanyCapability = useCallback((companyName, rowIndex, field, value) => {
    setSampleContacts(prev => {
      const normalized = normalizeSampleContacts(prev);
      const fallbackCompany = normalized[rowIndex]?.company || "";
      const targetCompany = normalizeCompany(companyName || fallbackCompany);
      if (!targetCompany) {
        return normalized.map((row, idx) => idx === rowIndex ? { ...row, [field]: value } : row);
      }
      return normalized.map(row =>
        normalizeCompany(row.company || "") === targetCompany ? { ...row, [field]: value } : row
      );
    });
  }, []);

  const addPlaceholderCompanyType = (type) => {
    if (!type) return;
    setData(prev => {
      const types = new Set(prev.additionalCompanyTypes || []);
      types.add(type);
      const existing = prev.additionalCompanies?.[type];
      return {
        ...prev,
        additionalCompanyTypes: Array.from(types),
        additionalCompanies: {
          ...(prev.additionalCompanies || {}),
          [type]: syncCompanyEntryPlaceholders(
            existing || {
              contact: "",
              company: "",
              placeholder: createPlaceholderFlag("company", `${type} pending`),
              contactPlaceholder: companyTypeRequiresContact(type)
                ? createPlaceholderFlag("contact", `${type} contact pending`)
                : null
            }
          )
        }
      };
    });
    setCompanyEdit(prev => ({ ...prev, [type]: true }));
  };

  const toggleCompanyRoleNeeded = (role) => {
    if (!role?.type) return;
    const entry = data.additionalCompanies?.[role.type];
    const sourceCompany = role.source ? (data[role.source] || "") : "";
    const hasCompany = !!(sourceCompany || entry?.company);
    if (hasCompany) return;
    if (entry && !entry.company) {
      setData(prev => {
        const nextTypes = (prev.additionalCompanyTypes || []).filter(t => t !== role.type);
        const nextCompanies = { ...(prev.additionalCompanies || {}) };
        delete nextCompanies[role.type];
        return { ...prev, additionalCompanyTypes: nextTypes, additionalCompanies: nextCompanies };
      });
      return;
    }
    addPlaceholderCompanyType(role.type);
  };

  const openCompanyRolePicker = (role) => {
    if (!role?.type) return;
    // If contact exists, open edit modal; otherwise open add modal
    const contacts = entryContactList(role);
    const firstContact = contacts[0];
    if (firstContact?.name) {
      setEditContactModal({
        isOpen: true,
        companyName: role.companyName || "",
        contactName: firstContact.name || "",
        contactTitle: getTitleForContact(firstContact.name) || "",
        contactEmail: "",
        contactPhone: "",
      });
    } else {
      setAddCompanyType(role.type);
      setShowTypePicker(false);
      setAddCompanyModalOpen(true);
      setCompaniesSubOpen(true);
      setTimeout(() => addCompanyInputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    if (!data.referrer && !data.referringCompany) return;
    if (!data.referringCompany) return;
    registerContactCompany(data.referrer, data.referringCompany);
    const inferredType = autoTypeForCompany(data.referringCompany);
    upsertAdditionalCompany(inferredType, { contact: data.referrer || "", company: data.referringCompany || "" });
  }, [data.referrer, data.referringCompany]);

  useEffect(() => {
    if (!data.additionalCompanies?.["Referring Company"]) return;
    const legacyEntry = data.additionalCompanies["Referring Company"];
    const inferredType = autoTypeForCompany(legacyEntry.company || data.referringCompany || "");
    if (!inferredType) return;
    setData(prev => {
      const nextTypes = new Set((prev.additionalCompanyTypes || []).filter(t => t !== "Referring Company"));
      nextTypes.add(inferredType);
      const nextCompanies = { ...(prev.additionalCompanies || {}) };
      delete nextCompanies["Referring Company"];
      const existing = nextCompanies[inferredType] || { contact: "", company: "" };
      nextCompanies[inferredType] = syncCompanyEntryPlaceholders({
        contact: legacyEntry.contact || existing.contact || "",
        company: legacyEntry.company || existing.company || ""
      });
      return { ...prev, additionalCompanyTypes: Array.from(nextTypes), additionalCompanies: nextCompanies };
    });
  }, [data.additionalCompanies, data.referringCompany]);

  useEffect(() => {
    const entries = data.additionalCompanies || {};
    const seen = new Map();
    let changed = false;
    const cleaned = { ...entries };
    Object.entries(entries).forEach(([type, entry]) => {
      const normalizedCurrent = syncCompanyEntryPlaceholders(cleaned[type] || entry);
      if (JSON.stringify(normalizedCurrent) !== JSON.stringify(cleaned[type] || entry)) {
        cleaned[type] = normalizedCurrent;
        changed = true;
      }
      const key = `${normalizedCurrent?.company ? normalizeCompany(normalizedCurrent.company) : ""}`;
      if (!key) return;
      if (seen.has(key)) {
        const keepType = seen.get(key);
        const keepEntry = syncCompanyEntryPlaceholders(cleaned[keepType] || {});
        const keepContacts = keepEntry.contacts && keepEntry.contacts.length
          ? keepEntry.contacts
          : (keepEntry.contact ? [{ name: keepEntry.contact, inactive: false }] : []);
        const entryContacts = normalizedCurrent.contacts && normalizedCurrent.contacts.length
          ? normalizedCurrent.contacts
          : (normalizedCurrent.contact ? [{ name: normalizedCurrent.contact, inactive: false }] : []);
        const merged = [...keepContacts];
        entryContacts.forEach(c => {
          if (!c?.name) return;
          if (!merged.find(x => normalizeContact(x.name) === normalizeContact(c.name))) {
            merged.push({ name: c.name, inactive: !!c.inactive, placeholder: c.placeholder || null });
          }
        });
        cleaned[keepType] = syncCompanyEntryPlaceholders({
          ...keepEntry,
          ...normalizedCurrent,
          contacts: merged,
          contact: merged[0]?.name || keepEntry.contact || normalizedCurrent.contact || "",
          placeholder: keepEntry.placeholder || normalizedCurrent.placeholder || null,
          contactPlaceholder: keepEntry.contactPlaceholder || normalizedCurrent.contactPlaceholder || null
        });
        delete cleaned[type];
        changed = true;
        return;
      }
      seen.set(key, type);
    });
    if (changed) {
      const nextTypes = (data.additionalCompanyTypes || []).filter(t => cleaned[t]);
      setData(prev => ({ ...prev, additionalCompanies: cleaned, additionalCompanyTypes: nextTypes }));
    }
  }, [data.additionalCompanies]);

  const autoTypeForCompany = (company) => {
    // Prefer an explicit companyType on the matching sample row when one exists —
    // name inference can misclassify edge cases (e.g. "United Claims" matches the
    // "claims" rule, which is right for PAs but doesn't beat an explicit "Public Adjusting"
    // on the sample row when one is provided).
    const c = (company || "").trim();
    if (!c) return inferCompanyTypeFromName(company);
    const sampleMatch = sampleContacts.find(
      (row) => normalizeCompany(row.company || "") === normalizeCompany(c) && !!row.companyType,
    );
    if (sampleMatch?.companyType) return sampleMatch.companyType;
    return inferCompanyTypeFromName(company);
  };

  // Returns true when the company was applied, false when the user canceled the
  // duplicate-firm warning. Callers gate follow-up prompts (role assignment, flash)
  // on the return value so canceling truly cancels.
  const upsertAdditionalCompany = (type, entry) => {
    const nextType = type || autoTypeForCompany(entry?.company || "");
    const incoming = entry || {};
    const incomingCompany = (incoming.company || "").trim();
    const existingForType = (data.additionalCompanies || {})[nextType];
    if (existingForType?.company && incomingCompany && normalizeCompany(existingForType.company) !== normalizeCompany(incomingCompany)) {
      const ok = window.confirm(
        `Another active ${nextType.toLowerCase()} firm — "${existingForType.company}" — is already on this order.\n\n` +
        `Cancel to keep it (and mark it inactive separately before switching). Click OK only if you mean to replace it now with "${incomingCompany}".`
      );
      if (!ok) return false;
    }
    setData(prev => {
      const types = new Set(prev.additionalCompanyTypes || []);
      const entries = { ...(prev.additionalCompanies || {}) };
      const incomingEntry = syncCompanyEntryPlaceholders(entry || {});
      const incomingContacts = entryContactList(incomingEntry);
      const keyContact = incomingEntry.contact ? normalizeContact(incomingEntry.contact) : "";
      const keyCompany = incomingEntry.company ? normalizeCompany(incomingEntry.company) : "";
      const existingType = Object.entries(entries).find(([t, e]) => {
        const existingContacts = entryContactList(e || {});
        const sameContact = keyContact && e?.contact && normalizeContact(e.contact) === keyContact;
        const sameContactInList = incomingContacts.some(incoming =>
          existingContacts.some(existing => normalizeContact(existing?.name || "") === normalizeContact(incoming?.name || ""))
        );
        const sameCompany = keyCompany && e?.company && normalizeCompany(e.company) === keyCompany;
        return sameContact || sameContactInList || sameCompany;
      })?.[0];
      const targetType = existingType || nextType;
      // If user confirmed a different-company replacement, clear the old contacts so the new
      // company gets a fresh contact slot (otherwise the old contact stays attached to the new company).
      if (!existingType && targetType === nextType && existingForType?.company && normalizeCompany(existingForType.company) !== normalizeCompany(incomingCompany)) {
        entries[targetType] = { ...(entries[targetType] || {}), contacts: [], contact: "" };
      }
      if (existingType && existingType !== targetType) {
        delete entries[existingType];
        types.delete(existingType);
      }
      const existingEntry = syncCompanyEntryPlaceholders(entries[targetType] || {});
      const existingContacts = entryContactList(existingEntry);
      const mergedContacts = [...existingContacts];
      incomingContacts.forEach(c => {
        if (!c?.name) return;
        if (!mergedContacts.find(x => normalizeContact(x.name) === normalizeContact(c.name))) {
          mergedContacts.push({ name: c.name, inactive: !!c.inactive, placeholder: c.placeholder || null });
        }
      });
      types.add(targetType);
      entries[targetType] = syncCompanyEntryPlaceholders({
        ...(existingEntry || {}),
        ...incomingEntry,
        contacts: mergedContacts,
        contact: mergedContacts.find(c => hasMeaningfulValue(c?.name))?.name || incomingEntry.contact || existingEntry.contact || "",
        placeholder: hasMeaningfulValue(incomingEntry.company) ? null : (incomingEntry.placeholder || existingEntry.placeholder || null),
        contactPlaceholder: mergedContacts.some(c => hasMeaningfulValue(c?.name))
          ? null
          : (
              companyTypeRequiresContact(targetType)
                ? (incomingEntry.contactPlaceholder || existingEntry.contactPlaceholder || createPlaceholderFlag("contact", `${targetType} contact pending`))
                : null
            )
      });
      setCompanyEdit(prev => ({ ...prev, [targetType]: false }));
      return { ...prev, additionalCompanyTypes: Array.from(types), additionalCompanies: entries };
    });
    return true;
  };

  useEffect(() => {
    const refCompany = (data.referringCompany || "").toLowerCase();
    if (refCompany.includes("servpro of anytown")) {
      if (!data.salesRep) {
        update("salesRep", "Josh Cintron, Sales Rep");
      }
    }
  }, [data.referringCompany, data.salesRep, update]);

  useEffect(() => {
    const refName = (data.referrer || "").toLowerCase();
    if (refName.includes("servpro of anytown")) {
      if (!data.salesRep) {
        update("salesRep", "Josh Cintron, Sales Rep");
      }
    }
  }, [data.referrer, data.salesRep, update]);

  useEffect(() => {
    if (!data.referrer) return;
    const rep = getSalesRepForContact(data.referrer);
    if (rep && (!data.salesRep || data.salesRep === "Sales Rep")) {
      update("salesRep", rep);
    }
  }, [data.referrer, data.salesRep, sampleContacts]);

  const handleAdditionalContactChange = (type, contact) => {
    const suggested = contactCompanyMap.get(normalizeContact(contact));
    setData(prev => ({
      ...prev,
      additionalCompanies: {
        ...(prev.additionalCompanies || {}),
        [type]: syncCompanyEntryPlaceholders({
          ...(prev.additionalCompanies?.[type] || { contact: "", company: "" }),
          contact,
          company: (prev.additionalCompanies?.[type]?.company || suggested || ""),
          contactPlaceholder: hasMeaningfulValue(contact)
            ? null
            : (
                companyTypeRequiresContact(type)
                  ? (prev.additionalCompanies?.[type]?.contactPlaceholder || createPlaceholderFlag("contact", `${type} contact pending`))
                  : null
              )
        })
      }
    }));
    // roles are handled via chips; no special type handling
  };

  const handleBillingContactChange = (value) => {
    const raw = (value || "").trim();
    const parsed = parseCombinedContact(raw);
    const contact = parsed.contact || (companySet.has(raw) ? "" : raw);
    const mappedCompany = contact ? (contactCompanyMap.get(normalizeContact(contact)) || "") : "";
    const resolvedCompany = parsed.company || mappedCompany || data.billingCompany || "";

    if (contact && !resolvedCompany) {
      setToast("Select or add a company before adding a contact.");
      return;
    }

    setData(prev => ({
      ...prev,
      billingContact: contact,
      billingCompany: contact
        ? (resolvedCompany || prev.billingCompany || "")
        : (parsed.company || prev.billingCompany || "")
    }));

    if (contact && resolvedCompany) {
      registerContactCompany(contact, resolvedCompany);
      openRoleAssignmentPrompt({
        source: "billing-contact",
        company: resolvedCompany,
        contact,
        skipRoles: ["billto"]
      });
    }
  };

  const handleInsuranceCompanyChange = (value) => {
    const company = (value || "").toString().trim();
    const linkedCarrier = resolveLinkedNationalCarrierName(company, sampleContacts);
    if (company) {
      setCompanies((prev) => Array.from(new Set([...prev, company])));
    }
    setData((prev) => {
      const companyChanged = normalizeCompany(prev.insuranceCompany || "") !== normalizeCompany(company);
      return {
        ...prev,
        insuranceCompany: company,
        insuranceClaim: company ? "Yes" : prev.insuranceClaim,
        involvesInsurance: company && !isNonRestorationProject ? "Yes" : prev.involvesInsurance,
        nationalCarrier: linkedCarrier ? linkedCarrier : (companyChanged ? "" : prev.nationalCarrier || ""),
        nationalCarrierRequested: linkedCarrier ? false : (companyChanged ? false : !!prev.nationalCarrierRequested),
      };
    });
  };

  const requestNationalCarrierLink = () => {
    if (!data.insuranceCompany) return;
    update("nationalCarrierRequested", true);
    setToast(`Request noted: add ${data.insuranceCompany} to the national carrier list.`);
  };

  const handleAdjusterContactChange = (value) => {
    const raw = (value || "").trim();
    const parsed = parseCombinedContact(raw);
    const contact = parsed.contact || (companySet.has(raw) ? "" : raw);
    const mappedCompany = contact ? (contactCompanyMap.get(normalizeContact(contact)) || "") : "";
    const resolvedCompany = parsed.company || mappedCompany || data.insuranceCompany || data.adjusterCompany || "";

    if (contact && !resolvedCompany) {
      setToast("Select or add a company before adding a contact.");
      return;
    }

    setData(prev => ({
      ...prev,
      insuranceAdjuster: contact,
      adjusterCompany: contact
        ? (resolvedCompany || prev.adjusterCompany || "")
        : (parsed.company || prev.adjusterCompany || ""),
      insuranceCompany: prev.insuranceCompany || parsed.company || resolvedCompany || ""
    }));

    if (contact && resolvedCompany) {
      registerContactCompany(contact, resolvedCompany);
      openRoleAssignmentPrompt({
        source: "insurance-contact",
        company: resolvedCompany,
        contact,
        preferredRoles: ["insurance"],
        forceRoles: ["insurance"]
      });
    }
  };
  const resolveInsuranceCarrierFromContact = useCallback((contactName = "") => {
    const normalized = normalizeContact(contactName || "");
    if (!normalized) return "";
    const mappedCompany = contactCompanyMap.get(normalized) || "";
    return isInsuranceCarrierCompany(mappedCompany, sampleContacts) ? mappedCompany : "";
  }, [contactCompanyMap, sampleContacts]);

  useEffect(() => {
    let didCollapse = false;
    (data.orderTypes || []).forEach(type => {
      const d = (data.lossDetails || {})[type];
      const hasCauses = d?.causes?.length > 0;
      const hasOrigins = d?.origins?.length > 0;
      const touchedThisType = lastLossDetailTouched?.type === type && (Date.now() - lastLossDetailTouched?.ts) < 4000;
      const shouldCollapse = hasOrigins && touchedThisType && (!CAUSES[type] || !CAUSES[type].length || hasCauses);
      if (shouldCollapse && !minimizedLossTypes[type] && !manualEditLossTypes[type]) {
        didCollapse = true;
        setMinimizedLossTypes(p => ({ ...p, [type]: true }));
      }
    });
    if (didCollapse && !autoScrollDone) {
      setAutoScrollDone(true);
      setTimeout(() => {
        const el = document.getElementById("sec1-interview");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [data.lossDetails, data.orderTypes, minimizedLossTypes, autoScrollDone, lastLossDetailTouched, manualEditLossTypes]);

  const projectType = useMemo(
    () => projectTypeFromOrderTypes(data.orderTypes || []),
    [data.orderTypes]
  );
  const isNonRestorationProject = projectType === "Non-Restoration Project";
  const isRestorationProject = projectType === "Restoration Project";

  useEffect(() => {
    setData((prev) => {
      const currentTypes = prev.orderTypes || [];
      const nextTypes = normalizeOrderTypes(currentTypes);
      const nextProjectType = projectTypeFromOrderTypes(nextTypes);
      const patch = {};

      if (!stringListMatches(nextTypes, currentTypes)) patch.orderTypes = nextTypes;
      if ((prev.restorationType || "") !== nextProjectType) patch.restorationType = nextProjectType;

      if (nextProjectType === "Non-Restoration Project") {
        patch.involvesInsurance = "No";
        patch.payorQuick = prev.payorQuick === "Insurance" ? "" : prev.payorQuick;
        patch.insuranceClaim = "No";
        patch.insuranceCompany = "";
        patch.insuranceAdjuster = "";
        patch.claimNumber = "";
        patch.dateOfLoss = "";
      }

      if (!Object.keys(patch).length) return prev;
      return { ...prev, ...patch };
    });
  }, [data.orderTypes]);

  useEffect(() => {
    if (!isNonRestorationProject) {
      lastNonRestorationToastRef.current = "";
      return;
    }
    if (lastNonRestorationToastRef.current === projectType) return;
    lastNonRestorationToastRef.current = projectType;
    // Only show this toast when the user explicitly changes order type, not during interview actions
    if (!interviewPanelOpen) setToast("Insurance Company and National Carrier not Required");
  }, [isNonRestorationProject, projectType, interviewPanelOpen]);

  useEffect(() => {
    if (isNonRestorationProject) return;
    const inferredBillingCarrier =
      isInsuranceCarrierCompany(data.billingCompany || "", sampleContacts)
        ? data.billingCompany || ""
        : resolveInsuranceCarrierFromContact(data.billingContact || "");
    const inferredInsuranceCarrier =
      isInsuranceCarrierCompany(data.insuranceCompany || "", sampleContacts)
        ? data.insuranceCompany || ""
        : resolveInsuranceCarrierFromContact(data.insuranceAdjuster || "");
    const primaryCarrier = inferredInsuranceCarrier || inferredBillingCarrier;
    if (!primaryCarrier) return;
    const linkedCarrier = resolveLinkedNationalCarrierName(primaryCarrier, sampleContacts);
    setData((prev) => {
      const patch = {};
      if (!prev.billingCompany && inferredBillingCarrier) patch.billingCompany = inferredBillingCarrier;
      if (!prev.insuranceCompany && primaryCarrier) patch.insuranceCompany = primaryCarrier;
      if (!prev.adjusterCompany && inferredInsuranceCarrier && prev.insuranceAdjuster) {
        patch.adjusterCompany = inferredInsuranceCarrier;
      }
      if (prev.insuranceClaim !== "Yes") patch.insuranceClaim = "Yes";
      if (prev.involvesInsurance !== "Yes") patch.involvesInsurance = "Yes";
      if (!prev.billingPayer && inferredBillingCarrier) patch.billingPayer = "Insurance";
      if (linkedCarrier && prev.nationalCarrier !== linkedCarrier) {
        patch.nationalCarrier = linkedCarrier;
        patch.nationalCarrierRequested = false;
      }
      return Object.keys(patch).length ? { ...prev, ...patch } : prev;
    });
  }, [
    data.billingCompany,
    data.billingContact,
    data.insuranceCompany,
    data.insuranceAdjuster,
    isNonRestorationProject,
    sampleContacts,
    resolveInsuranceCarrierFromContact,
  ]);

  useEffect(() => {
    if (isNonRestorationProject) return;
    const linkedCarrier = resolveLinkedNationalCarrierName(data.insuranceCompany || "", sampleContacts);
    if (!linkedCarrier) return;
    setData((prev) => {
      if (prev.nationalCarrier === linkedCarrier && !prev.nationalCarrierRequested) return prev;
      return {
        ...prev,
        nationalCarrier: linkedCarrier,
        nationalCarrierRequested: false,
      };
    });
  }, [data.insuranceCompany, isNonRestorationProject, sampleContacts]);

  useEffect(() => {
    const previousCompany = previousInsuranceCompanyRef.current || "";
    const currentCompany = data.insuranceCompany || "";
    const companyChanged =
      normalizeCompany(previousCompany) !== normalizeCompany(currentCompany);
    previousInsuranceCompanyRef.current = currentCompany;
    if (!companyChanged || isNonRestorationProject) return;
    const linkedCarrier = resolveLinkedNationalCarrierName(currentCompany, sampleContacts);
    if (linkedCarrier) return;
    setData((prev) => {
      if (!prev.nationalCarrier && !prev.nationalCarrierRequested) return prev;
      return {
        ...prev,
        nationalCarrier: "",
        nationalCarrierRequested: false,
      };
    });
  }, [data.insuranceCompany, isNonRestorationProject, sampleContacts]);

  useEffect(() => {
    if (data.contactMethod !== "TPA Assignment") {
      tpaAssignmentPromptedRef.current = false;
      return;
    }
    setData((prev) => {
      const types = new Set(prev.additionalCompanyTypes || []);
      const existing = syncCompanyEntryPlaceholders(
        prev.additionalCompanies?.["TPA"] || {
          contact: prev.tpaContact || "",
          company: prev.tpaCompany || "",
          placeholder: createPlaceholderFlag("company", "TPA company expected"),
          contactPlaceholder: null,
        }
      );
      const nextEntry = syncCompanyEntryPlaceholders({
        ...existing,
        company: prev.tpaCompany || existing.company || "",
        contact: prev.tpaContact || existing.contact || "",
      });
      nextEntry.contactPlaceholder = null;
      const changed =
        !types.has("TPA") ||
        JSON.stringify(existing) !== JSON.stringify(nextEntry);
      if (!changed) return prev;
      types.add("TPA");
      return {
        ...prev,
        additionalCompanyTypes: Array.from(types),
        additionalCompanies: {
          ...(prev.additionalCompanies || {}),
          TPA: nextEntry,
        },
      };
    });
    if (!tpaAssignmentPromptedRef.current) {
      tpaAssignmentPromptedRef.current = true;
      setCompaniesSubOpen(true);
      setToast("TPA Assignment selected. Add the TPA company.");
    }
  }, [data.contactMethod, data.tpaCompany, data.tpaContact]);

  useEffect(() => {
    const hasMold = (data.orderTypes || []).includes("Mold");
    const hasPPE = (data.handlingCodes || []).includes("PPE");
    if (hasMold && !hasPPE) {
      setData(prev => ({ ...prev, handlingCodes: [...(prev.handlingCodes || []), "PPE"] }));
    } else if (!hasMold && hasPPE) {
      setData(prev => ({ ...prev, handlingCodes: (prev.handlingCodes || []).filter(c => c !== "PPE") }));
    }
  }, [data.orderTypes, data.handlingCodes]);

  const prevMoldCoverageRef = useRef(data.moldCoverageConfirm);
  const prevRentCoverageRef = useRef(data.rentCoverageLimit);

  useEffect(() => {
    if (data.moldCoverageConfirm && (!data.moldLimit || data.moldLimit === prevMoldCoverageRef.current)) {
      setData(prev => ({ ...prev, moldLimit: data.moldCoverageConfirm }));
    }
    prevMoldCoverageRef.current = data.moldCoverageConfirm;
  }, [data.moldCoverageConfirm, data.moldLimit]);

  useEffect(() => {
    if (data.rentCoverageLimit && (!data.contentsCoverageLimit || data.contentsCoverageLimit === prevRentCoverageRef.current)) {
      setData(prev => ({ ...prev, contentsCoverageLimit: data.rentCoverageLimit }));
    }
    prevRentCoverageRef.current = data.rentCoverageLimit;
  }, [data.rentCoverageLimit, data.contentsCoverageLimit]);

  const quickQuestionsComplete =
    hasPrimaryOrderTypeDecision(data.orderTypes || []) &&
    hasRequiredNonRestorationSubtype(data.orderTypes || []) &&
    (!isRestorationProject || !!data.involvesInsurance) &&
    (data.involvesInsurance !== "Yes" || !!data.payorQuick);

  useEffect(() => {
    if (quickQuestionsComplete) setQuickQuestionsCollapsed(true);
  }, [quickQuestionsComplete]);

  const suggestWet = (data.orderTypes || []).includes("Water") && data.damageWasWet !== 'Y';
  const suggestStorage = (data.structuralElectricDamage === 'Y' || data.processType === "Long-Term Storage") && data.storageNeeded !== 'Y';
  const suggestStorageMonths = data.storageNeeded === 'Y' && !data.storageMonths;
  const suggestQ1 = data.useDryCleaner === "Yes" && data.qualityCode !== "Q1";

  const companyRolesFor = (entry) => {
    const roles = [];
    const addRole = (id, title) => {
      if (!roles.find(r => r.id === id)) roles.push({ id, title });
    };
    const company = entry?.company || "";
    const contacts = entry?.contacts && entry.contacts.length
      ? entry.contacts
      : (entry?.contact ? [{ name: entry.contact }] : []);
    const contactNames = contacts.map(c => c.name);
    const isReferrerContact = !!data.referrer && contactNames.includes(data.referrer);
    const isBillToContact = !!data.billingContact && contactNames.includes(data.billingContact);
    const isInsuranceContact = !!data.insuranceAdjuster && contactNames.includes(data.insuranceAdjuster);
    const isReferrerCompany = !data.referrer && !!data.referringCompany && data.referringCompany === company;
    const isBillToCompany = !data.billingContact && !!data.billingCompany && data.billingCompany === company;
    const isInsuranceCompany = !data.insuranceAdjuster && !!data.insuranceCompany && data.insuranceCompany === company;
    const isLinkedNationalCarrierCompany =
      !!data.nationalCarrier &&
      !!company &&
      (
        normalizeCompany(data.insuranceCompany || "") === normalizeCompany(company) ||
        (!data.insuranceCompany && normalizeCompany(data.billingCompany || "") === normalizeCompany(company))
      );
    if (isReferrerContact) addRole("referrer", "Referrer");
    if (isInsuranceContact) addRole("insurance", "Insurance");
    if (isBillToContact) addRole("billto", "Bill To");
    if (isReferrerCompany) addRole("referrer", "Referrer");
    if (isInsuranceCompany) addRole("insurance", "Insurance");
    if (isBillToCompany) addRole("billto", "Bill To");
    if (isLinkedNationalCarrierCompany) addRole("national", "National Carrier");
    return roles;
  };

  const getRolesForContact = (company, contact) => {
    const roles = [];
    const isReferrer = !!data.referrer && contact && data.referrer === contact;
    const isBillTo = !!data.billingContact && contact && data.billingContact === contact;
    const isInsurance = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;
    if (isReferrer) roles.push({ id: "referrer", title: "Referrer" });
    if (isInsurance) roles.push({ id: "insurance", title: "Insurance" });
    if (isBillTo) roles.push({ id: "billto", title: "Bill To" });
    return roles;
  };

  const getRoleOptionsForContact = (company, contact) => {
    const isReferrer = !!data.referrer && contact && data.referrer === contact;
    const isBillTo = !!data.billingContact && contact && data.billingContact === contact;
    const isInsurance = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;
    const refAssigned = !!data.referringCompany || !!data.referrer;
    const insuranceAssigned = !!data.insuranceCompany || !!data.insuranceAdjuster;
    const billAssigned = !!data.billingCompany || !!data.billingContact;
    const insuranceEligible = isRoleEligibleForCompany("insurance", company);
    const options = [];
    if (!refAssigned || isReferrer) options.push({ id: "referrer", label: "Referrer", active: isReferrer });
    if (isInsurance || (!insuranceAssigned && insuranceEligible)) options.push({ id: "insurance", label: "Insurance", active: isInsurance });
    if (!billAssigned || isBillTo) options.push({ id: "billto", label: "Bill To", active: isBillTo });
    return options;
  };

  const toggleRoleForContact = (company, contact, id) => {
    if (!company && !contact) return;
    const patch = {};
    const refActive = (!!data.referrer && contact && data.referrer === contact) || (!data.referrer && !!data.referringCompany && data.referringCompany === company);
    const insuranceActive = (!!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact) || (!data.insuranceAdjuster && !!data.insuranceCompany && data.insuranceCompany === company);
    const billActive = (!!data.billingContact && contact && data.billingContact === contact) || (!data.billingContact && !!data.billingCompany && data.billingCompany === company);

    if (id === "referrer") {
      if (refActive) {
        if (company && data.referringCompany === company) patch.referringCompany = "";
        if (contact && data.referrer === contact) patch.referrer = "";
      } else {
        if (company) patch.referringCompany = company;
        if (contact) patch.referrer = contact;
      }
    }
    if (id === "billto") {
      if (billActive) {
        if (company && data.billingCompany === company) patch.billingCompany = "";
        if (contact && data.billingContact === contact) patch.billingContact = "";
      } else {
        if (company) patch.billingCompany = company;
        if (contact) patch.billingContact = contact;
      }
    }
    if (id === "poc") {
      flagContactAsPoc(company || "", contact || "", "Order POC");
      return;
    }
    if (id === "insurance") {
      const companyTypeHint = normalizeCompanyType(getCompanyTypeForRoles(company || ""));
      if (companyTypeHint.includes("public adjust")) {
        setToast("Public Adjuster contacts cannot be assigned the Insurance role.");
        return;
      }
      if (!insuranceActive && !isRoleEligibleForCompany("insurance", company)) {
        setToast("Insurance role is not eligible for this company type.");
        return;
      }
      if (insuranceActive) {
        if (company && data.insuranceCompany === company) patch.insuranceCompany = "";
        if (contact && data.insuranceAdjuster === contact) patch.insuranceAdjuster = "";
      } else {
        if (data.insuranceCompany && company && normalizeCompany(data.insuranceCompany) !== normalizeCompany(company)) {
          if (!window.confirm(`This order already has "${data.insuranceCompany}" as the insurance company. Are you sure you want to change it to "${company}"? Multiple insurance companies on one order is rare but possible.`)) {
            return;
          }
        }
        if (company) patch.insuranceCompany = company;
        if (contact) patch.insuranceAdjuster = contact;
        patch.insuranceClaim = "Yes";
        patch.involvesInsurance = "Yes";
        if (!data.billingPayer) patch.billingPayer = "Insurance";
      }
    }
    updateMany(patch);
  };

  const [activeSection, setActiveSection] = useState("sec1");
  const activeSectionId = useMemo(() => {
      if (activeSection) return activeSection;
      if(openSections.sec5) return 'sec5'; if(openSections.sec4) return 'sec4'; if(openSections.sec3) return 'sec3'; if(openSections.sec2) return 'sec2'; return 'sec1'; 
  }, [openSections, activeSection]);

  const handleEntryModeSelect = (mode) => {
    setEntryMode(mode);
    if (mode === "quick") {
      setData(prev => ({ ...prev, isLead: true, eventAssignee: prev.eventAssignee || prev.currentUser || "" }));
      if (!quickNudgeShownRef.current) {
        quickNudgeShownRef.current = true;
        setTimeout(() => {
          setToast("Tip: Capture all the details in Event Instructions. Switch to Detailed anytime for the full workflow.");
          setModeButtonFlash(true);
          setTimeout(() => setModeButtonFlash(false), 3000);
        }, 3000);
      }
    }
    if (mode === "scope") {
      setData(prev => ({ ...prev, isLead: null, eventAssignee: prev.eventAssignee || prev.currentUser || "" }));
      setEntryMode("detailed");
      setTimeout(() => setShowScope(true), 200);
      return;
    }
    if (mode === "detailed") {
      setData(prev => ({ ...prev, isLead: null, eventAssignee: prev.eventAssignee || prev.currentUser || "" }));
    }
    if (mode === "sds-preview") {
      setEntryMode("detailed");
      setData(prev => ({ ...prev, isLead: null, eventAssignee: prev.eventAssignee || prev.currentUser || "" }));
      setTimeout(() => setShowSdsPreview(true), 100);
    }
  };

  if (entryMode === 'start') return <div data-noe-mode="start" data-noe-app="new-order-entry"><StartScreen onSelect={handleEntryModeSelect} /></div>;
  if (entryMode === 'same-day-scope') {
    const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0] || {};
    const addressLabel = [primaryAddr.street, primaryAddr.city, primaryAddr.state].filter(Boolean).join(", ");
    return (
      <ScopeBoundary onBack={() => setEntryMode('detailed')}>
      <SameDayScope
        onExit={() => setEntryMode('start')}
        onNavigateToNoe={() => setEntryMode('detailed')}
        onNavigateToSds={() => { setEntryMode('detailed'); setTimeout(() => setShowSdsPreview(true), 100); }}
        eventInstructions={data.eventInstructions || ""}
        onEventInstructionsChange={(val) => update("eventInstructions", val)}
        serviceOfferings={data.serviceOfferings || []}
        onServiceOfferingsChange={(list) => update("serviceOfferings", list)}
        suggestedGroups={data.suggestedGroups || []}
        onSuggestedGroupsChange={setSuggestedGroupsAndSync}
        scopeBridge={scopeBridgeState}
        onScopeBridgeChange={applyScopeBridge}
        lossSeverity={data.lossSeverity}
        onLossSeverityChange={updateLossSeverity}
        orderTypes={data.orderTypes || []}
        lossDetails={data.lossDetails || {}}
        severityCodes={data.severityCodes || []}
        orderName={data.orderName || ""}
        claimNumber={data.claimNumber || ""}
        insuranceCompany={data.insuranceCompany || ""}
        insuranceAdjuster={data.insuranceAdjuster || ""}
        dateOfLoss={data.dateOfLoss || ""}
        addressLabel={addressLabel}
        customers={data.customers || []}
        familyMedicalIssues={data.familyMedicalIssues}
        soapFragAllergies={data.soapFragAllergies}
        sdsConsiderations={data.sdsConsiderations || []}
        sdsObservations={data.sdsObservations || []}
        sdsServices={data.sdsServices || []}
        onSdsServicesChange={(list) => update("sdsServices", list)}
        sdsRooms={data.sdsRooms || []}
        onSdsRoomsChange={(list) => update("sdsRooms", list)}
        sdsProjectFloors={data.sdsProjectFloors || []}
        onSdsProjectFloorsChange={(list) => update("sdsProjectFloors", list)}
        sdsApartmentType={data.sdsApartmentType || ""}
        onSdsApartmentTypeChange={(value) => update("sdsApartmentType", value)}
        sdsPrebagged={data.sdsPrebagged || ""}
        onSdsPrebaggedChange={(value) => update("sdsPrebagged", value)}
        sdsInitialInstructions={data.sdsInitialInstructions || []}
        onSdsInitialInstructionsChange={(list) => update("sdsInitialInstructions", list)}
        sdsInstructionAgreement={data.sdsInstructionAgreement}
        onSdsInstructionAgreementChange={(value) => update("sdsInstructionAgreement", value)}
        sdsDisagreementNote={data.sdsDisagreementNote}
        onSdsDisagreementNoteChange={(value) => update("sdsDisagreementNote", value)}
      />
      </ScopeBoundary>
    );
  }

  return (
    <React.Fragment>
        <GlobalSearch show={showSearch} onClose={()=>setShowSearch(false)} onNavigate={handleSearchNavigate} onSearchHit={handleSearchHit} />

        <Header 
            activeSection={activeSectionId} 
            visitedSections={visitedSections} 
            completedSections={completedSections}
            onJump={jumpToSection} 
            onJumpSub={jumpToSectionAndSubsection}
            title={entryMode === 'quick' ? (data.orderName || 'Quick Entry') : (data.orderName || 'New Order')} 
            version="v55"
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            showInlineHelp={showCoaching}
            setShowInlineHelp={setShowInlineHelp}
            showCoaching={showCoaching}
            setShowCoaching={setShowCoaching}
            compactMode={compactMode}
            onShowSds={() => setShowSdsQuestionnaire(true)}
            setCompactMode={setCompactMode}
            onReset={handleReset}
            currentUser={data.currentUser}
            setCurrentUser={(v)=>update("currentUser", v)}
            setShowSampleDataModal={setShowSampleDataModal}
            onOpenPresets={() => setShowPresetModal(true)}
            onOpenFieldConfig={() => setShowFieldConfig(true)}
            onShowScopeWizard={() => setShowScope(true)}
            interviewPanelOpen={interviewPanelOpen}
            actionItemsOpen={actionItemsOpen}
            presetCount={testPresets.length}
        />

        {/* V2 Scope Wizard — renders above all content, outside entry mode blocks */}
        {showScope && (
          <ScopeWizard
            onClose={() => setShowScope(false)}
            orderData={data as any}
            onOrderUpdate={(updates) => updateMany(updates)}
            onShowOrder={() => { setShowScope(false); setEntryMode('detailed'); }}
            onShowSds={() => { setShowScope(false); setTimeout(() => { setShowSdsQuestionnaire(true); (window as any).__returnToScope = true; }, 300); }}
            showCoaching={showCoaching}
            onToggleCoaching={() => setShowCoaching(v => !v)}
          />
        )}

        <div ref={appContentRef} data-noe-mode={entryMode} data-noe-app="new-order-entry" data-noe-scroll className={`min-h-screen pb-32 font-sans fade-in scale-in ${compactMode ? 'compact-mode' : ''} ${entryMode === 'detailed' ? 'pt-28' : 'pt-24'} ${selectedBridgePickupStep === "hold" ? "bg-rose-50/40 border-t-4 border-rose-400" : "bg-slate-50"}`} style={(interviewPanelOpen || actionItemsOpen) ? { marginRight: '480px', transition: 'margin-right 0.2s ease' } : { transition: 'margin-right 0.2s ease' }}>
            
            <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none" />

            <div className="mx-auto max-w-6xl px-2 sm:px-4 relative"> 
              
              {entryMode === 'detailed' ? (
                <>
                  {/* Scope Status banner and Contact-instructions inline alert removed — blockers
                      live in the Action Items panel and Save Summary; saved contact guidance is
                      visible directly in the contact area. */}
                  <div className={compactMode ? "space-y-3" : "space-y-4"}>

                    <Section
                      id="sec1"
                      noeSection="order"
                      title={`1. ${recordWord}`}
                      helpText="Enter job basics + call details (source, scope/needs, internal codes if known)."
                      isOpen={openSections.sec1}
                      onHeaderClick={()=>handleToggleSection('sec1')}
                      onCaretClick={()=>handleToggleSection('sec1')}
                      badges={
                        <div className="flex items-center gap-2">
                          {recordTypeLabel !== "Select Type" && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">{recordTypeLabel}</span>}
                          {data.primaryLossType && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{data.primaryLossType}</span>}
                          {codeSummary && codeSummary !== "None" && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{codeSummary}</span>}
                        </div>
                      }
                      compact={compactMode}
                      className={auditOn && auditTargets.sections.has("sec1") ? "audit-outline" : ""}
                    >
                        <div className={`grid ${compactMode ? 'gap-3' : 'gap-5'}`}>
                            <SubSection id="sec1-order" title={recordWord} open={orderSubOpen} onToggle={(nextOpen) => setOrderSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("order") ? "audit-outline" : ""}>
                                <Field label={<span>{recordWord} Name <span className="font-normal text-slate-400 text-xs ml-1">(Auto-generated)</span></span>} missing={data.highlightMissing?.orderName}>
                                  <div className="flex gap-2">
                                      <Input
                                        ref={orderNameInputRef}
                                        data-audit-key="orderName"
                                        className={`${auditOn && data.highlightMissing?.orderName ? "audit-missing" : ""} ${data.orderNameLocked ? "bg-slate-100 text-slate-500" : ""}`}
                                        value={data.orderName}
                                        onChange={e=>updateMany({ orderName: e.target.value, orderNameAuto: !e.target.value.trim() })}
                                        readOnly={!!data.orderNameLocked}
                                        aria-readonly={!!data.orderNameLocked}
                                        placeholder="e.g. Smith-BloomingdaleNJ"
                                      />
                                      <button className={`rounded-lg border px-3 text-xs font-bold transition-all ${data.orderNameLocked?"bg-slate-800 text-white":"bg-white hover:bg-slate-50"}`} onClick={()=>updateMany({ orderNameLocked: !data.orderNameLocked, orderNameAuto: data.orderNameLocked ? data.orderNameAuto : false })}>{data.orderNameLocked?"LOCKED":"LOCK"}</button>
                                  </div>
                                </Field>
                                {showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("field.orderName")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <Field label="Record Type">
                                    <ToggleGroup options={[
                                      { label: "Order", title: "Active project with confirmed billing." },
                                      { label: "Lead", title: "Potential project; incomplete information or no billing yet." }
                                    ]} value={data.isLead === true ? "Lead" : data.isLead === false ? "Order" : ""} onChange={v => update("isLead", v === "Lead")} />
                                  </Field>
                                  <Field label={`${recordWord} Status`}>
                                    <ToggleGroup options={ORDER_STATUSES} value={data.orderStatus} onChange={v => update("orderStatus", v)} />
                                  </Field>
                                </div>
                                <Field label="What caused the loss?" missing={data.highlightMissing.orderTypes} smart>
                                  {showCoaching && !data.primaryLossType && !dismissedTips.has("Loss Type") && (
                                    <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700 mb-2">
                                      <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismissTip("Loss Type"); e.target.parentElement.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>
                                      🎓 <span className="font-bold">Loss Type:</span> {coaching("field.lossType")}
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-2" data-audit-key="orderTypes">
                                      {[NON_RESTORATION_PRIMARY, ...LOSS_TYPES].map(ot=> (
                                          <ToggleMulti
                                            key={ot}
                                            label={ot}
                                            title={LOSS_TYPE_COACHING[ot] || "Type of peril/damage involved."}
                                            checked={data.primaryLossType === ot || (ot === NON_RESTORATION_PRIMARY && isNonRestorationProject)}
                                            onChange={() => {
                                              if (ot === NON_RESTORATION_PRIMARY) {
                                                toggleNonRestorationPrimary();
                                                updateMany({ primaryLossType: NON_RESTORATION_PRIMARY });
                                                return;
                                              }
                                              const newPrimary = data.primaryLossType === ot ? "" : ot;
                                              const newOrderTypes = newPrimary ? [newPrimary, ...(data.secondaryContaminants || []).filter(s => s !== newPrimary)] : [...(data.secondaryContaminants || [])];
                                              updateMany({ primaryLossType: newPrimary, orderTypes: newOrderTypes });
                                            }}
                                            className={ot === "Water" && attentionWater && data.primaryLossType !== "Water" && !(data.secondaryContaminants||[]).includes("Water") ? "attention-fill" : ot === "Mold" && attentionMold && data.primaryLossType !== "Mold" && !(data.secondaryContaminants||[]).includes("Mold") ? "attention-fill" : ""}
                                          />
                                      ))}
                                  </div>
                                </Field>
                                {showCoaching && data.primaryLossType && !isNonRestorationProject && (
                                  <>
                                    <div className="text-[11px] text-slate-400">Primary: <span className="font-semibold text-slate-600">{data.primaryLossType}</span>. Select additional contaminants below if applicable.</div>
                                    {LOSS_TYPE_COACHING[data.primaryLossType] && (
                                      <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">{data.primaryLossType}:</span> {LOSS_TYPE_COACHING[data.primaryLossType]}
                                      </div>
                                    )}
                                  </>
                                )}
                                {isNonRestorationProject && (
                                  <Field label="Non-Restoration Type" missing={data.highlightMissing.nonRestorationSubtype}>
                                    <div className="flex flex-wrap gap-2" data-audit-key="nonRestorationSubtype">
                                      {NON_RESTORATION_SUBTYPES.map((subtype) => (
                                        <ToggleMulti
                                          key={subtype}
                                          label={subtype}
                                          title="Required for non-restoration orders."
                                          checked={getNonRestorationSubtype(data.orderTypes || []) === subtype}
                                          onChange={() => selectNonRestorationSubtype(subtype)}
                                        />
                                      ))}
                                    </div>
                                  </Field>
                                )}
                                {data.primaryLossType && !isNonRestorationProject && (
                                  <Field label="Additional contaminants?">
                                    <div className="flex flex-wrap gap-2">
                                      {LOSS_TYPES.filter(t => t !== data.primaryLossType).map(t => (
                                        <ToggleMulti
                                          key={t}
                                          label={t}
                                          checked={(data.secondaryContaminants || []).includes(t)}
                                          onChange={() => {
                                            const next = (data.secondaryContaminants || []).includes(t)
                                              ? (data.secondaryContaminants || []).filter(s => s !== t)
                                              : [...(data.secondaryContaminants || []), t];
                                            updateMany({ secondaryContaminants: next, orderTypes: [data.primaryLossType, ...next] });
                                          }}
                                          className={t === "Water" && attentionWater && !(data.secondaryContaminants||[]).includes("Water") ? "attention-fill" : t === "Mold" && attentionMold && !(data.secondaryContaminants||[]).includes("Mold") ? "attention-fill" : ""}
                                        />
                                      ))}
                                    </div>
                                    {showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("field.contaminants")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                  </Field>
                                )}
                                {attentionWater && !(data.orderTypes||[]).includes("Water") && !dismissedTips.has("Water Suggestion") && (
                                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">Water Suggestion:</span> Still Wet was selected — consider adding Water as a contaminant.
                                  </div>
                                )}
                                {attentionWater && (data.orderTypes||[]).includes("Water") && !dismissedTips.has("Water Confirmed") && (
                                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">Water Confirmed:</span> Review severity in Codes section below.
                                  </div>
                                )}
                                {attentionMold && !(data.orderTypes||[]).includes("Mold") && !dismissedTips.has("Mold Suggestion") && (
                                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismissTip("Mold Suggestion"); e.currentTarget.parentElement.style.display = 'none'; }} className="float-right ml-2 px-1 text-amber-400 hover:text-amber-600 font-bold text-sm" title="Dismiss">×</button><span className="font-bold">Suggested:</span> "Visible Mold" was selected in Interview → Conditions. Should Mold be added as a loss type?
                                  </div>
                                )}
                                {attentionMold && (data.orderTypes||[]).includes("Mold") && (data.autoAddedOrderTypes || []).includes("Mold") && !dismissedTips.has("Mold Auto") && (
                                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismissTip("Mold Auto"); e.currentTarget.parentElement.style.display = 'none'; }} className="float-right ml-2 px-1 text-amber-400 hover:text-amber-600 font-bold text-sm" title="Dismiss">×</button><span className="font-bold">Auto-suggested:</span> Mold was added because "Visible Mold" was selected in conditions. <button type="button" onClick={(e) => { e.stopPropagation(); updateMany({ orderTypes: (data.orderTypes || []).filter(t => t !== "Mold"), autoAddedOrderTypes: (data.autoAddedOrderTypes || []).filter(t => t !== "Mold"), primaryLossType: data.primaryLossType === "Mold" ? (data.orderTypes || []).find(t => t !== "Mold") || "" : data.primaryLossType }); dismissTip("Mold Auto"); setToast("Mold suggestion removed"); }} className="underline underline-offset-2 font-bold text-amber-900 hover:text-amber-950">Remove Mold</button> or review <button type="button" onClick={(e) => { e.stopPropagation(); jumpToSectionAndSubsection("sec4", "insurance"); }} className="underline underline-offset-2 font-bold text-amber-900 hover:text-amber-950">coverage limit</button>.
                                  </div>
                                )}
                                {attentionMold && (data.orderTypes||[]).includes("Mold") && !(data.autoAddedOrderTypes || []).includes("Mold") && !dismissedTips.has("Mold Confirmed") && (
                                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); dismissTip("Mold Confirmed"); e.currentTarget.parentElement.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss">×</button>🎓 <span className="font-bold">Mold Confirmed:</span> Review severity and <button type="button" onClick={(e) => { e.stopPropagation(); jumpToSectionAndSubsection("sec4", "insurance"); }} className="underline underline-offset-2 font-bold text-violet-800 hover:text-violet-900">Mold coverage limit in Insurance</button>.
                                  </div>
                                )}
                                {(data.orderTypes || []).filter(t => LOSS_TYPES.includes(t)).map(type => {
                                    const details = (data.lossDetails || {})[type] || { causes: [], origins: [] };
                                    const isMinimized = minimizedLossTypes[type];
                                    const hasCauses = CAUSES[type] && CAUSES[type].length > 0;
                                    const hasOrigins = true;
                                    const severityGroup = type === "Dust/Debris" ? "Dust" : type;
                                    const hasSeverity = SEVERITY_GROUPS.includes(severityGroup);
                                    const severityLetterMap = { Fire: "F", Water: "W", Mold: "M", Dust: "D", Protein: "P", Oil: "O" };
                                    const severityCode = (data.severityCodes || []).find(c => c.startsWith(severityGroup + "-"));
                                    const severityShort = severityCode ? `${severityLetterMap[severityGroup] || ""}${severityCode.split("-")[1]}` : "";
                                    const needsSeverityCode = hasSeverity && !isNonRestorationProject && expectedSeverityGroups.has(severityGroup) && !severityCode;
                                    const attentionForSeverity = (severityGroup === "Water" && attentionWater) || (severityGroup === "Mold" && attentionMold) || needsSeverityCode;
                                    return (
                                        <div key={type} className="animate-purple-section-fade rounded-xl border border-sky-100 bg-sky-50/30 overflow-hidden transition-all shadow-sm">
                                            <button type="button" className="flex w-full items-center justify-between px-4 py-3 bg-sky-50/50 hover:bg-sky-100/50 transition-colors text-left" onClick={() => { toggleMinimizeLoss(type); if (isMinimized) setManualEditLossTypes(p => ({ ...p, [type]: true })); }}>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-sky-700">{type} Details</span>
                                                  {severityShort && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">{severityShort}</span>}
                                                  {isMinimized && (
                                                    <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                                                      ({getLossSummary(type)})
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="text-xs font-bold text-sky-500">{isMinimized ? "Show" : "Minimize"}</div>
                                            </button>
                                            {!isMinimized && (
                                                <div className="p-4 grid gap-4 border-t border-sky-100 bg-white">
                                                    {hasSeverity && !isNonRestorationProject && (
                                                        <Field label="Severity" subtle>
                                                            {showCoaching && !(data.severityCodes || []).length && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-1 flex items-start gap-1"><span className="flex-1">{coaching("field.severity")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                                            <div className={`rounded-lg ${needsSeverityCode ? "border border-orange-200 bg-orange-50/60 p-2" : ""}`}>
                                                              <div className="flex gap-2" data-audit-key={`severity-${severityGroup.toLowerCase()}`}>{SEVERITY_LEVELS.map(level => { const code = `${severityGroup}-${level}`; const isActive = (data.severityCodes || []).includes(code); return (<button key={level} onClick={() => toggleSeverity(code)} className={`h-9 w-9 rounded-lg text-sm font-bold transition-all border ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : needsSeverityCode ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-200'} ${attentionForSeverity && !needsSeverityCode ? 'attention-outline' : ''}`}>{level}</button>); })}</div>
                                                              {needsSeverityCode && (
                                                                <div className="mt-1 text-[11px] font-semibold text-orange-700">
                                                                  Expected: select a {severityGroup} severity code.
                                                                </div>
                                                              )}
                                                            </div>
                                                        </Field>
                                                    )}
                                                    {hasCauses && (<Field label={`${type} Cause`} subtle><div className="flex flex-wrap gap-2">{CAUSES[type].map(c => {
                                                      const isWarning = c.endsWith("⚠");
                                                      const label = isWarning ? c.replace("⚠", "") : c;
                                                      const causeKey = c;
                                                      const isSelected = (details.causes || []).includes(causeKey);
                                                      return (<ToggleMulti key={c} label={label} checked={isSelected} onChange={() => updateLossDetail(type, 'causes', causeKey)} className={isWarning && isSelected ? "!border-rose-400 !bg-rose-50 !text-rose-700" : isWarning ? "!border-amber-300 !text-amber-700" : ""} title={isWarning ? "Coverage verification required — confirm with adjuster" : ""} />);
                                                    })}</div>
                                                    {(details.causes || []).some(c => c.endsWith("⚠")) && (
                                                      <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-700 font-semibold">
                                                        ⚠ Coverage verification required — some water losses are excluded or capped with a low limit. Always verify coverage for groundwater, flood, and sump pump failure with the adjuster before proceeding.
                                                      </div>
                                                    )}
                                                    </Field>)}
                                                    {hasOrigins && (<Field label="Origin" subtle><div className="flex flex-wrap gap-2">{ORIGINS.map(o => (<ToggleMulti key={o} label={o} checked={(details.origins || []).includes(o)} onChange={() => updateLossDetail(type, 'origins', o)} />))}</div></Field>)}
                                                    {type === "Mold" && (
                                                      <div className="rounded-lg border border-orange-300 bg-orange-50 p-3">
                                                        <div className="text-sm font-bold text-orange-800 mb-2">Mold Coverage Available for our Project:</div>
                                                        <Input
                                                          data-audit-key="moldCoverageConfirm"
                                                          className={auditOn && data.highlightMissing?.moldCoverageConfirm ? "audit-missing" : ""}
                                                          value={data.moldCoverageConfirm || ""}
                                                          onKeyDown={(e) => e.stopPropagation()}
                                                          onChange={e=>update("moldCoverageConfirm", formatCurrencyInput(e.target.value))}
                                                          placeholder="$0.00"
                                                          inputMode="decimal"
                                                        />
                                                      </div>
                                                    )}
                                                    <div className="flex justify-end">
                                                      <button onClick={() => { setMinimizedLossTypes(p => ({ ...p, [type]: true })); setManualEditLossTypes(p => ({ ...p, [type]: false })); }} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-600">Done</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <Field label="Service Offerings">
                                  <div className="flex flex-wrap gap-2">
                                    {SERVICE_OFFERINGS.map(s => {
                                      const isOn = (data.serviceOfferings||[]).includes(s);
                                      const hasSubs = !!SERVICE_SUB_CATEGORIES[s];
                                      const subs = (data.serviceSubCategories || []).filter(x => x.startsWith(`${s}: `)).map(x => x.replace(`${s}: `, ""));
                                      const subLabel = isOn && subs.length > 0 ? ` (${subs.join(", ")})` : "";
                                      return (
                                        <ToggleMulti key={s} label={`${s}${subLabel}`} title={SERVICE_OFFERING_HELP[s] || "Services to be performed on this project."} checked={isOn} onChange={() => {
                                          if (!isOn) {
                                            update("serviceOfferings", toggleMulti(data.serviceOfferings||[], s));
                                            if (hasSubs) setExpandedService(s);
                                          } else if (hasSubs && expandedService !== s) {
                                            setExpandedService(s);
                                          } else {
                                            update("serviceOfferings", toggleMulti(data.serviceOfferings||[], s));
                                            const cleaned = (data.serviceSubCategories || []).filter(x => !x.startsWith(`${s}: `));
                                            update("serviceSubCategories", cleaned);
                                            if (expandedService === s) setExpandedService(null);
                                          }
                                        }} />
                                      );
                                    })}
                                  </div>
                                  {/* Collapsible subcategory panel for the expanded service */}
                                  {expandedService && SERVICE_SUB_CATEGORIES[expandedService] && (data.serviceOfferings || []).includes(expandedService) && (
                                    <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50/50 p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">{expandedService} Details</div>
                                        <button onClick={() => setExpandedService(null)} className="text-[9px] font-bold text-slate-400 hover:text-slate-600">Done</button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {SERVICE_SUB_CATEGORIES[expandedService].map(sub => {
                                          const subKey = `${expandedService}: ${sub}`;
                                          const selected = (data.serviceSubCategories || []).includes(subKey);
                                          return <ToggleMulti key={sub} label={sub} checked={selected} onChange={() => update("serviceSubCategories", toggleMulti(data.serviceSubCategories || [], subKey))} className="" />;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </Field>
                            </SubSection>

                            <SubSection id="sec1-source" title="Source" open={sourceSubOpen} onToggle={(nextOpen) => setSourceSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("source") ? "audit-outline" : ""}>
                            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showCoaching} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={applyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={openCrmModal} onPromptRoleAssignment={openRoleAssignmentPrompt} orderPoc={orderPoc} flagContactAsPoc={flagContactAsPoc} />
                            {data.salesRep && (
                              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 px-3 py-2 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Route all customer contact via this sales rep (order-wide)</div>
                                  <div className="text-[11px] text-amber-700/80">When on, every customer on this order shows phone/email struck-through with a "Contact via Sales Rep" note.</div>
                                </div>
                                <button type="button" onClick={() => update("useSalesRepOnly", !(data as any).useSalesRepOnly)} className={`shrink-0 rounded-full border-2 px-3 py-1 text-[11px] font-bold transition-all ${(data as any).useSalesRepOnly ? "border-amber-500 bg-amber-100 text-amber-800" : "border-amber-300 bg-white text-amber-700 hover:bg-amber-50"}`}>{(data as any).useSalesRepOnly ? "On ✓" : "Off"}</button>
                              </div>
                            )}
                            </SubSection>

                            {/* Interview moved to slide-out panel — accessible from floating pill */}
                            <button
                              type="button"
                              onClick={() => setInterviewPanelOpen(true)}
                              className="w-full rounded-xl border border-violet-200 bg-violet-50/30 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-violet-700">Interview</span>
                                  {(() => {
                                    const answered = [data.damageWasWet, data.damageMoldMildew, data.livingStatus, data.repairsSummary, (data.packoutSummary||[]).length > 0, data.familyMedicalIssues, data.soapFragAllergies, data.selfCleaning, data.useDryCleaner, data.howDryLaundry, data.storageNeeded, (data.rushInterests||[]).length > 0, (data.upcomingEvents||[]).length > 0, (data.sdsConsiderations||[]).length > 0, (data.household||[]).some((m:any) => m.category === "pet"), (data.loadList||[]).length > 0].filter(Boolean).length;
                                    return <span className="text-[10px] text-violet-500">{answered} of 16</span>;
                                  })()}
                                </div>
                                <span className="text-xs font-bold text-violet-600">Open →</span>
                              </div>
                              {(data.livingStatus || data.repairsSummary || (data.packoutSummary||[]).length > 0) && (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {data.livingStatus && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{data.livingStatus}</span>}
                                  {data.repairsSummary && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{data.repairsSummary.split(", ")[0]}</span>}
                                  {(data.packoutSummary||[]).length > 0 && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{(data.packoutSummary||[]).length} items</span>}
                                </div>
                              )}
                            </button>

                            {/* Interview content moved to slide-out panel */}

                            {/* Dead interview code removed */}
                            {/* Codes — hidden during intake, shown post-inspection */}
                            {["Pickup Complete","Tagging Complete","Ready to Bill"].includes(data.orderStatus) && (
                            <SubSection id="sec1-codes-panel" title="Codes" open={codesSubOpen} onToggle={(nextOpen) => { const next = !!nextOpen; setCodesSubOpen(next); if(next) setOpenCodes(true); }} compact={compactMode}>
                                <div id="sec1-codes">
                                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-sky-300">
                                      <button className="flex w-full justify-between bg-slate-50/50 px-4 py-3 text-left transition-colors hover:bg-slate-50" onClick={()=>setOpenCodes(!openCodes)}>
                                          <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">HANDLING CODES (Order-level)</span></div>
                                          <div className="flex items-center gap-2">{!openCodes && codeSummary !== "None" && <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 fade-in">{codeSummary}</span>}<Chevron open={openCodes} /></div>
                                      </button>
                                      {openCodes && (
                                          <div className="p-4 grid gap-6 bg-white border-t border-slate-100 fade-in">
                                            {!isNonRestorationProject && (
                                              <div>
                                                <div className="mb-2 text-xs font-bold text-slate-400">SEVERITY</div>
                                                {showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-1 flex items-start gap-1"><span className="flex-1">{coaching("field.rejectScale")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{SEVERITY_GROUPS.map(type => {
                                                  const hasGroupCode = (data.severityCodes || []).some(c => c.startsWith(`${type}-`));
                                                  const expectsGroupCode = expectedSeverityGroups.has(type);
                                                  const needsExpectedCode = expectsGroupCode && !hasGroupCode;
                                                  const needsAttention = (type === "Water" && attentionWater) || (type === "Mold" && attentionMold) || needsExpectedCode;
                                                  return (
                                                    <div key={type} data-audit-key={`severity-${type.toLowerCase()}`} className={`rounded-lg border p-2 ${needsExpectedCode ? "border-orange-300 bg-orange-50/60" : "border-slate-200"} ${needsAttention && !needsExpectedCode ? "attention-outline" : ""}`}>
                                                      <div className="mb-1.5 flex items-center justify-between">
                                                        <div className="text-xs font-bold text-slate-600">{type}</div>
                                                        {needsExpectedCode ? <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Suggested — {type} selected as order type</span> : null}
                                                      </div>
                                                      <div className="flex gap-1">
                                                        {SEVERITY_LEVELS.map(level => { const code = `${type}-${level}`; const isActive = (data.severityCodes || []).includes(code); return (<button key={level} onClick={() => toggleSeverity(code)} className={`flex-1 rounded py-1 text-xs font-bold transition-all ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : needsExpectedCode ? 'bg-orange-50 border border-orange-300 text-orange-700 hover:bg-orange-100' : 'bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200'} ${needsAttention && !needsExpectedCode ? "attention-outline" : ""}`}>{level}</button>); })}
                                                      </div>
                                                    </div>
                                                  );
                                                })}</div>
                                              </div>
                                            )}
                                            {/* Drill-down severity sliders */}
                                            {(data.primaryLossType || (data.orderTypes||[]).some(t => ["Fire","Water","Puffback"].includes(t))) && (
                                              <div>
                                                <div className="mb-2 text-xs font-bold text-slate-400">DETAILED SEVERITY</div>
                                                {showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-3 flex items-start gap-1"><span className="flex-1">{coaching("field.contaminantLevels")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                  {[
                                                    { key: "fire", label: "Fire", fields: ["Heat", "Soot", "Odor", "Extinguisher Powder", "Remediation Debris"], colorStart: "#fef3c7", colorEnd: "#f97316" },
                                                    { key: "water", label: "Water", fields: ["Water", "Humidity", "Musty Smell", "Visible Mildew", "Visible Mold", "Sprinkler Chemical", "Flood Cut Debris"], colorStart: "#dbeafe", colorEnd: "#3b82f6" },
                                                    { key: "puffback", label: "Puffback", fields: ["Oil", "Soot", "Odor", "Oily Film"], colorStart: "#f3e8ff", colorEnd: "#7c3aed" },
                                                  ].filter(section => {
                                                    const types = data.orderTypes || [];
                                                    if (section.key === "fire") return types.includes("Fire") || data.primaryLossType === "Fire";
                                                    if (section.key === "water") return types.includes("Water") || data.primaryLossType === "Water" || (data.secondaryContaminants||[]).includes("Water");
                                                    if (section.key === "puffback") return types.includes("Puffback") || data.primaryLossType === "Puffback" || (data.secondaryContaminants||[]).includes("Puffback");
                                                    return false;
                                                  }).map(section => {
                                                    const sectionData = (data.lossSeverity || {})[section.key] || { values: {} };
                                                    return (
                                                      <div key={section.key} className="rounded-lg border border-slate-200 p-3">
                                                        <div className="text-xs font-bold text-slate-600 mb-2">{section.label} Contaminants</div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                          <span className="w-28 shrink-0" />
                                                          <div className="flex-1 flex justify-between text-[9px] text-slate-400 font-bold px-1">
                                                            <span>0 None</span><span>1 Low</span><span>2 Moderate</span><span>3 Severe</span>
                                                          </div>
                                                          <span className="w-4" />
                                                        </div>
                                                        <div className="space-y-2">
                                                          {section.fields.map(field => {
                                                            const val = (sectionData.values || {})[field] || 0;
                                                            return (
                                                              <div key={field} className="flex items-center gap-3">
                                                                <span className="text-[11px] text-slate-600 w-28 shrink-0">{field}</span>
                                                                <input
                                                                  type="range" min="0" max="3" step="1" value={val}
                                                                  onChange={e => {
                                                                    const next = { ...(data.lossSeverity || initLossSeverity()) };
                                                                    next[section.key] = { ...next[section.key], enabled: true, values: { ...(next[section.key]?.values || {}), [field]: Number(e.target.value) } };
                                                                    next.touched = true;
                                                                    update("lossSeverity", next);
                                                                  }}
                                                                  className="flex-1 h-1 rounded-full appearance-none outline-none"
                                                                  style={{ background: `linear-gradient(to right, ${section.colorStart}, ${val > 0 ? section.colorEnd : '#e5e7eb'} ${(val/3)*100}%, #e5e7eb ${(val/3)*100}%)` }}
                                                                />
                                                                <span className="text-[10px] font-bold text-slate-500 w-4 text-right">{val}</span>
                                                              </div>
                                                            );
                                                          })}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <div className={suggestQ1 ? "suggested-field rounded-lg p-2" : ""}>
                                              <div className="mb-2 text-xs font-bold text-slate-400">QUALITY</div>
                                              {showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-1 flex items-start gap-1"><span className="flex-1">{coaching("field.qualityCode")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                                              {suggestQ1 && <div className="mb-2 text-[10px] font-bold suggested-pill inline-flex rounded-full px-2 py-0.5">Suggested: Q1 — based on insurance carrier or premium service</div>}
                                              <div className="flex flex-wrap gap-2">{QUALITY_CODES.map(q => (<ToggleMulti key={q} label={q} checked={data.qualityCode === q} onChange={() => update("qualityCode", q)} />))}</div>
                                            </div>
                                            <div className="border-t border-slate-100 my-1"></div>
                                          <div><div className="mb-2 text-xs font-bold text-slate-400">HANDLING</div>{showCoaching && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mb-3 flex items-start gap-1"><span className="flex-1">{coaching("field.handlingCodes")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}<div className="flex flex-wrap gap-2">{HANDLING_META.map(([c, d]) => <ToggleMulti key={c} label={c} title={d} className={`${compactMode ? '!px-2 !py-1 !text-xs' : '!px-2.5 !py-1.5 !text-xs'}`} checked={data.handlingCodes.includes(c)} onChange={() => toggleHandling(c)} />)}</div></div>
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                  <div className="mb-1 text-xs font-bold text-slate-400">ORDER INSTRUCTIONS</div>
                                                  <div className="text-xs text-slate-500">
                                                    Add order-only instructions here. Company and contact instructions still flow in automatically from section 4.
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={openAddOrderInstructionModal}
                                                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                                >
                                                  + Custom
                                                </button>
                                              </div>
                                              {orderLevelInstructions.length ? (
                                                <div className="mt-4 space-y-2">
                                                  {orderLevelInstructions.map((entry) => (
                                                    <div
                                                      key={`codes-order-instruction-${getInstructionIdentity(entry)}`}
                                                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
                                                    >
                                                      <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                                          {entry.type}
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-700">{entry.text}</span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <button
                                                          type="button"
                                                          onClick={() => openEditOrderInstructionModal(entry)}
                                                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                                        >
                                                          Edit
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => removeOrderInstruction(entry)}
                                                          className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[11px] font-bold text-rose-700 hover:border-rose-300"
                                                        >
                                                          Remove
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
                                                  No order-level instructions selected yet.
                                                </div>
                                              )}
                                              <div className="mt-4 border-t border-slate-200 pt-4">
                                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Add Examples</div>
                                                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                                  {Object.entries(ORDER_INSTRUCTION_PRESETS).map(([type, items]) => (
                                                    <div key={`order-instruction-preset-${type}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{type}</div>
                                                      <div className="mt-2 flex flex-wrap gap-2">
                                                        {items.map((item) => {
                                                          const selected = orderInstructionSelectionSet.has(getInstructionTypeTextKey(type, item));
                                                          return (
                                                            <button
                                                              key={`order-instruction-preset-${type}-${item}`}
                                                              type="button"
                                                              onClick={() => toggleOrderInstructionPreset(type, item)}
                                                              className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
                                                                selected
                                                                  ? "border-slate-400 bg-slate-100 text-slate-800"
                                                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                                                              }`}
                                                            >
                                                              {item}
                                                            </button>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                      )}
                                  </div>
                                </div>
                            </SubSection>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec1')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec1')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec1')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                    </Section>

                    <Section id="sec2" noeSection="customer" title="2. Customer" helpText="The primary person(s) we are performing work for and their contacts or representatives." isOpen={openSections.sec2} onHeaderClick={()=>handleToggleSection('sec2')} onCaretClick={()=>handleToggleSection('sec2')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec2") ? "audit-outline" : ""}
                    >
                      <div className="space-y-4">
                        {data.customers.map((c,i)=><CustomerItem key={c.id} c={c} index={i} total={data.customers.length} updateCust={updateCust} onRemove={removeCust} highlightMissing={data.highlightMissing} auditOn={auditOn} onAddHousehold={addHouseholdMember} onSendWelcome={handleSendWelcome} contacts={contacts} sdsConsiderations={data.sdsConsiderations || []} householdAnimals={data.householdAnimals || ""} onUpdatePets={(animals, considerations) => { update("householdAnimals", animals); update("sdsConsiderations", considerations); }} household={data.household || []} orderPoc={orderPoc} onSetOrderPoc={setOrderPoc} salesRep={data.salesRep || ""} orderUseSalesRepOnly={!!(data as any).useSalesRepOnly} />)}
                        <div className="pt-2"><button onClick={addNewCustomer} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Customer</button></div>
                        {/* Household — people + pets at the household level */}
                        {(() => {
                          const petTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Snake", "Lizard", "Turtle", "Horse", "Other"];
                          const personTypes = ["Child", "Infant", "Elderly", "Housekeeper", "Caretaker", "Tenant", "Roommate", "Other"];
                          const members = data.household || [];
                          const people = members.filter(m => m.category === "person");
                          const pets = members.filter(m => m.category === "pet");

                          const setHousehold = (next) => {
                            update("household", next);
                            // Sync householdAnimals string for narrative/SDS compatibility
                            const petStr = next.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                            update("householdAnimals", petStr);
                            const sdsC = data.sdsConsiderations || [];
                            if (petStr && !sdsC.includes("Pets")) update("sdsConsiderations", [...sdsC, "Pets"]);
                            if (!petStr && sdsC.includes("Pets")) update("sdsConsiderations", sdsC.filter(s => s !== "Pets"));
                          };

                          const addMember = (category, type) => {
                            const newId = safeUid();
                            setHousehold([...members, { id: newId, category, type: type || (category === "pet" ? "Dog" : "Child"), name: "" }]);
                            setTimeout(() => {
                              const input = document.querySelector(`[data-household-id="${newId}"]`);
                              if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); input.focus(); }
                            }, 100);
                          };
                          const updateMember = (id, field, val) => {
                            setHousehold(members.map(m => m.id === id ? { ...m, [field]: val } : m));
                          };
                          const removeMember = (id) => {
                            setHousehold(members.filter(m => m.id !== id));
                          };
                          const promoteToCustomer = (member) => {
                            const nameParts = (member.name || "").trim().split(/\s+/);
                            const first = nameParts[0] || "";
                            const last = nameParts.slice(1).join(" ") || "";
                            setData(p => ({
                              ...p,
                              customers: [...p.customers, initCustomer({ first, last, type: member.type || "Household" })],
                              household: (p.household || []).filter(m => m.id !== member.id),
                            }));
                            setToast(`${member.name || "Member"} promoted to customer`);
                          };

                          const getPetIcon = (text) => {
                            const t = (text || "").toLowerCase();
                            if (/\bdog\b/.test(t)) return "🐕";
                            if (/\bcat\b/.test(t)) return "🐈";
                            if (/\bbird\b/.test(t)) return "🐦";
                            if (/\bfish\b/.test(t)) return "🐟";
                            if (/\brabbit\b/.test(t)) return "🐇";
                            if (/\bhamster\b/.test(t)) return "🐹";
                            if (/\bsnake|lizard|turtle\b/.test(t)) return "🐍";
                            if (/\bhorse\b/.test(t)) return "🐴";
                            return "🐕";
                          };
                          const getPersonIcon = (type) => {
                            const t = (type || "").toLowerCase();
                            if (/child|infant|baby/.test(t)) return "👶";
                            if (/elderly/.test(t)) return "🧓";
                            if (/housekeeper|caretaker/.test(t)) return "🏠";
                            return "👤";
                          };

                          return (
                            <div id="household-pets" className={`rounded-xl border bg-white shadow-sm ${householdEditOpen ? 'border-slate-200 px-4 py-3' : 'border-slate-100 px-4 py-2.5 cursor-pointer hover:border-slate-200 transition-colors'}`} data-noe-subsection="household" onClick={!householdEditOpen ? () => setHouseholdEditOpen(true) : undefined}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">🏠</span>
                                <span className="text-xs font-bold text-slate-700">Other Household Members</span>
                                <div className="flex-1" />
                                {householdEditOpen && (
                                  <>
                                    <Select value="" onClick={e => e.stopPropagation()} onChange={e => { if (e.target.value) addMember("person", e.target.value); }} className="!w-auto !text-xs !py-1.5 !text-sky-600 !border-sky-200 !bg-sky-50/50">
                                      <option value="">👤 + Person</option>
                                      {personTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                    <Select value="" onClick={e => e.stopPropagation()} onChange={e => { if (e.target.value) addMember("pet", e.target.value); }} className="!w-auto !text-xs !py-1.5 !text-sky-600 !border-sky-200 !bg-sky-50/50">
                                      <option value="">🐕 + Pet</option>
                                      {petTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 mb-1">Children, pets, and others at the home who aren't a contact on the order.</div>
                              {!householdEditOpen ? (
                                /* Compact read-only view */
                                members.length > 0 ? (
                                  <div className="flex items-center gap-2 flex-wrap mt-1">
                                    {members.map(m => {
                                      const icon = m.category === "pet" ? getPetIcon(m.type) : getPersonIcon(m.type);
                                      const label = m.name ? `${m.type} (${m.name.split(/\s+/)[0]})` : m.type;
                                      return <span key={m.id} className="text-xs text-slate-600">{icon} {label}</span>;
                                    })}
                                  </div>
                                ) : null
                              ) : (
                                /* Expanded edit view */
                                <>
                                  {members.length > 0 && (
                                    <div className="space-y-1">
                                      {people.length > 0 && (
                                        <>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">People ({people.length})</div>
                                          {people.map((m) => (
                                            <div key={m.id} className="flex items-center gap-1.5 h-8">
                                              <span className="text-sm shrink-0">{getPersonIcon(m.type)}</span>
                                              <span className="text-[11px] font-semibold text-slate-600 w-[72px] shrink-0 truncate">{m.type || "Person"}</span>
                                              <input data-household-id={m.id} value={m.name || ""} onChange={e => updateMember(m.id, "name", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (m.name?.trim()) setHouseholdEditOpen(false); } }} placeholder="Name" className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400" />
                                              <input value={m.age || ""} onChange={e => updateMember(m.id, "age", e.target.value)} placeholder="Age" className="w-12 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400 text-center" />
                                              {m.name && (
                                                <button type="button" onClick={() => promoteToCustomer(m)} className="text-[10px] font-bold text-sky-600 hover:text-sky-700 shrink-0 whitespace-nowrap" title="Promote to customer with contact details">Make Contact</button>
                                              )}
                                              <button type="button" onClick={() => removeMember(m.id)} className="text-slate-400 hover:text-rose-500 text-xs shrink-0" title="Remove">✕</button>
                                            </div>
                                          ))}
                                        </>
                                      )}
                                      {pets.length > 0 && (
                                        <>
                                          {people.length > 0 && <div className="border-t border-slate-100 my-0.5" />}
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pets ({pets.length})</div>
                                          {pets.map((m) => (
                                            <div key={m.id} className="flex items-center gap-1.5 h-8">
                                              <span className="text-sm shrink-0">{getPetIcon(m.type)}</span>
                                              <span className="text-[11px] font-semibold text-slate-600 w-[72px] shrink-0 truncate">{m.type || "Pet"}</span>
                                              <input data-household-id={m.id} value={m.name || ""} onChange={e => updateMember(m.id, "name", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (m.name?.trim()) setHouseholdEditOpen(false); } }} placeholder="Name, breed, notes" className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400" />
                                              <button type="button" onClick={() => removeMember(m.id)} className="text-slate-400 hover:text-rose-500 text-xs shrink-0" title="Remove">✕</button>
                                            </div>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-end pt-2 mt-2 border-t border-slate-100">
                                    <button type="button" onClick={() => setHouseholdEditOpen(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Done</button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec2')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec2')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec2')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                        {/* Interview link */}
                        <button type="button" onClick={() => setInterviewPanelOpen(true)} className={`w-full rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between transition-all ${interviewPanelOpen ? "border-indigo-400 bg-indigo-50" : "border-indigo-200 bg-indigo-50/30 hover:border-indigo-300"}`}>
                          <div>
                            <div className="text-sm font-bold text-violet-700">Customer Interview</div>
                            <div className="text-[11px] text-violet-500 mt-0.5">Living situation, delivery, packout, medical, pets, interests</div>
                          </div>
                          <span className="text-violet-400 text-lg">›</span>
                        </button>
                      </div>
                    </Section>

                    <Section id="sec3" noeSection="address" title="3. Address" helpText="Enter the job site + any related locations (temp housing, hotel, alt delivery)." isOpen={openSections.sec3} onHeaderClick={()=>handleToggleSection('sec3')} onCaretClick={()=>handleToggleSection('sec3')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec3") ? "audit-outline" : ""}
                    >
                      <div className="space-y-4">
                        {data.addresses.map((a,i)=><AddressItem key={a.id} addr={a} total={data.addresses.length} updateAddr={updateAddr} onRemove={removeAddr} index={i} highlightMissing={data.highlightMissing} auditOn={auditOn} onVerify={verifyAddressDemo} ToggleMulti={ToggleMulti} rentOrOwn={data.rentOrOwn} rentCoverageLimit={data.rentCoverageLimit} onRentOrOwnChange={(v)=>update("rentOrOwn", v)} onRentCoverageChange={(v)=>update("rentCoverageLimit", v)} forceShowCoords={i===0 ? showPrimaryCoords : false} autoOpenForTypePrompt={pendingAddressTypePromptId === a.id} autoFocusTypePrompt={pendingAddressTypePromptId === a.id} onTypePromptFocused={handleAddressTypePromptFocused} />)}
                        <div className="pt-2 space-y-2">
                          <button onClick={addNewAddress} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Address</button>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {["Hotel", "Temporary", "Rental", "Relative", "New Home", "Storage"].map(purpose => (
                              <button key={purpose} type="button" onClick={() => {
                                const id = safeUid();
                                setData(p => ({
                                  ...p,
                                  addresses: [...p.addresses, initAddress({
                                    id,
                                    isPrimary: false,
                                    isLossSite: false,
                                    type: purpose,
                                    placeholder: createPlaceholderFlag("address", `${purpose} — address needed`),
                                    name: `${purpose} Address`,
                                  })]
                                }));
                                setToast?.(`${purpose} address placeholder added`);
                              }} className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50">+ {purpose}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec3')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec3')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec3')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec4" noeSection="billing" title="4. Billing & Companies" helpText="Who pays + who is involved (billing, insurance, limits/approvals, all companies/contacts)." isOpen={openSections.sec4} onHeaderClick={()=>handleToggleSection('sec4')} onCaretClick={()=>handleToggleSection('sec4')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec4") ? "audit-outline" : ""}
                    >
                      <div className="grid gap-6">
                        <SubSection
                          id="sec4-companies"
                          title="Companies & Contacts"
                          open={companiesSubOpen}
                          onToggle={(nextOpen) => setCompaniesSubOpen(!!nextOpen)}
                          compact={compactMode}
                          className={auditOn && auditTargets.subsections.has("companies") ? "audit-outline" : ""}
                          action={
                            <button
                              onClick={() => setAddNewSystemModal({
                                firstName: "", lastName: "", title: "", phone: "", email: "",
                                companyName: "", companyType: "", companyPhone: "", companyWebsite: "", companyAddress: "",
                                isNewCompany: false, source: "detailed-companies",
                              })}
                              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 hover:border-sky-300 hover:text-sky-700"
                            >
                              + New to system
                            </button>
                          }
                        >
                          <div className="mb-4 space-y-3">
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <SearchSelect
                                value=""
                                onChange={v => {
                                  const parsed = parseCombinedContact(v);
                                  const type = autoTypeForCompany(parsed.company);
                                  addCompanyFromSearch(type, v);
                                  setToast(`Added ${parsed.contact ? parsed.contact + " at " : ""}${parsed.company || v}`);
                                }}
                                onQueryChange={() => {}}
                                options={combinedContactOptions}
                                placeholder="Search existing contacts and companies to add..."
                                clearOnCommit
                                maxResults={12}
                              />
                            </div>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {pendingCompanyRoleCount > 0 && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">
                                    {pendingCompanyRoleCount} placeholders
                                  </span>
                                )}
                                <button
                                  onClick={() => setCompanyRolesExpanded(v => !v)}
                                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                >
                                  {companyRolesExpanded ? "Hide additional vendors" : "Show additional vendors"}
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                              <div className="hidden md:grid grid-cols-12 bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-3">Company Type</div>
                                <div className="col-span-5">Company</div>
                                <div className="col-span-4">Contact</div>
                              </div>
                              <div className="divide-y">
                                {visibleCompanyRoles.flatMap(role => {
                                  const entryForBadges = role.entry || {
                                    company: role.companyName,
                                    contact: role.contactName,
                                    contacts: role.contactName ? [{ name: role.contactName }] : []
                                  };
                                  const contacts = role.contacts && role.contacts.length
                                    ? role.contacts
                                    : (role.contactName ? [{ name: role.contactName }] : []);
                                  const anyContactRoles = !!(getRolesForContact && contacts.some(c => (getRolesForContact(role.companyName, c.name) || []).length));
                                  const rows = contacts.length ? contacts : [{ name: "" }];
                                  return rows.map((c, idx) => (
                                    <div
                                      key={`${role.id}-${c.name || idx}`}
                                      data-audit-key={
                                        role.companyPlaceholder
                                          ? `placeholder-company-${normalizePlaceholderKeyPart(role.type || role.id)}`
                                          : (role.contactPlaceholder && idx === 0
                                            ? `placeholder-contact-${normalizePlaceholderKeyPart(role.type || role.id)}`
                                            : undefined)
                                      }
                                      className={`px-4 py-2 ${(role.pending || isPlaceholderFlagActive(c?.placeholder)) ? 'placeholder-shell rounded-lg my-1.5' : ''}`}
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleCompanyRoleNeeded(role)}
                                          className="md:col-span-3 text-left rounded-lg py-1 focus-visible:ring-2 focus-visible:ring-sky-200"
                                          title="Mark this company type as needed"
                                        >
                                          {idx === 0 && (
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-sky-700">{role.label}</span>
                                                {role.pending && (
                                                  <span className="text-[10px] font-bold uppercase tracking-wider placeholder-text">Placeholder</span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </button>
                                        <div
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => openCompanyRolePicker(role)}
                                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCompanyRolePicker(role); } }}
                                          className={`md:col-span-5 w-full text-left rounded-lg px-2 py-1 text-sm transition hover:bg-slate-50 cursor-pointer`}
                                          title="Edit company"
                                        >
                                          {idx === 0 && (
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center justify-between gap-3">
                                                <span className={`font-medium ${role.companyName ? 'text-slate-700' : 'placeholder-text'}`}>
                                                  {role.companyName || "Add company"}
                                                </span>
                                                <EditAffordance title="Edit company" />
                                              </div>
                                              {(() => {
                                                const contactRoles = c?.name && getRolesForContact ? getRolesForContact(role.companyName, c.name) : [];
                                                const companyBadges = companyRolesFor(entryForBadges);
                                                const roleBadges = anyContactRoles
                                                  ? companyBadges.filter((badge) => badge.id === "national")
                                                  : companyBadges;
                                                return roleBadges.length > 0 ? (
                                                  <div className="flex flex-wrap gap-1">
                                                  {roleBadges.map(r => (
                                                    toggleRoleForContact ? (
                                                      <button
                                                        key={`${role.id}-${r.title}`}
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleRoleForContact(role.companyName, "", r.id || r.title?.toLowerCase()); }}
                                                        className="rounded-full"
                                                        title="Click to toggle role"
                                                      >
                                                        <RoleBadge role={r} />
                                                      </button>
                                                    ) : (
                                                      <RoleBadge key={`${role.id}-${r.title}`} role={r} />
                                                    )
                                                  ))}
                                                </div>
                                              ) : null;
                                              })()}
                                            </div>
                                          )}
                                        </div>
                                        <div
                                          role="button"
                                          tabIndex={0}
                                          onClick={() => openCompanyRolePicker(role)}
                                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCompanyRolePicker(role); } }}
                                          className={`md:col-span-4 w-full text-left rounded-lg px-2 py-1 text-sm transition hover:bg-slate-50 cursor-pointer`}
                                          title="Edit contact"
                                        >
                                          {c?.name ? (
                                            <div className="flex flex-col">
                                              <div className="flex items-center justify-between gap-3">
                                                <span className={`font-medium ${isPlaceholderFlagActive(c?.placeholder) ? "placeholder-text" : "text-slate-700"}`}>{c.name}</span>
                                                <EditAffordance title="Edit contact" />
                                              </div>
                                              <span className="text-[11px] text-slate-500">{getTitleForContact(c.name) || "Contact"}</span>
                                              <div className="mt-1 flex flex-wrap gap-1 items-center">
                                                {getRolesForContact && getRolesForContact(role.companyName, c.name).map(r => (
                                                  toggleRoleForContact ? (
                                                    <button
                                                      key={`${role.id}-${c.name}-${r.title}`}
                                                      type="button"
                                                      onClick={(e) => { e.stopPropagation(); toggleRoleForContact(role.companyName, c.name, r.id || r.title?.toLowerCase()); }}
                                                      className="rounded-full"
                                                      title="Click to toggle role"
                                                    >
                                                      <RoleBadge role={r} />
                                                    </button>
                                                  ) : (
                                                    <RoleBadge key={`${role.id}-${c.name}-${r.title}`} role={r} />
                                                  )
                                                ))}
                                                {(() => {
                                                  const isThisPoc = isPocContact(role.companyName, c.name);
                                                  return (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isThisPoc) flagContactAsPoc("", "");
                                                        else flagContactAsPoc(role.companyName, c.name, role.type || "");
                                                      }}
                                                      title={isThisPoc ? "Clear as Order POC" : "Mark as Order POC (only one POC per order)"}
                                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${isThisPoc ? "border-violet-400 bg-violet-100 text-violet-800" : "border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-700"}`}
                                                    >
                                                      {isThisPoc ? "✓ POC" : "Mark POC"}
                                                    </button>
                                                  );
                                                })()}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between gap-3">
                                              <span className="placeholder-text">
                                                Add contact
                                              </span>
                                              <EditAffordance title="Add contact" />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="mt-2 md:grid md:grid-cols-12 md:gap-2">
                                        <div className="hidden md:block md:col-span-3" />
                                        <EntityPreferencePanel
                                          company={role.companyName}
                                          contact={c?.name || ""}
                                          getCompanyProfile={getCompanyProfile}
                                          getContactProfile={getContactProfile}
                                          onOpenCustomerText={openPrimaryCustomerText}
                                          sessionInstructionKeys={sessionInstructionKeys}
                                          onMarkInstructionKeysSeen={markInstructionKeysSeen}
                                          className="md:col-span-9"
                                        />
                                      </div>
                                    </div>
                                  ));
                                })}
                              </div>
                            </div>
                          </div>
                        </SubSection>
                        <SubSection id="sec4-billing" title="Billing" open={billingSubOpen} onToggle={(nextOpen) => setBillingSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("billing") ? "audit-outline" : ""}>
                          <Field label="Bill To"><div data-audit-key="billingPayer" className={auditOn && data.highlightMissing?.billingPayer ? "audit-missing rounded-lg p-1" : ""}><ToggleGroup options={["Insurance","Customer","Referrer","Public Adjuster","Building","Contractor","Other"]} value={data.billingPayer} onChange={v=>update("billingPayer",v)} /></div></Field>
                          {!(data.billingPayer === "Customer" || data.payorQuick === "Self-pay") && (
                            <div className="space-y-3">
                              {billingAssignmentLinked ? (
                                <LinkedAssignmentPanel
                                  title="Billing linked from assigned roles"
                                  helperText="Using company/contact already assigned on this order."
                                  values={[
                                    { label: "Billing Company", value: data.billingCompany },
                                    { label: "Billing Contact", value: data.billingContact },
                                  ]}
                                  cues={billingAssignmentCues}
                                  locked={!billingAssignmentUnlocked}
                                  onToggleLock={() => setBillingAssignmentUnlocked((prev) => !prev)}
                                />
                              ) : null}
                              {(!billingAssignmentLinked || billingAssignmentUnlocked) ? (
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <Field label={
                                    <span className="inline-flex items-center gap-2">
                                      Billing Company
                                      <span className="inline-flex items-center gap-1">
                                        {companyRolesFor({ company: data.billingCompany, contact: data.billingContact }).map(r => <RoleBadge key={`billing-${r.title}`} role={r} />)}
                                      </span>
                                    </span>
                                  }><Input className={getFlashClass("billingCompany")} value={data.billingCompany} onChange={e=>update("billingCompany", e.target.value)} placeholder="Billing company" /></Field>
                                  <Field label="Billing Contact" subtle action={<span className="text-[10px] text-slate-400">Auto-fill company</span>}>
                                    <SearchSelect data-audit-key="billingContact" value={data.billingContact} onChange={(v)=>handleBillingContactChange(v)} options={combinedContactOptions} listId="billing-contact-list" />
                                  </Field>
                                </div>
                              ) : null}
                              <EntityPreferencePanel
                                company={data.billingCompany}
                                contact={data.billingContact}
                                getCompanyProfile={getCompanyProfile}
                                getContactProfile={getContactProfile}
                                onOpenCustomerText={openPrimaryCustomerText}
                                sessionInstructionKeys={sessionInstructionKeys}
                                onMarkInstructionKeysSeen={markInstructionKeysSeen}
                              />
                            </div>
                          )}
                          <Field label="Billing Note"><Textarea value={data.billingNote} onChange={e=>update("billingNote",e.target.value)} /></Field>
                          {data.billingPayer && data.billingPayer !== "Customer" && (
                            <div className="mt-2">
                              <ToggleMulti label="Bill To Contacted" checked={!!data.eventBillToContacted} onChange={() => {
                                if (data.eventBillToContacted) { updateMany({ eventBillToContacted: false, billToContactedAt: "", billToContactedBy: "" }); return; }
                                updateMany({ eventBillToContacted: true, billToContactedAt: formatShortTimestamp(), billToContactedBy: data.currentUser || "Unknown" });
                              }} colorClass="!bg-emerald-50 !border-emerald-300 !text-emerald-700" />
                              {data.eventBillToContacted && <span className="ml-2 text-[9px] text-emerald-600">{data.billToContactedBy} · {data.billToContactedAt}</span>}
                            </div>
                          )}
                        </SubSection>
                        <SubSection id="sec4-finance" title="Finance" open={financeSubOpen} onToggle={(nextOpen) => setFinanceSubOpen(!!nextOpen)} compact={compactMode}>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <Field label="Pricing Platform">
                              <Select data-audit-key="pricePlatform" value={data.pricePlatform} onChange={e=>update("pricePlatform", e.target.value)}>
                                <option value="">Select platform...</option>
                                {PRICING_PLATFORMS.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </Select>
                            </Field>
                            <Field label="Price List">
                              <Input data-audit-key="priceList" value={data.priceList} onChange={e=>update("priceList", e.target.value)} placeholder="Price list" />
                            </Field>
                            <Field label="Price Multiplier">
                              <Input data-audit-key="multiplier" value={data.multiplier} onChange={e=>update("multiplier", e.target.value)} placeholder="e.g. 1.10" />
                            </Field>
                          </div>
                          <div className="mt-4">
                            <Field label="Estimate Requested">
                              <Switch data-audit-key="estimateRequested" checked={!!data.estimateRequested} onChange={(v)=>update("estimateRequested", v)} />
                            </Field>
                            {data.estimateRequested && (
                              <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {ESTIMATE_TYPES.map(t => (
                                    <ToggleMulti key={t} label={t} checked={data.estimateType === t} onChange={()=>update("estimateType", t)} />
                                  ))}
                                </div>
                                <Input value={data.estimateRequestedBy} onChange={e=>update("estimateRequestedBy", e.target.value)} placeholder="Who is requesting?" />
                                {estimateRequesterQuickOptions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {estimateRequesterQuickOptions.map((option) => (
                                      <button
                                        key={`estimate-requester-${option}`}
                                        type="button"
                                        onClick={() => update("estimateRequestedBy", option)}
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                          data.estimateRequestedBy === option
                                            ? "border-sky-400 bg-sky-50 text-sky-700"
                                            : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {currentOrderCustomerForms.length > 0 && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                              <div className="font-bold uppercase tracking-wider text-[10px] text-amber-700">Special Customer Forms</div>
                              <div className="mt-1">Available to text: {currentOrderCustomerForms.join(", ")}</div>
                              <button
                                type="button"
                                onClick={() => openPrimaryCustomerText(currentOrderCustomerForms)}
                                className="mt-2 rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-bold text-amber-800 hover:border-amber-400"
                              >
                                Open customer text
                              </button>
                            </div>
                          )}
                        </SubSection>
                        <SubSection id="sec4-insurance" title={data.insuranceClaim === "No" ? "Insurance — No Claim" : "Insurance"} open={insuranceSubOpen} onToggle={(nextOpen) => setInsuranceSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("insurance") ? "audit-outline" : ""}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Insurance Claim? <span className="text-orange-500 text-xs">⚡</span></span>
                            <ToggleGroup options={["Yes","No"]} value={data.insuranceClaim} onChange={v=>update("insuranceClaim",v)} />
                          </div>
                          {data.insuranceClaim !== "No" && (
                            <Field label="Direction of Payment"><ToggleGroup options={["Direct from Insurance","Check","Credit Card","Other"]} value={data.directionOfPayment} onChange={v=>update("directionOfPayment",v)} /></Field>
                          )}
                          {data.insuranceClaim==="Yes" && (
                            <div className="animate-purple-section-fade slide-up rounded-xl bg-white p-4 grid gap-4 shadow-sm">
                              {insuranceAssignmentLinked ? (
                                <LinkedAssignmentPanel
                                  title="Insurance linked from assigned roles"
                                  helperText="Using insurance information already assigned on this order."
                                  headerBadge={
                                    data.nationalCarrier || linkedInsuranceCarrier
                                      ? `National Carrier: ${data.nationalCarrier || linkedInsuranceCarrier}`
                                      : ""
                                  }
                                  values={[
                                    { label: "Insurance Company", value: data.insuranceCompany },
                                    { label: "Adjuster", value: data.insuranceAdjuster },
                                  ]}
                                  cues={insuranceAssignmentCues}
                                  locked={!insuranceAssignmentUnlocked}
                                  onToggleLock={() => setInsuranceAssignmentUnlocked((prev) => !prev)}
                                />
                              ) : null}
                              {(!insuranceAssignmentLinked || insuranceAssignmentUnlocked) ? (
                                <>
                                  {showInsuranceShortcutOptions ? (
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Insurance Shortcuts</div>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {INSURANCE_COMPANY_SHORTCUTS.map((option) => (
                                          <button
                                            key={option.company}
                                            type="button"
                                            onClick={() => handleInsuranceCompanyChange(option.company)}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                              data.insuranceCompany === option.company
                                                ? "border-sky-400 bg-sky-50 text-sky-700"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                                            }`}
                                            title={option.helpText}
                                          >
                                            {option.company}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="mt-2 grid gap-1 text-[11px] text-slate-500">
                                        {INSURANCE_COMPANY_SHORTCUTS.map((option) => (
                                          <div key={`insurance-shortcut-help-${option.company}`}>
                                            <span className="font-semibold text-slate-700">{option.company}:</span> {option.helpText}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                  <div className="grid sm:grid-cols-[1fr_220px] gap-4 items-start">
                                    <Field label={
                                      <span className="inline-flex items-center gap-2">
                                        Insurance Company
                                        <span className="inline-flex items-center gap-1">
                                          {companyRolesFor({ company: data.insuranceCompany, contact: data.insuranceAdjuster }).map(r => <RoleBadge key={`ins-${r.title}`} role={r} />)}
                                        </span>
                                      </span>
                                    }>
                                      <div className={`flex gap-2 ${getFlashClass("insuranceCompany")}`}>
                                        <SearchSelect value={data.insuranceCompany} onChange={(v)=>handleInsuranceCompanyChange(v)} options={companies} listId="insurance-company-list" />
                                        <button className="rounded-lg bg-white px-3 font-bold text-sky-600 shadow-sm hover:bg-sky-50" onClick={()=>setModal({type:"company",value:"",onSave:(name)=>handleInsuranceCompanyChange(name)})}>+</button>
                                      </div>
                                    </Field>
                                    <Field label="National Carrier" noeField="nationalCarrier" smart="The parent insurance company (e.g., Allstate). Auto-linked from the insurance company when known.">
                                      <SearchSelect value={data.nationalCarrier} onChange={(v)=>update("nationalCarrier",v)} options={NATIONAL_CARRIERS} listId="national-carrier-list" placeholder="Auto-linked when available" className={getFlashClass("nationalCarrier")} />
                                    </Field>
                                  </div>
                                  <Field label="Adjuster">
                                    <div className={`flex gap-2 ${getFlashClass("insuranceAdjuster")}`}>
                                      <SearchSelect data-audit-key="insuranceAdjuster" value={data.insuranceAdjuster} onChange={(v)=>handleAdjusterContactChange(v)} options={combinedContactOptions} listId="insurance-adjuster-list" />
                                      <button className="rounded-lg bg-white px-3 font-bold text-sky-600 shadow-sm hover:bg-sky-50" onClick={()=>setModal({type:"contact",value:"",onSave:(name)=>update("insuranceAdjuster",name)})}>+</button>
                                    </div>
                                    {data.insuranceAdjuster && (
                                      <div className="mt-1">
                                        <ToggleMulti label="Contacted" checked={!!data.adjusterContacted} onChange={() => update("adjusterContacted", !data.adjusterContacted)} colorClass="!bg-emerald-50 !border-emerald-300 !text-emerald-700" />
                                      </div>
                                    )}
                                  </Field>
                                </>
                              ) : null}
                              {insuranceCarrierLinkMissing && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                                  <div className="font-bold uppercase tracking-wider text-[10px] text-amber-700">National Carrier Link Needed</div>
                                  <div className="mt-1">
                                    {data.insuranceCompany} is not linked to a national carrier yet.
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={requestNationalCarrierLink}
                                      className="rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-bold text-amber-800 hover:border-amber-400"
                                    >
                                      {data.nationalCarrierRequested ? "Request submitted" : "Request carrier link"}
                                    </button>
                                    <span className="text-[11px] text-amber-700">
                                      Non-restoration orders do not require a national carrier.
                                    </span>
                                  </div>
                                </div>
                              )}
                              {isInsuranceShortcutCompany(data.insuranceCompany) && (
                                <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                                  {data.insuranceCompany} satisfies the reporting placeholder requirement for this prototype.
                                </div>
                              )}
                              <Field label="Order Specific Email" subtle>
                                <Input value={data.insuranceOrderEmail} onChange={e=>update("insuranceOrderEmail",e.target.value)} placeholder="special-email@carrier.com" />
                              </Field>
                              <EntityPreferencePanel
                                company={data.insuranceCompany}
                                contact={data.insuranceAdjuster}
                                getCompanyProfile={getCompanyProfile}
                                getContactProfile={getContactProfile}
                                onOpenCustomerText={openPrimaryCustomerText}
                                sessionInstructionKeys={sessionInstructionKeys}
                                onMarkInstructionKeysSeen={markInstructionKeysSeen}
                              />
                              <div className="grid grid-cols-3 gap-4">
                                <Field label="Claim #" noeField="claimNumber"><Input value={data.claimNumber} onChange={e=>update("claimNumber",e.target.value)} placeholder="e.g. CLM-1001" /></Field>
                                <Field label="Policy #"><Input value={data.policyNumber} onChange={e=>update("policyNumber",e.target.value)} placeholder="Policy number" /></Field>
                                <Field label="Date of Loss" noeField="dateOfLoss"><DatePicker value={data.dateOfLoss} onChange={(v)=>update("dateOfLoss", v)} allowPast={true} /></Field>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Contents Limit ($)" noeField="contentsCoverageLimit"><Input value={data.contentsCoverageLimit} onChange={e=>update("contentsCoverageLimit",e.target.value)} placeholder="Policy coverage limit" /></Field>
                                <Field label="Mold Limit ($)" noeField="moldLimit"><Input className={attentionMold ? "attention-fill" : ""} value={data.moldLimit} onChange={e=>update("moldLimit",e.target.value)} placeholder="Mold-specific limit" /></Field>
                              </div>
                              {attentionMold && (
                                <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                  Confirm Mold Limit if this will be a mold claim.
                                </div>
                              )}
                            </div>
                          )}
                        </SubSection>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec4')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec4')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec4')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec5" noeSection="schedule" title="5. Schedule & Blockers" helpText="Set the next appointment. Put everything the field team needs in Event Instructions." isOpen={openSections.sec5} onHeaderClick={()=>handleToggleSection('sec5')} onCaretClick={()=>handleToggleSection('sec5')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec5") ? "audit-outline" : ""}
                    >
                      <div className="space-y-6">
                        {(() => {
                          const primary = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0];
                          const verified = !!(primary && primary.lat && primary.lng);
                          if (verified) return null;
                          return (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3" role="alert">
                              <span className="text-amber-600 text-lg shrink-0">⚠</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-amber-800">Unconfirmed address</div>
                                <div className="text-[12px] text-amber-700 mt-0.5">
                                  The primary address hasn't been verified via Google Maps. The field team needs a confirmed address to schedule.
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setOpenSections(prev => ({ ...prev, sec3: true })); setTimeout(() => document.getElementById("sec3")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
                                className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100"
                              >
                                Fix in Address →
                              </button>
                            </div>
                          );
                        })()}
                        <SubSection id="sec5-schedule" title="Schedule" open={scheduleSubOpen} onToggle={(nextOpen) => setScheduleSubOpen(!!nextOpen)} compact={compactMode}>
                        <Field label="Event Type">
                          <ToggleGroup options={["Scope","Pickup","In-Home","Meeting"]} value={data.scheduleType} onChange={v => update("scheduleType", v)} />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Date"
                            action={
                              <button
                                type="button"
                                onClick={() => { setNowDate(); setNowTime(); updateMany({ eventFirm: true, pickupTimeTentative: false, scheduleStatus: "" }); }}
                                className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                                title="Set date to today, time to next half hour, and mark as firm"
                              >
                                📅 Now
                              </button>
                            }
                          >
                            <DatePicker value={data.pickupDate} onChange={(v)=>update("pickupDate", v)} closeSignal={dateCloseTick} />
                          </Field>
                          <Field
                            label="Time"
                            action={
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateMany({ pickupTime: '12:00 AM', pickupTimeTentative: true, eventFirm: false })}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${data.pickupTime === '12:00 AM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700'}`}
                                  title="Set time to TBD (12:00 AM placeholder)"
                                >
                                  TBD
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setNowTime(); updateMany({ eventFirm: true, pickupTimeTentative: false, scheduleStatus: "" }); }}
                                  className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                  title="Set to now and mark as firm"
                                >
                                  🕒 Now
                                </button>
                              </div>
                            }
                          >
                            <TimePicker value={data.pickupTime} onChange={(v)=>update("pickupTime", v)} closeSignal={timeCloseTick} />
                          </Field>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <Field label="Event Assignee">
                            <Input value={data.eventAssignee} onChange={e=>update("eventAssignee", e.target.value)} placeholder="Assignee" />
                          </Field>
                          <Field label="Attendee">
                            <Input value={(data as any).eventAttendee || ""} onChange={e=>update("eventAttendee", e.target.value)} placeholder="Who will be there?" />
                          </Field>
                          <Field label="Vehicle">
                            <Input value={data.eventVehicle} onChange={e=>update("eventVehicle", e.target.value)} placeholder="Vehicle" />
                          </Field>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <Field label="# People">
                            <Input type="number" min="1" value={(data as any).eventPeopleCount || ""} onChange={e=>update("eventPeopleCount", e.target.value)} placeholder="# people" />
                          </Field>
                          <Field label="Est. Hours">
                            <Input type="number" min="0.5" step="0.5" value={(data as any).eventHours || ""} onChange={e=>update("eventHours", e.target.value)} placeholder="Hours" />
                          </Field>
                        </div>
                        {data.pickupTime === '12:00 AM' && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-semibold">
                            TBD — on the calendar but time not yet confirmed.
                          </div>
                        )}
                        <Field label="Event Instructions">
                          <div className="relative rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => { setShowQuickInstructions(v=>!v); setShowLoadListPanel(false); }}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${showQuickInstructions ? 'border-sky-400 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-500 hover:border-sky-300'}`}
                                title="Quick instructions"
                              >
                                📝 Notes
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowLoadListPanel(v=>!v); setShowQuickInstructions(false); }}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${showLoadListPanel ? 'border-sky-400 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-500 hover:border-sky-300'}`}
                                title="To Load"
                              >
                                📦 Load
                              </button>
                            </div>
                            {eventSystemLines && (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-[10px] font-bold text-slate-500">Auto-filled</div>
                                  <button
                                    type="button"
                                    onClick={() => setEditSystemInstructions(v => !v)}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                                    title={editSystemInstructions ? "Lock auto-filled" : "Unlock to edit"}
                                  >
                                    {editSystemInstructions ? "🔓 Edit" : "🔒 Locked"}
                                  </button>
                                </div>
                                {editSystemInstructions ? (
                                  <textarea
                                    className="w-full min-h-[72px] rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                                    value={data.eventSystemOverride || eventSystemLines}
                                    onChange={(e) => update("eventSystemOverride", e.target.value)}
                                  />
                                ) : (
                                  <div className="space-y-1">
                                    {data.eventSystemOverride ? (
                                      <div className="whitespace-pre-line">{eventSystemLines}</div>
                                    ) : (
                                      buildEventSystemEntries(data, conditionSummary).map(entry => (
                                        <div key={entry.label}>
                                          <span className="font-semibold text-slate-700">{entry.label}:</span>{" "}
                                          <span>{entry.value}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            <AutoGrowTextarea
                              value={stripEventSystemLines(data.eventInstructions || "")}
                              onChange={e => update("eventInstructions", composeEventInstructions(stripEventSystemLines(e.target.value), data, conditionSummary))}
                              placeholder="Enter instructions for this event"
                              className={hasEventInstructions ? "" : "border-orange-300 focus:border-orange-400 focus:ring-orange-200/40"}
                            />
                            {showQuickInstructions && (
                              <div className="absolute right-3 top-12 z-20 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
                                <div className="text-xs font-bold text-slate-500 mb-2">📝 Notes</div>
                                <div className="flex flex-wrap gap-2">
                                  {["Everything Affected","Only Certain Items", ...QUICK_INSTRUCTION_NOTES].map(n => (
                                    <ToggleMulti key={n} label={n} checked={(data.quickInstructionNotes||[]).includes(n)} onChange={() => {
                                      const nextNotes = toggleMulti(data.quickInstructionNotes || [], n);
                                      update("quickInstructionNotes", nextNotes);
                                    }} />
                                  ))}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-2 pt-2 border-t border-slate-100">Lists controlled in maintenance</div>
                              </div>
                            )}
                            {showLoadListPanel && (
                              <div className="absolute right-3 top-12 z-20 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
                                <div className="text-xs font-bold text-slate-500 mb-2">📦 Items to load</div>
                                <div className="flex flex-wrap gap-2">
                                  {LOAD_ITEMS.map(item => (
                                    <ToggleMulti key={item} label={item} checked={(data.loadList||[]).includes(item)} onChange={() => update("loadList", toggleMulti(data.loadList||[], item))} />
                                  ))}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-2 pt-2 border-t border-slate-100">Lists controlled in maintenance</div>
                              </div>
                            )}
                            <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Who is contacting the customer?</div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <ToggleMulti label="Already contacted" checked={data.contactAssignment === "done"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "done" ? "" : "done" })} />
                                  <ToggleMulti label="Contact POC only" checked={data.contactAssignment === "rep"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "rep" ? "" : "rep" })} />
                                  <ToggleMulti label="Office please contact" checked={data.contactAssignment === "office"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "office" ? "" : "office" })} />
                                  <ToggleMulti label="Enter only — do not contact" checked={data.contactAssignment === "enter-only"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "enter-only" ? "" : "enter-only" })} />
                                </div>
                              </div>
                              <div>
                                <div id="contact-log-section" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Log</div>
                                {/* Contact Milestones */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => {
                                      if (data.eventCustomerContacted) { setData(p => ({ ...p, eventCustomerContacted: false, customerContactedAt: "", customerContactedBy: "" })); return; }
                                      const entry = { id: safeUid(), text: `${data.contactAssignment === "rep" ? "POC" : "Customer"} contacted`, at: formatShortTimestamp(), user: data.currentUser || "Unknown" };
                                      setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])], eventCustomerContacted: true, customerContactedAt: formatShortTimestamp(), customerContactedBy: data.currentUser || "Unknown" }));
                                      setToast(`${data.contactAssignment === "rep" ? "POC" : "Customer"} contacted`);
                                    }} className={`flex-1 rounded-lg border-2 px-3 py-2 text-left transition-all ${data.eventCustomerContacted ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-emerald-300"}`}>
                                      <div className="text-[11px] font-bold text-slate-700">{data.contactAssignment === "rep" ? "POC Contacted" : "Customer Contacted"}</div>
                                      {data.eventCustomerContacted ? <div className="text-[9px] text-emerald-600">{data.customerContactedBy || "Unknown"} · {data.customerContactedAt || ""}</div> : <div className="text-[9px] text-slate-400">Tap when done</div>}
                                    </button>
                                    <button type="button" onClick={() => {
                                      if (data.eventBillToContacted) { setData(p => ({ ...p, eventBillToContacted: false, billToContactedAt: "", billToContactedBy: "" })); return; }
                                      const entry = { id: safeUid(), text: "Bill To contacted", at: formatShortTimestamp(), user: data.currentUser || "Unknown" };
                                      setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])], eventBillToContacted: true, billToContactedAt: formatShortTimestamp(), billToContactedBy: data.currentUser || "Unknown" }));
                                      setToast("Bill To contacted");
                                    }} className={`flex-1 rounded-lg border-2 px-3 py-2 text-left transition-all ${data.eventBillToContacted ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-emerald-300"}`}>
                                      <div className="text-[11px] font-bold text-slate-700">Bill To Contacted</div>
                                      {data.eventBillToContacted ? <div className="text-[9px] text-emerald-600">{data.billToContactedBy || "Unknown"} · {data.billToContactedAt || ""}</div> : <div className="text-[9px] text-slate-400">Tap when done</div>}
                                    </button>
                                  </div>
                                  <button type="button" onClick={() => { const entry = { id: safeUid(), text: "Contact attempted", at: formatShortTimestamp(), user: data.currentUser || "Unknown" }; setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])] })); setToast("Attempt logged"); }} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100">
                                    + Log Attempt
                                  </button>
                                </div>
                                {/* Bill-To Progress Tracker */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bill-To Progress</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Responsible</div>
                                      <div className="text-[11px] font-semibold text-slate-700">{data.salesRep || data.eventAssignee || "Unassigned"}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Direction of Payment</div>
                                      <select value={(data as any).billToPaymentDirection || ""} onChange={e => update("billToPaymentDirection", e.target.value)} className="w-full rounded border border-slate-200 px-2 py-0.5 text-[10px] bg-white">
                                        <option value="">TBD</option>
                                        <option value="check">Check</option>
                                        <option value="credit">Credit Card</option>
                                        <option value="tpa">TPA</option>
                                        <option value="self-pay">Self-Pay</option>
                                      </select>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Scope Sent</div>
                                      <input type="date" value={(data as any).billToScopeSentDate || ""} onChange={e => update("billToScopeSentDate", e.target.value)} className="w-full rounded border border-slate-200 px-2 py-0.5 text-[10px]" />
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Approval Status</div>
                                      <select value={(data as any).billToApprovalStatus || ""} onChange={e => update("billToApprovalStatus", e.target.value)} className="w-full rounded border border-slate-200 px-2 py-0.5 text-[10px] bg-white">
                                        <option value="">Pending</option>
                                        <option value="pre-approved">Pre-Approved</option>
                                        <option value="approved">Approved</option>
                                        <option value="denied">Denied</option>
                                      </select>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Estimate Needed</div>
                                      <div className="flex gap-1">
                                        <button onClick={() => update("estimateRequested", "Y")} className={`rounded px-2 py-0.5 text-[10px] font-bold border ${data.estimateRequested === "Y" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>Yes</button>
                                        <button onClick={() => update("estimateRequested", "N")} className={`rounded px-2 py-0.5 text-[10px] font-bold border ${data.estimateRequested === "N" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>No</button>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">Adjuster</div>
                                      <div className="text-[10px] text-slate-600">{data.insuranceAdjuster || <span className="text-amber-600 font-bold">TBD</span>}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    ref={eventNoteInputRef}
                                    value={eventNoteDraft}
                                    onChange={e=>setEventNoteDraft(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEventNote(eventNoteDraft); setEventNoteDraft(""); } }}
                                    placeholder="e.g. Left voicemail, will try again at 2pm"
                                  />
                                  <button onClick={() => { addEventNote(eventNoteDraft); setEventNoteDraft(""); }} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 shrink-0">Add</button>
                                </div>
                              </div>
                              {(data.eventNotes || []).length === 0 ? (
                                null
                              ) : (
                                <div className="space-y-2 mt-2">
                                  {(showAllEventNotes ? (data.eventNotes || []) : (data.eventNotes || []).slice(0, 4)).map(n => (
                                    <div key={n.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 flex items-start gap-2">
                                      <div className="flex-1">
                                        <div className="font-semibold">{n.text}</div>
                                        <div className="text-[10px] text-slate-500">{n.at} · {n.user || "Unknown"}</div>
                                      </div>
                                      <button onClick={() => setData(p => ({ ...p, eventNotes: (p.eventNotes || []).filter(x => x.id !== n.id) }))} className="text-slate-300 hover:text-red-500 text-sm font-bold shrink-0" title="Delete">×</button>
                                    </div>
                                  ))}
                                  {(data.eventNotes || []).length > 4 && (
                                    <button
                                      type="button"
                                      onClick={() => setShowAllEventNotes(v => !v)}
                                      className="text-xs font-bold text-sky-600 hover:text-sky-700"
                                    >
                                      {showAllEventNotes ? "Show less" : `Show all (${data.eventNotes.length})`}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Field>
                        <Field label="Who are we meeting?"><div className="flex flex-wrap gap-2">{(knownPeople.length > 0) ? knownPeople.map(p => (<ToggleMulti key={p} label={p} checked={(data.meetingWith || []).includes(p)} onChange={() => update("meetingWith", toggleMulti(data.meetingWith || [], p))}/>)) : <span className="text-sm text-slate-400 italic">Add customers or contacts first</span>}</div></Field>
                        {/* Live Event Preview */}
                        {(data.scheduleType || data.pickupDate || data.eventAssignee || stripEventSystemLines(data.eventInstructions || "").trim()) && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Preview</div>
                            <div className="space-y-1 text-xs text-slate-700">
                              {data.scheduleType && <div><span className="font-bold text-slate-500 w-16 inline-block">Type:</span> {data.scheduleType}</div>}
                              {data.pickupDate && <div><span className="font-bold text-slate-500 w-16 inline-block">Date:</span> {data.pickupDate}{data.pickupTime && data.pickupTime !== '12:00 AM' ? ` at ${data.pickupTime}` : ""}{data.pickupTime === '12:00 AM' ? " (TBD)" : ""}{data.pickupTimeTentative ? " — Tentative" : ""}</div>}
                              {data.eventAssignee && <div><span className="font-bold text-slate-500 w-16 inline-block">Assignee:</span> {data.eventAssignee}{data.eventVehicle ? ` · ${data.eventVehicle}` : ""}</div>}
                              {(data.meetingWith || []).length > 0 && <div><span className="font-bold text-slate-500 w-16 inline-block">Meeting:</span> {data.meetingWith.join(", ")}</div>}
                              {(() => { const addr = (data.addresses || []).find(a => a.isPrimary) || {}; const line = [addr.street, addr.city, addr.state].filter(Boolean).join(", "); return line ? <div><span className="font-bold text-slate-500 w-16 inline-block">Address:</span> {line}</div> : null; })()}
                            </div>
                            {/* Instructions removed from preview — already shown in instructions section above */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              <button onClick={handleConfirmClick} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">Send Confirmation</button>
                              <button onClick={openReminderModal} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${data.reminderEnabled ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}>{data.reminderEnabled ? "Edit Reminder" : "Set Reminder"}</button>
                            </div>
                          </div>
                        )}
                        </SubSection>
                        <SubSection id="sec5-bridge" title="Scope Update and Blockers" open={scheduleBridgeOpen} onToggle={(nextOpen) => setScheduleBridgeOpen(!!nextOpen)} compact={compactMode} className={bridgeSectionClassNames}>
                          <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowSdsQuestionnaire(true)}
                                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                                title="Preview the Same Day Scope document — the approval document sent to the adjuster"
                              >
                                Preview SDS
                              </button>
                              <button
                                type="button"
                                onClick={() => setEntryMode("same-day-scope")}
                                className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                title="Open Same Day Scope"
                              >
                                Open in Scope
                              </button>
                            </div>

                            <div className={`rounded-lg border p-3 space-y-4 ${bridgeStatusClassNames}`}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {activeBridgeIssues.length} blocker(s)
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Pickup: {BRIDGE_PICKUP_STEP_OPTIONS.find((option) => option.id === selectedBridgePickupStep)?.label || "Schedule"}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Process: {BRIDGE_PROCESS_STEP_OPTIONS.find((option) => option.id === selectedBridgeProcessStep)?.label || "Yes"}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Delivery: {BRIDGE_DELIVERY_STEP_OPTIONS.find((option) => option.id === selectedBridgeDeliveryStep)?.label || "OK to deliver"}
                                </span>
                              </div>

                              <div className="rounded-lg border border-slate-200/80 bg-white p-3 space-y-2">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Updates</div>
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                  <div className="rounded-lg border border-slate-200/80 bg-white p-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs font-semibold text-slate-700">Customer Contacted</div>
                                      <Switch
                                        checked={!!data.eventCustomerContacted}
                                        onChange={() => update("eventCustomerContacted", !data.eventCustomerContacted)}
                                      />
                                    </div>
                                  </div>
                                  {BRIDGE_MILESTONE_FIELDS.map((field) => {
                                    const milestone = scopeBridgeState.milestones || {};
                                    const active = !!milestone[field.id];
                                    const isAdjusterApproval = field.id === "estimateApproved";
                                    const proceedWithoutApproval = !!milestone.proceedWithoutApproval;
                                    return (
                                      <div key={field.id} className="rounded-lg border border-slate-200/80 bg-white p-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="text-xs font-semibold text-slate-700">{field.label}</div>
                                          <Switch
                                            checked={active}
                                            onChange={() => toggleScopeBridgeMilestone(field.id, field.atId)}
                                          />
                                        </div>
                                        {isAdjusterApproval ? (
                                          <button
                                            type="button"
                                            onClick={toggleProceedWithoutApproval}
                                            className={`mt-2 w-full rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition ${
                                              proceedWithoutApproval
                                                ? "border-amber-300 bg-amber-100 text-amber-800"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
                                            }`}
                                          >
                                            Proceed without approval
                                          </button>
                                        ) : null}
                                        {active ? (
                                          <div className="mt-2 space-y-1.5">
                                            <Input
                                              value={milestone[field.byId] || ""}
                                              onChange={(e) => updateScopeBridgeMilestone(field.byId, e.target.value)}
                                              placeholder="Completed by"
                                              className="!py-1.5 !text-xs"
                                            />
                                            <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                                              {milestone[field.atId] ? `Completed ${formatShortTimestamp(new Date(milestone[field.atId]))}` : "Completed now"}
                                            </div>
                                          </div>
                                        ) : null}
                                        {isAdjusterApproval && proceedWithoutApproval ? (
                                          <div className="mt-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                                            {milestone.proceedWithoutApprovalAt ? `Override ${formatShortTimestamp(new Date(milestone.proceedWithoutApprovalAt))}` : "Override enabled"}
                                          </div>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Blockers — compact summary, managed in Action Items */}
                              <div className="rounded-lg border border-slate-200/80 bg-white p-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Blockers</div>
                                  <button type="button" onClick={() => { setActionItemsOpen(true); setActionItemsBlockerOpen(true); }} className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Manage in Action Items →</button>
                                </div>
                                {(scopeBridgeState.pendingIssues || []).length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(scopeBridgeState.pendingIssues || []).map((b, i) => (
                                      <span key={i} className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">{BRIDGE_CUSTOMER_BLOCKERS.includes(b) ? "Customer" : "Insurance"}: {b}</span>
                                    ))}
                                  </div>
                                ) : <div className="text-[11px] text-slate-400 mt-1">No active blockers</div>}
                              </div>

                              <div className="rounded-lg border border-slate-200/80 bg-white p-3 space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Next Steps</div>
                                <div className="grid gap-3 lg:grid-cols-3">
                                  {[
                                    {
                                      id: "pickup",
                                      label: "Pickup",
                                      selected: selectedBridgePickupStep,
                                      options: BRIDGE_PICKUP_STEP_OPTIONS,
                                      onSelect: setBridgePickupStep,
                                    },
                                    {
                                      id: "process",
                                      label: "Process",
                                      selected: selectedBridgeProcessStep,
                                      options: BRIDGE_PROCESS_STEP_OPTIONS,
                                      onSelect: setBridgeProcessStep,
                                    },
                                    {
                                      id: "delivery",
                                      label: "Delivery",
                                      selected: selectedBridgeDeliveryStep,
                                      options: BRIDGE_DELIVERY_STEP_OPTIONS,
                                      onSelect: setBridgeDeliveryStep,
                                    },
                                  ].map((group) => {
                                    const selectedOption = group.options.find((option) => option.id === group.selected) || group.options[0];
                                    return (
                                      <div key={group.id} className="rounded-lg border border-slate-200/80 bg-white p-2 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{group.label}</div>
                                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-bold ${bridgeStageToneClass(selectedOption.tone, true)}`}>
                                            {selectedOption.label}
                                          </span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {group.options.map((option) => {
                                            const active = group.selected === option.id;
                                            return (
                                              <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => group.onSelect(option.id)}
                                                className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${bridgeStageToneClass(option.tone, active)}`}
                                              >
                                                {option.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-2 space-y-3">
                              <div className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">SDS Icon Selections</div>
                              <div className="rounded-lg border border-slate-200 p-2">
                                <div className="text-xs font-bold text-slate-500 mb-2">Considerations</div>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {SDS_CONSIDERATIONS.map(item => {
                                    const active = (data.sdsConsiderations || []).includes(item);
                                    const iconSrc = SDS_ICON_MAP[item] || "/Icons_Copilot.png";
                                    return (
                                      <button
                                        key={item}
                                        type="button"
                                        title={item}
                                        onClick={() => update("sdsConsiderations", toggleMulti(data.sdsConsiderations || [], item))}
                                        className={`h-[7.2rem] w-[7.2rem] rounded-lg p-1 flex flex-col items-center justify-between border-2 ${active ? "border-sky-400 bg-sky-50/40" : "border-transparent"} hover:border-sky-200`}
                                      >
                                        <div className="h-[4.9rem] w-full flex items-center justify-center overflow-hidden">
                                          <img src={iconSrc} alt={item} className={getSdsIconImageClass(item)} />
                                        </div>
                                        <div className="w-full px-0.5 text-center text-[12px] font-semibold leading-tight text-slate-700">
                                          {item}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="rounded-lg border border-slate-200 p-2">
                                <div className="text-xs font-bold text-slate-500 mb-2">Observations</div>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {SDS_OBSERVATIONS.map(item => {
                                    const active = (data.sdsObservations || []).includes(item);
                                    const iconSrc = SDS_ICON_MAP[item] || "/Icons_Copilot.png";
                                    return (
                                      <button
                                        key={item}
                                        type="button"
                                        title={item}
                                        onClick={() => update("sdsObservations", toggleMulti(data.sdsObservations || [], item))}
                                        className={`h-[7.2rem] w-[7.2rem] rounded-lg p-1 flex flex-col items-center justify-between border-2 ${active ? "border-sky-400 bg-sky-50/40" : "border-transparent"} hover:border-sky-200`}
                                      >
                                        <div className="h-[4.9rem] w-full flex items-center justify-center overflow-hidden">
                                          <img src={iconSrc} alt={item} className={getSdsIconImageClass(item)} />
                                        </div>
                                        <div className="w-full px-0.5 text-center text-[12px] font-semibold leading-tight text-slate-700">
                                          {item}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="rounded-lg border border-slate-200 p-2">
                                <div className="text-xs font-bold text-slate-500 mb-2">Services Requested</div>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                  {SDS_SERVICES.map(item => {
                                    const active = (data.sdsServices || []).includes(item);
                                    const iconSrc = SDS_ICON_MAP[item] || "/Icons_Copilot.png";
                                    return (
                                      <button
                                        key={item}
                                        type="button"
                                        title={item}
                                        onClick={() => update("sdsServices", toggleMulti(data.sdsServices || [], item))}
                                        className={`h-[7.2rem] w-[7.2rem] rounded-lg p-1 flex flex-col items-center justify-between border-2 ${active ? "border-sky-400 bg-sky-50/40" : "border-transparent"} hover:border-sky-200`}
                                      >
                                        <div className="h-[4.9rem] w-full flex items-center justify-center overflow-hidden">
                                          <img src={iconSrc} alt={item} className={getSdsIconImageClass(item)} />
                                        </div>
                                        <div className="w-full px-0.5 text-center text-[12px] font-semibold leading-tight text-slate-700">
                                          {item}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Scope Photos</div>
                                <label className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[12px] font-bold text-sky-700 cursor-pointer hover:bg-sky-100">
                                  + Add Photos
                                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const newPhotos = files.map(file => ({
                                      id: safeUid(),
                                      src: URL.createObjectURL(file),
                                      fileName: file.name,
                                      room: "",
                                      note: "",
                                      isCover: false,
                                      createdAt: new Date().toISOString()
                                    }));
                                    update("sdsPhotos", [...(data.sdsPhotos || []), ...newPhotos]);
                                    e.target.value = "";
                                  }} />
                                </label>
                              </div>
                              {(data.sdsPhotos || []).length > 0 ? (
                                <div className="space-y-3">
                                  {!data.sdsCoverPhoto && (
                                    <div className="text-[12px] text-slate-400">Tip: Click "Cover" on a photo to set it as the SDS cover image.</div>
                                  )}
                                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {(data.sdsPhotos || []).map(photo => (
                                      <div key={photo.id} className={`relative rounded-lg border overflow-hidden ${photo.id === data.sdsCoverPhoto ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200'}`}>
                                        <img src={photo.src} alt={photo.note || "Scope photo"} className="w-full h-28 object-contain bg-slate-50" />
                                        <div className="p-1.5 space-y-1">
                                          <input
                                            type="text"
                                            value={photo.room || ""}
                                            onChange={(e) => update("sdsPhotos", (data.sdsPhotos || []).map(p => p.id === photo.id ? { ...p, room: e.target.value } : p))}
                                            placeholder="Room"
                                            className="w-full text-[12px] border border-slate-200 rounded px-1 py-0.5"
                                          />
                                          <input
                                            type="text"
                                            value={photo.note || ""}
                                            onChange={(e) => update("sdsPhotos", (data.sdsPhotos || []).map(p => p.id === photo.id ? { ...p, note: e.target.value } : p))}
                                            placeholder="Note"
                                            className="w-full text-[12px] border border-slate-200 rounded px-1 py-0.5"
                                          />
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              onClick={() => update("sdsCoverPhoto", data.sdsCoverPhoto === photo.id ? null : photo.id)}
                                              className={`text-[13px] font-bold rounded px-1.5 py-0.5 ${photo.id === data.sdsCoverPhoto ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-sky-50'}`}
                                            >
                                              Cover
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => update("sdsPhotos", (data.sdsPhotos || []).filter(p => p.id !== photo.id))}
                                              className="text-[13px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-rose-500 hover:bg-rose-50"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No photos added yet. Add scope photos to include in the SDS document.</div>
                              )}
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-3">
                              <div className="text-[12px] font-bold uppercase tracking-widest text-sky-200 mb-2">Scope Update Summary</div>
                              <div className="rounded-md border border-white/15 bg-white/5 px-2 py-2 text-xs leading-relaxed text-slate-100">
                                {scopeBridgeSnippet || "Set status and blockers to generate the scope update summary."}
                              </div>
                            </div>
                          </div>
                        </SubSection>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec5')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec5')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec5')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>
                    
                  </div>
                </>
              ) : (
                <QuickEntry 
                    data={data} 
                    update={update} 
                    updateMany={updateMany}
                    updateAddr={updateAddr}
                    updateCust={updateCust}
                    companies={companies} 
                    setModal={setModal} 
                    toggleMulti={toggleMulti} 
                    handleConfirmClick={handleConfirmClick}
                    setToast={setToast}
                    showInlineHelp={showCoaching}
                    auditOn={auditOn}
                    onApplyReferrerRoles={applyReferrerRoles}
                    suggestedReferrerRoles={suggestedReferrerRoles}
                    combinedContactOptions={combinedContactOptions}
                    parseCombinedContact={parseCombinedContact}
                    getFlashClass={getFlashClass}
                    triggerAutoFlash={triggerAutoFlash}
                    quickQuestionsCollapsed={quickQuestionsCollapsed}
                    setQuickQuestionsCollapsed={setQuickQuestionsCollapsed}
                    compactMode={compactMode}
                    recordTypeLabel={recordTypeLabel}
                    getSalesRepForContact={getSalesRepForContact}
                    onOpenCrmLog={openCrmModal}
                    onOpenReminder={openReminderModal}
                    knownPeople={knownPeople}
                    onSetNowDate={setNowDate}
                    onSetNowTime={setNowTime}
                    dateCloseSignal={dateCloseTick}
                    timeCloseSignal={timeCloseTick}
                    onPromptRoleAssignment={openRoleAssignmentPrompt}
                    toggleNonRestorationPrimary={toggleNonRestorationPrimary}
                    toggleRestorationType={toggleRestorationType}
                    selectNonRestorationSubtype={selectNonRestorationSubtype}
                    onSwitchToDetailed={() => setEntryMode('detailed')}
                    orderPoc={orderPoc}
                    setOrderPoc={setOrderPoc}
                    flagContactAsPoc={flagContactAsPoc}
                />
              )}

            </div>
        </div>

        <FloatingCapsule
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            onSave={handleSaveClick}
            setShowSearch={setShowSearch}
            onInterview={() => { setInterviewPanelOpen(v => !v); setActionItemsOpen(false); }}
            interviewPanelOpen={interviewPanelOpen}
            onActionItems={() => { setActionItemsOpen(v => !v); setInterviewPanelOpen(false); }}
            actionItemsOpen={actionItemsOpen}
            actionItemCount={(() => { try { return computeAuditMissing().length; } catch { return 0; } })()}
            modeButtonFlash={modeButtonFlash}
            compactMode={compactMode}
        />

        {/* Interview Docked Side Panel */}
        {interviewPanelOpen && (() => {
          const rushPlanningRecommended = data.rushDeliveryNeeded === "Y" || (data.suggestedGroups || []).some((g: string) => ["RD","RFD","STD","STFD"].includes(g)) || (data.packoutSummary || []).some((p: string) => ["Clothing","Bedding","Electronics","Furniture","Appliances"].includes(p)) || !!(data.livingStatus && data.livingStatus !== "Staying in home") || (data.livingTimeline || []).some((s: any) => s.type !== "Staying in home");
          const rushPlanningVisible = interviewExpanded.rushPlanning !== undefined ? interviewExpanded.rushPlanning : rushPlanningRecommended;
          return (
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-[110] bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {(() => {
                const interviewQuestions = [
                  // General questions (1-11)
                  { key: "conditions", title: "Is anything still wet or damaged?", configKey: "damageWasWet",
                    isAnswered: () => data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp,
                    summary: () => [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural" : "", data.noLights ? "No Power" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""].filter(Boolean).join(", ") },
                  { key: "packout", title: "What type of items will we be cleaning?", configKey: "packoutSummary",
                    isAnswered: () => (data.packoutSummary || []).length > 0,
                    summary: () => (data.packoutSummary || []).join(", ") },
                  { key: "loadList", title: "What do we need to bring?", configKey: "loadList",
                    isAnswered: () => (data.loadList || []).length > 0,
                    summary: () => (data.loadList || []).join(", ") },
                  { key: "considerations", title: "Special considerations", configKey: "sdsConsiderations",
                    isAnswered: () => (data.sdsConsiderations || []).length > 0,
                    summary: () => (data.sdsConsiderations || []).join(", ") },
                  { key: "pets", title: "Pets in home?", configKey: "householdAnimals",
                    isAnswered: () => (data.household || []).some(m => m.category === "pet"),
                    summary: () => (data.household || []).filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).join(", ") },
                  { key: "medical", title: "Medical issues?", configKey: "familyMedicalIssues", isAnswered: () => !!data.familyMedicalIssues, summary: () => data.familyMedicalIssues === "Y" ? "Yes" : "No" },
                  { key: "allergies", title: "Soap/fragrance allergies?", configKey: "soapFragAllergies", isAnswered: () => !!data.soapFragAllergies, summary: () => data.soapFragAllergies === "Y" ? "Yes" : "No" },
                  { key: "selfClean", title: "Self-clean anything?", configKey: "selfCleaning", isAnswered: () => !!data.selfCleaning, summary: () => data.selfCleaning === "Y" ? "Yes" : "No" },
                  { key: "dryCleaner", title: "Use dry cleaner?", configKey: "useDryCleaner", isAnswered: () => !!data.useDryCleaner, summary: () => data.useDryCleaner || "" },
                  { key: "laundry", title: "How dry laundry?", configKey: "howDryLaundry", isAnswered: () => !!data.howDryLaundry, summary: () => data.howDryLaundry || "" },
                  // Timeline questions (12-18)
                  { key: "repairs", title: "What repairs are being done?", configKey: "repairsSummary",
                    isAnswered: () => !!data.repairsSummary,
                    summary: () => data.repairsSummary || "" },
                  { key: "living", title: "Where will the customer live?", configKey: "livingStatus",
                    isAnswered: () => !!data.livingStatus,
                    summary: () => data.livingStatus || "" },
                  { key: "rushDelivery", title: "Rush delivery needed?", configKey: "rushDeliveryNeeded",
                    isAnswered: () => !!data.rushDeliveryNeeded,
                    summary: () => data.rushDeliveryNeeded === "Y" ? "Yes" : data.rushDeliveryNeeded === "N" ? "No" : "" },
                  { key: "interests", title: "Activities & interests", configKey: "rushInterests", isAnswered: () => (data.rushInterests || []).length > 0, summary: () => (data.rushInterests || []).map(id => RUSH_INTERESTS.find(i => i.id === id)?.label || id).join(", ") },
                  { key: "events", title: "Upcoming events", configKey: "upcomingEvents", isAnswered: () => (data.upcomingEvents || []).length > 0, summary: () => (data.upcomingEvents || []).map(e => e.name || "Event").join(", ") },
                  { key: "packoutScope", title: "Will packing out of hard furnishings be necessary?", configKey: "packoutSummary",
                    isAnswered: () => !!(data as any).packoutScope,
                    summary: () => (data as any).packoutScope || "" },
                  { key: "deliveryPlanner", title: "Delivery Planner", configKey: "suggestedGroups",
                    isAnswered: () => (data.suggestedGroups || []).length > 0 || !!data.estimatedReturnDate,
                    summary: () => { const g = (data.suggestedGroups || []).join(", "); const d = data.estimatedReturnDate || ""; return g + (d ? ` → ${d}` : ""); } },
                ];
                const visibleQuestions = interviewQuestions.filter(q => isFieldVisible(q.configKey));
                const answeredCount = visibleQuestions.filter(q => q.isAnswered()).length;
                const logAnswer = (key) => {
                  setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), [key]: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                };
                const getLog = (key) => (data.interviewLog || {})[key];
                return (
                  <>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-indigo-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-800">Interview</span>
                      <span className="text-xs text-indigo-500">{answeredCount} of {visibleQuestions.length}</span>
                    </div>
                    <button onClick={() => setInterviewPanelOpen(false)} className="text-indigo-400 hover:text-indigo-600 text-lg font-bold">×</button>
                  </div>
                  <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input value={interviewSearch} onChange={e => setInterviewSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-7 text-sm text-slate-700 outline-none focus:border-indigo-300 bg-slate-50/50" />
                      {interviewSearch && <button type="button" onClick={() => setInterviewSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">×</button>}
                    </div>
                    <button onClick={() => { const el = document.getElementById("noe-interview-timeline"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="rounded-full border border-teal-400 bg-teal-50 px-3 py-2 text-[11px] font-bold text-teal-700 hover:bg-teal-100 shrink-0 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Timeline</button>
                  </div>
                  </> );
              })()}
              <div id="noe-interview-scroll" className="flex-1 overflow-y-auto p-3 space-y-2">
                {!interviewSearch && showCoaching && !dismissedCoaching.has("interview-header") && (
                  <div className="mb-2">
                    <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.interview")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "interview-header"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button></div>
                  </div>
                )}

                {isFieldVisible("damageWasWet") && matchesInterviewSearch("Is anything still wet or damaged", "Still Wet Visible Mold Structural Damage No Electricity No Heat Boarded Up", [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural Damage" : "", data.noLights ? "No Electricity" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""]) && (() => {
                  const log = (data.interviewLog || {}).conditions;
                  const hasAnswers = data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp;
                  const answered = hasAnswers;
                  const summary = [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural" : "", data.noLights ? "No Power" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""].filter(Boolean).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.conditions === true;
                  return <div className={`noe-iq rounded-xl border ${answered ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                  <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, conditions: !p.conditions})); if (!log) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), conditions: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                    <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">1</span>{highlightSearch(expanded ? "Is anything still wet or damaged?" : "Conditions")}</div>
                    {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}

                  </button>
                  {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                  {expanded && <div className="px-3 pb-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "wet", label: "Still Wet", active: data.damageWasWet === "Y" || data.damageWasWet === true, onToggle: () => updateSmart("damageWasWet", (data.damageWasWet === "Y" || data.damageWasWet === true) ? "N" : "Y") },
                      { id: "mold", label: "Visible Mold", active: !!data.damageMoldMildew, onToggle: () => updateSmart("damageMoldMildew", !data.damageMoldMildew) },
                      { id: "structural", label: "Structural Damage", active: data.structuralElectricDamage === "Y", onToggle: () => update("structuralElectricDamage", data.structuralElectricDamage === "Y" ? "N" : "Y") },
                      { id: "lights", label: "No Electricity", active: !!data.noLights, onToggle: () => updateSmart("noLights", !data.noLights) },
                      { id: "heat", label: "No Heat", active: !!data.noHeat, onToggle: () => updateSmart("noHeat", !data.noHeat) },
                      { id: "boarded", label: "Boarded Up", active: !!data.boardedUp, onToggle: () => updateSmart("boardedUp", !data.boardedUp) },
                    ].map(item => (
                      <ToggleMulti key={item.id} label={item.label} checked={item.active} onChange={() => { item.onToggle(); executeInterviewActions(item.label, !item.active); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(item.label) ? "!ring-2 !ring-yellow-400" : ""}`} />
                    ))}
                  </div>
                  {showCoaching && [
                    { label: "Still Wet", active: data.damageWasWet === "Y" || data.damageWasWet === true },
                    { label: "Visible Mold", active: !!data.damageMoldMildew },
                    { label: "Structural Damage", active: data.structuralElectricDamage === "Y" },
                    { label: "No Electricity", active: !!data.noLights },
                    { label: "Boarded Up", active: !!data.boardedUp },
                  ].filter(i => i.active && interviewActions[i.label]?.coaching && !dismissedCoaching.has(`c-${i.label}`)).map(i => (
                    <div key={i.label} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                      <div className="flex-1">🎓 <span className="font-bold">{i.label}:</span> {interviewActions[i.label].coaching}</div>
                      <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${i.label}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                    </div>
                  ))}
                  {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, conditions: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                  </div>}
                </div>;
                })()}

                {/* Repairs (Q2) */}
                {isFieldVisible("repairsSummary") && matchesInterviewSearch("repairs contractor", "Just Cleaning Paint Refinish Floors Replace Floors Cosmetic Damage Major Structural Complete Rebuild", data.repairsSummary) && (() => {
                  const log = (data.interviewLog || {}).repairs;
                  const hasAnswers = !!data.repairsSummary;
                  const answered = hasAnswers;
                  const summary = data.repairsSummary || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.repairs === true;
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden`}>
                    <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, repairs: !p.repairs})); if (!log && answered) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), repairs: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">2</span>{highlightSearch(expanded ? "What repairs are being done by the contractor?" : "Repairs")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}

                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      {showCoaching && !dismissedCoaching.has("c-repairs") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.repairs")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-repairs"]))} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                      <div className="flex flex-wrap gap-2">
                        {["Just Cleaning", "Paint", "Refinish Floors", "Replace Floors", "Cosmetic Damage", "Major Structural Damage", "Complete Rebuild"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.repairsSummary || "").includes(s)} onChange={() => {
                            const current = (data.repairsSummary || "").split(", ").filter(Boolean);
                            const isAdding = !current.includes(s);
                            const next = isAdding ? [...current, s] : current.filter(x => x !== s);
                            update("repairsSummary", next.join(", "));
                            executeInterviewActions(s, isAdding);
                          }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && ["Just Cleaning", "Paint", "Refinish Floors", "Replace Floors", "Cosmetic Damage", "Major Structural Damage", "Complete Rebuild"].filter(s => (data.repairsSummary || "").includes(s) && interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`)).map(s => (
                        <div key={s} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                        </div>
                      ))}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, repairs: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all border-slate-300 text-slate-500`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Packout Scope (Q3) */}
                {matchesInterviewSearch("packout packing", "No Packout Content Manipulation Partial Packout Full Packout packing furniture", (data as any).packoutScope, (data as any).packoutNote) && (() => {
                  const log = (data.interviewLog || {}).packoutScope; const hasAnswers = !!(data as any).packoutScope; const answered = hasAnswers; const summary = (data as any).packoutScope || (!!log && !hasAnswers ? "None" : ""); const expanded = !!interviewSearch.trim() || interviewExpanded.packoutScope === true;
                  const PACKOUT_SCOPES = INTERVIEW_PACKOUT_SCOPES;
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, packoutScope: !p.packoutScope}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">3</span>{highlightSearch(expanded ? "Will packing out of hard furnishings be necessary?" : "Packout")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}

                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {PACKOUT_SCOPES.map(s => (
                          <ToggleMulti key={s} label={s} checked={(data as any).packoutScope === s} onChange={() => { update("packoutScope", (data as any).packoutScope === s ? "" : s); executeInterviewActions(s, (data as any).packoutScope !== s); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && (data as any).packoutScope && interviewActions[(data as any).packoutScope]?.coaching && !dismissedCoaching.has(`c-${(data as any).packoutScope}`) && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">{(data as any).packoutScope}:</span> {interviewActions[(data as any).packoutScope].coaching}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${(data as any).packoutScope}`]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                        </div>
                      )}
                      {(data as any).packoutScope && (data as any).packoutScope !== "No Packout" && (
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Packout Notes (flows to event instructions)</div>
                          <textarea value={(data as any).packoutNote || ""} onChange={e => update("packoutNote", e.target.value)} placeholder="e.g. Heavy furniture on 2nd floor, fragile china cabinet..." className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] outline-none focus:border-sky-300 resize-none" rows={2} />
                        </div>
                      )}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, packoutScope: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all border-slate-300 text-slate-500`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Packout Items (Q4) */}
                {isFieldVisible("packoutSummary") && matchesInterviewSearch("picking up", "Rugs Window Treatments Clothing Bedding Furniture Art Electronics Hardware Appliances", data.packoutSummary) && (() => {
                  const log = (data.interviewLog || {}).packout; const hasAnswers = (data.packoutSummary || []).length > 0; const answered = hasAnswers; const summary = (data.packoutSummary || []).join(", ") || (!!log && !hasAnswers ? "None" : ""); const expanded = !!interviewSearch.trim() || interviewExpanded.packout === true;
                  return <div className={`noe-iq rounded-xl border ${answered && !expanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, packout: !p.packout}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">4</span>{highlightSearch(expanded ? "What type of items will we be cleaning?" : "Cleaning")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {["Rugs", "Window Treatments", "Clothing", "Bedding", "Furniture", "Art", "Electronics", "Hardware", "Appliances"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.packoutSummary || []).includes(s)} onChange={() => { const isAdding = !(data.packoutSummary || []).includes(s); update("packoutSummary", toggleMulti(data.packoutSummary || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && (data.packoutSummary || []).filter(s => interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`)).map(s => (
                        <div key={s} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                        </div>
                      ))}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, packout: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Load List */}
                {isFieldVisible("loadList") && matchesInterviewSearch("need to bring", "Tall Ladder Extra Manpower Floor Protection Dollies Wardrobe Boxes TV Boxes Blankets Plastic Bags", data.loadList, (data as any).loadListNote) && (() => {
                  const log = (data.interviewLog || {}).loadList; const hasAnswers = (data.loadList || []).length > 0; const answered = hasAnswers; const summary = (data.loadList || []).join(", ") || (!!log && !hasAnswers ? "None" : ""); const expanded = !!interviewSearch.trim() || interviewExpanded.loadList === true;
                  return <div className={`noe-iq rounded-xl border ${answered && !expanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, loadList: !p.loadList}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">5</span>{highlightSearch(expanded ? "What do we need to bring?" : "Bring")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      {(() => {
                        const targets: LoadTarget[] = (data as any)._loadTargets || DEFAULT_LOAD_TARGETS;
                        const autoLabels = new Set(matchLoadTargets(data, targets));
                        const grouped: Record<string, LoadTarget[]> = {};
                        targets.forEach(t => { (grouped[t.category] = grouped[t.category] || []).push(t); });
                        return Object.entries(grouped).map(([cat, items]) => (
                          <div key={cat}>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{cat}</div>
                            <div className="flex flex-wrap gap-2">
                              {items.map(t => {
                                const isAuto = autoLabels.has(t.label);
                                return (
                                  <ToggleMulti
                                    key={t.id}
                                    label={t.label + (isAuto ? " ✦" : "")}
                                    checked={(data.loadList || []).includes(t.label)}
                                    onChange={() => update("loadList", toggleMulti(data.loadList || [], t.label))}
                                    className={`!px-2 !py-1 !text-xs ${isAuto ? "!ring-2 !ring-amber-300" : ""} ${isSearchMatch(t.label) ? "!ring-2 !ring-yellow-400" : ""}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                      {matchLoadTargets(data).length > 0 && <div className="text-[10px] text-amber-600">✦ Auto-suggested based on conditions/packout/loss type</div>}
                      <Input value={(data as any).loadListNote || ""} onChange={e => update("loadListNote", e.target.value)} placeholder="Additional notes about what to bring..." className="!text-xs" />
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, loadList: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Considerations */}
                {isFieldVisible("sdsConsiderations") && matchesInterviewSearch("special considerations", "Elderly Pregnancy Baby Hearing Impaired Spanish Only Respiratory Concerns Premium Brands Skin Sensitivity", data.sdsConsiderations) && (() => {
                  const log = (data.interviewLog || {}).considerations; const hasAnswers = (data.sdsConsiderations || []).length > 0; const answered = hasAnswers; const summary = (data.sdsConsiderations || []).join(", ") || (!!log && !hasAnswers ? "None" : ""); const expanded = !!interviewSearch.trim() || interviewExpanded.considerations === true;
                  return <div className={`noe-iq rounded-xl border ${answered && !expanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, considerations: !p.considerations}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">6</span>{highlightSearch("Considerations")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {["Elderly", "Pregnancy", "Baby", "Hearing Impaired", "Spanish Only", "Respiratory Concerns", "Premium Brands", "Skin Sensitivity"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.sdsConsiderations || []).includes(s)} onChange={() => { const isAdding = !(data.sdsConsiderations || []).includes(s); update("sdsConsiderations", toggleMulti(data.sdsConsiderations || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {((data.sdsConsiderations || []).some(c => ["Skin Sensitivity", "Respiratory Concerns", "Pregnancy"].includes(c))) && (
                        <div className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2.5 space-y-2">
                          <div className="text-[12px] font-bold text-sky-700 uppercase tracking-wider">Handling Codes</div>
                          <div className="flex flex-wrap gap-1.5">
                            {[["Det","special detergent"], ["NoDC","no dry clean"], ["Low","low heat"], ["NoDry","no dryer"], ["PPE","wear PPE"], ["Hand","hand finish"]].map(([code, desc]) => (
                              <ToggleMulti key={code} label={code} title={desc} checked={(data.handlingCodes || []).includes(code)} onChange={() => update("handlingCodes", toggleMulti(data.handlingCodes || [], code))} />
                            ))}
                          </div>
                          <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="Specific allergies or sensitivities" className="!text-xs !py-1.5" />
                        </div>
                      )}
                      {showCoaching && (data.sdsConsiderations || []).filter(s => interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`)).map(s => (
                        <div key={`coach-${s}`} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                        </div>
                      ))}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, considerations: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Pets in Home */}
                {matchesInterviewSearch("pets animals dog cat", "dog cat bird fish rabbit hamster pet", data.householdAnimals, (data.household || []).map(m => `${m.type || ""} ${m.name || ""}`)) && (() => {
                  const pets = (data.household || []).filter(m => m.category === "pet");
                  const log = (data.interviewLog || {}).pets;
                  const hasAnswers = pets.length > 0;
                  const answered = hasAnswers;
                  const summary = pets.map(p => [p.type, p.name].filter(Boolean).join(" ")).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.pets === true;
                  const petTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Other"];
                  return <div className={`noe-iq rounded-xl border ${answered && !expanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, pets: !p.pets}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">7</span>{highlightSearch(expanded ? "Pets in home?" : "Pets")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {petTypes.map(type => {
                          const hasPet = pets.some(p => p.type === type);
                          return <button key={type} type="button" onClick={() => {
                            const members = data.household || [];
                            let next;
                            if (hasPet) {
                              next = members.filter(m => !(m.category === "pet" && m.type === type));
                            } else {
                              next = [...members, { id: safeUid(), category: "pet", type, name: "" }];
                            }
                            update("household", next);
                            const petStr = next.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                            update("householdAnimals", petStr);
                            const sdsC = data.sdsConsiderations || [];
                            if (petStr && !sdsC.includes("Pets")) update("sdsConsiderations", [...sdsC, "Pets"]);
                            if (!petStr && sdsC.includes("Pets")) update("sdsConsiderations", sdsC.filter(s => s !== "Pets"));
                            if (!(data.sdsObservations || []).includes("Pets") && petStr) { update("sdsObservations", [...(data.sdsObservations || []), "Pets"]); executeInterviewActions("Pets", true); }
                            if (!petStr && (data.sdsObservations || []).includes("Pets")) update("sdsObservations", (data.sdsObservations || []).filter(s => s !== "Pets"));
                            setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), pets: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                          }} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${hasPet ? 'border-sky-400 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{type}</button>;
                        })}
                      </div>
                      {pets.map(pet => (
                        <div key={pet.id} className="flex items-center gap-2 bg-sky-50/50 rounded-lg border border-sky-100 px-3 py-1.5">
                          <span className="text-[12px] font-bold text-sky-700">{pet.type}</span>
                          <input value={pet.name || ""} onChange={e => {
                            const next = (data.household || []).map(m => m.id === pet.id ? {...m, name: e.target.value} : m);
                            update("household", next);
                            const petStr = next.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                            update("householdAnimals", petStr);
                          }} placeholder="Pet name" className="flex-1 rounded border border-sky-200 px-2 py-0.5 text-[12px] text-slate-700 bg-white outline-none focus:border-sky-400" />
                          <button type="button" onClick={() => {
                            const next = (data.household || []).filter(m => m.id !== pet.id);
                            update("household", next);
                            const petStr = next.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                            update("householdAnimals", petStr);
                            if (!petStr) {
                              update("sdsConsiderations", (data.sdsConsiderations || []).filter(s => s !== "Pets"));
                              update("sdsObservations", (data.sdsObservations || []).filter(s => s !== "Pets"));
                            }
                          }} className="text-slate-400 hover:text-rose-500 text-xs">×</button>
                        </div>
                      ))}
                      {pets.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {[...new Set(pets.map(p => p.type))].map(type => (
                            <button key={type} type="button" onClick={() => {
                              const next = [...(data.household || []), { id: safeUid(), category: "pet", type, name: "" }];
                              update("household", next);
                              const petStr = next.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                              update("householdAnimals", petStr);
                            }} className="rounded-full border border-dashed border-sky-300 px-2 py-0.5 text-[13px] font-bold text-sky-600 hover:bg-sky-50">+ {type}</button>
                          ))}
                        </div>
                      )}
                      {showCoaching && answered && !dismissedCoaching.has("c-Pets") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                        <div className="flex-1">🎓 <span className="font-bold">Pets:</span> {interviewActions["Pets"]?.coaching || "Please make sure your pets are secured in a safe room."}</div>
                        <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-Pets"]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                      </div>}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, pets: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Customer Preferences — individual Y/N questions */}
                {[
                  { key: "medical", configKey: "familyMedicalIssues", title: "Medical Issues", searchTerms: "medical health asthma", isAnswered: () => !!data.familyMedicalIssues, summary: () => data.familyMedicalIssues === "Y" ? `Yes${data.familyMedicalNote ? ": " + data.familyMedicalNote : ""}` : "No" },
                  { key: "allergies", configKey: "soapFragAllergies", title: "Allergies", searchTerms: "allergy allergies detergent soap fragrance sensitive", isAnswered: () => !!data.soapFragAllergies, summary: () => data.soapFragAllergies === "Y" ? `Yes${data.soapFragNote ? ": " + data.soapFragNote : ""}` : "No" },
                  { key: "selfClean", configKey: "selfCleaning", title: "Self-Cleaning", searchTerms: "drawers undergarments linens towels baby items clean themselves", isAnswered: () => !!data.selfCleaning, summary: () => data.selfCleaning === "Y" ? `Yes${data.selfCleaningNote ? ": " + data.selfCleaningNote : ""}` : "No" },
                  { key: "dryCleaner", configKey: "useDryCleaner", title: "Dry Cleaner", searchTerms: "dry cleaner dry cleaning", isAnswered: () => !!data.useDryCleaner, summary: () => data.useDryCleaner || "" },
                  { key: "laundry", configKey: "howDryLaundry", title: "Drying Preference", searchTerms: "air dry low heat dryer machine", isAnswered: () => !!data.howDryLaundry, summary: () => data.howDryLaundry || "" },
                ].filter(q => isFieldVisible(q.configKey) && matchesInterviewSearch(q.title, q.searchTerms || "")).map((q, qi) => {
                  const log = (data.interviewLog || {})[q.key]; const hasAnswers = q.isAnswered(); const answered = hasAnswers;
                  const needsFollowUp = (q.key === "medical" && data.familyMedicalIssues === "Y") || (q.key === "allergies" && data.soapFragAllergies === "Y") || (q.key === "selfClean" && data.selfCleaning === "Y");
                  const userPref = interviewExpanded[q.key];
                  const expanded = !!interviewSearch.trim() || userPref === true;
                  return (
                    <div key={q.key} className={`noe-iq rounded-xl border ${answered && !expanded ? 'border-sky-200 bg-sky-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                      <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, [q.key]: !p[q.key]})); if (answered && !log) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), [q.key]: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                        <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">{8 + qi}</span>{highlightSearch(q.title)}</div>
                        {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{q.summary()}</span>}
                      </button>
                      {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                      {expanded && <div className="px-3 pb-3">
                        {q.key === "medical" && <>
                          <ToggleGroup options={["Y","N"]} value={data.familyMedicalIssues || ""} onChange={v => { update("familyMedicalIssues", v); if (v === "Y") executeInterviewActions("Medical Yes", true); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), medical: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.familyMedicalIssues === "Y" && <Input value={data.familyMedicalNote || ""} onChange={e => update("familyMedicalNote", e.target.value)} placeholder="What medical issues?" className="!text-xs mt-2" />}
                        </>}
                        {q.key === "allergies" && <>
                          <ToggleGroup options={["Y","N"]} value={data.soapFragAllergies || ""} onChange={v => { update("soapFragAllergies", v); if (v === "Y") executeInterviewActions("Allergies Yes", true); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), allergies: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.soapFragAllergies === "Y" && <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="What allergies?" className="!text-xs mt-2" />}
                        </>}
                        {q.key === "selfClean" && <>
                          <ToggleGroup options={["Y","N"]} value={data.selfCleaning || ""} onChange={v => { update("selfCleaning", v); if (v === "Y") executeInterviewActions("SelfClean Yes", true); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), selfClean: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.selfCleaning === "Y" && <div className="mt-2 space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {["Drawers", "Undergarments", "Linens", "Towels", "Baby Items"].map(item => {
                                const active = (data.selfCleaningNote || "").toLowerCase().includes(item.toLowerCase());
                                return <button key={item} type="button" onClick={() => { const note = data.selfCleaningNote || ""; if (active) update("selfCleaningNote", note.split(/,\s*/).filter(s => s.toLowerCase() !== item.toLowerCase()).join(", ")); else update("selfCleaningNote", note ? `${note}, ${item}` : item); }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${active ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>{item}</button>;
                              })}
                            </div>
                            <Input value={data.selfCleaningNote || ""} onChange={e => update("selfCleaningNote", e.target.value)} placeholder="Additional notes..." className="!text-xs" />
                          </div>}
                        </>}
                        {q.key === "dryCleaner" && <ToggleGroup options={["Yes","No","Rarely"]} value={data.useDryCleaner || ""} onChange={v => { update("useDryCleaner", v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), dryCleaner: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />}
                        {q.key === "laundry" && <>
                          <ToggleGroup options={["Air-Dry","Low Heat","Dryer"]} value={data.howDryLaundry || ""} onChange={v => { updateHowDry(v); executeInterviewActions(v, true); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), laundry: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.howDryLaundry && <div className="mt-2">
                            <Input value={data.howDryNote || ""} onChange={e => update("howDryNote", e.target.value)} placeholder="Additional notes..." className="!text-xs" />
                          </div>}
                        </>}
                        <button type="button" onClick={() => setInterviewExpanded(p => ({...p, [q.key]: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"} block`}>Collapse</button>
                      </div>}
                    </div>
                  );
                })}

                {/* Timeline Section Header */}
                {/* Timeline Gateway */}
                <div id="noe-interview-timeline" className="mt-4 mb-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-teal-200" />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200">
                      <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[12px] font-bold text-teal-700 uppercase tracking-wide">Delivery Timeline</span>
                    </div>
                    <div className="h-px flex-1 bg-teal-200" />
                  </div>
                  {showCoaching && !dismissedCoaching.has("c-timeline") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.timeline")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-timeline"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button></div>}
                  <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-3 space-y-2">
                    <div className="text-[12px] font-bold text-teal-800">What type of work will we be doing?</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const workTypes = (data as any).timelineWorkTypes || [];
                        // Auto-derive from scheduled event
                        const autoTypes = data.scheduleType ? ({ "Pickup": ["pickup"], "In-Home": ["inhome"], "Meeting": ["consult"] }[data.scheduleType] || []) : [];
                        const effective = workTypes.length > 0 ? workTypes : autoTypes;
                        return [
                          { key: "pickup", label: "Pickup", icon: "📦", desc: "Pack-out, transport, clean, deliver back" },
                          { key: "inhome", label: "In-Home Cleaning", icon: "🏠", desc: "On-site cleaning or restoration" },
                          { key: "consult", label: "Consult Meeting", icon: "🤝", desc: "On-site consultation" },
                          { key: "none", label: "Desk Consult", icon: "💻", desc: "Remote — no on-site event" },
                        ].map(opt => {
                          const isActive = effective.includes(opt.key);
                          return <button key={opt.key} type="button" onClick={() => {
                            const current = (data as any).timelineWorkTypes || [];
                            const next = opt.key === "none"
                              ? (current.includes("none") ? [] : ["none"])
                              : (current.includes(opt.key) ? current.filter(k => k !== opt.key) : [...current.filter(k => k !== "none"), opt.key]);
                            update("timelineWorkTypes", next);
                            setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), timelineWork: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                          }} className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition-all flex items-center gap-1.5 ${isActive ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm" : "border-teal-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700"}`}><span className="text-base">{opt.icon}</span>{opt.label}</button>;
                        });
                      })()}
                    </div>
                    {((data as any).timelineWorkTypes || []).includes("none") && (
                      <div className="rounded-lg bg-white border border-teal-200 px-3 py-2 text-[11px] text-teal-600">
                        Desk consult — no on-site events to schedule. Timeline questions below are optional.
                      </div>
                    )}
                  </div>
                </div>

                {/* Living Timeline */}
                {isFieldVisible("livingStatus") && matchesInterviewSearch("customer live during repairs", "Staying in home Hotel Temp Moving Neighbor Relative Rental", data.livingStatus, (data.livingTimeline || []).map(s => `${s.type || ""} ${s.address || ""}`)) && (() => {
                  const timeline = data.livingTimeline || [];
                  const log = (data.interviewLog || {}).living;
                  const hasAnswers = timeline.length > 0 || !!data.livingStatus;
                  const answered = hasAnswers;
	                  const summary = timeline.length > 0 ? timeline.map(s => s.type).join(" → ") : data.livingStatus || (!!log && !hasAnswers ? "N/A" : "");
	                  const expanded = !!interviewSearch.trim() || interviewExpanded.living === true;
                  const STAY_TYPES = INTERVIEW_STAY_TYPES;
	                  const addStay = (type: string) => {
	                    const payload = type === "Staying in home" ? addressPayloadFromChoice("type:Primary") : addressPayloadFromChoice(`type:${type}`);
	                    const next = [...timeline, { id: safeUid(), type, duration: "", endDate: "", address: payload.address, addressType: payload.addressType, addressId: payload.addressId }];
	                    update("livingTimeline", next);
	                    update("livingStatus", next[0]?.type || type);
                    // Tag the placeholder address with its context
                    if (type !== "Staying in home" && payload.addressId) {
                      setData(p => ({ ...p, addresses: (p.addresses || []).map(a => a.id === payload.addressId ? { ...a, linkedContext: "Living Situation" } : a) }));
                    }
                    executeInterviewActions(type, true);
                    setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), living: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                  };
	                  const updateStay = (id: string, field: string, val: string) => {
	                    const next = timeline.map(s => s.id === id ? {...s, [field]: val} : s);
	                    update("livingTimeline", next);
	                    if (next.length > 0) update("livingStatus", next[0].type);
	                  };
	                  const updateStayAddress = (id: string, choiceValue: string) => {
	                    const payload = addressPayloadFromChoice(choiceValue);
	                    const next = timeline.map(s => s.id === id ? {...s, ...payload} : s);
	                    update("livingTimeline", next);
	                    if (next.length > 0) update("livingStatus", next[0].type);
	                  };
	                  const setCanStayHome = (canStay: boolean) => {
	                    if (canStay) {
	                      const payload = addressPayloadFromChoice("type:Primary");
	                      update("livingTimeline", [{ id: safeUid(), type: "Staying in home", duration: "Until repairs done", endDate: "", address: payload.address, addressType: payload.addressType, addressId: payload.addressId }]);
	                      update("livingStatus", "Staying in home");
	                    } else {
	                      update("livingTimeline", timeline.filter(s => s.type !== "Staying in home"));
	                      update("livingStatus", timeline.find(s => s.type !== "Staying in home")?.type || "Not staying in home");
	                    }
	                    setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), living: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
	                  };
                  const removeStay = (id: string) => {
                    const next = timeline.filter(s => s.id !== id);
                    update("livingTimeline", next);
                    update("livingStatus", next[0]?.type || "");
                  };
                  const moveStay = (fromIdx: number, toIdx: number) => {
                    if (toIdx < 0 || toIdx >= timeline.length) return;
                    const next = [...timeline];
                    const [moved] = next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, moved);
                    update("livingTimeline", next);
                    update("livingStatus", next[0]?.type || "");
                  };
                  const DURATION_OPTIONS = INTERVIEW_DURATION_OPTIONS;

                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-teal-400`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, living: !p.living}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-teal-50/50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">13</span>{highlightSearch("Staying in Home")}</div>
                      {answered && !expanded && <div className="flex items-center gap-1 ml-2">
                        {timeline.length > 0 ? timeline.map((s, i) => (
                          <span key={s.id} className="text-[10px] text-emerald-600">{i > 0 && " → "}{s.type}{s.duration ? ` (${s.duration})` : ""}</span>
                        )) : <span className="text-[10px] text-emerald-600">{summary}</span>}
                      </div>}
  
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
	                    {expanded && <div className="px-3 pb-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setCanStayHome(true)} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus === "Staying in home" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>Yes, staying home</button>
                          <button type="button" onClick={() => setCanStayHome(false)} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus === "Not staying in home" || timeline.some(s => s.type !== "Staying in home") ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>No, staying elsewhere</button>
                        </div>

                      {/* Staying in home — coaching */}
                      {data.livingStatus === "Staying in home" && showCoaching && !dismissedCoaching.has("c-stayHome") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <span className="flex-1">{coaching("section.stayingHome")}</span>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-stayHome"]))} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                        </div>
                      )}

                      {/* Estimated time away — slider with weeks/months toggle */}
                      {data.livingStatus && data.livingStatus !== "Staying in home" && (() => {
                        const unit = (data as any).timeAwayUnit || "months";
                        const val = (data as any).estimatedTimeAwayValue || 0;
                        const maxVal = unit === "weeks" ? 8 : 18;
                        const label = val === 0 ? "Not set" : `${val} ${unit === "weeks" ? (val === 1 ? "week" : "weeks") : (val === 1 ? "month" : "months")}`;
                        const onSlide = (e) => {
                          const v = parseInt(e.target.value);
                          update("estimatedTimeAwayValue", v || "");
                          update("timeAwayUnit", unit);
                          const textMap = unit === "weeks"
                            ? (v === 0 ? "" : v <= 2 ? "1-2 weeks" : v <= 4 ? "3-4 weeks" : "6+ weeks")
                            : (v === 0 ? "" : v <= 1 ? "A few weeks" : v <= 3 ? "1-3 months" : v <= 6 ? "3-6 months" : v <= 12 ? "6-12 months" : "12+ months");
                          update("estimatedTimeAway", textMap);
                          update("estimatedMonthsAway", unit === "months" ? v : "");
                          setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), living: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                        };
                        return <div className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] font-bold text-slate-500 uppercase">How long will they be out?</div>
                            <div className="text-[13px] font-bold text-sky-700">{label}</div>
                          </div>
                          <div className="flex rounded-full border border-slate-200 overflow-hidden w-fit">
                            <button type="button" onClick={() => { update("timeAwayUnit", "weeks"); update("estimatedTimeAwayValue", Math.min(val, 8)); }} className={`px-2.5 py-1 text-[10px] font-bold ${unit === "weeks" ? "bg-sky-500 text-white" : "bg-white text-slate-500"}`}>Weeks</button>
                            <button type="button" onClick={() => { update("timeAwayUnit", "months"); }} className={`px-2.5 py-1 text-[10px] font-bold ${unit === "months" ? "bg-sky-500 text-white" : "bg-white text-slate-500"}`}>Months</button>
                          </div>
                          <input type="range" min={0} max={maxVal} step={1} value={val} onChange={onSlide} className="w-full accent-sky-500" />
                          <div className="flex justify-between text-[9px] text-slate-400">
                            {unit === "weeks" ? <><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span></> : <><span>0</span><span>3</span><span>6</span><span>9</span><span>12</span><span>15</span><span>18</span></>}
                          </div>
                        </div>;
                      })()}

	                      {/* Current timeline sequence — draggable (hidden when staying home) */}
	                      {data.livingStatus !== "Staying in home" && timeline.length > 0 && <div className="space-y-2">
                        {timeline.map((stay, idx) => (
                          <div key={stay.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            {/* Header row with drag handles */}
                            <div className="flex items-center gap-1.5 px-2 py-2 bg-slate-50/80 border-b border-slate-100">
                              {/* Reorder buttons */}
                              <div className="flex flex-col gap-0.5 shrink-0">
                                <button type="button" onClick={() => moveStay(idx, idx - 1)} disabled={idx === 0} className="w-5 h-3.5 flex items-center justify-center rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                                </button>
                                <button type="button" onClick={() => moveStay(idx, idx + 1)} disabled={idx === timeline.length - 1} className="w-5 h-3.5 flex items-center justify-center rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                </button>
                              </div>
                              <span className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${{ "Hotel": "bg-amber-500", "Rental": "bg-sky-600", "Temp": "bg-sky-600", "Neighbor": "bg-indigo-500", "Relative": "bg-indigo-500", "Moving": "bg-slate-600", "Staying in home": "bg-emerald-600" }[stay.type] || "bg-sky-500"}`}>{idx + 1}</span>
                              <span className="text-xs font-bold text-slate-700 flex-1">{stay.type}</span>
                              {idx === timeline.length - 1 && <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[8px] font-bold uppercase">Final</span>}
                              <button type="button" onClick={() => removeStay(stay.id)} className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 text-xs font-bold shrink-0">×</button>
                            </div>
	                            {/* Stay timing + address */}
	                            <div className="px-3 py-2.5 space-y-2">
	                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
	                                <label>
	                                  <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Expected through</span>
	                                  <input type="date" value={stay.endDate || ""} onChange={e => updateStay(stay.id, "endDate", e.target.value)} className={`w-full rounded-lg border px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-sky-400 ${stay.type !== "Staying in home" && !stay.endDate ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`} />
	                                </label>
	                                <label>
	                                  <span className="mb-1 block text-[9px] font-bold uppercase text-slate-400">Address</span>
	                                  <select value={addressChoiceValue(stay)} onChange={e => updateStayAddress(stay.id, e.target.value)} className={`w-full rounded-lg border px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-sky-400 bg-white ${stay.type !== "Staying in home" && !stay.addressType && !stay.address ? "border-amber-400" : "border-slate-200"}`}>
	                                    <option value="">Pick address...</option>
	                                    {orderAddressChoices.known.length > 0 && <optgroup label="★ EXISTING ADDRESSES ON THIS ORDER ★">
	                                      {orderAddressChoices.known.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
	                                    </optgroup>}
	                                    <optgroup label="＋ ADD PLACEHOLDER (address TBD)">
	                                      {orderAddressChoices.placeholders.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
	                                    </optgroup>
	                                  </select>
	                                </label>
	                              </div>
	                            </div>
                          </div>
                        ))}
                        {timeline.length > 0 && !timeline.some(s => s.type === "Staying in home" || s.type === "Moving") && (
                          <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                            <span className="flex-1">{coaching("section.addHome")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                          </div>
                        )}
                      </div>}

                      {/* Add stay buttons (only when customer cannot stay home) */}
                      {data.livingStatus && data.livingStatus !== "Staying in home" && <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5">{timeline.length > 0 ? "Add next stay" : "Where first?"}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {STAY_TYPES.map(t => {
                            const alreadyInTimeline = timeline.some(s => s.type === t.id);
                            const hasPlaceholder = (data.addresses || []).some(a => a.purpose === t.id);
                            return <button key={t.id} type="button" onClick={() => { if (alreadyInTimeline) return; addStay(t.id); }} disabled={alreadyInTimeline} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${alreadyInTimeline ? "border-sky-300 bg-sky-50 text-sky-400 cursor-default" : hasPlaceholder ? "border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100" : "border-slate-200 text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"}`} title={alreadyInTimeline ? "Already in timeline" : hasPlaceholder ? `Link to existing ${t.id} address` : t.desc}>{(t as any).label || t.id}{alreadyInTimeline ? " ✓" : hasPlaceholder ? " (exists)" : ""}</button>;
                          })}
                        </div>
                      </div>}

                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, living: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Rush Delivery Needed? (NEW Q14) */}
                {isFieldVisible("rushDeliveryNeeded") && matchesInterviewSearch("rush delivery needed urgent ASAP", "rush immediate", data.rushDeliveryNeeded === "Y" ? "Rush yes" : data.rushDeliveryNeeded === "N" ? "Rush no" : "", (data as any).rushDeclinedNote) && (() => {
                  const log = (data.interviewLog || {}).rushDelivery;
                  const hasAnswers = !!data.rushDeliveryNeeded;
                  const answered = hasAnswers;
                  const expanded = !!interviewSearch.trim() || interviewExpanded.rushDelivery === true;
                  const summary = data.rushDeliveryNeeded === "Y" ? "Yes — Rush group added" : data.rushDeliveryNeeded === "N" ? "No" : "";
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-teal-400`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, rushDelivery: !p.rushDelivery}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-teal-50/50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">14</span>{highlightSearch(expanded ? "Does the customer need a rush delivery?" : "Rush")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      {showCoaching && !dismissedCoaching.has("c-rush") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.rush")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-rush"]))} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>}
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => {
                          update("rushDeliveryNeeded", data.rushDeliveryNeeded === "Y" ? "" : "Y");
                          if (data.rushDeliveryNeeded !== "Y") {
                            const groups = data.suggestedGroups || [];
                            if (!groups.includes("RD")) update("suggestedGroups", [...groups, "RD"]);
                            const firstStay = (data.livingTimeline || [])[0];
                            if (firstStay) {
                              const details = (data as any).deliveryGroupDetails || {};
                              update("deliveryGroupDetails", { ...details, RD: { ...(details.RD || {}), addressType: firstStay.type, address: firstStay.address } });
                            }
                          }
                          setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), rushDelivery: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                        }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.rushDeliveryNeeded === "Y" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                          Yes, rush needed
                        </button>
                        <button type="button" onClick={() => {
                          update("rushDeliveryNeeded", data.rushDeliveryNeeded === "N" ? "" : "N");
                          setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), rushDelivery: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                        }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.rushDeliveryNeeded === "N" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                          No rush needed
                        </button>
                      </div>
                      {data.rushDeliveryNeeded === "Y" && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-700">
                          Rush Delivery (RD) group auto-added{(data.livingTimeline || [])[0]?.type ? ` → delivering to ${(data.livingTimeline || [])[0].type}` : ""}.
                        </div>
                      )}
                      {data.rushDeliveryNeeded === "N" && (
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Notes</div>
                          <textarea value={(data as any).rushDeclinedNote || ""} onChange={e => update("rushDeclinedNote", e.target.value)} placeholder="Reason or additional context..." className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] outline-none focus:border-sky-300 resize-none" rows={2} />
                        </div>
                      )}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, rushDelivery: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}


                {/* Activities & Interests */}
                {(() => {
                  const log = (data.interviewLog || {}).interests;
                  const hasAnswers = (data.rushInterests || []).length > 0;
                  const answered = hasAnswers;
                  const summary = (data.rushInterests || []).map(id => RUSH_INTERESTS.find(i => i.id === id)?.label || id).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.interests === true;
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-teal-400`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, interests: !expanded}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-teal-50/50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">15</span>{highlightSearch("Activities & interests")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
  
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {RUSH_INTERESTS.map(i => {
                          const active = (data.rushInterests || []).includes(i.id);
                          return <button key={i.id} type="button" onClick={() => { update("rushInterests", active ? (data.rushInterests||[]).filter(x=>x!==i.id) : [...(data.rushInterests||[]), i.id]); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), interests: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${active ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`} title={i.desc}>
                            {i.label}
                          </button>;
                        })}
                      </div>
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, interests: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}

                {/* Upcoming Events */}
                {(() => {
                  const log = (data.interviewLog || {}).events;
                  const hasAnswers = (data.upcomingEvents || []).length > 0;
                  const answered = hasAnswers;
                  const summary = (data.upcomingEvents || []).map(e => e.name || "Event").join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.events === true;
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-teal-400`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, events: !p.events}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-teal-50/50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">16</span>{highlightSearch("Trips / Events")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
  
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-2">
                      {showCoaching && !dismissedCoaching.has("c-events") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.events")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-events"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button></div>}
                      {(data.upcomingEvents || []).map(evt => (
                        <div key={evt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative">
                          <button type="button" onClick={() => update("upcomingEvents", (data.upcomingEvents||[]).filter(e => e.id !== evt.id))} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 text-sm font-bold">×</button>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${evt.type === "trip" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>{evt.type === "trip" ? "Trip" : "Event"}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Name</div>
                              <input value={evt.name||""} onChange={e => update("upcomingEvents", (data.upcomingEvents||[]).map(ev => ev.id === evt.id ? {...ev, name: e.target.value} : ev))} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]" placeholder={evt.type === "trip" ? "e.g. Florida Vacation" : "e.g. Wedding"} />
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Date</div>
                              <input type="date" value={evt.date||""} min={new Date().toISOString().split("T")[0]} onChange={e => {
                                let val = e.target.value;
                                if (val) {
                                  const today = new Date(); today.setHours(0,0,0,0);
                                  let d = new Date(val + "T00:00:00");
                                  if (d < today) { d.setFullYear(today.getFullYear() + 1); val = d.toISOString().split("T")[0]; }
                                }
                                update("upcomingEvents", (data.upcomingEvents||[]).map(ev => ev.id === evt.id ? {...ev, date: val} : ev));
                              }} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { update("upcomingEvents", [...(data.upcomingEvents||[]), {id: safeUid(), type: "trip", date: "", name: "Trip"}]); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), events: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="flex-1 p-2 border-2 border-dashed border-slate-300 rounded-lg text-[11px] font-bold text-slate-500 hover:border-sky-400 hover:text-sky-600">+ Add Trip</button>
                        <button type="button" onClick={() => { update("upcomingEvents", [...(data.upcomingEvents||[]), {id: safeUid(), type: "event", date: "", name: "Event"}]); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), events: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="flex-1 p-2 border-2 border-dashed border-slate-300 rounded-lg text-[11px] font-bold text-slate-500 hover:border-amber-400 hover:text-amber-600">+ Add Event</button>
                      </div>
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => setInterviewExpanded(p => ({...p, events: false}))} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}
                {/* Delivery Group Builder */}
                {matchesInterviewSearch("delivery group builder final suggested", "RD RFD STD STFD LTD LTFD Inhome TLI Test Dispose Storage Only final months date", data.suggestedGroups, data.estimatedReturnDate, data.storageMonths) && (() => {
                  const log = (data.interviewLog || {}).suggestedGroups || (data.interviewLog || {}).finalDeliveryDate;
                  const selectedGroups = data.suggestedGroups || [];
                  const groupDetails = (data as any).deliveryGroupDetails || {};
                  const hasAnswers = selectedGroups.length > 0 || !!data.estimatedReturnDate;
                  const answered = hasAnswers;
                  const expanded = !!interviewSearch.trim() || interviewExpanded.groupBuilder === true;
                  const hasFinal = selectedGroups.some(g => g.endsWith("FD") || g === "LTFD" || g === "STFD" || g === "RFD") || !!(groupDetails as any).__finalDate;
                  const finalDate = data.estimatedReturnDate || "";
                  const summary = selectedGroups.length > 0 ? selectedGroups.join(", ") + (finalDate ? ` → ${finalDate}` : "") : finalDate ? `Final: ${finalDate}` : "";
	                  const logBoth = () => setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), suggestedGroups: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}, finalDeliveryDate: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}}));
                  return <div className={`noe-iq rounded-xl border border-slate-200 bg-white overflow-hidden border-l-4 border-l-teal-400`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, groupBuilder: !p.groupBuilder}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-teal-50/50">
                      <div className={`text-[13px] font-bold text-sky-600 flex items-center gap-2`}><span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">17</span>{highlightSearch("Delivery Planner")}</div>
                      {answered && !expanded && <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[10px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-3 pb-3 space-y-3">
                      {showCoaching && !dismissedCoaching.has("c-groupBuilder") && <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.planner")}</span><button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-groupBuilder"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button></div>}
                      {/* Group selection chips */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Select Groups</div>
                        <div className="flex flex-wrap gap-1.5">
                          {SUGGESTED_GROUPS.map(g => {
                            const active = selectedGroups.includes(g);
                            return <button key={g} type="button" onClick={() => {
                              update("suggestedGroups", active ? selectedGroups.filter(x => x !== g) : [...selectedGroups, g]);
                              logBoth();
                            }} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`} title={SUGGESTED_GROUP_HELP[g] || g}>{g}</button>;
                          })}
                        </div>
                      </div>
                      {/* Per-group detail rows — date + address, sorted by timeline order */}
                      {selectedGroups.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Group Details</div>
                          {[...selectedGroups].sort((a, b) => { const ia = SUGGESTED_GROUPS.indexOf(a); const ib = SUGGESTED_GROUPS.indexOf(b); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib); }).map((g, gi) => {
                            const det = groupDetails[g] || {};
                            const isFinal = det.isFinal || (gi === selectedGroups.length - 1 && !selectedGroups.some((x, xi) => xi !== gi && (groupDetails[x] || {}).isFinal));
	                            const updateDet = (field: string, val: any) => {
	                              const next = { ...groupDetails, [g]: { ...det, [field]: val } };
	                              update("deliveryGroupDetails", next);
	                              if (field === "date" && isFinal) update("estimatedReturnDate", val);
	                              logBoth();
	                            };
	                            const updateDetAddress = (choiceValue: string) => {
	                              const payload = addressPayloadFromChoice(choiceValue);
	                              const next = { ...groupDetails, [g]: { ...det, ...payload } };
	                              update("deliveryGroupDetails", next);
	                              logBoth();
	                            };
                            return (
                              <div key={g} className={`rounded-lg border ${isFinal ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"} px-3 py-2 space-y-1.5`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-700">{g}</span>
                                    <span className="text-[9px] text-slate-400">{SUGGESTED_GROUP_HELP[g] || ""}</span>
                                    {det.qualifier && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${det.qualifier === "Firm Date" ? "bg-sky-100 text-sky-700 border border-sky-200" : det.qualifier === "Must Be Before" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>{det.qualifier}</span>}
                                  </div>
                                  <button type="button" onClick={() => {
                                    const next = { ...groupDetails };
                                    Object.keys(next).forEach(k => { if (next[k]) next[k] = { ...next[k], isFinal: false }; });
                                    next[g] = { ...(next[g] || {}), isFinal: !isFinal };
                                    update("deliveryGroupDetails", next);
                                    if (!isFinal && det.date) update("estimatedReturnDate", det.date);
                                    logBoth();
                                  }} className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${isFinal ? "border-emerald-500 bg-emerald-100 text-emerald-700" : "border-slate-200 text-slate-400 hover:border-emerald-300"}`}>
                                    {isFinal ? "Final ✓" : "Set as Final"}
                                  </button>
                                </div>
                                <div className="flex gap-2 items-center">
	                                  <input type="date" value={det.date || ""} onChange={e => updateDet("date", e.target.value)} className={`rounded border px-1.5 py-0.5 text-[11px] outline-none focus:border-sky-400 flex-1 ${!det.date ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`} />
                                    <select value={det.qualifier || ""} onChange={e => updateDet("qualifier", e.target.value)} className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] outline-none focus:border-sky-400 bg-white">
                                      <option value="">Qualifier...</option>
                                      <option value="Firm Date">Firm Date</option>
                                      <option value="Must Be Before">Must Be Before</option>
                                      <option value="Deliver When Ready">Deliver When Ready</option>
                                    </select>
	                                  <select value={addressChoiceValue(det)} onChange={e => updateDetAddress(e.target.value)} className={`rounded border px-1.5 py-0.5 text-[11px] outline-none focus:border-sky-400 flex-1 bg-white ${!det.addressType && !det.address ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
	                                    <option value="">Pick address...</option>
	                                    {orderAddressChoices.known.length > 0 && <optgroup label="★ EXISTING ADDRESSES ON THIS ORDER ★">
	                                      {orderAddressChoices.known.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
	                                    </optgroup>}
	                                    <optgroup label="＋ ADD PLACEHOLDER (address TBD)">
	                                      {orderAddressChoices.placeholders.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
	                                    </optgroup>
	                                  </select>
                                </div>
                              </div>
                            );
                          })}
                          {!hasFinal && selectedGroups.length > 0 && (
                            <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1"><span className="flex-1">{coaching("section.finalWarning")}</span><button type="button" onClick={e => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button></div>
                          )}
                        </div>
                      )}
                      {/* Post-final inhome events */}
                      {hasFinal && (
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 space-y-1.5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Post-Final Delivery Events</div>
                          <div className="flex flex-wrap gap-1.5">
                            {["Inhome Cleaning", "Unpacking", "Art Hanging", "Appliance Install"].map(evt => {
                              const active = ((data as any).postFinalEvents || []).includes(evt);
                              return <button key={evt} type="button" onClick={() => {
                                const current = (data as any).postFinalEvents || [];
                                update("postFinalEvents", active ? current.filter(e => e !== evt) : [...current, evt]);
                              }} className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${active ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>{evt}</button>;
                            })}
                          </div>
                        </div>
                      )}
                      {<div className="flex items-center justify-between mt-1">{log && <span className="text-[10px] text-slate-400">{log.user} · {log.at}</span>}<button type="button" onClick={() => { setInterviewExpanded(p => ({...p, groupBuilder: false})); logBoth(); }} className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${hasAnswers ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"}`}>Collapse</button></div>}
                    </div>}
                  </div>;
                })()}



              </div>
              <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
                <button onClick={() => { setRushGuideOpen(true); setRushGuideStep(1); }} className="rounded-full border-2 border-teal-400 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 hover:bg-teal-100 flex items-center gap-1.5 shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  View Timeline
                </button>
                <button onClick={() => setInterviewPanelOpen(false)} className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-600">Done</button>
              </div>
          </div>
        ); })()}

        {/* Action Items Panel */}
        {actionItemsOpen && (() => {
          const missing = computeAuditMissing();
          const coreBlockers = (scopeBridgeState.pendingIssues || []).filter(Boolean);
          // Add bill-to progress blockers when order is past intake
          const billToBlockers: string[] = [];
          if (data.pickupDate && !data.eventCustomerContacted) billToBlockers.push("Customer/POC not yet contacted");
          if (data.pickupDate && !data.eventBillToContacted && (data as any).billToPaymentDirection !== "self-pay") billToBlockers.push("Bill To not yet contacted");
          if (data.pickupDate && !(data as any).billToPaymentDirection) billToBlockers.push("Direction of Payment not confirmed");
          if (data.pickupDate && !(data as any).billToApprovalStatus) billToBlockers.push("Scope approval pending");
          const formalBlockers = coreBlockers;
          const softBlockers = billToBlockers;
          const blockers = [...formalBlockers, ...softBlockers];
          const placeholders = [
            ...(data.customers || []).filter(c => {
              if (isPlaceholderFlagActive(c?.placeholder)) return true;
              const hasName = hasMeaningfulValue(c?.first) && hasMeaningfulValue(c?.last);
              const hasContact = hasMeaningfulValue(c?.phone) || hasMeaningfulValue(c?.email);
              return !hasName || (hasMeaningfulValue(c?.first) && !hasContact);
            }).map(c => ({ label: [c.first, c.last].filter(Boolean).join(" ") || "Customer", section: "sec2", type: "customer" })),
            ...(data.addresses || []).filter(a => !a.inactive && isAddressPlaceholder(a)).map(a => ({ label: (a.type && a.type !== "Address" && a.type !== "Primary" ? `${a.type} Address` : "") || a.purpose || a.name || a.placeholder?.reason || "Address needed", section: "sec3", type: "address" })),
            ...(data.vendors || []).filter(v => v.incomplete).map(v => ({ label: v.contact || v.company || "Company", section: "sec4", type: "company" })),
          ];
          return (
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-[110] bg-white shadow-2xl flex flex-col border-l border-slate-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-amber-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span className="text-sm font-bold text-amber-800">Action Items</span>
                    <span className="text-xs text-amber-600">{missing.length + placeholders.length + blockers.length + (!(data.damageWasWet || data.damageMoldMildew || data.repairsSummary || data.livingStatus || (data.livingTimeline || []).length > 0 || (data.packoutSummary || []).length > 0 || data.familyMedicalIssues || data.soapFragAllergies || data.howDryLaundry || data.storageNeeded) ? 1 : 0) + (!((data.repairsSummary || data.estimatedReturnDate || data.storageMonths) && (data.livingStatus || (data.livingTimeline || []).length > 0)) ? 1 : 0)} items</span>
                  </div>
                  <button onClick={() => setActionItemsOpen(false)} className="text-amber-400 hover:text-amber-600 text-lg font-bold">×</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Blockers */}
                  <div>
                    {!actionItemsBlockerOpen ? <>
                      {formalBlockers.length > 0 && <div className="space-y-1.5 mb-3">
                        {formalBlockers.map((b, i) => {
                          const source = BRIDGE_CUSTOMER_BLOCKERS.includes(b) ? "Customer" : BRIDGE_INSURANCE_BLOCKERS.includes(b) ? "Insurance" : "";
                          return <div key={`fb-${i}`} className="flex items-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-3">
                            <div className="flex-1">
                              <div className="text-[10px] font-bold text-rose-400 uppercase">{source}</div>
                              <div className="text-sm font-bold text-rose-800">{b}</div>
                            </div>
                            <button type="button" onClick={() => toggleScopeBridgeIssue(b)} className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 hover:text-rose-700 flex items-center justify-center text-sm font-bold shrink-0">×</button>
                          </div>;
                        })}
                      </div>}
                      <button type="button" onClick={() => setActionItemsBlockerOpen(true)} className="w-full rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition-all">+ Add Blocker</button>
                    </> : <>
                      <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/40 p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Assign a Blocker</div>
                          <button type="button" onClick={() => setActionItemsBlockerOpen(false)} className="text-rose-400 hover:text-rose-600 text-base font-bold leading-none" title="Close blocker picker">×</button>
                        </div>
                        {BRIDGE_BLOCKER_GROUPS.map(group => (
                          <div key={group.id} className="rounded-xl border border-rose-200 bg-white p-3">
                            <div className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2">{group.label}</div>
                            <div className="space-y-1.5">
                              {group.issues.map(issue => {
                                const active = formalBlockers.includes(issue);
                                return <button key={issue} type="button" onClick={() => toggleScopeBridgeIssue(issue)} className={`w-full text-left rounded-lg border px-3 py-2.5 text-[13px] font-bold transition-all ${active ? "border-slate-300 bg-rose-100 text-rose-800" : "border-slate-200 bg-white text-slate-700 hover:bg-rose-50"}`}>
                                  <div className="flex items-center justify-between">
                                    <span>{issue}</span>
                                    {active && <span className="text-rose-600 text-xs">Active ✓</span>}
                                  </div>
                                </button>;
                              })}
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => setActionItemsBlockerOpen(false)} className="w-full rounded-xl border-2 border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50">Close Add Blocker</button>
                      </div>
                    </>}
                  </div>
                  {softBlockers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Follow-ups</div>
                      <div className="space-y-1">
                        {softBlockers.map((b, i) => (
                          <button key={`sb-${i}`} onClick={() => { setActionItemsOpen(false); jumpToSection("sec5"); }} className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800 hover:bg-amber-50">
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Milestones — full controls for the 3 scope-bridge milestones */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Milestones</div>
                    <div className="space-y-1.5">
                      {BRIDGE_MILESTONE_FIELDS.map((field) => {
                        const milestone = scopeBridgeState.milestones || {};
                        const active = !!milestone[field.id];
                        const isAdjusterApproval = field.id === "estimateApproved";
                        const proceedWithoutApproval = !!milestone.proceedWithoutApproval;
                        return (
                          <div key={field.id} className={`rounded-lg border px-3 py-2 ${active ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-bold ${active ? "text-emerald-700" : "text-slate-700"}`}>{active ? "✓" : "○"} {field.label}</span>
                              <Switch checked={active} onChange={() => toggleScopeBridgeMilestone(field.id, field.atId)} />
                            </div>
                            {active && (
                              <div className="mt-2 space-y-1">
                                <Input value={milestone[field.byId] || ""} onChange={(e) => updateScopeBridgeMilestone(field.byId, e.target.value)} placeholder="Completed by" className="!py-1 !text-xs" />
                                <div className="text-[10px] text-emerald-600">{milestone[field.atId] ? `Completed ${formatShortTimestamp(new Date(milestone[field.atId]))}` : "Completed now"}</div>
                              </div>
                            )}
                            {isAdjusterApproval && (
                              <button
                                type="button"
                                onClick={toggleProceedWithoutApproval}
                                className={`mt-2 w-full rounded-lg border px-2 py-1 text-left text-[10px] font-bold transition ${proceedWithoutApproval ? "border-amber-300 bg-amber-100 text-amber-800" : "border-slate-200 bg-white text-slate-500 hover:border-amber-300"}`}
                              >
                                {proceedWithoutApproval ? "✓ Proceeding without approval" : "Proceed without approval"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Steps — pickup / process / delivery stage tones */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Next Steps</div>
                    <div className="space-y-2">
                      {[
                        { id: "pickup", label: "Pickup", selected: selectedBridgePickupStep, options: BRIDGE_PICKUP_STEP_OPTIONS, onSelect: setBridgePickupStep },
                        { id: "process", label: "Process", selected: selectedBridgeProcessStep, options: BRIDGE_PROCESS_STEP_OPTIONS, onSelect: setBridgeProcessStep },
                        { id: "delivery", label: "Delivery", selected: selectedBridgeDeliveryStep, options: BRIDGE_DELIVERY_STEP_OPTIONS, onSelect: setBridgeDeliveryStep },
                      ].map(stage => (
                        <div key={stage.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">{stage.label}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.options.map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => stage.onSelect(opt.id)}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${bridgeStageToneClass(opt.tone, stage.selected === opt.id)}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status Indicators */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="text-xs font-bold text-slate-600">Order Status</span>
                        <select value={data.orderStatus || "New"} onChange={e => update("orderStatus", e.target.value)} className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700 bg-white outline-none">
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {[
                        { label: "Scheduled", done: !!data.pickupDate, detail: data.pickupDate ? `${data.scheduleType || "Event"} on ${data.pickupDate}` : "" },
                        { label: "Customer Contacted", done: !!data.eventCustomerContacted, toggle: () => update("eventCustomerContacted", !data.eventCustomerContacted) },
                        { label: "Bill-To Contacted", done: !!data.eventBillToContacted, toggle: () => update("eventBillToContacted", !data.eventBillToContacted) },
                        { label: "Authorization", done: !!(data as any).authorizationOnFile, toggle: () => update("authorizationOnFile", !(data as any).authorizationOnFile) },
                        { label: "Scope Approved", done: !!(data as any).billToApprovalStatus, toggle: () => update("billToApprovalStatus", (data as any).billToApprovalStatus ? "" : "Approved") },
                      ].map(item => (
                        <button key={item.label} type="button" onClick={item.toggle} className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all ${item.done ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                          <span className={`font-bold ${item.done ? "text-emerald-700" : "text-slate-600"}`}>{item.done ? "✓" : "○"} {item.label}</span>
                          {item.done && item.detail && <span className="text-[10px] text-emerald-500">{item.detail}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workflow status: Interview + Rush Guide */}
                  {(() => {
                    const interviewAnswered = !!(data.damageWasWet || data.damageMoldMildew || data.repairsSummary || data.livingStatus || (data.livingTimeline || []).length > 0 || (data.packoutSummary || []).length > 0 || data.familyMedicalIssues || data.soapFragAllergies || data.howDryLaundry || data.storageNeeded);
                    const rushGuideReady = !!(data.repairsSummary || data.estimatedReturnDate || data.storageMonths) && !!(data.livingStatus || (data.livingTimeline || []).length > 0);
                    const items: {label: string; sub: string; done: boolean; action: () => void}[] = [];
                    if (!interviewAnswered) items.push({ label: "Interview not started", sub: "Answer interview questions to populate the order", done: false, action: () => { setActionItemsOpen(false); setInterviewPanelOpen(true); } });
                    if (!rushGuideReady) items.push({ label: "Rush Guide not ready", sub: "Needs living status + return date or repair type", done: false, action: () => { setActionItemsOpen(false); setRushGuideOpen(true); setRushGuideStep(1); } });
                    return items.length > 0 ? (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workflow</div>
                        <div className="space-y-1">
                          {items.map((item, i) => (
                            <button key={`wf-${i}`} onClick={item.action} className="w-full text-left rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-xs hover:bg-violet-50">
                              <span className="font-bold text-violet-800">{item.label}</span>
                              <span className="text-violet-500 ml-1">— {item.sub}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {placeholders.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Placeholders</div>
                      <div className="space-y-1">
                        {placeholders.map((p, i) => (
                          <button key={`ph-${i}`} onClick={() => { setActionItemsOpen(false); setOpenSections(prev => ({ sec1: p.section === "sec1", sec2: p.section === "sec2", sec3: p.section === "sec3", sec4: p.section === "sec4", sec5: p.section === "sec5" })); setActiveSection(p.section); }} className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800 hover:bg-amber-50">
                            <span className="font-bold">{p.label}</span>{p.type !== "address" && <span className="text-amber-600"> — {p.type}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {missing.length > 0 && (() => {
                    const { grouped, remainder } = groupActionItems(missing);
                    return (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Fields</div>
                        <div className="space-y-2">
                          {ACTION_ITEM_GROUPS.map((g) => {
                            const items = grouped[g.id] || [];
                            if (!items.length) return null;
                            const isOpen = actionItemsGroupOpen[g.id] ?? g.defaultOpen;
                            return (
                              <div key={g.id} className="rounded-lg border border-slate-200 overflow-hidden">
                                <button type="button" onClick={() => setActionItemsGroupOpen((prev) => ({ ...prev, [g.id]: !isOpen }))} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700">
                                  <span>{g.label} <span className="text-slate-400 font-normal">({items.length})</span></span>
                                  <span className="text-slate-400">{isOpen ? "▾" : "▸"}</span>
                                </button>
                                {isOpen && (
                                  <div className="space-y-1 p-2">
                                    {items.map((m, i) => (
                                      <button key={`m-${g.id}-${i}`} onClick={() => { setActionItemsOpen(false); focusAuditItem(m); }} className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:border-sky-300">
                                        {m.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {remainder.length > 0 && (
                            <div className="space-y-1">
                              {remainder.map((m, i) => (
                                <button key={`m-other-${i}`} onClick={() => { setActionItemsOpen(false); focusAuditItem(m); }} className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:border-sky-300">
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {data.reminderEnabled && data.reminderDate && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reminders</div>
                      <div className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2 text-xs text-sky-800">
                        Reminder set for {data.reminderDate}{data.reminderTime ? ` at ${data.reminderTime}` : ""}
                      </div>
                    </div>
                  )}
                  {placeholders.length === 0 && missing.length === 0 && blockers.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400">No action items — looking good!</div>
                  )}
                </div>
            </div>
          );
        })()}

        {/* Field Configuration Page */}
        {showFieldConfig && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col" onKeyDown={e => { if (e.key === "Escape") setShowFieldConfig(false); }} tabIndex={-1} ref={el => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}>
            <FieldConfigToolbar
              fieldConfig={fieldConfig}
              setFieldConfig={setFieldConfig}
              selectedKeys={configSelectedKeys}
              setSelectedKeys={setConfigSelectedKeys}
              search={configSearch}
              setSearch={setConfigSearch}
              onResetDefaults={() => { setFieldConfig({ ...DEFAULT_FIELD_CONFIG }); setBlockerRules([...DEFAULT_BLOCKER_RULES]); setToast("Reset to defaults"); }}
              onClose={() => setShowFieldConfig(false)}
            />
            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full space-y-6">
              <FieldConfigGrid
                sections={FIELD_CONFIG_SECTIONS}
                fieldConfig={fieldConfig}
                setFieldConfig={setFieldConfig}
                selectedKeys={configSelectedKeys}
                setSelectedKeys={setConfigSelectedKeys}
                search={configSearch}
              />
              <BlockerRulesCard rules={blockerRules} setRules={setBlockerRules} />

              {/* Coaching & Help Text Config */}
              <CoachingConfigCard
                overrides={(data as any)._coachingOverrides || {}}
                setOverrides={(updater) => setData((p) => ({ ...p, _coachingOverrides: updater((p as any)._coachingOverrides || {}) }))}
                search={(data as any)._coachingSearch || ""}
                setSearch={(v) => setData((p) => ({ ...p, _coachingSearch: v }))}
                onExportAsCode={() => {
                  const overrides = (data as any)._coachingOverrides || {};
                  const merged = { ...DEFAULT_COACHING, ...overrides };
                  const code = `const DEFAULT_COACHING: Record<string, string> = ${JSON.stringify(merged, null, 2)};`;
                  navigator.clipboard?.writeText(code);
                  setToast("Coaching config copied to clipboard as code");
                }}
                onResetAll={() => {
                  if (window.confirm("Reset all coaching text to defaults? Your customizations will be lost.")) {
                    setData((p) => { const next = { ...p }; delete (next as any)._coachingOverrides; return next; });
                    setToast("All coaching text reset to defaults");
                  }
                }}
              />

              <LoadingListConfigCard
                targets={(data as any)._loadTargets || DEFAULT_LOAD_TARGETS}
                saveTargets={(next) => { setData((p) => ({ ...p, _loadTargets: next })); saveJsonToStorage("noe.loadTargets", next); }}
                data={data}
                onAddTarget={() => {
                  const targets = (data as any)._loadTargets || DEFAULT_LOAD_TARGETS;
                  const next = [...targets, { id: `lt_${Date.now()}`, label: "New Item", category: "Equipment", triggers: [] }];
                  setData((p) => ({ ...p, _loadTargets: next }));
                  saveJsonToStorage("noe.loadTargets", next);
                }}
                onResetAll={() => {
                  if (!window.confirm("Reset loading list to defaults?")) return;
                  setData((p) => { const next = { ...p }; delete (next as any)._loadTargets; return next; });
                  try { localStorage.removeItem("noe.loadTargets"); } catch { /* ignore */ }
                  setToast("Loading list reset");
                }}
              />

              <InterviewActionsConfigCard
                configs={interviewActions}
                setConfigs={setInterviewActions}
                search={configSearch}
                onResetAll={() => {
                  setInterviewActions({ ...DEFAULT_INTERVIEW_ACTIONS });
                  try { localStorage.removeItem("noe-interview-actions-v1"); } catch { /* ignore */ }
                  setToast("Interview actions reset");
                }}
              />
            </div>
          </div>
        )}

        {/* Rush Guide — Auto-generated from order + interview data */}
        {rushGuideOpen && (() => {
          const livingMap = { "Staying in home": "home", "Hotel": "hotel", "Temp": "temp", "Moving": "moving" };
          const repairMap = { "Just Cleaning": "cleaning", "Paint": "paint", "Refinish Floors": "refinish_floors", "Replace Floors": "replace_floors", "Cosmetic Damage": "cosmetic", "Major Structural Damage": "structural", "Complete Rebuild": "rebuild" };
          const orderSituation = livingMap[data.livingStatus] || "";
          const firstRepair = (data.repairsSummary || "").split(", ").filter(Boolean)[0] || "";
          const orderRepairType = repairMap[firstRepair] || "";
          const household = data.household || [];
          const people = household.filter(m => m.category === "person");
          const pets = household.filter(m => m.category === "pet");
          const primaryCustomer = (data.customers || [])[0] || {};
          // Addresses
          const allAddresses = data.addresses || [];
          const primaryAddress = allAddresses.find(a => a.isPrimary) || allAddresses[0] || {};
          const primaryAddrStr = [primaryAddress.street, primaryAddress.city, primaryAddress.state, primaryAddress.zip].filter(Boolean).join(", ");
          const tempAddress = allAddresses.find(a => /temp|hotel|rental/i.test(a.type || "")) || {};
          const tempAddrStr = [tempAddress.street, tempAddress.city, tempAddress.state, tempAddress.zip].filter(Boolean).join(", ");
          // Age-aware family composition
          const babies = people.filter(p => { const age = parseInt(p.age); return /infant|baby/i.test(p.type) || (age >= 0 && age <= 2); }).length;
          const kids = people.filter(p => { const age = parseInt(p.age); return /child/i.test(p.type) || (age > 2 && age <= 17); }).length;
          const elderly = people.filter(p => { const age = parseInt(p.age); return /elderly/i.test(p.type) || age >= 65; }).length;
          const adults = Math.max(1, (data.customers || []).length);
          const totalPeople = adults + kids + babies;
          const petCount = pets.length;
          const petNames = pets.map(p => [p.type, p.name].filter(Boolean).join(" ")).join(", ");
          const considerations = data.sdsConsiderations || [];
          const packoutItems = data.packoutSummary || [];
          const interests = data.rushInterests || [];
          const events = data.upcomingEvents || [];
          const conditions = { wet: data.damageWasWet === "Y" || data.damageWasWet === true, mold: !!data.damageMoldMildew, structural: data.structuralElectricDamage === "Y", noLights: !!data.noLights, boarded: !!data.boardedUp };

          const repairInfo = RUSH_REPAIR_TIMELINES.find(r => r.id === orderRepairType);
          const now = new Date();
          // Estimated return: explicit date > repair timeline > storage months > null
	          const explicitReturn = parseLocalDate(data.estimatedReturnDate);
          const repairReturn = repairInfo ? rushAddDays(now, repairInfo.days) : null;
          const storageReturn = data.storageMonths ? rushAddDays(now, parseInt(data.storageMonths) * 30) : null;
          const estimatedReturn = explicitReturn || (repairReturn && storageReturn ? (repairReturn > storageReturn ? repairReturn : storageReturn) : repairReturn || storageReturn);
          const seasons = estimatedReturn ? rushGetSeasons(now, estimatedReturn) : [];
          const storageRepairMismatch = repairReturn && storageReturn && Math.abs(repairReturn.getTime() - storageReturn.getTime()) > 30 * 24 * 60 * 60 * 1000;

          // Smart address resolution from living timeline
          const livingTimeline = data.livingTimeline || [];
          const timelineHotel = livingTimeline.find(s => s.type === "Hotel");
          const timelineRental = livingTimeline.find(s => s.type === "Rental" || s.type === "Temp");
          const hotelAddress = allAddresses.find(a => /hotel/i.test(a.type || "")) || {};
          const hotelAddrStr = timelineHotel?.address || [hotelAddress.street, hotelAddress.city, hotelAddress.state, hotelAddress.zip].filter(Boolean).join(", ");
          const rentalAddress = allAddresses.find(a => /temp|rental/i.test(a.type || "")) || {};
          const rentalAddrStr = timelineRental?.address || [rentalAddress.street, rentalAddress.city, rentalAddress.state, rentalAddress.zip].filter(Boolean).join(", ");
          // Determine delivery pattern from timeline or single status
          const isLongTerm = repairInfo && repairInfo.days > 30;
          const hasHotel = livingTimeline.some(s => s.type === "Hotel") || orderSituation === "hotel" || !!hotelAddrStr;
          const hasRental = livingTimeline.some(s => s.type === "Rental" || s.type === "Temp") || orderSituation === "temp" || !!rentalAddrStr;
          const rushDeliverTo = hasHotel && hotelAddrStr ? hotelAddrStr : hasRental && rentalAddrStr ? rentalAddrStr : tempAddrStr || primaryAddrStr;
          const rentalDeliverTo = rentalAddrStr || tempAddrStr || primaryAddrStr;
          const finalDeliverTo = primaryAddrStr;
          // Duration helpers for Gantt bands
          // DURATION_DAYS imported from ./utils/rushGuideVisuals
          const computeTimelineBands = () => {
            if (livingTimeline.length === 0) return [];
            const bands: {type: string; startDate: Date; endDate: Date; address: string; color: string}[] = [];
            // BAND_COLORS imported from ./utils/rushGuideVisuals
	            // Calculate start dates for each stay using explicit end dates first, then rough durations.
	            const starts: Date[] = [new Date(now)];
	            for (let i = 0; i < livingTimeline.length - 1; i++) {
	              const explicitEnd = parseLocalDate(livingTimeline[i].endDate);
	              if (explicitEnd && explicitEnd > starts[i]) starts.push(explicitEnd);
	              else {
	                const days = DURATION_DAYS[livingTimeline[i].duration] || 30;
	                starts.push(rushAddDays(starts[i], days));
	              }
	            }
	            // Each band runs from its start to the next band's start (contiguous, no gaps)
	            // Last band runs to the explicit stay date, estimated return, or 90 days out.
	            const totalEnd = estimatedReturn || rushAddDays(now, 90);
	            livingTimeline.forEach((stay, i) => {
	              const start = starts[i];
	              const explicitEnd = parseLocalDate(stay.endDate);
	              const end = i < livingTimeline.length - 1 ? starts[i + 1] : (explicitEnd && explicitEnd > start ? explicitEnd : totalEnd);
	              const addressFromType = stay.addressType ? (allAddresses.find(a => (a.type || "").toLowerCase() === stay.addressType.toLowerCase()) || {}) : {};
	              const addressLine = stay.address || [addressFromType.street, addressFromType.city, addressFromType.state, addressFromType.zip].filter(Boolean).join(", ") || (stay.addressType ? `${stay.addressType} address TBD` : "");
	              bands.push({ type: stay.type, startDate: start, endDate: end, address: addressLine, color: BAND_COLORS[stay.type] || "bg-slate-400" });
	            });
            return bands;
          };
          const timelineBands = computeTimelineBands();

          // Compute season change moments during repair window
          const seasonChanges: {name: string; startDate: Date; items: string[]; events: string[]}[] = [];
          if (estimatedReturn) {
            SEASON_DATES.forEach(s => {
              const changeDate = new Date(now.getFullYear(), s.month, s.day);
              if (changeDate <= now) changeDate.setFullYear(changeDate.getFullYear() + 1);
              if (changeDate > now && changeDate <= estimatedReturn) {
                const enrichedItems = [...s.items];
                if (s.name === "Summer" && interests.includes("summer_activities")) enrichedItems.push("Pool toys, beach towels, water shoes");
                if (s.name === "Winter" && interests.includes("winter_sports")) enrichedItems.push("Skiing/snowboarding equipment, snow pants, goggles");
                if (s.name === "Spring" && interests.includes("graduation")) enrichedItems.push("Cap and gown, formal celebration attire");
                if (s.name === "Fall" && interests.includes("school")) enrichedItems.push("School backpacks, uniforms, kids sports gear");
                seasonChanges.push({ name: s.name, startDate: changeDate, items: enrichedItems, events: s.events });
              }
            });
          }

          // Holiday events — computed outside conditional so Gantt can access
          const holidayEvents: {id: string; name: string; date: Date; items: string[]}[] = [];
          if (estimatedReturn) {
            if (interests.includes("halloween")) { const d = new Date(now.getFullYear(), 9, 31); if (d <= now) d.setFullYear(d.getFullYear() + 1); if (d <= estimatedReturn) holidayEvents.push({ id: "holiday_halloween", name: "Halloween", date: d, items: ["Costumes and accessories", "Halloween decorations and party supplies"] }); }
            if (interests.includes("thanksgiving")) { const d = new Date(now.getFullYear(), 10, 27); if (d <= now) d.setFullYear(d.getFullYear() + 1); if (d <= estimatedReturn) holidayEvents.push({ id: "holiday_thanksgiving", name: "Thanksgiving", date: d, items: ["Holiday table linens and servingware", "Fall decorations", "Formal holiday clothing"] }); }
            if (interests.includes("christmas")) { const d = new Date(now.getFullYear(), 11, 25); if (d <= now) d.setFullYear(d.getFullYear() + 1); if (d <= estimatedReturn) holidayEvents.push({ id: "holiday_christmas", name: "Christmas / Hanukkah", date: d, items: ["Holiday clothing and formal wear", "Holiday decorations and ornaments", "Gift wrapping supplies", "Stockings and holiday bedding"] }); }
            if (interests.includes("easter")) { const d = new Date(now.getFullYear(), 3, 5); if (d <= now) d.setFullYear(d.getFullYear() + 1); if (d <= estimatedReturn) holidayEvents.push({ id: "holiday_easter", name: "Easter / Passover", date: d, items: ["Spring formal attire", "Holiday table settings", "Children's Easter outfits"] }); }
            if (interests.includes("graduation")) { const d = new Date(now.getFullYear(), 4, 15); if (d <= now) d.setFullYear(d.getFullYear() + 1); if (d <= estimatedReturn) holidayEvents.push({ id: "holiday_graduation", name: "Graduation", date: d, items: ["Cap and gown", "Formal celebration attire", "Photography outfits"] }); }
          }

          // Generate action plan
          const rushItems: string[] = [];
          const shortTermItems: string[] = [];
          const seasonalWardrobes: {id: string; season: string; date: string; rawDate: Date; items: string[]; events: string[]; assignedGroup: string}[] = [];
          const eventDeliveries: {id: string; name: string; date: string; items: string[]; address: string}[] = [];
          const reminders: string[] = [
            "Remove Valuables: Please remove any valuables or highly personal items from your textiles.",
            "No Need to Bag: You do not need to photograph, bag, or list any items — we will do that for you!"
          ];

          if (repairInfo || orderSituation || estimatedReturn) {
            // Core essentials
            rushItems.push(`Clothing & undergarments to last ${totalPeople} people a couple of weeks`);
            rushItems.push("Daily footwear, sneakers, and belts");

            // Living situation
            if (orderSituation === "hotel" || orderSituation === "temp") rushItems.push("Suitcases, duffel bags, or overnight bags");
            if (orderSituation === "home") {
              rushItems.push("Daily household essentials (towels, shower curtains)");
              shortTermItems.push("Temporary window shades (for privacy)");
              shortTermItems.push("Throw rugs and daily bedding");
              reminders.push("Since you are staying home, we will try to work as quietly as possible.");
            } else if (orderSituation === "hotel") {
              reminders.push("Hotels provide bedding and towels, so there is no need to rush those items.");
              rushItems.push("Favorite blankets or pillows for comfort");
            } else if (orderSituation === "temp") {
              reminders.push("Most rentals are furnished so you likely will not need full bedding or towels unless preferred.");
            }

            // Family composition (age-aware)
            if (babies > 0) { rushItems.push("Strollers, diaper bags, and car seats"); rushItems.push("Crib bedding, baby blankets, and sleep sacks"); }
            if (kids > 0) { rushItems.push("Favorite comfort toys or stuffed animals"); }
            if (elderly > 0) { reminders.push("We will be extra careful with fragile or sentimental items for elderly family members. Please set aside any medications, medical devices, or mobility aids that are needed immediately."); }
            if (petCount > 0) rushItems.push(`Pet beds, leashes, and carrying crates${petNames ? ` (${petNames})` : ""}`);

            // Considerations-driven items
            if (considerations.includes("Pregnancy")) { rushItems.push("Maternity clothing and comfort items"); reminders.push("All items will be cleaned with baby-safe, hypoallergenic products."); }
            if (considerations.includes("Premium Brands")) { reminders.push("Your high-end designer pieces will be routed for delicate hand-cleaning."); }

            // Packout items → what's being picked up affects what needs rushing
            if (packoutItems.includes("Clothing")) rushItems.push("Prioritize your most-needed clothing for the Rush delivery");
            if (packoutItems.includes("Bedding") && orderSituation === "home") rushItems.push("Temporary bedding while yours is being cleaned");
            if (packoutItems.includes("Electronics")) rushItems.push("Identify any electronics you need immediately (chargers, laptops)");

            // Conditions-driven urgency
            if (conditions.wet) reminders.push("URGENT: Wet items are being separated by color and treated immediately with anti-microbial.");
            if (conditions.mold) reminders.push("Mold-affected items require special handling with PPE — do not disturb.");
            if (conditions.boarded) reminders.push("Access may be limited — please confirm entry arrangements.");

            // Interests / activities
            if (interests.includes("school")) rushItems.push("School backpacks, uniforms, and kids sports gear");
            if (interests.includes("workout")) rushItems.push("Workout clothes, sneakers, and gym equipment");
            if (interests.includes("work_from_home")) { if (hasRental) shortTermItems.push("Home office supplies, desk accessories, and work materials"); else rushItems.push("Home office supplies, desk accessories, and work materials"); }
            if (interests.includes("religious")) { if (hasRental) shortTermItems.push("Formal religious attire, prayer items, and head coverings"); else rushItems.push("Formal religious attire, prayer items, and head coverings"); }

            // Season change deliveries — each can be assigned to a group
            // Default logic: rental exists → deliver to rental. No rental → include in rush (if soon) or keep separate for a hotel LTD
            const defaultSeasonGroup = (dateMs: number) => {
              if (hasRental) return "short"; // deliver to rental
              const daysOut = (dateMs - now.getTime()) / 86400000;
              if (daysOut < 30) return "rush"; // soon enough to include in rush
              return "separate"; // will need a separate delivery to hotel
            };
            seasonChanges.forEach(sc => {
              const scId = `season_${sc.name.toLowerCase()}`;
              const override = (rushGuideData as any).seasonOverrides?.[scId];
              const assignedGroup = override?.group || defaultSeasonGroup(sc.startDate.getTime());
              seasonalWardrobes.push({ id: scId, season: sc.name, date: rushFormatDate(sc.startDate), rawDate: sc.startDate, items: sc.items, events: sc.events, assignedGroup });
            });

            // Process holiday events as seasonal wardrobes
            holidayEvents.forEach(he => {
              const override = (rushGuideData as any).seasonOverrides?.[he.id];
              const assignedGroup = override?.group || defaultSeasonGroup(he.date.getTime());
              seasonalWardrobes.push({ id: he.id, season: he.name, date: rushFormatDate(he.date), rawDate: he.date, items: he.items, events: [], assignedGroup });
            });

            // Merge seasonal items assigned to rush/short into those arrays
            seasonalWardrobes.forEach(sw => {
              if (sw.assignedGroup === "rush") rushItems.push(...sw.items.map(i => `[${sw.season}] ${i}`));
              if (sw.assignedGroup === "short") shortTermItems.push(...sw.items.map(i => `[${sw.season}] ${i}`));
            });

            // Events from interview data + rush guide overrides
            events.forEach(evt => {
              if (!evt.date) return;
              const eventDate = new Date(evt.date);
              if (estimatedReturn && eventDate > estimatedReturn) { reminders.push(`Your trip "${evt.name}" falls after repairs are expected to finish.`); return; }
              const items: string[] = [];
              if (evt.type === "vacation_beach") { items.push("Swimwear, resort wear, and sandals"); items.push("Beach bags, sunglasses, and sun hats"); items.push("Suitcases and travel luggage"); }
              else if (evt.type === "vacation_ski") { items.push("Ski gear, thermal layers, heavy coats, and boots"); items.push("Suitcases and travel luggage"); }
              else if (evt.type === "wedding") { items.push("Suits, formal dresses, dress shoes"); items.push("Ties, jewelry, and formal accessories"); }
              else if (evt.type === "business") { items.push("Business professional attire and dress shoes"); items.push("Briefcase, garment bags, and carry-on luggage"); }
              else if (evt.type === "sports") { items.push("Uniforms, cleats, and practice gear"); items.push("Sports equipment bags and gear"); }
              // Check rush guide overrides for group assignment
              const override = (rushGuideData as any).eventOverrides?.[evt.id];
              const assignedGroup = override?.group || "event";
              const eventAddress = override?.address || "";
              if (assignedGroup === "rush") { rushItems.push(...items.map(i => `[${evt.name}] ${i}`)); }
              else if (assignedGroup === "short") { shortTermItems.push(...items.map(i => `[${evt.name}] ${i}`)); }
              else if (assignedGroup === "rental") { /* shown in rental delivery section */ }
              else { eventDeliveries.push({ id: evt.id, name: evt.name, date: rushFormatDate(eventDate), items, address: eventAddress }); }
            });
          }

          return (
            <div className="fixed inset-0 z-[200] bg-white flex flex-col" onKeyDown={e => { if (e.key === "Escape") { setRushGuideOpen(false); } }} tabIndex={-1}>
              <div className="flex-shrink-0 flex items-center gap-3 bg-teal-600 px-5 py-3 shadow-sm z-10">
                <span className="text-lg">📋</span>
                <span className="text-sm font-bold text-white">Rush Guide</span>
                {primaryCustomer.first && <span className="text-teal-200 text-xs">for {[primaryCustomer.first, primaryCustomer.last].filter(Boolean).join(" ")}</span>}
                <div className="flex-1" />
                <span className="text-teal-200 text-xs">Auto-generated from interview</span>
                <button onClick={() => { setRushGuideOpen(false); }} className="text-teal-200 hover:text-white text-lg font-bold ml-3">×</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-6 space-y-6">

                  {/* Step 2: Family */}
                  {rushGuideStep === 2 && <>
                    <div><button onClick={() => setRushGuideStep(1)} className="text-xs text-slate-400 hover:text-slate-600 mb-2">← Back</button><h2 className="text-xl font-bold text-slate-900 mb-1">Step 2: Family & Lifestyle</h2></div>
                    <div className="grid grid-cols-2 gap-3">
                      {[{id:"adults",label:"Adults"},{id:"kids",label:"Children"},{id:"babies",label:"Babies/Toddlers"},{id:"pets",label:"Pets"}].map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                          <span className="text-sm font-bold text-slate-700">{t.label}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setRushGuideData(p => ({...p, family: {...family, [t.id]: Math.max(0, family[t.id]-1)}}))} className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm">-</button>
                            <span className="w-4 text-center font-bold">{family[t.id]}</span>
                            <button onClick={() => setRushGuideData(p => ({...p, family: {...family, [t.id]: family[t.id]+1}}))} className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold text-sm">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activities & Interests</div>
                      <div className="grid grid-cols-3 gap-2">
                        {RUSH_INTERESTS.map(i => {
                          const active = (rushGuideData.interests || []).includes(i.id);
                          return <button key={i.id} onClick={() => setRushGuideData(p => ({...p, interests: active ? p.interests.filter(x => x !== i.id) : [...(p.interests||[]), i.id]}))} className={`p-3 rounded-xl border text-center ${active ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className={`text-xs font-bold ${active ? 'text-teal-800' : 'text-slate-700'}`}>{i.label}</div>
                            <div className="text-[9px] text-slate-500">{i.desc}</div>
                          </button>;
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button onClick={() => setRushGuideStep(3)} className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Next →</button>
                    </div>
                  </>}

                  {/* Step 3: Events */}
                  {rushGuideStep === 3 && <>
                    <div><button onClick={() => setRushGuideStep(2)} className="text-xs text-slate-400 hover:text-slate-600 mb-2">← Back</button><h2 className="text-xl font-bold text-slate-900 mb-1">Step 3: Upcoming Trips & Events</h2><p className="text-sm text-slate-500">Any travel or formal events before {rushFormatDate(estimatedReturn)}?</p></div>
                    <div className="space-y-3">
                      {(rushGuideData.events || []).map(evt => (
                        <div key={evt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-3 gap-3 relative">
                          <button onClick={() => setRushGuideData(p => ({...p, events: p.events.filter(e => e.id !== evt.id)}))} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 text-sm">×</button>
                          <div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name</div><input value={evt.name} onChange={e => setRushGuideData(p => ({...p, events: p.events.map(ev => ev.id === evt.id ? {...ev, name: e.target.value} : ev)}))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></div>
                          <div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</div><select value={evt.type} onChange={e => setRushGuideData(p => ({...p, events: p.events.map(ev => ev.id === evt.id ? {...ev, type: e.target.value} : ev)}))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white">{RUSH_EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
                          <div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</div><input type="date" value={evt.date} onChange={e => setRushGuideData(p => ({...p, events: p.events.map(ev => ev.id === evt.id ? {...ev, date: e.target.value} : ev)}))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" /></div>
                        </div>
                      ))}
                      <button onClick={() => setRushGuideData(p => ({...p, events: [...(p.events||[]), {id: safeUid(), type: "vacation_beach", date: "", name: ""}]}))} className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:border-teal-400 hover:text-teal-600">+ Add Trip or Event</button>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button onClick={() => setRushGuideStep(4)} className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-md">Generate Smart Checklist →</button>
                    </div>
                  </>}

                  {/* Results */}
                  {(repairInfo || orderSituation || estimatedReturn) ? (() => {
                    // Collect seasonal items assigned to rental
                    const rentalSeasonalItems = seasonalWardrobes.filter(sw => sw.assignedGroup === "rental");
                    const separateSeasonals = seasonalWardrobes.filter(sw => sw.assignedGroup === "separate");

                    // Delivery groups — computed at outer scope so seasonal/event sections can reference them
                    const hasHouseholdItems = packoutItems.some(p => ["Rugs", "Window Treatments", "Furniture", "Art", "Appliances"].includes(p));
                    // DELIVERY_COLORS, STAY_TYPE_COLORS imported from ./utils/rushGuideVisuals
                    const deliveryGroups: {id: string; label: string; date: Date; icon: string; items: string[]; location: string; address: string; householdTags?: string[]; color: string}[] = [];
                    // 1) Rush
                    const rushDate = rushAddDays(now, 2);
                    const rushBandIdx = timelineBands.length > 0 ? 0 : 0;
                    const rushLoc = timelineBands.length > 0 ? { location: timelineBands[0].type, address: timelineBands[0].address } : { location: hasHotel ? "Hotel" : hasRental ? "Rental" : "Home", address: rushDeliverTo };
                    const rushColor = STAY_TYPE_COLORS[rushLoc.location] || DELIVERY_COLORS[0];
                    deliveryGroups.push({ id: "rush", label: "Rush Delivery", date: rushDate, icon: "⚡", items: rushItems, location: rushLoc.location, address: rushLoc.address, color: rushColor });
                    // 2) Rental (only if rental exists)
                    if (hasRental && timelineBands.length > 1) {
                      const rentalBand = timelineBands.find(b => ["Rental", "Temp"].includes(b.type));
                      if (rentalBand) {
                        const stDelivery = rushAddDays(rentalBand.startDate, 3);
                        deliveryGroups.push({ id: "rental", label: "Rental Delivery", date: stDelivery, icon: "📦", items: shortTermItems, location: rentalBand.type, address: rentalBand.address, color: STAY_TYPE_COLORS[rentalBand.type] || DELIVERY_COLORS[1] });
                      }
                    }
                    // 2b) Short-Term Delivery (when STD/STFD suggested but no rental band)
                    const interviewGroups = data.suggestedGroups || [];
                    if (!hasRental && interviewGroups.some((g: string) => ["STD", "STFD"].includes(g))) {
                      const stDate = rushAddDays(now, 7);
                      deliveryGroups.push({ id: "short-term", label: "Short-Term Delivery", date: stDate, icon: "📦", items: shortTermItems, location: "Home", address: rushDeliverTo, color: DELIVERY_COLORS[deliveryGroups.length % DELIVERY_COLORS.length] });
                    }
                    // 3) Final
                    if (estimatedReturn) {
                      const finalHouseholdTags: string[] = [];
                      if (packoutItems.includes("Rugs")) finalHouseholdTags.push("Rugs laid");
                      if (packoutItems.includes("Window Treatments")) finalHouseholdTags.push("Drapes hung");
                      if (packoutItems.includes("Furniture")) finalHouseholdTags.push("Furniture placed");
                      if (packoutItems.includes("Art")) finalHouseholdTags.push("Art re-hung");
                      if (packoutItems.includes("Appliances")) finalHouseholdTags.push("Appliances installed");
                      deliveryGroups.push({ id: "final", label: "Final Delivery", date: estimatedReturn, icon: "🏡", items: ["All remaining wardrobe and household items"], location: "Home", address: finalDeliverTo, householdTags: finalHouseholdTags, color: DELIVERY_COLORS[deliveryGroups.length] });
                    }
                    // Default final delivery placeholder when no final delivery exists
                    if (!estimatedReturn && !deliveryGroups.some(g => g.id === "final")) {
                      const defaultFinalDate = rushAddDays(now, 30);
                      deliveryGroups.push({ id: "final", label: "Final Delivery", date: defaultFinalDate, icon: "🏡", items: ["All remaining items"], location: "Home", address: rushDeliverTo || primaryAddrStr, color: DELIVERY_COLORS[deliveryGroups.length % DELIVERY_COLORS.length] });
                    }
                    // Custom deliveries created by user
                    const customDeliveries = ((rushGuideData as any).customDeliveries || []) as {id: string; label: string; dateStr: string; address: string; sourceId: string}[];
                    // Address resolver from timeline bands
                    const resolveAddressAtDate = (d: Date) => {
                      for (const b of timelineBands) { if (d >= b.startDate && d < b.endDate) return { location: b.type, address: b.address }; }
                      if (timelineBands.length) { const last = timelineBands[timelineBands.length - 1]; return { location: last.type, address: last.address }; }
                      return { location: hasHotel ? "Hotel" : "Home", address: primaryAddrStr };
                    };
                    customDeliveries.forEach(cd => {
	                      const cdDate = parseLocalDate(cd.dateStr);
	                      if (!cdDate) return;
	                      const loc = resolveAddressAtDate(cdDate);
                      deliveryGroups.push({ id: cd.id, label: cd.label, date: cdDate, icon: "📦", items: [], location: loc.location, address: cd.address || loc.address, color: DELIVERY_COLORS[deliveryGroups.length % DELIVERY_COLORS.length] });
                    });
                    // Post-final delivery events (inhome cleaning, unpacking, etc.)
                    const postFinalEvents = (data as any).postFinalEvents || [];
                    const preFinalGroup = deliveryGroups.find(g => g.id === "final");
                    const _postOverrides = (rushGuideData as any).groupOverrides || {};
                    if (preFinalGroup && postFinalEvents.length > 0) {
                      postFinalEvents.forEach((evt: string, i: number) => {
                        const postId = `post_${evt.replace(/\s/g, "_").toLowerCase()}`;
                        const savedDate = _postOverrides[postId]?.dateStr ? parseLocalDate(_postOverrides[postId].dateStr) : null;
                        const postDate = savedDate || rushAddDays(preFinalGroup.date, 3 + i * 2);
                        const savedAddress = _postOverrides[postId]?.address;
                        deliveryGroups.push({ id: postId, label: evt, date: postDate, icon: "🏠", items: [`Post-final: ${evt}`], location: preFinalGroup.location, address: savedAddress !== undefined ? savedAddress : preFinalGroup.address, color: DELIVERY_COLORS[(deliveryGroups.length) % DELIVERY_COLORS.length] });
                      });
                    }
                    // Apply user overrides for date/address — AFTER all groups including post-final
                    const groupOverrides = (rushGuideData as any).groupOverrides || {};
                    deliveryGroups.forEach(dg => {
                      const ovr = groupOverrides[dg.id];
	                      if (ovr) {
	                        if (ovr.dateStr) { const d = parseLocalDate(ovr.dateStr); if (d) dg.date = d; }
	                        if (ovr.address !== undefined) dg.address = ovr.address;
	                        if (ovr.addressType !== undefined) dg.addressType = ovr.addressType;
	                        if (ovr.addressId !== undefined) dg.addressId = ovr.addressId;
	                      }
	                    });
	                    // Sort by date
	                    deliveryGroups.sort((a, b) => a.date.getTime() - b.date.getTime());
	                    const applyDeliveryDateChange = (change: any) => {
	                      if (!change?.id || !change.newDateStr) return;
	                      if (change.id.startsWith("custom_")) {
	                        setRushGuideData((p: any) => ({
	                          ...p,
	                          customDeliveries: (p.customDeliveries || []).map((cd: any) => cd.id === change.id ? { ...cd, dateStr: change.newDateStr } : cd),
	                        }));
	                      } else {
	                        setRushGuideData((p: any) => ({
	                          ...p,
	                          groupOverrides: {
	                            ...(p.groupOverrides || {}),
	                            [change.id]: { ...((p.groupOverrides || {})[change.id] || {}), dateStr: change.newDateStr },
	                          },
	                        }));
	                        if (change.id === "final") update("estimatedReturnDate", change.newDateStr);
	                      }
	                      setDeliveryDateVersion(v => v + 1);
	                      // Clear pending after state update renders
	                      setTimeout(() => setPendingDeliveryDateChange(null), 50);
	                    };

	                    // Helper to create a new custom delivery
                    const createCustomDelivery = (label: string, dateStr: string, sourceId: string) => {
                      const loc = resolveAddressAtDate(new Date(dateStr));
                      const newId = `custom_${safeUid()}`;
                      setRushGuideData((p: any) => ({
                        ...p,
                        customDeliveries: [...((p.customDeliveries || []) as any[]), { id: newId, label, dateStr, address: loc.address, sourceId }],
                        seasonOverrides: { ...(p.seasonOverrides || {}), [sourceId]: { ...((p.seasonOverrides || {})[sourceId] || {}), group: newId } },
                      }));
                    };
                    const createCustomDeliveryForEvent = (label: string, dateStr: string, sourceId: string) => {
                      const loc = resolveAddressAtDate(new Date(dateStr));
                      const newId = `custom_${safeUid()}`;
                      setRushGuideData((p: any) => ({
                        ...p,
                        customDeliveries: [...((p.customDeliveries || []) as any[]), { id: newId, label, dateStr, address: loc.address, sourceId }],
                        eventOverrides: { ...(p.eventOverrides || {}), [sourceId]: { ...((p.eventOverrides || {})[sourceId] || {}), group: newId } },
                      }));
                    };
                    const removeCustomDelivery = (id: string) => {
                      setRushGuideData((p: any) => {
                        const next = { ...p, customDeliveries: ((p.customDeliveries || []) as any[]).filter((cd: any) => cd.id !== id) };
                        // Unassign anything pointing to this group
                        const so = { ...(next.seasonOverrides || {}) }; Object.keys(so).forEach(k => { if (so[k]?.group === id) so[k] = { ...so[k], group: "unassigned" }; }); next.seasonOverrides = so;
                        const eo = { ...(next.eventOverrides || {}) }; Object.keys(eo).forEach(k => { if (eo[k]?.group === id) eo[k] = { ...eo[k], group: "unassigned" }; }); next.eventOverrides = eo;
                        return next;
                      });
                    };
                    // Build text for different output modes
                    const buildFullText = () => {
                      let t = `RUSH GUIDE — ${data.orderName || "Order"}\nFor: ${[primaryCustomer.first, primaryCustomer.last].filter(Boolean).join(" ")}\n`;
                      if (primaryAddrStr) t += `Home: ${primaryAddrStr}\n`;
                      if (hasHotel && hotelAddrStr) t += `Hotel: ${hotelAddrStr}\n`;
                      if (hasRental && rentalDeliverTo) t += `Rental: ${rentalDeliverTo}\n`;
                      t += `\n━━━ DELIVERY TIMELINE ━━━\n\n`;
                      t += `1. RUSH DELIVERY (24-72 hrs) → ${rushDeliverTo || "TBD"}\n${rushItems.map(i => `   • ${i}`).join("\n")}\n\n`;
                      if (shortTermItems.length) t += `2. SHORT-TERM (1-4 wks) → ${primaryAddrStr || "TBD"}\n${shortTermItems.map(i => `   • ${i}`).join("\n")}\n\n`;
                      if (rentalSeasonalItems.length) { t += `3. RENTAL DELIVERY → ${rentalDeliverTo || "TBD"}\n   All seasonal wardrobe items for:\n`; rentalSeasonalItems.forEach(sw => { t += `   ${sw.season} (${sw.date}):\n${sw.items.map(i => `      • ${i}`).join("\n")}\n`; }); t += "\n"; }
                      separateSeasonals.forEach(sw => { t += `SEASONAL: ${sw.season} (${sw.date})\n${sw.items.map(i => `   • ${i}`).join("\n")}\n\n`; });
                      eventDeliveries.forEach(e => { t += `EVENT: ${e.name} (${e.date})${e.address ? ` → ${e.address}` : ""}\n${e.items.map(i => `   • ${i}`).join("\n")}\n\n`; });
                      t += `FINAL DELIVERY → ${finalDeliverTo || "TBD"}${estimatedReturn ? ` (est. ${rushFormatDate(estimatedReturn)})` : ""}\nAll remaining items after repairs complete.\n\n`;
                      t += `REMINDERS:\n${reminders.map(r => `• ${r}`).join("\n")}`;
                      return t;
                    };
                    const buildRushOnlyText = () => {
                      let t = `RUSH ITEMS — ${data.orderName || "Order"}\nDeliver to: ${rushDeliverTo || "TBD"} (24-72 hours)\n\n`;
                      t += rushItems.map(i => `• ${i}`).join("\n");
                      t += `\n\nREMINDERS:\n${reminders.filter(r => /urgent|valuables|bag/i.test(r)).map(r => `• ${r}`).join("\n")}`;
                      return t;
                    };
                    const buildPickupText = () => {
                      let t = `PICKUP EVENT NOTES — ${data.orderName || "Order"}\n\n`;
                      t += `RUSH ITEMS (pull first):\n${rushItems.map(i => `□ ${i}`).join("\n")}\n\n`;
                      if (shortTermItems.length) t += `SHORT-TERM ITEMS (tag for priority):\n${shortTermItems.map(i => `□ ${i}`).join("\n")}\n\n`;
                      seasonalWardrobes.forEach(sw => { t += `${sw.season.toUpperCase()} ITEMS (tag: ${sw.assignedGroup === "rental" ? "deliver to rental" : sw.season}):\n${sw.items.map(i => `□ ${i}`).join("\n")}\n\n`; });
                      t += `REMINDERS:\n${reminders.map(r => `• ${r}`).join("\n")}`;
                      return t;
                    };
                    return <>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Rush Guide for {[primaryCustomer.first, primaryCustomer.last].filter(Boolean).join(" ") || "Customer"}</h2>
                      {primaryAddrStr && <div className="text-sm text-slate-500">{primaryAddrStr}</div>}
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {orderSituation && <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{RUSH_LIVING_SITUATIONS.find(s => s.id === orderSituation)?.label || orderSituation}</span>}
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{totalPeople} People{petCount > 0 ? `, ${petCount} Pet${petCount > 1 ? "s" : ""}` : ""}</span>
                        {isLongTerm && <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">Long-Term Order</span>}
                        {estimatedReturn && <span className="rounded-full bg-teal-100 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-700">Return: {rushFormatDate(estimatedReturn)}</span>}
                        {storageRepairMismatch && (() => {
                          const repairDays = repairInfo?.days || 0;
                          const storageDays = data.storageMonths ? parseInt(data.storageMonths) * 30 : 0;
                          const repairLabel = repairInfo ? `${repairInfo.label} (~${Math.round(repairDays / 30)}mo)` : "Unknown";
                          const storageLabel = data.storageMonths ? `${data.storageMonths} months` : "Unknown";
                          return (
                            <span className="group relative rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 cursor-help">
                              Storage/Repair Mismatch
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg bg-slate-800 text-white p-3 text-[11px] font-normal shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                <div className="font-bold text-amber-300 mb-1">Timeline Conflict</div>
                                <div className="space-y-1">
                                  <div>Repairs estimate: <span className="font-semibold">{repairLabel}</span></div>
                                  <div>Storage requested: <span className="font-semibold">{storageLabel}</span></div>
                                  <div className="border-t border-slate-600 pt-1 mt-1 text-slate-300">These differ by more than 30 days. Adjust the storage months in Interview → "Need storage?" or update the repair type to align them.</div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                              </div>
                            </span>
                          );
                        })()}
                        {seasonChanges.length > 0 && <span className="rounded-full bg-violet-100 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">{seasonChanges.length} Season Change{seasonChanges.length > 1 ? "s" : ""}</span>}
                      </div>
                      {/* Editable return date */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500">Return date:</span>
	                        <input type="date" value={data.estimatedReturnDate || formatDateInputValue(estimatedReturn)} onChange={e => update("estimatedReturnDate", e.target.value)} className="rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 outline-none focus:border-teal-400" />
                        {data.estimatedReturnDate && <button type="button" onClick={() => update("estimatedReturnDate", "")} className="text-[9px] text-slate-400 hover:text-slate-600">Reset to auto</button>}
                      </div>
                    </div>

                    {/* (Timeline overview removed — integrated into Gantt below) */}

                    {/* Timeline Builder — collaborative panel to assemble timeline with the customer */}
                    {(() => {
                      const builderOpen = (rushGuideData as any).builderOpen !== false;
                      const toggleBuilder = () => setRushGuideData((p: any) => ({ ...p, builderOpen: !((p as any).builderOpen !== false) }));
                      // Build family member list — adults from customers, kids/babies from household, pets too
                      type Member = { id: string; label: string; kind: "adult" | "child" | "baby" | "pet" };
                      const members: Member[] = [];
                      (data.customers || []).forEach((c: any, i: number) => {
                        const name = [c.first, c.last].filter(Boolean).join(" ") || `Adult ${i + 1}`;
                        members.push({ id: `cust_${i}`, label: name, kind: "adult" });
                      });
                      (data.household || []).forEach((m: any) => {
                        if (m.category === "pet") {
                          members.push({ id: `pet_${m.id || m.name || Math.random()}`, label: [m.type, m.name].filter(Boolean).join(" ") || "Pet", kind: "pet" });
                        } else if (m.category === "person") {
                          const age = parseInt(m.age);
                          const kind: Member["kind"] = (/infant|baby/i.test(m.type) || (age >= 0 && age <= 2)) ? "baby" : (/child/i.test(m.type) || (age > 2 && age <= 17)) ? "child" : "adult";
                          const label = [m.type || (kind === "adult" ? "Adult" : kind === "child" ? "Child" : kind === "baby" ? "Baby" : "Pet"), m.name].filter(Boolean).join(" ");
                          members.push({ id: `hh_${m.id || m.name || Math.random()}`, label, kind });
                        }
                      });
                      const assignments: Record<string, Record<string, boolean>> = (rushGuideData as any).familyAssignments || {};
                      const toggleAssign = (memberId: string, groupId: string) => {
                        setRushGuideData((p: any) => {
                          const next = { ...(p.familyAssignments || {}) };
                          next[memberId] = { ...(next[memberId] || {}) };
                          next[memberId][groupId] = !next[memberId][groupId];
                          return { ...p, familyAssignments: next };
                        });
                      };
                      const kindIcon = (k: Member["kind"]) => k === "adult" ? "👤" : k === "child" ? "🧒" : k === "baby" ? "👶" : "🐾";

                      // Quick add: interest, event, custom delivery
                      const addInterestQuick = (label: string) => {
                        update("rushInterests", Array.from(new Set([...((data as any).rushInterests || []), label])));
                      };
                      const addEventQuick = () => {
                        const today = new Date(); today.setDate(today.getDate() + 14);
                        const dateStr = today.toISOString().slice(0, 10);
                        update("upcomingEvents", [...((data as any).upcomingEvents || []), { id: safeUid(), name: "New Event", type: "vacation_beach", date: dateStr }]);
                      };

                      return (
                        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-white overflow-hidden">
                          <button type="button" onClick={toggleBuilder} className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100 hover:bg-indigo-100/70">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🛠️</span>
                              <span className="text-sm font-bold text-indigo-800">Timeline Builder</span>
                              <span className="text-[10px] text-indigo-500">Collaborate with the customer — assign people to deliveries</span>
                            </div>
                            <span className="text-indigo-500 text-xs">{builderOpen ? "▾" : "▸"}</span>
                          </button>
                          {builderOpen && (
                            <div className="p-4 space-y-4">
                              {/* Family × Delivery Group matrix */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Who gets what — assign household members to delivery groups</div>
                                  <span className="text-[10px] text-slate-400">{members.length} member{members.length !== 1 ? "s" : ""} · {deliveryGroups.length} group{deliveryGroups.length !== 1 ? "s" : ""}</span>
                                </div>
                                {members.length === 0 ? (
                                  <div className="text-[11px] text-slate-500 italic">No household members yet. Add customers and household in the order entry to populate this matrix.</div>
                                ) : deliveryGroups.length === 0 ? (
                                  <div className="text-[11px] text-slate-500 italic">No delivery groups yet — add a final delivery date or repair type to generate them.</div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="text-[11px] w-full border-collapse">
                                      <thead>
                                        <tr>
                                          <th className="text-left px-2 py-1.5 font-bold text-slate-500 border-b border-slate-200 sticky left-0 bg-white">Member</th>
                                          {deliveryGroups.map(dg => (
                                            <th key={dg.id} className="px-2 py-1.5 font-bold text-slate-600 border-b border-slate-200 text-center whitespace-nowrap">
                                              <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-[11px]">{dg.icon} {dg.label.replace(" Delivery", "")}</span>
                                                <span className="text-[9px] text-slate-400">{rushFormatDate(dg.date)}</span>
                                              </div>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {members.map(m => (
                                          <tr key={m.id} className="hover:bg-indigo-50/30">
                                            <td className="px-2 py-1.5 border-b border-slate-100 sticky left-0 bg-white">
                                              <span className="mr-1">{kindIcon(m.kind)}</span>
                                              <span className="font-semibold text-slate-700">{m.label}</span>
                                            </td>
                                            {deliveryGroups.map(dg => {
                                              const on = !!(assignments[m.id] || {})[dg.id];
                                              return (
                                                <td key={dg.id} className="px-2 py-1.5 border-b border-slate-100 text-center">
                                                  <button type="button" onClick={() => toggleAssign(m.id, dg.id)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${on ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
                                                    {on && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                  </button>
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Quick inserts */}
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="rounded-lg border border-slate-200 p-3 bg-white">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Activities & Interests</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {RUSH_INTERESTS.map(ri => {
                                      const on = (data.rushInterests || []).includes(ri.label);
                                      return (
                                        <button key={ri.id} type="button" onClick={() => on ? update("rushInterests", (data.rushInterests || []).filter((x: string) => x !== ri.label)) : addInterestQuick(ri.label)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${on ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"}`}>
                                          {ri.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="rounded-lg border border-slate-200 p-3 bg-white">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                                    <span>Upcoming Trips & Events</span>
                                    <button type="button" onClick={addEventQuick} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800">+ Add Event</button>
                                  </div>
                                  {((data.upcomingEvents || []).length === 0) ? (
                                    <div className="text-[10px] text-slate-400 italic">None yet — add one to thread it into the timeline.</div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {(data.upcomingEvents || []).map((evt: any) => (
                                        <div key={evt.id} className="flex items-center gap-1.5">
                                          <input value={evt.name || ""} onChange={e => update("upcomingEvents", (data.upcomingEvents || []).map((ev: any) => ev.id === evt.id ? { ...ev, name: e.target.value } : ev))} placeholder="Event name" className="flex-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 outline-none focus:border-indigo-400" />
                                          <select value={evt.type || "vacation_beach"} onChange={e => update("upcomingEvents", (data.upcomingEvents || []).map((ev: any) => ev.id === evt.id ? { ...ev, type: e.target.value } : ev))} className="rounded border border-slate-200 px-1 py-0.5 text-[10px] text-slate-600 bg-white">
                                            {RUSH_EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                          </select>
                                          <input type="date" value={evt.date || ""} onChange={e => update("upcomingEvents", (data.upcomingEvents || []).map((ev: any) => ev.id === evt.id ? { ...ev, date: e.target.value } : ev))} className="rounded border border-slate-200 px-1 py-0.5 text-[10px] text-slate-700 outline-none focus:border-indigo-400" />
                                          <button type="button" onClick={() => update("upcomingEvents", (data.upcomingEvents || []).filter((ev: any) => ev.id !== evt.id))} className="text-[10px] text-rose-400 hover:text-rose-600 px-1">×</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quick add custom delivery */}
                              <div className="rounded-lg border border-dashed border-indigo-300 p-3 bg-indigo-50/30">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-indigo-700">+ New custom delivery</span>
                                  <input id="builder-new-delivery-label" placeholder="Label (e.g. Halloween rush)" className="flex-1 rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 outline-none focus:border-indigo-400" />
                                  <input id="builder-new-delivery-date" type="date" className="rounded border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 outline-none focus:border-indigo-400" />
                                  <button type="button" onClick={() => {
                                    const labelEl = document.getElementById("builder-new-delivery-label") as HTMLInputElement | null;
                                    const dateEl = document.getElementById("builder-new-delivery-date") as HTMLInputElement | null;
                                    const label = labelEl?.value?.trim();
                                    const dateStr = dateEl?.value;
                                    if (!label || !dateStr) return;
                                    createCustomDelivery(label, dateStr, `manual_${safeUid()}`);
                                    if (labelEl) labelEl.value = "";
                                    if (dateEl) dateEl.value = "";
                                  }} className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-700">Add</button>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">Inserts a custom delivery group at the selected date. Address auto-resolves from the living timeline.</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Unified Delivery Timeline */}
                    {(() => {
                      const effectiveReturn = estimatedReturn || rushAddDays(now, 30);
                      const timelineStart = new Date(now);
                      const displacementDays = (effectiveReturn.getTime() - now.getTime()) / 86400000;
                      // Dynamic trailing: ≤30d=30d extra, 31-270d=proportional (1-3mo), >270d=90d max
                      const trailingDays = displacementDays <= 30 ? 30 : displacementDays > 270 ? 90 : 30 + ((displacementDays - 30) / 240) * 60;
                      const timelineEnd = new Date(effectiveReturn.getTime() + trailingDays * 86400000);
                      const totalMs = timelineEnd.getTime() - timelineStart.getTime();
                      const pct = (d: Date) => Math.max(0, Math.min(100, ((d.getTime() - timelineStart.getTime()) / totalMs) * 100));
                      const monthLabels: {label: string; pct: number}[] = [];
                      for (let m = new Date(timelineStart.getFullYear(), timelineStart.getMonth() + 1, 1); m <= timelineEnd; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
                        monthLabels.push({ label: m.toLocaleDateString("en-US", { month: "short" }), pct: pct(m) });
                      }
                      // Living situation bands — from timeline sequence or fallback
	                      const bands: {label: string; color: string; startPct: number; widthPct: number; address: string; textClass?: string}[] = [];
	                      if (timelineBands.length > 0) {
	                        timelineBands.forEach(b => {
	                          const sp = pct(b.startDate);
	                          const ep = pct(b.endDate);
	                          bands.push({ label: b.type, color: b.color, startPct: sp, widthPct: Math.max(ep - sp, 1), address: b.address });
	                        });
	                        const isStayingHome = data.livingStatus === "Staying in home";
	                        if (!isStayingHome) {
	                          const finalDelivery = deliveryGroups.find(dg => dg.id === "final" || dg.label === "Final Delivery");
	                          const homeStart = finalDelivery?.date || effectiveReturn;
	                          const homeStartPct = pct(homeStart);
	                          if (homeStartPct < 99) {
	                            bands.push({
	                              label: finalDelivery?.location || "Home",
	                              color: "bg-slate-200",
	                              startPct: homeStartPct,
	                              widthPct: Math.max(100 - homeStartPct, 1),
	                              address: finalDelivery?.address || primaryAddrStr,
	                              textClass: "text-slate-600",
	                            });
	                          }
	                        }
	                      } else {
                        if (hasHotel && hasRental) {
                          const hotelEnd = rushAddDays(now, isLongTerm ? 14 : 7);
                          bands.push({ label: "Hotel", color: "bg-amber-400", startPct: pct(now), widthPct: pct(hotelEnd) - pct(now), address: hotelAddrStr });
                          bands.push({ label: "Rental", color: "bg-sky-400", startPct: pct(hotelEnd), widthPct: pct(effectiveReturn) - pct(hotelEnd), address: rentalAddrStr });
                        } else if (hasHotel) {
                          bands.push({ label: "Hotel", color: "bg-amber-400", startPct: pct(now), widthPct: pct(effectiveReturn) - pct(now), address: hotelAddrStr });
                        } else if (hasRental) {
                          bands.push({ label: "Rental", color: "bg-sky-400", startPct: pct(now), widthPct: pct(effectiveReturn) - pct(now), address: rentalAddrStr });
                        } else {
                          // Staying home or no alternate address — single band
                          bands.push({ label: "Home", color: "bg-emerald-400", startPct: pct(now), widthPct: 100 - pct(now), address: primaryAddrStr });
                        }
                        // Only add return-home band for customers who were away
                        if (data.livingStatus && data.livingStatus !== "Staying in home" && (hasHotel || hasRental)) {
                          const returnPct = pct(effectiveReturn);
                          if (returnPct < 99) bands.push({ label: "Home", color: "bg-emerald-400", startPct: returnPct, widthPct: 100 - returnPct, address: primaryAddrStr });
                        }
                      }

                      // All possible pins
                      // SEASON_ICONS, HOLIDAY_ICONS, EVENT_ICONS imported from ./utils/rushGuideVisuals

                      const allPins: {id: string; label: string; icon: string; date: Date; pctPos: number; category: "season"|"holiday"|"event"; defaultOn: boolean}[] = [];
                      seasonChanges.forEach(sc => allPins.push({ id: `s_${sc.name}`, label: sc.name, icon: SEASON_ICONS[sc.name] || "📅", date: sc.startDate, pctPos: pct(sc.startDate), category: "season", defaultOn: true }));
                      holidayEvents.forEach(he => allPins.push({ id: he.id, label: he.name, icon: HOLIDAY_ICONS[he.name] || "🎉", date: he.date, pctPos: pct(he.date), category: "holiday", defaultOn: true }));
                      events.forEach(evt => { if (evt.date) { const d = new Date(evt.date); if (d <= timelineEnd) allPins.push({ id: `ev_${evt.id}`, label: evt.name || RUSH_EVENT_TYPES.find(t => t.id === evt.type)?.label || "Event", icon: EVENT_ICONS[evt.type] || "📌", date: d, pctPos: pct(d), category: "event", defaultOn: true }); } });

                      const pins = (rushGuideData as any).pins || {};
                      const pinPositions = (rushGuideData as any).pinPositions || {};
                      const isPinOn = (id: string, def: boolean) => pins[id] !== undefined ? pins[id] : def;
                      const togglePin = (id: string) => setRushGuideData((p: any) => ({ ...p, pins: { ...(p.pins || {}), [id]: !isPinOn(id, true) } }));

                      const timelineBarId = "rush-timeline-bar";
                      const handleDrag = (pinId: string, e: React.MouseEvent) => {
                        e.preventDefault();
                        const bar = document.getElementById(timelineBarId);
                        if (!bar) return;
                        const onMove = (me: MouseEvent) => {
                          const rect = bar.getBoundingClientRect();
                          const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
                          setRushGuideData((p: any) => ({ ...p, pinPositions: { ...(p.pinPositions || {}), [pinId]: x * 100 } }));
                        };
                        const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                        document.addEventListener("mousemove", onMove);
                        document.addEventListener("mouseup", onUp);
                      };

                      return (
                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-bold text-slate-800">Year-Ahead Timeline</div>
                              <div className="text-[10px] text-slate-500">Toggle pins to mark needs. Drag to reposition.</div>
                            </div>
                            <div className="text-[10px] text-slate-400">{rushFormatDate(now)} → {rushFormatDate(timelineEnd)}</div>
                          </div>
                          <div className="px-4 py-2 border-b border-slate-100 bg-amber-50/50">
                            <p className="text-[10px] text-amber-700 leading-relaxed">This timeline is based on estimated information as of {rushFormatDate(now)} and is likely to change as additional information is learned. Please use this as a guide and communicate new realities as they occur so dates can be adjusted. These are not intended to be firm appointments — all appointments will need to be confirmed.</p>
                          </div>

                          {/* Pin toggles */}
                          <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap gap-1.5">
                            {allPins.map(pin => {
                              const on = isPinOn(pin.id, pin.defaultOn);
                              return <button key={pin.id} onClick={() => togglePin(pin.id)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${on ? "border-teal-400 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-400 opacity-60"}`} title={`${pin.label} — ${rushFormatDate(pin.date)}`}>{pin.icon} {pin.label}</button>;
                            })}
                          </div>

                          {/* Timeline visualization */}
                          <div className="px-4 py-4">

                            {/* === ABOVE: Events (staggered heights) → Months → Bar === */}

                            {/* Event/season pins — staggered to avoid overlap */}
                            {(() => {
                              const activePins = allPins.filter(p => isPinOn(p.id, p.defaultOn))
                                .map(pin => ({ ...pin, pos: pinPositions[pin.id] !== undefined ? pinPositions[pin.id] : pin.pctPos }))
                                .sort((a, b) => a.pos - b.pos);
                              // Stagger: assign rows to avoid horizontal overlap (labels ~8% wide)
                              const rows: number[] = [];
                              const rowEnds: number[] = [];
                              activePins.forEach(pin => {
                                let row = 0;
                                for (let r = 0; r < rowEnds.length; r++) {
                                  if (pin.pos > rowEnds[r] + 8) { row = r; break; }
                                  row = r + 1;
                                }
                                rows.push(row);
                                rowEnds[row] = pin.pos;
                              });
                              const maxRow = rows.length ? Math.max(...rows) : 0;
                              const rowHeight = 18; // px per stagger row
                              const totalEventHeight = (maxRow + 1) * rowHeight + 16; // +16 for connector line
                              return (
                                <div className="relative mb-0.5" style={{ height: totalEventHeight }}>
                                  {activePins.map((pin, idx) => {
                                    const row = rows[idx];
                                    const topOffset = row * rowHeight;
                                    const lineHeight = totalEventHeight - topOffset - 14; // line from label to bottom edge
                                    return (
                                      <div key={pin.id} className="absolute cursor-grab active:cursor-grabbing group" style={{ left: `${pin.pos}%`, transform: "translateX(-50%)", top: topOffset }} onMouseDown={e => handleDrag(pin.id, e)} title={`${pin.label} — ${rushFormatDate(pin.date)} — drag to reposition`}>
                                        <div className="flex flex-col items-center">
                                          <div className="flex items-center gap-0.5">
                                            <span className="text-[10px]">{pin.icon}</span>
                                            <span className="text-[7px] font-bold text-slate-500 whitespace-nowrap group-hover:text-teal-700">{pin.label}</span>
                                          </div>
                                          <div className="w-px bg-slate-200 group-hover:bg-teal-400" style={{ height: lineHeight }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            {/* Month labels — tight above the bar */}
                            <div className="relative h-4">
                              {monthLabels.map((m, i) => (
                                <div key={i} className="absolute flex flex-col items-center" style={{ left: `${m.pct}%`, transform: "translateX(-50%)" }}>
                                  <span className="text-[9px] text-slate-400 font-bold">{m.label}</span>
                                  <div className="w-px h-1 bg-slate-300" />
                                </div>
                              ))}
                            </div>

                            {/* === THE BAR: Location bands === */}
                            <div className="relative">
                              {/* Drag indicator — outside overflow-hidden so it's not clipped */}
                              {(draggingDelivery || pendingDeliveryDateChange) && (() => {
                                const dp = draggingDelivery || (pendingDeliveryDateChange ? { pct: pct(parseLocalDate(pendingDeliveryDateChange.newDateStr) || new Date()) } : null);
                                if (!dp) return null;
                                const dropDate = new Date(timelineStart.getTime() + (dp.pct / 100) * (timelineEnd.getTime() - timelineStart.getTime()));
                                return <>
                                  <div className="absolute w-0.5 bg-sky-500 z-30 pointer-events-none" style={{ left: `${dp.pct}%`, transform: "translateX(-50%)", top: "0", bottom: "-55px" }} />
                                  <div className="absolute z-30 pointer-events-none" style={{ left: `${dp.pct}%`, transform: "translateX(-50%)", top: "-20px" }}>
                                    <div className="rounded bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap shadow-md">{rushFormatDate(dropDate)}</div>
                                  </div>
                                </>;
                              })()}
                              <div id="rush-timeline-bar" className="relative z-20 h-7 bg-slate-100 rounded-lg overflow-hidden">
                                {bands.map((b, i) => (
                                  <div key={i} className={`absolute top-0 bottom-0 ${b.color} flex items-center justify-center cursor-default`} style={{ left: `${b.startPct}%`, width: `${Math.max(b.widthPct, 1)}%` }} title={`${b.label}${b.address ? `\n→ ${b.address}` : ""}`}>
	                                    <span className={`text-[10px] font-bold truncate px-1 ${b.textClass || "text-white drop-shadow-sm"}`}>{b.label}</span>
                                  </div>
                                ))}
                                <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10" style={{ left: `${pct(now)}%` }} title="Today" />
                              </div>
                            </div>

                            {/* === BELOW THE BAR: Delivery markers with extended connectors for clustered dates === */}
                            {(() => {
                              const markerClearancePct = 10;
                              const markerLaneGapPx = 48;
                              const markerBaseConnectorPx = 6;
                              const markerRowsById: Record<string, number> = {};
                              const rowEnds: number[] = [];
                              deliveryGroups
                                .map(dg => ({ id: dg.id, pos: pct(dg.date) }))
                                .sort((a, b) => a.pos - b.pos)
                                .forEach(marker => {
                                  let row = rowEnds.findIndex(end => marker.pos > end + markerClearancePct);
                                  if (row === -1) row = rowEnds.length;
                                  markerRowsById[marker.id] = row;
                                  rowEnds[row] = marker.pos;
                                });
                              const maxMarkerRow = Math.max(0, ...Object.values(markerRowsById));
                              const markerAreaHeight = markerBaseConnectorPx + maxMarkerRow * markerLaneGapPx + 58;

                              return (
                            <div className="relative z-0 mt-0.5" style={{ height: `${markerAreaHeight}px` }}>
                              <div className="pointer-events-none absolute inset-0 z-0">
                                {deliveryGroups.map(dg => {
                                  const markerRow = markerRowsById[dg.id] || 0;
                                  const connectorHeight = markerBaseConnectorPx + markerRow * markerLaneGapPx;
                                  return (
                                    <div key={`${dg.id}-connector`} className="absolute top-0" style={{ left: `${pct(dg.date)}%`, transform: "translateX(-50%)" }}>
                                      <div className="w-px bg-slate-300" style={{ height: `${connectorHeight + 12}px` }} />
                                    </div>
                                  );
                                })}
                              </div>
                              {deliveryGroups.map((dg, i) => {
                                const markerRow = markerRowsById[dg.id] || 0;
                                const connectorHeight = markerBaseConnectorPx + markerRow * markerLaneGapPx;
                                return (
	                                <div key={dg.id} className={`absolute z-10 cursor-grab active:cursor-grabbing transition-transform ${draggingDelivery?.id === dg.id ? "scale-125 z-30 opacity-80" : pendingDeliveryDateChange?.id === dg.id ? "scale-110 z-20" : "hover:scale-110"}`} style={{ left: `${draggingDelivery?.id === dg.id ? draggingDelivery.pct : pendingDeliveryDateChange?.id === dg.id ? pct(parseLocalDate(pendingDeliveryDateChange.newDateStr) || dg.date) : pct(dg.date)}%`, transform: "translateX(-50%)", height: `${connectorHeight + 48}px` }}
                                  onMouseDown={e => {
                                    e.preventDefault();
                                    const bar = document.getElementById("rush-timeline-bar");
                                    if (!bar) return;
                                    const startX = e.clientX;
                                    let moved = false;
                                    const onMove = (me: MouseEvent) => {
                                      moved = true;
                                      const rect = bar.getBoundingClientRect();
                                      const x = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));
                                      setDraggingDelivery({ id: dg.id, pct: x });
                                    };
                                    const onUp = (me: MouseEvent) => {
                                      document.removeEventListener("mousemove", onMove);
                                      document.removeEventListener("mouseup", onUp);
                                      if (!moved || Math.abs(me.clientX - startX) < 5) {
                                        setDraggingDelivery(null);
                                        const el = document.getElementById(`delivery-card-${dg.id}`);
                                        if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("ring-2", "ring-offset-2", "ring-sky-400"); setTimeout(() => el.classList.remove("ring-2", "ring-offset-2", "ring-sky-400"), 2000); }
                                        return;
                                      }
                                      const rect = bar.getBoundingClientRect();
                                      const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
                                      const newDate = new Date(timelineStart.getTime() + x * (timelineEnd.getTime() - timelineStart.getTime()));
                                      const newDateStr = formatDateInputValue(newDate);
                                      const oldDateStr = formatDateInputValue(dg.date);
                                      setDraggingDelivery(null);
                                      if (!newDateStr || newDateStr === oldDateStr) return;
                                      setPendingDeliveryDateChange({
                                        id: dg.id, label: dg.label, oldDateStr, newDateStr,
                                        oldDateLabel: rushFormatDate(dg.date), newDateLabel: rushFormatDate(newDate),
                                        isFinal: dg.id === "final",
                                      });
                                    };
                                    document.addEventListener("mousemove", onMove);
                                    document.addEventListener("mouseup", onUp);
                                  }} title={`Drag to move · Click to view`}>
                                  <div className="relative z-10 flex flex-col items-center" style={{ paddingTop: `${connectorHeight}px` }}>
                                    <div className={`${dg.color} rounded-full w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold shadow-sm border-2 border-white ${draggingDelivery?.id === dg.id ? "ring-2 ring-sky-400 ring-offset-1" : ""}`}>{i + 1}</div>
                                    <div className="text-[7px] font-bold text-slate-600 whitespace-nowrap mt-0.5 bg-white/90 px-0.5 rounded">{dg.label}</div>
                                    <div className="text-[7px] text-slate-400 whitespace-nowrap bg-white/90 px-0.5 rounded">{draggingDelivery?.id === dg.id ? rushFormatDate(new Date(timelineStart.getTime() + (draggingDelivery.pct / 100) * (timelineEnd.getTime() - timelineStart.getTime()))) : pendingDeliveryDateChange?.id === dg.id ? pendingDeliveryDateChange.newDateLabel : rushFormatDate(dg.date)}</div>
                                  </div>
                                </div>);
                              })}
                            </div>
                              );
	                            })()}

	                          </div>

	                          {pendingDeliveryDateChange && (
	                            <div className="mx-4 mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm">
	                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
	                                <div className="min-w-0">
	                                  <div className="text-[11px] font-bold text-amber-900">Change {pendingDeliveryDateChange.label} date?</div>
	                                  <div className="text-[10px] text-amber-800">
	                                    {pendingDeliveryDateChange.oldDateLabel} → {pendingDeliveryDateChange.newDateLabel}
	                                    {pendingDeliveryDateChange.isFinal ? " This will also update the expected return date." : ""}
	                                  </div>
	                                </div>
	                                <div className="flex gap-2 shrink-0">
	                                  <button type="button" onClick={() => setPendingDeliveryDateChange(null)} className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[10px] font-bold text-amber-800 hover:bg-amber-100">Keep current</button>
	                                  <button type="button" onClick={() => applyDeliveryDateChange(pendingDeliveryDateChange)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700">Confirm change</button>
	                                </div>
	                              </div>
	                            </div>
	                          )}

	                          {/* Address legend — color-coded */}
	                          {bands.length > 0 && (
                            <div className="px-4 pb-2">
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Addresses:</span>
                                {bands.filter((b, bi, arr) => arr.findIndex(x => x.label === b.label) === bi).map((b, bi) => (
                                  <div key={bi} className="flex items-center gap-1">
                                    <div className={`w-3 h-3 rounded-sm ${b.color}`} />
                                    <span className="text-[9px] font-bold text-slate-600">{b.label}</span>
                                    {b.address && <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{b.address}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Delivery group cards with merged sublists */}
                          <div className="px-4 pb-4 space-y-3">
                            {deliveryGroups.map((dg, i) => {
                              // Find seasonal/event items assigned to this delivery group
                              const mergedSeasons = seasonalWardrobes.filter(sw => {
                                const ovr = (rushGuideData as any).seasonOverrides?.[sw.id] || {};
                                return (ovr.group || sw.assignedGroup) === dg.id;
                              });
                              const mergedEvents = (data.upcomingEvents || []).filter((evt: any) => {
                                const ovr = (rushGuideData as any).eventOverrides?.[evt.id] || {};
                                return ovr.group === dg.id;
                              });
                              return (
                              <div key={dg.id} id={`delivery-card-${dg.id}`} className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
	                                <div className={`${dg.color} px-4 py-3 text-white flex items-center gap-3`}>
	                                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm ring-2 ring-white/20">
	                                    <span className="text-xl font-bold leading-none">{i + 1}</span>
	                                  </div>
	                                  <div className="flex-1 min-w-0">
	                                    <div className="font-bold text-sm">{dg.icon} {dg.label}</div>
	                                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
	                                      <label className="min-w-[170px] flex-1 sm:flex-none">
	                                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/65">Date</span>
	                                        <input type="date" defaultValue={formatDateInputValue(dg.date)} key={`date-${dg.id}-v${deliveryDateVersion}`} onChange={e => {
	                                          const val = e.target.value;
	                                          if (!val) return;
	                                          if (dg.id.startsWith("custom_")) {
	                                            setRushGuideData((p: any) => ({ ...p, customDeliveries: (p.customDeliveries || []).map(cd => cd.id === dg.id ? { ...cd, dateStr: val } : cd) }));
	                                          } else {
	                                            setRushGuideData((p: any) => ({ ...p, groupOverrides: { ...(p.groupOverrides || {}), [dg.id]: { ...((p.groupOverrides || {})[dg.id] || {}), dateStr: val } } }));
	                                          }
	                                        }} className="h-9 w-full rounded-lg border border-white/30 bg-white/95 px-3 text-[13px] font-bold text-slate-800 outline-none focus:border-white focus:ring-2 focus:ring-white/40" />
	                                      </label>
	                                      <label className="min-w-0 flex-[2]">
	                                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-white/65">Address</span>
		                                        <select value={addressChoiceValue(dg)} onChange={e => {
		                                          const payload = addressPayloadFromChoice(e.target.value);
		                                          if (dg.id.startsWith("custom_")) {
		                                            setRushGuideData((p: any) => ({ ...p, customDeliveries: (p.customDeliveries || []).map(cd => cd.id === dg.id ? { ...cd, ...payload } : cd) }));
		                                          } else {
		                                            setRushGuideData((p: any) => ({ ...p, groupOverrides: { ...(p.groupOverrides || {}), [dg.id]: { ...((p.groupOverrides || {})[dg.id] || {}), ...payload } } }));
		                                          }
		                                        }} className="h-9 w-full rounded-lg border border-white/30 bg-white/95 px-3 text-[13px] font-bold text-slate-800 outline-none focus:border-white focus:ring-2 focus:ring-white/40">
		                                          <option value="">{dg.address || `${dg.location || "Delivery"} address...`}</option>
		                                          {orderAddressChoices.known.length > 0 && <optgroup label="★ EXISTING ADDRESSES ON THIS ORDER ★">
		                                            {orderAddressChoices.known.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
		                                          </optgroup>}
		                                          <optgroup label="＋ ADD PLACEHOLDER (address TBD)">
		                                            {orderAddressChoices.placeholders.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
		                                          </optgroup>
		                                        </select>
		                                      </label>
	                                    </div>
	                                  </div>
                                  {(() => { const GROUP_MAP: Record<string,string[]> = { rush: ["RD","RFD"], rental: ["STD","STFD"], "short-term": ["STD","STFD"], final: ["LTD","LTFD","RFD","STFD","LTFD"] }; const matched = (GROUP_MAP[dg.id] || []).filter(g => interviewGroups.includes(g)); const tip = matched.map(g => `${g}: ${SUGGESTED_GROUP_HELP[g] || g}`).join("\n"); return matched.length > 0 ? <span title={tip} className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold cursor-help">{matched.join("/")}</span> : null; })()}
                                  {(mergedSeasons.length > 0 || mergedEvents.length > 0) && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold">+{mergedSeasons.length + mergedEvents.length} added</span>}
                                  {dg.id.startsWith("custom_") && <button type="button" onClick={() => removeCustomDelivery(dg.id)} className="rounded-full bg-white/20 hover:bg-white/30 px-2 py-0.5 text-[9px] font-bold text-white" title="Delete this delivery group">Delete</button>}
                                </div>
	                                <div className="bg-white p-4 space-y-2">
	                                  {/* Core items */}
                                  {dg.items.map((item, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <span className="w-4 h-4 rounded border-2 border-slate-300 shrink-0 mt-0.5" />
                                      <span className="text-sm text-slate-700">{item}</span>
                                    </div>
                                  ))}
                                  {dg.householdTags && dg.householdTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {dg.householdTags.map((tag, j) => <span key={j} className="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">{tag}</span>)}
                                    </div>
                                  )}
                                  {/* Merged seasonal sublists — color-coded with remove button */}
                                  {mergedSeasons.map(sw => {
                                    const removeFromGroup = () => setRushGuideData((p: any) => ({...p, seasonOverrides: {...(p.seasonOverrides || {}), [sw.id]: {...((p.seasonOverrides || {})[sw.id] || {}), group: "unassigned"}}}));
                                    return (
                                    <div key={sw.id} className="mt-2 rounded-lg border-l-4 border-violet-400 bg-violet-50/40 px-3 py-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="text-[10px] font-bold text-violet-700">{sw.season} — {sw.date}</div>
                                        <button type="button" onClick={removeFromGroup} className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[9px] font-bold text-violet-500 hover:bg-violet-50 hover:text-violet-700 transition-all" title="Remove from this delivery">Remove</button>
                                      </div>
                                      {sw.items.map((item, j) => (
                                        <div key={j} className="flex items-start gap-2">
                                          <span className="w-3 h-3 rounded border border-violet-300 shrink-0 mt-0.5" />
                                          <span className="text-xs text-slate-600">{item}</span>
                                        </div>
                                      ))}
                                    </div>);
                                  })}
                                  {/* Delivery group notes */}
                                  <textarea
                                    value={(rushGuideData as any).deliveryNotes?.[dg.id] || ""}
                                    onChange={e => setRushGuideData((p: any) => ({ ...p, deliveryNotes: { ...(p.deliveryNotes || {}), [dg.id]: e.target.value } }))}
                                    placeholder="Notes for this delivery group..."
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-700 outline-none focus:border-blue-400 resize-none mt-2"
                                  />
                                  {/* Merged event sublists — color-coded with remove button */}
                                  {mergedEvents.map((evt: any) => {
                                    const evtItems: string[] = [];
                                    if (evt.type === "vacation_beach") { evtItems.push("Swimwear, resort wear, sandals", "Beach bags, sunglasses, luggage"); }
                                    else if (evt.type === "vacation_ski") { evtItems.push("Ski gear, thermal layers, boots, luggage"); }
                                    else if (evt.type === "wedding") { evtItems.push("Formal attire, dress shoes, accessories"); }
                                    else if (evt.type === "business") { evtItems.push("Business attire, briefcase, garment bags"); }
                                    else if (evt.type === "sports") { evtItems.push("Uniforms, cleats, gear"); }
                                    const removeFromGroup = () => setRushGuideData((p: any) => ({...p, eventOverrides: {...(p.eventOverrides || {}), [evt.id]: {...((p.eventOverrides || {})[evt.id] || {}), group: "unassigned"}}}));
                                    return (
                                      <div key={evt.id} className="mt-2 rounded-lg border-l-4 border-indigo-400 bg-indigo-50/40 px-3 py-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="text-[10px] font-bold text-indigo-700">{evt.name || "Event"} — {evt.date ? rushFormatDate(new Date(evt.date)) : ""}</div>
                                          <button type="button" onClick={removeFromGroup} className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[9px] font-bold text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all" title="Remove from this delivery">Remove</button>
                                        </div>
                                        {evtItems.map((item, j) => (
                                          <div key={j} className="flex items-start gap-2">
                                            <span className="w-3 h-3 rounded border border-indigo-300 shrink-0 mt-0.5" />
                                            <span className="text-xs text-slate-600">{item}</span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>);
                            })}
                            {/* Share buttons */}
                            <div className="px-4 pb-4 flex gap-2">
                              <button onClick={() => {
                                const lines = deliveryGroups.map((dg, i) => {
                                  const dgNotes = (rushGuideData as any).deliveryNotes?.[dg.id] || "";
                                  return `${i + 1}. ${dg.label} (${rushFormatDate(dg.date)})\n${dg.items.map(item => `  - ${item}`).join("\n")}${dgNotes ? `\n  Note: ${dgNotes}` : ""}`;
                                }).join("\n\n");
                                const text = `Rush Guide - ${data.orderName || "Order"}\n\n${lines}`;
                                if (navigator.share) { navigator.share({ title: "Rush Guide", text }); }
                                else { navigator.clipboard.writeText(text); setToast?.("Copied to clipboard"); }
                              }} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                Share / Copy
                              </button>
                              <button onClick={() => {
                                const lines = deliveryGroups.map((dg, i) => {
                                  const dgNotes = (rushGuideData as any).deliveryNotes?.[dg.id] || "";
                                  return `${i + 1}. ${dg.label} (${rushFormatDate(dg.date)})%0A${dg.items.map(item => `  - ${item}`).join("%0A")}${dgNotes ? `%0ANote: ${dgNotes}` : ""}`;
                                }).join("%0A%0A");
                                const subject = encodeURIComponent(`Rush Guide - ${data.orderName || "Order"}`);
                                window.open(`mailto:?subject=${subject}&body=${lines}`);
                              }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition-all">
                                Email
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Reminders */}
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                      <div className="text-xs font-bold text-amber-800 mb-2">Important Reminders</div>
                      <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">{reminders.map((r,i) => <li key={i}>{r}</li>)}</ul>
                    </div>

                    {/* (Delivery cards integrated into Gantt timeline below) */}

                    {/* Season Changes — optional deliveries to consider */}
                    {(() => {
                      const unassignedSeasons = seasonalWardrobes.filter(sw => {
                        const ovr = (rushGuideData as any).seasonOverrides?.[sw.id] || {};
                        const grp = ovr.group || sw.assignedGroup;
                        return !deliveryGroups.some(dg => dg.id === grp);
                      });
                      const unassignedEvents = eventDeliveries.filter((evt: any) => {
                        const ovr = (rushGuideData as any).eventOverrides?.[evt.id] || {};
                        const grp = ovr.group || "event";
                        return !deliveryGroups.some(dg => dg.id === grp);
                      });
                      return (unassignedSeasons.length > 0 || unassignedEvents.length > 0) ? <>
                      {unassignedSeasons.length > 0 && <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-slate-900">Optional Deliveries to Consider</div>
                          <div className="text-xs text-slate-500">{hasRental
                            ? "These seasonal items can be delivered to the rental, or included in Rush/Final."
                            : "If repairs run long, you may need these items. Include in Rush for now, or keep as a separate delivery to the hotel if/when needed. If they return home in time, these go in the Final Delivery."}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {unassignedSeasons.map(sw => {
                          const setGrp = (g: string) => setRushGuideData((p: any) => ({...p, seasonOverrides: {...(p.seasonOverrides || {}), [sw.id]: {...((p.seasonOverrides || {})[sw.id] || {}), group: g}}}));
                          return (
                            <div key={sw.id} className="rounded-xl border border-slate-200 overflow-hidden">
                              <div className="px-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-bold text-sm text-slate-800">{sw.season}</div>
                                    <div className="text-[10px] text-slate-500">{sw.date}{sw.events.length > 0 ? ` — ${sw.events.join(", ")}` : ""}</div>
                                  </div>
                                </div>
                                <div className="space-y-1 mb-3">
                                  {sw.items.map((item, j) => <div key={j} className="flex items-start gap-2"><span className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1" /><span className="text-xs text-slate-700">{item}</span></div>)}
                                </div>
                                {(
                                  <div className="flex gap-2">
                                    <div className="flex-1">
                                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Add to existing delivery</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {deliveryGroups.map((dg, di) => (
                                          <button key={dg.id} type="button" onClick={() => setGrp(dg.id)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all bg-white">
                                            #{di + 1} {dg.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="border-l border-slate-200 pl-2">
                                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or</div>
	                                      <button type="button" onClick={() => createCustomDelivery(`${sw.season} Delivery`, formatDateInputValue(sw.rawDate), sw.id)} className="rounded-lg border-2 border-dashed border-violet-300 px-3 py-1.5 text-[10px] font-bold text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-all bg-white">
                                        + Create New Delivery
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>}

                    {/* Trip/Event Deliveries — only unassigned */}
                    {unassignedEvents.length > 0 && <div>
                      <div className="text-lg font-bold text-slate-900 mb-3">Trip & Event Deliveries</div>
                      <div className="space-y-3">
                        {unassignedEvents.map((evt: any) => {
                          const ovr = (rushGuideData as any).eventOverrides?.[evt.id] || {};
                          const evtGrp = ovr.group || "event";
                          const setEvtGrp = (g: string) => setRushGuideData((p: any) => ({...p, eventOverrides: {...(p.eventOverrides || {}), [evt.id]: {...((p.eventOverrides || {})[evt.id] || {}), group: g}}}));
                          const assignedTarget = deliveryGroups.find(dg => dg.id === evtGrp);
                          const isAssigned = !!assignedTarget;
                          return (
                          <div key={evt.id} className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 py-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-bold text-sm text-slate-800">{evt.name}</div>
                                  <div className="text-[10px] text-slate-500">{evt.date}</div>
                                </div>
                              </div>
                              <div className="space-y-1 mb-3">
                                {evt.items.map((item: string, j: number) => <div key={j} className="flex items-start gap-2"><span className="w-3 h-3 rounded-full bg-slate-200 shrink-0 mt-1" /><span className="text-xs text-slate-700">{item}</span></div>)}
                              </div>
                              {(
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Add to existing delivery</div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {deliveryGroups.map((dg, di) => (
                                        <button key={dg.id} type="button" onClick={() => setEvtGrp(dg.id)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all bg-white">
                                          #{di + 1} {dg.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="border-l border-slate-200 pl-2">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Or</div>
                                    <button type="button" onClick={() => { if (evt.date) createCustomDeliveryForEvent(evt.name || "Event Delivery", evt.date, evt.id); else setEvtGrp("event"); }} className="rounded-lg border-2 border-dashed border-indigo-300 px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all bg-white">
                                      + Create New Delivery
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>);
                        })}
                      </div>
                    </div>}
                    </> : null;
                    })()}

                    {/* (Final delivery card integrated into Gantt timeline) */}

                    {/* Output Actions */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Share & Apply</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { navigator.clipboard?.writeText(buildFullText()).then(() => setToast("Full Rush Guide copied")); }} className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 text-left">
                          <div className="text-sm">Full Guide</div>
                          <div className="text-[10px] text-slate-400 font-normal">Copy complete guide for email/text to customer</div>
                        </button>
                        <button onClick={() => { navigator.clipboard?.writeText(buildRushOnlyText()).then(() => setToast("Rush-only list copied")); }} className="rounded-xl border border-teal-300 bg-white px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50 text-left">
                          <div className="text-sm">Rush Only</div>
                          <div className="text-[10px] text-slate-400 font-normal">Copy rush items only — send to customer for review</div>
                        </button>
                        <button onClick={() => {
                          const pickupText = buildPickupText();
                          setData(p => {
                            const current = (p.eventInstructions || "").trim();
                            const combined = current ? `${current}\n\n--- RUSH GUIDE PICKUP NOTES ---\n${pickupText}` : `--- RUSH GUIDE PICKUP NOTES ---\n${pickupText}`;
                            return { ...p, eventInstructions: combined };
                          });
                          setToast("Rush Guide added to pickup event instructions");
                        }} className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 text-left">
                          <div className="text-sm">Add to Pickup Event</div>
                          <div className="text-[10px] text-slate-400 font-normal">Add checklists to event instructions for crew review</div>
                        </button>
                        <button onClick={() => {
                          if (repairInfo) update("suggestedGroups", Array.from(new Set([...(data.suggestedGroups || []), repairInfo.group])));
                          setToast("Rush Guide applied to order");
                          setRushGuideOpen(false);
                        }} className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 text-left">
                          <div className="text-sm">Apply & Close</div>
                          <div className="text-[10px] text-teal-200 font-normal">Apply suggested groups to order and close</div>
                        </button>
                      </div>
                    </div>
                  </>;
                  })() : <div className="py-8 space-y-4 max-w-lg mx-auto">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📋</div>
                      <div className="text-lg font-bold text-slate-700">Set up the Rush Guide</div>
                      <p className="text-sm text-slate-500 mt-1">Answer these questions to generate the delivery timeline.</p>
                    </div>

                    {/* Required: Living Status — inline answer */}
                    <div className={`rounded-xl border-2 p-4 ${data.livingStatus || (data.livingTimeline || []).length > 0 ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                      <div className="flex items-start gap-2">
                        <span className={`text-lg mt-0.5 ${data.livingStatus || (data.livingTimeline || []).length > 0 ? "text-emerald-500" : "text-amber-500"}`}>{data.livingStatus || (data.livingTimeline || []).length > 0 ? "✓" : "1"}</span>
                        <div className="flex-1 space-y-2">
                          <div className="text-sm font-bold text-slate-700">Will the customer be able to stay in the home?</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => { const payload = addressPayloadFromChoice("type:Primary"); update("livingTimeline", [{ id: safeUid(), type: "Staying in home", duration: "Until repairs done", endDate: "", address: payload.address, addressType: payload.addressType, addressId: payload.addressId }]); update("livingStatus", "Staying in home"); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), living: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus === "Staying in home" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>Yes, staying home</button>
                            <button type="button" onClick={() => { if (data.livingStatus !== "Not staying in home" && data.livingStatus !== "Staying in home" && !data.livingStatus) update("livingStatus", "Not staying in home"); setRushGuideOpen(false); setTimeout(() => { setInterviewPanelOpen(true); setInterviewExpanded((p: any) => ({...p, living: true})); setTimeout(() => { const el = document.getElementById("noe-interview-timeline"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200); }, 100); }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus && data.livingStatus !== "Staying in home" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>No, staying elsewhere</button>
                          </div>
                          {data.livingStatus && (data.livingTimeline || []).length > 0 && <div className="text-xs text-emerald-600">{(data.livingTimeline || []).map((s: any) => s.type).join(" → ")}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Q2: How long will they be out */}
                    {data.livingStatus && data.livingStatus !== "Staying in home" && (() => {
                      const unit = (data as any).timeAwayUnit || "months";
                      const val = (data as any).estimatedTimeAwayValue || 0;
                      const maxVal = unit === "weeks" ? 8 : 18;
                      const durLabel = val === 0 ? "Not set" : `${val} ${unit === "weeks" ? (val === 1 ? "week" : "weeks") : (val === 1 ? "month" : "months")}`;
                      const hasDuration = val > 0;
                      return <div className={`rounded-xl border-2 p-4 ${hasDuration ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                        <div className="flex items-start gap-2">
                          <span className={`text-lg mt-0.5 ${hasDuration ? "text-emerald-500" : "text-amber-500"}`}>{hasDuration ? "✓" : "2"}</span>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-slate-700">How long will they be out?</div>
                              <div className="text-sm font-bold text-teal-700">{durLabel}</div>
                            </div>
                            <div className="flex rounded-full border border-slate-200 overflow-hidden w-fit">
                              <button type="button" onClick={() => { update("timeAwayUnit", "weeks"); update("estimatedTimeAwayValue", Math.min(val, 8)); }} className={`px-2.5 py-1 text-[10px] font-bold ${unit === "weeks" ? "bg-sky-500 text-white" : "bg-white text-slate-500"}`}>Weeks</button>
                              <button type="button" onClick={() => update("timeAwayUnit", "months")} className={`px-2.5 py-1 text-[10px] font-bold ${unit === "months" ? "bg-sky-500 text-white" : "bg-white text-slate-500"}`}>Months</button>
                            </div>
                            <input type="range" min={0} max={maxVal} step={1} value={val} onChange={e => { const v = parseInt(e.target.value); update("estimatedTimeAwayValue", v || ""); update("timeAwayUnit", unit); update("estimatedMonthsAway", unit === "months" ? v : ""); }} className="w-full accent-sky-500" />
                            <div className="flex justify-between text-[9px] text-slate-400">
                              {unit === "weeks" ? <><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span></> : <><span>0</span><span>3</span><span>6</span><span>9</span><span>12</span><span>15</span><span>18</span></>}
                            </div>
                          </div>
                        </div>
                      </div>;
                    })()}

                    {/* Q2/3: Final delivery or return date */}
                    {(() => {
                      const hasDate = !!(data.estimatedReturnDate || data.storageMonths || data.repairsSummary);
                      const stepNum = data.livingStatus === "Staying in home" ? "2" : "3";
                      return <div className={`rounded-xl border-2 p-4 ${hasDate ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                        <div className="flex items-start gap-2">
                          <span className={`text-lg mt-0.5 ${hasDate ? "text-emerald-500" : "text-amber-500"}`}>{hasDate ? "✓" : stepNum}</span>
                          <div className="flex-1 space-y-3">
                            <div className="text-sm font-bold text-slate-700">When is the final delivery or in-home date?</div>

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Target date</div>
                                <input type="date" defaultValue={data.estimatedReturnDate || ""} onBlur={e => { if (e.target.value && e.target.value !== data.estimatedReturnDate) update("estimatedReturnDate", e.target.value); }} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-teal-400" />
                              </div>
                              <div className="text-[10px] text-slate-400 pt-4">or</div>
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Storage months</div>
                                <input type="number" min="1" max="36" value={data.storageMonths || ""} onChange={e => update("storageMonths", e.target.value)} placeholder="#" className="w-16 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-teal-400 text-center" />
                              </div>
                            </div>

                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Or estimate from repair type</div>
                              <div className="flex flex-wrap gap-1">
                                {RUSH_REPAIR_TIMELINES.map(r => (
                                  <button key={r.id} type="button" onClick={() => update("repairsSummary", r.label)} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${(data.repairsSummary || "").includes(r.label) ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-300 text-slate-500 hover:border-slate-400 bg-white"}`}>{r.label} ({r.days}d)</button>
                                ))}
                              </div>
                            </div>

                            {hasDate && (() => {
                              const ri = RUSH_REPAIR_TIMELINES.find(r => (data.repairsSummary || "").includes(r.label));
                              const explicit = parseLocalDate(data.estimatedReturnDate);
                              const fromRepairs = ri ? rushAddDays(new Date(), ri.days) : null;
                              const fromStorage = data.storageMonths ? rushAddDays(new Date(), parseInt(data.storageMonths) * 30) : null;
                              const est = explicit || fromRepairs || fromStorage;
                              return est ? <div className="rounded-lg bg-teal-100 border border-teal-200 px-3 py-1.5 text-xs text-teal-800 font-bold">Estimated final: {rushFormatDate(est)}</div> : null;
                            })()}
                          </div>
                        </div>
                      </div>;
                    })()}

                    {/* Enhancing questions */}
                    <div className="text-xs text-slate-400 text-center pt-1">These questions also enhance the Rush Guide:</div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {[
                        { label: "Packout items", done: (data.packoutSummary || []).length > 0 },
                        { label: "Conditions", done: !!(data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y") },
                        { label: "Considerations", done: (data.sdsConsiderations || []).length > 0 },
                        { label: "Activities", done: (data.rushInterests || []).length > 0 },
                        { label: "Upcoming events", done: (data.upcomingEvents || []).length > 0 },
                        { label: "Pets", done: (data.household || []).some((m: any) => m.category === "pet") },
                      ].map(q => <span key={q.label} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${q.done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-200 text-slate-400"}`}>{q.done ? "✓" : "○"} {q.label}</span>)}
                    </div>
                    <div className="text-center">
                      <button onClick={() => { setRushGuideOpen(false); setTimeout(() => setInterviewPanelOpen(true), 100); }} className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600">Open Full Interview</button>
                    </div>
                  </div>}

                </div>
              </div>
            </div>
          );
        })()}

        {/* Old audit sidebar removed — now in Action Items panel */}
      
      {orderInstructionModal.isOpen && (
        <OrderInstructionModal
          state={orderInstructionModal}
          setState={setOrderInstructionModal}
          onClose={closeOrderInstructionModal}
          onSave={saveOrderInstruction}
        />
      )}
      {alertModal.isOpen && (
        <AlertModal
          state={alertModal}
          onClose={() => setAlertModal(createAlertModalState())}
          renderMessage={renderAlertMessageContent}
          renderDetail={renderAlertDetailContent}
        />
      )}
      {toastQueue.length > 0 && <ToastStack toasts={toastQueue} onRemove={removeToast} panelOffset={(interviewPanelOpen || actionItemsOpen) ? 480 : 0} />}
      {smartNotification && <SmartNotification message={smartNotification.message} onReject={rejectSmartAction} onClose={()=>setSmartNotification(null)} panelOffset={(interviewPanelOpen || actionItemsOpen) ? 480 : 0} />}
      {/* SDS Pre-Generation Questionnaire */}
      {showSdsQuestionnaire && (
        <SdsQuestionnaireModal
          serviceOfferings={data.serviceOfferings || []}
          tliScope={(data as any).tliScope || ""}
          setServiceOfferings={(next) => update("serviceOfferings", next)}
          setTliScope={(next) => update("tliScope", next)}
          onCancel={() => setShowSdsQuestionnaire(false)}
          onGenerate={() => { setShowSdsQuestionnaire(false); setShowSdsPreview(true); }}
        />
      )}

      {showSdsPreview && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col" onKeyDown={e => { if (e.key === "Escape") closeSds(); }} tabIndex={-1} ref={el => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}>
          <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 shadow-sm z-10 relative">
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
              <button onClick={() => { setShowSdsPreview(false); setEntryMode('detailed'); }} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Order</button>
              <button onClick={closeSds} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Scope</button>
              <button className="rounded-full px-3 py-1.5 text-xs font-bold bg-white text-sky-700 shadow-sm">SDS</button>
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={closeSds}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              ← Back
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
            <SdsDocument
              orderName={data.orderName || ""}
              claimNumber={data.claimNumber || ""}
              insuranceCompany={data.insuranceCompany || ""}
              insuranceAdjuster={data.insuranceAdjuster || ""}
              dateOfLoss={data.dateOfLoss || ""}
              policyNumber={data.policyNumber || ""}
              nationalCarrier={data.nationalCarrier || ""}
              orderTypes={data.orderTypes || []}
              primaryLossType={data.primaryLossType || ""}
              address={(() => { const a = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0] || {}; return [a.street, a.city, a.state].filter(Boolean).join(", "); })()}
              lossSeverity={data.lossSeverity}
              rooms={data.sdsRooms || []}
              lossDetails={data.lossDetails || {}}
              severityCodes={data.severityCodes || []}
              selectedServices={data.sdsServices || []}
              noeServiceOfferings={data.serviceOfferings || []}
              customers={data.customers || []}
              familyMedicalIssues={data.familyMedicalIssues}
              soapFragAllergies={data.soapFragAllergies}
              sdsConsiderations={data.sdsConsiderations || []}
              sdsObservations={data.sdsObservations || []}
              sdsServices={data.sdsServices || []}
              sdsPhotos={mergedSdsPhotos}
              sdsCoverPhoto={mergedSdsCoverPhoto}
              scopeBridge={scopeBridgeState}
              documentType="approval"
              orderNarrative={orderNarrative}
              orderNarrativeProse={(data as any).orderNarrativeProseOverride || buildNarrativeProse(orderNarrative, data)}
              rushGuideTimeline={buildRushGuideTimeline(data)}
              onClose={() => setShowSdsPreview(false)}
              onPhotoNoteChange={(photoId: string, note: string) => setData((prev) => updateSdsPhotoNote(prev, photoId, note))}
              onNarrativeChange={(prose: string[]) => {
                update("orderNarrativeProseOverride", prose);
              }}
            />
          </div>
        </div>
      )}
      {smartConfirm.isOpen && (
        <SmartConfirmModal state={smartConfirm} onResolve={resolveSmartConfirm} />
      )}
      {roleAssignModal.isOpen && (
        <RoleAssignModal
          state={roleAssignModal}
          getCompanyTypeForRoles={getCompanyTypeForRoles}
          toggleSelection={toggleRoleAssignmentSelection}
          onApply={applySelectedRoleAssignments}
          onSkip={closeRoleAssignmentPrompt}
          onGoBack={goBackFromRoleAssignmentPrompt}
          onClose={() => setRoleAssignModal(prev => ({ ...prev, isOpen: false }))}
        />
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Review & Save</h3>
                <div className="text-sky-100 text-xs mt-0.5">{orderNarrative.length} details captured{data.orderName ? ` — ${data.orderName}` : ""}</div>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-white/70 hover:text-white text-lg font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scroll flex-1">
              <SaveSummaryGates
                pendingIssues={scopeBridgeState.pendingIssues || []}
                missing={saveSummaryMissing}
                missingOpen={saveMissingOpen}
                setMissingOpen={setSaveMissingOpen}
              />
              <SaveSummaryPreview
                orderNarrative={orderNarrative}
                saveExportLines={saveExportLines}
                data={data}
                previewView={previewView as any}
                setPreviewView={setPreviewView}
              />
              <SaveSummaryActions
                onCopyNlt={() => {
                  const nlt = (data.orderName ? `NLT: ${data.orderName}\n\n` : "") + orderNarrative.map((l) => `${l.section}: ${l.text}`).join("\n");
                  copyLines(nlt.split("\n"));
                }}
                onCopyNarrative={() => {
                  const prose = buildNarrativeProse(orderNarrative, data).join("\n\n");
                  copyLines(prose.split("\n"));
                }}
                onDownloadSummary={() => downloadLinesAsFile(saveSummaryLines, "order-summary.txt")}
                onSendToEventInstructions={() => {
                  const narrative = orderNarrative.map((l) => `${l.section}: ${l.text}`).join("\n");
                  const existing = stripEventSystemLines(data.eventInstructions || "").trim();
                  const combined = existing ? `${existing}\n\n--- Order Summary ---\n${narrative}` : `--- Order Summary ---\n${narrative}`;
                  update("eventInstructions", composeEventInstructions(combined, data, conditionSummary));
                  setToast("Narrative added to Event Instructions");
                }}
              />
              <OutboundActionsPanel
                customers={data.customers || []}
                eventCustomerContacted={data.eventCustomerContacted}
                pickupDate={data.pickupDate}
                queuedOutbound={data.queuedOutbound || []}
                dismissedOutbound={(data as any).dismissedOutbound || []}
                setQueuedOutbound={(next) => update("queuedOutbound", next)}
                setDismissedOutbound={(next) => update("dismissedOutbound", next)}
              />
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setPreviewOpen(false)}>Close</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => { setPreviewOpen(false); validateGenerateScope(); }}
              >
                Save {recordWord}
              </button>
              <button
                className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-violet-700 flex items-center gap-1.5"
                onClick={() => { setPreviewOpen(false); validateGenerateScope(); setTimeout(() => setShowScope(true), 300); }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                Save & Scope
              </button>
            </div>
          </div>
        </div>
      )}
      
      {modal.type && (
        <QuickAddModal
          type={modal.type}
          value={modal.value}
          setValue={(v) => setModal((m) => ({ ...m, value: v }))}
          onClose={() => setModal({ type: "", value: "", onSave: null })}
          onSave={() => {
            const v = modal.value.trim();
            if (!v) return;
            if (modal.type === "company") setCompanies((p) => Array.from(new Set([...p, v])));
            if (modal.type === "contact") setContacts((p) => Array.from(new Set([...p, v])));
            modal.onSave(v);
            setModal({ type: "", value: "", onSave: null });
          }}
        />
      )}

      {showSampleDataModal && (
        <GlobalDirectoryModal
          rows={sampleContacts}
          setRows={setSampleContacts}
          updateCompanyCapability={updateCompanyCapability}
          getEligibleRoleLabels={getEligibleRoleLabels}
          onClose={() => setShowSampleDataModal(false)}
        />
      )}

      {showPresetModal && (
        <TestPresetsModal
          presetName={presetName} setPresetName={setPresetName}
          testPresets={testPresets}
          saveTestPreset={saveTestPreset}
          loadTestPreset={loadTestPreset}
          deleteTestPreset={deleteTestPreset}
          clearAllPresets={clearAllPresets}
          onClose={() => setShowPresetModal(false)}
          setData={setData}
          setToast={setToast}
        />
      )}

      {addNewSystemModal && (
        <AddNewSystemModal
          state={addNewSystemModal}
          setState={setAddNewSystemModal}
          companies={companies}
          vendors={data.vendors || []}
          update={update}
          setToast={setToast}
          onClose={() => setAddNewSystemModal(null)}
        />
      )}
      {addCompanyModalOpen && (
          <div className="mb-4">
          <div
            className="w-full rounded-2xl bg-white border-2 border-sky-200 shadow-sm overflow-visible fade-in"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!companyModalCloseArmed) return;
                setAddCompanyModalOpen(false);
                setShowTypePicker(false);
                setAddCompanyType("");
                setNewCompanyDraft({ contact: "", company: "" });
                setAddContactExisting({ contact: "", company: "" });
                setCompanyModalCloseArmed(false);
                setAddCompanyQuery("");
                setAddCompanyPanel("");
              }
              if (e.key === "Escape") {
                setAddCompanyModalOpen(false);
                setShowTypePicker(false);
                setAddCompanyType("");
                setNewCompanyDraft({ contact: "", company: "" });
                setAddContactExisting({ contact: "", company: "" });
                setCompanyModalCloseArmed(false);
                setAddCompanyQuery("");
                setAddCompanyPanel("");
              }
            }}
          >
            <div className="bg-sky-50 border-b border-sky-200 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <div className="text-sm font-bold text-sky-700">Add Existing Companies and Contacts</div>
              <button
                onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); setAddCompanyPanel(""); }}
                className="rounded-full border border-sky-200 px-3 py-1 text-[10px] font-bold text-sky-600 hover:bg-sky-100"
              >
                Close
              </button>
            </div>
            <div className="p-8 pb-10 space-y-5">
              <Field label="" subtle>
                <SearchSelect
                  value=""
                  onChange={(v) => {
                    const parsed = parseCombinedContact(v);
                    const inferredType = addCompanyType || autoTypeForCompany(parsed.company);
                    addCompanyFromSearch(inferredType, v);
                    setAddCompanyType("");
                    setAddCompanyQuery("");
                  }}
                  onQueryChange={(q) => { setCompanyModalCloseArmed(false); setAddCompanyQuery(q); }}
                  onEmptyEnter={() => {
                    if (companyModalCloseArmed) {
                      setAddCompanyModalOpen(false);
                      setShowTypePicker(false);
                      setAddCompanyType("");
                      setNewCompanyDraft({ contact: "", company: "" });
                      setAddContactExisting({ contact: "", company: "" });
                      setCompanyModalCloseArmed(false);
                      setAddCompanyQuery("");
                      setAddCompanyPanel("");
                    }
                  }}
                  clearOnCommit
                  inputRef={addCompanyInputRef}
                  options={combinedContactOptions}
                  maxResults={24}
                  menuClassName="max-h-[60vh] sm:max-h-[34rem]"
                  placeholder="Start typing a contact or company..."
                />
              </Field>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAddCompanyPanel("contact")}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${addCompanyPanel === "contact" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                >
                  Add New Contact to Existing Company
                </button>
                <button
                  onClick={() => setAddCompanyPanel("company")}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${addCompanyPanel === "company" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                >
                  Add New Company
                </button>
                <button
                  onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); setAddCompanyPanel(""); }}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                >
                  Close
                </button>
              </div>
              <div className="text-[10px] text-slate-400">Contacts must be added to a company.</div>

              {addCompanyPanel === "contact" && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <SearchSelect
                        value={addContactExisting.company}
                        onChange={(v) => setAddContactExisting(prev => ({ ...prev, company: v }))}
                        options={existingCompanyOptions}
                        placeholder="Company..."
                        clearOnCommit={false}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={splitName(addContactExisting.contact || "").first}
                        onChange={(e)=>setAddContactExisting(prev => ({ ...prev, contact: [e.target.value, splitName(prev.contact || "").last].filter(Boolean).join(" ") }))}
                        placeholder="First name"
                      />
                      <Input
                        value={splitName(addContactExisting.contact || "").last}
                        onChange={(e)=>setAddContactExisting(prev => ({ ...prev, contact: [splitName(prev.contact || "").first, e.target.value].filter(Boolean).join(" ") }))}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        const companyName = (addContactExisting.company || "").trim();
                        const contactName = (addContactExisting.contact || "").trim();
                        if (!companyName) {
                          setToast("Select a company.");
                          return;
                        }
                        if (!contactName) {
                          setToast("Contact required.");
                          return;
                        }
                        const type = resolveCompanyTypeForName(companyName);
                        addContactToCompany(type, contactName, companyName);
                        setAddContactExisting({ contact: "", company: "" });
                      }}
                      className="rounded-full bg-sky-500 px-3 py-1 text-[10px] font-bold text-white hover:bg-sky-600"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              )}

              {addCompanyPanel === "company" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={splitName(newCompanyDraft.contact || "").first}
                        onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, contact: [e.target.value, splitName(prev.contact || "").last].filter(Boolean).join(" ") })); }}
                        placeholder="First name (optional)"
                      />
                      <Input
                        value={splitName(newCompanyDraft.contact || "").last}
                        onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, contact: [splitName(prev.contact || "").first, e.target.value].filter(Boolean).join(" ") })); }}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <Input
                        value={newCompanyDraft.company}
                        onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, company: e.target.value })); }}
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      onClick={() => {
                        const type = addCompanyType || autoTypeForCompany(newCompanyDraft.company);
                        addCompanyDirect(type, newCompanyDraft.contact.trim(), newCompanyDraft.company.trim());
                        setNewCompanyDraft({ contact: "", company: "" });
                      }}
                      className="rounded-full bg-sky-500 px-3 py-1 text-[10px] font-bold text-white hover:bg-sky-600"
                    >
                      Add
                    </button>
                  </div>
                  {newCompanyDraft.contact && !newCompanyDraft.company && (
                    <div className="mt-2 text-[10px] font-semibold text-orange-600">Contacts must be added to a company.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmDetails && (
        <ConfirmAppointmentModal
          details={confirmDetails}
          pickupDate={data.pickupDate}
          pickupTime={data.pickupTime}
          eventVehicle={data.eventVehicle}
          eventAssignee={data.eventAssignee}
          eventFirm={!!data.eventFirm}
          pickupTimeTentative={!!data.pickupTimeTentative}
          primaryCustomer={data.customers?.[0] || {}}
          referringCompany={data.referringCompany}
          referrer={data.referrer}
          insuranceCompany={data.insuranceCompany}
          insuranceAdjuster={data.insuranceAdjuster}
          additionalCompanies={data.additionalCompanies || {}}
          contextOpen={confirmContextOpen}
          setContextOpen={setConfirmContextOpen}
          missingOk={confirmMissingOk}
          setMissingOk={setConfirmMissingOk}
          tentativeOk={confirmTentativeOk}
          setTentativeOk={setConfirmTentativeOk}
          onAddToCalendar={downloadIcs}
          onConfirm={() => { setToast("Appointment Confirmed & Sent!"); setConfirmDetails(null); }}
          onClose={() => setConfirmDetails(null)}
        />
      )}

      {livingAddressPrompt.open && !interviewPanelOpen && (
        <LivingAddressPrompt
          type={livingAddressPrompt.type}
          onClose={closeLivingAddressPrompt}
          onCreatePlaceholder={() => addLivingAddressFromPrompt("placeholder")}
          onEnterAddressNow={() => addLivingAddressFromPrompt("full")}
        />
      )}

      {groupLinkModal.open && (
        <GroupLinkModal
          group={groupLinkModal.group}
          addresses={data.addresses || []}
          getGroupLink={getGroupLink}
          setGroupLink={setGroupLink}
          clearGroupLink={clearGroupLink}
          mode={groupLinkAddressMode}
          setMode={setGroupLinkAddressMode}
          draft={groupLinkAddressDraft}
          setDraft={setGroupLinkAddressDraft}
          addPlaceholderAddress={addPlaceholderAddressToGroup}
          addFullAddress={addFullAddressToGroup}
          onClose={closeGroupLinkModal}
        />
      )}

      {reminderModalOpen && (
        <ReminderModal
          draft={reminderDraft}
          setDraft={setReminderDraft}
          currentUser={data.currentUser || ""}
          techs={TECHS.filter((t) => t !== "Unassigned")}
          reminderEnabled={!!data.reminderEnabled}
          onClose={() => setReminderModalOpen(false)}
          onClear={() => {
            updateMany({ reminderEnabled: false, reminderDate: "", reminderTime: "" });
            setReminderModalOpen(false);
          }}
          onSave={() => {
            updateMany({ reminderEnabled: true, reminderDate: reminderDraft.date, reminderTime: reminderDraft.time, reminderAssignee: reminderDraft.assignee || data.currentUser || "" });
            setReminderModalOpen(false);
            setToast("Reminder scheduled");
          }}
        />
      )}

      {welcomeModal.isOpen && (
        <WelcomeMessageModal
          state={welcomeModal}
          setState={setWelcomeModal}
          customer={(data.customers || []).find((c) => c.id === welcomeModal.customerId) || {}}
          currentOrderCustomerForms={currentOrderCustomerForms}
          showQuickNotes={showWelcomeQuickNotes}
          setShowQuickNotes={setShowWelcomeQuickNotes}
          onClose={() => setWelcomeModal({ isOpen: false, customerId: null, note: "", selectedSpecialDocs: [] })}
          onSend={() => {
            setToast("Welcome message sent!");
            setWelcomeModal({ isOpen: false, customerId: null, note: "", selectedSpecialDocs: [] });
          }}
        />
      )}

      {/* Edit Contact Modal */}
      {editContactModal?.isOpen && (
        <EditContactModal
          state={editContactModal}
          setState={setEditContactModal}
          isRoleActive={(role, contact, company) => {
            if (role === "Referrer") return data.referrer === contact || data.referringCompany === company;
            if (role === "Bill-To") return data.billingCompany === company;
            if (role === "Adjuster") return data.insuranceAdjuster === contact;
            return false;
          }}
          onAssignRole={(role, contact, company) => {
            if (role === "Referrer") { update("referrer", contact); update("referringCompany", company); }
            if (role === "Bill-To")  { update("billingCompany", company); update("billingContact", contact); }
            if (role === "Adjuster") { update("insuranceAdjuster", contact); update("adjusterCompany", company); }
          }}
          onClose={() => setEditContactModal(null)}
          onSave={() => {
            const m = editContactModal;
            const vendorIdx = (data.vendors || []).findIndex((v: any) => v.contact === m.contactName || v.company === m.companyName);
            if (vendorIdx >= 0) {
              const next = [...(data.vendors || [])];
              next[vendorIdx] = { ...next[vendorIdx], contact: m.contactName, company: m.companyName };
              update("vendors", next);
            }
            setEditContactModal(null);
            setToast?.("Contact updated");
          }}
        />
      )}

      {crmModal.isOpen && (
        <CrmLogModal
          state={crmModal}
          setState={setCrmModal}
          techs={TECHS.filter((t) => t !== "Unassigned")}
          onClose={() => setCrmModal({ isOpen: false, method: "", owner: "", subject: "", orderLink: "", notes: "", followUpEnabled: false, followUpDate: "", followUpTime: "", notifySalesRep: true, notifyOrderLead: true, notifyOthers: "" })}
          onSubmit={() => {
            const entry = {
              id: safeUid(),
              method: crmModal.method,
              owner: crmModal.owner,
              subject: crmModal.subject,
              orderLink: crmModal.orderLink,
              notes: crmModal.notes,
              followUp: crmModal.followUpEnabled ? { date: crmModal.followUpDate, time: crmModal.followUpTime } : null,
              notify: {
                salesRep: crmModal.notifySalesRep,
                orderLead: crmModal.notifyOrderLead,
                others: (crmModal.notifyOthers || "").split(",").map((v) => v.trim()).filter(Boolean),
              },
            };
            setData((prev) => ({ ...prev, crmLogs: [...(prev.crmLogs || []), entry] }));
            setToast(crmModal.followUpEnabled ? "CRM log submitted + follow-up reminder created" : "CRM log submitted");
            setCrmModal({ isOpen: false, method: "", owner: "", subject: "", orderLink: "", notes: "", followUpEnabled: false, followUpDate: "", followUpTime: "", notifySalesRep: true, notifyOrderLead: true, notifyOthers: "" });
            setTimeout(() => { const scroller = document.querySelector("[data-noe-scroll]") as HTMLElement; if (scroller) scroller.scrollTop = crmScrollRef.current; }, 50);
          }}
        />
      )}

      {planModalOpen && (
        <PlanOfActionModal
          steps={planDraftSteps}
          setSteps={setPlanDraftSteps}
          currentUser={data.currentUser || ""}
          salesReps={SALES_REPS}
          newStep={newPlanStep}
          setNewStep={setNewPlanStep}
          newAssignee={planAssignee}
          setNewAssignee={setPlanAssignee}
          onAddStep={addPlanStep}
          onToggleStep={togglePlanStep}
          onRemoveStep={removePlanStep}
          editingId={planEditingId}
          setEditingId={setPlanEditingId}
          editingText={planEditingText}
          setEditingText={setPlanEditingText}
          onCommitEdit={(id, nextText) => setData((p) => ({ ...p, planSteps: (p.planSteps || []).map((s) => s.id === id ? { ...s, text: nextText } : s) }))}
          onReassign={(id, nextAssignee) => {
            setPlanDraftSteps((prev) => prev.map((s) => s.id === id ? { ...s, assignee: nextAssignee } : s));
            setData((p) => ({ ...p, planSteps: (p.planSteps || []).map((s) => s.id === id ? { ...s, assignee: nextAssignee } : s) }));
          }}
          dragId={planDragId}
          setDragId={setPlanDragId}
          reorderDirty={planReorderDirty}
          setReorderDirty={setPlanReorderDirty}
          onCancelReorder={() => { setPlanDraftSteps(data.planSteps || []); setPlanReorderDirty(false); }}
          onConfirmReorder={() => { setData((p) => ({ ...p, planSteps: planDraftSteps })); setPlanReorderDirty(false); }}
          onClose={() => setPlanModalOpen(false)}
        />
      )}
    </React.Fragment>
  );
}
