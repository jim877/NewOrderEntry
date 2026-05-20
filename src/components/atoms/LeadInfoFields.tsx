// @ts-nocheck
import React, { useState, useEffect, useRef, memo } from "react";
import { Field } from "./Field";
import { ToggleMulti } from "./ToggleMulti";
import { ReferrerSearchSection } from "./ReferrerSearchSection";
import { ReferrerRoleAssignment } from "./ReferrerRoleAssignment";
import { SalesRepSelector } from "./SalesRepSelector";
import { SuggestedRolesModal } from "./SuggestedRolesModal";
import {
  LEAD_SOURCES, MARKETING_SOURCES, INTERNAL_TYPES,
  LEAD_SOURCE_HELP, DEFAULT_COACHING,
} from "../../config";
import { getBestMatch } from "../../utils/search";
import { getRepInitials } from "../../utils/names";
import { normalizeCompany, normalizeContact } from "../../utils/strings";

// LeadInfoFields — "How did we get this order?" section. Composes the lead-source toggle,
// ReferrerSearchSection + ReferrerRoleAssignment (when Referral), channel/type picker for
// marketing/internal, SalesRepSelector (or auto-assigned display), and SuggestedRolesModal.
// dismissTip is optional — when omitted the dismiss × on a help tip is a silent no-op.
export const LeadInfoFields = memo(
  ({
    data, update, updateMany, toggleMulti, showInlineHelp, auditOn,
    salesRep, setSalesRep, onApplyReferrerRoles, suggestedReferrerRoles,
    combinedContactOptions, parseCombinedContact, triggerAutoFlash, setToast,
    getSalesRepForContact, onOpenCrmLog, onAddNewToSystem, dismissTip,
  }) => {
    const referrerDisplayValue =
      data.referrer && data.referringCompany ? `${data.referrer} — ${data.referringCompany}` :
      (data.referrer || data.referringCompany || "");

    const [referrerQuery, setReferrerQuery] = useState(referrerDisplayValue);
    const [addNewContact, setAddNewContact] = useState(null);
    const [showSuggestedRoles, setShowSuggestedRoles] = useState(false);
    const [suggestedSelection, setSuggestedSelection] = useState(suggestedReferrerRoles || []);
    const referrerFieldAnchorRef = useRef(null);
    const referrerRep = getSalesRepForContact && data.referrer ? getSalesRepForContact(data.referrer) : "";

    useEffect(() => { if (!data.referrer && !data.referringCompany) setAddNewContact(null); }, [data.referrer, data.referringCompany]);
    useEffect(() => setReferrerQuery(referrerDisplayValue), [referrerDisplayValue]);
    useEffect(() => setSuggestedSelection(suggestedReferrerRoles || []), [suggestedReferrerRoles]);
    // Auto-focus referrer field when Referral is selected and no referrer yet
    useEffect(() => {
      if (data.leadSourceCategory === "Referral" && !data.referrer) {
        setTimeout(() => {
          const el = referrerFieldAnchorRef.current as HTMLElement | null;
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.querySelector("input")?.focus(); }
        }, 300);
      }
    }, [data.leadSourceCategory]);

    const referrerBestMatch = getBestMatch(combinedContactOptions || [], referrerQuery);
    const applyReferrerValue = (value) => {
      const raw = (value || "").trim();
      const parsed = raw ? (parseCombinedContact?.(raw) || { contact: raw, company: "" }) : { contact: "", company: "" };
      if (parsed.contact && !parsed.company) { setToast("Contact must include a company."); return; }
      const currentContact = data.referrer || "";
      const currentCompany = data.referringCompany || "";
      const nextContact = parsed.contact || "";
      const nextCompany = parsed.company || "";
      const sameBillingContact     = !!currentContact && normalizeContact(data.billingContact || "")     === normalizeContact(currentContact);
      const sameBillingCompany     = !!currentCompany && normalizeCompany(data.billingCompany || "")     === normalizeCompany(currentCompany);
      const sameInsuranceAdjuster  = !!currentContact && normalizeContact(data.insuranceAdjuster || "")  === normalizeContact(currentContact);
      const sameInsuranceCompany   = !!currentCompany && normalizeCompany(data.insuranceCompany || "")   === normalizeCompany(currentCompany);
      const sameNationalCarrier    = !!currentCompany && normalizeCompany(data.nationalCarrier || "")    === normalizeCompany(currentCompany);
      const patch: any = { referrer: nextContact, referringCompany: nextCompany };
      if (sameBillingContact) patch.billingContact = nextContact;
      if (sameBillingCompany) patch.billingCompany = nextCompany;
      if (sameInsuranceAdjuster) patch.insuranceAdjuster = nextContact;
      if (sameInsuranceCompany) patch.insuranceCompany = nextCompany;
      if (sameNationalCarrier) patch.nationalCarrier = nextCompany;
      if (!nextCompany && data.billingPayer === "Referrer" && (sameBillingContact || sameBillingCompany)) patch.billingPayer = "";
      if (getSalesRepForContact && nextContact && (!data.salesRep || data.salesRep === referrerRep)) {
        patch.salesRep = getSalesRepForContact(nextContact) || "";
      }
      updateMany(patch);
      if (nextCompany) triggerAutoFlash?.("referringCompany");
      if (nextContact) triggerAutoFlash?.("referrer");
    };

    const ensureReferrerFromQuery = () => {
      if (!referrerQuery) return;
      if (referrerDisplayValue && referrerDisplayValue.toLowerCase() === referrerQuery.toLowerCase()) return;
      const best = getBestMatch(combinedContactOptions || [], referrerQuery);
      if (best) applyReferrerValue(best);
    };

    return (
      <div className="space-y-4">
        <Field label="How did we get this order?">
          <div className="flex flex-wrap justify-start gap-2" data-audit-key="leadSourceCategory">
            {LEAD_SOURCES.map((s) => (
              <ToggleMulti key={s} label={s} title={LEAD_SOURCE_HELP[s]} checked={data.leadSourceCategory === s} onChange={() => update("leadSourceCategory", s)} />
            ))}
          </div>
        </Field>
        {showInlineHelp && data.leadSourceCategory === "Referral" && (
          <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); e.preventDefault();
                const wrapper = e.target.parentElement;
                const label = wrapper?.querySelector("span.font-bold")?.textContent?.replace(/:$/, "") || "";
                if (label) dismissTip?.(label);
                if (wrapper) wrapper.style.display = "none";
              }}
              className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm"
              title="Dismiss this tip"
            >×</button>
            🎓 <span className="font-bold">Referrer:</span> {DEFAULT_COACHING["field.referrer"]}
          </div>
        )}

        {data.leadSourceCategory === "Referral" && (
          <div className="grid gap-4 animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100">
            <div ref={referrerFieldAnchorRef}>
              <ReferrerSearchSection
                data={data} auditOn={auditOn}
                referrerDisplayValue={referrerDisplayValue}
                combinedContactOptions={combinedContactOptions}
                referrerBestMatch={referrerBestMatch}
                applyReferrerValue={applyReferrerValue}
                setReferrerQuery={setReferrerQuery}
                ensureReferrerFromQuery={ensureReferrerFromQuery}
                updateMany={updateMany} setToast={setToast}
                onAddNewToSystem={onAddNewToSystem}
              />
            </div>
            {(data.referrer || data.referringCompany) && !addNewContact && (
              <ReferrerRoleAssignment
                data={data} updateMany={updateMany}
                referrerDisplayValue={referrerDisplayValue} setToast={setToast}
              />
            )}
            <button onClick={onOpenCrmLog} className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700">
              + Add CRM Log{data.referrer ? ` for ${data.referrer}` : ""}
            </button>
          </div>
        )}
        {data.leadSourceCategory === "Marketing" && (
          <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100">
            <Field label="Channel">
              <div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">
                {MARKETING_SOURCES.map((s) => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}
              </div>
            </Field>
          </div>
        )}
        {data.leadSourceCategory === "Internal" && (
          <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100">
            <Field label="Type">
              <div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">
                {INTERNAL_TYPES.map((s) => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}
              </div>
            </Field>
          </div>
        )}

        {data.leadSourceCategory && salesRep && (
          <Field label="Sales Rep">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white text-xs font-bold shadow-sm">{getRepInitials(salesRep)}</span>
              <span className="text-sm font-semibold text-slate-700">{salesRep.split(",")[0]}</span>
            </div>
            {showInlineHelp && (
              <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-violet-700 mt-1 flex items-start gap-1">
                <span className="flex-1">{DEFAULT_COACHING["field.autoAssigned"]}</span>
                <button type="button" onClick={(e) => { e.currentTarget.parentElement.style.display = "none"; }} className="text-violet-400 hover:text-violet-600 text-sm font-bold shrink-0 ml-1">×</button>
              </div>
            )}
          </Field>
        )}

        {data.leadSourceCategory && !salesRep && (
          <SalesRepSelector
            salesRep={salesRep} setSalesRep={setSalesRep}
            referrerRep={referrerRep} showInlineHelp={showInlineHelp}
          />
        )}

        <SuggestedRolesModal
          show={showSuggestedRoles}
          onClose={() => setShowSuggestedRoles(false)}
          anchorRef={referrerFieldAnchorRef}
          suggestedSelection={suggestedSelection}
          setSuggestedSelection={setSuggestedSelection}
          ensureReferrerFromQuery={ensureReferrerFromQuery}
          onApply={onApplyReferrerRoles}
          data={data}
        />
      </div>
    );
  }
);
