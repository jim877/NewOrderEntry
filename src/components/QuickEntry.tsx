// @ts-nocheck
// QuickEntry — sales-rep / field-friendly fast intake form. Extracted
// from App.tsx. Stays prop-drilled from the parent so all data writes
// flow through the App's update / updateMany / updateAddr / updateCust
// setters and the App owns the order shape.

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

// --- QuickEntry component ---

export const QuickEntry = ({ data, update, updateMany, updateAddr, updateCust, companies, setModal, toggleMulti, handleConfirmClick, setToast, showInlineHelp, auditOn, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, quickQuestionsCollapsed, setQuickQuestionsCollapsed, compactMode, recordTypeLabel, getSalesRepForContact, onOpenCrmLog, onOpenReminder, knownPeople, onSetNowDate, onSetNowTime, dateCloseSignal, timeCloseSignal, onPromptRoleAssignment, toggleNonRestorationPrimary, toggleRestorationType, selectNonRestorationSubtype, onSwitchToDetailed, orderPoc, setOrderPoc, flagContactAsPoc }) => {
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
