// @ts-nocheck
// ScopeWizard — guided 5-step scoping flow extracted from App.tsx.
// Owns its own state (steps, room photos, walkthroughs, prop type,
// access details, interview answers); communicates with App.tsx via
// the onClose / onOrderUpdate / onShowOrder / onShowSds props.

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import SameDayScope from '../SameDayScope';
import SdsDocument from '../SdsDocument';
import { CreditCard, Globe, Lock, LockOpen, Shield, SquarePen, Tag, UserRound } from 'lucide-react';
import {
  buildScopeBridgeSnippet,
  createScopeBridgeState,
  normalizeScopeBridgeState,
  withScopeBridgeSnippet,
} from '../scopeBridgeUtils';
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
} from '../config';
import type { LoadTarget, LoadTrigger } from '../config';
import {
  ACTUAL_COMPANY_INSTRUCTION_LIBRARY,
  ACTUAL_CONTACT_INSTRUCTION_LIBRARY,
  SAMPLE_CONTACTS,
} from '../data/sampleSeed';
import { StartScreen } from './screens/StartScreen';
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
  RushGuideFamilyStep,
  RushGuideEventsStep,
  RushGuideReminders,
  RushGuideShareButtons,
  RushGuideOptionalDeliveries,
  RushGuideOutputActions,
  RushGuideSetupPanel,
  RushGuideDeliveryCards,
  RushGuideGanttTimeline,
  InterviewQuestionCard,
  CollapseInterviewRow,
} from './atoms';
import { getInitials, splitName, getRepInitials } from '../utils/names';
import { getOptionText, getBestMatch } from '../utils/search';
import { canonicalBridgeIssue, bridgeStageToneClass } from '../utils/bridge';
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
  computeOrderTypeNormalizationPatch,
  computeInsuranceInferencePatch,
} from '../utils/orderType';
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
} from '../utils/companyProfiles';
import {
  entryContactList,
  isCompanyPlaceholder,
  isContactPlaceholder,
  companyTypeRequiresContact,
  syncCompanyEntryPlaceholders,
} from '../utils/companyEntry';
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
} from '../config';
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
} from '../utils/instructions';
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
} from '../utils/strings';
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
  resolveAddressChoicePayload,
  resolveAddressChoiceValue,
  tryAppendAddressType,
  appendAddressAndLinkToGroupReducer,
} from '../utils/order';
import { formatPhoneNumber, formatCurrencyInput, getStaticMapUrl } from '../utils/format';
import { safeUid } from '../utils/uid';
import { initAddress, initCustomer, initLossSeverity, createOrderInstructionDraft } from '../utils/orderFactories';
import { createAlertModalState, createSmartConfirmState } from '../utils/modalState';
import { normalizeSampleContacts } from '../utils/normalizeSampleContacts';
import { DEFAULT_FORM } from '../data/defaultForm';
import { SAMPLE_PRESET_DATA } from '../data/samplePreset';
import { OLIVO_SAMPLE_PRESET } from '../data/olivoSamplePreset';
import { buildNarrativeProse } from '../utils/narrativeProse';
import { compressImage, captureFrameFromVideo } from '../utils/image';
import { useCamera } from '../hooks/useCamera';
import { useVoiceNote } from '../hooks/useVoiceNote';
import { getScopeInterviewSections } from '../data/scopeInterviewSections';
import {
  EVENT_SYSTEM_PREFIXES,
  stripEventSystemLines,
  buildEventSystemEntries,
  buildEventSystemLines,
  composeEventInstructions,
} from '../utils/eventInstructions';
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
} from '../utils/dateTime';
import { loadTargetsFromStorage, matchLoadTargets, SMART_TRIGGER_LABELS, shouldRetainSharedLoadItem, TRIGGER_TYPES, ACTION_TYPE_LABELS } from '../utils/loadTargets';
import { relevantScopeInstructionTypes } from '../utils/serviceMapping';
import { interviewAnswersFromOrderData, orderUpdatesFromInterviewAnswers } from '../utils/interviewMapping';
import { ACTION_ITEM_GROUPS, groupActionItems } from '../utils/actionItems';
import { buildFullExportLines, copyLinesToClipboard, downloadLinesAsFile, buildSaveSummaryLines } from '../utils/dataExport';
import { focusFirstFieldInSection, focusLastFieldInSection, scrollToSection, animateNavigationFocus, focusSearchLabel } from '../utils/domNav';
import { pickAutoAddressForDeliveryGroup, deliveryAddressTypeToProcessType } from '../utils/deliveryGroup';
import { toggleSeverityCode, updateLossDetailField, getLossSummary as getLossSummaryFor } from '../utils/lossDetails';
import { downloadOrderIcs } from '../utils/icsExport';
import { renderAlertMessageContent, renderAlertDetailContent } from '../utils/alertContent';
import {
  buildRushGuideTimeline,
  LIVING_SITUATION_MAP,
  REPAIR_TYPE_MAP,
  buildHouseholdComposition,
  buildRushGuideAddresses,
  buildRushGuideConditions,
  computeEstimatedReturn,
  resolveRushDeliveryAddresses,
  computeRushTimelineBands,
  computeRushSeasonChanges,
  computeRushHolidayEvents,
} from '../utils/rushGuideTimeline';
import { buildRushGuideActionPlan, buildRushGuideDeliveryGroups } from '../utils/rushGuideActionPlan';
import {
  getOrderCompanyNames,
  getOrderContactNames,
  getEstimateRequesterQuickOptions,
  resolveOrderPoc,
  applyOrderPocReducer,
  applyContactPocReducer,
  isPocContact as isPocContactFor,
  applyPrimaryPolicyHolderReducer,
  appendCustomerPlaceholderReducer,
  appendAddressPlaceholderReducer,
  togglePlanStepReducer,
} from '../utils/orderEntities';
import { buildBillingAssignmentCues, buildInsuranceAssignmentCues } from '../utils/assignmentCues';
import { computeSectionAuditStatus, computeAuditRequiredCount as computeAuditRequiredCountFor } from '../utils/auditStatus';
import { buildOrderNarrative } from '../utils/orderNarrative';
import { computeAuditMissing as computeAuditMissingFor } from '../utils/auditMissing';
import {
  buildCompanyRoleAssignments,
  dedupeAdditionalCompanyEntries,
  migrateReferringCompanyEntryReducer,
  upsertAdditionalCompanyReducer,
  applyAdditionalContactChangeReducer,
  applyBillingContactChangeReducer,
  applyAdjusterContactChangeReducer,
  applyInsuranceCompanyChangeReducer,
  addPlaceholderCompanyTypeReducer,
  addContactToCompanyReducer,
  removeAdditionalCompanyTypeReducer,
  findMatchingAdditionalCompanyType,
  removeAdditionalCompanyReducer,
} from '../utils/companyRoles';
import { computeAutoBridgeIssues } from '../utils/autoBridgeIssues';
import { mapAuditMissingToTargets } from '../utils/auditTargets';
import {
  buildContactCompanyMap,
  buildExistingCompanyOptions,
  buildGlobalDirectoryByCompany,
  orderCompanyRoles,
  upsertSampleContactReducer,
} from '../utils/companyDirectory';
import {
  normalizeCompanyType,
  resolveCompanyTypeForRoles,
  getCompanyRoleCapabilities as getCompanyRoleCapabilitiesFor,
  isRoleEligibleForCompany as isRoleEligibleForCompanyFor,
} from '../utils/roleEligibility';
import {
  filterRolePromptOptions,
  computeRolePromptDefaults,
  preferredRoleFromSource,
} from '../utils/rolePrompt';
import {
  buildCombinedContactOptions,
  parseCombinedContact as parseCombinedContactFor,
  getContactOptionsForCompany as getContactOptionsForCompanyFor,
  findSampleContact,
} from '../utils/contactOptions';
import { computeSuggestedReferrerRoles } from '../utils/referrerRoles';
import { buildActionItemPlaceholders, buildBillToBlockers } from '../utils/actionItemsData';
import {
  SMART_TRIGGER_REASONS,
  smartIsOff,
  computeSmartUpdateAdds,
  computeSmartUpdateRemovals,
  applySmartUpdateReducer,
  applySmartRemovalReducer,
} from '../utils/smartUpdates';
import {
  toggleBridgeMilestoneReducer,
  toggleProceedWithoutApprovalReducer,
  toggleBridgeIssueReducer,
  updateBridgeMilestoneReducer,
} from '../utils/bridgeMilestones';
import {
  resolveBridgePickupStep,
  resolveBridgeProcessStep,
  resolveBridgeDeliveryStep,
  applyBridgePickupStepReducer,
  applyBridgeProcessStepReducer,
  applyBridgeDeliveryStepReducer,
} from '../utils/bridgeStages';
import { buildKnownPeople } from '../utils/knownPeople';
import { buildCurrentOrderSpecialDocs, buildCurrentOrderCustomerForms } from '../utils/companyDocuments';
import { computePackoutLoadChanges } from '../utils/packoutLoadChanges';
import { dryHandlingPatch } from '../utils/dryHandlingCodes';
import { computeAutoOrderName } from '../utils/orderName';
import { updateSdsPhotoNote } from '../utils/sdsPhotoEdit';
import { mergeSdsPhotos } from '../utils/sdsPhotos';
import { bridgeStatusClass, bridgeSectionClass, deriveScopeBridgeStatus } from '../utils/bridgeStatus';
import { loadTestPresetsFromStorage, saveTestPresetsToStorage, upsertTestPresetByName } from '../utils/testPresets';
import { hydrateOrderFromParsed } from '../utils/orderHydrate';
import { loadJsonFromStorage, loadMergedRecordFromStorage, saveJsonToStorage } from '../utils/localStorageState';
import { SUBSECTION_TO_SECTION, DEFAULT_SUBSECTION_BY_SECTION, SUBSECTION_DOM_ID } from '../utils/sectionNav';
import {
  DURATION_DAYS, BAND_COLORS, DELIVERY_COLORS, STAY_TYPE_COLORS,
  SEASON_ICONS, HOLIDAY_ICONS, EVENT_ICONS, SEASON_DATES,
} from '../utils/rushGuideVisuals';

// --- ScopeWizard component ---

export const ScopeWizard = ({ onClose, orderData, onOrderUpdate, onShowOrder, onShowSds, showCoaching: parentShowCoaching = true, onToggleCoaching }: { onClose: () => void; orderData?: typeof DEFAULT_FORM; onOrderUpdate?: (updates: Partial<typeof DEFAULT_FORM>) => void; onShowOrder?: () => void; onShowSds?: () => void; showCoaching?: boolean; onToggleCoaching?: () => void }) => {
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
