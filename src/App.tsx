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
  SdsPreviewModal,
  SaveSummaryModal,
  AddressSection,
  CustomerSection,
  ScheduleSection,
  BillingCompaniesSection,
  OrderSection,
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
  computeOrderTypeNormalizationPatch,
  computeInsuranceInferencePatch,
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
  resolveAddressChoicePayload,
  resolveAddressChoiceValue,
  tryAppendAddressType,
  appendAddressAndLinkToGroupReducer,
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
import { buildFullExportLines, copyLinesToClipboard, downloadLinesAsFile, buildSaveSummaryLines } from './utils/dataExport';
import { focusFirstFieldInSection, focusLastFieldInSection, scrollToSection, animateNavigationFocus, focusSearchLabel } from './utils/domNav';
import { pickAutoAddressForDeliveryGroup, deliveryAddressTypeToProcessType } from './utils/deliveryGroup';
import { toggleSeverityCode, updateLossDetailField, getLossSummary as getLossSummaryFor } from './utils/lossDetails';
import { downloadOrderIcs } from './utils/icsExport';
import { renderAlertMessageContent, renderAlertDetailContent } from './utils/alertContent';
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
} from './utils/rushGuideTimeline';
import { buildRushGuideActionPlan, buildRushGuideDeliveryGroups } from './utils/rushGuideActionPlan';
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
} from './utils/orderEntities';
import { buildBillingAssignmentCues, buildInsuranceAssignmentCues } from './utils/assignmentCues';
import { computeSectionAuditStatus, computeAuditRequiredCount as computeAuditRequiredCountFor } from './utils/auditStatus';
import { buildOrderNarrative } from './utils/orderNarrative';
import { computeAuditMissing as computeAuditMissingFor } from './utils/auditMissing';
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
} from './utils/companyRoles';
import { computeAutoBridgeIssues } from './utils/autoBridgeIssues';
import { mapAuditMissingToTargets } from './utils/auditTargets';
import {
  buildContactCompanyMap,
  buildExistingCompanyOptions,
  buildGlobalDirectoryByCompany,
  orderCompanyRoles,
  upsertSampleContactReducer,
} from './utils/companyDirectory';
import {
  normalizeCompanyType,
  resolveCompanyTypeForRoles,
  getCompanyRoleCapabilities as getCompanyRoleCapabilitiesFor,
  isRoleEligibleForCompany as isRoleEligibleForCompanyFor,
} from './utils/roleEligibility';
import {
  filterRolePromptOptions,
  computeRolePromptDefaults,
  preferredRoleFromSource,
} from './utils/rolePrompt';
import {
  buildCombinedContactOptions,
  parseCombinedContact as parseCombinedContactFor,
  getContactOptionsForCompany as getContactOptionsForCompanyFor,
  findSampleContact,
} from './utils/contactOptions';
import { computeSuggestedReferrerRoles } from './utils/referrerRoles';
import { buildActionItemPlaceholders, buildBillToBlockers } from './utils/actionItemsData';
import {
  SMART_TRIGGER_REASONS,
  smartIsOff,
  computeSmartUpdateAdds,
  computeSmartUpdateRemovals,
  applySmartUpdateReducer,
  applySmartRemovalReducer,
} from './utils/smartUpdates';
import {
  toggleBridgeMilestoneReducer,
  toggleProceedWithoutApprovalReducer,
  toggleBridgeIssueReducer,
  updateBridgeMilestoneReducer,
} from './utils/bridgeMilestones';
import {
  resolveBridgePickupStep,
  resolveBridgeProcessStep,
  resolveBridgeDeliveryStep,
  applyBridgePickupStepReducer,
  applyBridgeProcessStepReducer,
  applyBridgeDeliveryStepReducer,
} from './utils/bridgeStages';
import { buildKnownPeople } from './utils/knownPeople';
import { buildCurrentOrderSpecialDocs, buildCurrentOrderCustomerForms } from './utils/companyDocuments';
import { computePackoutLoadChanges } from './utils/packoutLoadChanges';
import { dryHandlingPatch } from './utils/dryHandlingCodes';
import { computeAutoOrderName } from './utils/orderName';
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
const getSdsIconImageClass = (item) => SDS_ICON_CLASS_OVERRIDES[item] || "h-full w-full object-contain object-center";
import { ScopeWizard } from './components/ScopeWizard';
import { QuickEntry } from './components/QuickEntry';
export default function App(){
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
    setData(prev => applyOrderPocReducer(prev, target));
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
    setData(prev => applyContactPocReducer(prev, companyName, contactName, contactType, safeUid()));
  }, [setOrderPoc, orderPoc]);

  const isPocContact = (companyName, contactName) =>
    isPocContactFor(orderPoc, companyName, contactName);

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
      const currentLoadList = new Set<string>(data.loadList || []);
      const currentHandling = new Set<string>(data.handlingCodes || []);
      const currentOrderTypes = new Set<string>(data.orderTypes || []);
      const { loadListAdded, addHandling } = computeSmartUpdateAdds(k, v, currentLoadList, currentHandling);
      const pendingRemovals = computeSmartUpdateRemovals(k, v, currentLoadList, currentHandling, currentOrderTypes, data);

      if (loadListAdded.length > 0) {
        const reason = SMART_TRIGGER_REASONS[k] || "condition selected";
        setSmartNotification({ message: `Bring: ${loadListAdded.join(', ')} added because ${reason}`, loadListToRemove: loadListAdded });
        setConditionAutoFillHints(prev => ({ ...prev, [k]: loadListAdded.join(', ') }));
        setTimeout(() => setConditionAutoFillHints(prev => { const next = { ...prev }; delete next[k]; return next; }), 4000);
      }

      setData(prev => applySmartUpdateReducer(prev, k, v, loadListAdded, addHandling));

      const hasPendingRemovals = pendingRemovals.load.length || pendingRemovals.handling.length || pendingRemovals.orderTypes.length;
      if (smartIsOff(v) && hasPendingRemovals) {
        const label = SMART_TRIGGER_LABELS[k] || "this condition";
        const autoAdded = (data.autoAddedOrderTypes || []) as string[];
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

        const details: string[] = [];
        if (pendingRemovals.load.length) details.push(`Bring Instructions: ${pendingRemovals.load.join(", ")}`);
        if (pendingRemovals.handling.length) details.push(`Handling Codes: ${pendingRemovals.handling.join(", ")}`);
        if (manualTypes.length) details.push(`Order Type: ${manualTypes.join(", ")}`);

        if (details.length > 0) {
          openSmartConfirm({
            title: "Remove Smart-Triggered Fields?",
            message: `Since "${label}" is no longer selected, do you want to remove these linked fields?`,
            details,
            confirmLabel: "Yes, Remove",
            cancelLabel: "Keep Fields",
            onConfirm: () => setData(prev => applySmartRemovalReducer(prev, { load: pendingRemovals.load, handling: pendingRemovals.handling, orderTypes: manualTypes })),
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
      const patch = tryAppendAddressType(prev, type, placeholder, initAddress, createPlaceholderFlag);
      if (!patch) return prev;
      created = true;
      return { ...prev, ...patch };
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
    const { needsPlaceholder, ...payload } = resolveAddressChoicePayload(
      choiceValue,
      data.addresses || [],
      formatOrderAddressLine,
    );
    if (needsPlaceholder) ensureAddressType(needsPlaceholder, { placeholder: true });
    return payload;
  }, [data.addresses, ensureAddressType]);
  const addressChoiceValue = useCallback(
    (record: any = {}) =>
      resolveAddressChoiceValue(record, data.addresses || [], ORDER_ADDRESS_TYPES, formatOrderAddressLine),
    [data.addresses]
  );

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
    const nextName = computeAutoOrderName(data);
    if (nextName && nextName !== data.orderName) update("orderName", nextName);
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
    setData(prev => appendAddressAndLinkToGroupReducer(prev, group, newAddress));
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
    setData(prev => appendAddressAndLinkToGroupReducer(prev, group, newAddress));
    setToast("Address added and linked.");
    setGroupLinkAddressMode("select");
    setGroupLinkAddressDraft({ type: "", street: "", city: "", state: "", zip: "" });
  };

  useEffect(() => {
    const selected = data.packoutSummary || [];
    const { added, removeCandidates, removedSelections } = computePackoutLoadChanges(
      selected,
      prevPackoutSummaryRef.current || [],
      data.loadList || [],
      PACKOUT_LOAD_MAP,
    );
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
      const { addCodes, removeCodes } = dryHandlingPatch(v);
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
    setData(p => appendAddressPlaceholderReducer(p, initAddress({
      id: addressId,
      isLossSite: false,
      type: "",
      placeholder: createPlaceholderFlag("address", "Address type needed"),
    })));
    setPendingAddressTypePromptId(addressId);
    setToast("Address placeholder added. Select a Type now, or leave it for later.");
  }, [setToast]);
  
  const addNewCustomer = useCallback(() => {
    setData(p => appendCustomerPlaceholderReducer(p, initCustomer({
      type: "",
      policyHolder: false,
      isPrimary: false,
      placeholder: createPlaceholderFlag("customer", "Customer details needed"),
    })));
  }, []);

  const handleAddressTypePromptFocused = useCallback((addressId) => {
    setPendingAddressTypePromptId(prev => (prev === addressId ? "" : prev));
  }, []);

  useEffect(() => {
    const insuranceRelated = data.involvesInsurance === "Yes" && hasRestorationOrderType(data.orderTypes || []);
    setData(prev => applyPrimaryPolicyHolderReducer(prev, insuranceRelated));
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
    setData(p => togglePlanStepReducer(p, id));
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

  const buildSaveSummary = () => buildSaveSummaryLines(data);

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

  const computeAuditRequiredCount = () => computeAuditRequiredCountFor(data, SEVERITY_GROUPS);

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

  const currentOrderSpecialDocs = useMemo(
    () => buildCurrentOrderSpecialDocs(orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile),
    [orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile]
  );
  const currentOrderCustomerForms = useMemo(
    () => buildCurrentOrderCustomerForms(orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile),
    [orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile]
  );
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
      Object.keys(p.highlightMissing || {}).forEach(k => { highlight[k] = missingKeys.has(k); });
      missingKeys.forEach(k => { highlight[k] = true; });
      return { ...p, highlightMissing: highlight };
    });
    const { sections, subsections, codesNeedsOpen } = mapAuditMissingToTargets(missing);
    if (codesNeedsOpen) setOpenCodes(true);
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

  const toggleScopeBridgeIssue = useCallback(
    (issue) => patchScopeBridge((prev) => toggleBridgeIssueReducer(prev, issue)),
    [patchScopeBridge]
  );

  const toggleScopeBridgeMilestone = useCallback(
    (milestoneId, atId) => patchScopeBridge((prev) => toggleBridgeMilestoneReducer(prev, milestoneId, atId)),
    [patchScopeBridge]
  );

  const toggleProceedWithoutApproval = useCallback(
    () => patchScopeBridge(toggleProceedWithoutApprovalReducer),
    [patchScopeBridge]
  );

  const updateScopeBridgeMilestone = useCallback(
    (milestoneKey, value) => patchScopeBridge((prev) => updateBridgeMilestoneReducer(prev, milestoneKey, value)),
    [patchScopeBridge]
  );
  const autoBridgeIssues = useMemo(
    () => computeAutoBridgeIssues(
      data,
      scopeBridgeState.milestones || {},
      currentOrderSpecialDocs,
      { specialPaperwork: SPECIAL_PAPERWORK_BLOCKER, unknownInsurance: UNKNOWN_INSURANCE_BLOCKER },
    ),
    [
      scopeBridgeState.milestones,
      data.estimateRequested,
      data.estimateRequestedBy,
      data.estimateApprovedAt,
      data.insuranceCompany,
      currentOrderSpecialDocs,
    ]
  );
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
  const selectedBridgePickupStep = useMemo(
    () => resolveBridgePickupStep(scopeBridgeState.pickupOption),
    [scopeBridgeState.pickupOption]
  );
  const selectedBridgeProcessStep = useMemo(
    () => resolveBridgeProcessStep(scopeBridgeState.processingOption),
    [scopeBridgeState.processingOption]
  );
  const selectedBridgeDeliveryStep = useMemo(
    () => resolveBridgeDeliveryStep(scopeBridgeState),
    [scopeBridgeState.deliveryOption, scopeBridgeState.nextStep, scopeBridgeState.processingOption]
  );
  const setBridgePickupStep = useCallback(
    (optionId) => patchScopeBridge((prev) => applyBridgePickupStepReducer(prev, optionId)),
    [patchScopeBridge]
  );
  const setBridgeProcessStep = useCallback(
    (optionId) => patchScopeBridge((prev) => applyBridgeProcessStepReducer(prev, optionId)),
    [patchScopeBridge]
  );
  const setBridgeDeliveryStep = useCallback(
    (optionId) => patchScopeBridge((prev) => applyBridgeDeliveryStepReducer(prev, optionId)),
    [patchScopeBridge]
  );
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

  // Directory derivations (contactCompanyMap / existingCompanyOptions /
  // globalDirectoryByCompany) — see utils/companyDirectory.
  const contactCompanyMap = useMemo(
    () => buildContactCompanyMap(data, sampleContacts),
    [data.additionalCompanies, data.billingContact, data.billingCompany, sampleContacts]
  );
  const existingCompanyOptions = useMemo(
    () => buildExistingCompanyOptions(companies, data),
    [companies, data.additionalCompanies]
  );
  const globalDirectoryByCompany = useMemo(
    () => buildGlobalDirectoryByCompany(sampleContacts),
    [sampleContacts]
  );

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

  const visibleCompanyRoles = useMemo(
    () => orderCompanyRoles(companyRoleAssignments, companyRolesExpanded),
    [companyRoleAssignments, companyRolesExpanded]
  );

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
  const knownPeople = useMemo(() => buildKnownPeople(data), [data]);

  const companySet = useMemo(() => new Set(companies), [companies]);

  // Combined contact picker — see utils/contactOptions.
  const combinedContactOptions = useMemo(
    () => buildCombinedContactOptions(contacts, companies, contactCompanyMap, sampleContacts),
    [contacts, companies, contactCompanyMap, sampleContacts]
  );

  const parseCombinedContact = (value) =>
    parseCombinedContactFor(value, companySet, contactCompanyMap);

  // Role-eligibility helpers — see utils/roleEligibility.
  const getCompanyTypeForRoles = useCallback(
    (companyName = "") => resolveCompanyTypeForRoles(companyName, data, sampleContacts, autoTypeForCompany),
    [data.additionalCompanies, sampleContacts]
  );

  const getCompanyRoleCapabilities = useCallback(
    (companyName = "", typeOverride = "") =>
      getCompanyRoleCapabilitiesFor(companyName, typeOverride, data, sampleContacts, autoTypeForCompany),
    [data.additionalCompanies, sampleContacts]
  );

  const isRoleEligibleForCompany = useCallback(
    (roleId, companyName, typeOverride = "") =>
      isRoleEligibleForCompanyFor(
        roleId,
        companyName,
        typeOverride,
        data,
        sampleContacts,
        INSURANCE_ELIGIBLE_COMPANY_TYPES,
        NATIONAL_CARRIERS,
        autoTypeForCompany,
      ),
    [data.additionalCompanies, sampleContacts]
  );

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

  const getRolePromptOptions = useCallback(
    (company, contact, skipRoles = [], forceRoles = []) =>
      filterRolePromptOptions({
        badges: CONTACT_ROLE_BADGES,
        company,
        contact,
        data,
        skipRoles,
        forceRoles,
        companyTypeHint: getCompanyTypeForRoles(company || ""),
        isRoleEligibleForCompany,
      }),
    [
      data.referringCompany,
      data.referrer,
      data.insuranceCompany,
      data.insuranceAdjuster,
      data.billingCompany,
      data.billingContact,
      isRoleEligibleForCompany,
      getCompanyTypeForRoles,
    ]
  );

  const openRoleAssignmentPrompt = useCallback(({ company, contact, source = "", skipRoles = [], preferredRoles = [], forceRoles = [] }) => {
    const nextCompany = (company || "").trim();
    const nextContact = (contact || "").trim();
    if (!nextCompany && !nextContact) return;
    const options = getRolePromptOptions(nextCompany, nextContact, skipRoles, forceRoles);
    if (!options.length) return;
    const matchedContact = nextContact
      ? sampleContacts.find(c => normalizeContact(c.name || "") === normalizeContact(nextContact))
      : null;
    const companyTypeHint = getCompanyTypeForRoles(nextCompany);
    const selectedDefaults = computeRolePromptDefaults({
      options,
      forceRoles,
      preferredRoles,
      preferredFromSource: preferredRoleFromSource(source),
      capabilities: getCompanyRoleCapabilities(nextCompany, companyTypeHint),
      titleHint: matchedContact?.title || "",
      companyTypeHint,
    });
    setRoleAssignModal({
      isOpen: true,
      source,
      company: nextCompany,
      contact: nextContact,
      options,
      selected: selectedDefaults
    });
  }, [getRolePromptOptions, getCompanyTypeForRoles, sampleContacts, getCompanyRoleCapabilities]);

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

  const suggestedReferrerRoles = useMemo(
    () => computeSuggestedReferrerRoles(data, NATIONAL_CARRIERS),
    [data.referringCompany, data.referrer]
  );

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
    setData(prev => removeAdditionalCompanyReducer(prev, type));
  };

  const registerContactCompany = (contact, company) => {
    if (contact && !contacts.includes(contact)) {
      setContacts(prev => Array.from(new Set([...prev, contact])));
    }
    if (company && !companies.includes(company)) {
      setCompanies(prev => Array.from(new Set([...prev, company])));
    }
    if (contact && company) {
      setSampleContacts(prev => upsertSampleContactReducer(prev, contact, company, safeUid(), autoTypeForCompany));
    }
  };

  const addCompanyFromSearch = (type, value) => {
    if (!type) return;
    const parsed = parseCombinedContact(value);
    if (parsed.contact && !parsed.company) {
      setToast("Company required for contact.");
      return;
    }
    const existingType = findMatchingAdditionalCompanyType(data.additionalCompanies || {}, parsed.company, parsed.contact);
    if (existingType && existingType === type) {
      triggerAutoFlash(`company-${existingType}`);
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
    const existingType = findMatchingAdditionalCompanyType(data.additionalCompanies || {}, company, contact);
    if (existingType && existingType === nextType) {
      triggerAutoFlash(`company-${existingType}`);
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

  const getContactOptionsForCompany = (company) =>
    getContactOptionsForCompanyFor(company, contacts, contactCompanyMap, sampleContacts);

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
    setData(prev => addContactToCompanyReducer(prev, type, name, companyName));
    registerContactCompany(name, companyName);
    triggerAutoFlash(`company-${type}`);
    openRoleAssignmentPrompt({
      source: "quick-add-contact",
      company: companyName,
      contact: name
    });
  };

  const getSalesRepForContact = (name) => findSampleContact(name, sampleContacts)?.salesRep || "";
  const getTitleForContact = (name) => findSampleContact(name, sampleContacts)?.title || "";

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
    setData(prev => addPlaceholderCompanyTypeReducer(prev, type));
    setCompanyEdit(prev => ({ ...prev, [type]: true }));
  };

  const toggleCompanyRoleNeeded = (role) => {
    if (!role?.type) return;
    const entry = data.additionalCompanies?.[role.type];
    const sourceCompany = role.source ? (data[role.source] || "") : "";
    const hasCompany = !!(sourceCompany || entry?.company);
    if (hasCompany) return;
    if (entry && !entry.company) {
      setData(prev => removeAdditionalCompanyTypeReducer(prev, role.type));
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
    setData(prev => migrateReferringCompanyEntryReducer(prev, legacyEntry, inferredType));
  }, [data.additionalCompanies, data.referringCompany]);

  useEffect(() => {
    const { cleaned, nextTypes, changed } = dedupeAdditionalCompanyEntries(
      data.additionalCompanies || {},
      data.additionalCompanyTypes || [],
    );
    if (changed) {
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
    let resolvedTargetType = nextType;
    setData(prev => {
      const { next, targetType } = upsertAdditionalCompanyReducer(
        prev, nextType, entry, existingForType, incomingCompany
      );
      resolvedTargetType = targetType;
      return next;
    });
    setCompanyEdit(prev => ({ ...prev, [resolvedTargetType]: false }));
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
    setData(prev => applyAdditionalContactChangeReducer(prev, type, contact, suggested || ""));
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

    setData(prev => applyBillingContactChangeReducer(prev, contact, parsed.company, resolvedCompany));

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
    setData((prev) => applyInsuranceCompanyChangeReducer(prev, company, linkedCarrier, isNonRestorationProject));
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

    setData(prev => applyAdjusterContactChangeReducer(prev, contact, parsed.company, resolvedCompany));

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
      const patch = computeOrderTypeNormalizationPatch(prev);
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
      const patch = computeInsuranceInferencePatch(
        prev, inferredBillingCarrier, inferredInsuranceCarrier, primaryCarrier, linkedCarrier
      );
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

                    <OrderSection
                      data={data}
                      update={update}
                      updateMany={updateMany}
                      setData={setData}
                      setToast={setToast}
                      openSections={openSections}
                      handleToggleSection={handleToggleSection}
                      handleConfirmClick={handleConfirmClick}
                      goToNextSection={goToNextSection}
                      handleNextSectionKeyDown={handleNextSectionKeyDown}
                      compactMode={compactMode}
                      auditOn={auditOn}
                      auditTargets={auditTargets}
                      orderSubOpen={orderSubOpen}
                      setOrderSubOpen={setOrderSubOpen}
                      sourceSubOpen={sourceSubOpen}
                      setSourceSubOpen={setSourceSubOpen}
                      codesSubOpen={codesSubOpen}
                      setCodesSubOpen={setCodesSubOpen}
                      expandedService={expandedService}
                      setExpandedService={setExpandedService}
                      openCodes={openCodes}
                      setOpenCodes={setOpenCodes}
                      minimizedLossTypes={minimizedLossTypes}
                      setMinimizedLossTypes={setMinimizedLossTypes}
                      manualEditLossTypes={manualEditLossTypes}
                      setManualEditLossTypes={setManualEditLossTypes}
                      lastLossDetailTouched={lastLossDetailTouched}
                      setLastLossDetailTouched={setLastLossDetailTouched}
                      autoScrollDone={autoScrollDone}
                      setAutoScrollDone={setAutoScrollDone}
                      showCoaching={showCoaching}
                      dismissedCoaching={dismissedCoaching}
                      setDismissedCoaching={setDismissedCoaching}
                      isFieldVisible={isFieldVisible}
                      coaching={coaching}
                      dismissTip={dismissTip}
                      tipVisible={tipVisible}
                      combinedContactOptions={combinedContactOptions}
                      parseCombinedContact={parseCombinedContact}
                      companies={companies}
                      suggestedReferrerRoles={suggestedReferrerRoles}
                      applyReferrerRoles={applyReferrerRoles}
                      getSalesRepForContact={getSalesRepForContact}
                      openCrmModal={openCrmModal}
                      triggerAutoFlash={triggerAutoFlash}
                      getFlashClass={getFlashClass}
                      toggleNonRestorationPrimary={toggleNonRestorationPrimary}
                      toggleRestorationType={toggleRestorationType}
                      selectNonRestorationSubtype={selectNonRestorationSubtype}
                      toggleLossType={toggleLossType}
                      dismissedTips={dismissedTips}
                      attentionWater={attentionWater}
                      attentionMold={attentionMold}
                      setModal={setModal}
                      setInterviewPanelOpen={setInterviewPanelOpen}
                      jumpToSectionAndSubsection={jumpToSectionAndSubsection}
                      openEditOrderInstructionModal={openEditOrderInstructionModal}
                      removeOrderInstruction={removeOrderInstruction}
                      toggleOrderInstructionPreset={toggleOrderInstructionPreset}
                      toggleHandling={toggleHandling}
                      getInstructionIdentity={getInstructionIdentity}
                      updateLossDetail={updateLossDetail}
                      getLossSummary={getLossSummary}
                      toggleMinimizeLoss={toggleMinimizeLoss}
                      toggleSeverity={toggleSeverity}
                      isNonRestorationProject={isNonRestorationProject}
                      isRestorationProject={isRestorationProject}
                      projectType={projectType}
                      isPlaceholderFlagActive={isPlaceholderFlagActive}
                      showInlineHelp={showInlineHelp}
                      recordWord={recordWord}
                      recordTypeLabel={recordTypeLabel}
                      codeSummary={codeSummary}
                      conditionSummary={conditionSummary}
                      orderNameInputRef={orderNameInputRef}
                      setAddNewSystemModal={setAddNewSystemModal}
                      setShowQuickInstructions={setShowQuickInstructions}
                      openRoleAssignmentPrompt={openRoleAssignmentPrompt}
                      autoTypeForCompany={autoTypeForCompany}
                      selectedBridgePickupStep={selectedBridgePickupStep}
                      selectedBridgeProcessStep={selectedBridgeProcessStep}
                      selectedBridgeDeliveryStep={selectedBridgeDeliveryStep}
                      setBridgePickupStep={setBridgePickupStep}
                      setBridgeProcessStep={setBridgeProcessStep}
                      setBridgeDeliveryStep={setBridgeDeliveryStep}
                      activeBridgeIssues={activeBridgeIssues}
                      bridgeEstimateDetails={bridgeEstimateDetails}
                    />

                    <CustomerSection
                      data={data}
                      contacts={contacts}
                      isOpen={openSections.sec2}
                      compact={compactMode}
                      auditOn={auditOn}
                      auditOutline={auditOn && auditTargets.sections.has("sec2")}
                      householdEditOpen={householdEditOpen}
                      setHouseholdEditOpen={setHouseholdEditOpen}
                      interviewPanelOpen={interviewPanelOpen}
                      setInterviewPanelOpen={setInterviewPanelOpen}
                      orderPoc={orderPoc}
                      setOrderPoc={setOrderPoc}
                      update={update}
                      setData={setData}
                      setToast={setToast}
                      updateCust={updateCust}
                      removeCust={removeCust}
                      addNewCustomer={addNewCustomer}
                      addHouseholdMember={addHouseholdMember}
                      handleSendWelcome={handleSendWelcome}
                      handleToggleSection={handleToggleSection}
                      goToNextSection={goToNextSection}
                      handleNextSectionKeyDown={handleNextSectionKeyDown}
                    />

                    <AddressSection
                      data={data}
                      isOpen={openSections.sec3}
                      compact={compactMode}
                      auditOn={auditOn}
                      auditOutline={auditOn && auditTargets.sections.has("sec3")}
                      showPrimaryCoords={showPrimaryCoords}
                      pendingAddressTypePromptId={pendingAddressTypePromptId}
                      updateAddr={updateAddr}
                      removeAddr={removeAddr}
                      update={update}
                      setData={setData}
                      setToast={setToast}
                      verifyAddressDemo={verifyAddressDemo}
                      handleAddressTypePromptFocused={handleAddressTypePromptFocused}
                      addNewAddress={addNewAddress}
                      handleToggleSection={handleToggleSection}
                      goToNextSection={goToNextSection}
                      handleNextSectionKeyDown={handleNextSectionKeyDown}
                    />

                    <BillingCompaniesSection
                      data={data}
                      setData={setData}
                      update={update}
                      updateMany={updateMany}
                      setToast={setToast}
                      openSections={openSections}
                      handleToggleSection={handleToggleSection}
                      handleConfirmClick={handleConfirmClick}
                      goToNextSection={goToNextSection}
                      handleNextSectionKeyDown={handleNextSectionKeyDown}
                      compactMode={compactMode}
                      auditOn={auditOn}
                      auditTargets={auditTargets}
                      companiesSubOpen={companiesSubOpen}
                      setCompaniesSubOpen={setCompaniesSubOpen}
                      billingSubOpen={billingSubOpen}
                      setBillingSubOpen={setBillingSubOpen}
                      financeSubOpen={financeSubOpen}
                      setFinanceSubOpen={setFinanceSubOpen}
                      insuranceSubOpen={insuranceSubOpen}
                      setInsuranceSubOpen={setInsuranceSubOpen}
                      companyRolesExpanded={companyRolesExpanded}
                      setCompanyRolesExpanded={setCompanyRolesExpanded}
                      pendingCompanyRoleCount={pendingCompanyRoleCount}
                      visibleCompanyRoles={visibleCompanyRoles}
                      combinedContactOptions={combinedContactOptions}
                      parseCombinedContact={parseCombinedContact}
                      autoTypeForCompany={autoTypeForCompany}
                      addCompanyFromSearch={addCompanyFromSearch}
                      addCompanyDirect={addCompanyDirect}
                      addContactToCompany={addContactToCompany}
                      toggleCompanyRoleNeeded={toggleCompanyRoleNeeded}
                      openCompanyRolePicker={openCompanyRolePicker}
                      upsertAdditionalCompany={upsertAdditionalCompany}
                      removeAdditionalCompany={removeAdditionalCompany}
                      setAddCompanyType={setAddCompanyType}
                      setAddCompanyModalOpen={setAddCompanyModalOpen}
                      setAddNewSystemModal={setAddNewSystemModal}
                      setShowTypePicker={setShowTypePicker}
                      addCompanyInputRef={addCompanyInputRef}
                      companyEdit={companyEdit}
                      setCompanyEdit={setCompanyEdit}
                      companies={companies}
                      companySet={companySet}
                      contacts={contacts}
                      contactCompanyMap={contactCompanyMap}
                      sampleContacts={sampleContacts}
                      handleBillingContactChange={handleBillingContactChange}
                      handleInsuranceCompanyChange={handleInsuranceCompanyChange}
                      handleAdjusterContactChange={handleAdjusterContactChange}
                      handleAdditionalContactChange={handleAdditionalContactChange}
                      getCompanyTypeForRoles={getCompanyTypeForRoles}
                      getRolesForContact={getRolesForContact}
                      toggleRoleForContact={toggleRoleForContact}
                      getEligibleRoleLabels={getEligibleRoleLabels}
                      getCompanyProfile={getCompanyProfile}
                      getContactProfile={getContactProfile}
                      getContactOptionsForCompany={getContactOptionsForCompany}
                      coaching={coaching}
                      showCoaching={showCoaching}
                      dismissedCoaching={dismissedCoaching}
                      setDismissedCoaching={setDismissedCoaching}
                      isFieldVisible={isFieldVisible}
                      isPocContact={isPocContact}
                      flagContactAsPoc={flagContactAsPoc}
                      isNonRestorationProject={isNonRestorationProject}
                      linkedInsuranceCarrier={linkedInsuranceCarrier}
                      insuranceCarrierLinkMissing={insuranceCarrierLinkMissing}
                      requestNationalCarrierLink={requestNationalCarrierLink}
                      orderAddressChoices={orderAddressChoices}
                      addressChoiceValue={addressChoiceValue}
                      addressPayloadFromChoice={addressPayloadFromChoice}
                      billingAssignmentCues={billingAssignmentCues}
                      billingAssignmentLinked={billingAssignmentLinked}
                      billingAssignmentUnlocked={billingAssignmentUnlocked}
                      setBillingAssignmentUnlocked={setBillingAssignmentUnlocked}
                      insuranceAssignmentCues={insuranceAssignmentCues}
                      insuranceAssignmentLinked={insuranceAssignmentLinked}
                      insuranceAssignmentUnlocked={insuranceAssignmentUnlocked}
                      setInsuranceAssignmentUnlocked={setInsuranceAssignmentUnlocked}
                      getTitleForContact={getTitleForContact}
                      companyRolesFor={companyRolesFor}
                      attentionMold={attentionMold}
                      setModal={setModal}
                      openPrimaryCustomerText={openPrimaryCustomerText}
                      orderLevelInstructions={orderLevelInstructions}
                      orderInstructionSelectionSet={orderInstructionSelectionSet}
                      markInstructionKeysSeen={markInstructionKeysSeen}
                      sessionInstructionKeys={sessionInstructionKeys}
                      setSessionInstructionKeys={setSessionInstructionKeys}
                      currentOrderSpecialDocs={currentOrderSpecialDocs}
                      currentOrderCustomerForms={currentOrderCustomerForms}
                      recordWord={recordWord}
                      estimateRequesterQuickOptions={estimateRequesterQuickOptions}
                      interviewGroups={data.suggestedGroups || []}
                      triggerAutoFlash={triggerAutoFlash}
                      getFlashClass={getFlashClass}
                      setEditContactModal={setEditContactModal}
                      formatPhoneNumber={formatPhoneNumber}
                      formatCurrencyInput={formatCurrencyInput}
                      setOrderInstructionModal={setOrderInstructionModal}
                    />

                    <ScheduleSection
                      data={data}
                      update={update}
                      updateMany={updateMany}
                      setData={setData}
                      openSections={openSections}
                      setOpenSections={setOpenSections}
                      handleToggleSection={handleToggleSection}
                      handleConfirmClick={handleConfirmClick}
                      goToNextSection={goToNextSection}
                      handleNextSectionKeyDown={handleNextSectionKeyDown}
                      compactMode={compactMode}
                      auditOn={auditOn}
                      auditTargets={auditTargets}
                      scheduleSubOpen={scheduleSubOpen}
                      setScheduleSubOpen={setScheduleSubOpen}
                      scheduleBridgeOpen={scheduleBridgeOpen}
                      setScheduleBridgeOpen={setScheduleBridgeOpen}
                      setBridgePickupStep={setBridgePickupStep}
                      setBridgeProcessStep={setBridgeProcessStep}
                      setBridgeDeliveryStep={setBridgeDeliveryStep}
                      selectedBridgePickupStep={selectedBridgePickupStep}
                      selectedBridgeProcessStep={selectedBridgeProcessStep}
                      selectedBridgeDeliveryStep={selectedBridgeDeliveryStep}
                      setActionItemsOpen={setActionItemsOpen}
                      setActionItemsBlockerOpen={setActionItemsBlockerOpen}
                      setEditSystemInstructions={setEditSystemInstructions}
                      setEventNoteDraft={setEventNoteDraft}
                      setNowDate={setNowDate}
                      setNowTime={setNowTime}
                      setShowAllEventNotes={setShowAllEventNotes}
                      setShowLoadListPanel={setShowLoadListPanel}
                      setShowQuickInstructions={setShowQuickInstructions}
                      setShowSdsQuestionnaire={setShowSdsQuestionnaire}
                      setEntryMode={setEntryMode}
                      setToast={setToast}
                      showQuickInstructions={showQuickInstructions}
                      showLoadListPanel={showLoadListPanel}
                      showAllEventNotes={showAllEventNotes}
                      editSystemInstructions={editSystemInstructions}
                      eventNoteDraft={eventNoteDraft}
                      dateCloseTick={dateCloseTick}
                      timeCloseTick={timeCloseTick}
                      addEventNote={addEventNote}
                      toggleScopeBridgeMilestone={toggleScopeBridgeMilestone}
                      updateScopeBridgeMilestone={updateScopeBridgeMilestone}
                      downloadIcs={downloadIcs}
                      eventSystemLines={eventSystemLines}
                      eventSystemEntries={eventSystemEntries}
                      hasEventInstructions={hasEventInstructions}
                      scopeBridgeState={scopeBridgeState}
                      knownPeople={knownPeople}
                      bridgeSectionClassNames={bridgeSectionClassNames}
                      bridgeStatusClassNames={bridgeStatusClassNames}
                      conditionSummary={conditionSummary}
                      eventNoteInputRef={eventNoteInputRef}
                      openReminderModal={openReminderModal}
                      toggleProceedWithoutApproval={toggleProceedWithoutApproval}
                      matchLoadTargets={matchLoadTargets}
                      DEFAULT_LOAD_TARGETS={DEFAULT_LOAD_TARGETS}
                      QUICK_INSTRUCTION_NOTES={QUICK_INSTRUCTION_NOTES}
                      formatShortTimestamp={formatShortTimestamp}
                    />
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
                  const summary = [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural" : "", data.noLights ? "No Power" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""].filter(Boolean).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.conditions === true;
                  const toggleItems = [
                    { id: "wet", label: "Still Wet", active: data.damageWasWet === "Y" || data.damageWasWet === true, onToggle: () => updateSmart("damageWasWet", (data.damageWasWet === "Y" || data.damageWasWet === true) ? "N" : "Y") },
                    { id: "mold", label: "Visible Mold", active: !!data.damageMoldMildew, onToggle: () => updateSmart("damageMoldMildew", !data.damageMoldMildew) },
                    { id: "structural", label: "Structural Damage", active: data.structuralElectricDamage === "Y", onToggle: () => update("structuralElectricDamage", data.structuralElectricDamage === "Y" ? "N" : "Y") },
                    { id: "lights", label: "No Electricity", active: !!data.noLights, onToggle: () => updateSmart("noLights", !data.noLights) },
                    { id: "heat", label: "No Heat", active: !!data.noHeat, onToggle: () => updateSmart("noHeat", !data.noHeat) },
                    { id: "boarded", label: "Boarded Up", active: !!data.boardedUp, onToggle: () => updateSmart("boardedUp", !data.boardedUp) },
                  ];
                  return (
                    <InterviewQuestionCard
                      number={1}
                      title="Is anything still wet or damaged?"
                      collapsedLabel="Conditions"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      onToggle={() => {
                        setInterviewExpanded(p => ({ ...p, conditions: !p.conditions }));
                        if (!log) setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), conditions: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {toggleItems.map(item => (
                          <ToggleMulti key={item.id} label={item.label} checked={item.active} onChange={() => { item.onToggle(); executeInterviewActions(item.label, !item.active); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(item.label) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && toggleItems
                        .filter(i => i.active && interviewActions[i.label]?.coaching && !dismissedCoaching.has(`c-${i.label}`))
                        .map(i => (
                          <div key={i.label} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                            <div className="flex-1">🎓 <span className="font-bold">{i.label}:</span> {interviewActions[i.label].coaching}</div>
                            <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${i.label}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                          </div>
                        ))}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, conditions: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Repairs (Q2) */}
                {isFieldVisible("repairsSummary") && matchesInterviewSearch("repairs contractor", "Just Cleaning Paint Refinish Floors Replace Floors Cosmetic Damage Major Structural Complete Rebuild", data.repairsSummary) && (() => {
                  const log = (data.interviewLog || {}).repairs;
                  const hasAnswers = !!data.repairsSummary;
                  const summary = data.repairsSummary || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.repairs === true;
                  const REPAIR_TYPES = ["Just Cleaning", "Paint", "Refinish Floors", "Replace Floors", "Cosmetic Damage", "Major Structural Damage", "Complete Rebuild"];
                  return (
                    <InterviewQuestionCard
                      number={2}
                      title="What repairs are being done by the contractor?"
                      collapsedLabel="Repairs"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      onToggle={() => {
                        setInterviewExpanded(p => ({ ...p, repairs: !p.repairs }));
                        if (!log && hasAnswers) setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), repairs: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                      }}
                    >
                      {showCoaching && !dismissedCoaching.has("c-repairs") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <span className="flex-1">{coaching("section.repairs")}</span>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-repairs"]))} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {REPAIR_TYPES.map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.repairsSummary || "").includes(s)} onChange={() => {
                            const current = (data.repairsSummary || "").split(", ").filter(Boolean);
                            const isAdding = !current.includes(s);
                            const next = isAdding ? [...current, s] : current.filter(x => x !== s);
                            update("repairsSummary", next.join(", "));
                            executeInterviewActions(s, isAdding);
                          }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && REPAIR_TYPES
                        .filter(s => (data.repairsSummary || "").includes(s) && interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`))
                        .map(s => (
                          <div key={s} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                            <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                            <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                          </div>
                        ))}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, repairs: false }))} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Packout Scope (Q3) */}
                {matchesInterviewSearch("packout packing", "No Packout Content Manipulation Partial Packout Full Packout packing furniture", (data as any).packoutScope, (data as any).packoutNote) && (() => {
                  const log = (data.interviewLog || {}).packoutScope;
                  const hasAnswers = !!(data as any).packoutScope;
                  const summary = (data as any).packoutScope || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.packoutScope === true;
                  const PACKOUT_SCOPES = INTERVIEW_PACKOUT_SCOPES;
                  const scope = (data as any).packoutScope;
                  return (
                    <InterviewQuestionCard
                      number={3}
                      title="Will packing out of hard furnishings be necessary?"
                      collapsedLabel="Packout"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      onToggle={() => setInterviewExpanded(p => ({ ...p, packoutScope: !p.packoutScope }))}
                    >
                      <div className="flex flex-wrap gap-2">
                        {PACKOUT_SCOPES.map(s => (
                          <ToggleMulti key={s} label={s} checked={scope === s} onChange={() => { update("packoutScope", scope === s ? "" : s); executeInterviewActions(s, scope !== s); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && scope && interviewActions[scope]?.coaching && !dismissedCoaching.has(`c-${scope}`) && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">{scope}:</span> {interviewActions[scope].coaching}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${scope}`]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                        </div>
                      )}
                      {scope && scope !== "No Packout" && (
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Packout Notes (flows to event instructions)</div>
                          <textarea value={(data as any).packoutNote || ""} onChange={e => update("packoutNote", e.target.value)} placeholder="e.g. Heavy furniture on 2nd floor, fragile china cabinet..." className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] outline-none focus:border-sky-300 resize-none" rows={2} />
                        </div>
                      )}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, packoutScope: false }))} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Packout Items (Q4) */}
                {isFieldVisible("packoutSummary") && matchesInterviewSearch("picking up", "Rugs Window Treatments Clothing Bedding Furniture Art Electronics Hardware Appliances", data.packoutSummary) && (() => {
                  const log = (data.interviewLog || {}).packout;
                  const hasAnswers = (data.packoutSummary || []).length > 0;
                  const summary = (data.packoutSummary || []).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.packout === true;
                  const ITEM_TYPES = ["Rugs", "Window Treatments", "Clothing", "Bedding", "Furniture", "Art", "Electronics", "Hardware", "Appliances"];
                  return (
                    <InterviewQuestionCard
                      number={4}
                      title="What type of items will we be cleaning?"
                      collapsedLabel="Cleaning"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={hasAnswers && !expanded}
                      onToggle={() => setInterviewExpanded(p => ({ ...p, packout: !p.packout }))}
                    >
                      <div className="flex flex-wrap gap-2">
                        {ITEM_TYPES.map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.packoutSummary || []).includes(s)} onChange={() => { const isAdding = !(data.packoutSummary || []).includes(s); update("packoutSummary", toggleMulti(data.packoutSummary || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {showCoaching && (data.packoutSummary || [])
                        .filter(s => interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`))
                        .map(s => (
                          <div key={s} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                            <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                            <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                          </div>
                        ))}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, packout: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Load List */}
                {isFieldVisible("loadList") && matchesInterviewSearch("need to bring", "Tall Ladder Extra Manpower Floor Protection Dollies Wardrobe Boxes TV Boxes Blankets Plastic Bags", data.loadList, (data as any).loadListNote) && (() => {
                  const log = (data.interviewLog || {}).loadList;
                  const hasAnswers = (data.loadList || []).length > 0;
                  const summary = (data.loadList || []).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.loadList === true;
                  const targets: LoadTarget[] = (data as any)._loadTargets || DEFAULT_LOAD_TARGETS;
                  const autoLabels = new Set(matchLoadTargets(data, targets));
                  const grouped: Record<string, LoadTarget[]> = {};
                  targets.forEach(t => { (grouped[t.category] = grouped[t.category] || []).push(t); });
                  return (
                    <InterviewQuestionCard
                      number={5}
                      title="What do we need to bring?"
                      collapsedLabel="Bring"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={hasAnswers && !expanded}
                      onToggle={() => setInterviewExpanded(p => ({ ...p, loadList: !p.loadList }))}
                    >
                      {Object.entries(grouped).map(([cat, items]) => (
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
                      ))}
                      {matchLoadTargets(data).length > 0 && <div className="text-[10px] text-amber-600">✦ Auto-suggested based on conditions/packout/loss type</div>}
                      <Input value={(data as any).loadListNote || ""} onChange={e => update("loadListNote", e.target.value)} placeholder="Additional notes about what to bring..." className="!text-xs" />
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, loadList: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Considerations */}
                {isFieldVisible("sdsConsiderations") && matchesInterviewSearch("special considerations", "Elderly Pregnancy Baby Hearing Impaired Spanish Only Respiratory Concerns Premium Brands Skin Sensitivity", data.sdsConsiderations) && (() => {
                  const log = (data.interviewLog || {}).considerations;
                  const hasAnswers = (data.sdsConsiderations || []).length > 0;
                  const summary = (data.sdsConsiderations || []).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.considerations === true;
                  const CONSIDERATIONS = ["Elderly", "Pregnancy", "Baby", "Hearing Impaired", "Spanish Only", "Respiratory Concerns", "Premium Brands", "Skin Sensitivity"];
                  return (
                    <InterviewQuestionCard
                      number={6}
                      title="Considerations"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={hasAnswers && !expanded}
                      onToggle={() => setInterviewExpanded(p => ({ ...p, considerations: !p.considerations }))}
                    >
                      <div className="flex flex-wrap gap-2">
                        {CONSIDERATIONS.map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.sdsConsiderations || []).includes(s)} onChange={() => { const isAdding = !(data.sdsConsiderations || []).includes(s); update("sdsConsiderations", toggleMulti(data.sdsConsiderations || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-2 !py-1 !text-xs ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {(data.sdsConsiderations || []).some(c => ["Skin Sensitivity", "Respiratory Concerns", "Pregnancy"].includes(c)) && (
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
                      {showCoaching && (data.sdsConsiderations || [])
                        .filter(s => interviewActions[s]?.coaching && !dismissedCoaching.has(`c-${s}`))
                        .map(s => (
                          <div key={`coach-${s}`} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                            <div className="flex-1">🎓 <span className="font-bold">{s}:</span> {interviewActions[s].coaching}</div>
                            <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, `c-${s}`]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                          </div>
                        ))}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, considerations: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Pets in Home */}
                {matchesInterviewSearch("pets animals dog cat", "dog cat bird fish rabbit hamster pet", data.householdAnimals, (data.household || []).map(m => `${m.type || ""} ${m.name || ""}`)) && (() => {
                  const pets = (data.household || []).filter(m => m.category === "pet");
                  const log = (data.interviewLog || {}).pets;
                  const hasAnswers = pets.length > 0;
                  const summary = pets.map(p => [p.type, p.name].filter(Boolean).join(" ")).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.pets === true;
                  const petTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Other"];
                  const petStrOf = (members: any[]) => members.filter(m => m.category === "pet").map(p => [p.type, p.name].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                  return (
                    <InterviewQuestionCard
                      number={7}
                      title="Pets in home?"
                      collapsedLabel="Pets"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={hasAnswers && !expanded}
                      onToggle={() => setInterviewExpanded(p => ({ ...p, pets: !p.pets }))}
                    >
                      <div className="flex flex-wrap gap-2">
                        {petTypes.map(type => {
                          const hasPet = pets.some(p => p.type === type);
                          return (
                            <button key={type} type="button" onClick={() => {
                              const members = data.household || [];
                              const next = hasPet
                                ? members.filter(m => !(m.category === "pet" && m.type === type))
                                : [...members, { id: safeUid(), category: "pet", type, name: "" }];
                              update("household", next);
                              const petStr = petStrOf(next);
                              update("householdAnimals", petStr);
                              const sdsC = data.sdsConsiderations || [];
                              if (petStr && !sdsC.includes("Pets")) update("sdsConsiderations", [...sdsC, "Pets"]);
                              if (!petStr && sdsC.includes("Pets")) update("sdsConsiderations", sdsC.filter(s => s !== "Pets"));
                              if (!(data.sdsObservations || []).includes("Pets") && petStr) { update("sdsObservations", [...(data.sdsObservations || []), "Pets"]); executeInterviewActions("Pets", true); }
                              if (!petStr && (data.sdsObservations || []).includes("Pets")) update("sdsObservations", (data.sdsObservations || []).filter(s => s !== "Pets"));
                              setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), pets: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                            }} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${hasPet ? 'border-sky-400 bg-sky-50 text-sky-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{type}</button>
                          );
                        })}
                      </div>
                      {pets.map(pet => (
                        <div key={pet.id} className="flex items-center gap-2 bg-sky-50/50 rounded-lg border border-sky-100 px-3 py-1.5">
                          <span className="text-[12px] font-bold text-sky-700">{pet.type}</span>
                          <input value={pet.name || ""} onChange={e => {
                            const next = (data.household || []).map(m => m.id === pet.id ? { ...m, name: e.target.value } : m);
                            update("household", next);
                            update("householdAnimals", petStrOf(next));
                          }} placeholder="Pet name" className="flex-1 rounded border border-sky-200 px-2 py-0.5 text-[12px] text-slate-700 bg-white outline-none focus:border-sky-400" />
                          <button type="button" onClick={() => {
                            const next = (data.household || []).filter(m => m.id !== pet.id);
                            update("household", next);
                            const petStr = petStrOf(next);
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
                              update("householdAnimals", petStrOf(next));
                            }} className="rounded-full border border-dashed border-sky-300 px-2 py-0.5 text-[13px] font-bold text-sky-600 hover:bg-sky-50">+ {type}</button>
                          ))}
                        </div>
                      )}
                      {showCoaching && hasAnswers && !dismissedCoaching.has("c-Pets") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[13px] text-violet-700 flex items-start gap-1">
                          <div className="flex-1">🎓 <span className="font-bold">Pets:</span> {interviewActions["Pets"]?.coaching || "Please make sure your pets are secured in a safe room."}</div>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-Pets"]))} className="text-violet-400 hover:text-violet-600 text-[12px] font-bold shrink-0">×</button>
                        </div>
                      )}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, pets: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Customer Preferences — individual Y/N questions */}
                {[
                  { key: "medical", configKey: "familyMedicalIssues", title: "Medical Issues", searchTerms: "medical health asthma", isAnswered: () => !!data.familyMedicalIssues, summary: () => data.familyMedicalIssues === "Y" ? `Yes${data.familyMedicalNote ? ": " + data.familyMedicalNote : ""}` : "No" },
                  { key: "allergies", configKey: "soapFragAllergies", title: "Allergies", searchTerms: "allergy allergies detergent soap fragrance sensitive", isAnswered: () => !!data.soapFragAllergies, summary: () => data.soapFragAllergies === "Y" ? `Yes${data.soapFragNote ? ": " + data.soapFragNote : ""}` : "No" },
                  { key: "selfClean", configKey: "selfCleaning", title: "Self-Cleaning", searchTerms: "drawers undergarments linens towels baby items clean themselves", isAnswered: () => !!data.selfCleaning, summary: () => data.selfCleaning === "Y" ? `Yes${data.selfCleaningNote ? ": " + data.selfCleaningNote : ""}` : "No" },
                  { key: "dryCleaner", configKey: "useDryCleaner", title: "Dry Cleaner", searchTerms: "dry cleaner dry cleaning", isAnswered: () => !!data.useDryCleaner, summary: () => data.useDryCleaner || "" },
                  { key: "laundry", configKey: "howDryLaundry", title: "Drying Preference", searchTerms: "air dry low heat dryer machine", isAnswered: () => !!data.howDryLaundry, summary: () => data.howDryLaundry || "" },
                ].filter(q => isFieldVisible(q.configKey) && matchesInterviewSearch(q.title, q.searchTerms || "")).map((q, qi) => {
                  const log = (data.interviewLog || {})[q.key];
                  const hasAnswers = q.isAnswered();
                  const expanded = !!interviewSearch.trim() || interviewExpanded[q.key] === true;
                  const logNow = (key: string) => setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), [key]: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                  return (
                    <InterviewQuestionCard
                      key={q.key}
                      number={8 + qi}
                      title={q.title}
                      summary={q.summary()}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={hasAnswers && !expanded}
                      onToggle={() => {
                        setInterviewExpanded(p => ({ ...p, [q.key]: !p[q.key] }));
                        if (hasAnswers && !log) logNow(q.key);
                      }}
                    >
                      {q.key === "medical" && (
                        <>
                          <ToggleGroup options={["Y", "N"]} value={data.familyMedicalIssues || ""} onChange={v => { update("familyMedicalIssues", v); if (v === "Y") executeInterviewActions("Medical Yes", true); logNow("medical"); }} />
                          {data.familyMedicalIssues === "Y" && <Input value={data.familyMedicalNote || ""} onChange={e => update("familyMedicalNote", e.target.value)} placeholder="What medical issues?" className="!text-xs mt-2" />}
                        </>
                      )}
                      {q.key === "allergies" && (
                        <>
                          <ToggleGroup options={["Y", "N"]} value={data.soapFragAllergies || ""} onChange={v => { update("soapFragAllergies", v); if (v === "Y") executeInterviewActions("Allergies Yes", true); logNow("allergies"); }} />
                          {data.soapFragAllergies === "Y" && <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="What allergies?" className="!text-xs mt-2" />}
                        </>
                      )}
                      {q.key === "selfClean" && (
                        <>
                          <ToggleGroup options={["Y", "N"]} value={data.selfCleaning || ""} onChange={v => { update("selfCleaning", v); if (v === "Y") executeInterviewActions("SelfClean Yes", true); logNow("selfClean"); }} />
                          {data.selfCleaning === "Y" && (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex flex-wrap gap-1.5">
                                {["Drawers", "Undergarments", "Linens", "Towels", "Baby Items"].map(item => {
                                  const active = (data.selfCleaningNote || "").toLowerCase().includes(item.toLowerCase());
                                  return <button key={item} type="button" onClick={() => { const note = data.selfCleaningNote || ""; if (active) update("selfCleaningNote", note.split(/,\s*/).filter(s => s.toLowerCase() !== item.toLowerCase()).join(", ")); else update("selfCleaningNote", note ? `${note}, ${item}` : item); }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${active ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>{item}</button>;
                                })}
                              </div>
                              <Input value={data.selfCleaningNote || ""} onChange={e => update("selfCleaningNote", e.target.value)} placeholder="Additional notes..." className="!text-xs" />
                            </div>
                          )}
                        </>
                      )}
                      {q.key === "dryCleaner" && (
                        <ToggleGroup options={["Yes", "No", "Rarely"]} value={data.useDryCleaner || ""} onChange={v => { update("useDryCleaner", v); logNow("dryCleaner"); }} />
                      )}
                      {q.key === "laundry" && (
                        <>
                          <ToggleGroup options={["Air-Dry", "Low Heat", "Dryer"]} value={data.howDryLaundry || ""} onChange={v => { updateHowDry(v); executeInterviewActions(v, true); logNow("laundry"); }} />
                          {data.howDryLaundry && <div className="mt-2"><Input value={data.howDryNote || ""} onChange={e => update("howDryNote", e.target.value)} placeholder="Additional notes..." className="!text-xs" /></div>}
                        </>
                      )}
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, [q.key]: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
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

                  const summaryNode = timeline.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {timeline.map((s, i) => (
                        <span key={s.id} className="text-[10px] text-emerald-600">{i > 0 && " → "}{s.type}{s.duration ? ` (${s.duration})` : ""}</span>
                      ))}
                    </div>
                  ) : <span className="text-[10px] text-emerald-600">{summary}</span>;
                  return (
                    <InterviewQuestionCard
                      number={13}
                      title="Staying in Home"
                      summary={summaryNode}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      accent="teal"
                      onToggle={() => setInterviewExpanded(p => ({ ...p, living: !p.living }))}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setCanStayHome(true)} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus === "Staying in home" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}>Yes, staying home</button>
                        <button type="button" onClick={() => setCanStayHome(false)} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.livingStatus === "Not staying in home" || timeline.some(s => s.type !== "Staying in home") ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>No, staying elsewhere</button>
                      </div>

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

                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, living: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Rush Delivery Needed? (Q14) */}
                {isFieldVisible("rushDeliveryNeeded") && matchesInterviewSearch("rush delivery needed urgent ASAP", "rush immediate", data.rushDeliveryNeeded === "Y" ? "Rush yes" : data.rushDeliveryNeeded === "N" ? "Rush no" : "", (data as any).rushDeclinedNote) && (() => {
                  const log = (data.interviewLog || {}).rushDelivery;
                  const hasAnswers = !!data.rushDeliveryNeeded;
                  const expanded = !!interviewSearch.trim() || interviewExpanded.rushDelivery === true;
                  const summary = data.rushDeliveryNeeded === "Y" ? "Yes — Rush group added" : data.rushDeliveryNeeded === "N" ? "No" : "";
                  const logNow = () => setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), rushDelivery: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                  return (
                    <InterviewQuestionCard
                      number={14}
                      title="Does the customer need a rush delivery?"
                      collapsedLabel="Rush"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      accent="teal"
                      onToggle={() => setInterviewExpanded(p => ({ ...p, rushDelivery: !p.rushDelivery }))}
                    >
                      {showCoaching && !dismissedCoaching.has("c-rush") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <span className="flex-1">{coaching("section.rush")}</span>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-rush"]))} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
                        </div>
                      )}
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
                          logNow();
                        }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.rushDeliveryNeeded === "Y" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>
                          Yes, rush needed
                        </button>
                        <button type="button" onClick={() => { update("rushDeliveryNeeded", data.rushDeliveryNeeded === "N" ? "" : "N"); logNow(); }} className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${data.rushDeliveryNeeded === "N" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>
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
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, rushDelivery: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Activities & Interests (Q15) */}
                {(() => {
                  const log = (data.interviewLog || {}).interests;
                  const hasAnswers = (data.rushInterests || []).length > 0;
                  const summary = (data.rushInterests || []).map(id => RUSH_INTERESTS.find(i => i.id === id)?.label || id).join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.interests === true;
                  return (
                    <InterviewQuestionCard
                      number={15}
                      title="Activities & interests"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      accent="teal"
                      onToggle={() => setInterviewExpanded(p => ({ ...p, interests: !p.interests }))}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {RUSH_INTERESTS.map(i => {
                          const active = (data.rushInterests || []).includes(i.id);
                          return (
                            <button key={i.id} type="button" onClick={() => {
                              update("rushInterests", active ? (data.rushInterests || []).filter(x => x !== i.id) : [...(data.rushInterests || []), i.id]);
                              setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), interests: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                            }} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${active ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`} title={i.desc}>
                              {i.label}
                            </button>
                          );
                        })}
                      </div>
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, interests: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}

                {/* Upcoming Events (Q16) */}
                {(() => {
                  const log = (data.interviewLog || {}).events;
                  const hasAnswers = (data.upcomingEvents || []).length > 0;
                  const summary = (data.upcomingEvents || []).map(e => e.name || "Event").join(", ") || (!!log && !hasAnswers ? "None" : "");
                  const expanded = !!interviewSearch.trim() || interviewExpanded.events === true;
                  const logNow = () => setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), events: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                  return (
                    <InterviewQuestionCard
                      number={16}
                      title="Trips / Events"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      accent="teal"
                      onToggle={() => setInterviewExpanded(p => ({ ...p, events: !p.events }))}
                    >
                      {showCoaching && !dismissedCoaching.has("c-events") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <span className="flex-1">{coaching("section.events")}</span>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-events"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                        </div>
                      )}
                      {(data.upcomingEvents || []).map(evt => (
                        <div key={evt.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative">
                          <button type="button" onClick={() => update("upcomingEvents", (data.upcomingEvents || []).filter(e => e.id !== evt.id))} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 text-sm font-bold">×</button>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${evt.type === "trip" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>{evt.type === "trip" ? "Trip" : "Event"}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Name</div>
                              <input value={evt.name || ""} onChange={e => update("upcomingEvents", (data.upcomingEvents || []).map(ev => ev.id === evt.id ? { ...ev, name: e.target.value } : ev))} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]" placeholder={evt.type === "trip" ? "e.g. Florida Vacation" : "e.g. Wedding"} />
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Date</div>
                              <input type="date" value={evt.date || ""} min={new Date().toISOString().split("T")[0]} onChange={e => {
                                let val = e.target.value;
                                if (val) {
                                  const today = new Date(); today.setHours(0, 0, 0, 0);
                                  let d = new Date(val + "T00:00:00");
                                  if (d < today) { d.setFullYear(today.getFullYear() + 1); val = d.toISOString().split("T")[0]; }
                                }
                                update("upcomingEvents", (data.upcomingEvents || []).map(ev => ev.id === evt.id ? { ...ev, date: val } : ev));
                              }} className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px]" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { update("upcomingEvents", [...(data.upcomingEvents || []), { id: safeUid(), type: "trip", date: "", name: "Trip" }]); logNow(); }} className="flex-1 p-2 border-2 border-dashed border-slate-300 rounded-lg text-[11px] font-bold text-slate-500 hover:border-sky-400 hover:text-sky-600">+ Add Trip</button>
                        <button type="button" onClick={() => { update("upcomingEvents", [...(data.upcomingEvents || []), { id: safeUid(), type: "event", date: "", name: "Event" }]); logNow(); }} className="flex-1 p-2 border-2 border-dashed border-slate-300 rounded-lg text-[11px] font-bold text-slate-500 hover:border-amber-400 hover:text-amber-600">+ Add Event</button>
                      </div>
                      <CollapseInterviewRow log={log} onCollapse={() => setInterviewExpanded(p => ({ ...p, events: false }))} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
                })()}
                {/* Delivery Group Builder (Q17) */}
                {matchesInterviewSearch("delivery group builder final suggested", "RD RFD STD STFD LTD LTFD Inhome TLI Test Dispose Storage Only final months date", data.suggestedGroups, data.estimatedReturnDate, data.storageMonths) && (() => {
                  const log = (data.interviewLog || {}).suggestedGroups || (data.interviewLog || {}).finalDeliveryDate;
                  const selectedGroups = data.suggestedGroups || [];
                  const groupDetails = (data as any).deliveryGroupDetails || {};
                  const hasAnswers = selectedGroups.length > 0 || !!data.estimatedReturnDate;
                  const expanded = !!interviewSearch.trim() || interviewExpanded.groupBuilder === true;
                  const hasFinal = selectedGroups.some(g => g.endsWith("FD") || g === "LTFD" || g === "STFD" || g === "RFD") || !!(groupDetails as any).__finalDate;
                  const finalDate = data.estimatedReturnDate || "";
                  const summary = selectedGroups.length > 0 ? selectedGroups.join(", ") + (finalDate ? ` → ${finalDate}` : "") : finalDate ? `Final: ${finalDate}` : "";
                  const logBoth = () => setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), suggestedGroups: { user: p.currentUser || "Unknown", at: formatShortTimestamp() }, finalDeliveryDate: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                  return (
                    <InterviewQuestionCard
                      number={17}
                      title="Delivery Planner"
                      summary={summary}
                      log={log}
                      answered={!!hasAnswers}
                      expanded={expanded}
                      highlightSearch={highlightSearch}
                      showAnsweredTint={false}
                      accent="teal"
                      onToggle={() => setInterviewExpanded(p => ({ ...p, groupBuilder: !p.groupBuilder }))}
                    >
                      {showCoaching && !dismissedCoaching.has("c-groupBuilder") && (
                        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 flex items-start gap-1">
                          <span className="flex-1">{coaching("section.planner")}</span>
                          <button type="button" onClick={() => setDismissedCoaching(p => new Set([...p, "c-groupBuilder"]))} className="text-violet-400 hover:text-violet-600 text-[10px] font-bold shrink-0">×</button>
                        </div>
                      )}
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
                      <CollapseInterviewRow log={log} onCollapse={() => { setInterviewExpanded(p => ({ ...p, groupBuilder: false })); logBoth(); }} tinted={!!hasAnswers} />
                    </InterviewQuestionCard>
                  );
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
          const formalBlockers = (scopeBridgeState.pendingIssues || []).filter(Boolean);
          const softBlockers = buildBillToBlockers(data);
          const blockers = [...formalBlockers, ...softBlockers];
          const placeholders = buildActionItemPlaceholders(data);
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
          const orderSituation = LIVING_SITUATION_MAP[data.livingStatus] || "";
          const firstRepair = (data.repairsSummary || "").split(", ").filter(Boolean)[0] || "";
          const orderRepairType = REPAIR_TYPE_MAP[firstRepair] || "";
          const household = data.household || [];
          const people = household.filter(m => m.category === "person");
          const pets = household.filter(m => m.category === "pet");
          const primaryCustomer = (data.customers || [])[0] || {};
          const { allAddresses, primaryAddress, primaryAddrStr, tempAddress, tempAddrStr, hotelAddress, hotelAddrStr, rentalAddress, rentalAddrStr } = buildRushGuideAddresses(data);
          const { babies, kids, elderly, adults, totalPeople, petCount, petNames } = buildHouseholdComposition(data);
          const considerations = data.sdsConsiderations || [];
          const packoutItems = data.packoutSummary || [];
          const interests = data.rushInterests || [];
          const events = data.upcomingEvents || [];
          const conditions = buildRushGuideConditions(data);

          const repairInfo = RUSH_REPAIR_TIMELINES.find(r => r.id === orderRepairType);
          const now = new Date();
          const { explicitReturn, repairReturn, storageReturn, estimatedReturn, storageRepairMismatch } =
            computeEstimatedReturn(data, repairInfo, now);
          const seasons = estimatedReturn ? rushGetSeasons(now, estimatedReturn) : [];

          // Smart address + delivery resolution — see utils/rushGuideTimeline.
          const livingTimeline = data.livingTimeline || [];
          const isLongTerm = repairInfo && repairInfo.days > 30;
          const { hasHotel, hasRental, rushDeliverTo, rentalDeliverTo, finalDeliverTo } =
            resolveRushDeliveryAddresses(livingTimeline, orderSituation, hotelAddrStr, rentalAddrStr, tempAddrStr, primaryAddrStr);
          const timelineBands = computeRushTimelineBands(livingTimeline, now, estimatedReturn, allAddresses);

          const seasonChanges = computeRushSeasonChanges(now, estimatedReturn, interests);
          const holidayEvents = computeRushHolidayEvents(now, estimatedReturn, interests);

          const { rushItems, shortTermItems, seasonalWardrobes, eventDeliveries, reminders } =
            buildRushGuideActionPlan({
              household: { babies, kids, elderly, adults, totalPeople, petCount, petNames },
              orderSituation,
              hasRental,
              now,
              estimatedReturn,
              repairInfo,
              considerations,
              packoutItems,
              conditions,
              interests,
              seasonChanges,
              holidayEvents,
              rawEvents: events,
              seasonOverrides: (rushGuideData as any).seasonOverrides || {},
              eventOverrides: (rushGuideData as any).eventOverrides || {},
            });

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

                  {rushGuideStep === 2 && (
                    <RushGuideFamilyStep
                      family={family}
                      interests={rushGuideData.interests || []}
                      setRushGuideData={setRushGuideData}
                      onBack={() => setRushGuideStep(1)}
                      onNext={() => setRushGuideStep(3)}
                    />
                  )}

                  {rushGuideStep === 3 && (
                    <RushGuideEventsStep
                      events={rushGuideData.events || []}
                      setRushGuideData={setRushGuideData}
                      onBack={() => setRushGuideStep(2)}
                      onNext={() => setRushGuideStep(4)}
                      estimatedReturnLabel={rushFormatDate(estimatedReturn)}
                    />
                  )}

                  {/* Results */}
                  {(repairInfo || orderSituation || estimatedReturn) ? (() => {
                    // Collect seasonal items assigned to rental
                    const rentalSeasonalItems = seasonalWardrobes.filter(sw => sw.assignedGroup === "rental");
                    const separateSeasonals = seasonalWardrobes.filter(sw => sw.assignedGroup === "separate");

                    // Delivery groups — computed at outer scope so seasonal/event sections can reference them
                    const hasHouseholdItems = packoutItems.some(p => ["Rugs", "Window Treatments", "Furniture", "Art", "Appliances"].includes(p));
                    const deliveryGroups = buildRushGuideDeliveryGroups({
                      rushItems,
                      shortTermItems,
                      now,
                      estimatedReturn,
                      hasHotel,
                      hasRental,
                      rushDeliverTo,
                      primaryAddrStr,
                      finalDeliverTo,
                      timelineBands,
                      packoutItems,
                      interviewGroups: data.suggestedGroups || [],
                      customDeliveries: ((rushGuideData as any).customDeliveries || []) as any,
                      postFinalEvents: (data as any).postFinalEvents || [],
                      groupOverrides: (rushGuideData as any).groupOverrides || {},
                    });
	                    const groupOverrides = (rushGuideData as any).groupOverrides || {};
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
                          <RushGuideGanttTimeline
                            now={now}
                            allPins={allPins}
                            pinPositions={pinPositions}
                            isPinOn={isPinOn}
                            togglePin={togglePin}
                            handlePinDrag={handleDrag}
                            monthLabels={monthLabels}
                            bands={bands}
                            pct={pct}
                            timelineStart={timelineStart}
                            timelineEnd={timelineEnd}
                            deliveryGroups={deliveryGroups}
                            draggingDelivery={draggingDelivery}
                            setDraggingDelivery={setDraggingDelivery}
                            pendingDeliveryDateChange={pendingDeliveryDateChange}
                            setPendingDeliveryDateChange={setPendingDeliveryDateChange}
                            applyDeliveryDateChange={applyDeliveryDateChange}
                          />

                          <RushGuideDeliveryCards
                            deliveryGroups={deliveryGroups}
                            seasonalWardrobes={seasonalWardrobes}
                            upcomingEvents={data.upcomingEvents || []}
                            interviewGroups={interviewGroups}
                            seasonOverrides={(rushGuideData as any).seasonOverrides || {}}
                            eventOverrides={(rushGuideData as any).eventOverrides || {}}
                            deliveryNotes={(rushGuideData as any).deliveryNotes || {}}
                            setRushGuideData={setRushGuideData}
                            addressChoiceValue={addressChoiceValue}
                            addressPayloadFromChoice={addressPayloadFromChoice}
                            orderAddressChoices={orderAddressChoices}
                            removeCustomDelivery={removeCustomDelivery}
                            deliveryDateVersion={deliveryDateVersion}
                          />
                          <RushGuideShareButtons
                              deliveryGroups={deliveryGroups}
                              orderName={data.orderName || ""}
                              deliveryNotes={(rushGuideData as any).deliveryNotes || {}}
                              onCopyToast={setToast}
                            />
                        </div>
                      );
                    })()}

                    <RushGuideReminders reminders={reminders} />

                    {/* (Delivery cards integrated into Gantt timeline below) */}

                    <RushGuideOptionalDeliveries
                      seasonalWardrobes={seasonalWardrobes}
                      eventDeliveries={eventDeliveries}
                      deliveryGroups={deliveryGroups}
                      hasRental={hasRental}
                      seasonOverrides={(rushGuideData as any).seasonOverrides || {}}
                      eventOverrides={(rushGuideData as any).eventOverrides || {}}
                      setRushGuideData={setRushGuideData}
                      createCustomDelivery={createCustomDelivery}
                      createCustomDeliveryForEvent={createCustomDeliveryForEvent}
                    />

                    {/* (Final delivery card integrated into Gantt timeline) */}

                    <RushGuideOutputActions
                      onCopyFull={() => {
                        navigator.clipboard?.writeText(buildFullText()).then(() => setToast("Full Rush Guide copied"));
                      }}
                      onCopyRushOnly={() => {
                        navigator.clipboard?.writeText(buildRushOnlyText()).then(() => setToast("Rush-only list copied"));
                      }}
                      onAddToPickupEvent={() => {
                        const pickupText = buildPickupText();
                        setData(p => {
                          const current = (p.eventInstructions || "").trim();
                          const combined = current
                            ? `${current}\n\n--- RUSH GUIDE PICKUP NOTES ---\n${pickupText}`
                            : `--- RUSH GUIDE PICKUP NOTES ---\n${pickupText}`;
                          return { ...p, eventInstructions: combined };
                        });
                        setToast("Rush Guide added to pickup event instructions");
                      }}
                      onApplyAndClose={() => {
                        if (repairInfo) update("suggestedGroups", Array.from(new Set([...(data.suggestedGroups || []), repairInfo.group])));
                        setToast("Rush Guide applied to order");
                        setRushGuideOpen(false);
                      }}
                    />
                  </>;
                  })() : (
                    <RushGuideSetupPanel
                      data={data}
                      update={update}
                      setData={setData}
                      addressPayloadFromChoice={addressPayloadFromChoice}
                      onCloseAndOpenInterview={() => {
                        setRushGuideOpen(false);
                        setTimeout(() => setInterviewPanelOpen(true), 100);
                      }}
                      onCloseAndOpenInterviewExpanded={() => {
                        setRushGuideOpen(false);
                        setTimeout(() => {
                          setInterviewPanelOpen(true);
                          setInterviewExpanded((p: any) => ({ ...p, living: true }));
                          setTimeout(() => {
                            const el = document.getElementById("noe-interview-timeline");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 200);
                        }, 100);
                      }}
                    />
                  )}

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
        <SdsPreviewModal
          data={data}
          mergedSdsPhotos={mergedSdsPhotos}
          mergedSdsCoverPhoto={mergedSdsCoverPhoto}
          scopeBridgeState={scopeBridgeState}
          orderNarrative={orderNarrative}
          orderNarrativeProse={(data as any).orderNarrativeProseOverride || buildNarrativeProse(orderNarrative, data)}
          rushGuideTimeline={buildRushGuideTimeline(data)}
          onClose={closeSds}
          onGoToOrder={() => { setShowSdsPreview(false); setEntryMode('detailed'); }}
          onGoToScope={closeSds}
          onPhotoNoteChange={(photoId, note) => setData((prev) => updateSdsPhotoNote(prev, photoId, note))}
          onNarrativeChange={(prose) => update("orderNarrativeProseOverride", prose)}
        />
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
        <SaveSummaryModal
          data={data}
          scopeBridgeState={scopeBridgeState}
          orderNarrative={orderNarrative}
          saveSummaryMissing={saveSummaryMissing}
          saveMissingOpen={saveMissingOpen}
          setMissingOpen={setSaveMissingOpen}
          saveExportLines={saveExportLines}
          previewView={previewView}
          setPreviewView={setPreviewView}
          recordWord={recordWord}
          onClose={() => setPreviewOpen(false)}
          onSave={() => { setPreviewOpen(false); validateGenerateScope(); }}
          onSaveAndScope={() => { setPreviewOpen(false); validateGenerateScope(); setTimeout(() => setShowScope(true), 300); }}
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
          setQueuedOutbound={(next) => update("queuedOutbound", next)}
          setDismissedOutbound={(next) => update("dismissedOutbound", next)}
        />
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
                        const type = getCompanyTypeForRoles(companyName);
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
