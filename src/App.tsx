// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import SameDayScope from './SameDayScope';
import SdsDocument from './SdsDocument';
import { CreditCard, FileText, Globe, Lock, LockOpen, Shield, SquarePen, Tag, UserRound } from 'lucide-react';
import {
  buildScopeBridgeSnippet,
  createScopeBridgeState,
  normalizeScopeBridgeState,
  withScopeBridgeSnippet,
} from './scopeBridgeUtils';

// --- STYLES ---
const STYLES = `
  :root { font-size: 17px; }
  body { color: #0f172a; }
  .text-slate-400 { color: #6b7280 !important; }
  .text-slate-500 { color: #475569 !important; }
  .text-slate-600 { color: #334155 !important; }
  .text-slate-700 { color: #1f2937 !important; }
  .bg-slate-50 { background-color: #f8fafc !important; }
  .bg-sky-50 { background-color: #eff6ff !important; }

  /* Input Reset */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  select { 
    -webkit-appearance: none; 
    -moz-appearance: none; 
    appearance: none; 
    background-color: #fff; 
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 12px;
    padding-right: 2rem;
  }
  
  /* Animations */
  .fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .slide-up { animation: slideUp 0.3s ease-out forwards; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

  /* --- PURPLE SECTION FADE (3 seconds) --- */
  .animate-purple-section-fade {
      border-width: 2px;
      border-style: solid;
      animation: purpleSectionFade 3s ease-out forwards;
  }
  @keyframes purpleSectionFade {
    0% { border-color: #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.2); background-color: rgba(56, 189, 248, 0.03); }
    30% { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.1); }
    100% { border-color: #e2e8f0; box-shadow: none; background-color: transparent; }
  }

  /* --- BUTTON SELECTION FADE (Ripple Ring) --- */
  .animate-outline-fade-purple {
      animation: outlineFadePurple 0.6s ease-out forwards;
  }
  @keyframes outlineFadePurple {
      0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.6); }
      100% { box-shadow: 0 0 0 8px rgba(56, 189, 248, 0); }
  }

  .animate-nav-focus {
      animation: navFocusGlow 1s ease-out forwards;
  }
  @keyframes navFocusGlow {
      0% {
        box-shadow:
          0 0 0 2px rgba(14, 165, 233, 0.45),
          inset 0 0 0 1px rgba(14, 165, 233, 0.65),
          0 0 18px rgba(14, 165, 233, 0.22);
      }
      100% {
        box-shadow:
          0 0 0 0 rgba(14, 165, 233, 0),
          inset 0 0 0 0 rgba(14, 165, 233, 0),
          0 0 0 rgba(14, 165, 233, 0);
      }
  }
  
  /* --- ORANGE HIGHLIGHT (Smart Fields) --- */
  .animate-orange-highlight {
      animation: orangeHighlight 2s ease-out forwards;
  }
  @keyframes orangeHighlight {
      0% { border-color: #f97316; background-color: #fff7ed; box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2); }
      100% { border-color: #e2e8f0; background-color: white; box-shadow: none; }
  }

  .auto-flash {
      animation: autoFlash 1.2s ease-out forwards;
      border-color: #38bdf8 !important;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
  }
  @keyframes autoFlash {
      0% { border-color: #38bdf8; box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.3); }
      100% { border-color: #e2e8f0; box-shadow: none; }
  }

  .company-placeholder {
      border-color: #fb923c !important;
      background-color: rgba(255, 237, 213, 0.6);
  }
  .placeholder-shell {
      border-width: 2px !important;
      border-style: dotted !important;
      border-color: #fbbf24 !important;
      background: #fffbeb !important;
  }
  .placeholder-chip {
      border: 1px dotted #f59e0b;
      background: #fffbeb;
      color: #b45309;
  }
  .placeholder-text {
      color: #b45309;
  }
  .audit-placeholder-pill {
      background: #fffbeb;
      border-color: #fcd34d;
      color: #b45309;
  }

  /* Custom Scrollbar */
  .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .audit-missing { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }
  .audit-pill { background: #fff5f5; color: #b91c1c; border: 1px solid #fecaca; }
  .audit-outline { border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15); }
  .audit-pulse { animation: auditPulse 1.2s ease-out 2; }
  @keyframes auditPulse {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.35); }
    100% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  }
  .suggested-field { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
  .attention-fill { border-color: #fb923c !important; background-color: #fff7ed !important; color: #c2410c !important; box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15); }
  .attention-outline { border-color: #fb923c !important; box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15); }
  .suggested-pill { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
  .suggested-text { color: #b45309; }

  .compact-mode input,
  .compact-mode select,
  .compact-mode textarea {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 0.8125rem;
  }
  .compact-mode .section-header-tight { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .compact-mode .p-6 { padding: 0.9rem !important; }
  .compact-mode .p-5 { padding: 0.8rem !important; }
  .compact-mode .p-4 { padding: 0.7rem !important; }
  .compact-mode .gap-6 { gap: 0.75rem !important; }
  .compact-mode .gap-4 { gap: 0.5rem !important; }
  .compact-mode .gap-3 { gap: 0.4rem !important; }
  .compact-mode .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem !important; }
  .compact-mode .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem !important; }
  .compact-mode .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.4rem !important; }

  html { scroll-behavior: smooth; }
  .google-address-search input:focus { outline: none !important; box-shadow: none !important; ring: none !important; }
`;

// --- UTILS ---
function safeUid(){ 
  try {
    if(typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch(e) {}
  return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const createPlaceholderFlag = (kind, reason = "") => ({
  active: true,
  kind,
  reason,
  createdAt: new Date().toISOString()
});

const isPlaceholderFlagActive = (flag) => !!flag && flag.active !== false;

const hasMeaningfulValue = (value) => !!(value || "").toString().trim();

const hasCustomerDetails = (customer = {}) =>
  [
    customer.first,
    customer.last,
    customer.phone,
    customer.email,
    customer.type
  ].some(hasMeaningfulValue);

const isHeaderToggleIgnoredTarget = (target) => {
  if (!(target instanceof Element)) return false;
  return !!target.closest('button, input, select, textarea, a, [role="button"], [data-header-toggle-ignore="true"]');
};

const normalizeBridgeIssueKey = (value = "") =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizePlaceholderKeyPart = (value = "") =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
const sameNormalizedCompany = (left = "", right = "") => {
  const a = normalizeCompany(left || "");
  const b = normalizeCompany(right || "");
  return !!a && !!b && a === b;
};
const sameNormalizedContact = (left = "", right = "") => {
  const a = normalizeContact(left || "");
  const b = normalizeContact(right || "");
  return !!a && !!b && a === b;
};

const getInitials = (name = "") => {
  const parts = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SR";
  const filtered = parts.filter(p => !["SALES", "REP", "REPRESENTATIVE"].includes(p.toUpperCase()));
  const useParts = filtered.length ? filtered : parts;
  const first = useParts[0][0] || "";
  const last = useParts.length > 1 ? useParts[useParts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const splitName = (name = "") => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || "",
    last: parts.slice(1).join(" ")
  };
};

const getRepInitials = (name = "") => {
  const base = (name || "").split(",")[0] || name;
  return getInitials(base);
};

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const formatCurrencyInput = (value) => {
  if (value === null || value === undefined) return "";
  const cleaned = value.toString().replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const [intPartRaw, decPartRaw] = cleaned.split(".");
  const intPart = intPartRaw ? intPartRaw.replace(/^0+(?=\d)/, "") : "0";
  const intFormatted = Number(intPart || 0).toLocaleString("en-US");
  const decPart = decPartRaw ? decPartRaw.slice(0, 2) : "";
  return `$${intFormatted}${decPart ? "." + decPart : ""}`;
};

const formatShortTimestamp = (date = new Date()) => {
  try {
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (e) {
    return date.toISOString();
  }
};

const isTimeIn12AmHour = (timeStr = "") => /12:\d{2}\s*AM/i.test((timeStr || "").trim());
const shouldAutoFirm = (timeStr = "") => !!(timeStr || "").trim() && !isTimeIn12AmHour(timeStr);

const toIcsDate = (dateStr = "") => {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, "");
};

const parseTimeTo24h = (timeStr = "") => {
  const match = (timeStr || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return { hour, minute };
};

const formatIcsDateTime = (dateStr = "", timeStr = "") => {
  if (!dateStr) return "";
  const time = parseTimeTo24h(timeStr);
  if (!time) return toIcsDate(dateStr);
  const hh = String(time.hour).padStart(2, "0");
  const mm = String(time.minute).padStart(2, "0");
  return `${toIcsDate(dateStr)}T${hh}${mm}00`;
};

const addHours = (timeStr = "", hours = 1) => {
  const time = parseTimeTo24h(timeStr);
  if (!time) return timeStr;
  const nextHour = (time.hour + hours) % 24;
  const hh = String(nextHour).padStart(2, "0");
  const mm = String(time.minute).padStart(2, "0");
  return `${hh}:${mm}`;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const EVENT_SYSTEM_PREFIXES = ["Conditions:", "Bring:", "Service Offerings:", "Quick Notes:", "Scope Notes:", "Estimate Required:"];
const stripEventSystemLines = (text = "") =>
  text
    .split("\n")
    .filter(line => !EVENT_SYSTEM_PREFIXES.some(prefix => line.trim().startsWith(prefix)))
    .join("\n");

const buildEventSystemEntries = (data, conditionSummary) => {
  const entries = [];
  if (conditionSummary) entries.push({ label: "Conditions", value: conditionSummary });
  if ((data.loadList || []).length) entries.push({ label: "Bring", value: (data.loadList || []).join(", ") });
  if ((data.serviceOfferings || []).length) entries.push({ label: "Service Offerings", value: (data.serviceOfferings || []).join(", ") });
  if ((data.quickInstructionNotes || []).length) entries.push({ label: "Quick Notes", value: (data.quickInstructionNotes || []).join(", ") });
  if ((data.quickScopeNotes || []).length) entries.push({ label: "Scope Notes", value: (data.quickScopeNotes || []).join(", ") });
  if (data.estimateRequested) {
    let value = data.estimateType || "Yes";
    if (data.estimateRequestedBy) value += ` (Requested By: ${data.estimateRequestedBy})`;
    entries.push({ label: "Estimate Required", value });
  }
  return entries;
};

const buildEventSystemLines = (data, conditionSummary) => {
  const override = (data?.eventSystemOverride || "").trim();
  if (override) return override;
  return buildEventSystemEntries(data, conditionSummary)
    .map(entry => `${entry.label}: ${entry.value}`)
    .join("\n");
};

const composeEventInstructions = (base, data, conditionSummary) => {
  const cleaned = base || "";
  const system = buildEventSystemLines(data, conditionSummary);
  if (!system) return cleaned;
  return cleaned ? `${cleaned}\n${system}` : system;
};

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getOptionText = (opt) => {
  if (typeof opt === "string") return opt;
  if (!opt) return "";
  return String(opt.label ?? opt.value ?? "");
};

const getBestMatch = (options = [], query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return "";
  const starts = options.find(o => getOptionText(o).toLowerCase().startsWith(q));
  if (starts) return getOptionText(starts);
  const includes = options.find(o => getOptionText(o).toLowerCase().includes(q));
  return includes ? getOptionText(includes) : "";
};

const normalizeContact = (value) => value.trim().toLowerCase();
const normalizeCompany = (value) => value.trim().toLowerCase();
const normalizeStringList = (value) => {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(
      raw
        .map((item) => (item || "").toString().trim())
        .filter(Boolean)
    )
  );
};
const mergeUniqueStrings = (...lists) => normalizeStringList(lists.flat());

// --- CONSTANTS ---
const STATES=["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CUSTOMER_TYPES=[
  "Primary",
  "Secondary",
  "Point of Contact",
  "Assistant",
  "Employee",
  "Husband",
  "Wife",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Relative",
  "Boyfriend",
  "Girlfriend",
  "Housekeeper",
  "Neighbor",
  "Owner",
  "Partner",
  "Policyholder",
  "Attorney",
  "Manager",
  "Other"
];
const ORDER_STATUSES=["New","Intake Complete","Pickup Complete","Tagging Complete","Ready to Bill"];
const MEETING_TYPES = ["Scope", "Pickup", "In-Home", "Meeting"];
const DEFAULT_COMPANIES=["Allstate", "Allstate Insurance Co.", "State Farm", "Chubb", "Servpro of Anytown", "Metro Claims", "Pure Insurance", "DKI FastDry", "United Claims", "Croziers Moving", "Contractor Connection", "Not Yet Known", "Not Provided", "Company 1", "Company 2"];
const DEFAULT_CONTACTS=["Alex Morgan", "Jamie Lee", "Pat Adjuster", "Ronzel Simmons", "Zack Barsack", "Sim Fern", "Steven Earthman", "Casey Assignment", "Contact 1", "Contact 2"];
const WELCOME_CAMPAIGNS=["Brochure", "Rush Guide", "Vcard"];
const VENDOR_TYPES=["Art","Contents","Moving","Mitigation","Contractor","Consultant","Agent","Broker","Decorator","Building Management","Superintendent","Other"];
const SALES_REPS=["Dave Fenyo, Sales Rep","Jim Fenyo","Josh Cintron, Sales Rep"];
const SERVICE_OFFERINGS=["Appliance","Art","Consulting","Contents","Furniture","Hand Clean","Pack-out","Rugs","Storage Only","Textiles","TLI","Expert Stain Removal"];
const SUGGESTED_GROUPS = ["RD","RFD","STD","STFD","LTD","LTFD","Inhome","TLI","Test","Dispose","Storage Only"];
const LIVING_STATUS_ADDRESS_TYPES = ["Moving", "Hotel", "Temp", "Neighbor", "Relative", "Rental", "Other Home"];
const SUGGESTED_GROUP_HELP = {
  RD: "Rush Delivery (within 1 week)",
  RFD: "Rush Final Delivery (all within 1 week)",
  STD: "Short Term Delivery (within 1 month)",
  STFD: "Short Term Final (all within 1 month)",
  LTD: "Long Term Delivery (greater than 1 month)",
  LTFD: "Long Term Final Delivery (greater than 1 month)",
  Inhome: "In-Home-Cleaning",
  TLI: "Total Loss Inventory of non-salvageable items",
  Test: "Test cleaning to determine scope (results needed ASAP)",
  Dispose: "Items that will not be returned",
  "Storage Only": "Items that will be stored and returned without cleaning"
};
const BRIDGE_CUSTOMER_BLOCKERS = [
  "Wants Everything Replaced",
  "Not sure if submitting a claim",
  "Customer Wants Estimate",
  "Won't Sign Authorization",
  "Wants a cash-out",
  "May clean themselves",
];
const SPECIAL_PAPERWORK_BLOCKER = "Special paperwork required";
const UNKNOWN_INSURANCE_BLOCKER = "Insurance Company Not Yet Known";
const BRIDGE_INSURANCE_BLOCKERS = [
  "Limit Issue",
  "Hasn't approved scope",
  "Adjuster Wants Estimate",
  "Hasn't determined coverage",
  "Pushing another vendor",
  "Waiting on Hygienist Results",
  SPECIAL_PAPERWORK_BLOCKER,
  UNKNOWN_INSURANCE_BLOCKER,
];
const BRIDGE_BLOCKER_GROUPS = [
  { id: "customer", label: "Customer", issues: BRIDGE_CUSTOMER_BLOCKERS },
  { id: "insurance_adjuster", label: "Insurance/Adjuster", issues: BRIDGE_INSURANCE_BLOCKERS },
];
const BRIDGE_BLOCKER_ITEMS = [
  ...BRIDGE_CUSTOMER_BLOCKERS,
  ...BRIDGE_INSURANCE_BLOCKERS,
];
const BRIDGE_BLOCKER_ALIASES = {
  "Contacting Customer": "Wants Everything Replaced",
  "Authorization": "Won't Sign Authorization",
  "Scope Approval": "Hasn't approved scope",
  "Estimate Approval": "Adjuster Wants Estimate",
  "Coverage Determination": "Hasn't determined coverage",
  "IH Results": "Waiting on Hygienist Results",
  "Awaiting Signed Authorization": "Won't Sign Authorization",
  "Awaiting Estimate Approval": "Adjuster Wants Estimate",
  "Awaiting Hygienist Results": "Waiting on Hygienist Results",
  "Awaiting Coverage Determination": "Hasn't determined coverage",
  "Awaiting Test Group Results": "Waiting on Hygienist Results",
  "Deciding Who Will Pay": "Not sure if submitting a claim",
  "Customer might clean it themselves": "May clean themselves",
  "Unsure if submitting a claim": "Not sure if submitting a claim",
  "Limit Issues": "Limit Issue",
};
const BRIDGE_AUTO_MANAGED_BLOCKERS = [
  "Won't Sign Authorization",
  "Customer Wants Estimate",
  "Adjuster Wants Estimate",
  SPECIAL_PAPERWORK_BLOCKER,
  UNKNOWN_INSURANCE_BLOCKER,
];
const BRIDGE_PICKUP_STEP_OPTIONS = [
  { id: "schedule", label: "Schedule", tone: "green" },
  { id: "priority", label: "Priority Groups Only", tone: "yellow" },
  { id: "hold", label: "Hold", tone: "red" },
];
const BRIDGE_PROCESS_STEP_OPTIONS = [
  { id: "yes", label: "Yes", tone: "green" },
  { id: "priority", label: "Priority Only", tone: "yellow" },
  { id: "hold", label: "Hold (Tag and Hold)", tone: "red" },
];
const BRIDGE_DELIVERY_STEP_OPTIONS = [
  { id: "ok", label: "OK to deliver", tone: "green" },
  { id: "priority", label: "Priority Groups Only", tone: "yellow" },
  { id: "hold_cod", label: "Hold (COD)", tone: "red" },
];
const BRIDGE_MILESTONE_FIELDS = [
  { id: "authorizationOnFile", atId: "authorizationOnFileAt", byId: "authorizationOnFileBy", label: "Authorization Signed" },
  { id: "scopeApproved", atId: "scopeApprovedAt", byId: "scopeApprovedBy", label: "Scope Pre-Approved" },
  { id: "estimateApproved", atId: "estimateApprovedAt", byId: "estimateApprovedBy", label: "Adjuster Approval" },
];
const canonicalBridgeIssue = (issue = "") => BRIDGE_BLOCKER_ALIASES[issue] || issue;
const bridgeStageToneClass = (tone, active) => {
  if (tone === "green") return active ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300";
  if (tone === "yellow") return active ? "border-amber-300 bg-amber-100 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:border-amber-300";
  if (tone === "red") return active ? "border-rose-300 bg-rose-100 text-rose-800" : "border-slate-200 bg-white text-slate-700 hover:border-rose-300";
  return active ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300";
};
const SERVICE_OFFERING_HELP = {
  Appliance: "Large items requiring specialized handling (refrigerators, ranges, etc.).",
  Art: "Items valued for artistic/aesthetic merit.",
  Consulting: "Expert opinions and guidance.",
  Contents: "Hard and soft goods.",
  Furniture: "Upholstered furniture pieces.",
  "Pack-out": "Moving and relocation services.",
  Rugs: "Area rugs and carpets.",
  "Storage Only": "Items stored without cleaning.",
  Textiles: "Fabric/leather items (clothing, accessories, etc.).",
  TLI: "Total Loss Inventory - listing/valuing non-restorable items.",
  "Expert Stain Removal": "Specialized stain removal services."
};
const INSURANCE_COMPANY_SHORTCUTS = [
  {
    company: "Not Yet Known",
    helpText: "You will enter the company info later.",
    createsBlocker: true,
  },
  {
    company: "Not Provided",
    helpText: "You will not be able to find out.",
    createsBlocker: false,
  },
];
const INSURANCE_COMPANY_SHORTCUT_SET = new Set(
  INSURANCE_COMPANY_SHORTCUTS.map((item) => normalizeCompany(item.company))
);
const NATIONAL_CARRIER_LINKS = {
  [normalizeCompany("Allstate")]: "Allstate",
  [normalizeCompany("Allstate Insurance Co.")]: "Allstate",
  [normalizeCompany("State Farm")]: "State Farm",
  [normalizeCompany("Nationwide")]: "Nationwide",
  [normalizeCompany("Farmers")]: "Farmers",
  [normalizeCompany("USAA")]: "USAA",
  [normalizeCompany("Liberty Mutual")]: "Liberty Mutual",
  [normalizeCompany("Progressive")]: "Progressive",
  [normalizeCompany("Travelers")]: "Travelers",
  [normalizeCompany("Chubb")]: "Chubb",
  [normalizeCompany("American Family")]: "American Family",
  [normalizeCompany("Pure Insurance")]: "Pure Insurance",
};
const INSTRUCTION_TYPES = [
  "Tagging",
  "Cleaning",
  "Packing",
  "Delivery",
  "Communication",
  "Scheduling",
  "Pickup",
  "Billing",
  "Collections",
];
const ORDER_INSTRUCTION_PRESETS = {
  Tagging: [
    "A) TAG: Room By Room",
  ],
  Cleaning: [
    "Allergies",
  ],
  Packing: [
    "Bag Individually",
  ],
  Delivery: [
    "COD you MUST PICK UP A CHECK",
  ],
  Communication: [
    "Prefers Text",
  ],
  Scheduling: [
    "Send Customer Inventory",
  ],
  Pickup: [
    "Cost-conscious: VERY",
  ],
  Billing: [
    "Must Run Thru TPA",
  ],
  Collections: [
    "Pays Us Electronically",
  ],
};
const ACTUAL_COMPANY_INSTRUCTION_LIBRARY = [
  { type: "Pickup", text: "Cost-conscious: VERY" },
  { type: "Scheduling", text: "Send Customer Inventory" },
  { type: "Scheduling", text: "Send Customer Photos" },
  { type: "Delivery", text: "COD you MUST PICK UP A CHECK" },
  { type: "Communication", text: "Wants Constant Updates" },
  { type: "Billing", text: "Use Xactimate" },
  { type: "Billing", text: "Must Run Thru TPA" },
  { type: "Billing", text: "Send Photos Separate from Invoice" },
  { type: "Billing", text: "Tell Adjuster When to Run thru TPA" },
  { type: "Collections", text: "Pays Us Electronically" },
];
const ACTUAL_CONTACT_INSTRUCTION_LIBRARY = [
  { type: "Tagging", text: "A) TAG: Room By Room" },
  { type: "Cleaning", text: "Allergies" },
  { type: "Packing", text: "Bag Individually" },
  { type: "Communication", text: "Do Not Call" },
  { type: "Communication", text: "Prefers Email" },
  { type: "Communication", text: "Prefers Phone" },
  { type: "Communication", text: "Prefers Text" },
  { type: "Pickup", text: "Call from Pickup with Scope/Estimate" },
  { type: "Pickup", text: "Photo Inventory Required" },
  { type: "Pickup", text: "Reject Anything Questionable" },
  { type: "Delivery", text: "Must sign COS for Nationwide" },
  { type: "Collections", text: "Confirm direct payment" },
];
const INSTRUCTION_TYPE_SET = new Set(INSTRUCTION_TYPES.map((type) => type.toLowerCase()));
const getInstructionTypeTextKey = (type = "", text = "") =>
  `${(type || "").toString().trim().toLowerCase()}|${(text || "").toString().trim().toLowerCase()}`;
const inferInstructionType = (text = "", fallbackType = "Communication") => {
  const normalized = (text || "").toString().trim().toLowerCase();
  if (!normalized) return fallbackType;
  if (/\b(tag|hanger|bins?)\b/.test(normalized)) return "Tagging";
  if (/\b(clean|press|starch|dc\b|machine clean|free & clear|allerg|pets?|reject)\b/.test(normalized)) return "Cleaning";
  if (/\b(box|bag|poly|pack|hanger)\b/.test(normalized)) return "Packing";
  if (/\b(deliver|delivery|cos\b|check\b)\b/.test(normalized)) return "Delivery";
  if (/\b(call|email|text|contact|update|spanish|english|hearing|elderly|primary contact|prefers)\b/.test(normalized)) return "Communication";
  if (/\b(schedule|appointment|send customer|photos?)\b/.test(normalized)) return "Scheduling";
  if (/\b(pickup|pick up|room by room|cost-conscious|rush|ballpark|inventory|required|appliance|electronics|take)\b/.test(normalized)) return "Pickup";
  if (/\b(invoice|bill|estimate|fpp|simbility|xactimate|esx|mika|m i c a|portal|vendor)\b/.test(normalized)) return "Billing";
  if (/\b(payment|pay us|pays us|pay customer|deductible|electronically|direct payment|2-party|1-party|collections?)\b/.test(normalized)) return "Collections";
  return fallbackType;
};
const normalizeInstructionEntry = (entry, fallbackType = "Communication") => {
  if (!entry) return null;
  if (typeof entry === "string") {
    const text = entry.trim();
    if (!text) return null;
    return {
      id: "",
      type: inferInstructionType(text, fallbackType),
      text,
    };
  }
  const text = (entry.text || entry.label || entry.value || "").toString().trim();
  if (!text) return null;
  const rawType = (entry.type || "").toString().trim();
  const normalizedType = rawType && INSTRUCTION_TYPE_SET.has(rawType.toLowerCase())
    ? INSTRUCTION_TYPES.find((type) => type.toLowerCase() === rawType.toLowerCase()) || rawType
    : inferInstructionType(text, fallbackType);
  return {
    id: (entry.id || "").toString(),
    type: normalizedType,
    text,
  };
};
const normalizeInstructionEntries = (entries = [], fallbackType = "Communication") =>
  (Array.isArray(entries) ? entries : [entries])
    .map((entry) => normalizeInstructionEntry(entry, fallbackType))
    .filter(Boolean);
const hashInstructionSeed = (value = "") =>
  Array.from((value || "").toString()).reduce(
    (acc, char, index) => (acc + (char.charCodeAt(0) * (index + 1))) % 1000003,
    0
  );
const pickSeededInstructionEntries = (seedKey = "", pool = [], count = 1) => {
  const normalizedPool = normalizeInstructionEntries(pool);
  if (!normalizedPool.length || count <= 0) return [];
  const targetCount = Math.min(count, normalizedPool.length);
  const seed = hashInstructionSeed(seedKey);
  const start = seed % normalizedPool.length;
  const step = normalizedPool.length > 1 ? ((seed % (normalizedPool.length - 1)) + 1) : 1;
  const picks = [];
  const seen = new Set();
  let cursor = start;
  let attempts = 0;
  while (picks.length < targetCount && attempts < normalizedPool.length * 2) {
    const candidate = normalizedPool[cursor % normalizedPool.length];
    const key = getInstructionTypeTextKey(candidate.type, candidate.text);
    if (!seen.has(key)) {
      seen.add(key);
      picks.push({ ...candidate, id: "" });
    }
    cursor += step;
    attempts += 1;
  }
  return picks;
};
const dedupeInstructionEntries = (entries = []) => {
  const seen = new Set();
  return (entries || []).filter((entry) => {
    const key = [
      (entry.type || "").toLowerCase(),
      (entry.text || "").toLowerCase(),
      (entry.sourceKind || "").toLowerCase(),
      (entry.sourceName || "").toLowerCase(),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const mergeInstructionEntries = (...groups) =>
  dedupeInstructionEntries(
    groups.flatMap((group) => normalizeInstructionEntries(group || []))
  );
const getInstructionIdentity = (entry = {}) =>
  (entry.id || `${(entry.type || "").toString().trim().toLowerCase()}|${(entry.text || "").toString().trim().toLowerCase()}`).toString();
const DEFAULT_COMPANY_PROFILES = {
  [normalizeCompany("Allstate Insurance Co.")]: {
    nationalCarrier: "Allstate",
  },
  [normalizeCompany("Contractor Connection")]: {
    companyType: "TPA",
    companyInstructions: [
      { type: "Billing", text: "Tell Adjuster When to Run thru TPA" },
      { type: "Billing", text: "Must Run Thru TPA" },
      { type: "Billing", text: "Send Photos Separate from Invoice" },
    ],
    specialDocuments: ["Contractor Connection specialty form"],
    customerTextForms: ["Contractor Connection specialty form"],
  },
  [normalizeCompany("Not Yet Known")]: {
    companyInstructions: [{ type: "Communication", text: "Insurance carrier details will be added later." }],
    reportingPlaceholder: true,
  },
  [normalizeCompany("Not Provided")]: {
    companyInstructions: [{ type: "Communication", text: "Insurance carrier details are unavailable for this order." }],
    reportingPlaceholder: true,
  },
};
const DEFAULT_CONTACT_PROFILES = {};
const isInsuranceShortcutCompany = (companyName = "") =>
  INSURANCE_COMPANY_SHORTCUT_SET.has(normalizeCompany(companyName || ""));
const inferCompanyTypeFromName = (company = "") => {
  if (!company) return "Other";
  const c = company.toLowerCase();
  const isCarrier = NATIONAL_CARRIERS.some(n => normalizeCompany(n) === normalizeCompany(company));
  if (isCarrier) return "Insurance";
  if (c.includes("contractor connection") || c.includes("tpa")) return "TPA";
  if (c.includes("insurance")) return "Insurance";
  if (c.includes("adjusting") || c.includes("claims")) return "Public Adjusting";
  if (c.includes("moving")) return "Moving";
  if (c.includes("restoration") || c.includes("dki") || c.includes("servpro")) return "Restoration Company";
  return "Other";
};
const resolveLinkedNationalCarrierName = (companyName = "", sampleContacts = []) => {
  const normalized = normalizeCompany(companyName || "");
  if (!normalized || isInsuranceShortcutCompany(companyName)) return "";
  if (NATIONAL_CARRIER_LINKS[normalized]) return NATIONAL_CARRIER_LINKS[normalized];
  const directCarrier = NATIONAL_CARRIERS.find((carrier) => normalizeCompany(carrier) === normalized);
  if (directCarrier) return directCarrier;
  const profileCarrier = DEFAULT_COMPANY_PROFILES[normalized]?.nationalCarrier;
  if (profileCarrier) return profileCarrier;
  const sampleCarrier = sampleContacts.find((row) => normalizeCompany(row.company || "") === normalized)?.nationalCarrier;
  return sampleCarrier || "";
};
const resolveCompanyProfile = (companyName = "", sampleContacts = []) => {
  const normalized = normalizeCompany(companyName || "");
  if (!normalized) {
    return {
      companyName: "",
      companyType: "",
      nationalCarrier: "",
      companyInstructions: [],
      companyPreferences: [],
      specialDocuments: [],
      customerTextForms: [],
      reportingPlaceholder: false,
    };
  }
  const defaults = DEFAULT_COMPANY_PROFILES[normalized] || {};
  const matchingRows = (sampleContacts || []).filter(
    (row) => normalizeCompany(row.company || "") === normalized
  );
  const companyInstructions = mergeInstructionEntries(
    defaults.companyInstructions || defaults.companyPreferences || [],
    matchingRows.flatMap((row) => row.companyInstructions || row.companyPreferences || [])
  );
  return {
    companyName,
    companyType:
      defaults.companyType ||
      matchingRows.find((row) => row.companyType)?.companyType ||
      inferCompanyTypeFromName(companyName),
    nationalCarrier: resolveLinkedNationalCarrierName(companyName, sampleContacts),
    companyInstructions,
    companyPreferences: companyInstructions.map((entry) => entry.text),
    specialDocuments: mergeUniqueStrings(
      defaults.specialDocuments || [],
      matchingRows.flatMap((row) => row.specialDocuments || [])
    ),
    customerTextForms: mergeUniqueStrings(
      defaults.customerTextForms || [],
      matchingRows.flatMap((row) => row.customerTextForms || [])
    ),
    reportingPlaceholder: !!defaults.reportingPlaceholder,
  };
};
const resolveContactProfile = (contactName = "", sampleContacts = []) => {
  const normalized = normalizeContact(contactName || "");
  if (!normalized) {
    return {
      contactName: "",
      contactInstructions: [],
      contactPreferences: [],
      specialDocuments: [],
      customerTextForms: [],
    };
  }
  const defaults = DEFAULT_CONTACT_PROFILES[normalized] || {};
  const row = (sampleContacts || []).find(
    (item) => normalizeContact(item.name || "") === normalized
  );
  const contactInstructions = mergeInstructionEntries(
    defaults.contactInstructions || defaults.contactPreferences || [],
    row?.contactInstructions || row?.contactPreferences || []
  );
  return {
    contactName,
    contactInstructions,
    contactPreferences: contactInstructions.map((entry) => entry.text),
    specialDocuments: mergeUniqueStrings(
      defaults.specialDocuments || [],
      row?.specialDocuments || []
    ),
    customerTextForms: mergeUniqueStrings(
      defaults.customerTextForms || [],
      row?.customerTextForms || []
    ),
  };
};
const isInsuranceCarrierCompany = (companyName = "", sampleContacts = []) => {
  const normalized = normalizeCompany(companyName || "");
  if (!normalized) return false;
  if (isInsuranceShortcutCompany(companyName)) return true;
  if (resolveLinkedNationalCarrierName(companyName, sampleContacts)) return true;
  const profile = resolveCompanyProfile(companyName, sampleContacts);
  const type = normalizeCompany(profile.companyType || "");
  return type === "insurance" || type.includes("insurance");
};
const EntityPreferencePanel = ({
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
  const companySpecialDocuments = companyProfile?.specialDocuments || [];
  const contactSpecialDocuments = contactProfile?.specialDocuments || [];
  const specialDocuments = mergeUniqueStrings(
    companySpecialDocuments,
    contactSpecialDocuments
  );
  const customerTextForms = mergeUniqueStrings(
    companyProfile?.customerTextForms || [],
    contactProfile?.customerTextForms || [],
    specialDocuments
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
  const relevantKeys = [companyKey, contactKey].filter(Boolean);
  const panelIdentity = relevantKeys.join("|") || `${normalizeCompany(companyLabel)}|${normalizeContact(contactLabel)}`;
  const companyCollapsedByDefault = !!companyKey && sessionInstructionKeys?.has?.(companyKey);
  const contactCollapsedByDefault = !!contactKey && sessionInstructionKeys?.has?.(contactKey);
  const [collapsedState, setCollapsedState] = useState({
    company: companyCollapsedByDefault,
    contact: contactCollapsedByDefault,
  });

  useEffect(() => {
    setCollapsedState({
      company: companyCollapsedByDefault,
      contact: contactCollapsedByDefault,
    });
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
      if (prev[group] && !nextCollapsed && keys.length) {
        onMarkInstructionKeysSeen?.(keys);
      }
      return { ...prev, [group]: nextCollapsed };
    });
  };

  const renderInstructionGroup = ({ groupKey, title, entries, seenKey }) => {
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
              {entries.map((item) => (
                item.isPaperwork ? (
                  <div
                    key={`${groupKey}-${item.type}-${item.text}`}
                    className="flex items-start gap-2 text-xs text-slate-700"
                  >
                    <span className="text-amber-600 shrink-0">📄</span>
                    <span><span className="font-bold text-slate-800">Paperwork:</span> {item.text}</span>
                  </div>
                ) : (
                  <div key={`${groupKey}-${item.type}-${item.text}`} className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">{item.type}:</span> {item.text}
                  </div>
                )
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {renderInstructionGroup({
        groupKey: "company",
        title: companyLabel ? `${companyLabel} Instructions` : "Company Instructions",
        entries: companyEntries,
        seenKey: companyKey,
      })}
      {renderInstructionGroup({
        groupKey: "contact",
        title: contactLabel ? `${contactLabel} Instructions` : "Contact Instructions",
        entries: contactEntries,
        seenKey: contactKey,
      })}
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

// --- CONSTANTS FOR SELECTIONS ---
const LOSS_TYPES = ["Fire", "Water", "Mold", "Dust/Debris", "Puffback", "Oil", "Other"];
const LOSS_TYPE_COACHING = {
  "Fire": "Includes smoke, soot, protein fires. If water was used to extinguish, add Water as secondary.",
  "Water": "Verify coverage for groundwater, flood, and sump pump failure — these are often excluded or capped.",
  "Mold": "Usually has coverage limits. Mold from covered water damage is typically covered in full under water coverage.",
  "Dust/Debris": "From construction or remediation (flood cuts, charred material). Common secondary contaminant.",
  "Puffback": "Furnace/fireplace malfunction pushes soot or oily residue into the home. No flames.",
  "Oil": "Heating oil spill/mist. Requires dry cleaning only — washing won't work. May need to replace non-dry-cleanable items.",
  "Other": "Windstorms, fallen trees, etc. — perils that don't fit other categories.",
  "Non-Restoration": "Not an insurance claim — regular residential or commercial cleaning unrelated to a loss event.",
};
const ROLE_COACHING = {
  "Policyholder": "The person(s) named on the policy who is required to sign our authorization paperwork.",
  "Primary": "The primary contact handling our portion of the project. May or may not be the policyholder or owner — can be a PA, employee, or family member.",
  "Referral": "The first person that called us with the order. When assigned, we have the go-ahead to begin. Note: some referrers may only be giving us a lead.",
  "Expert Stain Removal": "A per-hour charge for removing complicated loss-related stains from items worth saving. Example: removing rust or dye stains from a rug or carpet.",
  "Find Address": "Use Google to insert a valid, verified address.",
};
const NON_RESTORATION_PRIMARY = "Non-Restoration";
const NON_RESTORATION_SUBTYPES = ["Commercial Cleaning", "Residential Cleaning", "Other"];
const getNonRestorationSubtype = (orderTypes = []) =>
  NON_RESTORATION_SUBTYPES.find((type) => (orderTypes || []).includes(type)) || "";
const isNonRestorationSelected = (orderTypes = []) =>
  (orderTypes || []).includes(NON_RESTORATION_PRIMARY) || !!getNonRestorationSubtype(orderTypes);
const hasRestorationOrderType = (orderTypes = []) =>
  (orderTypes || []).some((type) => LOSS_TYPES.includes(type));
const projectTypeFromOrderTypes = (orderTypes = []) => {
  if (isNonRestorationSelected(orderTypes)) return "Non-Restoration Project";
  if (hasRestorationOrderType(orderTypes)) return "Restoration Project";
  return "";
};
const hasPrimaryOrderTypeDecision = (orderTypes = []) =>
  isNonRestorationSelected(orderTypes) || hasRestorationOrderType(orderTypes);
const hasRequiredNonRestorationSubtype = (orderTypes = []) =>
  !isNonRestorationSelected(orderTypes) || !!getNonRestorationSubtype(orderTypes);
const normalizeOrderTypes = (orderTypes = []) => {
  const unique = Array.from(new Set((orderTypes || []).filter(Boolean)));
  const subtype = getNonRestorationSubtype(unique);
  const nonRestoration = unique.includes(NON_RESTORATION_PRIMARY) || !!subtype;
  const restoration = unique.filter((type) => LOSS_TYPES.includes(type));
  if (nonRestoration) return [NON_RESTORATION_PRIMARY, ...(subtype ? [subtype] : [])];
  if (restoration.length) return restoration;
  return unique;
};
const toggleNonRestorationPrimarySelection = (orderTypes = []) => {
  const normalized = normalizeOrderTypes(orderTypes);
  if (isNonRestorationSelected(normalized)) return [];
  return [NON_RESTORATION_PRIMARY];
};
const toggleRestorationTypeSelection = (orderTypes = [], type = "") => {
  if (!LOSS_TYPES.includes(type)) return normalizeOrderTypes(orderTypes);
  const normalized = normalizeOrderTypes(orderTypes);
  const activeRestoration = normalized.filter((item) => LOSS_TYPES.includes(item));
  if (activeRestoration.includes(type)) {
    return activeRestoration.filter((item) => item !== type);
  }
  return [...activeRestoration, type];
};
const selectNonRestorationSubtypeSelection = (orderTypes = [], subtype = "") => {
  if (!NON_RESTORATION_SUBTYPES.includes(subtype)) return normalizeOrderTypes(orderTypes);
  return [NON_RESTORATION_PRIMARY, subtype];
};

const CAUSES = {
  "Fire": ["Battery", "Candle", "Cooking", "Electrical", "Explosion", "Fireplace", "Flammables", "Heating", "Neighbor", "Protein", "Smoking", "Wildfire"],
  "Water": ["Roof Leak", "Window/Door Leak", "Frozen Pipes", "Pipe Burst", "Overflow", "Storm", "Sprinkler", "Firefighting", "Groundwater⚠", "Flood⚠", "Sump Pump Failure⚠"],
  "Mold": ["Spores Only", "Visible Mold", "Moldy Odor"],
  "Dust/Debris": ["Mitigation", "Construction", "Fiberglass"],
  "Puffback": ["Oily Film", "Oily Odor", "Oily Soot"],
  "Non-Restoration Cleaning": ["Inhome Cleaning", "Pickup", "Stain Removal", "Furniture Cleaning", "Drapery Take-down"],
  "Oil": ["Spill", "Furnace"]
};

const ORIGINS = ["Basement", "Bathroom", "Attic", "Family", "Garage", "Kitchen", "Laundry", "Living", "Master", "Outside", "Roof", "Walls", "All Over", "Ceiling"];

const PHONE_TYPES = ["Mobile", "Home", "Office"];
const ESTIMATE_TYPES = ["Ballpark", "Tag and Hold", "Itemized (costs)", "TLI", "Cash-out"];
const PRICING_PLATFORMS = ["Xactimate", "Cotality", "Textile Solutions"];
const TECHS = ["Mike S.", "Sarah J.", "Tom B.", "Unassigned"];
const LEAD_SOURCES = ["Referral", "Marketing", "Internal"];
const CONTACT_METHODS = ["Call", "Email", "Form Submission", "Meeting", "Text", "TPA Assignment"];
const REFERRAL_SOURCES = ["Referring Co", "Referrer"];
const MARKETING_SOURCES = ["Website", "Google Business Page", "AI Recommendation", "Social Media", "Other"];
const INTERNAL_TYPES = ["Met on Site", "Previous Customer", "Friend of Company", "Neighbor", "Building Staff"];
const CUSTOMER_QUICK_NOTES = ["Elderly", "Hearing Impaired", "Spanish Only", "Do not call", "Email only", "Sales rep only"];
const NATIONAL_CARRIERS = ["Allstate", "State Farm", "Nationwide", "Farmers", "USAA", "Liberty Mutual", "Progressive", "Travelers", "Chubb", "American Family", "Pure Insurance"];

const inferRoleCapabilities = (companyType = "", companyName = "") => {
  const type = (companyType || "").toString().trim().toLowerCase();
  const normalizedCompany = normalizeCompany(companyName || "");
  const insuranceLikeType =
    type.includes("insurance") ||
    type.includes("adjust") ||
    type.includes("tpa") ||
    type.includes("broker") ||
    type.includes("agent");
  const insuranceLikeName = NATIONAL_CARRIERS.some(c => normalizeCompany(c) === normalizedCompany);
  const canInsure = insuranceLikeType || insuranceLikeName;
  return {
    canRefer: true,
    canBill: canInsure,
    canInsure
  };
};

const SAMPLE_CONTACTS = [
  {
    name: "Alex Morgan",
    company: "Allstate",
    companyType: "Insurance",
    salesRep: "Josh Cintron, Sales Rep",
    title: "Adjuster",
    isAdjuster: true,
    canRefer: true,
    canBill: true,
    canInsure: true,
    companyInstructions: pickSeededInstructionEntries("company:Allstate", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Alex Morgan", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Jamie Lee",
    company: "State Farm",
    companyType: "Insurance",
    salesRep: "Josh Cintron, Sales Rep",
    title: "Adjuster",
    isAdjuster: true,
    canRefer: true,
    canBill: true,
    canInsure: true,
    companyInstructions: pickSeededInstructionEntries("company:State Farm", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Jamie Lee", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Pat Adjuster",
    company: "Metro Claims",
    companyType: "Public Adjusting",
    salesRep: "Dave Fenyo, Sales Rep",
    title: "Adjuster",
    isAdjuster: true,
    canRefer: true,
    canBill: true,
    canInsure: true,
    companyInstructions: pickSeededInstructionEntries("company:Metro Claims", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Pat Adjuster", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Ronzel Simmons",
    company: "Pure Insurance",
    companyType: "Insurance",
    salesRep: "Dave Fenyo, Sales Rep",
    title: "Adjuster",
    isAdjuster: true,
    canRefer: true,
    canBill: true,
    canInsure: true,
    companyInstructions: pickSeededInstructionEntries("company:Pure Insurance", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Ronzel Simmons", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Zack Barsack",
    company: "DKI DryFast",
    companyType: "Restoration Company",
    salesRep: "",
    title: "Owner",
    isAdjuster: false,
    canRefer: true,
    canBill: false,
    canInsure: false,
    companyInstructions: pickSeededInstructionEntries("company:DKI DryFast", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Zack Barsack", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Sim Fern",
    company: "United Claims",
    companyType: "Public Adjusting",
    salesRep: "",
    title: "Adjuster",
    isAdjuster: true,
    canRefer: true,
    canBill: true,
    canInsure: true,
    companyInstructions: pickSeededInstructionEntries("company:United Claims", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Sim Fern", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Steven Earthman",
    company: "Croziers Moving",
    companyType: "Moving",
    salesRep: "",
    title: "Project Manager",
    isAdjuster: false,
    canRefer: true,
    canBill: false,
    canInsure: false,
    companyInstructions: pickSeededInstructionEntries("company:Croziers Moving", ACTUAL_COMPANY_INSTRUCTION_LIBRARY, 1),
    contactInstructions: pickSeededInstructionEntries("contact:Steven Earthman", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
  },
  {
    name: "Casey Assignment",
    company: "Contractor Connection",
    companyType: "TPA",
    salesRep: "",
    title: "Assignment Coordinator",
    isAdjuster: false,
    canRefer: true,
    canBill: true,
    canInsure: true,
    contactInstructions: pickSeededInstructionEntries("contact:Casey Assignment", ACTUAL_CONTACT_INSTRUCTION_LIBRARY, 1),
    specialDocuments: ["Contractor Connection specialty form"],
    customerTextForms: ["Contractor Connection specialty form"],
  }
];

const SAMPLE_PRESET_DATA = () => ({
  ...DEFAULT_FORM,
  orderName: "Sample Water Loss - Smith",
  orderNameAuto: false,
  recordType: "Order",
  leadSourceCategory: "Referral",
  referringCompany: "Pure Insurance",
  referrer: "Ronzel Simmons",
  billingCompany: "Pure Insurance",
  billingContact: "Ronzel Simmons",
  insuranceClaim: "Yes",
  insuranceCompany: "Pure Insurance",
  insuranceAdjuster: "Ronzel Simmons",
  orderInstructions: [
    { id: "sample-order-instruction", type: "Communication", text: "Customer asked for evening updates when possible." }
  ],
  claimNumber: "CLM-1001",
  dateOfLoss: "2026-02-14",
  serviceOfferings: ["Textiles", "Art"],
  suggestedGroups: ["RD", "TLI"],
  eventInstructions: "Bring: Heater\nConditions: Still Wet\nQuick Notes: Everything Affected",
  customers: [
    initCustomer({ isPrimary: true, firstName: "Mary", lastName: "Smith", type: "Primary", phone: "(555) 555-0101" })
  ],
  addresses: [
    initAddress({
      isPrimary: true,
      street: "123 Main St",
      city: "Houston",
      state: "TX",
      zip: "77002",
      type: "Primary"
    })
  ],
  sdsInitialInstructions: [
    { id: "inst-1", person: "Ronzel Simmons", role: "Adjuster", instruction: "Please secure all contents before pickup." }
  ],
  sdsInstructionAgreement: "agree",
  sdsDisagreementNote: "",
});

const LEAD_SOURCE_HELP = {
  Referral: "Recommendation from existing contact.",
  Marketing: "Digital/print campaigns to attract business.",
  Internal: "Company-initiated efforts."
};

const COMPANY_LOGO_TEXT = {
  "Allstate": "A",
  "State Farm": "SF",
  "Chubb": "C",
  "Pure Insurance": "P"
};

const CONTACT_METHOD_HELP = {
  Call: "How opportunity was discovered.",
  Email: "How opportunity was discovered.",
  "Form Submission": "Online form/website submission.",
  Meeting: "How opportunity was discovered.",
  Text: "How opportunity was discovered.",
  "TPA Assignment": "Assignment from Third Party Administrator."
};

const COMPANY_TYPES = [
  "Insurance",
  "Public Adjusting",
  "Independent Adjusting",
  "TPA",
  "Invoice Auditor",
  "Contents Company",
  "Restoration Company",
  "Building Consultant",
  "Engineer",
  "Hygienist",
  "Art",
  "Moving",
  "Boardup",
];

const SDS_CONSIDERATIONS = ["Elderly", "Pregnancy", "Baby", "Respiratory Concerns", "Premium Brands", "Skin Sensitivity"];
const SDS_OBSERVATIONS = ["Pets", "Fireplace", "Insects", "Moth Damage", "Sun Damage", "Smoking", "Clutter"];
const SDS_SERVICES = [
  "Fold as Much as Possible",
  "Re-Hanging",
  "Photo Inventory",
  "Unpacking",
  "Needs Assistance",
  "Anti-Microbial",
  "Drying",
  "Disposal",
  "Fiber Protection",
  "Moving",
  "Rolling Racks",
  "Total Loss Inventory",
  "Content Manipulation",
  "High Density",
  "Expert Stain Removal",
];
const SDS_ICON_MAP = {
  "Elderly": "/Gemini_Elderly.png",
  "Pregnancy": "/Gemini_Pregnancy.png",
  "Baby": "/Gemini_Baby.png",
  "Needs Assistance": "/Gemini_Needs_Assistance.png",
  "Respiratory Concerns": "/Gemini_Health_Concerns.png",
  "Premium Brands": "/Gemini_Premium_Brands.png",
  "Skin Sensitivity": "/Gemini_Skin_Sensitivity.png",
  "Pets": "/Gemini_Pets.png",
  "Fireplace": "/Gemini_Fireplace.png",
  "Insects": "/Insects_Clean.png",
  "Moth Damage": "/Gemini_Moth_Holes.png",
  "Sun Damage": "/Gemini_Generated_Image_7b5s067b5s067b5s.png",
  "Smoking": "/Gemini_Smoking.png",
  "Clutter": "/Clutter.png",
  "Fold as Much as Possible": "/Gemini_Fold_AMAP.png",
  "Re-Hanging": "/Re_Hanging_Clean.png",
  "Photo Inventory": "/Photo_Inventory.png",
  "Unpacking": "/Gemini_Unpacking.png",
  "Anti-Microbial": "/Gemini_Anti_Microbial.png",
  "Drying Needed": "/Drying.jpg",
  "Drying": "/Drying.jpg",
  "Disposal": "/Gemini_Generated_Image_tydpketydpketydp.png",
  "Fiber Protection": "/Gemini_Fiber_Protection.png",
  "Moving": "/Moving.png",
  "Rolling Racks": "/Rolling_Racks.png",
  "Total Loss Inventory": "/Total_Loss_Inventory.png",
  "Content Manipulation": "/Content_Manipulation.jpg",
  "High Density": "/High_Density_Parking.png",
  "Expert Stain Removal": "/Expert_Stain_Removal.png",
};
const SDS_ICON_CLASS_OVERRIDES = {
  "Clutter": "h-full w-full object-contain object-center scale-[0.82]",
  "Insects": "h-full w-full object-contain object-center scale-[0.9]",
  "Re-Hanging": "h-full w-full object-contain object-center scale-[0.95]",
  "Moving": "h-full w-full object-contain object-center scale-[0.9]",
  "Rolling Racks": "h-full w-full object-contain object-center scale-[0.9]",
  "Expert Stain Removal": "h-full w-full object-contain object-center scale-[0.88]",
};
const getSdsIconImageClass = (item) => SDS_ICON_CLASS_OVERRIDES[item] || "h-full w-full object-contain object-center";

const QUICK_INSTRUCTION_NOTES = [
  "Gate code needed",
  "Call upon arrival",
  "Parking in rear",
  "Beware of pets",
  "Owner on-site",
];

const LOAD_ITEMS = [
  "Heater",
  "Ladder",
  "Lights",
  "Tyvek",
  "Plastic Bags",
  "Toolbox",
  "Floor Protection",
  "Dolly",
  "Hand Truck",
  "Blankets",
  "Bubble Wrap",
  "TV Boxes",
];

const PACKOUT_LOAD_MAP = {
  "Remove Hardware": ["Toolbox", "Ladder", "Floor Protection"],
  "Remove Furniture": ["Dolly", "Hand Truck"],
  "Remove Electronics": ["Blankets", "Bubble Wrap", "TV Boxes"],
};

const summarizeAddress = (addr = {}) => {
  const parts = [addr.street, addr.city, addr.state, addr.zip].filter(Boolean);
  return parts.length ? parts.join(", ") : "No address yet";
};

const TIME_SLOTS = [];
for(let i=6; i<=20; i++) {
    const hour = i > 12 ? i - 12 : (i === 0 ? 12 : i);
    const ampm = i >= 12 ? 'PM' : 'AM';
    TIME_SLOTS.push(`${hour}:00 ${ampm}`);
    if (i < 20) TIME_SLOTS.push(`${hour}:30 ${ampm}`);
}

const QUALITY_CODES = ["Q1", "Q2", "Q3", "Q5"];
const SEVERITY_GROUPS = ["Fire", "Water", "Mold", "Dust", "Protein", "Oil"];
const SEVERITY_LEVELS = ["1", "2", "3", "5"];

const COMPANY_ROLE_DEFS = [
  { id: "insurance", label: "Insurance", isCore: true, type: "Insurance", source: "insuranceCompany", contactSource: "insuranceAdjuster" },
  { id: "restoration", label: "Restoration", isCore: true, type: "Restoration Company" },
  { id: "rebuild_contractor", label: "Rebuild Contractor", isCore: true, type: "Contractor" },
  { id: "public_adjuster", label: "Public Adjuster", isCore: true, type: "Public Adjusting", source: "publicAdjustingCompany", contactSource: "publicAdjuster" },
  { id: "independent_adjuster", label: "Independent Adjuster", isCore: true, type: "Independent Adjusting", source: "independentAdjustingCo", contactSource: "independentAdjuster" },
  { id: "tpa", label: "TPA", isCore: true, type: "TPA", source: "tpaCompany", contactSource: "tpaContact" },
  { id: "invoice_audit", label: "Invoice Audit", isCore: true, type: "Invoice Auditor" },
  { id: "insurance_broker", label: "Insurance Broker", isCore: true, type: "Broker" },
  { id: "insurance_agent", label: "Insurance Agent", isCore: true, type: "Agent" },
  { id: "other", label: "Other", isCore: true, type: "Other" },
  { id: "contents", label: "Contents", isCore: false, type: "Contents" },
  { id: "inventory", label: "Inventory", isCore: false, type: "Contents Company" },
  { id: "art", label: "Art", isCore: false, type: "Art" },
  { id: "electronics", label: "Electronics", isCore: false, type: "Other" },
  { id: "moving", label: "Moving", isCore: false, type: "Moving" },
  { id: "hygienist", label: "Hygienist", isCore: false, type: "Hygienist" },
  { id: "building_consultant", label: "Building Consultant", isCore: false, type: "Building Consultant" },
  { id: "floor", label: "Floor", isCore: false, type: "Contractor" },
  { id: "painter", label: "Painter", isCore: false, type: "Contractor" },
  { id: "board_up", label: "Board-up", isCore: false, type: "Boardup" },
  { id: "decorator", label: "Decorator", isCore: false, type: "Decorator" },
  { id: "engineer", label: "Engineer", isCore: false, type: "Engineer" },
];

const CONTACT_ROLE_BADGES = [
  { id: "referrer", title: "Referrer" },
  { id: "insurance", title: "Insurance" },
  { id: "billto", title: "Bill To" },
];
const ROLE_ICON_COMPONENTS = {
  referrer: Tag,
  insurance: Shield,
  billto: CreditCard,
  billing: CreditCard,
  adjuster: UserRound,
  national: Globe,
};
const resolveRoleIconKey = (role = {}) => {
  if (role.iconKey && ROLE_ICON_COMPONENTS[role.iconKey]) return role.iconKey;
  const id = (role.id || "").toLowerCase();
  if (ROLE_ICON_COMPONENTS[id]) return id;
  const icon = (role.icon || "").trim();
  if (icon === "🏷️") return "referrer";
  if (icon === "🛡️") return "insurance";
  if (icon === "💳") return "billto";
  if (icon === "🧑‍💼") return "adjuster";
  if (icon === "🌐") return "national";
  const title = (role.title || role.label || "").toLowerCase();
  if (title.includes("referrer")) return "referrer";
  if (title.includes("insurance")) return "insurance";
  if (title.includes("bill")) return "billto";
  if (title.includes("adjuster")) return "adjuster";
  if (title.includes("national")) return "national";
  return "";
};
const RoleIcon = ({ role, className = "h-3.5 w-3.5", strokeWidth = 2.1 }) => {
  const iconKey = resolveRoleIconKey(role);
  const Icon = ROLE_ICON_COMPONENTS[iconKey];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};

const INSURANCE_ELIGIBLE_COMPANY_TYPES = new Set([
  "insurance",
  "independent adjusting",
  "public adjusting",
  "tpa",
  "broker",
  "agent",
]);

const HANDLING_META=[
  ["Box","return items in boxes"], ["Damp","tag within 5 days"], ["DC","try to Dry Clean all items"],
  ["DNR","do not reject"], ["Det","special detergent requested"], ["FMP","fold as much as possible"],
  ["Hand","hand finish pressed items"], ["Hang","use customers hangers"], ["Low","dry on low heat"],
  ["NoDC","Do not Dry Clean"], ["NoDry","cannot be dried in dryer"], ["PPC","Potential Problem Claim"],
  ["PPE","wear PPE when handling"], ["STAR","premium items, special hangers"], ["VIC","Very Important Claim"],
  ["Wet","still wet, tag/treat asap"],
];

function initAddress(overrides={}){
  return { id:safeUid(), type:"", isPrimary:true, isLossSite:true,
    name:"", googleQuery:"", street:"", apt:"", city:"", state:"", zip:"", lng:"", lat:"",
    beds:"", baths:"", sqft:"", people:"", infants:"", otherUnitsAffected:"", otherUnitsNote:"",
    coiRequired:"", coiRequestedAt:"", coiRequestedBy:"", coiProvidedAt:"", coiProvidedBy:"", coiContactNote:"",
    placeholder: null,
    ...overrides };
}

const isAddressPlaceholder = (addr = {}) => {
  if (isPlaceholderFlagActive(addr?.placeholder)) return true;
  const street = (addr?.street || "").trim();
  const type = (addr?.type || "").trim().toLowerCase();
  if (!street) return true;
  return street.toUpperCase() === "TBD" || type.includes("placeholder");
};

const entryContactList = (entry = {}) => {
  const fromContacts = Array.isArray(entry?.contacts) ? entry.contacts : [];
  if (fromContacts.length) return fromContacts;
  if (hasMeaningfulValue(entry?.contact)) return [{ name: entry.contact, inactive: false, placeholder: entry?.contactPlaceholder || null }];
  return [];
};

const isCompanyPlaceholder = (entry = {}) => {
  if (isPlaceholderFlagActive(entry?.placeholder)) return true;
  return !hasMeaningfulValue(entry?.company);
};

const isContactPlaceholder = (entry = {}) => {
  if (isPlaceholderFlagActive(entry?.contactPlaceholder)) return true;
  const contacts = entryContactList(entry);
  if (!contacts.length) return true;
  return contacts.some(c => isPlaceholderFlagActive(c?.placeholder) || !hasMeaningfulValue(c?.name));
};
const CONTACT_OPTIONAL_COMPANY_TYPES = new Set(["tpa"]);
const companyTypeRequiresContact = (type = "") =>
  !CONTACT_OPTIONAL_COMPANY_TYPES.has(normalizePlaceholderKeyPart(type));

const syncCompanyEntryPlaceholders = (entry = {}) => {
  const normalized = { ...(entry || {}) };
  const hasCompany = hasMeaningfulValue(normalized.company);
  const contacts = entryContactList(normalized).map(contact => ({
    ...(contact || {}),
    name: (contact?.name || "").trim(),
    inactive: !!contact?.inactive,
    placeholder: isPlaceholderFlagActive(contact?.placeholder) ? contact.placeholder : null
  }));
  const hasNamedContact = contacts.some(c => hasMeaningfulValue(c.name));
  if (hasCompany) {
    normalized.placeholder = null;
  } else if (!isPlaceholderFlagActive(normalized.placeholder)) {
    normalized.placeholder = createPlaceholderFlag("company", "Company needed");
  }
  if (hasNamedContact) {
    normalized.contactPlaceholder = null;
  } else if (!isPlaceholderFlagActive(normalized.contactPlaceholder)) {
    normalized.contactPlaceholder = createPlaceholderFlag("contact", "Contact needed");
  }
  normalized.company = hasCompany ? normalized.company : "";
  normalized.contacts = contacts;
  if (!hasNamedContact) {
    normalized.contact = "";
  } else if (!hasMeaningfulValue(normalized.contact)) {
    normalized.contact = contacts.find(c => hasMeaningfulValue(c.name))?.name || "";
  }
  return normalized;
};

function initCustomer(overrides={}){ 
  return { 
    id:safeUid(), type:"", selfPay:false, policyHolder:false, 
    last:"", first:"", 
    phone:"", phoneType:"Mobile", phoneExt:"", 
    phone2:"", phone2Type:"Mobile", phone2Ext:"", 
    email:"", email2:"", 
    doNotContact: false,
    preferredContact: "", 
    note:"", isPrimary:false,
    showExtraContact: false,
    sendWelcomeText: false, welcomeCampaigns: [],
    sendBrochure: false,
    sendRushGuide: false,
    sendAuthLink: false,
    sendCosLink: false,
    sendGoogleReviewLink: false,
    quickNotes: [],
    showQuickNotes: false,
    showWelcomePanel: false,
    householdCount: "",
    householdAnimals: "",
    householdMembers: [],
    placeholder: null,
    ...overrides 
  }; 
}

function initLossSeverity(overrides = {}) {
  return {
    touched: false,
    fire: {
      enabled: false,
      values: {
        "Heat": 0,
        "Soot": 0,
        "Odor": 0,
        "Extinguisher Powder": 0,
        "Remediation Debris": 0
      }
    },
    water: {
      enabled: false,
      values: {
        "Water": 0,
        "Humidity": 0,
        "Musty Smell": 0,
        "Visible Mildew": 0,
        "Visible Mold": 0,
        "Sprinkler Chemical": 0,
        "Flood Cut Debris": 0
      }
    },
    puffback: {
      enabled: false,
      values: {
        "Oil": 0,
        "Soot": 0,
        "Odor": 0,
        "Oily Film": 0
      }
    },
    ...overrides
  };
}

const stringListMatches = (a = [], b = []) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const right = new Set(b.map((item) => `${item}`));
  return a.every((item) => right.has(`${item}`));
};

// --- FIELD CONFIGURATION ---
const FIELD_CONFIG_SECTIONS = [
  { id: "order", label: "Order" },
  { id: "source", label: "Source" },
  { id: "interview", label: "Interview" },
  { id: "customer", label: "Customer" },
  { id: "address", label: "Address" },
  { id: "billing", label: "Billing & Insurance" },
  { id: "schedule", label: "Schedule" },
  { id: "codes", label: "Codes & Processing" },
];

const DEFAULT_FIELD_CONFIG = {
  // --- Order ---
  orderName:              { label: "Order Name",           section: "sec1", category: "order",     requiredInAudit: true, requiredAtStatus: "always", visible: true, coaching: "Auto-generated from LastName-TownST. Lock to prevent changes." },
  orderTypes:             { label: "Order Type",           section: "sec1", category: "order",     requiredInAudit: true, requiredAtStatus: "always", visible: true, checkFn: "hasPrimaryOrderTypeDecision", coaching: "Pick the primary peril — what happened first." },
  nonRestorationSubtype:  { label: "Non-Restoration Type", section: "sec1", category: "order",     requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "primaryLossType", equals: "Non-Restoration" }, checkFn: "hasRequiredNonRestorationSubtype" },
  leadSourceCategory:     { label: "Lead Source",          section: "sec1", category: "source",    requiredInAudit: true, requiredAtStatus: "always", visible: true },
  referringCompany:       { label: "Referring Company",    section: "sec1", category: "source",    requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "leadSourceCategory", equals: "Referral" } },
  referrer:               { label: "Referrer",             section: "sec1", category: "source",    requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "leadSourceCategory", equals: "Referral" } },
  leadSourceDetail:       { label: "Lead Source Detail",   section: "sec1", category: "source",    requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "leadSourceCategory", oneOf: ["Marketing", "Internal"] } },
  moldCoverageConfirm:    { label: "Mold Coverage",        section: "sec1", category: "order",     requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "orderTypes", includes: "Mold" } },

  // --- Customer ---
  custFirst:  { label: "Customer First Name", section: "sec2", category: "customer", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "customers[0].first" },
  custLast:   { label: "Customer Last Name",  section: "sec2", category: "customer", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "customers[0].last" },
  custPhone:  { label: "Customer Phone",      section: "sec2", category: "customer", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "customers[0].phone" },
  custEmail:  { label: "Customer Email",      section: "sec2", category: "customer", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "customers[0].email" },

  // --- Address ---
  addrStreet: { label: "Street Address", section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].street" },
  addrCity:   { label: "City",           section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].city" },
  addrState:  { label: "State",          section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].state" },
  addrZip:    { label: "Zip",            section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].zip" },
  addrLat:    { label: "Latitude",       section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].lat" },
  addrLng:    { label: "Longitude",      section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, dataPath: "addresses[0].lng" },
  rentCoverageLimit: { label: "Rent Coverage", section: "sec3", category: "address", requiredInAudit: true, requiredAtStatus: "always", visible: true, condition: { field: "rentOrOwn", equals: "Rent" } },

  // --- Billing & Insurance ---
  billingPayer:      { label: "Bill To (Payer)",   section: "sec4", category: "billing",  requiredInAudit: true, requiredAtStatus: "always", visible: true },
  pricePlatform:     { label: "Pricing Platform",  section: "sec4", category: "billing",  requiredInAudit: true, requiredAtStatus: "Intake Complete", visible: true },
  priceList:         { label: "Price List",         section: "sec4", category: "billing",  requiredInAudit: true, requiredAtStatus: "Intake Complete", visible: true },
  multiplier:        { label: "Price Multiplier",   section: "sec4", category: "billing",  requiredInAudit: true, requiredAtStatus: "Intake Complete", visible: true },
  estimateRequested: { label: "Estimate Requested", section: "sec4", category: "billing",  requiredInAudit: true, requiredAtStatus: "Intake Complete", visible: true },

  // --- Interview Questions ---
  damageWasWet:              { label: "Still Wet?",                section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi", coaching: "Urgent — untreated wet items develop mold." },
  damageMoldMildew:          { label: "Visible Mold?",            section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi", coaching: "Ask about respiratory issues. Our team needs PPE." },
  structuralElectricDamage:  { label: "Structural Damage?",       section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi" },
  noLights:                  { label: "No Electricity?",          section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi", coaching: "Bring portable lighting." },
  noHeat:                    { label: "No Heat?",                 section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi" },
  boardedUp:                 { label: "Boarded Up?",              section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi", coaching: "Confirm access — who has the key or code?" },
  repairsSummary:            { label: "Repairs",                  section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi" },
  livingStatus:              { label: "Living Situation",         section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "single" },
  processType:               { label: "Delivery Destination",     section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "single" },
  packoutSummary:            { label: "What Are We Picking Up?",  section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "Pickup Complete", visible: true, selectType: "multi" },
  loadList:                  { label: "What To Bring",            section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },
  sdsConsiderations:         { label: "Special Considerations",   section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },
  familyMedicalIssues:       { label: "Medical Issues?",          section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },
  soapFragAllergies:         { label: "Soap/Fragrance Allergies?",section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },
  selfCleaning:              { label: "Self-Cleaning?",           section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },
  useDryCleaner:             { label: "Use Dry Cleaner?",         section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "single" },
  howDryLaundry:             { label: "How Dry Laundry?",         section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "single" },
  storageNeeded:             { label: "Storage Needed?",          section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "single" },
  suggestedGroups:           { label: "Suggested Groups",         section: "sec1", category: "interview", requiredInAudit: false, requiredAtStatus: "never",           visible: true, selectType: "multi" },

  // --- Codes (post-inspection) ---
  interview:     { label: "Interview Section",  section: "sec1", category: "codes", requiredInAudit: true, requiredAtStatus: "Pickup Complete", visible: true, checkFn: "interviewCompleted" },
  codes:         { label: "Codes Section",       section: "sec1", category: "codes", requiredInAudit: true, requiredAtStatus: "Pickup Complete", visible: true, checkFn: "codesCompleted" },
};

const DEFAULT_BLOCKER_RULES = [
  { id: "auth",         enabled: true, trigger: "No authorization on file",              blockerText: "Won't Sign Authorization" },
  { id: "custEstimate", enabled: true, trigger: "Customer requests estimate before work", blockerText: "Customer Wants Estimate" },
  { id: "adjEstimate",  enabled: true, trigger: "Adjuster requests estimate before work", blockerText: "Adjuster Wants Estimate" },
  { id: "specialDocs",  enabled: true, trigger: "Special paperwork required by carrier",  blockerText: "Special paperwork required" },
  { id: "unknownIns",   enabled: true, trigger: "Insurance company set to Not Yet Known", blockerText: "Insurance Company Not Yet Known" },
];

// --- INTERVIEW ANSWER ACTIONS ---
const DEFAULT_INTERVIEW_ACTIONS = {
  // Q1: Conditions
  "Still Wet":          { coaching: "We will need to get out right away, separate the wet items by color and process them immediately using an anti-microbial to prevent mold growth.", actions: [{ type: "loadList", value: "Plastic Bags" }, { type: "handlingCode", value: "Wet" }] },
  "Visible Mold":       { coaching: "Please don't disturb the mold and consider wearing safety gear. If your Insurance is considering this a 'Mold Claim' it may count against your mold limit.", actions: [{ type: "loadList", value: "Tyvek" }, { type: "handlingCode", value: "PPE" }, { type: "suggestOrderType", value: "Mold" }, { type: "openMoldLimit" }] },
  "Structural Damage":  { coaching: "Please stay out of any unstable areas. Has there been a safety assessment?", actions: [{ type: "loadList", value: "Hard Hats" }, { type: "sdsObservation", value: "Structural Damage" }, { type: "blocker", value: "Safety Assessment needed" }, { type: "suggestGroup", value: "LTD" }] },
  "No Electricity":     { coaching: "No problem, our crew will bring portable lights. Will you be able to pull your Rush items?", actions: [{ type: "loadList", value: "Lights" }] },
  "No Heat":            { coaching: "", actions: [{ type: "loadList", value: "Heater" }] },
  "Boarded Up":         { coaching: "Please confirm safe entry and available access.", actions: [{ type: "loadList", value: "Lights" }] },

  // Q2: Repairs
  "Just Cleaning":              { coaching: "Since it's just a cleaning, we should plan the essentials for a quick turnaround.", actions: [{ type: "eventInstruction", value: "Standard pack-out/pack-back" }, { type: "suggestGroup", value: "RFD" }] },
  "Paint":                      { coaching: "We usually require waiting 48 hours after painting is finished before delivering to avoid odors or items sticking to the walls.", actions: [{ type: "eventInstruction", value: "Hold delivery until paint cures" }, { type: "suggestGroup", value: "STD" }] },
  "Refinish Floors":            { coaching: "We will strictly follow your contractor's advice on floor curing times before we bring heavy furniture back in.", actions: [{ type: "loadList", value: "Floor Protection" }, { type: "suggestGroup", value: "STD" }] },
  "Replace Floors":             { coaching: "We'll make sure to bring extra floor protection during delivery to keep your brand new floors pristine.", actions: [{ type: "eventInstruction", value: "Floor replacement" }, { type: "loadList", value: "Floor Protection" }, { type: "suggestGroup", value: "LTD" }] },
  "Cosmetic Damage":            { coaching: "Once the minor repairs are wrapped up, just give us a call and we'll arrange your delivery.", actions: [{ type: "eventInstruction", value: "Minor repairs" }, { type: "suggestGroup", value: "LTD" }] },
  "Major Structural Damage":    { coaching: "We can prep your belongings for safe, long-term storage in our facility.", actions: [{ type: "suggestGroup", value: "LTD" }, { type: "blocker", value: "Timeline TBD" }] },
  "Complete Rebuild":           { coaching: "We can prep your belongings for safe, long-term storage in our facility.", actions: [{ type: "suggestGroup", value: "LTFD" }] },

  // Q3: Living Status
  "Staying in home":    { coaching: "We'll try to work as quietly as possible and expedite your household essentials like bedding, shower curtains and throw rugs. We also have temporary shades if you need privacy on the windows.", actions: [{ type: "eventInstruction", value: "Customer on-site" }] },
  "Hotel":              { coaching: "We can deliver your rush items straight to the hotel.", actions: [{ type: "addressPlaceholder", value: "Hotel" }] },
  "Temp":               { coaching: "We can deliver future seasonal items to this address.", actions: [{ type: "addressPlaceholder", value: "Temp" }] },
  "Moving":             { coaching: "We'll update your file so your final delivery goes smoothly to your new permanent address. Will you be moving locally or will we need to coordinate a national move?", actions: [{ type: "addressPlaceholder", value: "Moving" }, { type: "blocker", value: "Final Delivery Date needed" }] },

  // Q4: Delivery
  "Deliver ASAP":           { coaching: "We will prioritize your most important items to get your house feeling like home again as fast as possible.", actions: [{ type: "eventInstruction", value: "Rush processing for essentials" }] },
  "Deliver to Temp":        { coaching: "We'll coordinate with you to deliver exactly what you need to your temporary residence.", actions: [{ type: "eventInstruction", value: "Deliver to temporary address" }] },
  "Deliver to New Home":    { coaching: "We will hold onto everything safely and deliver it straight to your new place when you are ready to move in.", actions: [{ type: "eventInstruction", value: "Deliver to new address" }] },
  "Long-Term Storage":      { coaching: "We can provide safe, secure, long term storage until your home is ready.", actions: [{ type: "eventInstruction", value: "Hold for home completion" }] },

  // Q5: Packout
  "Rugs":               { coaching: "Ask about size, weight and heavy furniture that may need to be moved. We may need extra manpower.", actions: [] },
  "Window Treatments":  { coaching: "Our team will carefully take down your drapes and blinds for specialized cleaning. Will we need any special ladders or equipment?", actions: [] },
  "Clothing":           { coaching: "We'll kindly ask that you prioritize your rush items.", actions: [] },
  "Bedding":            { coaching: "", actions: [] },
  "Furniture":          { coaching: "We'll bring plenty of moving blankets and padding to protect the corners and surfaces of your furniture.", actions: [{ type: "loadList", value: "Blankets" }, { type: "loadList", value: "Dollies" }, { type: "loadList", value: "Extra Manpower" }] },
  "Art":                { coaching: "We'll use specialized picture boxes and packing paper to keep your artwork completely safe.", actions: [{ type: "loadList", value: "Art Boxes" }] },
  "Electronics":        { coaching: "Consider any rush electronics we may need.", actions: [{ type: "loadList", value: "TV Boxes" }, { type: "loadList", value: "Blankets" }] },
  "Hardware":           { coaching: "", actions: [] },
  "Appliances":         { coaching: "We will send heavy-duty dollies and extra hands to safely move your large appliances.", actions: [{ type: "loadList", value: "Dollies" }, { type: "loadList", value: "Extra Manpower" }] },

  // Q7: Considerations
  "Elderly":                { coaching: "", actions: [{ type: "sdsObservation", value: "Elderly resident" }, { type: "contactNote", value: "Elderly" }] },
  "Pregnancy":              { coaching: "We will use baby-safe, hypoallergenic cleaning methods.", actions: [{ type: "handlingCode", value: "Det" }, { type: "contactNote", value: "Pregnancy" }] },
  "Baby":                   { coaching: "We will use baby-safe, hypoallergenic cleaning methods and can rush essential baby items like cribs, strollers, and clothing.", actions: [{ type: "handlingCode", value: "Det" }, { type: "contactNote", value: "Baby in household" }] },
  "Hearing Impaired":       { coaching: "", actions: [{ type: "contactNote", value: "Hearing Impaired" }] },
  "Spanish Only":           { coaching: "", actions: [{ type: "eventInstruction", value: "Spanish speaking crew required" }, { type: "contactNote", value: "Spanish Only" }] },
  "Respiratory Concerns":   { coaching: "We will strictly use mild, fragrance-free cleaning agents to protect your respiratory health.", actions: [{ type: "handlingCode", value: "Det" }, { type: "contactNote", value: "Respiratory Concerns" }] },
  "Premium Brands":         { coaching: "We will route your high-end designer pieces for delicate hand-cleaning.", actions: [{ type: "sdsObservation", value: "Premium Brands" }] },
  "Skin Sensitivity":       { coaching: "We will process your garments using 100% dye-free and fragrance-free detergents.", actions: [{ type: "handlingCode", value: "Det" }] },
  "Pets":                   { coaching: "Please make sure your pets are secured in a safe room. I'll remind the crew to be very careful with open doors.", actions: [{ type: "sdsObservation", value: "Pets on site" }, { type: "eventInstruction", value: "Keep doors closed - pets on site" }] },
};

const DEFAULT_FORM={
  isLead: null,
  isRestorationProject: "",
  insuranceStatus: "",
  restorationType: "",
  involvesInsurance: "",
  payorQuick: "",
  leadSourceCategory: "", 
  leadSourceDetail: "",
  contactMethod: "", 
  orderStatus: "New",
  
  orderNumber:"150001", orderName:"", orderNameLocked:false, orderNameAuto:true,
  referringCompany:"", referrer:"",
  
  orderTypes: [],
  primaryLossType: "",
  secondaryContaminants: [],
  lossDetails: {}, 
  
  livingStatus: "", 
  processType: "",
  repairsSummary: "",
  
  noHeat: false,
  noLights: false,
  boardedUp: false,
  damageWasWet: false, 
  damageMoldMildew: false,
  moldCoverageConfirm: "",

  addresses:[initAddress()], customers:[initCustomer({isPrimary:true, type:""})], peopleQuick:[], addCRMlog:false,
  billingPayer:"", billingMethod:"", billingNote:"", directionOfPayment: "",
  billingCompany: "", billingContact: "",
  pricePlatform: "", priceList: "", multiplier: "",
  estimateNeeded:"", estimateRecipients:[], estimateType:"",
  estimateRequestedBy: "",
  pickupBeforeApproval:"", pickupBeforeApprovalNote:"", scopeApproved:"", estimateAmount:"", estimateApprovedAt:"",
  orderInstructions: [],
  insuranceClaim:"", insuranceCompany:"", insuranceAdjuster:"", adjusterCompany:"", nationalCarrier:"", nationalCarrierRequested:false, claimNumber:"", dateOfLoss:"", workOrderNumber:"", policyNumber:"", insuranceOrderEmail:"", rentOrOwn:"",
  contentsCoverageLimit:"", moldLimit:"", rentCoverageLimit:"", publicAdjustingCompany:"", publicAdjuster:"", independentAdjustingCo:"",
  independentAdjuster:"", tpaCompany:"", tpaContact:"", 
  salesRep: "",
  serviceOfferings: [],
  groupAddressLinks: {},
  lossSeverity: initLossSeverity(),
  interviewLog: {},
  vendors:[],
  vendorDetails:{},
  showReferralVendor: true,

  additionalCompanyTypes: [],
  additionalCompanies: {},
  crmLogs: [],
  planSteps: [],
  currentUser: "",
  
  handlingCodes:[], 
  qualityCode:"", 
  severityCodes: [],
  preferenceNote:"",
  
  structuralElectricDamage:"", willPaint:"", willSandWoodFloors:"", willRemoveWindowTreatments:"", willPackOutFurniture:"",
  everyoneOk:"", everyoneOkNote:"", familyMedicalIssues:"", familyMedicalNote:"", soapFragAllergies:"", soapFragNote:"",
  useDryCleaner:"", useDryCleanerNote:"", selfCleaning:"", selfCleaningNote:"", donateSalvation:"", donateSalvationNote:"",
  howDryLaundry:"", howDryNote:"",
  packoutSummary: [],
  
  scheduleType: "Scope", 
  eventInstructions: "",
  eventSystemOverride: "",
  pickupTimeTentative: false,
  eventNotes: [],
  eventFirm: false,
  eventUrgent: false,
  eventHandledBySalesRep: false,
  eventCustomerContacted: "office",
  eventBillToContacted: false,
  scheduleStatus: "",
  reminderEnabled: false,
  reminderDate: "",
  reminderTime: "",
  eventAssignee: "",
  eventVehicle: "",
  quickInstructionNotes: [],
  sdsConsiderations: [],
  sdsObservations: [],
  sdsServices: [],
  sdsRooms: [],
  sdsProjectFloors: [],
  sdsApartmentType: "",
  sdsPrebagged: "",
  sdsPhotos: [],
  sdsCoverPhoto: null,
  sdsInitialInstructions: [],
  sdsInstructionAgreement: null,
  sdsDisagreementNote: "",
  estimateRequested: false, 
  estimateRequestedType: "",
  meetingWith: [],
  pickupDate: new Date().toISOString().split('T')[0],
  pickupTime: "",
  assignedTech: "",

  quickScopeNotes: [], 
  loadList: [], 

  postPickup:{
    totalLoss:{taken:false,left:false,listed:false}, notWorthCleaning:{taken:false,left:false,listed:false},
    donationItems:{taken:false,left:false,listed:false}, cashOut:{taken:false,left:false,listed:false},
    testCleaning:{taken:false,left:false,listed:false},
  },
  additionalObservations:[], whoAtPickup:[], storageNeeded:"", storageMonths:"", highlightMissing:{},
  suggestedGroups: [],
  scopeBridge: createScopeBridgeState(),
};

// --- UI PRIMITIVES ---
const Chevron = ({open}) => <span className={`text-slate-400 transition-transform duration-200 ${open?"rotate-90":""}`}>›</span>;

const buildNarrativeProse = (narrative = [], data = {}) => {
  const g = {};
  narrative.forEach(l => { if (!g[l.section]) g[l.section] = []; g[l.section].push(l.text); });
  const p = [];

  // Opening — loss description
  if (g["Loss"]) {
    p.push(`This is a ${g["Loss"][0]}`);
  }

  // Customer + Address
  const primary = (data.customers || []).find(c => c.isPrimary) || (data.customers || [])[0];
  const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0];
  if (primary && (primary.first || primary.last)) {
    const name = [primary.first, primary.last].filter(Boolean).join(" ");
    const role = primary.policyHolder ? "The policyholder" : "The customer";
    let custLine = `${role} is ${name}`;
    if (primaryAddr && primaryAddr.street) custLine += ` at ${summarizeAddress(primaryAddr)}`;
    if (primary.phone) custLine += `. They can be reached at ${primary.phone}`;
    if (primary.email) custLine += ` (${primary.email})`;
    custLine += ".";
    p.push(custLine);
  }
  // Additional contacts
  const others = (data.customers || []).filter((c, i) => i > 0 && (c.first || c.last));
  others.forEach(c => {
    const name = [c.first, c.last].filter(Boolean).join(" ");
    const role = c.type || "additional contact";
    let line = `${name} is ${role === "Husband" || role === "Wife" ? `the ${role.toLowerCase()}` : `an ${role.toLowerCase()}`}`;
    if (c.email) line += ` (${c.email})`;
    if (c.phone) line += `, reachable at ${c.phone}`;
    p.push(line + ".");
  });

  // Referral + Insurance
  const refParts = [];
  if (g["Referral"]) refParts.push(`This order was referred by ${g["Referral"][0]}`);
  if (g["Sales Rep"]) refParts.push(`assigned to ${g["Sales Rep"][0]}`);
  if (refParts.length) p.push(refParts.join(", ") + ".");

  if (g["Insurance"]) {
    let ins = `The insurance carrier is ${g["Insurance"][0]}`;
    if (g["Claim #"]) ins += `, claim #${g["Claim #"][0]}`;
    p.push(ins + ".");
  }

  // Other companies
  (data.vendors || []).forEach(v => {
    if (v.company && v.type && !["Insurance"].includes(v.type)) {
      let line = `${v.company} is the ${v.type.toLowerCase()}`;
      if (v.contact) line += ` (contact: ${v.contact})`;
      p.push(line + ".");
    }
  });

  // Our services
  if (g["Services"]) p.push(`Our scope of work includes ${g["Services"][0].toLowerCase()}.`);

  // Conditions
  if (g["Conditions"]) p.push(`At the home, the site currently has ${g["Conditions"][0]}`);

  // Customer care
  const careParts = [];
  if (g["Considerations"]) careParts.push(g["Considerations"][0].toLowerCase());
  if (g["Pets"]) careParts.push(`has a pet (${g["Pets"][0]})`);
  if (g["Laundry"]) careParts.push(g["Laundry"][0].toLowerCase());
  if (careParts.length) p.push(`The customer is ${careParts.join(", ")}.`);

  // Living + Storage
  if (g["Living"]) {
    let living = `The customer is currently ${g["Living"][0] === "Staying in home" ? "staying in the home" : g["Living"][0] === "Hotel" ? "staying in a hotel" : g["Living"][0] === "Temp" ? "in a temporary home" : g["Living"][0] === "Moving" ? "permanently relocating" : "in temporary housing"}`;
    if (g["Storage"]) living += ` and will need ${g["Storage"][0].toLowerCase()}`;
    p.push(living + ".");
  }

  // Structural repairs (not our work)
  if (g["Repairs"]) p.push(`Structural repairs to the home include ${g["Repairs"][0].toLowerCase()} (performed by the contractor, not our team).`);

  // Our packout
  if (g["Pack-out"]) p.push(`We will be picking up ${g["Pack-out"][0].toLowerCase()}.`);

  // Schedule
  if (g["Scheduled"]) p.push(`The next appointment is ${g["Scheduled"][0]}.`);

  // Notes
  if (g["Notes"]) p.push(g["Notes"][0]);

  return p;
};

const CoachingTip = ({ tipKey, dismissed, onDismiss, children, className }) => {
  if (dismissed.has(tipKey)) return null;
  return (
    <div className={`rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700 ${className || ""}`}>
      <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDismiss(tipKey); }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>
      {children}
    </div>
  );
};

const Field = ({label,children,subtle,missing, className, action, smart, id, noeField}) => (
  <div id={id} className={`flex flex-col gap-1.5 ${className||""}`} data-noe-field={noeField || undefined} data-noe-label={label || undefined}>
    <div className="flex items-center justify-between">
        <label className={`flex items-center text-sm font-semibold tracking-wide ${subtle?"text-slate-500":"text-slate-700"}`}>
        {label}
        {missing && <span className="ml-1 text-red-500">*</span>}
        {smart && <span title={typeof smart === 'string' ? smart : "Automatically updates"} className="ml-1.5 text-orange-500 text-xs cursor-help">⚡</span>}
        </label>
        {action}
    </div>
    {children}
  </div>
);

const Input = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 hover:border-slate-300 ${props.className||""}`} />
));
const Select = React.forwardRef(({children, ...props}, ref) => (
  <select
    ref={ref}
    {...props}
    className={`w-full min-h-[42px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 hover:border-slate-300 ${props.className||""}`}
  >
    {children}
  </select>
));
const Textarea = (props) => <textarea {...props} className={`w-full min-h-[80px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 hover:border-slate-300 ${props.className||""}`} />;
const AutoGrowTextarea = ({ value, onChange, className, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={`w-full min-h-[120px] resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 hover:border-slate-300 ${className||""}`}
      {...props}
    />
  );
};

const normalizeDateInput = (value) => {
  const v = (value || "").trim();
  if (!v) return "";
  const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return v;
  const usMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const mm = String(usMatch[1]).padStart(2, "0");
    const dd = String(usMatch[2]).padStart(2, "0");
    return `${usMatch[3]}-${mm}-${dd}`;
  }
  return v;
};

const formatDateLabel = (value) => {
  if (!value) return "";
  const iso = normalizeDateInput(value);
  const [y, m, d] = iso.split("-").map(n => parseInt(n, 10));
  if (!y || !m || !d) return value;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const getNowDateIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getNowTimeLabel = () => {
  const d = new Date();
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hr = hours24 % 12 || 12;
  return `${hr}:${minutes} ${ampm}`;
};

const getNextHalfHourLabel = () => {
  const d = new Date();
  let hours24 = d.getHours();
  const mins = d.getMinutes();
  let nextMinutes = 30;
  if (mins >= 30) {
    nextMinutes = 0;
    hours24 = (hours24 + 1) % 24;
  }
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hr = hours24 % 12 || 12;
  const mm = String(nextMinutes).padStart(2, "0");
  return `${hr}:${mm} ${ampm}`;
};

const DatePicker = ({ value, onChange, closeSignal }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [view, setView] = useState(() => {
    const base = value ? new Date(normalizeDateInput(value)) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  useEffect(() => {
    if (closeSignal !== undefined) setOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    if (!value) return;
    const d = new Date(normalizeDateInput(value));
    if (!isNaN(d.getTime())) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const days = [];
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const todayIso = getNowDateIso();

  const pick = (d) => {
    if (!d) return;
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    if (iso < todayIso) return;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value || ""}
        onChange={(e) => { onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          const normalized = normalizeDateInput(value);
          const today = getNowDateIso();
          if (!normalized || normalized < today) { onChange(today); return; }
          if (normalized !== value) onChange(normalized);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const normalized = normalizeDateInput(value || "");
            if (normalized !== value) onChange(normalized);
            setOpen(false);
          }
          if (e.key === "Tab") {
            const normalized = normalizeDateInput(value || "");
            if (normalized !== value) onChange(normalized);
            setOpen(false);
          }
        }}
        placeholder="YYYY-MM-DD"
        className="!py-3 !text-base pr-10"
      />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
        title="Pick a date"
      >
        📅
      </button>
      {open && (
        <div className="absolute z-[120] mt-2 w-[380px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
            >
              ←
            </button>
            <div className="text-sm font-bold text-slate-700">
              {view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </div>
            <button
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold text-slate-400 mb-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, idx) => {
              const dateIso = d ? new Date(year, month, d).toISOString().slice(0, 10) : "";
              const isSelected = d ? normalizeDateInput(value) === dateIso : false;
              const isToday = d ? dateIso === todayIso : false;
              const isPast = d ? dateIso < todayIso : false;
              const dayOfWeek = d ? new Date(year, month, d).getDay() : -1;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <button
                  key={`${d}-${idx}`}
                  onClick={() => pick(d)}
                  className={`h-10 w-10 rounded-full text-sm relative ${
                    !d ? "text-transparent" :
                    isPast ? "text-slate-300 cursor-not-allowed" :
                    isSelected ? "bg-sky-500 text-white font-bold" :
                    isToday ? "bg-sky-50 text-sky-700 font-bold ring-2 ring-sky-300" :
                    isWeekend ? "text-slate-500 bg-slate-50 hover:bg-sky-50" :
                    "text-slate-700 hover:bg-sky-50"
                  }`}
                  disabled={!d || isPast}
                  title={d ? new Date(year, month, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ""}
                >
                  {d || "."}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => setOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TimePicker = ({ value, onChange, closeSignal }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  useEffect(() => {
    if (closeSignal !== undefined) setOpen(false);
  }, [closeSignal]);
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);
  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value || ""}
        onChange={(e) => { onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setOpen(false);
          }
          if (e.key === "Tab") {
            setOpen(false);
          }
        }}
        placeholder="Time"
        className="!py-3 !text-base pr-10"
      />
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
        title="Pick a time"
      >
        🕒
      </button>
      {open && (
        <div className="absolute z-[120] mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="max-h-[300px] overflow-y-auto custom-scroll">
            {TIME_SLOTS.map(t => (
              <button
                key={t}
                onClick={() => { onChange(t); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg ${t === value ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const normalizeOption = (opt) => {
  if (typeof opt === "string") return { label: opt, value: opt, type: "generic" };
  const label = String(opt?.label ?? opt?.value ?? "");
  const value = String(opt?.value ?? opt?.label ?? "");
  return { label, value, type: opt?.type || "generic" };
};

const SearchSelect = ({ value, onChange, onQueryChange, options, placeholder, className, onKeyDown, onBlur, clearOnCommit, inputRef, onEmptyEnter, onAddNew, maxResults = 8, uppercase = false, menuClassName = "", ...props }) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState(value || "");
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const normalizedOptions = useMemo(() => (options || []).map(normalizeOption), [options]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return normalizedOptions.slice(0, maxResults);
    const starts = normalizedOptions.filter(o => o.label.toLowerCase().startsWith(q) || o.value.toLowerCase().startsWith(q));
    const includes = normalizedOptions.filter(o => !starts.includes(o) && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)));
    return [...starts, ...includes].slice(0, maxResults);
  }, [query, normalizedOptions]);

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(0);
  }, [filtered.length, highlight]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (open) setHighlight(0);
  }, [open]);

  useEffect(() => {
    const el = itemRefs.current[highlight];
    if (el && listRef.current) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlight, filtered.length]);

  const commit = (val) => {
    const nextVal = uppercase ? String(val || "").toUpperCase() : val;
    onChange(nextVal);
    if (clearOnCommit) {
      setQuery("");
      onQueryChange?.("");
    } else {
      setQuery(nextVal);
      onQueryChange?.(nextVal);
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className||""}`}>
      <Input
        ref={inputRef}
        value={query}
        onChange={e => {
          const raw = e.target.value;
          const next = uppercase ? raw.toUpperCase() : raw;
          setQuery(next);
          setOpen(true);
          onQueryChange?.(next);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type to search..."}
        className={`pr-10 ${className||""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEmptyEnter && !query.trim()) {
            e.preventDefault();
            onEmptyEnter();
            setOpen(false);
            return;
          }
          if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[highlight]) commit(filtered[highlight].value);
            else if (query.trim()) commit(query.trim());
          }
          if (e.key === "Tab") {
            if (filtered[highlight]) commit(filtered[highlight].value);
            else if (query.trim()) commit(query.trim());
          }
          if (e.key === "Escape") setOpen(false);
          onKeyDown?.(e);
        }}
        onBlur={(e) => { setOpen(false); onBlur?.(e); }}
        {...props}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">▾</span>
      {open && (filtered.length > 0 || (query.trim() && onAddNew)) && (
        <div ref={listRef} className={`absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-auto ${menuClassName || "max-h-60"}`}>
          {filtered.map((opt, idx) => (
            <button
              type="button"
              key={`${opt.type}-${opt.value}-${idx}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(opt.value)}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                idx === highlight
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {opt.type !== "generic" && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">{opt.type}</span>
              )}
            </button>
          ))}
          {query.trim() && onAddNew && filtered.length === 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onAddNew(query.trim()); setQuery(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 border-t border-slate-100 flex items-center gap-2"
            >
              <span className="text-base">+</span>
              <span>Add "{query.trim()}" as new</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Toast = ({message,onClose,panelOffset=0})=>{
  useEffect(()=>{ const id=setTimeout(onClose,3500); return ()=>clearTimeout(id);},[onClose]);
  return(<div className="fade-in fixed bottom-28 z-[90] rounded-2xl bg-slate-800/95 backdrop-blur px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-500/20 flex items-center gap-2" style={{ left: `calc((100% - ${panelOffset}px) / 2)`, transform: 'translateX(-50%)' }}><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>{message}</div>)
};

const Switch = ({ checked, onChange }) => (
    <button 
        onClick={() => onChange(!checked)} 
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-sky-500' : 'bg-slate-200'}`}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SmartNotification = ({ message, onReject, onClose, panelOffset = 0 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 z-[90] flex items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-2xl slide-up border border-slate-700" style={{ left: `calc((100% - ${panelOffset}px) / 2)`, transform: 'translateX(-50%)' }}>
            <div className="flex items-center gap-3">
                <div className="text-orange-500 font-bold text-lg">⚡</div>
                <span className="text-sm font-medium">{message}</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <button onClick={onReject} className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-wider">Reject</button>
        </div>
    );
};

const pillBase = "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none";
const pillInactive = "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";
const pillActive = "bg-sky-50 border-sky-300 text-sky-700 font-bold shadow-sm"; 

const ToggleGroup = ({ options, value, onChange, noeField }) => (
  <div className="flex flex-wrap gap-2" data-noe-field={noeField || undefined} data-noe-value={value || undefined}>
    {options.map(opt => {
       const label = typeof opt === "string" ? opt : opt.label;
       const title = typeof opt === "string" ? undefined : opt.title;
       const isActive = value === label;
       return (<button key={label} type="button" title={title} aria-pressed={isActive} data-noe-option={label} data-noe-selected={isActive} onClick={() => onChange(isActive ? "" : label)} className={isActive ? `${pillBase} ${pillActive}` : `${pillBase} ${pillInactive}`}>
         {isActive && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
         {label}
       </button>)
    })}
  </div>
);

const RoleBadge = ({ role }) => (
  <span title={role.title} className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
    <RoleIcon role={role} className="h-3 w-3" />
    {role.title}
  </span>
);
const EditAffordance = ({ title = "Edit" }) => (
  <span
    title={title}
    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm"
  >
    <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
  </span>
);
const AssignmentCueStrip = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={`assignment-cue-${item}`}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
        >
          {item}
        </span>
      ))}
    </div>
  );
};
const LinkedAssignmentPanel = ({
  title = "Linked Assignment",
  helperText = "",
  values = [],
  cues = [],
  headerBadge = "",
  locked = true,
  onToggleLock,
}) => {
  const Icon = locked ? Lock : LockOpen;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {locked ? title : `${title} Unlocked`}
          </div>
          {locked && headerBadge ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {headerBadge}
              </span>
            </div>
          ) : null}
          <div className="mt-1 text-[11px] text-slate-500">
            {locked
              ? helperText
              : "Unlocked for this order. Change these fields only if this section should be different."}
          </div>
        </div>
        {onToggleLock ? (
          <button
            type="button"
            onClick={onToggleLock}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-300 hover:text-slate-800"
          >
            {locked ? "Unlock" : "Lock"}
          </button>
        ) : null}
      </div>
      {cues.length ? (
        <div className="mt-3">
          <AssignmentCueStrip items={cues} />
        </div>
      ) : null}
      {values.length ? (
        <div className={`mt-3 grid gap-3 ${values.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {values.map((item) => (
            <div key={`linked-assignment-${title}-${item.label}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{item.value || "Not assigned"}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const CompanyRecord = ({ company, contact, contacts, roles = [], className, editable, onChangeContact, onChangeCompany, onChangeContacts, roleOptions, onToggleRole, onFindCompany, rep, inactive, getRolesForContact, getRoleOptionsForContact, onToggleRoleForContact, contactOptions, onAddContact, getSalesRepForContact, getTitleForContact }) => {
  if (!editable && !company && !contact) return null;
  const contactList = (() => {
    const raw = contacts && contacts.length
      ? contacts
      : (contact ? [{ name: contact, inactive: false }] : []);
    const seen = new Set();
    return raw.filter(c => {
      const key = normalizeContact(c?.name || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addContactValue, setAddContactValue] = useState("");
  const [addContactCloseArmed, setAddContactCloseArmed] = useState(false);
  useEffect(() => {
    if (!addContactOpen) return;
    const handleKey = (e) => {
      if (e.key === "Enter" && addContactCloseArmed) {
        e.preventDefault();
        setAddContactOpen(false);
        setAddContactCloseArmed(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [addContactOpen, addContactCloseArmed, addContactValue]);
  return (
    <div className={`rounded-xl ${editable ? "border border-slate-200" : "border border-transparent"} bg-white px-4 py-3 ${className || ""}`}>
      <div className="flex items-start justify-between gap-2">
        {editable ? (
          <div className="grid gap-2 w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Contacts</label>
            <div className="grid gap-2">
              {(contactList.length ? contactList : [{ name: "", inactive: false }]).map((c, idx) => (
                <div key={`${idx}-${c.name}`} className="rounded-lg border border-slate-200 p-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const parts = splitName(c.name || "");
                      return (
                        <>
                          <Input
                            value={parts.first}
                            onChange={e => {
                              const next = [...(contactList.length ? contactList : [{ name: "", inactive: false }])];
                              const last = splitName(next[idx]?.name || "").last;
                              next[idx] = { ...(next[idx] || {}), name: [e.target.value, last].filter(Boolean).join(" ") };
                              onChangeContacts?.(next);
                            }}
                            placeholder="First name"
                          />
                          <Input
                            value={parts.last}
                            onChange={e => {
                              const next = [...(contactList.length ? contactList : [{ name: "", inactive: false }])];
                              const first = splitName(next[idx]?.name || "").first;
                              next[idx] = { ...(next[idx] || {}), name: [first, e.target.value].filter(Boolean).join(" ") };
                              onChangeContacts?.(next);
                            }}
                            placeholder="Last name"
                          />
                        </>
                      );
                    })()}
                    <button
                      onClick={() => {
                        const next = [...(contactList.length ? contactList : [{ name: "", inactive: false }])].filter((_, i) => i !== idx);
                        onChangeContacts?.(next);
                      }}
                      className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                  {getRoleOptionsForContact && onToggleRoleForContact && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getRoleOptionsForContact(company, c.name).map(r => (
                        <button
                          key={`${r.id}-${idx}`}
                          onClick={() => onToggleRoleForContact(company, c.name, r.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${r.active ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700'}`}
                        >
                          <span className="mr-1 inline-flex"><RoleIcon role={r} className="h-3 w-3" /></span>{r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  const next = [...(contactList.length ? contactList : [])];
                  next.push({ name: "", inactive: false });
                  onChangeContacts?.(next);
                }}
                className="w-fit rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
              >
                + Add contact
              </button>
            </div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
            <Input value={company || ""} onChange={e=>onChangeCompany?.(e.target.value)} placeholder="Company name" />
            {contact && !company && (
              <div className="text-[10px] font-semibold text-orange-600">Company required for contact.</div>
            )}
            {onFindCompany && (
              <button
                onClick={onFindCompany}
                className="w-fit rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
              >
                Find on Google (demo)
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full text-sm text-slate-700">
            {contactList.length > 0 ? (
              contactList.map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="w-full rounded-lg border border-slate-200 bg-slate-50/40 px-3 py-2">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="font-semibold text-slate-800">{c.name || "Unnamed contact"}</div>
                      {getTitleForContact && getTitleForContact(c.name) && (
                        <div className="text-[10px] font-semibold text-slate-400">{getTitleForContact(c.name)}</div>
                      )}
                    </div>
                    {getSalesRepForContact && getSalesRepForContact(c.name) && (
                      <div className="flex flex-col items-center gap-1 text-[9px] font-bold text-slate-400">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                          {getRepInitials(getSalesRepForContact(c.name))}
                        </span>
                        <span>Rep</span>
                      </div>
                    )}
                  </div>
                  {getRolesForContact && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {getRolesForContact(company, c.name).map(r => (
                        onToggleRoleForContact ? (
                          <button
                            key={`${r.title}-${idx}`}
                            onClick={() => onToggleRoleForContact(company, c.name, r.id || r.title?.toLowerCase())}
                            className="rounded-full"
                            title="Click to toggle role"
                          >
                            <RoleBadge role={r} />
                          </button>
                        ) : (
                          <RoleBadge key={`${r.title}-${idx}`} role={r} />
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No contacts yet</div>
            )}
            {onAddContact && (
              <div className="mt-1">
                {!addContactOpen ? (
                  <button
                    onClick={() => { setAddContactOpen(true); setAddContactCloseArmed(false); }}
                    className="w-fit rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  >
                    + Add contact
                  </button>
                ) : (
                  <div
                    className="rounded-lg border border-slate-200 bg-white p-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && addContactCloseArmed && !addContactValue) {
                        e.preventDefault();
                        setAddContactOpen(false);
                        setAddContactCloseArmed(false);
                      }
                    }}
                  >
                    <SearchSelect
                      value={addContactValue}
                      onChange={(v) => {
                        onAddContact(v);
                        setAddContactValue("");
                        setAddContactCloseArmed(true);
                      }}
                      onQueryChange={(v) => { setAddContactValue(v); if (v) setAddContactCloseArmed(false); }}
                      onEmptyEnter={() => {
                        if (addContactCloseArmed) {
                          setAddContactOpen(false);
                          setAddContactCloseArmed(false);
                        }
                      }}
                      options={contactOptions || []}
                      placeholder="Type contact name..."
                      clearOnCommit
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Not in list? Just type and press Enter.</span>
                      <button
                        onClick={() => { setAddContactOpen(false); setAddContactCloseArmed(false); }}
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {null}
      </div>
      {!editable && roles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {roles.map(r => <RoleBadge key={r.title} role={r} />)}
        </div>
      )}
      {roleOptions && roleOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {roleOptions.map(r => (
            <button
              key={r.id}
              onClick={() => onToggleRole?.(r.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${r.active ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700'}`}
            >
              <span className="mr-1 inline-flex"><RoleIcon role={r} className="h-3 w-3" /></span>{r.label}
            </button>
          ))}
        </div>
      )}
      {inactive && (
        <div className="mt-2 text-[10px] font-bold text-amber-600">Inactive</div>
      )}
    </div>
  );
};

const ToggleMulti = ({ label, checked, onChange, className, colorClass, title, showDot = true, noeField }) => {
    const activeClass = colorClass || pillActive;
    return (
        <button type="button" onClick={onChange} title={title} aria-pressed={checked} data-noe-option={label} data-noe-selected={checked} data-noe-field={noeField || undefined} className={(checked ? `${pillBase} ${activeClass}` : `${pillBase} ${pillInactive}`) + " " + (className||"")}>
            {checked && showDot && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
            {label}
        </button>
    );
};

const SubSection = ({ id, title, open, onToggle, children, compact, className, action }) => {
  const handleToggle = () => onToggle?.(!open);
  return (
    <div id={id} data-noe-subsection={id || undefined} data-noe-open={open} className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-5"} shadow-sm scroll-mt-28 ${className || ""}`}>
      <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={handleToggle}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="flex flex-1 items-center justify-between text-left"
          aria-expanded={open}
        >
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">{title}</span>
          <span className="text-slate-400 text-lg">{open ? "▾" : "›"}</span>
        </button>
        {action && <div data-subsection-action="true" onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
      {open && <div className={`mt-4 ${compact ? "space-y-3" : "space-y-4"} fade-in`}>{children}</div>}
    </div>
  );
};

// --- SHARED FIELD COMPONENTS ---

const LeadInfoFields = memo(({ data, update, updateMany, companies, setModal, toggleMulti, showInlineHelp, auditOn, salesRep, setSalesRep, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, setToast, getSalesRepForContact, onOpenCrmLog, onPromptRoleAssignment, onAddNewToSystem }) => {
  const referrerDisplayValue = data.referrer && data.referringCompany
    ? `${data.referrer} — ${data.referringCompany}`
    : (data.referrer || data.referringCompany || "");
  const [referrerQuery, setReferrerQuery] = useState(referrerDisplayValue);
  const [addNewContact, setAddNewContact] = useState(null);
  useEffect(() => { if (!data.referrer && !data.referringCompany) setAddNewContact(null); }, [data.referrer, data.referringCompany]);
  const [repMenuOpen, setRepMenuOpen] = useState(false);
  const [showSuggestedRoles, setShowSuggestedRoles] = useState(false);
  const [suggestedSelection, setSuggestedSelection] = useState(suggestedReferrerRoles || []);
  const [suggestedRolesOffsetTop, setSuggestedRolesOffsetTop] = useState(72);
  const referrerFieldAnchorRef = useRef(null);
  const suggestedRolesCardRef = useRef(null);
  const referrerRep = getSalesRepForContact && data.referrer ? getSalesRepForContact(data.referrer) : "";
  useEffect(() => setReferrerQuery(referrerDisplayValue), [referrerDisplayValue]);
  useEffect(() => setSuggestedSelection(suggestedReferrerRoles || []), [suggestedReferrerRoles]);
  const referrerBestMatch = getBestMatch(combinedContactOptions || [], referrerQuery);
  const roleActive = {
    insurance: !!data.referringCompany && data.insuranceCompany === data.referringCompany,
    billing: !!data.referringCompany && data.billingCompany === data.referringCompany,
    national: !!data.referringCompany && data.nationalCarrier === data.referringCompany,
    adjuster: !!data.referrer && data.insuranceAdjuster === data.referrer
  };
  const referrerRoles = [];
  if (roleActive.insurance) referrerRoles.push({ id: "insurance", title: "Insurance" });
  if (roleActive.adjuster) referrerRoles.push({ id: "adjuster", title: "Adjuster" });
  if (roleActive.billing) referrerRoles.push({ id: "billing", title: "Billing" });
  if (roleActive.national) referrerRoles.push({ id: "national", title: "National Carrier" });
  const applyReferrerValue = (value) => {
    const raw = (value || "").trim();
    const parsed = raw ? (parseCombinedContact?.(raw) || { contact: raw, company: "" }) : { contact: "", company: "" };
    if (parsed.contact && !parsed.company) {
      setToast("Contact must include a company.");
      return;
    }
    const currentContact = data.referrer || "";
    const currentCompany = data.referringCompany || "";
    const nextContact = parsed.contact || "";
    const nextCompany = parsed.company || "";
    const sameBillingContact = !!currentContact && normalizeContact(data.billingContact || "") === normalizeContact(currentContact);
    const sameBillingCompany = !!currentCompany && normalizeCompany(data.billingCompany || "") === normalizeCompany(currentCompany);
    const sameInsuranceAdjuster = !!currentContact && normalizeContact(data.insuranceAdjuster || "") === normalizeContact(currentContact);
    const sameInsuranceCompany = !!currentCompany && normalizeCompany(data.insuranceCompany || "") === normalizeCompany(currentCompany);
    const sameNationalCarrier = !!currentCompany && normalizeCompany(data.nationalCarrier || "") === normalizeCompany(currentCompany);
    const patch = {
      referrer: nextContact,
      referringCompany: nextCompany,
    };
    if (sameBillingContact) patch.billingContact = nextContact;
    if (sameBillingCompany) patch.billingCompany = nextCompany;
    if (sameInsuranceAdjuster) patch.insuranceAdjuster = nextContact;
    if (sameInsuranceCompany) patch.insuranceCompany = nextCompany;
    if (sameNationalCarrier) patch.nationalCarrier = nextCompany;
    if (!nextCompany && data.billingPayer === "Referrer" && (sameBillingContact || sameBillingCompany)) {
      patch.billingPayer = "";
    }
    if (getSalesRepForContact && nextContact && (!data.salesRep || data.salesRep === referrerRep)) {
      const rep = getSalesRepForContact(nextContact);
      patch.salesRep = rep || "";
    }
    updateMany(patch);
    if (nextCompany) triggerAutoFlash?.("referringCompany");
    if (nextContact) triggerAutoFlash?.("referrer");
    // Role badges are now inline on the referrer card — no blocking popup needed
    // onPromptRoleAssignment?.({
    //   company: nextCompany,
    //   contact: nextContact,
    //   source: "referrer",
    //   preferredRoles: ["referrer"],
    //   forceRoles: ["referrer"]
    // });
  };
  const toggleReferrerRole = (roleId) => {
    const company = data.referringCompany || "";
    const contact = data.referrer || "";
    if (!company && !contact) return;
    const patch = {};
    if (roleId === "billto") {
      if (data.billingCompany === company) {
        patch.billingCompany = "";
        if (data.billingContact === contact) patch.billingContact = "";
      } else {
        patch.billingCompany = company;
        if (contact) patch.billingContact = contact;
        if (!data.billingPayer) patch.billingPayer = "Referrer";
      }
    }
    if (roleId === "adjuster") {
      if (data.insuranceAdjuster === contact) {
        patch.insuranceAdjuster = "";
      } else {
        patch.insuranceAdjuster = contact;
        patch.insuranceClaim = "Yes";
        patch.involvesInsurance = "Yes";
      }
    }
    if (roleId === "referrer") {
      if (data.referringCompany === company && data.referrer === contact) {
        patch.referringCompany = "";
        patch.referrer = "";
      } else {
        patch.referringCompany = company;
        patch.referrer = contact;
      }
    }
    updateMany(patch);
  };
  const ensureReferrerFromQuery = () => {
    if (!referrerQuery) return;
    if (referrerDisplayValue && referrerDisplayValue.toLowerCase() === referrerQuery.toLowerCase()) return;
    const best = getBestMatch(combinedContactOptions || [], referrerQuery);
    if (best) applyReferrerValue(best);
  };
  const updateSuggestedRolesOffset = useCallback(() => {
    if (!showSuggestedRoles) return;
    const visualViewport = window.visualViewport;
    const viewportTop = visualViewport?.offsetTop || 0;
    const viewportHeight = visualViewport?.height || window.innerHeight || 0;
    const viewportBottom = viewportTop + viewportHeight;
    const minTop = viewportTop + 16;
    const anchorRect = referrerFieldAnchorRef.current?.getBoundingClientRect();
    const anchorTop = anchorRect ? anchorRect.top + viewportTop : minTop;
    const anchorBottom = anchorRect ? anchorRect.bottom + viewportTop : minTop;
    const modalHeight = suggestedRolesCardRef.current?.offsetHeight || Math.min(520, Math.max(280, viewportHeight - 32));
    const preferredBelow = anchorBottom + 8;
    const preferredAbove = anchorTop - modalHeight - 8;
    let nextTop = preferredBelow;
    if (preferredBelow + modalHeight > viewportBottom - 8) {
      if (preferredAbove >= minTop) {
        nextTop = preferredAbove;
      } else {
        nextTop = Math.max(minTop, viewportBottom - modalHeight - 8);
      }
    }
    setSuggestedRolesOffsetTop(nextTop);
  }, [showSuggestedRoles]);
  useEffect(() => {
    if (!showSuggestedRoles) return;
    updateSuggestedRolesOffset();
    const onViewportShift = () => updateSuggestedRolesOffset();
    window.addEventListener("resize", onViewportShift);
    window.addEventListener("scroll", onViewportShift, true);
    window.visualViewport?.addEventListener("resize", onViewportShift);
    window.visualViewport?.addEventListener("scroll", onViewportShift);
    return () => {
      window.removeEventListener("resize", onViewportShift);
      window.removeEventListener("scroll", onViewportShift, true);
      window.visualViewport?.removeEventListener("resize", onViewportShift);
      window.visualViewport?.removeEventListener("scroll", onViewportShift);
    };
  }, [showSuggestedRoles, updateSuggestedRolesOffset]);
  useEffect(() => {
    if (!showSuggestedRoles) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const rafId = requestAnimationFrame(() => {
      const firstFocusable = suggestedRolesCardRef.current?.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
      firstFocusable?.focus?.();
    });
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = previousOverflow;
    };
  }, [showSuggestedRoles]);
  return (
  <div className="space-y-4">
      <Field label="How did we get this order?">
          <div className="flex flex-wrap justify-start gap-2" data-audit-key="leadSourceCategory">
               {LEAD_SOURCES.map(s => <ToggleMulti key={s} label={s} title={LEAD_SOURCE_HELP[s]} checked={data.leadSourceCategory === s} onChange={() => update("leadSourceCategory", s)} />)}
          </div>
      </Field>
      {showInlineHelp && data.leadSourceCategory === "Referral" && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
          <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">Referrer:</span> The referrer reached out with this order. If assigned, we can begin. If only a lead, we cannot contact the customer yet.
        </div>
      )}

      {data.leadSourceCategory === "Referral" && (
           <div className="grid gap-4 animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100">
               <div ref={referrerFieldAnchorRef}>
                 <Field
                   label="Referrer (Contact or Company)"
                   action={referrerDisplayValue ? (
                     <button
                       type="button"
                       onClick={() => {
                         if (window.confirm(`Remove ${referrerDisplayValue} as referrer? This will also clear any linked roles (Bill To, Insurance, Sales Rep).`)) {
                           updateMany({ referrer: "", referringCompany: "", salesRep: "" });
                           setToast?.("Referrer removed");
                         }
                       }}
                       className="text-[10px] font-bold text-slate-400 hover:text-rose-500"
                     >
                       Remove
                     </button>
                   ) : null}
                 >
                 {referrerDisplayValue ? (
                   <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                     <span className="text-sm font-semibold text-slate-700">{referrerDisplayValue}</span>
                   </div>
                 ) : (
                 <div className="max-w-sm">
                     <SearchSelect
                       data-audit-key="referrer"
                       className={auditOn && data.highlightMissing?.referrer ? "audit-missing" : ""}
                       value=""
                       onChange={(v)=>applyReferrerValue(v)}
                       onQueryChange={(v)=>setReferrerQuery(v)}
                     options={combinedContactOptions}
                     placeholder="Type contact or company..."
                     onBlur={() => ensureReferrerFromQuery()}
                     onAddNew={(name) => {
                       if (onAddNewToSystem) {
                         const nameParts = (name || "").trim().split(/\s+/);
                         onAddNewToSystem({
                           firstName: nameParts[0] || "",
                           lastName: nameParts.slice(1).join(" ") || "",
                           source: "referrer",
                         });
                       }
                     }}
                   />
                 {referrerBestMatch && referrerBestMatch !== referrerDisplayValue && (
                   <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2">
                     <span>Top match:</span>
                       <button
                         onClick={() => applyReferrerValue(referrerBestMatch)}
                         className="font-semibold text-slate-600 hover:text-sky-700"
                       >
                         {referrerBestMatch}
                       </button>
                       <span>(press Enter or Tab)</span>
                     </div>
                   )}
                 </div>
                 )}
                 </Field>
               </div>
               {(data.referrer || data.referringCompany) && !addNewContact && (
                 <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assign roles for this contact</div>
                   <div className="flex flex-wrap gap-2">
                     <ToggleMulti
                       label="Referrer"
                       checked={true}
                       onChange={() => {}}
                       className="!text-[10px] !px-2.5 !py-1 !cursor-default opacity-70"
                     />
                     <ToggleMulti
                       label="Bill To"
                       checked={!!data.referringCompany && data.billingCompany === data.referringCompany}
                       onChange={() => {
                         if (data.billingCompany === data.referringCompany) {
                           updateMany({ billingCompany: "", billingContact: "", billingPayer: "" });
                         } else {
                           updateMany({ billingCompany: data.referringCompany, billingContact: data.referrer, billingPayer: "Referrer" });
                         }
                       }}
                       className="!text-[10px] !px-2.5 !py-1"
                     />
                     <ToggleMulti
                       label="Insurance"
                       checked={!!data.referringCompany && data.insuranceCompany === data.referringCompany}
                       onChange={() => {
                         if (data.insuranceCompany === data.referringCompany) {
                           updateMany({ insuranceCompany: "", insuranceAdjuster: "", insuranceClaim: "" });
                         } else {
                           updateMany({ insuranceCompany: data.referringCompany, insuranceAdjuster: data.referrer, insuranceClaim: "Yes", involvesInsurance: "Yes" });
                         }
                       }}
                       className="!text-[10px] !px-2.5 !py-1"
                     />
                   </div>
                 </div>
               )}
               <button
                 onClick={onOpenCrmLog}
                 className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700"
               >
                 + Add CRM Log{data.referrer ? ` for ${data.referrer}` : ""}
               </button>
           </div>
       )}
      {data.leadSourceCategory === "Marketing" && (
           <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100"><Field label="Channel"><div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">{MARKETING_SOURCES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}</div></Field></div>
       )}
       {data.leadSourceCategory === "Internal" && (
           <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100"><Field label="Type"><div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">{INTERNAL_TYPES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}</div></Field></div>
       )}

      {data.leadSourceCategory && salesRep && (
        <Field label="Sales Rep">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white text-xs font-bold shadow-sm">{getRepInitials(salesRep)}</span>
            <span className="text-sm font-semibold text-slate-700">{salesRep.split(",")[0]}</span>
          </div>
          {showInlineHelp && <div className="text-[10px] text-slate-400 mt-1">Auto-assigned from referrer.</div>}
        </Field>
      )}

      {data.leadSourceCategory && !salesRep && (
      <React.Fragment>
      <Field label="Sales Rep" className="max-w-[200px]">
        <div className="relative inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRepMenuOpen(v => !v)}
            className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200 hover:bg-sky-50"
            title={salesRep || "Select sales rep"}
          >
            {getRepInitials(salesRep || "?")}
          </button>
          {!salesRep && <span className="text-xs text-slate-400">Select rep</span>}
          {repMenuOpen && (
            <div className="absolute top-12 left-0 z-50 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
              {SALES_REPS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setSalesRep(r); setRepMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${salesRep === r ? "text-sky-700 font-semibold" : "text-slate-700"}`}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setSalesRep(""); setRepMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </Field>
      {showInlineHelp && <div className="text-[11px] text-slate-400">Employee managing customer relationships/accounts.</div>}
      </React.Fragment>
      )}
      {showSuggestedRoles && (
        <div data-suggested-roles-modal="true" className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-900/35 p-4" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ensureReferrerFromQuery(); onApplyReferrerRoles?.(suggestedSelection); setShowSuggestedRoles(false); } if (e.key === "Escape") setShowSuggestedRoles(false); }}>
          <div ref={suggestedRolesCardRef} className="w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-auto fade-in" style={{ marginTop: `${suggestedRolesOffsetTop}px` }}>
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">Apply Suggested Roles</div>
                <div className="text-base text-sky-100">Choose which roles to apply for this referrer.</div>
              </div>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setShowSuggestedRoles(false)}>×</button>
            </div>
            <div className="p-6 space-y-3">
            <div className="grid gap-2 text-base">
              {[
                { id: "insurance", label: "Insurance Carrier" },
                { id: "billing", label: "Billing Company" },
                { id: "national", label: "National Carrier" },
                { id: "adjuster", label: "Adjuster" }
              ].map(r => (
                <label key={r.id} className="flex items-center gap-3 text-base font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-5 w-5"
                    checked={suggestedSelection.includes(r.id)}
                    onChange={(e) => {
                      setSuggestedSelection(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id));
                    }}
                  />
                  <span className="flex-1">{r.label}</span>
                  <span className="text-sm font-semibold text-slate-500">
                    {r.id === "adjuster" ? (data.referrer || "—") : (data.referringCompany || "—")}
                  </span>
                </label>
              ))}
            </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setShowSuggestedRoles(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Skip</button>
              <button onClick={() => { ensureReferrerFromQuery(); onApplyReferrerRoles?.(suggestedSelection); setShowSuggestedRoles(false); }} className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white hover:bg-sky-600">Apply</button>
            </div>
          </div>
        </div>
      )}
  </div>
  );
});

const QuickScopeFields = memo(({ data, update, toggleMulti }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase text-slate-500 tracking-wider">Quick Scope Notes</h3>
        <div className="flex flex-wrap gap-2">
            {["Everything Impacted", "Save what you can", "Determine Impact", "Only specific items"].map(n => (
                <ToggleMulti key={n} label={n} checked={(data.quickScopeNotes||[]).includes(n)} onChange={()=>update("quickScopeNotes", toggleMulti(data.quickScopeNotes||[], n))} />
            ))}
        </div>
    </div>
));

const LoadListFields = memo(({ data, update, toggleMulti }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
         <h3 className="mb-3 text-sm font-bold uppercase text-slate-500 tracking-wider">To Bring (Load List)</h3>
         <div className="flex flex-wrap gap-2">
             {LOAD_ITEMS.map(item => (
               <ToggleMulti
                 key={item}
                 label={item}
                 checked={(data.loadList||[]).includes(item)}
                 onChange={() => update("loadList", toggleMulti(data.loadList||[], item))}
                 className={
                   item === "Heater" && data.noHeat ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" :
                   item === "Lights" && (data.noLights || data.boardedUp) ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" :
                   item === "Tyvek" && (data.orderTypes||[]).includes('Mold') ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" :
                   item === "Plastic Bags" && (data.damageWasWet === "Y" || (data.orderTypes||[]).includes('Mold')) ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" :
                   ""
                 }
               />
             ))}
         </div>
    </div>
));

const AI_USAGE_GUIDELINES = [
  "Choose the right entry mode: Use Detailed Entry when you have a lot of information (e.g., multiple contacts, insurance details, scheduling) to capture. Use Quick Entry for basic details, location, and scheduling when the information is minimal.",
  "Recommended AI workflow: In Detailed Entry, tab through the entire form and use Enter as needed to move forward field by field. If a correction is needed, use Shift + Enter to move backward.",
  "Always specify a referrer: The referrer is the person or company that provided the job or assignment. Use the quick entry search—type in the name and select the correct contact/company from the suggestions.",
  "Ensure a Bill‑To is entered: Identify who will pay for the services. If an insurance company is the referrer, that company typically serves as both the Bill‑To and the insurance provider.",
  "Provide an order name: An order name helps identify the job. It will auto‑populate when you enter the customer's name and address, but verify it before saving.",
  "Capture contact information: Make sure at least one phone number or email is recorded for the primary customer. Include additional contacts (spouse, adjuster, mover) if relevant.",
  "Fill in the Interview section: Open the Interview section and answer as many questions as you can (e.g., project type, severity, origin, cause). Smart fields marked with a lightning‑bolt icon will automatically fill related fields and display a confirmation toast.",
  "Scheduling appointments: In the Schedule section you can either type directly over the date and time or use the calendar and clock icons to pick them. Indicate whether the event is firm or tentative, select the correct service offerings, and provide clear event instructions.",
  "Refinements for insurance claims: When entering insurance details, indicate whether it's an insurance claim, select the insurance company, and add the adjuster's contact via the quick‑add menu. Use the same menu to add other companies (e.g., movers, contractors).",
  "Review before saving: Check that all required fields (Referrer, Bill‑To, order name, schedule date/time) are completed. Missing required fields may trigger a warning before submission. Once complete, click Save, review the summary, and then choose Continue Save to submit the order."
];

const AI_TIME_SAVING_TIPS = [
  "Use “quick add” wherever possible: The quick‑add menu is the fastest way to assign roles like adjuster, mover or contractors. Begin typing a name or company and select the correct match from the drop‑down instead of creating contacts from scratch.",
  "Type times directly into the schedule: If the time picker is hard to use, double‑click in the time field, press Ctrl + A to highlight the existing entry and type the desired time (e.g., 12:00 PM). Press Enter to confirm.",
  "Look for auto‑fill hints: When you enter a customer's name and address, the order name and other fields may auto‑populate. Accept these suggestions to save time and ensure consistency.",
  "Document thoroughly in notes: Use the Interview and Event Instructions fields to capture details about the job (e.g., site conditions, special handling instructions, pets on site). Detailed notes reduce follow‑up questions later.",
  "Use keyboard shortcuts: Press Tab or Enter to move forward, and Shift + Tab or Shift + Enter to move backward through fields. Keyboard navigation can speed up data entry and reduce reliance on the mouse."
];

// --- START SCREEN ---
const StartScreen = ({ onSelect }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 fade-in scale-in">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">New Order Entry</h1>
        <p className="text-lg text-slate-500">How much detail do you have right now?</p>
        <p className="mt-2 text-sm text-slate-400">You can switch between modes at any time — nothing is lost.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
      <button
        onClick={() => onSelect('quick')}
        className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">⚡</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Quick Entry</h2>
        <p className="text-center text-slate-500 text-sm">Get it on the calendar fast. Name, address, date — just the essentials.</p>
        <div className="mt-4 text-xs text-slate-400 text-center">Best for: sales reps, leads, partial info, mobile</div>
        <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Fast →</div>
      </button>
      <button
        onClick={() => onSelect('detailed')}
        className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border-2 border-sky-200 shadow-xl hover:shadow-2xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">Most Common</div>
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📝</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Detailed Entry</h2>
        <p className="text-center text-slate-500 text-sm">Guided workflow for the full order. Insurance, billing, conditions, contacts, scope — a complete interview.</p>
        <div className="mt-4 text-xs text-slate-400 text-center">Best for: office team, live conversations, computer</div>
        <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Detailed →</div>
      </button>
      <div className="flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl">
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl">📦</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Same Day Scope</h2>
        <p className="text-center text-slate-500 text-sm mb-2">Room-by-room scope for pack-out instructions or photo documentation.</p>
        <div className="mt-2 text-xs text-slate-400 text-center mb-5">Best for: on-site at the home, field work</div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => onSelect('same-day-scope')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition-all"
          >
            📝 Text-Based Scope
            <div className="text-[10px] font-normal text-slate-400 mt-0.5">Task lists, notes, and SDS document</div>
          </button>
          <button
            onClick={() => onSelect('photo-scope')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition-all"
          >
            📷 Photo-Based Scope
            <div className="text-[10px] font-normal text-slate-400 mt-0.5">Camera-first walkthrough with photo tagging</div>
          </button>
        </div>
      </div>
      </div>

      <button
        type="button"
        onClick={() => setShowGuidelines(v => !v)}
        className="mt-10 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
      >
        Usage guidelines {showGuidelines ? "▾" : "▸"}
      </button>
      {showGuidelines && (
        <div className="mt-4 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-sky-600">AI App Usage Guidelines</div>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_USAGE_GUIDELINES.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">Additional Time-Saving Tips</div>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_TIME_SAVING_TIPS.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- SEARCH COMPONENT ---
const GlobalSearch = ({ show, onClose, onNavigate, onSearchHit }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const resultRefs = useRef([]);

  useEffect(() => {
    if(show) {
      setQuery("");
      setActiveIndex(0);
      resultRefs.current = [];
      if (inputRef.current) inputRef.current.focus();
    }
  }, [show]);

  const searchableItems = [
    { id: 'sec1', label: 'Order Section', keywords: 'order section' },
    { id: 'sec1', sub: 'order', label: 'Order Name', keywords: 'order name autoname lastname townst' },
    { id: 'sec1', sub: 'order', label: 'Record Type', keywords: 'record type lead order' },
    { id: 'sec1', sub: 'order', label: 'Order Status', keywords: 'order status new in progress pickup complete' },
    { id: 'sec1', sub: 'order', label: 'Order Type', keywords: 'order type project type restoration non-restoration fire water mold dust debris puffback oil' },
    { id: 'sec1', sub: 'order', label: 'Non-Restoration Type', keywords: 'non-restoration commercial cleaning residential cleaning other' },
    { id: 'sec1', sub: 'order', label: 'Service Offerings', keywords: 'service offerings rugs furniture packout consulting storage tli appliance art textiles' },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Fire', keywords: 'fire smoke soot battery candle cooking electrical explosion fireplace flammables heating neighbor protein smoking wildfire', action: () => onSearchHit('Fire') },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Water', keywords: 'water leak roof window frozen pipe burst overflow storm', action: () => onSearchHit('Water') },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Mold', keywords: 'mold spores visible odor', action: () => onSearchHit('Mold') },
    { id: 'sec1', sub: 'order', label: 'Cause', keywords: 'cause origin' },
    { id: 'sec1', sub: 'order', label: 'Origin', keywords: 'origin location' },
    { id: 'sec1', sub: 'order', label: 'Severity', keywords: 'severity rejects' },
    { id: 'sec1', label: 'Interview', keywords: 'interview living staying temp moving repairs packout conditions', navAction: 'openInterview' },
    { id: 'sec1', sub: 'codes', label: 'Order Codes', keywords: 'handling severity quality box damp det detergent allergy wet ppe' },
    { id: 'sec1', sub: 'codes', label: 'Order Instructions', keywords: 'instructions tagging cleaning packing delivery communication scheduling pickup billing collections' },
    { id: 'sec1', sub: 'source', label: 'Source', keywords: 'source referral marketing internal method sales rep' },
    { id: 'sec1', sub: 'source', label: 'Referrer (Contact or Company)', keywords: 'referrer referring company contact' },
    { id: 'sec1', sub: 'source', label: 'Method', keywords: 'method call email form meeting text tpa' },
    { id: 'sec1', sub: 'source', label: 'Sales Rep', keywords: 'sales rep representative rep' },

    { id: 'sec1', label: 'Event Instructions', keywords: 'notes instructions event notes' },
    { id: 'sec2', label: 'Household', keywords: 'pets animals dog cat bird fish household children child baby infant elderly housekeeper caretaker tenant roommate', navAction: 'openPets' },
    { id: 'sec1', label: 'Special Considerations', keywords: 'elderly pregnancy baby hearing impaired respiratory premium brands skin sensitivity considerations allergy allergies soap detergent fragrance' },
    { id: 'sec1', label: 'Soap & Fragrance Allergies', keywords: 'soap fragrance allergy allergies detergent sensitive skin hypoallergenic det special' },
    { id: 'sec1', label: 'Conditions', keywords: 'still wet mold structural damage no electricity no heat boarded up conditions' },
    { id: 'sec1', label: 'Living Situation', keywords: 'living staying moving temp housing hotel displaced' },
    { id: 'sec1', label: 'Storage', keywords: 'storage long term months' },
    { id: 'sec2', label: 'Customer Section', keywords: 'customer section' },
    { id: 'sec2', label: 'Customer Type', keywords: 'customer type relationship' },
    { id: 'sec2', label: 'First Name', keywords: 'first name' },
    { id: 'sec2', label: 'Last Name', keywords: 'last name' },
    { id: 'sec2', label: 'Phone', keywords: 'phone mobile home office' },
    { id: 'sec2', label: 'Email', keywords: 'email' },
    { id: 'sec2', label: 'Preferred Contact Method', keywords: 'preferred contact method phone email text' },
    { id: 'sec2', label: 'Do Not Contact', keywords: 'do not contact warning' },
    { id: 'sec2', label: 'Send Welcome Text', keywords: 'welcome text brochure rush guide authorization cos google review' },
    { id: 'sec2', label: 'Customer Notes', keywords: 'notes quick notes' },

    { id: 'sec3', label: 'Address Section', keywords: 'address section' },
    { id: 'sec3', label: 'Find on Google', keywords: 'find on google address lookup' },
    { id: 'sec3', label: 'Street Address', keywords: 'street address' },
    { id: 'sec3', label: 'City', keywords: 'city' },
    { id: 'sec3', label: 'State', keywords: 'state' },
    { id: 'sec3', label: 'Zip', keywords: 'zip postal' },
    { id: 'sec3', label: 'Latitude', keywords: 'latitude lat' },
    { id: 'sec3', label: 'Longitude', keywords: 'longitude lng' },
    { id: 'sec3', label: 'Rent or Own', keywords: 'rent own coverage' },

    { id: 'sec4', label: 'Billing & Companies', keywords: 'billing companies section' },
    { id: 'sec4', sub: 'billing', label: 'Bill To', keywords: 'payer bill to insurance customer referrer public adjuster building contractor other' },
    { id: 'sec4', sub: 'billing', label: 'Billing Company', keywords: 'billing company' },
    { id: 'sec4', sub: 'billing', label: 'Billing Contact', keywords: 'billing contact' },
    { id: 'sec4', sub: 'billing', label: 'Billing Note', keywords: 'billing note' },
    { id: 'sec4', sub: 'insurance', label: 'Insurance Claim', keywords: 'insurance claim yes no' },
    { id: 'sec4', sub: 'insurance', label: 'Direction of Payment', keywords: 'direction of payment check credit card' },
    { id: 'sec4', sub: 'insurance', label: 'Insurance Company', keywords: 'insurance company carrier' },
    { id: 'sec4', sub: 'insurance', label: 'National Carrier', keywords: 'national carrier' },
    { id: 'sec4', sub: 'insurance', label: 'Adjuster', keywords: 'adjuster' },
    { id: 'sec4', sub: 'insurance', label: 'Claim #', keywords: 'claim # claim number' },
    { id: 'sec4', sub: 'insurance', label: 'Date of Loss', keywords: 'date of loss' },
    { id: 'sec4', sub: 'insurance', label: 'Policy #', keywords: 'policy number' },
    { id: 'sec4', sub: 'insurance', label: 'Order Specific Email', keywords: 'order specific email insurance email' },
    { id: 'sec4', sub: 'insurance', label: 'Contents Limit', keywords: 'contents limit coverage' },
    { id: 'sec4', sub: 'insurance', label: 'Mold Limit', keywords: 'mold limit coverage' },
    { id: 'sec4', sub: 'finance', label: 'Pricing Platform', keywords: 'pricing platform' },
    { id: 'sec4', sub: 'finance', label: 'Price List', keywords: 'price list' },
    { id: 'sec4', sub: 'finance', label: 'Price Multiplier', keywords: 'price multiplier' },
    { id: 'sec4', sub: 'finance', label: 'Estimate Requested', keywords: 'estimate requested' },
    { id: 'sec4', sub: 'companies', label: 'Companies & Contacts', keywords: 'companies contacts add company contact vendor' },
    { id: 'sec1', sub: 'codes', label: 'Order Instructions', keywords: 'order instructions company instructions contact instructions preferences paperwork' },
    { id: 'sec1', sub: 'codes', label: 'Add Order Instruction', keywords: 'add order instruction custom instruction' },

    { id: 'sec5', label: 'Schedule Section', keywords: 'schedule section' },
    { id: 'sec5', label: 'Schedule Type', keywords: 'scope pickup in-home' },
    { id: 'sec5', label: 'Date', keywords: 'schedule date' },
    { id: 'sec5', label: 'Time', keywords: 'schedule time' },
    { id: 'sec5', sub: 'bridge', label: 'Scope Update and Blockers', keywords: 'scope update blockers customer insurance adjuster pickup tag hold cod emergency groups' },
    { id: 'sec5', label: 'Event Instructions', keywords: 'instructions notes load list' },
    { id: 'sec5', label: 'Estimate Requested', keywords: 'estimate requested type' },
    { id: 'sec5', label: 'Requested By', keywords: 'estimate requested by' },
    { id: 'sec5', label: 'Meeting With', keywords: 'who are we meeting' },

    { id: 'quick', label: 'Quick Entry', keywords: 'quick fast entry load list' }
  ];

  const filtered = searchableItems.filter(s => 
    s.label.toLowerCase().includes(query.toLowerCase()) || 
    s.keywords.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!filtered.length) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex(prev => {
      if (prev < 0) return 0;
      if (prev >= filtered.length) return filtered.length - 1;
      return prev;
    });
  }, [filtered.length, query]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const item = resultRefs.current[activeIndex];
    if (item instanceof HTMLElement) {
      item.scrollIntoView({ block: "nearest", inline: "nearest" });
    } else if (listRef.current instanceof HTMLElement) {
      listRef.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeIndex, filtered.length]);

  if (!show) return null;

  const handleClose = () => {
    setQuery("");
    setActiveIndex(0);
    onClose();
  };

  const commitItem = (item) => {
    if (!item) return;
    if (item.action) item.action();
    onNavigate(item);
    handleClose();
  };

  const moveActive = (direction) => {
    if (!filtered.length) return;
    setActiveIndex(prev => {
      const base = prev < 0 ? 0 : prev;
      return (base + direction + filtered.length) % filtered.length;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-24 fade-in" onClick={handleClose}>
       <div className="w-full max-w-xl rounded-2xl bg-white/80 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-black/5 border border-white/40" onClick={e=>e.stopPropagation()}>
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 mb-3">
             <span className="text-slate-500 text-xl">🔍</span>
             <input 
               ref={inputRef}
                className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-slate-400 text-slate-800"
               placeholder="Search fields, sections..."
               value={query}
               onChange={e => {
                 setQuery(e.target.value);
                 setActiveIndex(0);
               }}
               onKeyDown={e => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    moveActive(1);
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    moveActive(-1);
                    return;
                  }
                  if (e.key === "Tab") {
                    if (filtered.length > 0) {
                      e.preventDefault();
                      moveActive(e.shiftKey ? -1 : 1);
                    }
                    return;
                  }
                  if (e.key === "Enter" && filtered.length > 0) {
                    e.preventDefault();
                    const idx = activeIndex >= 0 ? activeIndex : 0;
                    commitItem(filtered[idx]);
                    return;
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleClose();
                  }
               }}
               aria-activedescendant={activeIndex >= 0 ? `global-search-item-${activeIndex}` : undefined}
             />
             <span className="text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50">ESC</span>
          </div>
          <div ref={listRef} className="space-y-1 max-h-[400px] overflow-y-auto custom-scroll">
             {filtered.map((s, idx) => (
               <button 
                 key={idx}
                 id={`global-search-item-${idx}`}
                 ref={(el) => { resultRefs.current[idx] = el; }}
                 onMouseEnter={() => setActiveIndex(idx)}
                 onFocus={() => setActiveIndex(idx)}
                 onClick={() => commitItem(s)}
                 className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${idx === activeIndex ? 'bg-gradient-to-r from-sky-50 to-sky-50 border border-sky-100' : 'hover:bg-white/50 hover:shadow-sm'}`}
               >
                  <span className={`font-semibold ${idx === activeIndex ? 'text-sky-700' : 'text-slate-700'}`}>{s.label}</span>
                  {idx === activeIndex && <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider group-hover:text-sky-600">Hit Enter</span>}
               </button>
             ))}
             {filtered.length === 0 && <div className="text-center py-4 text-slate-500 text-sm">No results found.</div>}
          </div>
       </div>
    </div>
  );
};

// --- UNIFIED FLOATING HEADER (PROGRESS HEADER) ---
const Header = ({ activeSection, visitedSections, completedSections, onJump, onJumpSub, title, version, entryMode, setEntryMode, showInlineHelp, setShowInlineHelp, showCoaching, setShowCoaching, compactMode, setCompactMode, onShowSds, onReset, currentUser, setCurrentUser, setShowSampleDataModal, onOpenPresets, presetCount, onOpenFieldConfig, interviewPanelOpen, actionItemsOpen }) => {
    const steps = [
        { id: 'sec1', label: 'Order', subsections: [{ id: "order", label: "Order" }, { id: "source", label: "Source" }] },
        { id: 'sec2', label: 'Customer', subsections: [{ id: "customer", label: "Customer Details" }] },
        { id: 'sec3', label: 'Address', subsections: [{ id: "address", label: "Addresses" }] },
        { id: 'sec4', label: 'Billing', subsections: [{ id: "companies", label: "Companies and Contacts" }, { id: "billing", label: "Billing" }, { id: "finance", label: "Finance" }, { id: "insurance", label: "Insurance" }] },
        { id: 'sec5', label: 'Schedule', subsections: [{ id: "schedule", label: "Schedule" }, { id: "bridge", label: "Scope Update and Blockers" }] },
    ];

    const getStatus = (stepId) => {
        if (stepId === activeSection) return 'active';
        if (visitedSections.has(stepId)) {
          if (completedSections?.has(stepId)) return 'done';
          return 'visited';
        }
        return 'future';
    };

    const [showSettings, setShowSettings] = useState(false);
    const [openStepMenu, setOpenStepMenu] = useState("");
    const [touchLikeNav, setTouchLikeNav] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const media = window.matchMedia("(hover: none), (pointer: coarse)");
      const apply = () => setTouchLikeNav(!!media.matches);
      apply();
      if (media.addEventListener) {
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
      }
      media.addListener?.(apply);
      return () => media.removeListener?.(apply);
    }, []);

    useEffect(() => {
      const handleOutside = (event) => {
        if (!navRef.current) return;
        if (navRef.current.contains(event.target)) return;
        setOpenStepMenu("");
      };
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside, { passive: true });
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        document.removeEventListener("touchstart", handleOutside);
      };
    }, []);

    const openFirstSubsection = (step) => {
      const first = step?.subsections?.[0];
      if (first && onJumpSub) onJumpSub(step.id, first.id);
      else onJump(step.id);
      setOpenStepMenu("");
    };

    const handleStepClick = (step) => {
      const hasSubsections = !!step?.subsections?.length;
      onJump(step.id);
      if (!hasSubsections) {
        setOpenStepMenu("");
        return;
      }
      if (openStepMenu === step.id) {
        openFirstSubsection(step);
        return;
      }
      setOpenStepMenu(step.id);
    };

    const handleStepHoverIn = (step) => {
      if (touchLikeNav) return;
      if (step?.subsections?.length) setOpenStepMenu(step.id);
    };

    const handleStepHoverOut = (step) => {
      if (touchLikeNav) return;
      setOpenStepMenu(prev => prev === step.id ? "" : prev);
    };

    return (
        <header className="fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200 shadow-md shadow-slate-900/5" style={{ right: (interviewPanelOpen || actionItemsOpen) ? '480px' : '0', transition: 'right 0.2s ease' }}>
            <div className="max-w-6xl mx-auto px-4 pt-4 pb-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-[120px]">
                     <button onClick={() => setEntryMode('start')} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                        <span className="text-lg">←</span>
                     </button>
                     <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                           <h1 className="text-base font-bold text-slate-900 leading-none">{title}</h1>
                           <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
                             <button className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-white text-sky-700 shadow-sm">Order</button>
                             <button onClick={() => setEntryMode('same-day-scope')} className="rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Scope</button>
                             <button onClick={onShowSds} className="rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">SDS</button>
                           </div>
                         </div>
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{version}</span>
                     </div>
                </div>

                {entryMode === 'detailed' && (
                    <div className="flex-1 flex items-center justify-center max-w-xl">
                        <div ref={navRef} className="flex items-center w-full relative">
                             {steps.map((step, idx) => {
                                const status = getStatus(step.id);
                                const isLast = idx === steps.length - 1;
                                const hasSubsections = !!step.subsections?.length;
                                let circleClass = "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400";
                                if (status === 'active') circleClass = "bg-sky-500 border-sky-500 text-white shadow-md scale-110";
                                else if (status === 'done') circleClass = "bg-sky-50 border-2 border-sky-500 text-sky-700 shadow-sm";
                                else if (status === 'visited') circleClass = "bg-white border-2 border-sky-500 text-sky-600";

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className="flex-1 flex items-center relative last:flex-none">
                                            <div
                                              className="relative"
                                              onMouseEnter={() => handleStepHoverIn(step)}
                                              onMouseLeave={() => handleStepHoverOut(step)}
                                            >
                                              <button
                                                onClick={() => handleStepClick(step)}
                                                onDoubleClick={() => openFirstSubsection(step)}
                                                className="group flex flex-col items-center gap-1 focus:outline-none z-10 relative"
                                                title={hasSubsections ? "Click once for section menu, click again for first subsection" : "Go to section"}
                                              >
                                                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border ${circleClass}`}>
                                                      {status === 'done' ? '✓' : idx + 1}
                                                  </div>
                                                  <span className={`absolute top-9 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${status === 'active' ? 'text-sky-700 opacity-100' : status === 'done' ? 'text-sky-600 opacity-100 block' : 'text-slate-400 opacity-100 block'}`}>
                                                      {step.label}
                                                  </span>
                                              </button>
                                              {hasSubsections && openStepMenu === step.id && (
                                                <div className="absolute left-1/2 top-12 z-[70] w-52 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                                  <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">{step.label} sections</div>
                                                  <div className="max-h-56 overflow-y-auto custom-scroll space-y-1">
                                                    {step.subsections.map((sub, subIdx) => (
                                                      <button
                                                        key={`${step.id}-${sub.id}`}
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          if (onJumpSub) onJumpSub(step.id, sub.id);
                                                          else onJump(step.id);
                                                          setOpenStepMenu("");
                                                        }}
                                                        className="w-full rounded-lg border border-slate-100 px-2 py-1.5 text-left text-[11px] font-semibold text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                                      >
                                                        <span className="mr-1 text-[10px] text-slate-400">{subIdx + 1}.</span>
                                                        {sub.label}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                            {!isLast && (
                                                <div className="flex-1 h-[2px] bg-slate-200 mx-2 rounded relative overflow-hidden">
                                                    <div className={`absolute left-0 top-0 h-full bg-sky-500 transition-all duration-500`} style={{ width: status === 'visited' || status === 'done' || status === 'active' ? '100%' : '0%' }}></div>
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {entryMode !== 'detailed' && <div className="flex-1"></div>}

                <div className="min-w-[120px] flex justify-end gap-2 relative">
                    <button
                        onClick={() => setShowCoaching(v => !v)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all border ${showCoaching ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-400 hover:border-violet-300'}`}
                        title={showCoaching ? "Hide coaching prompts" : "Show coaching prompts"}
                    >
                        {showCoaching ? "🎓 Coaching" : "🎓"}
                    </button>
                    <button
                        onClick={() => setShowSettings(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    >
                        <span>Settings ⚙︎</span>
                    </button>
                    {showSettings && (
                        <div className="absolute right-0 top-10 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
                            <button
                                onClick={() => setShowCoaching(!showCoaching)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${showCoaching ? 'bg-violet-50 text-violet-600' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <span>🎓 Coaching</span>
                                <span>{showCoaching ? 'On' : 'Off'}</span>
                            </button>
                            <button
                                onClick={() => setCompactMode(!compactMode)}
                                className={`w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${compactMode ? 'bg-rose-50 text-rose-600' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <span>Density</span>
                                <span>{compactMode ? 'Compact' : 'Comfortable'}</span>
                            </button>
                            <button
                                onClick={onReset}
                                className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-rose-50 text-rose-600"
                            >
                                <span>Clear Data</span>
                                <span>↺</span>
                            </button>
                            <button
                                onClick={() => setShowSampleDataModal?.(true)}
                                className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600"
                            >
                                <span>Sample Data</span>
                                <span>▤</span>
                            </button>
                            <button
                                onClick={onOpenPresets}
                                className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600"
                            >
                                <span>Test Data Presets</span>
                                <span>{presetCount ? `(${presetCount})` : "▤"}</span>
                            </button>
                            <button
                                onClick={onOpenFieldConfig}
                                className="w-full mt-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 text-slate-600"
                            >
                                <span>Field Configuration</span>
                                <span>⚙</span>
                            </button>
                            <div className="mt-2 px-3 py-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Current User</label>
                                <Input value={currentUser || ""} onChange={e=>setCurrentUser(e.target.value)} placeholder="Name" className="mt-1 !py-1.5 !text-xs" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

// --- FLOATING CAPSULE BAR (Bottom) ---
const FloatingCapsule = ({ entryMode, setEntryMode, onSave, setShowSearch, onInterview, interviewPanelOpen, onActionItems, actionItemsOpen, actionItemCount, modeButtonFlash }) => {
    return (
        <div className="fixed bottom-4 sm:bottom-8 left-0 z-50 flex justify-center pointer-events-none fade-in" style={{ right: (interviewPanelOpen || actionItemsOpen) ? '480px' : '0', paddingBottom: "env(safe-area-inset-bottom)", transition: 'right 0.2s ease' }}>
            <div className="pointer-events-auto bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.15)] shadow-slate-700/30 rounded-full flex items-center p-1.5 gap-1 sm:gap-2 px-2 sm:px-3">

                <button data-noe-action="search" onClick={() => setShowSearch(true)} className="flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 bg-slate-50">
                    <span className="text-base">🔍</span>
                    <span className="text-xs sm:text-sm font-bold hidden sm:inline">Search</span>
                </button>

                <button
                    data-noe-action="interview"
                    onClick={onInterview}
                    className={`flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all ${interviewPanelOpen ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'hover:bg-violet-50 text-slate-600 hover:text-violet-600 bg-slate-50'}`}
                >
                    <span className="text-base">🎤</span>
                    <span className="text-xs sm:text-sm font-bold">Interview</span>
                </button>

                <button
                    data-noe-action="action-items"
                    onClick={onActionItems}
                    className="flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all hover:bg-amber-50 text-slate-600 hover:text-amber-600 bg-slate-50 relative"
                >
                    <span className="text-base">⚡</span>
                    <span className="text-xs sm:text-sm font-bold">Action Items</span>
                    {actionItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">{actionItemCount}</span>
                    )}
                </button>

                <button
                    data-noe-action="toggle-mode"
                    data-noe-current-mode={entryMode}
                    onClick={() => setEntryMode(entryMode === 'quick' ? 'detailed' : 'quick')}
                    className={`flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 bg-slate-50 ${modeButtonFlash ? 'animate-nav-focus ring-2 ring-sky-400' : ''}`}
                >
                    <span className="text-base">{entryMode === 'quick' ? '📝' : '⚡'}</span>
                    <span className="text-xs sm:text-sm font-bold">{entryMode === 'quick' ? 'Detailed' : 'Quick'}</span>
                </button>

                <button data-noe-action="save" onClick={onSave} className="flex items-center justify-center h-10 px-4 sm:px-6 gap-1.5 rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all">
                    <span className="text-base">💾</span>
                    <span className="text-xs sm:text-sm font-bold">Save</span>
                </button>

            </div>
        </div>
    );
};


const Section = ({ id, title, helpText, isOpen, onToggle, onHeaderClick, onCaretClick, children, badges, className, compact, noeSection }) => {
  const handleHeaderClick = () => {
    if (onHeaderClick) {
      onHeaderClick();
      return;
    }
    onToggle?.();
  };
  const handleCaretClick = () => {
    if (onCaretClick) {
      onCaretClick();
      return;
    }
    onToggle?.();
  };
  return (
    <div id={id} data-noe-section={noeSection || id || undefined} data-noe-open={isOpen} className={`mb-0 overflow-hidden rounded-none border-y border-slate-200 bg-white shadow-sm transition-shadow duration-300 scroll-mt-28 sm:mb-4 sm:rounded-xl sm:border ${isOpen ? 'ring-1 ring-sky-500/20 shadow-md' : ''} ${className||""}`}>
      <div
        className={`flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 text-left font-semibold text-slate-800 transition-colors cursor-pointer ${compact ? "section-header-tight" : ""} ${isOpen ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50"}`}
        onClick={handleHeaderClick}
      >
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center text-left"
          onClick={(e) => {
            e.stopPropagation();
            handleHeaderClick();
          }}
          aria-expanded={isOpen}
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${isOpen ? "text-slate-900" : "text-slate-700"}`}>{title}</span>
              {badges}
            </div>
            {helpText && <div className="mt-1 text-[11px] text-slate-500">{helpText}</div>}
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCaretClick();
          }}
          className="ml-2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-sky-700"
          aria-label={isOpen ? "Collapse section" : "Expand section"}
        >
          <Chevron open={isOpen} />
        </button>
      </div>
      {isOpen && <div className={`border-t border-slate-100 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} fade-in`}>{children}</div>}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const CustomerItem = memo(({ c, index, total, updateCust, onRemove, highlightMissing, auditOn, onAddHousehold, onSendWelcome, contacts, sdsConsiderations = [], householdAnimals = "", onUpdatePets, household = [] }) => {
  const toggleList = (list, value) => list.includes(value) ? list.filter(v=>v!==value) : [...list, value];
  const customerDisplayName = [c.first, c.last].filter(hasMeaningfulValue).join(" ").trim();
  const [open, setOpen] = useState(!customerDisplayName);
  useEffect(() => {
    if (c._forceOpen) {
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
    }
  }, [c._forceOpen]);
  const customerPlaceholder = isPlaceholderFlagActive(c.placeholder);
  const customerRoleLabel = hasMeaningfulValue(c.type) ? c.type : (c.isPrimary ? "Primary" : "Relationship");
  const hasMobile = (c.phone || "").replace(/[^\d]/g, "").length >= 10;
  const canSendWelcome = hasMobile && !c.doNotContact;
  const toggleQuickNote = (noteLabel) => {
    const has = (c.quickNotes || []).includes(noteLabel);
    const nextNotes = toggleList(c.quickNotes || [], noteLabel);
    const existingQuick = (c.quickNotes || []).join(" • ");
    const base = (c.note || "").split("\n").filter(l => l.trim() && l.trim() !== existingQuick).join("\n").trim();
    const line = nextNotes.length ? nextNotes.join(" • ") : "";
    const nextNoteText = [base, line].filter(Boolean).join("\n");
    updateCust(c.id, { quickNotes: nextNotes, note: nextNoteText });
  };
  const hasContact = hasMeaningfulValue(c.phone) || hasMeaningfulValue(c.email);
  const isIncomplete = customerPlaceholder || !hasMeaningfulValue(c.last) || (hasMeaningfulValue(c.first) && !hasContact);
  const getPetIcon = (text) => {
    const t = (text || "").toLowerCase();
    if (/\bdog\b|puppy|pup\b|golden|lab\b|shepherd|poodle|terrier|bulldog|beagle|husky|shih\s*tzu|chihuahua|dachshund|corgi|pitbull|rottweiler/.test(t)) return "🐕";
    if (/\bcat\b|kitten|kitty|feline|tabby|persian|siamese|maine coon/.test(t)) return "🐈";
    if (/\bbird\b|parrot|parakeet|cockatiel|canary|finch/.test(t)) return "🐦";
    if (/\bfish\b|aquarium|tank/.test(t)) return "🐟";
    if (/\brabbit\b|bunny/.test(t)) return "🐇";
    if (/\bhamster|guinea|gerbil/.test(t)) return "🐹";
    if (/\bsnake|lizard|reptile|gecko|iguana|turtle|tortoise/.test(t)) return "🐍";
    if (/\bhorse|pony/.test(t)) return "🐴";
    return "🐕";
  };
  return (
    <div
      data-audit-key={customerPlaceholder ? `placeholder-customer-${c.id}` : undefined}
      data-customer-id={c.id}
      className={`group relative rounded-lg sm:rounded-xl border ${open ? 'p-3 sm:p-5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} shadow-sm transition-all hover:shadow-md ${isIncomplete ? "placeholder-shell" : customerPlaceholder ? "placeholder-shell" : c.isPrimary ? "border-sky-300 bg-white" : "border-slate-200 bg-white hover:border-sky-300"}`}
    >
      {c.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && !c._showMenu && ( <button onClick={() => { if (!hasMeaningfulValue(c.first) && !hasMeaningfulValue(c.last) && !hasMeaningfulValue(c.phone) && !hasMeaningfulValue(c.email)) { onRemove(c.id, index); } else { updateCust(c.id, { _showMenu: true }); } }} className={`absolute ${open ? 'right-3 top-3 h-7 w-7' : 'right-2 top-2 h-5 w-5 text-xs'} grid place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors`}>×</button> )}
      {c._showMenu && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => updateCust(c.id, { _showMenu: false })}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-800">{customerDisplayName || "Customer"}</div>
              <div className="text-xs text-slate-500">{c.type || "No type set"}</div>
            </div>
            <div className="p-3 space-y-1">
              <button onClick={() => updateCust(c.id, { _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => updateCust(c.id, { inactive: true, _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50">Make Inactive</button>
              <button onClick={() => { onRemove(c.id, index); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
            </div>
          </div>
        </div>
      )}
      
      <div
        className={`${open ? 'mb-4' : 'mb-0'} flex cursor-pointer flex-col gap-2 pl-1 sm:pl-2 sm:flex-row sm:items-center sm:justify-between`}
        onClick={(e) => {
          if (isHeaderToggleIgnoredTarget(e.target)) return;
          setOpen(v => !v);
        }}
      >
	         <div className="flex items-center gap-2">
	            <button
	              type="button"
	              onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
	              className="text-slate-400 hover:text-slate-600"
	              title={open ? "Collapse" : "Expand"}
	            >
              <Chevron open={open} />
            </button>
	            <div className={`flex items-center justify-center rounded-full bg-sky-100 font-bold text-sky-600 ${open ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-[10px]'}`}>{index + 1}</div>
	            <div className="flex flex-col">
	              <span className={`text-sm font-semibold ${customerDisplayName ? "text-slate-800" : (customerPlaceholder ? "placeholder-text" : "text-slate-800")}`}>{customerDisplayName || "Customer"}</span>
	              <span className={`text-[10px] ${customerPlaceholder ? "placeholder-text" : "text-slate-500"}`}>{customerRoleLabel}</span>
	            </div>
              {customerPlaceholder && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>
              )}
              {c.doNotContact && <span className="rounded-full bg-rose-100 border border-rose-300 px-2 py-0.5 text-[10px] font-bold text-rose-700">Do Not Contact</span>}
              {c.contactViaRep && <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">Via Rep</span>}
	         </div>
	         <div className="flex flex-wrap gap-1.5">
	            <ToggleMulti className={`${open ? '!py-1 !px-3' : '!py-0.5 !px-2'} !text-[10px]`} label="Primary" title={ROLE_COACHING["Primary"]} checked={!!c.isPrimary} onChange={()=>updateCust(c.id, { isPrimary: !c.isPrimary })} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} />
            <ToggleMulti className={`${open ? '!py-1 !px-2 sm:!px-3' : '!py-0.5 !px-2'} !text-[10px]`} label="Policy Holder" title={ROLE_COACHING["Policyholder"]} checked={!!c.policyHolder} onChange={()=>updateCust(c.id, { policyHolder: !c.policyHolder })} />
            <ToggleMulti className={`${open ? '!py-1 !px-2 sm:!px-3' : '!py-0.5 !px-2'} !text-[10px]`} label="Self Pay" checked={!!c.selfPay} onChange={()=>updateCust(c.id, { selfPay: !c.selfPay })} />
         </div>
      </div>

      {open && (
      <div className="grid gap-4 pl-1 sm:pl-2">
         {/* PRIMARY FIELDS — always visible */}
         <div className="grid grid-cols-5 gap-3">
           <div className="col-span-1">
             <Field label="Type">
               <SearchSelect value={c.type || ""} onChange={(v)=>updateCust(c.id,{type:v})} options={CUSTOMER_TYPES} placeholder="Type..." maxResults={CUSTOMER_TYPES.length} />
             </Field>
           </div>
           <div className="col-span-2 sm:col-span-1">
             <Field label="First Name"><Input data-audit-key="custFirst" className={index===0 && auditOn && highlightMissing?.custFirst ? "audit-missing" : ""} value={c.first} onChange={e=>updateCust(c.id,{first:e.target.value})} /></Field>
           </div>
           <div className="col-span-2 sm:col-span-1">
             <Field label="Last Name"><Input data-audit-key="custLast" className={hasMeaningfulValue(c.first) && !hasMeaningfulValue(c.last) ? "attention-outline" : ""} value={c.last} onChange={e=>updateCust(c.id,{last:e.target.value})} /></Field>
           </div>
           <div className="col-span-2 sm:col-span-1">
             <Field label="Phone"><Input data-audit-key="custPhone" type="tel" value={c.phone} onChange={e=>updateCust(c.id,{phone: formatPhoneNumber(e.target.value)})} maxLength={14} placeholder="(555) 123-4567" /></Field>
           </div>
           <div className="col-span-3 sm:col-span-1">
             <Field label="Email"><Input data-audit-key="custEmail" type="email" value={c.email} onChange={e=>updateCust(c.id,{email:e.target.value})} placeholder="email@example.com" /></Field>
           </div>
         </div>

         {/* Preferred contact — compact inline */}
         <div className="flex items-center gap-2 flex-wrap">
           <span className="text-[10px] font-bold text-slate-400 uppercase">Preferred method:</span>
           {["Phone", "Email", "Text"].map(m => (
             <ToggleMulti key={m} label={m} checked={c.preferredContact === m} onChange={() => {
               updateCust(c.id, { preferredContact: c.preferredContact === m ? "" : m, doNotContact: false, contactViaRep: false });
             }} className="!text-[10px] !px-2 !py-1" />
           ))}
           <span className="w-px h-4 bg-slate-200 mx-0.5" />
           <ToggleMulti label="Contact via Rep" checked={!!c.contactViaRep} onChange={() => updateCust(c.id, { contactViaRep: !c.contactViaRep, doNotContact: false, preferredContact: "" })} className="!text-[10px] !px-2 !py-1" colorClass="!bg-amber-50 !border-amber-300 !text-amber-700" />
           <ToggleMulti label="Do Not Contact" checked={!!c.doNotContact} onChange={() => updateCust(c.id, { doNotContact: !c.doNotContact, contactViaRep: false, preferredContact: "" })} className="!text-[10px] !px-2 !py-1" colorClass="!bg-rose-50 !border-rose-300 !text-rose-700" />
         </div>
         {c.contactViaRep && (
           <div className="text-[10px] text-amber-600 pl-1">All communication for this contact should go through their representative.</div>
         )}
         {c.doNotContact && (
           <div className="text-[10px] text-rose-600 pl-1">This person is flagged as Do Not Contact — the system will block outreach.</div>
         )}

         {/* SECONDARY — compact action buttons */}
         <div className="flex items-center gap-2 flex-wrap">
           <button
             type="button"
             onClick={() => updateCust(c.id, { showWelcomePanel: !c.showWelcomePanel })}
             className={`rounded-full border px-3 py-1 text-[10px] font-bold ${c.showWelcomePanel ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}
           >
             📱 Send Welcome Text
           </button>
           <button
             type="button"
             onClick={() => updateCust(c.id, { showQuickNotes: !c.showQuickNotes })}
             className={`rounded-full border px-3 py-1 text-[10px] font-bold ${c.showQuickNotes ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}
           >
             📝 Add Note
           </button>
         </div>

         {/* Welcome text — expanded only when clicked */}
         {c.showWelcomePanel && (
           <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
               <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendBrochure} onChange={e=>updateCust(c.id,{sendBrochure:e.target.checked})} /> Brochure</label>
               <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendRushGuide} onChange={e=>updateCust(c.id,{sendRushGuide:e.target.checked})} /> Rush Guide</label>
               <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendAuthLink} onChange={e=>updateCust(c.id,{sendAuthLink:e.target.checked})} /> Auth Form</label>
               <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendCosLink} onChange={e=>updateCust(c.id,{sendCosLink:e.target.checked})} /> COS Link</label>
               <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendGoogleReviewLink} onChange={e=>updateCust(c.id,{sendGoogleReviewLink:e.target.checked})} /> Google Review</label>
             </div>
             <div className="flex items-center justify-between">
               {!hasMobile && <span className="text-[10px] text-amber-600">Add mobile # to send</span>}
               {c.doNotContact && <span className="text-[10px] text-rose-600">Do Not Contact enabled</span>}
               <button onClick={() => onSendWelcome?.(c.id)} disabled={!canSendWelcome} className={`rounded-full px-3 py-1 text-[10px] font-bold ${canSendWelcome ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Send</button>
             </div>
           </div>
         )}

         {/* Notes — expanded only when clicked */}
         {c.showQuickNotes && (
           <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
             <div className="flex flex-wrap gap-1.5">
               {CUSTOMER_QUICK_NOTES.map(n => (
                 <ToggleMulti key={n} label={n} checked={(c.quickNotes || []).includes(n)} onChange={() => toggleQuickNote(n)} className="!text-[10px] !px-2 !py-1" />
               ))}
             </div>
             <Input value={c.note} onChange={e => updateCust(c.id, { note: e.target.value })} placeholder="Additional notes..." />
           </div>
         )}


         <div className="flex justify-end">
           <button
             type="button"
             onClick={() => setOpen(false)}
             className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
           >
             Done
           </button>
         </div>

      </div>
      )}
    </div>
  );
});

const AddressItem = memo(({ addr, total, updateAddr, onRemove, highlightMissing, index, onVerify, auditOn, rentOrOwn, rentCoverageLimit, onRentOrOwnChange, onRentCoverageChange, forceShowCoords, autoOpenForTypePrompt, autoFocusTypePrompt, onTypePromptFocused }) => {
  const [coordsOpen, setCoordsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTimeout(() => {
        const card = document.querySelector(`[data-address-item-id="${addr.id}"]`);
        if (!card) return;
        const wrapper = card.querySelector('.google-address-search');
        const searchInput = wrapper?.querySelector('input');
        if (searchInput) {
          searchInput.focus();
          searchInput.style.borderColor = "#0ea5e9";
          searchInput.style.outline = "none";
          searchInput.style.boxShadow = "none";
          setTimeout(() => { searchInput.style.borderColor = ""; }, 2500);
        }
      }, 150);
    }
    prevOpenRef.current = open;
  }, [open]);
  useEffect(() => {
    if (addr._forceOpen) {
      setOpen(true);
      updateAddr(addr.id, { _forceOpen: false });
    }
  }, [addr._forceOpen]);
  const typeSelectRef = useRef(null);
  const placeholder = isAddressPlaceholder(addr);
  useEffect(() => {
    if (forceShowCoords) setCoordsOpen(true);
  }, [forceShowCoords]);
  useEffect(() => {
    if (autoOpenForTypePrompt) setOpen(true);
  }, [autoOpenForTypePrompt]);
  useEffect(() => {
    if (!autoFocusTypePrompt) return;
    if (!open) {
      setOpen(true);
      return;
    }
    const timer = window.setTimeout(() => {
      const el = typeSelectRef.current;
      if (el instanceof HTMLElement) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      onTypePromptFocused?.(addr.id);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [autoFocusTypePrompt, open, onTypePromptFocused, addr.id]);
  const verified = !!addr.lat && !!addr.lng;
  return (
    <div
      data-address-item-id={addr.id}
      data-audit-key={placeholder ? `placeholder-address-${addr.id}` : undefined}
      className={`group relative overflow-hidden rounded-lg sm:rounded-xl border ${open ? 'p-3 sm:p-5' : 'px-3 py-2 sm:px-4 sm:py-2.5'} shadow-sm transition-all hover:shadow-md ${addr.inactive ? "bg-slate-50 opacity-60 border-slate-200" : placeholder ? "placeholder-shell bg-white" : addr.isPrimary ? "bg-white border-sky-400 ring-1 ring-sky-50" : "bg-white border-slate-200"}`}
    >
      {addr.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && !addr.inactive && (
        <button
          onClick={() => updateAddr(addr.id, { _showMenu: true })}
          className={`absolute ${open ? 'right-3 top-3 h-7 w-7' : 'right-2 top-2 h-5 w-5 text-xs'} grid place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors`}
          title="Remove or deactivate address"
        >×</button>
      )}
      {addr._showMenu && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => updateAddr(addr.id, { _showMenu: false })}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-800">{addr.type || "Address"}</div>
              <div className="text-xs text-slate-500">{summarizeAddress(addr)}</div>
            </div>
            <div className="p-3 space-y-1">
              <button onClick={() => updateAddr(addr.id, { _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              {hasMeaningfulValue(addr.street) && (
                <button onClick={() => updateAddr(addr.id, { inactive: true, isPrimary: false, isLossSite: false, _showMenu: false })} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50">Make Inactive</button>
              )}
              <button onClick={() => { if (hasMeaningfulValue(addr.street) ? window.confirm("Permanently delete this address?") : true) onRemove(addr.id); else updateAddr(addr.id, { _showMenu: false }); }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
            </div>
          </div>
        </div>
      )}
      {addr.inactive && (
        <button
          onClick={() => updateAddr(addr.id, { inactive: false })}
          className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-sky-600 hover:bg-sky-50"
          title="Reactivate this address"
        >Reactivate</button>
      )}
      <div
        className="pl-1 sm:pl-2 flex items-center gap-2 cursor-pointer"
        onClick={(e) => {
          if (isHeaderToggleIgnoredTarget(e.target)) return;
          setOpen(v => !v);
        }}
      >
         <button
           type="button"
           onClick={(e) => {
             e.stopPropagation();
             setOpen(v => !v);
           }}
           className="text-slate-400 hover:text-slate-600"
           title={open ? "Collapse" : "Expand"}
         >
           <Chevron open={open} />
         </button>
         <div className="flex flex-col min-w-0">
           <div className="flex items-center gap-2">
             <span className={`${open ? 'text-base' : 'text-sm'} font-bold truncate ${placeholder ? "placeholder-text" : "text-slate-800"}`}>{addr.type || "Address"}</span>
             {verified
               ? <span title="This address was found and confirmed via Google Maps." className="rounded-full bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 cursor-help shrink-0">✓</span>
               : null
             }
           </div>
           <span className="text-xs text-slate-500 truncate">{summarizeAddress(addr)}</span>
         </div>
         <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
           {addr.inactive && <span className="rounded-full bg-slate-200 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-500">Inactive</span>}
           {placeholder && !addr.inactive && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>}
           <button type="button" onClick={() => updateAddr(addr.id, { isPrimary: !addr.isPrimary })} className={`rounded-full ${open ? 'px-2 py-0.5' : 'px-1.5 py-0.5'} text-[10px] font-bold border ${addr.isPrimary ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-white border-slate-200 text-slate-400 hover:border-sky-300'}`}>Primary</button>
           {(addr.isPrimary || addr.isLossSite || open) && (
             <button type="button" onClick={() => updateAddr(addr.id, { isLossSite: !addr.isLossSite })} className={`rounded-full ${open ? 'px-2 py-0.5' : 'px-1.5 py-0.5'} text-[10px] font-bold border ${addr.isLossSite ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-300'}`}>Loss Site</button>
           )}
         </div>
      </div>
      {open && (
      <div className="space-y-4 pl-1 sm:pl-2 mt-3">
        {/* Core Address — always visible */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          {/* Google search inside the address card */}
          {(() => {
            const DEMO_RESULTS = [
              { street: "148 Amsterdam Ave", city: "Hawthorne", state: "NY", zip: "10532", display: "148 Amsterdam Ave, Hawthorne, NY 10532" },
              { street: "25 Main St", city: "Bloomingdale", state: "NJ", zip: "07403", display: "25 Main St, Bloomingdale, NJ 07403" },
              { street: "1616 Springfield Ave", city: "Pennsauken", state: "NJ", zip: "08110", display: "1616 Springfield Ave, Pennsauken, NJ 08110" },
              { street: "17 Wausau St", city: "Ogdensburg", state: "NJ", zip: "07439", display: "17 Wausau St, Ogdensburg, NJ 07439" },
              { street: "42 Park Ave", apt: "4B", city: "New York", state: "NY", zip: "10016", display: "42 Park Ave #4B, New York, NY 10016" },
            ];
            return (
              <SearchSelect
                value=""
                onChange={v => {
                  const match = DEMO_RESULTS.find(r => r.display === v);
                  if (match) updateAddr(addr.id, { street: match.street, apt: match.apt || "", city: match.city, state: match.state, zip: match.zip, lat: "40.0", lng: "-74.0" });
                }}
                options={DEMO_RESULTS.map(r => ({ label: r.display, value: r.display, type: "address" }))}
                placeholder="🔍  Find address on Google..."
                clearOnCommit
                maxResults={5}
                autoComplete="off"
                className="google-address-search !border-sky-300 !rounded-lg !py-3 !shadow-none !ring-0"
              />
            );
          })()}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3"><Field label="Street"><Input data-audit-key="addrStreet" className={index===0 && auditOn && highlightMissing?.addrStreet ? "audit-missing" : ""} value={addr.street} onChange={e=>updateAddr(addr.id,{street:e.target.value})} /></Field></div>
            <div className="col-span-1"><Field label="Apt / Unit"><Input value={addr.apt} onChange={e=>updateAddr(addr.id,{apt:e.target.value})} placeholder="Apt #" /></Field></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City"><Input data-audit-key="addrCity" className={index===0 && auditOn && highlightMissing?.addrCity ? "audit-missing" : ""} value={addr.city} onChange={e=>updateAddr(addr.id,{city:e.target.value})} /></Field>
            <Field label="State">
              <SearchSelect value={addr.state} onChange={(v)=>updateAddr(addr.id,{state:v})} options={STATES} placeholder="State" className={index===0 && auditOn && highlightMissing?.addrState ? "audit-missing" : ""} maxResults={STATES.length} uppercase />
            </Field>
            <Field label="Zip"><Input data-audit-key="addrZip" className={index===0 && auditOn && highlightMissing?.addrZip ? "audit-missing" : ""} value={addr.zip} onChange={e=>updateAddr(addr.id,{zip:e.target.value})} inputMode="numeric" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Address Type">
              <Select ref={typeSelectRef} value={addr.type || ""} onChange={e=>updateAddr(addr.id,{type:e.target.value})}>
                <option value="">Select type...</option>
                {["House","Apartment","Garden Apartment","Row House","Neighbor","Hotel","Moving","Relative","Rental","Other Home","Temp","Work","Other"].map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Address Note">
              <Input value={addr.note || ""} onChange={e=>updateAddr(addr.id,{note:e.target.value})} placeholder="e.g. Long driveway on left, gate code 1234" />
            </Field>
          </div>
        </div>

        {/* Property Details — collapsible */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <button type="button" onClick={() => setCoordsOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Details</span>
            <span className={`text-slate-400 text-xs transition-transform ${coordsOpen ? "rotate-90" : ""}`}>›</span>
          </button>
          {coordsOpen && (
            <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${verified ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-sm text-slate-700">{verified ? "Address verified" : "Verify address"}</span>
                </div>
                <button onClick={() => onVerify?.(addr.id)} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Verify</button>
              </div>
              {index === 0 && (<><span data-audit-key="addrLat" className="block h-[1px] w-[1px] opacity-0" /><span data-audit-key="addrLng" className="block h-[1px] w-[1px] opacity-0" /></>)}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude"><Input className={index===0 && auditOn && highlightMissing?.addrLat ? "audit-missing" : ""} value={addr.lat} onChange={e=>updateAddr(addr.id,{lat:e.target.value})} placeholder="e.g. 40.8874" /></Field>
                <Field label="Longitude"><Input className={index===0 && auditOn && highlightMissing?.addrLng ? "audit-missing" : ""} value={addr.lng} onChange={e=>updateAddr(addr.id,{lng:e.target.value})} placeholder="e.g. -74.0291" /></Field>
              </div>
              {index === 0 && (
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                  <span className="text-sm text-slate-700">Rent or own?</span>
                  <ToggleGroup options={["Rent","Own"]} value={rentOrOwn} onChange={onRentOrOwnChange} />
                </div>
              )}
              {index === 0 && rentOrOwn === "Rent" && (
                <div className="rounded-lg border border-orange-300 bg-orange-50 p-3">
                  <div className="text-sm font-bold text-orange-800 mb-2">Confirm Coverage</div>
                  <Input data-audit-key="rentCoverageLimit" className={auditOn && highlightMissing?.rentCoverageLimit ? "audit-missing" : ""} value={rentCoverageLimit || ""} onChange={e=>onRentCoverageChange(e.target.value)} placeholder="Coverage amount ($)" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
          >
            Done
          </button>
        </div>
      </div>
      )}
    </div>
  );
});

// --- QUICK ENTRY COMPONENT ---
const QuickEntry = ({ data, update, updateMany, updateAddr, updateCust, companies, setModal, toggleMulti, handleConfirmClick, setToast, showInlineHelp, auditOn, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, quickQuestionsCollapsed, setQuickQuestionsCollapsed, compactMode, recordTypeLabel, getSalesRepForContact, onOpenCrmLog, onOpenReminder, knownPeople, onSetNowDate, onSetNowTime, dateCloseSignal, timeCloseSignal, onPromptRoleAssignment, toggleNonRestorationPrimary, toggleRestorationType, selectNonRestorationSubtype, onSwitchToDetailed }) => {
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

    const QUICK_COMPANY_TYPES = ["Insurance", "TPA", "Restoration Company", "Moving", "Public Adjusting", "Independent Adjusting", "Contractor", "Hygienist", "Art", "Other"];

    const quickAddedCompanies = data.vendors || [];
    const dateRef = useRef(null);
    const timeRef = useRef(null);
    const noteInputRef = useRef(null);
    const primaryAddr = data.addresses && data.addresses.length > 0 ? data.addresses[0] : {};
    const conditionSummary = [
      (data.damageWasWet === "Y" || data.damageWasWet === true) ? "Still Wet" : "",
      data.damageMoldMildew ? "Visible Mold" : "",
      data.structuralElectricDamage === "Y" ? "Structural Damage" : "",
      data.noLights ? "No Electricity" : "",
      data.noHeat ? "No Heat" : "",
      data.boardedUp ? "Boarded Up" : ""
    ].filter(Boolean).join(", ");
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
        <div className="space-y-6 fade-in pt-4">
            {showInlineHelp && (
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
            <div id="quick-questions" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28">
              <div className="mb-4">
                <input
                  value={data.orderName || ""}
                  onChange={e => updateMany({ orderName: e.target.value, orderNameAuto: !e.target.value.trim() })}
                  placeholder={`${recordWord} Name (e.g. Baker-PennsaukenNJ)`}
                  className="w-full text-lg font-bold text-sky-700 border-none outline-none bg-transparent placeholder:text-slate-300 placeholder:font-normal"
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
                    {showInlineHelp && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      {data.isLead === true
                        ? "A Lead requires selling the customer and getting approvals from the adjuster before we proceed. No billable charges yet — just an opportunity we will pursue."
                        : data.isLead === false
                          ? "An Order is a confirmed project ready to be scheduled and worked."
                          : "Select one to continue."}
                    </div>
                    )}
                  </Field>
                  <div className="border-t border-slate-100 pt-4">
                    <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={onApplyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={onOpenCrmLog} onPromptRoleAssignment={onPromptRoleAssignment} onAddNewToSystem={(info) => {
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
                        🎓 <span className="font-bold">Loss Type:</span> Pick the primary peril — what happened first. Example: kitchen fire put out with water = Fire primary, Water secondary.
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
                      <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700 mt-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">{data.primaryLossType}:</span> {LOSS_TYPE_COACHING[data.primaryLossType]}
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
                          />
                        ))}
                      </div>
                      {showInlineHelp && <div className="text-[11px] text-slate-400 mt-1">e.g. Fire with water damage from firefighting, or water loss leading to mold.</div>}
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
                             </div>
                        </Field>
                    </div>
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
                    <Input value={data.eventAssignee} onChange={e=>update("eventAssignee", e.target.value)} placeholder="Assignee" />
                  </Field>
                  <Field label="Vehicle">
                    <Input value={data.eventVehicle} onChange={e=>update("eventVehicle", e.target.value)} placeholder="Vehicle (optional)" />
                  </Field>
                </div>
                {data.pickupTime === '12:00 AM' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 font-semibold">
                    TBD — on the calendar but time not yet confirmed.
                  </div>
                )}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="text-sm font-bold text-slate-700 mb-1">Event Instructions</div>
                  {showInlineHelp && <p className="text-xs text-slate-400 mb-2">What the field team needs to know — conditions, access, customer preferences, what to bring.</p>}
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
                      <ToggleMulti label="Already contacted" checked={data.contactAssignment === "done"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "done" ? "" : "done" })} className="!text-[10px] !px-2.5 !py-1" />
                      <ToggleMulti label="Rep will contact" checked={data.contactAssignment === "rep"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "rep" ? "" : "rep" })} className="!text-[10px] !px-2.5 !py-1" />
                      <ToggleMulti label="Office please contact" checked={data.contactAssignment === "office"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "office" ? "" : "office" })} className="!text-[10px] !px-2.5 !py-1" />
                      <ToggleMulti label="Enter only — do not contact" checked={data.contactAssignment === "enter-only"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "enter-only" ? "" : "enter-only" })} className="!text-[10px] !px-2.5 !py-1" />
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
                          const display = fullName && companyName ? `${fullName} — ${companyName}` : fullName || companyName;
                          update("referrer", fullName);
                          update("referringCompany", companyName);
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

        </div>
    );
};

// --- MAIN APP ---

const createOrderInstructionDraft = (overrides = {}) => ({
  id: "",
  type: "Communication",
  text: "",
  ...overrides,
});

export default function App(){
  const SECTION_ORDER = ["sec1","sec2","sec3","sec4","sec5"];
  const createAlertModalState = () => ({
    isOpen: false,
    title: "",
    message: "",
    details: [],
    confirmLabel: "Confirm",
    dismissLabel: "Close",
    onConfirm: null,
  });
  const createSmartConfirmState = () => ({
    isOpen: false,
    title: "",
    message: "",
    details: [],
    confirmLabel: "Remove",
    cancelLabel: "Keep",
    onConfirm: null,
    onCancel: null,
  });
  const normalizeSampleContacts = (rows = []) => {
    const mergedRows = [...(rows || [])];
    SAMPLE_CONTACTS.forEach((required) => {
      const exists = mergedRows.some(
        (row) =>
          normalizeContact(row.name || "") === normalizeContact(required.name || "") &&
          normalizeCompany(row.company || "") === normalizeCompany(required.company || "")
      );
      if (!exists) mergedRows.push(required);
    });
    return mergedRows.map(r => {
      const defaults = inferRoleCapabilities(r.companyType || "", r.company || "");
      const seededRow = SAMPLE_CONTACTS.find(
        (required) =>
          normalizeContact(required.name || "") === normalizeContact(r.name || "") &&
          normalizeCompany(required.company || "") === normalizeCompany(r.company || "")
      );
      const companyInstructions = mergeInstructionEntries(
        seededRow?.companyInstructions || seededRow?.companyPreferences || [],
        r.companyInstructions || r.companyPreferences || []
      );
      const contactInstructions = mergeInstructionEntries(
        seededRow?.contactInstructions || seededRow?.contactPreferences || [],
        r.contactInstructions || r.contactPreferences || []
      );
      return {
        id: r.id || safeUid(),
        name: r.name || "",
        company: r.company || "",
        companyType: r.companyType || "",
        title: r.title || "",
        salesRep: r.salesRep || "",
        isAdjuster: !!r.isAdjuster,
        canRefer: typeof r.canRefer === "boolean" ? r.canRefer : defaults.canRefer,
        canBill: typeof r.canBill === "boolean" ? r.canBill : defaults.canBill,
        canInsure: typeof r.canInsure === "boolean" ? r.canInsure : defaults.canInsure,
        companyInstructions,
        contactInstructions,
        companyPreferences: companyInstructions.map((entry) => entry.text),
        contactPreferences: contactInstructions.map((entry) => entry.text),
        specialDocuments: mergeUniqueStrings(seededRow?.specialDocuments || [], r.specialDocuments || []),
        customerTextForms: mergeUniqueStrings(seededRow?.customerTextForms || [], r.customerTextForms || []),
        nationalCarrier: (r.nationalCarrier || seededRow?.nationalCarrier || "").toString(),
      };
    });
  };
  const [entryMode, setEntryMode] = useState("start"); 
  const [showInlineHelp, setShowInlineHelp] = useState(true);
  const [showCoaching, setShowCoaching] = useState(true);
  const [dismissedTips, setDismissedTips] = useState(new Set());
  const dismissTip = (key) => setDismissedTips(prev => new Set([...prev, key]));
  const tipVisible = (key) => showCoaching && !dismissedTips.has(key);
  const [compactMode, setCompactMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewView, setPreviewView] = useState("narrative");
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem("same-day-scope-v52");
      const parsed = s ? JSON.parse(s) : {};
      const normalizedSdsServices = (parsed.sdsServices || []).map(item => item === "Drying Needed" ? "Drying" : item);
      const parsedScopeBridge = normalizeScopeBridgeState(parsed.scopeBridge || {});
      const mergedSelectedGroups = Array.isArray(parsed.suggestedGroups) && parsed.suggestedGroups.length
        ? parsed.suggestedGroups
        : (parsedScopeBridge.selectedGroups || []);
      return { 
        ...DEFAULT_FORM, 
        ...parsed, 
        addresses: parsed.addresses?.length ? parsed.addresses : DEFAULT_FORM.addresses, 
        customers: parsed.customers?.length ? parsed.customers : DEFAULT_FORM.customers,
        orderInstructions: normalizeInstructionEntries(parsed.orderInstructions || []),
        sdsServices: normalizedSdsServices,
        suggestedGroups: mergedSelectedGroups,
        scopeBridge: withScopeBridgeSnippet({
          ...parsedScopeBridge,
          selectedGroups: mergedSelectedGroups,
        }),
      };
    } catch(e) { return DEFAULT_FORM; }
  });
  const recordWord = data.isLead === true ? "Lead" : "Order";
  const [interviewPanelOpen, setInterviewPanelOpen] = useState(false);
  const [interviewExpanded, setInterviewExpanded] = useState({});
  const [interviewSearch, setInterviewSearch] = useState("");
  const [actionItemsOpen, setActionItemsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const TEST_PRESETS_KEY = "noe-test-presets";
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [testPresets, setTestPresets] = useState(() => {
    try {
      const raw = localStorage.getItem(TEST_PRESETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        return [
          {
            id: "preset-sample",
            name: "Sample Order (Auto)",
            createdAt: new Date().toISOString(),
            data: SAMPLE_PRESET_DATA()
          }
        ];
      }
      return [
        {
          id: "preset-sample",
          name: "Sample Order (Auto)",
          createdAt: new Date().toISOString(),
          data: SAMPLE_PRESET_DATA()
        }
      ];
    } catch {
      return [
        {
          id: "preset-sample",
          name: "Sample Order (Auto)",
          createdAt: new Date().toISOString(),
          data: SAMPLE_PRESET_DATA()
        }
      ];
    }
  });
  const [fieldConfig, setFieldConfig] = useState(() => {
    try { const s = localStorage.getItem("noe-field-config-v1"); if (!s) return { ...DEFAULT_FIELD_CONFIG }; const saved = JSON.parse(s); const merged = { ...DEFAULT_FIELD_CONFIG }; Object.keys(merged).forEach(k => { if (saved[k]) merged[k] = { ...merged[k], ...saved[k] }; }); return merged; }
    catch { return { ...DEFAULT_FIELD_CONFIG }; }
  });
  const [blockerRules, setBlockerRules] = useState(() => {
    try { const s = localStorage.getItem("noe-blocker-rules-v1"); return s ? JSON.parse(s) : [...DEFAULT_BLOCKER_RULES]; }
    catch { return [...DEFAULT_BLOCKER_RULES]; }
  });
  const [interviewActions, setInterviewActions] = useState(() => {
    try { const s = localStorage.getItem("noe-interview-actions-v1"); if (!s) return { ...DEFAULT_INTERVIEW_ACTIONS }; const saved = JSON.parse(s); const merged = { ...DEFAULT_INTERVIEW_ACTIONS }; Object.keys(merged).forEach(k => { if (saved[k]) merged[k] = { ...merged[k], ...saved[k] }; }); return merged; }
    catch { return { ...DEFAULT_INTERVIEW_ACTIONS }; }
  });
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [configSelectedKeys, setConfigSelectedKeys] = useState(new Set());
  const [configSearch, setConfigSearch] = useState("");
  const isFieldVisible = (key) => fieldConfig[key]?.visible !== false;
  const executeInterviewActions = (answerKey, isOn) => {
    const config = interviewActions[answerKey];
    if (!config || !config.actions) return;
    if (!isOn) return; // only execute on selection, not deselection
    const executed = [];
    config.actions.forEach(action => {
      switch (action.type) {
        case "loadList":
          setData(p => ({ ...p, loadList: Array.from(new Set([...(p.loadList || []), action.value])) }));
          executed.push(`+ ${action.value} to load`);
          break;
        case "handlingCode":
          setData(p => ({ ...p, handlingCodes: Array.from(new Set([...(p.handlingCodes || []), action.value])) }));
          executed.push(`+ ${action.value} handling code`);
          break;
        case "eventInstruction": {
          const note = action.value;
          setData(p => {
            const current = stripEventSystemLines(p.eventInstructions || "").trim();
            if (current.includes(note)) return p;
            const combined = current ? `${current}\n${note}` : note;
            return { ...p, eventInstructions: composeEventInstructions(combined, p, conditionSummary) };
          });
          executed.push(`+ "${note}" to instructions`);
          break;
        }
        case "sdsObservation":
          setData(p => ({ ...p, sdsObservations: Array.from(new Set([...(p.sdsObservations || []), action.value])) }));
          executed.push(`+ ${action.value} to SDS`);
          break;
        case "suggestGroup":
          setData(p => ({ ...p, suggestedGroups: Array.from(new Set([...(p.suggestedGroups || []), action.value])) }));
          executed.push(`Suggested ${action.value} group`);
          break;
        case "blocker":
          setData(p => {
            const current = p.scopeBridge?.pendingIssues || [];
            if (current.includes(action.value)) return p;
            return { ...p, scopeBridge: { ...(p.scopeBridge || {}), pendingIssues: [...current, action.value] } };
          });
          executed.push(`Blocker: ${action.value}`);
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
      }
    });
    if (executed.length) setToast(executed.join(" · "));
  };
  const matchesInterviewSearch = (title, ...extras) => {
    const q = interviewSearch.trim().toLowerCase();
    if (!q) return true;
    if (title.toLowerCase().includes(q)) return true;
    return extras.some(e => (e || "").toLowerCase().includes(q));
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
  const [inlineAlert, setInlineAlert] = useState(null);
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
  const [reminderDraft, setReminderDraft] = useState({ date: "", time: "" });
  const [dateCloseTick, setDateCloseTick] = useState(0);
  const [timeCloseTick, setTimeCloseTick] = useState(0);
  const [welcomeModal, setWelcomeModal] = useState({ isOpen: false, customerId: null, note: "", selectedSpecialDocs: [] });
  const [showWelcomeQuickNotes, setShowWelcomeQuickNotes] = useState(false);
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
  const [showTypePicker, setShowTypePicker] = useState(false);
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
    } catch (e) {
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
  const seenAttentionAlertKeysRef = useRef(new Set());
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
  const [interviewSubOpen, setInterviewSubOpen] = useState(false);
  const [codesSubOpen, setCodesSubOpen] = useState(false);
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
    } catch(e){ return DEFAULT_COMPANIES; }
  });
  const [contacts,setContacts]=useState(()=>{ 
    try { 
      const s=localStorage.getItem("contacts-registry"); 
      const parsed = s?JSON.parse(s):[]; 
      return Array.from(new Set([...(parsed||[]), ...DEFAULT_CONTACTS])); 
    } catch(e){ return DEFAULT_CONTACTS; }
  });

  useEffect(()=>{ localStorage.setItem("companies-registry",JSON.stringify(companies)); },[companies]);
  useEffect(()=>{ localStorage.setItem("contacts-registry",JSON.stringify(contacts)); },[contacts]);
  useEffect(()=>{ localStorage.setItem("same-day-scope-v52", JSON.stringify(data)); },[data]);
  useEffect(()=>{ localStorage.setItem("noe-field-config-v1", JSON.stringify(fieldConfig)); },[fieldConfig]);
  useEffect(()=>{ localStorage.setItem("noe-blocker-rules-v1", JSON.stringify(blockerRules)); },[blockerRules]);
  useEffect(()=>{ localStorage.setItem("noe-interview-actions-v1", JSON.stringify(interviewActions)); },[interviewActions]);
  useEffect(()=>{ localStorage.setItem("sample-contacts", JSON.stringify(sampleContacts)); },[sampleContacts]);
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
  const updateMany = useCallback((patch) => setData(p => ({ ...p, ...patch })), []);

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

  useEffect(() => {
    try {
      localStorage.setItem(TEST_PRESETS_KEY, JSON.stringify(testPresets));
    } catch {}
  }, [testPresets]);

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
      data
    };
    setTestPresets(prev => {
      const existingIndex = prev.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...payload, id: prev[existingIndex].id };
        return next;
      }
      return [payload, ...prev];
    });
    setPresetName("");
    setToast("Test preset saved.");
  }, [data, presetName]);

  const loadTestPreset = useCallback((preset) => {
    if (!preset?.data) return;
    const parsed = preset.data;
    const normalizedSdsServices = (parsed.sdsServices || []).map(item => item === "Drying Needed" ? "Drying" : item);
    const parsedScopeBridge = normalizeScopeBridgeState(parsed.scopeBridge || {});
    const mergedSelectedGroups = Array.isArray(parsed.suggestedGroups) && parsed.suggestedGroups.length
      ? parsed.suggestedGroups
      : (parsedScopeBridge.selectedGroups || []);
    setData({
      ...DEFAULT_FORM,
      ...parsed,
      addresses: parsed.addresses?.length ? parsed.addresses : DEFAULT_FORM.addresses,
      customers: parsed.customers?.length ? parsed.customers : DEFAULT_FORM.customers,
      sdsServices: normalizedSdsServices,
      suggestedGroups: mergedSelectedGroups,
      scopeBridge: withScopeBridgeSnippet({
        ...parsedScopeBridge,
        selectedGroups: mergedSelectedGroups,
      }),
    });
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

  const downloadIcs = useCallback(() => {
    if (!data.pickupDate) return;
    const dtStart = formatIcsDateTime(data.pickupDate, data.pickupTime);
    const dtEnd = data.pickupTime ? formatIcsDateTime(data.pickupDate, addHours(data.pickupTime, 1)) : "";
    const summary = `${data.scheduleType || "Event"} - ${data.orderName || "New Order"}`;
    const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || {};
    const location = [primaryAddr.street, primaryAddr.city, primaryAddr.state, primaryAddr.zip].filter(Boolean).join(" ");
    const descriptionLines = [
      data.eventAssignee ? `Assignee: ${data.eventAssignee}` : null,
      data.eventVehicle ? `Vehicle: ${data.eventVehicle}` : null
    ].filter(Boolean).join("\\n");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//New Order Entry//EN",
      "BEGIN:VEVENT",
      `UID:${safeUid()}`,
      `SUMMARY:${summary}`,
      descriptionLines ? `DESCRIPTION:${descriptionLines}` : null,
      location ? `LOCATION:${location}` : null,
      data.pickupTime ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
      data.pickupTime && dtEnd ? `DTEND:${dtEnd}` : null,
      "END:VEVENT",
      "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");
    const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.orderName || "event").replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const toggleMulti=(list,value)=> list.includes(value)? list.filter(v=>v!==value): [...list,value];
  const toggleHandling=(code)=> update("handlingCodes", toggleMulti(data.handlingCodes, code));

  const focusFirstFieldInSection = (sectionKey) => {
    const section = document.getElementById(sectionKey);
    if (!section) return;
    const firstFocusable = section.querySelector(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable instanceof HTMLElement) {
      firstFocusable.focus();
    }
  };
  const focusLastFieldInSection = (sectionKey) => {
    const section = document.getElementById(sectionKey);
    if (!section) return;
    const focusables = Array.from(section.querySelectorAll(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    const last = focusables[focusables.length - 1];
    if (last instanceof HTMLElement) {
      last.focus();
    }
  };
  
  const scrollToSection = (key) => {
    const el = document.getElementById(key);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const animateNavigationFocus = (el) => {
    if (!(el instanceof HTMLElement)) return;
    el.classList.remove("animate-nav-focus");
    void el.offsetWidth;
    el.classList.add("animate-nav-focus");
  };

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
    setData(prev => {
        const current = prev.severityCodes || [];
        const type = code.split('-')[0]; 
        const others = current.filter(c => !c.startsWith(type + '-'));
        const isActive = current.includes(code);
        return { ...prev, severityCodes: isActive ? others : [...others, code] };
    });
  };

  const updateLossDetail = (type, field, value) => {
      setData(prev => {
          const details = prev.lossDetails || {};
          const typeDetails = details[type] || { causes: [], origins: [] };
          let newValue;
          if (Array.isArray(typeDetails[field])) {
              // single-select for causes/origins
              newValue = typeDetails[field].includes(value) ? [] : [value];
          } else { newValue = value; }
          const nextTypeDetails = { ...typeDetails, [field]: newValue };
          return { ...prev, lossDetails: { ...details, [type]: nextTypeDetails } };
      });
      setLastLossDetailTouched({ type, ts: Date.now() });
  };

  const getLossSummary = (type) => {
      const d = (data.lossDetails || {})[type];
      if (!d) return "No details selected";
      const parts = [];
      if (d.causes && d.causes.length) parts.push(d.causes.join(", "));
      if (d.origins && d.origins.length) parts.push(d.origins.join(", "));
      return parts.join("; ");
  };

  const toggleMinimizeLoss = (type) => {
      setMinimizedLossTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const SMART_TRIGGER_LABELS = {
    noHeat: "No Heat",
    noLights: "No Electricity",
    boardedUp: "Boarded Up",
    damageWasWet: "Still Wet",
    damageMoldMildew: "Visible Mold",
  };

  const shouldRetainSharedLoadItem = (fieldKey, item, nextValue, currentData) => {
    const nextOn = nextValue === true || nextValue === "Y";
    if (item !== "Lights") return false;
    if (fieldKey === "noLights") {
      return !nextOn && !!currentData.boardedUp;
    }
    if (fieldKey === "boardedUp") {
      return !nextOn && !!currentData.noLights;
    }
    return false;
  };

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
      let loadListAdded = [];
      let addHandling = [];
      const isOn = v === true || v === "Y";
      const isOff = v === false || v === "N" || v === "" || v === null;
      let currentLoadList = new Set(data.loadList || []);
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
          let newData = { ...prev, [k]: v };
          let newLoadList = new Set(prev.loadList || []);
          loadListAdded.forEach(i => newLoadList.add(i));
          newData.loadList = Array.from(newLoadList);
          if (k === "damageMoldMildew" && isOn && !(prev.orderTypes || []).includes("Mold")) {
            newData.orderTypes = [...(prev.orderTypes || []), "Mold"];
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
        const details = [];
        if (pendingRemovals.load.length) {
          details.push(`Bring Instructions: ${pendingRemovals.load.join(", ")}`);
        }
        if (pendingRemovals.handling.length) {
          details.push(`Handling Codes: ${pendingRemovals.handling.join(", ")}`);
        }
        if (pendingRemovals.orderTypes.length) {
          details.push(`Order Type: ${pendingRemovals.orderTypes.join(", ")}`);
        }
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
              if (pendingRemovals.orderTypes.length) {
                next.orderTypes = (prev.orderTypes || []).filter(type => !pendingRemovals.orderTypes.includes(type));
              }
              return next;
            });
          }
        });
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

  const SUBSECTION_TO_SECTION = {
    order: "sec1",
    source: "sec1",
    interview: "sec1",
    codes: "sec1",
    customer: "sec2",
    address: "sec3",
    companies: "sec4",
    billing: "sec4",
    finance: "sec4",
    insurance: "sec4",
    schedule: "sec5",
    bridge: "sec5",
    "sds-icons": "sec5",
  };

  const DEFAULT_SUBSECTION_BY_SECTION = {
    sec1: "order",
    sec2: "customer",
    sec3: "address",
    sec4: "companies",
    sec5: "schedule",
  };

  const SUBSECTION_DOM_ID = {
    order: "sec1-order",
    source: "sec1-source",
    interview: "sec1-interview",
    codes: "sec1-codes",
    companies: "sec4-companies",
    billing: "sec4-billing",
    finance: "sec4-finance",
    insurance: "sec4-insurance",
    schedule: "sec5-schedule",
    bridge: "sec5-bridge",
    "sds-icons": "sec5-bridge",
    customer: "sec2",
    address: "sec3",
  };

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

  const focusSearchLabel = (label, retries = 5) => {
    if (!label) return;
    const normalize = (s) => (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
    const target = normalize(label);
    const tryFind = (remaining) => {
      const labels = Array.from(document.querySelectorAll("label"));
      let match = labels.find(l => normalize(l.textContent).includes(target));
      if (!match) {
        const el = document.querySelector(`[data-search-key="${target}"], [data-audit-key="${target}"]`);
        match = el ? el.closest("label") || el : null;
      }
      const el = match || document.querySelector(`[data-search-key="${target}"], [data-audit-key="${target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("audit-pulse");
        setTimeout(() => el.classList.remove("audit-pulse"), 2400);
        if (el.focus) el.focus();
        return;
      }
      if (remaining > 0) {
        setTimeout(() => tryFind(remaining - 1), 150);
      }
    };
    tryFind(retries);
  };

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

  const openCrmModal = () => {
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
    localStorage.removeItem("noe-scope-photos");
    const user = data.currentUser || "";
    setData({ ...DEFAULT_FORM, isLead: null, currentUser: user, eventAssignee: user, vendors: [], referrer: "", referringCompany: "", salesRep: "", leadSourceCategory: "", leadSourceDetail: "", contactMethod: "", insuranceCompany: "", insuranceAdjuster: "", billingCompany: "", billingContact: "" });
    setPhotoScopeData(null);
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

  const buildFullExportLines = () => {
    const lines = [];
    const seen = new Set();
    const walk = (obj, path = "") => {
      if (obj === null || obj === undefined) return;
      if (typeof obj !== "object") {
        const key = path || "value";
        if (seen.has(key)) return;
        seen.add(key);
        lines.push(`${key}: ${obj}`);
        return;
      }
      if (Array.isArray(obj)) {
        if (obj.length === 0) return;
        if (obj.every(v => typeof v !== "object")) {
          const key = path || "value";
          if (!seen.has(key)) {
            seen.add(key);
            lines.push(`${key}: ${obj.join(", ")}`);
          }
          return;
        }
        obj.forEach((v, idx) => {
          walk(v, path ? `${path}[${idx}]` : `[${idx}]`);
        });
        return;
      }
      Object.entries(obj).forEach(([k, v]) => {
        const nextPath = path ? `${path}.${k}` : k;
        walk(v, nextPath);
      });
    };
    walk(data);
    return lines;
  };

  const copyLines = async (lines) => {
    const text = (lines || []).join("\n");
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setToast("Copied to clipboard");
  };

  const downloadLines = (lines, filename) => {
    const text = (lines || []).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    setSaveExportLines(buildFullExportLines());
    setPreviewOpen(true);
  };

  const computeAuditMissing = () => {
    const missing = [];
    const primaryCustomer = (data.customers || [])[0] || {};
    const primaryAddress = (data.addresses || [])[0] || {};
    const statusIndex = ORDER_STATUSES.indexOf(data.orderStatus);

    // Named check functions for complex validations
    const checkFns = {
      hasPrimaryOrderTypeDecision: () => hasPrimaryOrderTypeDecision(data.orderTypes || []),
      hasRequiredNonRestorationSubtype: () => hasRequiredNonRestorationSubtype(data.orderTypes || []),
      interviewCompleted: () => !!(data.livingStatus || data.processType || data.repairsSummary || (data.packoutSummary||[]).length || data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp),
      codesCompleted: () => !!((data.severityCodes||[]).length || data.qualityCode || (data.handlingCodes||[]).length),
    };

    // Resolve value from key or dataPath
    const resolveValue = (key, cfg) => {
      if (cfg.dataPath) {
        if (cfg.dataPath.startsWith("customers[0].")) return primaryCustomer[cfg.dataPath.split(".")[1]];
        if (cfg.dataPath.startsWith("addresses[0].")) return primaryAddress[cfg.dataPath.split(".")[1]];
      }
      return data[key];
    };

    // Evaluate condition guard
    const conditionMet = (cond) => {
      if (!cond) return true;
      if (cond.equals) return data[cond.field] === cond.equals;
      if (cond.oneOf) return (cond.oneOf || []).includes(data[cond.field]);
      if (cond.includes) return (data[cond.field] || []).includes(cond.includes);
      return true;
    };

    // Check status gate
    const statusGateMet = (requiredAtStatus) => {
      if (!requiredAtStatus || requiredAtStatus === "always") return true;
      if (requiredAtStatus === "never") return false;
      const gateIndex = ORDER_STATUSES.indexOf(requiredAtStatus);
      return gateIndex >= 0 && statusIndex >= gateIndex;
    };

    // Config-driven field checks
    Object.entries(fieldConfig).forEach(([key, cfg]) => {
      if (!cfg.requiredInAudit) return;
      if (!statusGateMet(cfg.requiredAtStatus)) return;
      if (!conditionMet(cfg.condition)) return;

      let isEmpty;
      if (cfg.checkFn && checkFns[cfg.checkFn]) {
        isEmpty = !checkFns[cfg.checkFn]();
      } else {
        isEmpty = !resolveValue(key, cfg);
      }

      if (isEmpty) {
        missing.push({ id: cfg.section, label: cfg.label, section: cfg.section, key });
      }
    });

    // Dynamic severity checks (special case — keys depend on order types)
    if (["Pickup Complete","Ready to Bill"].includes(data.orderStatus)) {
      const severityGroupsNeeded = (data.orderTypes || []).reduce((acc, t) => {
        const group = t === "Dust/Debris" ? "Dust" : t;
        if (SEVERITY_GROUPS.includes(group)) acc.add(group);
        return acc;
      }, new Set());
      severityGroupsNeeded.forEach(group => {
        const hasCode = (data.severityCodes || []).some(c => c.startsWith(group + "-"));
        if (!hasCode) missing.push({ id: "sec1", label: `${group} Severity`, section: "sec1", key: `severity-${group.toLowerCase()}` });
      });
    }

    // Structural placeholder checks (not field-config driven)
    (data.customers || []).forEach((customer, idx) => {
      if (!isPlaceholderFlagActive(customer?.placeholder)) return;
      const customerLabel = [customer?.first, customer?.last].filter(hasMeaningfulValue).join(" ").trim() || `Customer ${idx + 1}`;
      missing.push({ id: "sec2", label: `Resolve Placeholder: ${customerLabel}`, section: "sec2", key: `placeholder-customer-${customer?.id || idx}`, category: "placeholders" });
    });
    (data.vendors || []).forEach((v, idx) => {
      if (v.incomplete) {
        missing.push({ id: "sec4", label: `Incomplete: ${v.contact || v.company || `Company ${idx + 1}`}`, section: "sec4", key: `placeholder-vendor-${v.id || idx}`, category: "placeholders", vendorIdx: idx });
      }
    });
    (data.addresses || []).forEach((addr, idx) => {
      if (!isAddressPlaceholder(addr)) return;
      missing.push({ id: "sec3", label: `Resolve Placeholder: ${addr?.type || (idx === 0 ? "Primary Address" : `Address ${idx + 1}`)}`, section: "sec3", key: `placeholder-address-${addr.id}`, category: "placeholders" });
    });
    Object.entries(data.additionalCompanies || {}).forEach(([type, rawEntry]) => {
      const entry = syncCompanyEntryPlaceholders(rawEntry || {});
      if (isCompanyPlaceholder(entry)) {
        missing.push({ id: "sec4", label: `Resolve Placeholder: ${type} company`, section: "sec4", key: `placeholder-company-${normalizePlaceholderKeyPart(type)}`, category: "placeholders" });
      } else if (companyTypeRequiresContact(type) && isContactPlaceholder(entry)) {
        missing.push({ id: "sec4", label: `Resolve Placeholder: ${type} contact`, section: "sec4", key: `placeholder-contact-${normalizePlaceholderKeyPart(type)}`, category: "placeholders" });
      }
    });

    return missing;
  };

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

  const orderCompanyNames = useMemo(() => {
    const names = new Map();
    const add = (value) => {
      const trimmed = (value || "").toString().trim();
      if (!trimmed) return;
      const key = normalizeCompany(trimmed);
      if (!names.has(key)) names.set(key, trimmed);
    };
    add(data.referringCompany);
    add(data.billingCompany);
    add(data.insuranceCompany);
    add(data.publicAdjustingCompany);
    add(data.independentAdjustingCo);
    add(data.tpaCompany);
    Object.values(data.additionalCompanies || {}).forEach((entry) => add(entry?.company));
    return Array.from(names.values());
  }, [
    data.referringCompany,
    data.billingCompany,
    data.insuranceCompany,
    data.publicAdjustingCompany,
    data.independentAdjustingCo,
    data.tpaCompany,
    data.additionalCompanies,
  ]);

  const orderContactNames = useMemo(() => {
    const names = new Map();
    const add = (value) => {
      const trimmed = (value || "").toString().trim();
      if (!trimmed) return;
      const key = normalizeContact(trimmed);
      if (!names.has(key)) names.set(key, trimmed);
    };
    add(data.referrer);
    add(data.billingContact);
    add(data.insuranceAdjuster);
    add(data.publicAdjuster);
    add(data.independentAdjuster);
    add(data.tpaContact);
    Object.values(data.additionalCompanies || {}).forEach((entry) => {
      entryContactList(entry || {}).forEach((contact) => add(contact?.name));
    });
    return Array.from(names.values());
  }, [
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
    () => buildAssignmentCueItems([
      {
        label: "Referrer",
        companyMatch: sameNormalizedCompany(data.billingCompany, data.referringCompany),
        contactMatch: sameNormalizedContact(data.billingContact, data.referrer),
      },
      {
        label: "Insurance",
        companyMatch: sameNormalizedCompany(data.billingCompany, data.insuranceCompany),
        contactMatch: sameNormalizedContact(data.billingContact, data.insuranceAdjuster),
      },
    ]),
    [
      data.billingCompany,
      data.referringCompany,
      data.billingContact,
      data.referrer,
      data.insuranceCompany,
      data.insuranceAdjuster,
      buildAssignmentCueItems,
    ]
  );
  const billingAssignmentLinked =
    billingAssignmentCues.length > 0 && !!(data.billingCompany || data.billingContact);
  const insuranceAssignmentCues = useMemo(
    () => buildAssignmentCueItems([
      {
        label: "Referrer",
        companyMatch: sameNormalizedCompany(data.insuranceCompany, data.referringCompany),
        contactMatch: sameNormalizedContact(data.insuranceAdjuster, data.referrer),
      },
      {
        label: "Bill To",
        companyMatch: sameNormalizedCompany(data.insuranceCompany, data.billingCompany),
        contactMatch: sameNormalizedContact(data.insuranceAdjuster, data.billingContact),
      },
    ]),
    [
      data.insuranceCompany,
      data.referringCompany,
      data.insuranceAdjuster,
      data.referrer,
      data.billingCompany,
      data.billingContact,
      buildAssignmentCueItems,
    ]
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
  const renderAlertMessageContent = useCallback((message = "", title = "") => {
    const marker = " has saved guidance for this order.";
    if (
      message &&
      marker &&
      message.endsWith(marker) &&
      /instructions found|requirements found/i.test(title || "")
    ) {
      const entity = message.slice(0, -marker.length).trim();
      return (
        <>
          <span className="font-semibold text-slate-900">{entity}</span>
          <span>{marker}</span>
        </>
      );
    }
    return message;
  }, []);
  const renderAlertDetailContent = useCallback((detail = "") => {
    const separatorIndex = (detail || "").indexOf(":");
    if (separatorIndex === -1) return detail;
    const label = detail.slice(0, separatorIndex).trim();
    const text = detail.slice(separatorIndex + 1).trim();
    return (
      <>
        <span className="font-semibold text-slate-900">{label}:</span>
        {text ? <span>{` ${text}`}</span> : null}
      </>
    );
  }, []);
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

  const orderAttentionAlerts = useMemo(() => {
    const items = [];
    orderCompanyNames.forEach((companyName) => {
      const profile = getCompanyProfile(companyName);
      const details = [
        ...profile.companyInstructions.map((item) => `${item.type}: ${item.text}`),
        ...profile.specialDocuments.map((item) => `Paperwork: ${item}`),
      ];
      if (!details.length) return;
      items.push({
        key: `company:${normalizeCompany(companyName)}:${details.join("|")}`,
        entityKey: `company:${normalizeCompany(companyName)}`,
        title: profile.specialDocuments.length ? "Special requirements found" : "Company instructions found",
        message: `${companyName} has saved guidance for this order.`,
        details,
      });
    });
    orderContactNames.forEach((contactName) => {
      const profile = getContactProfile(contactName);
      const details = [
        ...profile.contactInstructions.map((item) => `${item.type}: ${item.text}`),
        ...profile.specialDocuments.map((item) => `Paperwork: ${item}`),
      ];
      if (!details.length) return;
      items.push({
        key: `contact:${normalizeContact(contactName)}:${details.join("|")}`,
        entityKey: `contact:${normalizeContact(contactName)}`,
        title: profile.specialDocuments.length ? "Special requirements found" : "Contact instructions found",
        message: `${contactName} has saved guidance for this order.`,
        details,
      });
    });
    return items;
  }, [orderCompanyNames, orderContactNames, getCompanyProfile, getContactProfile]);

  useEffect(() => {
    const unseen = orderAttentionAlerts.find(
      (item) => !seenAttentionAlertKeysRef.current.has(item.key)
    );
    if (!unseen) return;
    seenAttentionAlertKeysRef.current.add(unseen.key);
    markInstructionKeysSeen(unseen.entityKey ? [unseen.entityKey] : []);
    setInlineAlert({
      title: unseen.title,
      message: unseen.message,
      details: unseen.details,
    });
  }, [orderAttentionAlerts, markInstructionKeysSeen]);

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

  const estimateRequesterQuickOptions = useMemo(() => {
    const options = [];
    const seen = new Set();
    const add = (name, roleLabel = "") => {
      const trimmed = (name || "").toString().trim();
      if (!trimmed) return;
      const value = roleLabel ? `${trimmed} (${roleLabel})` : trimmed;
      const key = value.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push(value);
    };
    (data.customers || []).forEach((customer) => {
      const fullName = [customer.first, customer.last].filter(Boolean).join(" ").trim();
      add(fullName, "Customer");
    });
    add(data.insuranceAdjuster, "Adjuster");
    add(data.publicAdjuster, "Public Adjuster");
    add(data.independentAdjuster, "Independent Adjuster");
    add(data.tpaContact, "TPA");
    add(data.billingContact, "Bill To");
    add(data.referrer, "Referrer");
    return options;
  }, [
    data.customers,
    data.insuranceAdjuster,
    data.publicAdjuster,
    data.independentAdjuster,
    data.tpaContact,
    data.billingContact,
    data.referrer,
  ]);

  const sectionAuditStatus = useMemo(() => {
    const missing = computeAuditMissing();
    const missingBySection = missing.reduce((acc, item) => {
      const section = item.section || item.id;
      if (!section) return acc;
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});

    const requiredBySection = { sec1: 0, sec2: 0, sec3: 0, sec4: 0, sec5: 0 };

    requiredBySection.sec1 += 3; // orderName, orderTypes, leadSourceCategory
    if (isNonRestorationSelected(data.orderTypes || [])) requiredBySection.sec1 += 1;
    if (data.leadSourceCategory === "Referral") requiredBySection.sec1 += 2;
    if (data.leadSourceCategory === "Marketing" || data.leadSourceCategory === "Internal") requiredBySection.sec1 += 1;
    if ((data.orderTypes || []).includes("Mold")) requiredBySection.sec1 += 1;

    requiredBySection.sec2 += 4; // primary customer fields
    requiredBySection.sec3 += 6; // primary address fields
    requiredBySection.sec4 += 1; // billingPayer

    if (data.rentOrOwn === "Rent") requiredBySection.sec3 += 1;

    const needsPickupAudit = ["Pickup Complete","Ready to Bill"].includes(data.orderStatus);
    const needsFinanceAudit = ["Intake Complete","Ready to Bill"].includes(data.orderStatus);

    if (needsPickupAudit) {
      const severityGroupsNeeded = (data.orderTypes || []).reduce((acc, t) => {
        const group = t === "Dust/Debris" ? "Dust" : t;
        if (SEVERITY_GROUPS.includes(group)) acc.add(group);
        return acc;
      }, new Set());
      requiredBySection.sec1 += severityGroupsNeeded.size;
      requiredBySection.sec1 += 2; // interview + codes
    }

    if (needsFinanceAudit) {
      requiredBySection.sec4 += 4; // pricing + estimate
    }

    requiredBySection.sec3 += (data.addresses || []).filter(addr => isAddressPlaceholder(addr)).length;
    requiredBySection.sec2 += (data.customers || []).filter((customer) => isPlaceholderFlagActive(customer?.placeholder)).length;
    requiredBySection.sec4 += Object.values(data.additionalCompanies || {}).reduce((acc, rawEntry) => {
      const entry = syncCompanyEntryPlaceholders(rawEntry || {});
      const companyPending = isCompanyPlaceholder(entry);
      if (companyPending) return acc + 1;
      if (isContactPlaceholder(entry)) return acc + 1;
      return acc;
    }, 0);

    return SECTION_ORDER.reduce((acc, sectionId) => {
      const required = requiredBySection[sectionId] || 0;
      const missingCount = missingBySection[sectionId] || 0;
      acc[sectionId] = {
        required,
        missing: missingCount,
        complete: required > 0 && missingCount === 0
      };
      return acc;
    }, {});
  }, [data]);

  const completedSections = useMemo(() => {
    return new Set(SECTION_ORDER.filter(sectionId => sectionAuditStatus?.[sectionId]?.complete));
  }, [sectionAuditStatus]);

  const runAudit = () => {
    const missing = computeAuditMissing();
    setAuditMissing(missing);
    const highlight = missing.reduce((acc, item) => { acc[item.key] = true; return acc; }, {});
    setData(p => ({ ...p, highlightMissing: { ...(p.highlightMissing||{}), ...highlight } }));
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
  const conditionSummary = useMemo(() => {
    const items = [];
    if (data.damageWasWet === "Y" || data.damageWasWet === true) items.push("Still Wet");
    if (data.damageMoldMildew) items.push("Visible Mold");
    if (data.structuralElectricDamage === "Y") items.push("Structural Damage");
    if (data.noLights) items.push("No Electricity");
    if (data.noHeat) items.push("No Heat");
    if (data.boardedUp) items.push("Boarded Up");
    return items.join(", ");
  }, [data.damageWasWet, data.damageMoldMildew, data.structuralElectricDamage, data.noLights, data.noHeat, data.boardedUp]);
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
  const orderNarrative = useMemo(() => {
    const lines = [];
    // Loss type
    if (data.primaryLossType) {
      let lossLine = `${data.primaryLossType} loss`;
      const causes = (data.lossDetails?.[data.primaryLossType]?.causes || []);
      const origins = (data.lossDetails?.[data.primaryLossType]?.origins || []);
      if (causes.length) lossLine += ` (${causes.join(", ").toLowerCase()})`;
      if (origins.length) lossLine += ` originating in ${origins.join(", ").toLowerCase()}`;
      if ((data.secondaryContaminants || []).length) {
        lossLine += `, with secondary ${(data.secondaryContaminants || []).join(", ").toLowerCase()}`;
      }
      lossLine += ".";
      lines.push({ section: "Loss", text: lossLine });
    }
    // Customer
    const customers = (data.customers || []).filter(c => hasMeaningfulValue(c.first) || hasMeaningfulValue(c.last));
    customers.forEach((c, i) => {
      const name = [c.first, c.last].filter(Boolean).join(" ");
      const details = [c.phone, c.email].filter(Boolean).join(", ");
      const role = c.isPrimary ? "Customer" : (c.type || "Contact");
      lines.push({ section: role, text: `${name}${details ? " — " + details : ""}` });
    });
    // Address
    const addrs = (data.addresses || []).filter(a => !a.inactive && hasMeaningfulValue(a.street));
    addrs.forEach(a => {
      const label = a.isPrimary ? "Address" : (a.type || "Address");
      lines.push({ section: label, text: summarizeAddress(a) });
    });
    // Source
    if (data.referrer || data.referringCompany) {
      lines.push({ section: "Referral", text: [data.referrer, data.referringCompany].filter(Boolean).join(" at ") });
    }
    if (data.salesRep) {
      lines.push({ section: "Sales Rep", text: data.salesRep.split(",")[0] });
    }
    // Insurance
    if (data.insuranceCompany) {
      let ins = data.insuranceCompany;
      if (data.insuranceAdjuster) ins += ` — Adjuster: ${data.insuranceAdjuster}`;
      lines.push({ section: "Insurance", text: ins });
    }
    if (data.claimNumber) lines.push({ section: "Claim #", text: data.claimNumber });
    // Vendors
    (data.vendors || []).forEach(v => {
      if (v.company || v.contact) {
        lines.push({ section: v.type || "Company", text: [v.company, v.contact].filter(Boolean).join(" — ") });
      }
    });
    // Services
    if ((data.serviceOfferings || []).length) {
      lines.push({ section: "Services", text: (data.serviceOfferings || []).join(", ") });
    }
    // Conditions
    const conditions = [];
    if (data.damageWasWet === "Y" || data.damageWasWet === true) conditions.push("still wet");
    if (data.damageMoldMildew) conditions.push("visible mold");
    if (data.structuralElectricDamage === "Y") conditions.push("structural damage");
    if (data.noLights) conditions.push("no electricity");
    if (data.noHeat) conditions.push("no heat");
    if (data.boardedUp) conditions.push("boarded up");
    if (conditions.length) {
      lines.push({ section: "Conditions", text: conditions.join(", ") + "." });
    }
    // Living / Storage
    if (data.livingStatus) lines.push({ section: "Living", text: data.livingStatus });
    if (data.storageNeeded === "Y") {
      lines.push({ section: "Storage", text: `Long-term storage${data.storageMonths ? `, approximately ${data.storageMonths} months` : ""}` });
    }
    // Repairs
    if (data.repairsSummary) lines.push({ section: "Repairs", text: data.repairsSummary });
    // Packout
    if ((data.packoutSummary || []).length) {
      lines.push({ section: "Pack-out", text: (data.packoutSummary || []).join(", ") });
    }
    // Considerations
    const considerations = (data.sdsConsiderations || []).filter(c => c !== "Pets");
    if (considerations.length) {
      lines.push({ section: "Considerations", text: considerations.join(", ") });
    }
    if ((data.sdsConsiderations || []).includes("Pets") && data.householdAnimals) {
      lines.push({ section: "Pets", text: data.householdAnimals });
    }
    // Interview details
    if (data.familyMedicalIssues === "Y") {
      lines.push({ section: "Medical", text: data.familyMedicalNote || "Medical issues reported" });
    }
    if (data.soapFragAllergies === "Y") {
      lines.push({ section: "Allergies", text: data.soapFragNote || "Soap/fragrance allergies reported" });
    }
    if (data.selfCleaning === "Y") {
      lines.push({ section: "Self-Clean", text: data.selfCleaningNote || "Customer will clean some items themselves" });
    }
    if (data.useDryCleaner && data.useDryCleaner !== "No") {
      lines.push({ section: "Dry Cleaner", text: data.useDryCleaner === "Yes" ? "Uses a dry cleaner" : "Rarely uses dry cleaner" });
    }
    if (data.howDryLaundry && data.howDryLaundry !== "Dryer") {
      lines.push({ section: "Laundry", text: data.howDryLaundry === "Air-Dry" ? "Customer air-dries clothing — do not machine dry" : "Customer prefers low heat drying" });
    }
    if (data.processType) {
      lines.push({ section: "Delivery", text: data.processType });
    }
    if ((data.handlingCodes || []).length) {
      lines.push({ section: "Handling", text: (data.handlingCodes || []).join(", ") });
    }
    // Schedule
    if (data.scheduleType || data.pickupDate) {
      const parts = [data.scheduleType, data.pickupDate ? formatDateLabel(data.pickupDate) : "", data.pickupTime].filter(Boolean);
      lines.push({ section: "Scheduled", text: parts.join(" — ") });
    }
    if (data.eventAssignee) lines.push({ section: "Assignee", text: data.eventAssignee });
    // Custom notes
    const customNotes = stripEventSystemLines(data.eventInstructions || "").trim();
    if (customNotes) lines.push({ section: "Notes", text: customNotes });
    return lines;
  }, [data]);

  // --- Photo Scope Bridge: read photos from Photo Scope localStorage ---
  const [photoScopeData, setPhotoScopeData] = useState(() => {
    try { const raw = localStorage.getItem("noe-scope-photos"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  useEffect(() => {
    const poll = setInterval(() => {
      try {
        const raw = localStorage.getItem("noe-scope-photos");
        const parsed = raw ? JSON.parse(raw) : null;
        setPhotoScopeData(prev => {
          if (!parsed && !prev) return prev;
          if (parsed?.updatedAt !== prev?.updatedAt) return parsed;
          return prev;
        });
      } catch {}
    }, 2000);
    return () => clearInterval(poll);
  }, []);

  const mergedSdsPhotos = useMemo(() => {
    const manual = data.sdsPhotos || [];
    const fromScope = photoScopeData?.photos || [];
    const seen = new Set(manual.map(p => p.id));
    const merged = [...manual];
    fromScope.forEach(p => { if (!seen.has(p.id)) merged.push(p); });
    return merged;
  }, [data.sdsPhotos, photoScopeData]);

  const mergedSdsCoverPhoto = useMemo(() => {
    return data.sdsCoverPhoto || photoScopeData?.coverPhotoId || null;
  }, [data.sdsCoverPhoto, photoScopeData]);
  const bridgeStatusClass = useMemo(() => {
    if (scopeBridgeState.projectStatus === "green") return "border-emerald-300 bg-emerald-50 text-slate-700";
    if (scopeBridgeState.projectStatus === "yellow") return "border-amber-300 bg-amber-50 text-slate-700";
    if (scopeBridgeState.projectStatus === "red") return "border-rose-300 bg-rose-50 text-slate-700";
    return "border-slate-200 bg-white text-slate-500";
  }, [scopeBridgeState.projectStatus]);
  const bridgeSectionClass = useMemo(() => {
    if (scopeBridgeState.projectStatus === "green") return "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-100";
    if (scopeBridgeState.projectStatus === "yellow") return "border-amber-300 bg-amber-50/20 ring-1 ring-amber-100";
    if (scopeBridgeState.projectStatus === "red") return "border-rose-300 bg-rose-50/20 ring-1 ring-rose-100";
    return "";
  }, [scopeBridgeState.projectStatus]);

  const deriveScopeBridgeStatus = useCallback((bridge) => {
    if ((bridge?.projectStatus || "") === "red") return "red";
    const hasPending = (bridge?.pendingIssues || []).length > 0;
    const processingOption = (bridge?.processingOption || "").toString();
    const deliveryOption = (bridge?.deliveryOption || "").toString();
    const nextStep = (bridge?.nextStep || "").toString();
    const legacyOperationalStep = [
      "pickup_hold",
      "processing_hold",
      "emergency_groups_only",
      "cod",
      "delivery_hold",
      "wait_approval",
      "wait_test",
      "delivery_priority",
      "delivery_hold_cod",
    ].includes(nextStep);
    const hasOperationalHold =
      (bridge?.pickupOption || "") === "wait" ||
      (bridge?.pickupOption || "") === "urgent" ||
      ["tag_hold", "urgent", "cod", "specific"].includes(processingOption) ||
      ["priority", "hold_cod"].includes(deliveryOption) ||
      legacyOperationalStep;
    return hasPending || hasOperationalHold ? "yellow" : "green";
  }, []);

  const patchScopeBridge = useCallback((updater, opts = {}) => {
    const options = opts || {};
    const current = normalizeScopeBridgeState(scopeBridgeState || {});
    const candidate = typeof updater === "function"
      ? updater(current)
      : { ...current, ...(updater || {}) };
    let next = normalizeScopeBridgeState(candidate);
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

  const companyRoleAssignments = useMemo(() => {
    return COMPANY_ROLE_DEFS.map(role => {
      const rawEntry = data.additionalCompanies?.[role.type];
      const entry = rawEntry ? syncCompanyEntryPlaceholders(rawEntry) : null;
      const sourceCompany = role.source ? (data[role.source] || "") : "";
      const sourceContact = role.contactSource ? (data[role.contactSource] || "") : "";
      const contactsFromEntry = entryContactList(entry);
      const companyName = sourceCompany || entry?.company || "";
      const contactsFromSample = (() => {
        if (!companyName) return [];
        const target = normalizeCompany(companyName);
        if (!target) return [];
        const direct = globalDirectoryByCompany.get(target) || [];
        if (direct.length) return direct.map(c => ({ name: c.name }));
        const matches = [];
        globalDirectoryByCompany.forEach((list, key) => {
          if (key.includes(target) || target.includes(key)) {
            list.forEach(c => matches.push({ name: c.name }));
          }
        });
        return matches;
      })();
      const mergedContacts = [
        ...contactsFromEntry,
        ...contactsFromSample.filter(c => !contactsFromEntry.find(e => normalizeContact(e.name) === normalizeContact(c.name)))
      ];
      const contactName = sourceContact || mergedContacts[0]?.name || "";
      const normalizedEntry = syncCompanyEntryPlaceholders({
        ...(entry || {}),
        company: companyName || entry?.company || "",
        contact: contactName || entry?.contact || "",
        contacts: mergedContacts,
        placeholder: entry?.placeholder || null,
        contactPlaceholder: entry?.contactPlaceholder || null
      });
      if (!companyTypeRequiresContact(role.type)) {
        normalizedEntry.contactPlaceholder = null;
      }
      const companyPlaceholder = !!entry && !sourceCompany && isCompanyPlaceholder(normalizedEntry);
      const contactPlaceholder =
        !!entry &&
        !sourceContact &&
        !companyPlaceholder &&
        companyTypeRequiresContact(role.type) &&
        isContactPlaceholder(normalizedEntry);
      const pending = companyPlaceholder || contactPlaceholder;
      const filled = !!companyName;
      return {
        ...role,
        companyName,
        contactName,
        pending,
        filled,
        companyPlaceholder,
        contactPlaceholder,
        entry: normalizedEntry,
        contacts: mergedContacts
      };
    });
  }, [
    data.additionalCompanies,
    data.insuranceCompany,
    data.insuranceAdjuster,
    data.publicAdjustingCompany,
    data.publicAdjuster,
    data.independentAdjustingCo,
    data.independentAdjuster,
    data.tpaCompany,
    data.tpaContact,
    globalDirectoryByCompany
  ]);

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
    [data.insuranceAdjuster,data.publicAdjuster,data.independentAdjuster,data.tpaContact].forEach(n=>{ if(n) s.add(n);});
    if(data.referrer) s.add(data.referrer); 
    Object.values(data.vendorDetails||{}).forEach(v=>{ if(v&&v.contact) s.add(v.contact)}); 
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
    return CONTACT_ROLE_BADGES.filter(role => {
      if (blocked.has(role.id) && !forced.has(role.id)) return false;
      if (forced.has(role.id)) return isRoleEligibleForCompany(role.id, company);
      if (!isRoleEligibleForCompany(role.id, company)) return false;
      if (role.id === "referrer") return !referrerAssigned || sameReferrer;
      if (role.id === "insurance") return !insuranceAssigned || sameInsurance;
      if (role.id === "billto") return !billToAssigned || sameBillTo;
      return false;
    });
  }, [
    data.referringCompany,
    data.referrer,
    data.insuranceCompany,
    data.insuranceAdjuster,
    data.billingCompany,
    data.billingContact,
    isRoleEligibleForCompany
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
    if (!suggested.length && options.length === 1) suggested.push(options[0].id);
    const selectedDefaults = Array.from(new Set(suggested));
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
    if (hasContact || hasCompany) {
      const roleNames = CONTACT_ROLE_BADGES
        .filter(role => selected.has(role.id))
        .map(role => role.title);
      if (roleNames.length) {
        setToast(`Assigned ${roleNames.join(", ")} role${roleNames.length > 1 ? "s" : ""}.`);
      }
    }
  }, [setToast, isRoleEligibleForCompany]);

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
    upsertAdditionalCompany(type, { contact: parsed.contact || "", company: parsed.company || "" });
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
    upsertAdditionalCompany(nextType, { contact: contact || "", company: company || "" });
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
    setAddCompanyType(role.type);
    setShowTypePicker(false);
    setAddCompanyModalOpen(true);
    setCompaniesSubOpen(true);
    setTimeout(() => addCompanyInputRef.current?.focus(), 100);
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
    return inferCompanyTypeFromName(company);
  };

  const upsertAdditionalCompany = (type, entry) => {
    const nextType = type || autoTypeForCompany(entry?.company || "");
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
    setToast("Insurance Company and National Carrier not Required");
  }, [isNonRestorationProject, projectType]);

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
    if (id === "insurance") {
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
    if (mode === "detailed") {
      setData(prev => ({ ...prev, isLead: null, eventAssignee: prev.eventAssignee || prev.currentUser || "" }));
    }
  };

  if (entryMode === 'start') return <div data-noe-mode="start" data-noe-app="new-order-entry"><StartScreen onSelect={handleEntryModeSelect} /></div>;
  if (entryMode === 'photo-scope') {
    return (
      <div data-noe-mode="photo-scope" data-noe-app="new-order-entry" className="fixed inset-0 flex flex-col bg-white">
        <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 shadow-sm z-10">
          <button
            type="button"
            onClick={() => setEntryMode('start')}
            className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
            title="Back to start"
          >
            <span className="text-sm">←</span>
          </button>
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
            <button onClick={() => setEntryMode('detailed')} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Order</button>
            <button className="rounded-full px-3 py-1.5 text-xs font-bold bg-white text-sky-700 shadow-sm">Photo Scope</button>
            <button onClick={() => { setEntryMode('detailed'); setTimeout(() => setShowSdsPreview(true), 100); }} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">SDS</button>
          </div>
          <div className="ml-auto text-xs text-slate-400">Photos sync to SDS automatically</div>
        </div>
        <iframe
          src="/photo-scope.html"
          className="flex-1 w-full border-none"
          title="Photo Scope"
        />
      </div>
    );
  }
  if (entryMode === 'same-day-scope') {
    const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0] || {};
    const addressLabel = [primaryAddr.street, primaryAddr.city, primaryAddr.state].filter(Boolean).join(", ");
    return (
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
    );
  }

  return (
    <React.Fragment>
        <style>{STYLES}</style>
        
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
            onShowSds={() => setShowSdsPreview(true)}
            setCompactMode={setCompactMode}
            onReset={handleReset}
            currentUser={data.currentUser}
            setCurrentUser={(v)=>update("currentUser", v)}
            setShowSampleDataModal={setShowSampleDataModal}
            onOpenPresets={() => setShowPresetModal(true)}
            onOpenFieldConfig={() => setShowFieldConfig(true)}
            interviewPanelOpen={interviewPanelOpen}
            actionItemsOpen={actionItemsOpen}
            presetCount={testPresets.length}
        />

        <div ref={appContentRef} data-noe-mode={entryMode} data-noe-app="new-order-entry" className={`min-h-screen bg-slate-50 pb-32 font-sans fade-in scale-in ${compactMode ? 'compact-mode' : ''} ${entryMode === 'detailed' ? 'pt-28' : 'pt-24'}`} style={(interviewPanelOpen || actionItemsOpen) ? { marginRight: '480px', transition: 'margin-right 0.2s ease' } : { transition: 'margin-right 0.2s ease' }}>
            
            <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none" />

            <div className="mx-auto max-w-6xl px-2 sm:px-4 relative"> 
              
              {entryMode === 'detailed' ? (
                <>
                  {(scopeBridgeState.projectStatus || scopeBridgeState.pendingIssues.length > 0) && (
                    <button
                      type="button"
                      onClick={() => { jumpToSection("sec5"); setTimeout(() => setScheduleBridgeOpen(true), 150); }}
                      className={`mb-3 w-full rounded-xl border px-4 py-2.5 text-left transition-all hover:shadow-sm ${bridgeStatusClass}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                            scopeBridgeState.projectStatus === "green" ? "bg-emerald-500" :
                            scopeBridgeState.projectStatus === "yellow" ? "bg-amber-500" :
                            scopeBridgeState.projectStatus === "red" ? "bg-rose-500" : "bg-slate-300"
                          }`} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Scope Bridge{scopeBridgeState.projectStatus ? `: ${scopeBridgeState.projectStatus.toUpperCase()}` : ""}
                          </span>
                          {scopeBridgeState.pendingIssues.length > 0 && (
                            <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                              {scopeBridgeState.pendingIssues.length} blocker{scopeBridgeState.pendingIssues.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {scopeBridgeState.milestones?.authorizationOnFile && (
                            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Auth on file</span>
                          )}
                          {scopeBridgeState.milestones?.scopeApproved && (
                            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Scope approved</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Open</span>
                      </div>
                    </button>
                  )}
                  {/* Placeholder strip removed — now in Action Items panel */}
                  {inlineAlert && (
                    <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 fade-in">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-amber-800">{inlineAlert.title}</div>
                          <div className="text-xs text-amber-700 mt-0.5">{inlineAlert.message}</div>
                          {inlineAlert.details?.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5">
                              {inlineAlert.details.map((d, i) => <li key={i} className="text-[11px] text-amber-700">• {d}</li>)}
                            </ul>
                          )}
                        </div>
                        <button type="button" onClick={() => setInlineAlert(null)} className="text-amber-400 hover:text-amber-600 font-bold text-sm shrink-0">×</button>
                      </div>
                    </div>
                  )}
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
                                {showCoaching && <div className="text-[11px] text-slate-400">Auto-generated from LastName-TownST. Lock to prevent changes.</div>}
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
                                      🎓 <span className="font-bold">Loss Type:</span> Pick the primary peril — what happened first. Example: kitchen fire put out with water = Fire primary, Water secondary.
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
                                    {showCoaching && <div className="text-[11px] text-slate-400">e.g. Fire with water damage from firefighting, or water loss leading to mold.</div>}
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
                                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">Mold Suggestion:</span> Visible Mold was selected — consider adding Mold as a contaminant.
                                  </div>
                                )}
                                {attentionMold && (data.orderTypes||[]).includes("Mold") && !dismissedTips.has("Mold Confirmed") && (
                                  <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] text-violet-700">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); e.preventDefault(); const wrapper = e.target.parentElement; const label = wrapper?.querySelector('span.font-bold')?.textContent?.replace(/:$/, '') || ''; if (label) dismissTip(label); if (wrapper) wrapper.style.display = 'none'; }} className="float-right ml-2 px-1 text-violet-400 hover:text-violet-600 font-bold text-sm" title="Dismiss this tip">×</button>🎓 <span className="font-bold">Mold Confirmed:</span> Review severity and <button type="button" onClick={(e) => { e.stopPropagation(); jumpToSectionAndSubsection("sec4", "insurance"); }} className="underline underline-offset-2 font-bold text-violet-800 hover:text-violet-900">Mold coverage limit in Insurance</button>.
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
                                                            {showCoaching && !(data.severityCodes || []).length && <div className="text-[10px] text-slate-400 mb-1">Typically entered after the site inspection, not during intake.</div>}
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
                                    {SERVICE_OFFERINGS.map(s => (
                                      <ToggleMulti key={s} label={s} title={SERVICE_OFFERING_HELP[s] || "Services to be performed on this project."} checked={(data.serviceOfferings||[]).includes(s)} onChange={()=>update("serviceOfferings", toggleMulti(data.serviceOfferings||[], s))} />
                                    ))}
                                  </div>
                                </Field>
                            </SubSection>

                            <SubSection id="sec1-source" title="Source" open={sourceSubOpen} onToggle={(nextOpen) => setSourceSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("source") ? "audit-outline" : ""}>
                            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showCoaching} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={applyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={openCrmModal} onPromptRoleAssignment={openRoleAssignmentPrompt} />
                            </SubSection>

                            {/* Interview moved to slide-out panel — accessible from floating pill */}
                            <button
                              type="button"
                              onClick={() => setInterviewPanelOpen(true)}
                              className="w-full rounded-xl border border-violet-200 bg-violet-50/30 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">🎤</span>
                                  <span className="text-sm font-bold text-violet-700">Interview</span>
                                  {(data.damageWasWet || data.damageMoldMildew || data.livingStatus || data.repairsSummary || (data.packoutSummary||[]).length) && (
                                    <span className="text-[10px] text-violet-500">In progress</span>
                                  )}
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
                                                {showCoaching && <div className="text-xs text-slate-500 mb-1">Severity reject scale: 1 = None, 2 = Possible, 3 = Many expected, 5 = Extreme.</div>}
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
                                                {showCoaching && <div className="text-xs text-slate-500 mb-3">Rate specific contaminant levels. 0 = None, 3 = Severe. Typically completed after the site inspection — not during intake.</div>}
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
                                              {showCoaching && <div className="text-xs text-slate-500 mb-1">Customer's quality standard. Q1 = Highest (designer/luxury items), Q5 = Basic (everyday items).</div>}
                                              {suggestQ1 && <div className="mb-2 text-[10px] font-bold suggested-pill inline-flex rounded-full px-2 py-0.5">Suggested: Q1 — based on insurance carrier or premium service</div>}
                                              <div className="flex flex-wrap gap-2">{QUALITY_CODES.map(q => (<ToggleMulti key={q} label={q} checked={data.qualityCode === q} onChange={() => update("qualityCode", q)} />))}</div>
                                            </div>
                                            <div className="border-t border-slate-100 my-1"></div>
                                          <div><div className="mb-2 text-xs font-bold text-slate-400">HANDLING</div>{showCoaching && <div className="text-xs text-slate-500 mb-3">Special processing instructions. Hover each code for its meaning.</div>}<div className="flex flex-wrap gap-2">{HANDLING_META.map(([c, d]) => <ToggleMulti key={c} label={c} title={d} className="!px-3 !py-2 !text-sm" checked={data.handlingCodes.includes(c)} onChange={() => toggleHandling(c)} />)}</div></div>
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
                        {data.customers.map((c,i)=><CustomerItem key={c.id} c={c} index={i} total={data.customers.length} updateCust={updateCust} onRemove={removeCust} highlightMissing={data.highlightMissing} auditOn={auditOn} onAddHousehold={addHouseholdMember} onSendWelcome={handleSendWelcome} contacts={contacts} sdsConsiderations={data.sdsConsiderations || []} householdAnimals={data.householdAnimals || ""} onUpdatePets={(animals, considerations) => { update("householdAnimals", animals); update("sdsConsiderations", considerations); }} household={data.household || []} />)}
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
                              if (input) input.focus();
                            }, 50);
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
                                              <input data-household-id={m.id} value={m.name || ""} onChange={e => updateMember(m.id, "name", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (m.name?.trim()) setHouseholdEditOpen(false); } }} placeholder="Name, notes" className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400" />
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
                      </div>
                    </Section>

                    <Section id="sec3" noeSection="address" title="3. Address" helpText="Enter the job site + any related locations (temp housing, hotel, alt delivery)." isOpen={openSections.sec3} onHeaderClick={()=>handleToggleSection('sec3')} onCaretClick={()=>handleToggleSection('sec3')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec3") ? "audit-outline" : ""}
                    >
                      <div className="space-y-4">
                        {data.addresses.map((a,i)=><AddressItem key={a.id} addr={a} total={data.addresses.length} updateAddr={updateAddr} onRemove={removeAddr} index={i} highlightMissing={data.highlightMissing} auditOn={auditOn} onVerify={verifyAddressDemo} ToggleMulti={ToggleMulti} rentOrOwn={data.rentOrOwn} rentCoverageLimit={data.rentCoverageLimit} onRentOrOwnChange={(v)=>update("rentOrOwn", v)} onRentCoverageChange={(v)=>update("rentCoverageLimit", v)} forceShowCoords={i===0 ? showPrimaryCoords : false} autoOpenForTypePrompt={pendingAddressTypePromptId === a.id} autoFocusTypePrompt={pendingAddressTypePromptId === a.id} onTypePromptFocused={handleAddressTypePromptFocused} />)}
                        <div className="pt-2"><button onClick={addNewAddress} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Address</button></div>
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
                                        <button
                                          type="button"
                                          onClick={() => openCompanyRolePicker(role)}
                                          className={`md:col-span-5 w-full text-left rounded-lg px-2 py-1 text-sm transition hover:bg-slate-50`}
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
                                                        onClick={() => toggleRoleForContact(role.companyName, "", r.id || r.title?.toLowerCase())}
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
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openCompanyRolePicker(role)}
                                          className={`md:col-span-4 w-full text-left rounded-lg px-2 py-1 text-sm transition hover:bg-slate-50`}
                                          title="Edit contact"
                                        >
                                          {c?.name ? (
                                            <div className="flex flex-col">
                                              <div className="flex items-center justify-between gap-3">
                                                <span className={`font-medium ${isPlaceholderFlagActive(c?.placeholder) ? "placeholder-text" : "text-slate-700"}`}>{c.name}</span>
                                                <EditAffordance title="Edit contact" />
                                              </div>
                                              <span className="text-[11px] text-slate-500">{getTitleForContact(c.name) || "Contact"}</span>
                                              {getRolesForContact && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                  {getRolesForContact(role.companyName, c.name).map(r => (
                                                    toggleRoleForContact ? (
                                                      <button
                                                        key={`${role.id}-${c.name}-${r.title}`}
                                                        type="button"
                                                        onClick={() => toggleRoleForContact(role.companyName, c.name, r.id || r.title?.toLowerCase())}
                                                        className="rounded-full"
                                                        title="Click to toggle role"
                                                      >
                                                        <RoleBadge role={r} />
                                                      </button>
                                                    ) : (
                                                      <RoleBadge key={`${role.id}-${c.name}-${r.title}`} role={r} />
                                                    )
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-between gap-3">
                                              <span className="placeholder-text">
                                                Add contact
                                              </span>
                                              <EditAffordance title="Add contact" />
                                            </div>
                                          )}
                                        </button>
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
                                <Field label="Date of Loss" noeField="dateOfLoss"><DatePicker value={data.dateOfLoss} onChange={(v)=>update("dateOfLoss", v)} /></Field>
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
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Event Assignee">
                            <Input value={data.eventAssignee} onChange={e=>update("eventAssignee", e.target.value)} placeholder="Assignee" />
                          </Field>
                          <Field label="Vehicle">
                            <Input value={data.eventVehicle} onChange={e=>update("eventVehicle", e.target.value)} placeholder="Vehicle" />
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
                              </div>
                            )}
                            <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Who is contacting the customer?</div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <ToggleMulti label="Already contacted" checked={data.contactAssignment === "done"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "done" ? "" : "done" })} className="!text-[10px] !px-2.5 !py-1" />
                                  <ToggleMulti label="Rep will contact" checked={data.contactAssignment === "rep"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "rep" ? "" : "rep" })} className="!text-[10px] !px-2.5 !py-1" />
                                  <ToggleMulti label="Office please contact" checked={data.contactAssignment === "office"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "office" ? "" : "office" })} className="!text-[10px] !px-2.5 !py-1" />
                                  <ToggleMulti label="Enter only — do not contact" checked={data.contactAssignment === "enter-only"} onChange={() => updateMany({ contactAssignment: data.contactAssignment === "enter-only" ? "" : "enter-only" })} className="!text-[10px] !px-2.5 !py-1" />
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Log</div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button type="button" onClick={() => { const entry = { id: safeUid(), text: "Customer contact attempted", at: formatShortTimestamp(), user: data.currentUser || "Unknown" }; setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])] })); setToast("Contact attempt logged"); }} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100">
                                    Log Attempt
                                  </button>
                                  <button type="button" onClick={() => { const entry = { id: safeUid(), text: "Customer contacted", at: formatShortTimestamp(), user: data.currentUser || "Unknown" }; setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])], eventCustomerContacted: true })); setToast("Customer contacted"); }} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
                                    Customer Contacted
                                  </button>
                                  <button type="button" onClick={() => { const entry = { id: safeUid(), text: "Bill To contacted", at: formatShortTimestamp(), user: data.currentUser || "Unknown" }; setData(p => ({ ...p, eventNotes: [entry, ...(p.eventNotes || [])], eventBillToContacted: true })); setToast("Bill To contacted"); }} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
                                    Bill To Contacted
                                  </button>
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
                                    <div key={n.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                                      <div className="font-semibold">{n.text}</div>
                                      <div className="text-[10px] text-slate-500">{n.at} · {n.user || "Unknown"}</div>
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
                            {stripEventSystemLines(data.eventInstructions || "").trim() && (
                              <div className="border-t border-slate-200 pt-2 mt-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instructions</div>
                                <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{stripEventSystemLines(data.eventInstructions || "").trim().slice(0, 300)}{stripEventSystemLines(data.eventInstructions || "").trim().length > 300 ? "..." : ""}</div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              <button onClick={handleConfirmClick} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">Send Confirmation</button>
                              <button onClick={openReminderModal} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${data.reminderEnabled ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300"}`}>{data.reminderEnabled ? "Edit Reminder" : "Set Reminder"}</button>
                            </div>
                          </div>
                        )}
                        </SubSection>
                        <SubSection id="sec5-bridge" title="Scope Update and Blockers" open={scheduleBridgeOpen} onToggle={(nextOpen) => setScheduleBridgeOpen(!!nextOpen)} compact={compactMode} className={bridgeSectionClass}>
                          <div className="space-y-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowSdsPreview(true)}
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

                            <div className={`rounded-lg border p-3 space-y-4 ${bridgeStatusClass}`}>
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

                              <div className="rounded-lg border border-slate-200/80 bg-white p-3 space-y-3">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Blockers</div>
                                <div className="grid gap-3 lg:grid-cols-2">
                                  {groupedBridgeIssues.map((group) => (
                                    <div key={group.id} className="rounded-lg border border-slate-200/80 bg-white p-2">
                                      <div className="px-1 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">{group.label}</div>
                                      <div className="space-y-1.5">
                                        {group.rows.map(({ issue, active }) => {
                                          const isAuto = BRIDGE_AUTO_MANAGED_BLOCKERS.includes(issue);
                                          const isEstimateIssue = issue === "Customer Wants Estimate" || issue === "Adjuster Wants Estimate";
                                          const showEstimateDetails = active && isEstimateIssue && !!data.estimateRequested;
                                          const showAuthDetails = active && issue === "Won't Sign Authorization";
                                          return (
                                            <button
                                              key={issue}
                                              type="button"
                                              onClick={() => toggleScopeBridgeIssue(issue)}
                                              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                                                active
                                                  ? "border-sky-300 bg-sky-50"
                                                  : "border-slate-200 bg-white hover:border-sky-200"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-slate-700">{issue.replace("Customer Wants Estimate", "Wants Estimate").replace("Adjuster Wants Estimate", "Wants estimate")}</span>
                                                <span className={`text-[10px] font-bold ${active ? "text-sky-700" : "text-slate-400"}`}>{active ? "ON" : "OFF"}</span>
                                              </div>
                                              {isAuto ? (
                                                <div className="mt-1 text-[10px] font-semibold text-slate-500">Auto-linked</div>
                                              ) : null}
                                              {showAuthDetails ? (
                                                <div className="mt-1 text-[10px] text-slate-500">
                                                  {authorizationOnFile ? "Authorization marked as blocker." : "Auto-on until authorization is on file."}
                                                </div>
                                              ) : null}
                                              {showEstimateDetails ? (
                                                <div className="mt-1 text-[10px] text-slate-500">
                                                  {bridgeEstimateDetails || "Estimate required."}
                                                </div>
                                              ) : null}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${bridgeStageToneClass(selectedOption.tone, true)}`}>
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
                                        <div className="w-full px-0.5 text-center text-[10px] font-semibold leading-tight text-slate-700">
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
                                        <div className="w-full px-0.5 text-center text-[10px] font-semibold leading-tight text-slate-700">
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
                                        <div className="w-full px-0.5 text-center text-[10px] font-semibold leading-tight text-slate-700">
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
                                <label className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 cursor-pointer hover:bg-sky-100">
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
                                    <div className="text-[10px] text-slate-400">Tip: Click "Cover" on a photo to set it as the SDS cover image.</div>
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
                                            className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5"
                                          />
                                          <input
                                            type="text"
                                            value={photo.note || ""}
                                            onChange={(e) => update("sdsPhotos", (data.sdsPhotos || []).map(p => p.id === photo.id ? { ...p, note: e.target.value } : p))}
                                            placeholder="Note"
                                            className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5"
                                          />
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              onClick={() => update("sdsCoverPhoto", data.sdsCoverPhoto === photo.id ? null : photo.id)}
                                              className={`text-[9px] font-bold rounded px-1.5 py-0.5 ${photo.id === data.sdsCoverPhoto ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-sky-50'}`}
                                            >
                                              Cover
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => update("sdsPhotos", (data.sdsPhotos || []).filter(p => p.id !== photo.id))}
                                              className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-rose-500 hover:bg-rose-50"
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
                              <div className="text-[10px] font-bold uppercase tracking-widest text-sky-200 mb-2">Bridge Summary</div>
                              <div className="rounded-md border border-white/15 bg-white/5 px-2 py-2 text-xs leading-relaxed text-slate-100">
                                {scopeBridgeSnippet || "Set status and blockers to generate the bridge summary."}
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
                />
              )}

            </div>
        </div>

        <FloatingCapsule
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            onSave={handleSaveClick}
            setShowSearch={setShowSearch}
            onInterview={() => setInterviewPanelOpen(v => !v)}
            interviewPanelOpen={interviewPanelOpen}
            onActionItems={() => setActionItemsOpen(v => !v)}
            actionItemsOpen={actionItemsOpen}
            actionItemCount={(() => { try { return computeAuditMissing().length; } catch { return 0; } })()}
            modeButtonFlash={modeButtonFlash}
        />

        {/* Interview Docked Side Panel */}
        {interviewPanelOpen && (
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-[110] bg-white shadow-2xl flex flex-col border-l border-slate-200">
              {(() => {
                const interviewQuestions = [
                  { key: "conditions", title: "Is anything still wet or damaged?", configKey: "damageWasWet",
                    isAnswered: () => data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp,
                    summary: () => [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural" : "", data.noLights ? "No Power" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""].filter(Boolean).join(", ") },
                  { key: "repairs", title: "What repairs are being done?", configKey: "repairsSummary",
                    isAnswered: () => !!data.repairsSummary,
                    summary: () => data.repairsSummary || "" },
                  { key: "living", title: "Where will the customer live during repairs?", configKey: "livingStatus",
                    isAnswered: () => !!data.livingStatus,
                    summary: () => data.livingStatus || "" },
                  { key: "delivery", title: "Where should we make final delivery?", configKey: "processType",
                    isAnswered: () => !!data.processType,
                    summary: () => data.processType || "" },
                  { key: "packout", title: "What are we picking up?", configKey: "packoutSummary",
                    isAnswered: () => (data.packoutSummary || []).length > 0,
                    summary: () => (data.packoutSummary || []).join(", ") },
                  { key: "loadList", title: "What do we need to bring?", configKey: "loadList",
                    isAnswered: () => (data.loadList || []).length > 0,
                    summary: () => (data.loadList || []).join(", ") },
                  { key: "considerations", title: "Special considerations", configKey: "sdsConsiderations",
                    isAnswered: () => (data.sdsConsiderations || []).length > 0,
                    summary: () => (data.sdsConsiderations || []).join(", ") },
                  { key: "medical", title: "Medical issues?", configKey: "familyMedicalIssues", isAnswered: () => !!data.familyMedicalIssues, summary: () => data.familyMedicalIssues === "Y" ? "Yes" : "No" },
                  { key: "allergies", title: "Soap/fragrance allergies?", configKey: "soapFragAllergies", isAnswered: () => !!data.soapFragAllergies, summary: () => data.soapFragAllergies === "Y" ? "Yes" : "No" },
                  { key: "selfClean", title: "Self-clean anything?", configKey: "selfCleaning", isAnswered: () => !!data.selfCleaning, summary: () => data.selfCleaning === "Y" ? "Yes" : "No" },
                  { key: "dryCleaner", title: "Use dry cleaner?", configKey: "useDryCleaner", isAnswered: () => !!data.useDryCleaner, summary: () => data.useDryCleaner || "" },
                  { key: "laundry", title: "How dry laundry?", configKey: "howDryLaundry", isAnswered: () => !!data.howDryLaundry, summary: () => data.howDryLaundry || "" },
                  { key: "storage", title: "Need storage?", configKey: "storageNeeded", isAnswered: () => !!data.storageNeeded, summary: () => data.storageNeeded === "Y" ? "Yes" : "No" },
                ];
                const visibleQuestions = interviewQuestions.filter(q => isFieldVisible(q.configKey));
                const answeredCount = visibleQuestions.filter(q => q.isAnswered()).length;
                const logAnswer = (key) => {
                  setData(p => ({ ...p, interviewLog: { ...(p.interviewLog || {}), [key]: { user: p.currentUser || "Unknown", at: formatShortTimestamp() } } }));
                };
                const getLog = (key) => (data.interviewLog || {})[key];
                return (
                  <>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-violet-50 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎤</span>
                      <span className="text-sm font-bold text-violet-800">Interview</span>
                      <span className="text-xs text-violet-500">{answeredCount} of {visibleQuestions.length}</span>
                    </div>
                    <button onClick={() => setInterviewPanelOpen(false)} className="text-violet-400 hover:text-violet-600 text-lg font-bold">×</button>
                  </div>
                  <div className="px-5 py-2 border-b border-slate-100">
                    <div className="relative">
                      <input value={interviewSearch} onChange={e => setInterviewSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-lg border border-slate-200 px-3 py-1.5 pr-7 text-xs text-slate-700 outline-none focus:border-violet-300 bg-slate-50/50" />
                      {interviewSearch && <button type="button" onClick={() => setInterviewSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">×</button>}
                    </div>
                  </div>
                  </> );
              })()}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {showCoaching && !interviewSearch && <div className="text-xs text-slate-400 mb-2">Ask the customer these questions during or before the initial visit.</div>}

                {isFieldVisible("damageWasWet") && matchesInterviewSearch("Is anything still wet or damaged", "Still Wet Visible Mold Structural Damage No Electricity No Heat Boarded Up") && (() => {
                  const answered = data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp;
                  const summary = [data.damageWasWet === "Y" || data.damageWasWet === true ? "Still Wet" : "", data.damageMoldMildew ? "Visible Mold" : "", data.structuralElectricDamage === "Y" ? "Structural" : "", data.noLights ? "No Power" : "", data.noHeat ? "No Heat" : "", data.boardedUp ? "Boarded Up" : ""].filter(Boolean).join(", ");
                  const log = (data.interviewLog || {}).conditions;
                  const expanded = interviewExpanded.conditions !== false;
                  return <div className={`rounded-xl border ${answered ? 'border-emerald-200' : 'border-slate-200'} bg-white overflow-hidden`}>
                  <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, conditions: !p.conditions})); if (!log) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), conditions: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                    <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("Is anything still wet or damaged?")}</div>
                    {answered && !expanded && <div className="flex items-center gap-2"><span className="text-xs text-emerald-600">{summary}</span>{log && <span className="text-[9px] text-slate-300">{log.user} · {log.at}</span>}</div>}
                  </button>
                  {expanded && <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "wet", label: "Still Wet", active: data.damageWasWet === "Y" || data.damageWasWet === true, onToggle: () => updateSmart("damageWasWet", (data.damageWasWet === "Y" || data.damageWasWet === true) ? "N" : "Y") },
                      { id: "mold", label: "Visible Mold", active: !!data.damageMoldMildew, onToggle: () => updateSmart("damageMoldMildew", !data.damageMoldMildew) },
                      { id: "structural", label: "Structural Damage", active: data.structuralElectricDamage === "Y", onToggle: () => update("structuralElectricDamage", data.structuralElectricDamage === "Y" ? "N" : "Y") },
                      { id: "lights", label: "No Electricity", active: !!data.noLights, onToggle: () => updateSmart("noLights", !data.noLights) },
                      { id: "heat", label: "No Heat", active: !!data.noHeat, onToggle: () => updateSmart("noHeat", !data.noHeat) },
                      { id: "boarded", label: "Boarded Up", active: !!data.boardedUp, onToggle: () => updateSmart("boardedUp", !data.boardedUp) },
                    ].map(item => (
                      <ToggleMulti key={item.id} label={item.label} checked={item.active} onChange={() => { item.onToggle(); executeInterviewActions(item.label, !item.active); }} className={`!px-3 !py-2 !text-sm ${isSearchMatch(item.label) ? "!ring-2 !ring-yellow-400" : ""}`} />
                    ))}
                  </div>
                  {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, conditions: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), conditions: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                  </div>}
                </div>;
                })()}

                {isFieldVisible("repairsSummary") && matchesInterviewSearch("repairs", "Just Cleaning Paint Refinish Floors Replace Floors Cosmetic Damage Major Structural Complete Rebuild") && (() => {
                  const answered = !!data.repairsSummary;
                  const summary = data.repairsSummary || "";
                  const log = (data.interviewLog || {}).repairs;
                  const expanded = interviewExpanded.repairs !== false;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, repairs: !p.repairs})); if (!log && answered) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), repairs: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("What repairs are being done?")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["Just Cleaning", "Paint", "Refinish Floors", "Replace Floors", "Cosmetic Damage", "Major Structural Damage", "Complete Rebuild"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.repairsSummary || "").includes(s)} onChange={() => {
                            const current = (data.repairsSummary || "").split(", ").filter(Boolean);
                            const isAdding = !current.includes(s);
                            const next = isAdding ? [...current, s] : current.filter(x => x !== s);
                            update("repairsSummary", next.join(", "));
                            executeInterviewActions(s, isAdding);
                          }} className={`!px-3 !py-2 !text-sm ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, repairs: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), repairs: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                    </div>}
                  </div>;
                })()}

                {/* Living Status */}
                {isFieldVisible("livingStatus") && matchesInterviewSearch("customer live during repairs", "Staying in home Hotel Temp Moving") && (() => {
                  const answered = !!data.livingStatus; const log = (data.interviewLog || {}).living; const expanded = !answered || interviewExpanded.living;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, living: !p.living}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("Where will the customer live during repairs?")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 ml-2">{data.livingStatus}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "Staying in home" }, { label: "Hotel" }, { label: "Temp" }, { label: "Moving" }].map(s => (
                          <ToggleMulti key={s.label} label={s.label} checked={data.livingStatus === s.label} onChange={() => { updateLivingStatus(data.livingStatus === s.label ? "" : s.label); if (s.label !== data.livingStatus) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), living: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className={`!px-3 !py-1.5 !text-xs ${isSearchMatch(s.label) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {livingAddressPrompt.open && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 space-y-2">
                          <div className="text-xs font-bold text-amber-800">Add {livingAddressPrompt.type} address?</div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={closeLivingAddressPrompt} className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-50">Not Now</button>
                            <button type="button" onClick={() => addLivingAddressFromPrompt("placeholder")} className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Create Placeholder</button>
                            <button type="button" onClick={() => addLivingAddressFromPrompt("full")} className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Enter Address Now</button>
                          </div>
                        </div>
                      )}
                    </div>}
                  </div>;
                })()}

                {/* Delivery */}
                {isFieldVisible("processType") && matchesInterviewSearch("final delivery", "Return Home ASAP Temp Address New Home Store Until Repaired") && (() => {
                  const answered = !!data.processType; const log = (data.interviewLog || {}).delivery; const expanded = !answered || interviewExpanded.delivery;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, delivery: !p.delivery}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("Where should we make final delivery?")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 ml-2">{data.processType}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {[{ label: "Return to Home ASAP", value: "Deliver ASAP" }, { label: "To Temp Address", value: "Deliver to Temp" }, { label: "To New Home", value: "Deliver to New Home" }, { label: "Store Until Home Repaired", value: "Long-Term Storage" }].map(s => (
                          <ToggleMulti key={s.value} label={s.label} checked={data.processType === s.value} onChange={() => { update("processType", data.processType === s.value ? "" : s.value); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), delivery: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className={`!px-3 !py-1.5 !text-xs ${isSearchMatch(s.label) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                    </div>}
                  </div>;
                })()}

                {/* Packout */}
                {isFieldVisible("packoutSummary") && matchesInterviewSearch("picking up", "Rugs Window Treatments Clothing Bedding Furniture Art Electronics Hardware Appliances") && (() => {
                  const answered = (data.packoutSummary || []).length > 0; const summary = (data.packoutSummary || []).join(", "); const log = (data.interviewLog || {}).packout; const expanded = interviewExpanded.packout !== false;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, packout: !p.packout}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("What are we picking up?")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["Rugs", "Window Treatments", "Clothing", "Bedding", "Furniture", "Art", "Electronics", "Hardware", "Appliances"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.packoutSummary || []).includes(s)} onChange={() => { const isAdding = !(data.packoutSummary || []).includes(s); update("packoutSummary", toggleMulti(data.packoutSummary || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-3 !py-2 !text-sm ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, packout: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), packout: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                    </div>}
                  </div>;
                })()}

                {/* Load List */}
                {isFieldVisible("loadList") && matchesInterviewSearch("need to bring", "Tall Ladder Extra Manpower Floor Protection Dollies Wardrobe Boxes TV Boxes Blankets Plastic Bags") && (() => {
                  const answered = (data.loadList || []).length > 0; const summary = (data.loadList || []).join(", "); const log = (data.interviewLog || {}).loadList; const expanded = interviewExpanded.loadList !== false;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, loadList: !p.loadList}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("What do we need to bring?")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["Tall Ladder", "Extra Manpower", "Floor Protection", "Dollies", "Wardrobe Boxes", "TV Boxes", "Blankets", "Plastic Bags"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.loadList || []).includes(s)} onChange={() => update("loadList", toggleMulti(data.loadList || [], s))} className={`!px-3 !py-2 !text-sm ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, loadList: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), loadList: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                    </div>}
                  </div>;
                })()}

                {/* Considerations */}
                {isFieldVisible("sdsConsiderations") && matchesInterviewSearch("special considerations", "Elderly Pregnancy Baby Hearing Impaired Spanish Only Respiratory Concerns Premium Brands Skin Sensitivity Pets") && (() => {
                  const answered = (data.sdsConsiderations || []).length > 0; const summary = (data.sdsConsiderations || []).join(", "); const log = (data.interviewLog || {}).considerations; const expanded = interviewExpanded.considerations !== false;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, considerations: !p.considerations}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("Special considerations")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {["Elderly", "Pregnancy", "Baby", "Hearing Impaired", "Spanish Only", "Respiratory Concerns", "Premium Brands", "Skin Sensitivity", "Pets"].map(s => (
                          <ToggleMulti key={s} label={s} checked={(data.sdsConsiderations || []).includes(s)} onChange={() => { const isAdding = !(data.sdsConsiderations || []).includes(s); update("sdsConsiderations", toggleMulti(data.sdsConsiderations || [], s)); executeInterviewActions(s, isAdding); }} className={`!px-3 !py-2 !text-sm ${isSearchMatch(s) ? "!ring-2 !ring-yellow-400" : ""}`} />
                        ))}
                      </div>
                      {((data.sdsConsiderations || []).some(c => ["Skin Sensitivity", "Respiratory Concerns", "Pregnancy"].includes(c))) && (
                        <div className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2.5 space-y-2">
                          <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Handling Codes</div>
                          <div className="flex flex-wrap gap-1.5">
                            {[["Det","special detergent"], ["NoDC","no dry clean"], ["Low","low heat"], ["NoDry","no dryer"], ["PPE","wear PPE"], ["Hand","hand finish"]].map(([code, desc]) => (
                              <ToggleMulti key={code} label={code} title={desc} checked={(data.handlingCodes || []).includes(code)} onChange={() => update("handlingCodes", toggleMulti(data.handlingCodes || [], code))} className="!text-[10px] !px-2 !py-1" />
                            ))}
                          </div>
                          <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="Specific allergies or sensitivities" className="!text-xs !py-1.5" />
                        </div>
                      )}
                      {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, considerations: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), considerations: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                    </div>}
                  </div>;
                })()}

                {/* Customer Preferences */}
                {/* Individual preference questions */}
                {[
                  { key: "medical", configKey: "familyMedicalIssues", title: "Any medical issues?", searchTerms: "medical health asthma", isAnswered: () => !!data.familyMedicalIssues, summary: () => data.familyMedicalIssues === "Y" ? `Yes${data.familyMedicalNote ? ": " + data.familyMedicalNote : ""}` : "No" },
                  { key: "allergies", configKey: "soapFragAllergies", title: "Soap or fragrance allergies?", searchTerms: "allergy allergies detergent soap fragrance sensitive", isAnswered: () => !!data.soapFragAllergies, summary: () => data.soapFragAllergies === "Y" ? `Yes${data.soapFragNote ? ": " + data.soapFragNote : ""}` : "No" },
                  { key: "selfClean", configKey: "selfCleaning", title: "Self-clean anything?", searchTerms: "drawers undergarments linens towels baby items clean themselves", isAnswered: () => !!data.selfCleaning, summary: () => data.selfCleaning === "Y" ? `Yes${data.selfCleaningNote ? ": " + data.selfCleaningNote : ""}` : "No" },
                  { key: "dryCleaner", configKey: "useDryCleaner", title: "Use a dry cleaner?", searchTerms: "dry cleaner dry cleaning", isAnswered: () => !!data.useDryCleaner, summary: () => data.useDryCleaner || "" },
                  { key: "laundry", configKey: "howDryLaundry", title: "How do they dry laundry?", searchTerms: "air dry low heat dryer machine", isAnswered: () => !!data.howDryLaundry, summary: () => data.howDryLaundry || "" },
                  { key: "storage", configKey: "storageNeeded", title: "Need storage?", searchTerms: "storage months long term warehouse", isAnswered: () => !!data.storageNeeded, summary: () => data.storageNeeded === "Y" ? `Yes${data.storageMonths ? ", " + data.storageMonths + " months" : ""}` : "No" },
                ].filter(q => isFieldVisible(q.configKey) && matchesInterviewSearch(q.title, q.searchTerms || "")).map(q => {
                  const answered = q.isAnswered(); const log = (data.interviewLog || {})[q.key];
                  const needsFollowUp = (q.key === "storage" && data.storageNeeded === "Y") || (q.key === "medical" && data.familyMedicalIssues === "Y") || (q.key === "allergies" && data.soapFragAllergies === "Y") || (q.key === "selfClean" && data.selfCleaning === "Y");
                  const expanded = !answered || interviewExpanded[q.key] || (needsFollowUp && interviewExpanded[q.key] !== false);
                  return (
                    <div key={q.key} className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                      <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, [q.key]: !p[q.key]})); if (answered && !log) setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), [q.key]: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                        <div className={`${expanded ? 'text-xs' : 'text-[11px]'} font-bold text-sky-600`}>{highlightSearch(q.title)}</div>
                        {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{q.summary()}</span>}
                      </button>
                      {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                      {expanded && <div className="px-3 pb-3">
                        {q.key === "medical" && <>
                          <ToggleGroup options={["Y","N"]} value={data.familyMedicalIssues || ""} onChange={v => { update("familyMedicalIssues", v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), medical: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.familyMedicalIssues === "Y" && <Input value={data.familyMedicalNote || ""} onChange={e => update("familyMedicalNote", e.target.value)} placeholder="What medical issues?" className="!text-xs mt-2" />}
                        </>}
                        {q.key === "allergies" && <>
                          <ToggleGroup options={["Y","N"]} value={data.soapFragAllergies || ""} onChange={v => { update("soapFragAllergies", v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), allergies: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.soapFragAllergies === "Y" && <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="What allergies?" className="!text-xs mt-2" />}
                        </>}
                        {q.key === "selfClean" && <>
                          <ToggleGroup options={["Y","N"]} value={data.selfCleaning || ""} onChange={v => { update("selfCleaning", v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), selfClean: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
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
                        {q.key === "laundry" && <ToggleGroup options={["Air-Dry","Low Heat","Dryer"]} value={data.howDryLaundry || ""} onChange={v => { updateHowDry(v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), laundry: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />}
                        {q.key === "storage" && <>
                          <ToggleGroup options={["Y","N"]} value={data.storageNeeded || ""} onChange={v => { update("storageNeeded", v); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), storage: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} />
                          {data.storageNeeded === "Y" && <div className="flex items-center gap-2 mt-2"><span className="text-xs text-slate-600">Months?</span><Input className="w-16 !text-xs" value={data.storageMonths || ""} onChange={e => update("storageMonths", e.target.value)} placeholder="#" /></div>}
                        </>}
                      </div>}
                    </div>
                  );
                })}
                {false && isFieldVisible("familyMedicalIssues") && (() => {
                  const answered = false;
                  const summary = "";
                  const log = null; const expanded = true;
                  return <div className={`rounded-xl border ${answered && !expanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} overflow-hidden`}>
                    <button type="button" onClick={() => setInterviewExpanded(p => ({...p, preferences: !p.preferences}))} className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50">
                      <div className={`${expanded ? 'text-sm' : 'text-xs'} font-bold text-sky-600`}>{highlightSearch("Customer preferences")}</div>
                      {answered && !expanded && <span className="text-[10px] text-emerald-600 truncate ml-2">{summary}</span>}
                    </button>
                    {answered && !expanded && log && <div className="px-3 pb-1 text-[8px] text-slate-400">{log.user} · {log.at}</div>}
                    {expanded && <div className="px-4 pb-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                          <span className="text-xs text-slate-700">Medical issues?</span>
                          <ToggleGroup options={["Y","N"]} value={data.familyMedicalIssues || ""} onChange={v => update("familyMedicalIssues", v)} />
                        </div>
                        {data.familyMedicalIssues === "Y" && <Input value={data.familyMedicalNote || ""} onChange={e => update("familyMedicalNote", e.target.value)} placeholder="What medical issues?" className="!text-xs" />}
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                          <span className="text-xs text-slate-700">Soap/fragrance allergies?</span>
                          <ToggleGroup options={["Y","N"]} value={data.soapFragAllergies || ""} onChange={v => update("soapFragAllergies", v)} />
                        </div>
                        {data.soapFragAllergies === "Y" && <Input value={data.soapFragNote || ""} onChange={e => update("soapFragNote", e.target.value)} placeholder="What allergies?" className="!text-xs" />}
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                          <span className="text-xs text-slate-700">Self-clean anything?</span>
                          <ToggleGroup options={["Y","N"]} value={data.selfCleaning || ""} onChange={v => update("selfCleaning", v)} />
                        </div>
                        {data.selfCleaning === "Y" && (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1.5">
                              {["Drawers", "Undergarments", "Linens", "Towels", "Baby Items"].map(item => {
                                const active = (data.selfCleaningNote || "").toLowerCase().includes(item.toLowerCase());
                                return <button key={item} type="button" onClick={() => { const note = data.selfCleaningNote || ""; if (active) update("selfCleaningNote", note.split(/,\s*/).filter(s => s.toLowerCase() !== item.toLowerCase()).join(", ")); else update("selfCleaningNote", note ? `${note}, ${item}` : item); }} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${active ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>{item}</button>;
                              })}
                            </div>
                            <Input value={data.selfCleaningNote || ""} onChange={e => update("selfCleaningNote", e.target.value)} placeholder="Additional notes..." className="!text-xs" />
                          </div>
                        )}
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                          <span className="text-xs text-slate-700">How do they dry laundry?</span>
                          <ToggleGroup options={["Air-Dry","Low Heat","Dryer"]} value={data.howDryLaundry || ""} onChange={v => updateHowDry(v)} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                          <span className="text-xs text-slate-700">Need storage?</span>
                          <ToggleGroup options={["Y","N"]} value={data.storageNeeded || ""} onChange={v => update("storageNeeded", v)} />
                        </div>
                        {data.storageNeeded === "Y" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">How many months?</span>
                            <Input className="w-20 !text-xs" value={data.storageMonths || ""} onChange={e => update("storageMonths", e.target.value)} placeholder="#" />
                          </div>
                        )}
                      </div>
                      {answered && <button type="button" onClick={() => { setInterviewExpanded(p => ({...p, preferences: false})); setData(p => ({...p, interviewLog: {...(p.interviewLog||{}), preferences: {user: p.currentUser || "Unknown", at: formatShortTimestamp()}}})); }} className="text-xs font-bold text-sky-600 hover:text-sky-700">Done</button>}
                    </div>}
                  </div>;
                })()}
              </div>
              <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onClick={() => setInterviewPanelOpen(false)} className="rounded-lg bg-violet-500 px-5 py-2 text-sm font-bold text-white hover:bg-violet-600">Done</button>
              </div>
          </div>
        )}

        {/* Action Items Panel */}
        {actionItemsOpen && (() => {
          const missing = computeAuditMissing();
          const blockers = (scopeBridgeState.pendingIssues || []).filter(Boolean);
          const placeholders = [
            ...(data.customers || []).filter(c => {
              if (isPlaceholderFlagActive(c?.placeholder)) return true;
              const hasName = hasMeaningfulValue(c?.first) && hasMeaningfulValue(c?.last);
              const hasContact = hasMeaningfulValue(c?.phone) || hasMeaningfulValue(c?.email);
              return !hasName || (hasMeaningfulValue(c?.first) && !hasContact);
            }).map(c => ({ label: [c.first, c.last].filter(Boolean).join(" ") || "Customer", section: "sec2", type: "customer" })),
            ...(data.addresses || []).filter(a => !a.inactive && isAddressPlaceholder(a)).map(a => ({ label: a.type || "Address", section: "sec3", type: "address" })),
            ...(data.vendors || []).filter(v => v.incomplete).map(v => ({ label: v.contact || v.company || "Company", section: "sec4", type: "company" })),
          ];
          return (
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-[110] bg-white shadow-2xl flex flex-col border-l border-slate-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-amber-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span className="text-sm font-bold text-amber-800">Action Items</span>
                    <span className="text-xs text-amber-600">{missing.length + placeholders.length + blockers.length} items</span>
                  </div>
                  <button onClick={() => setActionItemsOpen(false)} className="text-amber-400 hover:text-amber-600 text-lg font-bold">×</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {blockers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Blockers</div>
                      <div className="space-y-1">
                        {blockers.map((b, i) => (
                          <button key={`b-${i}`} onClick={() => { setActionItemsOpen(false); jumpToSection("sec5"); setTimeout(() => setScheduleBridgeOpen(true), 150); }} className="w-full text-left rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs text-rose-800 hover:bg-rose-50">
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {placeholders.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Placeholders</div>
                      <div className="space-y-1">
                        {placeholders.map((p, i) => (
                          <button key={`ph-${i}`} onClick={() => { setActionItemsOpen(false); setOpenSections(prev => ({ sec1: p.section === "sec1", sec2: p.section === "sec2", sec3: p.section === "sec3", sec4: p.section === "sec4", sec5: p.section === "sec5" })); setActiveSection(p.section); }} className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800 hover:bg-amber-50">
                            <span className="font-bold">{p.label}</span> <span className="text-amber-600">— {p.type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {missing.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Missing Fields</div>
                      <div className="space-y-1">
                        {missing.map((m, i) => (
                          <button key={`m-${i}`} onClick={() => { setActionItemsOpen(false); focusAuditItem(m); }} className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:border-sky-300">
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
            <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 shadow-sm z-10">
              <span className="text-sm font-bold text-slate-700">Field Configuration</span>
              <input
                value={configSearch}
                onChange={e => setConfigSearch(e.target.value)}
                placeholder="Search fields..."
                className="ml-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400 w-48"
              />
              <span className="text-xs text-slate-400">{Object.keys(fieldConfig).length} fields</span>
              <div className="flex-1" />
              {configSelectedKeys.size > 0 && (
                <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-bold text-sky-700">{configSelectedKeys.size} selected</span>
                  <button onClick={() => { setFieldConfig(prev => { const next = {...prev}; configSelectedKeys.forEach(k => { if (next[k]) next[k] = {...next[k], requiredInAudit: true}; }); return next; }); }} className="rounded-full border border-sky-300 bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 hover:bg-sky-50">Required: On</button>
                  <button onClick={() => { setFieldConfig(prev => { const next = {...prev}; configSelectedKeys.forEach(k => { if (next[k]) next[k] = {...next[k], requiredInAudit: false}; }); return next; }); }} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50">Required: Off</button>
                  <button onClick={() => { setFieldConfig(prev => { const next = {...prev}; configSelectedKeys.forEach(k => { if (next[k]) next[k] = {...next[k], visible: true}; }); return next; }); }} className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50">Show</button>
                  <button onClick={() => { setFieldConfig(prev => { const next = {...prev}; configSelectedKeys.forEach(k => { if (next[k]) next[k] = {...next[k], visible: false}; }); return next; }); }} className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50">Hide</button>
                  <button onClick={() => setConfigSelectedKeys(new Set())} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                </div>
              )}
              <button onClick={() => { setFieldConfig({...DEFAULT_FIELD_CONFIG}); setBlockerRules([...DEFAULT_BLOCKER_RULES]); setToast("Reset to defaults"); }} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200">Reset Defaults</button>
              <button onClick={() => setShowFieldConfig(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200">Close</button>
            </div>
            <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full space-y-6">
              {FIELD_CONFIG_SECTIONS.map(section => {
                const searchLower = configSearch.toLowerCase().trim();
                const keys = Object.keys(fieldConfig).filter(k => {
                  if (fieldConfig[k].category !== section.id) return false;
                  if (!searchLower) return true;
                  return fieldConfig[k].label.toLowerCase().includes(searchLower) || k.toLowerCase().includes(searchLower) || (fieldConfig[k].coaching || "").toLowerCase().includes(searchLower);
                });
                if (!keys.length) return null;
                const allSelected = keys.every(k => configSelectedKeys.has(k));
                return (
                  <div key={section.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <input type="checkbox" checked={allSelected} onChange={() => {
                        setConfigSelectedKeys(prev => {
                          const next = new Set(prev);
                          if (allSelected) keys.forEach(k => next.delete(k));
                          else keys.forEach(k => next.add(k));
                          return next;
                        });
                      }} className="h-4 w-4 rounded" />
                      <span className="text-sm font-bold text-slate-700">{section.label}</span>
                      <span className="text-xs text-slate-400">{keys.length} fields</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {keys.map(key => {
                        const cfg = fieldConfig[key];
                        const selected = configSelectedKeys.has(key);
                        return (<React.Fragment key={key}>
                          <div className={`flex items-center gap-3 px-4 py-2 text-sm ${!cfg.visible ? 'bg-slate-50/50 opacity-60' : ''}`}>
                            <input type="checkbox" checked={selected} onChange={() => {
                              setConfigSelectedKeys(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
                            }} className="h-3.5 w-3.5 rounded" />
                            <span className="text-xs font-semibold text-slate-700 w-44 truncate" title={key}>{cfg.label}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setFieldConfig(prev => ({...prev, [key]: {...prev[key], visible: !prev[key].visible}}))} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.visible ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                                {cfg.visible ? 'Visible' : 'Hidden'}
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setFieldConfig(prev => ({...prev, [key]: {...prev[key], requiredInAudit: !prev[key].requiredInAudit}}))} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.requiredInAudit ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-400'}`}>
                                {cfg.requiredInAudit ? 'Required' : 'Optional'}
                              </button>
                            </div>
                            <select value={cfg.requiredAtStatus || "always"} onChange={e => setFieldConfig(prev => ({...prev, [key]: {...prev[key], requiredAtStatus: e.target.value}}))} className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 bg-white">
                              <option value="always">Always</option>
                              <option value="never">Never</option>
                              <option value="Intake Complete">Intake Complete</option>
                              <option value="Pickup Complete">Pickup Complete</option>
                              <option value="Tagging Complete">Tagging Complete</option>
                              <option value="Ready to Bill">Ready to Bill</option>
                            </select>
                            {cfg.selectType && (
                              <button onClick={() => setFieldConfig(prev => ({...prev, [key]: {...prev[key], selectType: prev[key].selectType === "multi" ? "single" : "multi"}}))} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cfg.selectType === "multi" ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-400'}`}>
                                {cfg.selectType === "multi" ? "Multi" : "Single"}
                              </button>
                            )}
                            {cfg.condition && <span className="text-[9px] text-slate-400 truncate" title={JSON.stringify(cfg.condition)}>Conditional</span>}
                            <button onClick={() => setFieldConfig(prev => ({...prev, [key]: {...prev[key], _coachingOpen: !prev[key]._coachingOpen}}))} className={`text-[10px] ${cfg.coaching ? 'text-violet-500' : 'text-slate-300'} hover:text-violet-600`} title={cfg.coaching || "Add coaching text"}>🎓</button>
                            <div className="flex-1" />
                            <span className="text-[9px] text-slate-300 font-mono">{key}</span>
                          </div>
                          {cfg._coachingOpen && (
                            <div className="px-4 pb-2 flex items-start gap-2">
                              <span className="text-[10px] text-violet-500 shrink-0 pt-1">🎓</span>
                              <input
                                value={cfg.coaching || ""}
                                onChange={e => setFieldConfig(prev => ({...prev, [key]: {...prev[key], coaching: e.target.value}}))}
                                placeholder="Enter coaching guidance for this field..."
                                className="flex-1 rounded border border-violet-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-violet-400 bg-violet-50/30"
                              />
                            </div>
                          )}
                        </React.Fragment>);
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Blocker Rules */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Auto-Blocker Rules</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {blockerRules.map((rule, idx) => (
                    <div key={rule.id} className="flex items-center gap-3 px-4 py-2">
                      <button onClick={() => setBlockerRules(prev => prev.map((r, i) => i === idx ? {...r, enabled: !r.enabled} : r))} className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${rule.enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <span className="text-xs font-semibold text-slate-700">{rule.blockerText}</span>
                      <span className="text-[10px] text-slate-400 flex-1">{rule.trigger}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Old audit sidebar removed — now in Action Items panel */}
      
      {orderInstructionModal.isOpen && (
        <div className="fixed inset-0 z-[128] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="text-xl font-bold text-slate-900">
                {orderInstructionModal.mode === "edit" ? "Edit Order Instruction" : "Add Order Instruction"}
              </h3>
            </div>
            <div className="space-y-4 p-6">
              <Field label="Instruction Type">
                <Select
                  value={orderInstructionModal.draft.type}
                  onChange={(e) => setOrderInstructionModal((prev) => ({
                    ...prev,
                    draft: { ...prev.draft, type: e.target.value },
                  }))}
                >
                  {INSTRUCTION_TYPES.map((type) => (
                    <option key={`order-instruction-type-${type}`} value={type}>{type}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Instruction">
                <Textarea
                  value={orderInstructionModal.draft.text}
                  onChange={(e) => setOrderInstructionModal((prev) => ({
                    ...prev,
                    draft: { ...prev.draft, text: e.target.value },
                  }))}
                  placeholder="Enter an order-only instruction..."
                />
              </Field>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Order-level instructions apply only to this order. Company and contact instructions remain inherited from their saved profiles.
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                onClick={closeOrderInstructionModal}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={saveOrderInstruction}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[129] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <h3 className="text-xl font-bold text-slate-900">{alertModal.title || "Alert"}</h3>
            </div>
            <div className="p-6 space-y-4">
              {alertModal.message ? (
                <p className="text-sm text-slate-700">{renderAlertMessageContent(alertModal.message, alertModal.title)}</p>
              ) : null}
              {alertModal.details?.length ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <ul className="space-y-1 text-sm text-slate-700">
                    {alertModal.details.map((detail, index) => (
                      <li key={`alert-detail-${index}`}>• {renderAlertDetailContent(detail)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                onClick={() => setAlertModal(createAlertModalState())}
              >
                {alertModal.onConfirm ? (alertModal.dismissLabel || "Cancel") : (alertModal.dismissLabel || "Close")}
              </button>
              {alertModal.onConfirm ? (
                <button
                  className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                  onClick={() => {
                    const action = alertModal.onConfirm;
                    setAlertModal(createAlertModalState());
                    action?.();
                  }}
                >
                  {alertModal.confirmLabel || "Confirm"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast} onClose={()=>setToast("")} panelOffset={(interviewPanelOpen || actionItemsOpen) ? 480 : 0} />}
      {smartNotification && <SmartNotification message={smartNotification.message} onReject={rejectSmartAction} onClose={()=>setSmartNotification(null)} panelOffset={(interviewPanelOpen || actionItemsOpen) ? 480 : 0} />}
      {showSdsPreview && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col" onKeyDown={e => { if (e.key === "Escape") setShowSdsPreview(false); }} tabIndex={-1} ref={el => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}>
          <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 shadow-sm z-10 relative">
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
              <button onClick={() => { setShowSdsPreview(false); setEntryMode('detailed'); }} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Order</button>
              <button onClick={() => { setShowSdsPreview(false); setEntryMode('same-day-scope'); }} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Scope</button>
              <button className="rounded-full px-3 py-1.5 text-xs font-bold bg-white text-sky-700 shadow-sm">SDS</button>
            </div>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowSdsPreview(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              ← Close SDS
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
              orderNarrativeProse={buildNarrativeProse(orderNarrative, data)}
              onClose={() => setShowSdsPreview(false)}
            />
          </div>
        </div>
      )}
      {smartConfirm.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{smartConfirm.title || "Confirm Smart Update"}</h3>
            </div>
            <div className="p-6 space-y-3">
              {smartConfirm.message && (
                <p className="text-sm text-slate-700">{smartConfirm.message}</p>
              )}
              {smartConfirm.details?.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <ul className="space-y-1 text-sm text-slate-700">
                    {smartConfirm.details.map((detail, index) => (
                      <li key={`${detail}-${index}`}>• {detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                onClick={() => resolveSmartConfirm(false)}
              >
                {smartConfirm.cancelLabel || "Keep"}
              </button>
              <button
                className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-orange-600"
                onClick={() => resolveSmartConfirm(true)}
              >
                {smartConfirm.confirmLabel || "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
      {roleAssignModal.isOpen && (
        <div data-suggested-roles-modal="true" className="fixed inset-0 z-[131] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-12 sm:pt-20"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); applySelectedRoleAssignments(); }
            if (e.key === "Escape") { e.preventDefault(); setRoleAssignModal(prev => ({ ...prev, isOpen: false })); }
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden" tabIndex={-1} ref={el => el?.focus()}>
            <div className="bg-sky-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Assign Company/Contact Roles</h3>
              <div className="mt-1 text-base text-sky-100">Apply badges for this company/contact now.</div>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="space-y-2 text-base leading-7 text-slate-700">
                {roleAssignModal.company ? (
                    <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                      <span className="font-semibold text-slate-900">Company</span>
                      <span>{roleAssignModal.company}</span>
                    </div>
                ) : null}
                {roleAssignModal.company ? (
                    <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                      <span className="font-semibold text-slate-900">Company Type</span>
                      <span>{getCompanyTypeForRoles(roleAssignModal.company) || "Unknown"}</span>
                    </div>
                ) : null}
                {roleAssignModal.contact ? (
                    <div className="grid grid-cols-[132px_1fr] items-start gap-x-3">
                      <span className="font-semibold text-slate-900">Contact</span>
                      <span>{roleAssignModal.contact}</span>
                    </div>
                ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold uppercase tracking-widest text-slate-500">Available Badges</div>
                <div className="flex flex-wrap gap-2">
                  {roleAssignModal.options.map(role => {
                    const active = roleAssignModal.selected.includes(role.id);
                    return (
                      <button
                        key={`role-assign-${role.id}`}
                        type="button"
                        onClick={() => toggleRoleAssignmentSelection(role.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-700"}`}
                      >
                        <span className="mr-1 inline-flex"><RoleIcon role={role} className="h-4 w-4" /></span>
                        {role.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
              <button
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                onClick={goBackFromRoleAssignmentPrompt}
              >
                Go Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                  onClick={closeRoleAssignmentPrompt}
                >
                  Skip
                </button>
                <button
                  className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  onClick={applySelectedRoleAssignments}
                  disabled={!roleAssignModal.selected.length}
                >
                  Apply Roles
                </button>
              </div>
            </div>
          </div>
        </div>
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
              {saveSummaryMissing.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <div className="font-bold mb-1">Missing Fields ({saveSummaryMissing.length})</div>
                  <ul className="list-disc pl-5">
                    {saveSummaryMissing.map((m, idx) => (
                      <li key={`${m.key}-${idx}`}>{m.label}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <button type="button" onClick={() => setPreviewView("narrative")} className={`rounded-full px-3 py-1 text-[10px] font-bold border ${previewView === "narrative" ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>Narrative</button>
                  <button type="button" onClick={() => setPreviewView("table")} className={`rounded-full px-3 py-1 text-[10px] font-bold border ${previewView === "table" ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>Table</button>
                  <button type="button" onClick={() => setPreviewView("fields")} className={`rounded-full px-3 py-1 text-[10px] font-bold border ${previewView === "fields" ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>All Fields</button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                  {orderNarrative.length === 0 ? (
                    <div className="text-sm text-slate-400 italic">No data entered yet.</div>
                  ) : previewView === "narrative" ? (
                    <div className="text-sm leading-relaxed text-slate-700 space-y-2">
                      {buildNarrativeProse(orderNarrative, data).map((t, i) => <p key={i}>{t}</p>)}
                    </div>
                  ) : previewView === "table" ? (
                    <div className="space-y-1.5">
                      {orderNarrative.map((line, idx) => (
                        <div key={idx} className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20 shrink-0 text-right">{line.section}</span>
                          <span className="text-sm text-slate-700">{line.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 space-y-1 max-h-[320px] overflow-y-auto custom-scroll">
                      {saveExportLines.length === 0 ? (
                        <div className="text-slate-400">No fields entered yet.</div>
                      ) : (
                        saveExportLines.map((l, idx) => <div key={`${l}-${idx}`}>{l}</div>)
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100"
                  onClick={() => {
                    const nlt = (data.orderName ? `NLT: ${data.orderName}\n\n` : "") + orderNarrative.map(l => `${l.section}: ${l.text}`).join("\n");
                    copyLines(nlt.split("\n"));
                  }}
                >
                  Copy as NLT
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => {
                    const prose = buildNarrativeProse(orderNarrative, data).join("\n\n");
                    copyLines(prose.split("\n"));
                  }}
                >
                  Copy Narrative
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => downloadLines(saveSummaryLines, "order-summary.txt")}
                >
                  Download Summary
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => {
                    const narrative = orderNarrative.map(l => `${l.section}: ${l.text}`).join("\n");
                    const existing = stripEventSystemLines(data.eventInstructions || "").trim();
                    const combined = existing ? `${existing}\n\n--- Order Summary ---\n${narrative}` : `--- Order Summary ---\n${narrative}`;
                    update("eventInstructions", composeEventInstructions(combined, data, conditionSummary));
                    setToast("Narrative added to Event Instructions");
                  }}
                >
                  Send to Event Instructions
                </button>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 shrink-0">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setPreviewOpen(false)}>Close</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => { setPreviewOpen(false); validateGenerateScope(); }}
              >
                Save {recordWord}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {modal.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 fade-in">
                  <h3 className="mb-4 text-lg font-bold text-slate-900 capitalize">Add New {modal.type}</h3>
                  <Input autoFocus placeholder={`Enter ${modal.type} name...`} value={modal.value} onChange={e=>setModal(m=>({...m,value:e.target.value}))} />
                  <div className="flex justify-end gap-3 mt-4">
                      <button className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50" onClick={()=>setModal({type:"",value:"",onSave:null})}>Cancel</button>
                      <button className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-600" onClick={()=>{ const v = modal.value.trim(); if(v) { if(modal.type === 'company') setCompanies(p => Array.from(new Set([...p, v]))); if(modal.type === 'contact') setContacts(p => Array.from(new Set([...p, v]))); modal.onSave(v); setModal({type:"",value:"",onSave:null}); } }}>Save</button>
                  </div>
              </div>
          </div>
      )}

      {showSampleDataModal && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
            onMouseDown={(e)=>e.stopPropagation()}
            onClick={(e)=>e.stopPropagation()}
            onKeyDown={(e)=>e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-800">Global Directory</div>
              <button
                onClick={() => setShowSampleDataModal(false)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-[2fr_2fr_1.4fr_1.4fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr_2fr_0.5fr] gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div>Contact</div>
              <div>Company</div>
              <div>Company Type</div>
              <div>Title</div>
              <div>Rep</div>
              <div>Adj</div>
              <div>Refer</div>
              <div>Bill</div>
              <div>Insure</div>
              <div>Eligible Roles</div>
              <div></div>
            </div>
            <div className="mt-2 space-y-2">
              {sampleContacts.map((row, idx) => (
                <div key={row.id || idx} className="grid grid-cols-[2fr_2fr_1.4fr_1.4fr_1fr_0.7fr_0.8fr_0.8fr_0.8fr_2fr_0.5fr] gap-2 items-center">
                  <div>
                    <Input value={row.name} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, name: e.target.value } : r))} className="!py-1.5 !text-xs" />
                  </div>
                  <div>
                    <Input
                      value={row.company}
                      onChange={(e)=>setSampleContacts(prev => {
                        const normalized = normalizeSampleContacts(prev);
                        const nextCompany = e.target.value;
                        const peer = normalized.find((r, i) => i !== idx && normalizeCompany(r.company || "") === normalizeCompany(nextCompany || ""));
                        const fallback = inferRoleCapabilities(normalized[idx]?.companyType || "", nextCompany);
                        const nextCaps = peer
                          ? { canRefer: !!peer.canRefer, canBill: !!peer.canBill, canInsure: !!peer.canInsure }
                          : fallback;
                        return normalized.map((r,i)=> i===idx ? { ...r, company: nextCompany, ...nextCaps } : r);
                      })}
                      className="!py-1.5 !text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      value={row.companyType || ""}
                      onChange={(e)=>setSampleContacts(prev => {
                        const normalized = normalizeSampleContacts(prev);
                        const nextType = e.target.value;
                        const companyName = normalized[idx]?.company || "";
                        const peers = normalized.filter((r, i) => i !== idx && normalizeCompany(r.company || "") === normalizeCompany(companyName || ""));
                        const inferred = inferRoleCapabilities(nextType, companyName);
                        return normalized.map((r, i) => {
                          if (i !== idx) return r;
                          if (peers.length) return { ...r, companyType: nextType };
                          return {
                            ...r,
                            companyType: nextType,
                            canRefer: inferred.canRefer,
                            canBill: inferred.canBill,
                            canInsure: inferred.canInsure
                          };
                        });
                      })}
                      className="!py-1.5 !text-xs"
                      placeholder="Type"
                    />
                  </div>
                  <div>
                    <Input value={row.title || ""} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, title: e.target.value } : r))} className="!py-1.5 !text-xs" />
                  </div>
                  <div>
                    <Select value={row.salesRep || ""} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, salesRep: e.target.value } : r))} className="!py-1.5 !text-[10px]">
                      <option value="">Unassigned</option>
                      {SALES_REPS.map(rep => <option key={rep} value={rep}>{rep}</option>)}
                    </Select>
                  </div>
                  <div className="flex items-center justify-center">
                    <label className="flex items-center gap-1 text-[10px] text-slate-400">
                      <input type="checkbox" checked={!!row.isAdjuster} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, isAdjuster: e.target.checked } : r))} />
                    </label>
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!row.canRefer}
                      onChange={(e) => updateCompanyCapability(row.company, idx, "canRefer", e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!row.canBill}
                      onChange={(e) => updateCompanyCapability(row.company, idx, "canBill", e.target.checked)}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!row.canInsure}
                      onChange={(e) => updateCompanyCapability(row.company, idx, "canInsure", e.target.checked)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getEligibleRoleLabels(row.company || "", row.companyType || "").map(role => (
                      <span key={`${row.id || idx}-${role}`} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <button onClick={() => setSampleContacts(prev => prev.filter((_,i)=>i!==idx))} className="text-rose-600 text-xs font-bold">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setSampleContacts(prev => [...prev, { id: safeUid(), name: "", company: "", companyType: "", title: "", salesRep: "", isAdjuster: false, canRefer: true, canBill: false, canInsure: false }])}
                className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
              >
                + Add Row
              </button>
              <div className="text-[10px] text-slate-400">Edits save automatically. Refer/Bill/Insure apply to all contacts at the same company.</div>
            </div>
          </div>
        </div>
      )}

      {showPresetModal && (
        <div className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">Test Data Presets</div>
                <div className="text-sm text-sky-100">Save, load, or delete preset data for fast testing.</div>
              </div>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setShowPresetModal(false)}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Preset Name</label>
                  <Input value={presetName} onChange={(e)=>setPresetName(e.target.value)} placeholder="e.g. Fire Claim - Quick Entry" />
                </div>
                <button onClick={saveTestPreset} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
                  Save Preset
                </button>
              </div>
              <div className="max-h-64 overflow-auto rounded-xl border border-slate-200">
                {testPresets.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">No presets yet.</div>
                ) : (
                  <div className="divide-y">
                    {testPresets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between p-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{preset.name}</div>
                          <div className="text-[11px] text-slate-500">{new Date(preset.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => loadTestPreset(preset)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Load</button>
                          <button onClick={() => deleteTestPreset(preset.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={clearAllPresets} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Delete All Presets</button>
                <button onClick={() => setShowPresetModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addNewSystemModal && (
        <div className="fixed inset-0 z-[140] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-8 sm:pt-16 overflow-auto"
          onKeyDown={e => { if (e.key === "Escape") setAddNewSystemModal(null); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden" tabIndex={-1} ref={el => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}>
            <div className="bg-sky-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Add New Contact / Company</h3>
              <p className="text-sm text-sky-100">This will add them to the system for future orders.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</div>
                <SearchSelect
                  value={addNewSystemModal.companyName}
                  onChange={v => setAddNewSystemModal(p => ({ ...p, companyName: v, isNewCompany: !companies.some(c => normalizeCompany(c) === normalizeCompany(v)) }))}
                  onQueryChange={() => {}}
                  options={companies.map(c => ({ label: c, value: c, type: "company" }))}
                  placeholder="Search existing or type new company..."
                  onAddNew={v => setAddNewSystemModal(p => ({ ...p, companyName: v, isNewCompany: true }))}
                />
                {addNewSystemModal.companyName && (
                  <div className={`text-[11px] font-semibold ${addNewSystemModal.isNewCompany ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {addNewSystemModal.isNewCompany ? `"${addNewSystemModal.companyName}" is new — will be created` : `"${addNewSystemModal.companyName}" found`}
                  </div>
                )}
                {addNewSystemModal.isNewCompany && addNewSystemModal.companyName && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">New Company Details</div>
                      <button type="button" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(addNewSystemModal.companyName)}`, '_blank')} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Search Google</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_TYPES.map(type => (
                        <button key={type} type="button" onClick={() => setAddNewSystemModal(p => ({ ...p, companyType: type }))}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${addNewSystemModal.companyType === type ? 'border-sky-400 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:border-sky-300'}`}
                        >{type}</button>
                      ))}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input value={addNewSystemModal.companyPhone || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, companyPhone: formatPhoneNumber(e.target.value) }))} placeholder="Company phone" />
                      <Input value={addNewSystemModal.companyWebsite || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, companyWebsite: e.target.value }))} placeholder="Website" />
                    </div>
                    <Input value={addNewSystemModal.companyAddress || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, companyAddress: e.target.value }))} placeholder="Company address" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact{addNewSystemModal.companyName ? ` at ${addNewSystemModal.companyName}` : ""}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={addNewSystemModal.firstName || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
                  <Input value={addNewSystemModal.lastName || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
                </div>
                <Input value={addNewSystemModal.title || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, title: e.target.value }))} placeholder="Title (e.g. Adjuster, Project Manager, Owner)" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input value={addNewSystemModal.phone || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, phone: formatPhoneNumber(e.target.value) }))} placeholder="Phone" />
                  <Input value={addNewSystemModal.email || ""} onChange={e => setAddNewSystemModal(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-between border-t border-slate-200">
              <button onClick={() => setAddNewSystemModal(null)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  const fullName = [addNewSystemModal.firstName, addNewSystemModal.lastName].filter(Boolean).join(" ");
                  const companyName = addNewSystemModal.companyName || "";
                  if (!fullName && !companyName) return;
                  const inferredType = addNewSystemModal.isNewCompany ? (addNewSystemModal.companyType || "Other") : inferCompanyTypeFromName(companyName);
                  const entry = { company: companyName, contact: fullName, type: inferredType, title: addNewSystemModal.title || "", id: safeUid() };
                  update("vendors", [...(data.vendors || []), entry]);
                  setToast(`Added ${fullName ? fullName + (companyName ? " at " + companyName : "") : companyName} to the system`);
                  setAddNewSystemModal(null);
                }}
                disabled={!addNewSystemModal.firstName && !addNewSystemModal.companyName}
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to System & Order
              </button>
            </div>
          </div>
        </div>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                  <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-xl">📅</span> Confirm Appointment</h3>
                        <div className="text-sm text-sky-100 mt-1">Review details before sending confirmation.</div>
                      </div>
                      <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setConfirmDetails(null)}>×</button>
                  </div>
                  <div className="p-6 space-y-5">
                    {(() => {
                      const missing = [];
                      if (!data.eventVehicle) missing.push("Vehicle");
                      if (!data.eventAssignee) missing.push("Assignee");
                      if (!confirmDetails.address) missing.push("Address");
                      return missing.length ? (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                          <div className="font-bold mb-1">Missing Information:</div>
                          <ul className="space-y-1">
                            {missing.map(item => (
                              <li key={item} className="flex items-center gap-2">
                                <span className="text-orange-600">⚠️</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
                            <input type="checkbox" checked={confirmMissingOk} onChange={(e)=>setConfirmMissingOk(e.target.checked)} />
                            Proceed without this information
                          </label>
                        </div>
                      ) : null;
                    })()}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500">Context</div>
                  <button
                    type="button"
                    onClick={() => setConfirmContextOpen(v => !v)}
                    className="text-[10px] font-bold text-sky-600 hover:text-sky-700"
                  >
                    {confirmContextOpen ? "Hide" : "Show"}
                  </button>
                </div>
                {confirmContextOpen && (
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div><span className="font-semibold">Primary Customer:</span> {(data.customers?.[0]?.first || "")} {(data.customers?.[0]?.last || "")}</div>
                    <div><span className="font-semibold">Referring Company:</span> {data.referringCompany || "—"}</div>
                    <div><span className="font-semibold">Referrer:</span> {data.referrer || "—"}</div>
                    <div><span className="font-semibold">Insurance Company:</span> {data.insuranceCompany || "—"}</div>
                    <div><span className="font-semibold">Adjuster:</span> {data.insuranceAdjuster || "—"}</div>
                    <div><span className="font-semibold">Assignee:</span> {data.eventAssignee || "—"}</div>
                    <div><span className="font-semibold">Vehicle:</span> {data.eventVehicle || "—"}</div>
                    <div><span className="font-semibold">Additional Companies:</span> {Object.entries(data.additionalCompanies || {}).map(([t, v]) => v?.company || v?.contact ? `${t}: ${v.company || "—"} (${v.contact || "—"})` : null).filter(Boolean).join(" • ") || "—"}</div>
                  </div>
                )}
              </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs font-bold text-slate-400 uppercase">Type</label><div className="font-medium">{confirmDetails.type}</div></div>
                              <div><label className="text-xs font-bold text-slate-400 uppercase">Date & Time</label><div className="font-medium">{confirmDetails.date} @ {confirmDetails.time}</div></div>
                          </div>
                          <div><label className="text-xs font-bold text-slate-400 uppercase">Address</label><div className="font-medium">{confirmDetails.address || "No Primary Address Set"}</div></div>
                          {!data.eventFirm && (
                            <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                              This event is not firm. {data.pickupTimeTentative ? "Confirming will send a tentative appointment." : "Mark as firm or confirm a tentative appointment to proceed."}
                              {data.pickupTimeTentative && (
                                <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-orange-700">
                                  <input type="checkbox" checked={confirmTentativeOk} onChange={(e)=>setConfirmTentativeOk(e.target.checked)} />
                                  I want to confirm a tentative appointment
                                </label>
                              )}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button onClick={downloadIcs} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-sky-300 hover:text-sky-700">📅 Add to Calendar</button>
                          </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                      <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setConfirmDetails(null)}>Cancel</button>
                      <button
                        className={`rounded-lg px-6 py-2 text-sm font-bold text-white shadow ${((!data.eventFirm && (!data.pickupTimeTentative || !confirmTentativeOk)) || (!confirmMissingOk && (( !data.eventVehicle) || (!data.eventAssignee) || (!confirmDetails.address)))) ? "bg-slate-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                        disabled={(!data.eventFirm && (!data.pickupTimeTentative || !confirmTentativeOk)) || (!confirmMissingOk && (( !data.eventVehicle) || (!data.eventAssignee) || (!confirmDetails.address)))}
                        onClick={() => { setToast("Appointment Confirmed & Sent!"); setConfirmDetails(null); }}
                      >
                        Send Confirmation
                      </button>
                  </div>
              </div>
          </div>
      )}

      {livingAddressPrompt.open && !interviewPanelOpen && (
        <div className="fixed inset-0 z-[109] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add {livingAddressPrompt.type} Address?</h3>
            <div className="text-sm text-slate-600 mb-4">
              No <span className="font-semibold">{livingAddressPrompt.type}</span> address exists yet.
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeLivingAddressPrompt}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={() => addLivingAddressFromPrompt("placeholder")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Create Placeholder
              </button>
              <button
                type="button"
                onClick={() => addLivingAddressFromPrompt("full")}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
              >
                Enter Address Now
              </button>
            </div>
          </div>
        </div>
      )}

      {groupLinkModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Link Group to Address</h3>
            <div className="text-sm text-slate-500 mb-4">{groupLinkModal.group}</div>
            <div className="grid gap-4">
              <Field label="Address">
                <Select
                  value={getGroupLink(groupLinkModal.group).addressId || ""}
                  onChange={(e) => setGroupLink(groupLinkModal.group, { addressId: e.target.value })}
                >
                  <option value="">Select address...</option>
                  {(() => {
                    const list = data.addresses || [];
                    const primary = list.find(a => a.isPrimary) || list[0];
                    return list.map(a => {
                      const label = a.id === primary?.id
                        ? `Primary — ${a.type || "Address"}`
                        : `${a.type || "Address"}`;
                      return (
                        <option key={a.id} value={a.id}>
                          {label} — {summarizeAddress(a)}
                        </option>
                      );
                    });
                  })()}
                </Select>
              </Field>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Address Actions</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupLinkAddressMode("select")}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${groupLinkAddressMode === "select" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                  >
                    Use Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupLinkAddressMode("placeholder")}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${groupLinkAddressMode === "placeholder" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                  >
                    Add Placeholder
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupLinkAddressMode("full")}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold ${groupLinkAddressMode === "full" ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                  >
                    Add Full Address
                  </button>
                </div>
                {groupLinkAddressMode === "placeholder" && (
                  <div className="mt-3 space-y-2">
                    <Input
                      value={groupLinkAddressDraft.type}
                      onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="Label (e.g., RD Drop, Hotel, Neighbor)"
                    />
                    <button
                      type="button"
                      onClick={addPlaceholderAddressToGroup}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
                    >
                      Add Placeholder Address
                    </button>
                  </div>
                )}
                {groupLinkAddressMode === "full" && (
                  <div className="mt-3 grid gap-2">
                    <Input
                      value={groupLinkAddressDraft.type}
                      onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="Address Type (optional)"
                    />
                    <Input
                      value={groupLinkAddressDraft.street}
                      onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="Street"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={groupLinkAddressDraft.city}
                        onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                      <Input
                        value={groupLinkAddressDraft.state}
                        onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                      <Input
                        value={groupLinkAddressDraft.zip}
                        onChange={(e) => setGroupLinkAddressDraft(prev => ({ ...prev, zip: e.target.value }))}
                        placeholder="Zip"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addFullAddressToGroup}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600"
                    >
                      Add Full Address
                    </button>
                  </div>
                )}
              </div>
              <Field label="Target Date">
                <Input
                  type="date"
                  value={getGroupLink(groupLinkModal.group).date || ""}
                  onChange={(e) => setGroupLink(groupLinkModal.group, { date: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => { clearGroupLink(groupLinkModal.group); closeGroupLinkModal(); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
              <button
                onClick={closeGroupLinkModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {reminderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Reminder</h3>
                <div className="text-sm text-sky-100 mt-1">Choose when to send a reminder.</div>
              </div>
              <button
                className="text-white/80 hover:text-white text-2xl font-bold leading-none"
                onClick={() => setReminderModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Reminder Date">
                  <DatePicker value={reminderDraft.date} onChange={(v)=>setReminderDraft(d => ({ ...d, date: v }))} />
                </Field>
                <Field label="Reminder Time">
                  <TimePicker value={reminderDraft.time} onChange={(v)=>setReminderDraft(d => ({ ...d, time: v }))} />
                </Field>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              {data.reminderEnabled && (
                <button
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    updateMany({ reminderEnabled: false, reminderDate: "", reminderTime: "" });
                    setReminderModalOpen(false);
                  }}
                >
                  Clear
                </button>
              )}
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setReminderModalOpen(false)}>Cancel</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => {
                  updateMany({ reminderEnabled: true, reminderDate: reminderDraft.date, reminderTime: reminderDraft.time });
                  setReminderModalOpen(false);
                  setToast("Reminder scheduled");
                }}
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {welcomeModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                  <div className="bg-sky-500 px-6 py-4">
                      <h3 className="text-xl font-bold text-white">Send Welcome Message</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      {(() => {
                        const customer = (data.customers || []).find(c => c.id === welcomeModal.customerId) || {};
                        const selectedSpecialDocs = normalizeStringList(welcomeModal.selectedSpecialDocs || []);
                        const attachments = [
                          customer.sendBrochure && "Brochure",
                          customer.sendRushGuide && "Rush Guide",
                          customer.sendAuthLink && "Authorization Form",
                          customer.sendCosLink && "COS Link",
                          customer.sendGoogleReviewLink && "Google Review Link",
                          ...selectedSpecialDocs,
                        ].filter(Boolean);
                        const hasMobile = (customer.phone || "").replace(/[^\d]/g, "").length >= 10;
                        return (
                          <React.Fragment>
                            <div className="text-sm font-semibold text-slate-700">Attachments</div>
                            {attachments.length ? (
                              <div className="flex flex-wrap gap-2">
                                {attachments.map(a => <span key={a} className="rounded-full bg-sky-50 text-sky-700 px-2 py-0.5 text-xs font-bold">{a}</span>)}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No attachments selected.</div>
                            )}
                            {currentOrderCustomerForms.length > 0 && (
                              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Special Customer Forms</div>
                                <div className="mt-2 grid gap-2 text-xs font-semibold text-amber-900">
                                  {currentOrderCustomerForms.map((form) => {
                                    const checked = selectedSpecialDocs.includes(form);
                                    return (
                                      <label key={`welcome-special-doc-${form}`} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-amber-300"
                                          checked={checked}
                                          onChange={(e) => {
                                            setWelcomeModal((modalState) => {
                                              const current = normalizeStringList(modalState.selectedSpecialDocs || []);
                                              const next = e.target.checked
                                                ? mergeUniqueStrings(current, [form])
                                                : current.filter((item) => item !== form);
                                              return { ...modalState, selectedSpecialDocs: next };
                                            });
                                          }}
                                        />
                                        {form}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {!hasMobile && (
                              <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                Add a mobile phone number to send texts.
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })()}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Custom Note</label>
                        <div className="mt-2">
                          <button
                            onClick={() => setShowWelcomeQuickNotes(v => !v)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${showWelcomeQuickNotes ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                          >
                            📝 Add Quick Note
                          </button>
                        </div>
                        {showWelcomeQuickNotes && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {CUSTOMER_QUICK_NOTES.map(n => (
                              <ToggleMulti
                                key={`welcome-${n}`}
                                label={n}
                                checked={(welcomeModal.note || "").includes(n)}
                                onChange={() => {
                                  const base = (welcomeModal.note || "").trim();
                                  const has = base.includes(n);
                                  const next = has
                                    ? base.replace(new RegExp(`\\s*${escapeRegExp(n)}\\s*`, "g"), " ").replace(/\s{2,}/g, " ").trim()
                                    : [base, n].filter(Boolean).join(" • ");
                                  setWelcomeModal(m => ({ ...m, note: next }));
                                }}
                              />
                            ))}
                          </div>
                        )}
                        <Textarea value={welcomeModal.note} onChange={e=>setWelcomeModal(m=>({...m, note:e.target.value}))} placeholder="Add a note to include with the message..." />
                      </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
                      <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setWelcomeModal({ isOpen:false, customerId:null, note:"", selectedSpecialDocs: [] })}>Cancel</button>
                      {(() => {
                        const customer = (data.customers || []).find(c => c.id === welcomeModal.customerId) || {};
                        const hasMobile = (customer.phone || "").replace(/[^\d]/g, "").length >= 10;
                        return (
                          <button
                            disabled={!hasMobile}
                            className={`rounded-lg px-6 py-2 text-sm font-bold text-white shadow ${hasMobile ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"}`}
                            onClick={() => { if (!hasMobile) return; setToast("Welcome message sent!"); setWelcomeModal({ isOpen:false, customerId:null, note:"", selectedSpecialDocs: [] }); }}
                          >
                            Send
                          </button>
                        );
                      })()}
                  </div>
              </div>
          </div>
      )}

      {crmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col">
            <div className="bg-sky-500 px-6 py-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">Add CRM Log</h3>
                <div className="text-xs text-sky-100">Capture outreach and follow-up actions.</div>
              </div>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"", followUpEnabled:false, followUpDate:"", followUpTime:"", notifySalesRep:true, notifyOrderLead:true, notifyOthers:"" })}>×</button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto custom-scroll flex-1">
              <Field label="Type">
                <Select value={crmModal.method} onChange={e=>setCrmModal(m=>({...m, method: e.target.value}))}>
                  {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Owner">
                <Input value={crmModal.owner} onChange={e=>setCrmModal(m=>({...m, owner: e.target.value}))} placeholder="Sales Rep" />
              </Field>
              <Field label="Subject">
                <Input value={crmModal.subject} onChange={e=>setCrmModal(m=>({...m, subject: e.target.value}))} placeholder="New Lead/Order" />
              </Field>
              <Field label="Order Link">
                <Input value={crmModal.orderLink} onChange={e=>setCrmModal(m=>({...m, orderLink: e.target.value}))} placeholder="Order link" />
              </Field>
              <Field label="Notes">
                <Textarea value={crmModal.notes} onChange={e=>setCrmModal(m=>({...m, notes: e.target.value}))} placeholder="Additional notes..." />
              </Field>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-sm font-semibold text-slate-700">Follow-up Reminder</div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={crmModal.followUpEnabled} onChange={(e)=>setCrmModal(m=>({...m, followUpEnabled: e.target.checked}))} />
                  Create follow-up reminder for referrer
                </label>
                {crmModal.followUpEnabled && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input type="date" value={crmModal.followUpDate} onChange={e=>setCrmModal(m=>({...m, followUpDate: e.target.value}))} />
                    <Input type="time" value={crmModal.followUpTime} onChange={e=>setCrmModal(m=>({...m, followUpTime: e.target.value}))} />
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-semibold text-slate-700">Notify Team</div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={crmModal.notifySalesRep} onChange={(e)=>setCrmModal(m=>({...m, notifySalesRep: e.target.checked}))} />
                    Sales Rep
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={crmModal.notifyOrderLead} onChange={(e)=>setCrmModal(m=>({...m, notifyOrderLead: e.target.checked}))} />
                    Order Lead (Assignee)
                  </label>
                </div>
                <Input
                  value={crmModal.notifyOthers}
                  onChange={e=>setCrmModal(m=>({...m, notifyOthers: e.target.value}))}
                  placeholder="Notify coworkers (comma separated)"
                />
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 flex justify-end gap-3 border-t border-slate-200 shrink-0">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"", followUpEnabled:false, followUpDate:"", followUpTime:"", notifySalesRep:true, notifyOrderLead:true, notifyOthers:"" })}>Cancel</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => {
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
                      others: crmModal.notifyOthers
                        .split(",")
                        .map(v => v.trim())
                        .filter(Boolean)
                    }
                  };
                  setData(prev => ({ ...prev, crmLogs: [...(prev.crmLogs || []), entry] }));
                  if (crmModal.followUpEnabled) {
                    setToast("CRM log submitted + follow-up reminder created");
                  } else {
                    setToast("CRM log submitted");
                  }
                  setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"", followUpEnabled:false, followUpDate:"", followUpTime:"", notifySalesRep:true, notifyOrderLead:true, notifyOthers:"" });
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {planModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Plan of Action</h3>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setPlanModalOpen(false)}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newPlanStep}
                  onChange={e=>setNewPlanStep(e.target.value)}
                  placeholder="Add a step..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPlanStep(); } }}
                />
                <Select value={planAssignee} onChange={(e)=>setPlanAssignee(e.target.value)} className="!w-48">
                  <option value="">Assignee</option>
                  {[...new Set([data.currentUser, ...SALES_REPS].filter(Boolean))].map(rep => (
                    <option key={rep} value={rep}>{rep}</option>
                  ))}
                </Select>
                <button onClick={addPlanStep} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-500">Add</button>
              </div>
              <div className="space-y-2">
                {planDraftSteps.length === 0 && <div className="text-sm text-slate-500">No steps yet.</div>}
                {planDraftSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={() => setPlanDragId(step.id)}
                    onDragEnd={() => setPlanDragId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!planDragId || planDragId === step.id) return;
                      const fromIdx = planDraftSteps.findIndex(s => s.id === planDragId);
                      const toIdx = planDraftSteps.findIndex(s => s.id === step.id);
                      if (fromIdx < 0 || toIdx < 0) return;
                      const next = [...planDraftSteps];
                      const [moved] = next.splice(fromIdx, 1);
                      next.splice(toIdx, 0, moved);
                      setPlanDraftSteps(next);
                      setPlanReorderDirty(true);
                    }}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 bg-white ${planDragId === step.id ? 'border-sky-400 ring-2 ring-sky-200' : 'border-slate-200'} ${planDragId && planDragId !== step.id ? 'border-dashed border-sky-200' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <button onClick={() => togglePlanStep(step.id)} className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>{step.done ? '✓' : ''}</button>
                      {planEditingId === step.id ? (
                        <Input
                          value={planEditingText}
                          onChange={e=>setPlanEditingText(e.target.value)}
                          className="!py-1.5 !text-sm w-64"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setData(p => ({ ...p, planSteps: (p.planSteps || []).map(s => s.id === step.id ? { ...s, text: planEditingText } : s) }));
                              setPlanEditingId(null);
                            }
                          }}
                        />
                      ) : (
                        <span className={`text-sm ${step.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{step.text}</span>
                      )}
                      <Select
                        value={step.assignee || ""}
                        onChange={(e) => {
                          const nextAssignee = e.target.value;
                          setPlanDraftSteps(prev => prev.map(s => s.id === step.id ? { ...s, assignee: nextAssignee } : s));
                          setData(p => ({ ...p, planSteps: (p.planSteps || []).map(s => s.id === step.id ? { ...s, assignee: nextAssignee } : s) }));
                        }}
                        className="!w-40 !py-1.5 !text-xs"
                      >
                        <option value="">Assignee</option>
                        {[...new Set([data.currentUser, ...SALES_REPS].filter(Boolean))].map(rep => (
                          <option key={rep} value={rep}>{rep}</option>
                        ))}
                      </Select>
                      {step.done && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600">{getInitials(step.doneBy || "Unknown")}</span>
                          {step.doneAt ? new Date(step.doneAt).toLocaleString([], { year: "2-digit", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {planEditingId === step.id ? (
                        <button className="text-slate-500 hover:text-slate-700 text-xs" onClick={() => { setData(p => ({ ...p, planSteps: (p.planSteps || []).map(s => s.id === step.id ? { ...s, text: planEditingText } : s) })); setPlanEditingId(null); }}>Save</button>
                      ) : (
                        <button className="text-slate-500 hover:text-slate-700 text-xs" onClick={() => { setPlanEditingId(step.id); setPlanEditingText(step.text); }}>Edit</button>
                      )}
                      <button className="text-slate-400 hover:text-red-600" onClick={() => removePlanStep(step.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
              {planReorderDirty ? (
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100" onClick={() => { setPlanDraftSteps(data.planSteps || []); setPlanReorderDirty(false); }}>Cancel Reorder</button>
                  <button className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500" onClick={() => { setData(p => ({ ...p, planSteps: planDraftSteps })); setPlanReorderDirty(false); }}>Confirm Order</button>
                </div>
              ) : <span />}
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setPlanModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
