// @ts-nocheck
import React, { useState, useEffect, memo } from "react";
import { Field } from "./Field";
import { Input } from "./Input";
import { SearchSelect } from "./SearchSelect";
import { Chevron } from "./Chevron";
import { ToggleMulti } from "./ToggleMulti";
import { CustomerActionMenu } from "./CustomerActionMenu";
import { CustomerWelcomePanel } from "./CustomerWelcomePanel";
import { CustomerQuickNotes } from "./CustomerQuickNotes";
import { CUSTOMER_TYPES, DEFAULT_COACHING } from "../../config";
import { hasMeaningfulValue, isPlaceholderFlagActive, isHeaderToggleIgnoredTarget } from "../../utils/order";
import { formatPhoneNumber } from "../../utils/format";

// CustomerItem — one customer card. Collapsible; opens by default when no name is set
// or when `c._forceOpen` flips. Renders action menu, welcome panel, quick-notes panel
// as separate atoms gated by `c._showMenu` / `c.showWelcomePanel` / `c.showQuickNotes`.
export const CustomerItem = memo(
  ({ c, index, total, updateCust, onRemove, highlightMissing, auditOn, onSendWelcome }) => {
    const toggleList = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    const customerDisplayName = [c.first, c.last].filter(hasMeaningfulValue).join(" ").trim();
    const [open, setOpen] = useState(!customerDisplayName);

    useEffect(() => {
      if (!c._forceOpen) return;
      setOpen(true);
      updateCust(c.id, { _forceOpen: false });
      setTimeout(() => {
        const card = document.querySelector(`[data-customer-id="${c.id}"]`);
        if (!card) return;
        if (!hasMeaningfulValue(c.type)) {
          const typeInput = card.querySelector('input[placeholder="Type..."], [class*="SearchSelect"] input');
          if (typeInput) { typeInput.focus(); return; }
        }
        const firstInput = card.querySelector('input[data-audit-key="custFirst"], input:not([type="hidden"])');
        if (firstInput) firstInput.focus();
      }, 150);
    }, [c._forceOpen]);

    const customerPlaceholder = isPlaceholderFlagActive(c.placeholder);
    const customerRoleLabel = hasMeaningfulValue(c.type) ? c.type : c.isPrimary ? "Primary" : "Relationship";
    const hasMobile = (c.phone || "").replace(/[^\d]/g, "").length >= 10;
    const canSendWelcome = hasMobile && !c.doNotContact;
    const hasContact = hasMeaningfulValue(c.phone) || hasMeaningfulValue(c.email);
    const isIncomplete = customerPlaceholder || !hasMeaningfulValue(c.last) || (hasMeaningfulValue(c.first) && !hasContact);

    const toggleQuickNote = (noteLabel) => {
      const nextNotes = toggleList(c.quickNotes || [], noteLabel);
      const existingQuick = (c.quickNotes || []).join(" • ");
      const base = (c.note || "").split("\n").filter((l) => l.trim() && l.trim() !== existingQuick).join("\n").trim();
      const line = nextNotes.length ? nextNotes.join(" • ") : "";
      updateCust(c.id, { quickNotes: nextNotes, note: [base, line].filter(Boolean).join("\n") });
    };

    const handleHeaderRemove = () => {
      const empty = !hasMeaningfulValue(c.first) && !hasMeaningfulValue(c.last) && !hasMeaningfulValue(c.phone) && !hasMeaningfulValue(c.email);
      if (empty) onRemove(c.id, index);
      else updateCust(c.id, { _showMenu: true });
    };

    const shellClass = isIncomplete
      ? "placeholder-shell"
      : customerPlaceholder
      ? "placeholder-shell"
      : c.isPrimary
      ? "border-sky-300 bg-white"
      : c.type === "Point of Contact"
      ? "border-violet-300 bg-violet-50/30"
      : "border-slate-200 bg-white hover:border-sky-300";

    return (
      <div
        data-audit-key={customerPlaceholder ? `placeholder-customer-${c.id}` : undefined}
        data-customer-id={c.id}
        className={`group relative rounded-lg sm:rounded-xl border ${open ? "p-3 sm:p-5" : "px-3 py-2 sm:px-4 sm:py-2.5"} shadow-sm transition-all hover:shadow-md ${shellClass}`}
      >
        {c.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg" />}
        {total > 1 && !c._showMenu && (
          <button
            onClick={handleHeaderRemove}
            className={`absolute ${open ? "right-3 top-3 h-7 w-7" : "right-2 top-2 h-5 w-5 text-xs"} grid place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors`}
          >×</button>
        )}
        {c._showMenu && (
          <CustomerActionMenu
            c={c}
            customerDisplayName={customerDisplayName}
            onClose={() => updateCust(c.id, { _showMenu: false })}
            onMarkInactive={() => updateCust(c.id, { inactive: true, _showMenu: false })}
            onDelete={() => onRemove(c.id, index)}
          />
        )}

        <div
          className={`${open ? "mb-4" : "mb-0"} flex cursor-pointer flex-col gap-2 pl-1 sm:pl-2 sm:flex-row sm:items-center sm:justify-between`}
          onClick={(e) => { if (isHeaderToggleIgnoredTarget(e.target)) return; setOpen((v) => !v); }}
        >
          <div className="flex items-center gap-2">
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} className="text-slate-400 hover:text-slate-600" title={open ? "Collapse" : "Expand"}>
              <Chevron open={open} />
            </button>
            <div className={`flex items-center justify-center rounded-full bg-sky-100 font-bold text-sky-600 ${open ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]"}`}>{index + 1}</div>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold ${customerDisplayName ? "text-slate-800" : customerPlaceholder ? "placeholder-text" : "text-slate-800"}`}>{customerDisplayName || "Customer"}</span>
              <span className={`text-[10px] ${customerPlaceholder ? "placeholder-text" : "text-slate-500"}`}>{customerRoleLabel}</span>
            </div>
            {customerPlaceholder && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>}
            {c.contacted && <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Contacted</span>}
            {c.doNotContact && <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-700">Do Not Contact</span>}
            {c.contactViaRep && <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">Via Rep</span>}
          </div>
          {!customerPlaceholder && (
            <div className="flex flex-wrap gap-1.5">
              <ToggleMulti className={open ? "" : "!py-1 !px-2"} label="Primary" title={DEFAULT_COACHING["role.Primary"]} checked={!!c.isPrimary} onChange={() => updateCust(c.id, { isPrimary: !c.isPrimary })} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} />
              <ToggleMulti className={open ? "" : "!py-1 !px-2"} label="Policy Holder" title={DEFAULT_COACHING["role.Policyholder"]} checked={!!c.policyHolder} onChange={() => updateCust(c.id, { policyHolder: !c.policyHolder })} />
              <ToggleMulti className={open ? "" : "!py-1 !px-2"} label="Self Pay" checked={!!c.selfPay} onChange={() => updateCust(c.id, { selfPay: !c.selfPay })} />
            </div>
          )}
        </div>

        {open && (
          <div className="grid gap-4 pl-1 sm:pl-2">
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-1">
                <Field label="Type">
                  <SearchSelect value={c.type || ""} onChange={(v) => updateCust(c.id, { type: v })} options={CUSTOMER_TYPES} placeholder="Type..." maxResults={CUSTOMER_TYPES.length} />
                </Field>
              </div>
              <div className="col-span-2 sm:col-span-1"><Field label="First Name"><Input data-audit-key="custFirst" className={index === 0 && auditOn && highlightMissing?.custFirst ? "audit-missing" : ""} value={c.first} onChange={(e) => updateCust(c.id, { first: e.target.value })} /></Field></div>
              <div className="col-span-2 sm:col-span-1"><Field label="Last Name"><Input data-audit-key="custLast" className={hasMeaningfulValue(c.first) && !hasMeaningfulValue(c.last) ? "attention-outline" : ""} value={c.last} onChange={(e) => updateCust(c.id, { last: e.target.value })} /></Field></div>
              <div className="col-span-2 sm:col-span-1"><Field label="Phone"><Input data-audit-key="custPhone" className={c.type === "Point of Contact" ? "!border-violet-300 !ring-1 !ring-violet-100" : ""} type="tel" value={c.phone} onChange={(e) => updateCust(c.id, { phone: formatPhoneNumber(e.target.value) })} maxLength={14} placeholder="(555) 123-4567" /></Field></div>
              <div className="col-span-3 sm:col-span-1"><Field label="Email"><Input data-audit-key="custEmail" className={c.type === "Point of Contact" ? "!border-violet-300 !ring-1 !ring-violet-100" : ""} type="email" value={c.email} onChange={(e) => updateCust(c.id, { email: e.target.value })} placeholder="email@example.com" /></Field></div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred method:</span>
              {["Phone", "Email", "Text"].map((m) => (
                <ToggleMulti key={m} label={m} checked={c.preferredContact === m} onChange={() => updateCust(c.id, { preferredContact: c.preferredContact === m ? "" : m, doNotContact: false, contactViaRep: false })} />
              ))}
              <span className="w-px h-4 bg-slate-200 mx-0.5" />
              <ToggleMulti label="Contacted" checked={!!c.contacted} onChange={() => updateCust(c.id, { contacted: !c.contacted })} colorClass="!bg-emerald-50 !border-emerald-300 !text-emerald-700" />
              <span className="w-px h-4 bg-slate-200 mx-0.5" />
              <ToggleMulti label="Contact via Rep" checked={!!c.contactViaRep} onChange={() => updateCust(c.id, { contactViaRep: !c.contactViaRep, doNotContact: false, preferredContact: "" })} colorClass="!bg-amber-50 !border-amber-300 !text-amber-700" />
              <ToggleMulti label="Do Not Contact" checked={!!c.doNotContact} onChange={() => updateCust(c.id, { doNotContact: !c.doNotContact, contactViaRep: false, preferredContact: "" })} colorClass="!bg-rose-50 !border-rose-300 !text-rose-700" />
            </div>
            {c.contactViaRep && <div className="text-[10px] text-amber-600 pl-1">All communication for this contact should go through their representative.</div>}
            {c.doNotContact && <div className="text-[10px] text-rose-600 pl-1">This person is flagged as Do Not Contact — the system will block outreach.</div>}

            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => updateCust(c.id, { showWelcomePanel: !c.showWelcomePanel })} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${c.showWelcomePanel ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}>📱 {c.welcomeTextSent ? "Welcome Sent ✓" : "Welcome Text Options"}</button>
              <button type="button" onClick={() => updateCust(c.id, { showQuickNotes: !c.showQuickNotes })} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${c.showQuickNotes ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}>📝 Add Note</button>
            </div>

            {c.showWelcomePanel && (
              <CustomerWelcomePanel c={c} updateCust={updateCust} hasMobile={hasMobile} canSendWelcome={canSendWelcome} onSendWelcome={onSendWelcome} />
            )}
            {c.showQuickNotes && (
              <CustomerQuickNotes c={c} updateCust={updateCust} onToggleQuickNote={toggleQuickNote} />
            )}

            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600">Done</button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
