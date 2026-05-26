// @ts-nocheck
// Section 1 — Order. Detailed mode's order basics + scope/needs +
// codes + lead source UI. Like the other section atoms, takes a wide
// destructured props bag.

import React from "react";
import {
  Section,
  SubSection,
  Field,
  Input,
  ToggleGroup,
  ToggleMulti,
  Select,
  Textarea,
  AutoGrowTextarea,
  SearchSelect,
  Switch,
  Chevron,
  EditAffordance,
  LeadInfoFields,
  pillBase,
  pillActive,
  pillInactive,
} from "./index";
import {
  LOSS_TYPES,
  CAUSES,
  ORIGINS,
  COMPATIBLE_SECONDARIES,
  SEVERITY_GROUPS,
  SEVERITY_LEVELS,
  QUALITY_CODES,
  HANDLING_META,
  SERVICE_OFFERINGS,
  SERVICE_SUB_CATEGORIES,
  SERVICE_OFFERING_HELP,
  DAMAGE_TYPES,
  NON_RESTORATION_SUBTYPES,
  NON_RESTORATION_PRIMARY,
  LEAD_SOURCES,
  LEAD_SOURCE_HELP,
  MARKETING_SOURCES,
  INTERNAL_TYPES,
  ORDER_STATUSES,
  SUGGESTED_GROUPS,
  SUGGESTED_GROUP_HELP,
} from "../../config";
import { getNonRestorationSubtype } from "../../utils/orderType";
import { toggleMulti } from "../../utils/strings";
import { formatCurrencyInput } from "../../utils/format";
import { initLossSeverity } from "../../utils/orderFactories";
import { getInstructionTypeTextKey } from "../../utils/instructions";

export const OrderSection: React.FC<any> = (props) => {
  const {
    data,
    update,
    updateMany,
    setData,
    setToast,
    openSections,
    handleToggleSection,
    handleConfirmClick,
    goToNextSection,
    handleNextSectionKeyDown,
    compactMode,
    auditOn,
    auditTargets,
    orderSubOpen,
    setOrderSubOpen,
    sourceSubOpen,
    setSourceSubOpen,
    codesSubOpen,
    setCodesSubOpen,
    expandedService,
    setExpandedService,
    openCodes,
    setOpenCodes,
    minimizedLossTypes,
    setMinimizedLossTypes,
    manualEditLossTypes,
    setManualEditLossTypes,
    lastLossDetailTouched,
    setLastLossDetailTouched,
    autoScrollDone,
    setAutoScrollDone,
    showCoaching,
    dismissedCoaching,
    setDismissedCoaching,
    isFieldVisible,
    coaching,
    coachingDismissed,
    dismissTip,
    tipVisible,
    combinedContactOptions,
    parseCombinedContact,
    companies,
    suggestedReferrerRoles,
    applyReferrerRoles,
    getSalesRepForContact,
    openCrmModal,
    triggerAutoFlash,
    getFlashClass,
    toggleNonRestorationPrimary,
    toggleRestorationType,
    selectNonRestorationSubtype,
    toggleLossType,
    dismissedTips,
    attentionWater,
    attentionMold,
    setModal,
    setInterviewPanelOpen,
    jumpToSectionAndSubsection,
    openEditOrderInstructionModal,
    removeOrderInstruction,
    toggleOrderInstructionPreset,
    toggleHandling,
    getInstructionIdentity,
    updateLossDetail,
    getLossSummary,
    toggleMinimizeLoss,
    toggleSeverity,
    isNonRestorationProject,
    isRestorationProject,
    projectType,
    isPlaceholderFlagActive,
    handleMultiToggle,
    showInlineHelp,
    recordWord,
    recordTypeLabel,
    codeSummary,
    conditionSummary,
    orderNameInputRef,
    setAddNewSystemModal,
    setShowQuickInstructions,
    openRoleAssignmentPrompt,
    autoTypeForCompany,
    selectedBridgePickupStep,
    selectedBridgeProcessStep,
    selectedBridgeDeliveryStep,
    setBridgePickupStep,
    setBridgeProcessStep,
    setBridgeDeliveryStep,
    activeBridgeIssues,
    bridgeEstimateDetails,
  } = props;
  return (
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
  );
};
