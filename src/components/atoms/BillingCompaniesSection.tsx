// @ts-nocheck
// Section 4 — Billing & Companies. Detailed mode's billing + finance +
// insurance + companies UI. Takes ~60 props through a destructured
// bag — the prop surface is wide because the section interacts with
// many helpers (parseCombinedContact, autoTypeForCompany, role
// management, etc.) that all live in App's scope.

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
  AssignmentCueStrip,
  LinkedAssignmentPanel,
  RoleBadge,
  pillBase,
  pillActive,
  pillInactive,
} from "./index";
import { normalizePlaceholderKeyPart, normalizeCompany, normalizeContact } from "../../utils/strings";
import { entryContactList, isCompanyPlaceholder, isContactPlaceholder, companyTypeRequiresContact } from "../../utils/companyEntry";
import { isPlaceholderFlagActive, hasMeaningfulValue, createPlaceholderFlag } from "../../utils/order";
import { syncCompanyEntryPlaceholders } from "../../utils/companyEntry";
import {
  INSURANCE_ELIGIBLE_COMPANY_TYPES,
  HANDLING_META,
  CONTACT_ROLE_BADGES,
  CONTACT_METHODS,
  ESTIMATE_TYPES,
  PRICING_PLATFORMS,
  NATIONAL_CARRIERS,
  INSTRUCTION_TYPES,
  ORDER_INSTRUCTION_PRESETS,
  LOSS_TYPES,
  SUGGESTED_GROUPS,
  SUGGESTED_GROUP_HELP,
} from "../../config";
import { INSURANCE_COMPANY_SHORTCUTS, NATIONAL_CARRIER_LINKS, isInsuranceShortcutCompany } from "../../utils/companyProfiles";
import { formatShortTimestamp } from "../../utils/dateTime";
import { safeUid } from "../../utils/uid";

export const BillingCompaniesSection: React.FC<any> = (props) => {
  const {
    data,
    setData,
    update,
    updateMany,
    setToast,
    openSections,
    handleToggleSection,
    handleConfirmClick,
    goToNextSection,
    handleNextSectionKeyDown,
    compactMode,
    auditOn,
    auditTargets,
    companiesSubOpen,
    setCompaniesSubOpen,
    billingSubOpen,
    setBillingSubOpen,
    financeSubOpen,
    setFinanceSubOpen,
    insuranceSubOpen,
    setInsuranceSubOpen,
    companyRolesExpanded,
    setCompanyRolesExpanded,
    pendingCompanyRoleCount,
    visibleCompanyRoles,
    combinedContactOptions,
    parseCombinedContact,
    autoTypeForCompany,
    addCompanyFromSearch,
    addCompanyDirect,
    addContactToCompany,
    toggleCompanyRoleNeeded,
    openCompanyRolePicker,
    upsertAdditionalCompany,
    removeAdditionalCompany,
    setAddCompanyType,
    setAddCompanyModalOpen,
    setAddNewSystemModal,
    setShowTypePicker,
    addCompanyInputRef,
    companyEdit,
    setCompanyEdit,
    companies,
    companySet,
    contacts,
    contactCompanyMap,
    sampleContacts,
    handleBillingContactChange,
    handleInsuranceCompanyChange,
    handleAdjusterContactChange,
    handleAdditionalContactChange,
    getCompanyTypeForRoles,
    getRolesForContact,
    toggleRoleForContact,
    getEligibleRoleLabels,
    getCompanyProfile,
    getContactProfile,
    getContactOptionsForCompany,
    coaching,
    showCoaching,
    dismissedCoaching,
    setDismissedCoaching,
    isFieldVisible,
    isPocContact,
    flagContactAsPoc,
    isNonRestorationProject,
    linkedInsuranceCarrier,
    insuranceCarrierLinkMissing,
    requestNationalCarrierLink,
    orderAddressChoices,
    addressChoiceValue,
    addressPayloadFromChoice,
    billingAssignmentCues,
    billingAssignmentLinked,
    billingAssignmentUnlocked,
    setBillingAssignmentUnlocked,
    insuranceAssignmentCues,
    insuranceAssignmentLinked,
    insuranceAssignmentUnlocked,
    setInsuranceAssignmentUnlocked,
    getTitleForContact,
    companyRolesFor,
    attentionMold,
    setModal,
    openPrimaryCustomerText,
    orderLevelInstructions,
    orderInstructionSelectionSet,
    markInstructionKeysSeen,
    sessionInstructionKeys,
    setSessionInstructionKeys,
    currentOrderSpecialDocs,
    currentOrderCustomerForms,
    recordWord,
    estimateRequesterQuickOptions,
    interviewGroups,
    triggerAutoFlash,
    getFlashClass,
    setShowCustomerFormPicker,
    showCustomerFormPicker,
    setOpenOrderInstructionModal,
    openOrderInstructionModal,
    handleConfirmAppointmentClick,
    setEditContactModal,
    formatPhoneNumber,
    formatCurrencyInput,
    setOrderInstructionModal,
  } = props;
  return (
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
  );
};
