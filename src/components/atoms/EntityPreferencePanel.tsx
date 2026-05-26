// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Chevron } from "./Chevron";
import { normalizeCompany, normalizeContact, mergeUniqueStrings } from "../../utils/strings";

// EntityPreferencePanel — collapsible card showing per-company and per-contact instructions
// pulled from the linked profiles. Auto-collapses entries the user has already seen this session.
export const EntityPreferencePanel = ({
  company = "",
  contact = "",
  getCompanyProfile,
  getContactProfile,
  onOpenCustomerText,
  sessionInstructionKeys,
  onMarkInstructionKeysSeen,
  className = "",
}) => {
  const companyProfile = company ? getCompanyProfile?.(company) : null;
  const contactProfile = contact ? getContactProfile?.(contact) : null;
  const companyInstructions = companyProfile?.companyInstructions || [];
  const contactInstructions = contactProfile?.contactInstructions || [];
  const specialDocuments = mergeUniqueStrings(
    companyProfile?.specialDocuments || [],
    contactProfile?.specialDocuments || [],
  );
  const customerTextForms = mergeUniqueStrings(
    companyProfile?.customerTextForms || [],
    contactProfile?.customerTextForms || [],
    specialDocuments,
  );
  const companyLabel = (companyProfile?.companyName || company || "").trim();
  const contactLabel = (contactProfile?.contactName || contact || "").trim();
  const companyKey =
    (companyInstructions.length || companyProfile?.specialDocuments?.length) && companyLabel
      ? `company:${normalizeCompany(companyLabel)}`
      : "";
  const contactKey =
    (contactInstructions.length || contactProfile?.specialDocuments?.length) && contactLabel
      ? `contact:${normalizeContact(contactLabel)}`
      : "";
  const panelIdentity = [companyKey, contactKey].filter(Boolean).join("|") ||
    `${normalizeCompany(companyLabel)}|${normalizeContact(contactLabel)}`;
  const companyCollapsedByDefault = !!companyKey && sessionInstructionKeys?.has?.(companyKey);
  const contactCollapsedByDefault = !!contactKey && sessionInstructionKeys?.has?.(contactKey);
  const [collapsedState, setCollapsedState] = useState({
    company: companyCollapsedByDefault,
    contact: contactCollapsedByDefault,
  });

  useEffect(() => {
    setCollapsedState({ company: companyCollapsedByDefault, contact: contactCollapsedByDefault });
  }, [panelIdentity]);

  if (!companyInstructions.length && !contactInstructions.length && !specialDocuments.length) return null;

  const companyEntries = [
    ...companyInstructions,
    ...specialDocuments.map((item) => ({ type: "Paperwork", text: item, isPaperwork: true })),
  ];
  const contactEntries = [...contactInstructions];

  const toggleGroup = (group, keys = []) => {
    setCollapsedState((prev) => {
      const nextCollapsed = !prev[group];
      if (prev[group] && !nextCollapsed && keys.length) onMarkInstructionKeysSeen?.(keys);
      return { ...prev, [group]: nextCollapsed };
    });
  };

  const renderGroup = ({ groupKey, title, entries, seenKey }) => {
    if (!entries.length) return null;
    const collapsed = collapsedState[groupKey];
    return (
      <div key={`instruction-group-${groupKey}`} className="rounded-lg border border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={() => toggleGroup(groupKey, seenKey ? [seenKey] : [])}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors rounded-lg"
        >
          <span className="text-[11px] font-bold text-slate-500">{title}</span>
          <Chevron open={!collapsed} />
        </button>
        {!collapsed ? (
          <div className="px-3 py-2 border-t border-slate-100">
            <div className="space-y-1">
              {entries.map((item) =>
                item.isPaperwork ? (
                  <div key={`${groupKey}-${item.type}-${item.text}`} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-amber-600 shrink-0">📄</span>
                    <span><span className="font-bold text-slate-800">Paperwork:</span> {item.text}</span>
                  </div>
                ) : (
                  <div key={`${groupKey}-${item.type}-${item.text}`} className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">{item.type}:</span> {item.text}
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {renderGroup({ groupKey: "company", title: companyLabel ? `${companyLabel} Instructions` : "Company Instructions", entries: companyEntries, seenKey: companyKey })}
      {renderGroup({ groupKey: "contact", title: contactLabel ? `${contactLabel} Instructions` : "Contact Instructions", entries: contactEntries, seenKey: contactKey })}
      {customerTextForms.length > 0 && onOpenCustomerText ? (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => onOpenCustomerText(customerTextForms)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
          >
            Text customer with form
          </button>
        </div>
      ) : null}
    </div>
  );
};
