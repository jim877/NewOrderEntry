// @ts-nocheck
// Section 5 — Schedule & Blockers. Detailed mode's scheduling +
// event-instructions UI. Has the biggest prop signature of any
// section atom — takes everything via a destructured props bag.

import React from "react";
import {
  Section,
  SubSection,
  Field,
  Input,
  ToggleGroup,
  ToggleMulti,
  Switch,
  DatePicker,
  TimePicker,
  SearchSelect,
  Select,
} from "./index";
import {
  BRIDGE_CUSTOMER_BLOCKERS,
  BRIDGE_INSURANCE_BLOCKERS,
  BRIDGE_PICKUP_STEP_OPTIONS,
  BRIDGE_PROCESS_STEP_OPTIONS,
  BRIDGE_DELIVERY_STEP_OPTIONS,
  BRIDGE_MILESTONE_FIELDS,
  BRIDGE_BLOCKER_GROUPS,
} from "../../config";
import { bridgeStageToneClass } from "../../utils/bridge";
import { stripEventSystemLines, composeEventInstructions } from "../../utils/eventInstructions";
import { toggleMulti } from "../../utils/strings";
import { QUICK_INSTRUCTION_NOTES as QIN_FALLBACK, SDS_ICON_CLASS_OVERRIDES } from "../../config";

const getSdsIconImageClass = (item: string) =>
  SDS_ICON_CLASS_OVERRIDES[item] || "h-full w-full object-contain object-center";

export const ScheduleSection: React.FC<any> = (props) => {
  const {
    data,
    update,
    updateMany,
    setData,
    openSections,
    setOpenSections,
    handleToggleSection,
    handleConfirmClick,
    goToNextSection,
    handleNextSectionKeyDown,
    compactMode,
    auditOn,
    auditTargets,
    scheduleSubOpen,
    setScheduleSubOpen,
    scheduleBridgeOpen,
    setScheduleBridgeOpen,
    setBridgePickupStep,
    setBridgeProcessStep,
    setBridgeDeliveryStep,
    selectedBridgePickupStep,
    selectedBridgeProcessStep,
    selectedBridgeDeliveryStep,
    setActionItemsOpen,
    setActionItemsBlockerOpen,
    setEditSystemInstructions,
    setEventNoteDraft,
    setNowDate,
    setNowTime,
    setShowAllEventNotes,
    setShowLoadListPanel,
    setShowQuickInstructions,
    setShowSdsQuestionnaire,
    setEntryMode,
    setToast,
    showQuickInstructions,
    showLoadListPanel,
    showAllEventNotes,
    editSystemInstructions,
    eventNoteDraft,
    dateCloseTick,
    timeCloseTick,
    addEventNote,
    deleteEventNote,
    downloadIcs,
    eventSystemLines,
    eventSystemEntries,
    hasEventInstructions,
    scopeBridgeState,
    knownPeople,
    bridgeSectionClassNames,
    bridgeStatusClassNames,
    conditionSummary,
    eventNoteInputRef,
    openReminderModal,
    toggleProceedWithoutApproval,
    matchLoadTargets,
    DEFAULT_LOAD_TARGETS,
    QUICK_INSTRUCTION_NOTES,
    formatShortTimestamp,
    LoadTarget,
  } = props;
  return (
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
  );
};
