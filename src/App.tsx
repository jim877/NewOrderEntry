// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import SameDayScope from './SameDayScope';
import SdsDocument from './SdsDocument';
import {
  buildScopeBridgeSnippet,
  createScopeBridgeState,
  normalizeScopeBridgeState,
  statusBadgeLabel,
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
      border-color: #f59e0b !important;
      background: linear-gradient(135deg, #fff7ed 0%, #ffffff 68%);
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

const EVENT_SYSTEM_PREFIXES = ["Conditions:", "Bring:", "Service Offerings:", "Quick Notes:", "Estimate Required:"];
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
  const cleaned = (base || "").trimEnd();
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
const DEFAULT_COMPANIES=["Allstate", "State Farm", "Chubb", "Servpro of Anytown", "Metro Claims", "Pure Insurance", "DKI FastDry", "United Claims", "Croziers Moving", "Company 1", "Company 2"];
const DEFAULT_CONTACTS=["Alex Morgan", "Jamie Lee", "Pat Adjuster", "Ronzel Simmons", "Zack Barsack", "Sim Fern", "Steven Earthman", "Contact 1", "Contact 2"];
const WELCOME_CAMPAIGNS=["Brochure", "Rush Guide", "Vcard"];
const VENDOR_TYPES=["Art","Contents","Moving","Mitigation","Contractor","Consultant","Agent","Broker","Decorator","Building Management","Superintendent","Other"];
const SALES_REPS=["Dave Fenyo, Sales Rep","Jim Fenyo","Josh Cintron, Sales Rep"];
const SERVICE_OFFERINGS=["Appliance","Art","Consulting","Contents","Furniture","Hand Clean","Pack-out","Rugs","Storage Only","Textiles","TLI","Expert Stain Removal"];
const SUGGESTED_GROUPS = ["RD","RFD","STD","STFD","LTD","LTFD","Inhome","TLI","Test","Dispose","Storage Only"];
const LIVING_STATUS_ADDRESS_TYPES = ["Moving", "Hotel", "Neighbor", "Relative", "Rental", "Other Home"];
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
const BRIDGE_INSURANCE_BLOCKERS = [
  "Limit Issue",
  "Hasn't approved scope",
  "Adjuster Wants Estimate",
  "Hasn't determined coverage",
  "Pushing another vendor",
  "Waiting on Hygienist Results",
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
];
const BRIDGE_NEXT_STEP_OPTIONS = [
  { id: "pickup_hold", label: "Pickup on hold" },
  { id: "processing_hold", label: "Tag and Hold" },
  { id: "emergency_groups_only", label: "Emergency Groups Only" },
  { id: "cod", label: "COD" },
];
const BRIDGE_MILESTONE_FIELDS = [
  { id: "authorizationOnFile", atId: "authorizationOnFileAt", byId: "authorizationOnFileBy", label: "Authorization form on file" },
  { id: "scopeApproved", atId: "scopeApprovedAt", byId: "scopeApprovedBy", label: "Scope approved" },
  { id: "estimateApproved", atId: "estimateApprovedAt", byId: "estimateApprovedBy", label: "Estimate approved" },
];
const canonicalBridgeIssue = (issue = "") => BRIDGE_BLOCKER_ALIASES[issue] || issue;
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

// --- CONSTANTS FOR SELECTIONS ---
const LOSS_TYPES = ["Fire", "Water", "Mold", "Dust/Debris", "Puffback", "Oil"];
const NON_RESTORATION_TYPES = ["Commercial Cleaning", "Residential Cleaning", "Other"];

const CAUSES = {
  "Fire": ["Battery", "Candle", "Cooking", "Electrical", "Explosion", "Fireplace", "Flammables", "Heating", "Neighbor", "Protein", "Smoking", "Wildfire"],
  "Water": ["Roof Leak", "Window/Door Leak", "Frozen Pipes", "Pipe Burst", "Overflow", "Storm", "Sprinkler", "Firefighting"],
  "Mold": ["Spores Only", "Visible Mold", "Moldy Odor"],
  "Dust/Debris": ["Mitigation", "Construction", "Fiberglass"],
  "Puffback": ["Oily Odor"],
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
  { name: "Alex Morgan", company: "Allstate", companyType: "Insurance", salesRep: "Josh Cintron, Sales Rep", title: "Adjuster", isAdjuster: true, canRefer: true, canBill: true, canInsure: true },
  { name: "Jamie Lee", company: "State Farm", companyType: "Insurance", salesRep: "Josh Cintron, Sales Rep", title: "Adjuster", isAdjuster: true, canRefer: true, canBill: true, canInsure: true },
  { name: "Pat Adjuster", company: "Metro Claims", companyType: "Public Adjusting", salesRep: "Dave Fenyo, Sales Rep", title: "Adjuster", isAdjuster: true, canRefer: true, canBill: true, canInsure: true },
  { name: "Ronzel Simmons", company: "Pure Insurance", companyType: "Insurance", salesRep: "Dave Fenyo, Sales Rep", title: "Adjuster", isAdjuster: true, canRefer: true, canBill: true, canInsure: true },
  { name: "Zack Barsack", company: "DKI DryFast", companyType: "Restoration Company", salesRep: "", title: "Owner", isAdjuster: false, canRefer: true, canBill: false, canInsure: false },
  { name: "Sim Fern", company: "United Claims", companyType: "Public Adjusting", salesRep: "", title: "Adjuster", isAdjuster: true, canRefer: true, canBill: true, canInsure: true },
  { name: "Steven Earthman", company: "Croziers Moving", companyType: "Moving", salesRep: "", title: "Project Manager", isAdjuster: false, canRefer: true, canBill: false, canInsure: false }
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
  "Insects": "/Gemini_Generated_Image_b58khsb58khsb58k.png",
  "Moth Damage": "/Gemini_Moth_Holes.png",
  "Sun Damage": "/Gemini_Generated_Image_7b5s067b5s067b5s.png",
  "Smoking": "/Gemini_Smoking.png",
  "Clutter": "/Clutter.png",
  "Fold as Much as Possible": "/Gemini_Fold_AMAP.png",
  "Re-Hanging": "/Gemini_Generated_Image_jv26rcjv26rcjv26.png",
  "Photo Inventory": "/Gemini_Photo_Inventory.png",
  "Unpacking": "/Gemini_Unpacking.png",
  "Anti-Microbial": "/Gemini_Anti_Microbial.png",
  "Drying Needed": "/Drying.jpg",
  "Drying": "/Drying.jpg",
  "Disposal": "/Gemini_Generated_Image_tydpketydpketydp.png",
  "Fiber Protection": "/Gemini_Fiber_Protection.png",
  "Moving": "/icon-moving.svg",
  "Rolling Racks": "/icon-rolling-racks.svg",
  "Total Loss Inventory": "/Total_Loss_Inventory.jpg",
  "Content Manipulation": "/Content_Manipulation.jpg",
  "High Density": "/High_Density_Parking.png",
  "Expert Stain Removal": "/Expert_Stain_Removal.jpg",
};

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
for(let i=8; i<=18; i++) {
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? 'PM' : 'AM';
    TIME_SLOTS.push(`${hour}:00 ${ampm}`);
    TIME_SLOTS.push(`${hour}:30 ${ampm}`);
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
  { id: "referrer", icon: "🏷️", title: "Referrer" },
  { id: "insurance", icon: "🛡️", title: "Insurance" },
  { id: "billto", icon: "💳", title: "Bill To" },
];

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
  const street = (addr?.street || "").trim().toUpperCase();
  const type = (addr?.type || "").trim().toLowerCase();
  return street === "TBD" || type.includes("placeholder");
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
    ...overrides
  };
}

const stringListMatches = (a = [], b = []) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const right = new Set(b.map((item) => `${item}`));
  return a.every((item) => right.has(`${item}`));
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
  insuranceClaim:"", insuranceCompany:"", insuranceAdjuster:"", adjusterCompany:"", nationalCarrier:"", claimNumber:"", dateOfLoss:"", workOrderNumber:"", policyNumber:"", insuranceOrderEmail:"", rentOrOwn:"",
  contentsCoverageLimit:"", moldLimit:"", rentCoverageLimit:"", publicAdjustingCompany:"", publicAdjuster:"", independentAdjustingCo:"",
  independentAdjuster:"", tpaCompany:"", tpaContact:"", 
  salesRep: "",
  serviceOfferings: [],
  groupAddressLinks: {},
  lossSeverity: initLossSeverity(),
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
  eventCustomerContacted: false,
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

const Field = ({label,children,subtle,missing, className, action, smart, id}) => (
  <div id={id} className={`flex flex-col gap-1.5 ${className||""}`}>
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

  const pick = (d) => {
    if (!d) return;
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
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
              const isSelected = normalizeDateInput(value) === new Date(year, month, d || 1).toISOString().slice(0, 10);
              return (
                <button
                  key={`${d}-${idx}`}
                  onClick={() => pick(d)}
                  className={`h-10 w-10 rounded-full text-sm ${!d ? "text-transparent" : isSelected ? "bg-sky-500 text-white" : "text-slate-700 hover:bg-sky-50"}`}
                  disabled={!d}
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

const SearchSelect = ({ value, onChange, onQueryChange, options, placeholder, className, onKeyDown, onBlur, clearOnCommit, inputRef, onEmptyEnter, maxResults = 8, uppercase = false, menuClassName = "", ...props }) => {
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
      {open && filtered.length > 0 && (
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
                  : opt.type === "company"
                    ? "text-emerald-700 hover:bg-slate-50"
                    : opt.type === "contact"
                      ? "text-sky-700 hover:bg-slate-50"
                      : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{opt.label}</span>
              {opt.type !== "generic" && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">{opt.type}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Toast = ({message,onClose})=>{ 
  useEffect(()=>{ const id=setTimeout(onClose,2600); return ()=>clearTimeout(id);},[onClose]); 
  return(<div className="fade-in fixed bottom-28 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-slate-800/90 backdrop-blur px-6 py-2.5 text-sm font-medium text-white shadow-xl shadow-slate-500/20">{message}</div>) 
};

const Switch = ({ checked, onChange }) => (
    <button 
        onClick={() => onChange(!checked)} 
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-sky-500' : 'bg-slate-200'}`}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SmartNotification = ({ message, onReject, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 flex items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-2xl slide-up border border-slate-700">
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
const pillActive = "bg-sky-50 border-sky-500 text-sky-700 font-bold shadow-sm animate-outline-fade-purple"; 

const ToggleGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
       const label = typeof opt === "string" ? opt : opt.label;
       const title = typeof opt === "string" ? undefined : opt.title;
       const isActive = value === label;
       return (<button key={label} type="button" title={title} aria-pressed={isActive} onClick={() => onChange(isActive ? "" : label)} className={isActive ? `${pillBase} ${pillActive}` : `${pillBase} ${pillInactive}`}>
         {isActive && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
         {label}
       </button>)
    })}
  </div>
);

const RoleBadge = ({ icon, title }) => (
  <span title={title} className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
    <span className="text-[11px]">{icon}</span>
    {title}
  </span>
);

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
                          <span className="mr-1">{r.icon}</span>{r.label}
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
                            <RoleBadge icon={r.icon} title={r.title} />
                          </button>
                        ) : (
                          <RoleBadge key={`${r.title}-${idx}`} icon={r.icon} title={r.title} />
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
          {roles.map(r => <RoleBadge key={r.title} icon={r.icon} title={r.title} />)}
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
              <span className="mr-1">{r.icon}</span>{r.label}
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

const ToggleMulti = ({ label, checked, onChange, className, colorClass, title, showDot = true }) => {
    const activeClass = colorClass || pillActive;
    return (
        <button type="button" onClick={onChange} title={title} aria-pressed={checked} className={(checked ? `${pillBase} ${activeClass}` : `${pillBase} ${pillInactive}`) + " " + (className||"")}> 
            {checked && showDot && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
            {label}
        </button>
    );
};

const SubSection = ({ id, title, open, onToggle, children, compact, className, action }) => {
  const handleToggle = () => onToggle?.(!open);
  return (
    <div id={id} className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-5"} shadow-sm scroll-mt-28 ${className || ""}`}>
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

const LeadInfoFields = memo(({ data, update, updateMany, companies, setModal, toggleMulti, showInlineHelp, auditOn, salesRep, setSalesRep, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, setToast, getSalesRepForContact, onOpenCrmLog, onPromptRoleAssignment }) => {
  const [referrerQuery, setReferrerQuery] = useState(data.referrer || "");
  const [repMenuOpen, setRepMenuOpen] = useState(false);
  const [showSuggestedRoles, setShowSuggestedRoles] = useState(false);
  const [suggestedSelection, setSuggestedSelection] = useState(suggestedReferrerRoles || []);
  const [suggestedRolesOffsetTop, setSuggestedRolesOffsetTop] = useState(72);
  const referrerFieldAnchorRef = useRef(null);
  const suggestedRolesCardRef = useRef(null);
  const referrerRep = getSalesRepForContact && data.referrer ? getSalesRepForContact(data.referrer) : "";
  useEffect(() => setReferrerQuery(data.referrer || ""), [data.referrer]);
  useEffect(() => setSuggestedSelection(suggestedReferrerRoles || []), [suggestedReferrerRoles]);
  const referrerBestMatch = getBestMatch(combinedContactOptions || [], referrerQuery);
  const roleActive = {
    insurance: !!data.referringCompany && data.insuranceCompany === data.referringCompany,
    billing: !!data.referringCompany && data.billingCompany === data.referringCompany,
    national: !!data.referringCompany && data.nationalCarrier === data.referringCompany,
    adjuster: !!data.referrer && data.insuranceAdjuster === data.referrer
  };
  const referrerRoles = [];
  if (roleActive.insurance) referrerRoles.push({ icon: "🛡️", title: "Insurance" });
  if (roleActive.adjuster) referrerRoles.push({ icon: "🧑‍💼", title: "Adjuster" });
  if (roleActive.billing) referrerRoles.push({ icon: "💳", title: "Billing" });
  if (roleActive.national) referrerRoles.push({ icon: "🌐", title: "National" });
  const applyReferrerValue = (value) => {
    const parsed = parseCombinedContact?.(value) || { contact: value, company: "" };
    if (parsed.contact && !parsed.company) {
      setToast("Contact must include a company.");
      return;
    }
    const patch = {
      referrer: parsed.contact,
      referringCompany: parsed.company || data.referringCompany
    };
    if (getSalesRepForContact && parsed.contact && !data.salesRep) {
      const rep = getSalesRepForContact(parsed.contact);
      if (rep) patch.salesRep = rep;
    }
    updateMany(patch);
    if (parsed.company) triggerAutoFlash?.("referringCompany");
    if (parsed.contact) triggerAutoFlash?.("referrer");
    onPromptRoleAssignment?.({
      company: parsed.company || "",
      contact: parsed.contact || "",
      source: "referrer",
      preferredRoles: ["referrer"],
      forceRoles: ["referrer"]
    });
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
    if (data.referrer && data.referrer.toLowerCase() === referrerQuery.toLowerCase()) return;
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
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
      <Field label="Source">
          <div className="flex flex-wrap justify-start gap-2" data-audit-key="leadSourceCategory">
               {LEAD_SOURCES.map(s => <ToggleMulti key={s} label={s} title={LEAD_SOURCE_HELP[s]} checked={data.leadSourceCategory === s} onChange={() => update("leadSourceCategory", s)} />)}
          </div>
      </Field>
      {showInlineHelp && data.leadSourceCategory && (
        <div className="text-[11px] text-slate-400">
          {data.leadSourceCategory === "Referral" && "Opportunity came from a Company or Contact."}
          {data.leadSourceCategory === "Marketing" && "Opportunity came from Marketing efforts."}
          {data.leadSourceCategory === "Internal" && "Opportunity came from other internal sources."}
        </div>
      )}

      {data.leadSourceCategory === "Referral" && (
           <div className="grid gap-4 animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100">
               <div ref={referrerFieldAnchorRef}>
                 <Field
                   label="Referrer (Contact or Company)"
                   action={
                     referrerRep ? (
                       <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
                         <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-[9px] font-bold">{getRepInitials(referrerRep)}</span>
                         <span>Rep</span>
                       </div>
                     ) : null
                   }
                 >
                 <div className="max-w-sm">
                     <SearchSelect
                       data-audit-key="referrer"
                       className={auditOn && data.highlightMissing?.referrer ? "audit-missing" : ""}
                       value={data.referrer}
                       onChange={(v)=>applyReferrerValue(v)}
                       onQueryChange={(v)=>setReferrerQuery(v)}
                     options={combinedContactOptions}
                     placeholder="Type contact or company..."
                     onBlur={() => ensureReferrerFromQuery()}
                   />
                 </div>
                 {referrerBestMatch && referrerBestMatch !== data.referrer && (
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
                 </Field>
               </div>
               <div className="flex items-center justify-between text-xs text-slate-500">
                 <span>CRM Log</span>
                 <button
                   onClick={onOpenCrmLog}
                   className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                 >
                   + Add CRM Log
                 </button>
               </div>
               {/* Referrer record now appears in Companies list */}
           </div>
       )}
      {data.leadSourceCategory === "Marketing" && (
           <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100"><Field label="Channel"><div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">{MARKETING_SOURCES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}</div></Field></div>
       )}
       {data.leadSourceCategory === "Internal" && (
           <div className="animate-indigo-fade p-4 rounded-lg bg-sky-50/30 border border-sky-100"><Field label="Type"><div className="flex flex-wrap gap-2" data-audit-key="leadSourceDetail">{INTERNAL_TYPES.map(s => <ToggleMulti key={s} label={s} checked={data.leadSourceDetail === s} onChange={() => update("leadSourceDetail", s)} />)}</div></Field></div>
       )}

      <Field label="Method">
          <div className="flex flex-wrap justify-start gap-2">
               {CONTACT_METHODS.map(m => <ToggleMulti key={m} label={m} title={CONTACT_METHOD_HELP[m]} checked={data.contactMethod === m} onChange={() => update("contactMethod", m)} />)}
          </div>
      </Field>

      <Field label="Sales Rep" className="max-w-[90px]">
        <div className="relative inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRepMenuOpen(v => !v)}
            className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold border border-sky-200 hover:bg-sky-50"
            title={salesRep || "Select sales rep"}
          >
            {getRepInitials(salesRep || "Rep")}
          </button>
          <span className="text-xs text-slate-400">Rep</span>
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
      {showSuggestedRoles && (
        <div data-suggested-roles-modal="true" className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-900/35 p-4">
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
  "Provide an order name: An order name helps identify the job. It will auto‑populate when you enter the customer’s name and address, but verify it before saving.",
  "Capture contact information: Make sure at least one phone number or email is recorded for the primary customer. Include additional contacts (spouse, adjuster, mover) if relevant.",
  "Fill in the Interview section: Open the Interview section and answer as many questions as you can (e.g., project type, severity, origin, cause). Smart fields marked with a lightning‑bolt icon will automatically fill related fields and display a confirmation toast.",
  "Scheduling appointments: In the Schedule section you can either type directly over the date and time or use the calendar and clock icons to pick them. Indicate whether the event is firm or tentative, select the correct service offerings, and provide clear event instructions.",
  "Refinements for insurance claims: When entering insurance details, indicate whether it’s an insurance claim, select the insurance company, and add the adjuster’s contact via the quick‑add menu. Use the same menu to add other companies (e.g., movers, contractors).",
  "Review before saving: Check that all required fields (Referrer, Bill‑To, order name, schedule date/time) are completed. Missing required fields may trigger a warning before submission. Once complete, click Save, review the summary, and then choose Continue Save to submit the order."
];

const AI_TIME_SAVING_TIPS = [
  "Use “quick add” wherever possible: The quick‑add menu is the fastest way to assign roles like adjuster, mover or contractors. Begin typing a name or company and select the correct match from the drop‑down instead of creating contacts from scratch.",
  "Type times directly into the schedule: If the time picker is hard to use, double‑click in the time field, press Ctrl + A to highlight the existing entry and type the desired time (e.g., 12:00 PM). Press Enter to confirm.",
  "Look for auto‑fill hints: When you enter a customer’s name and address, the order name and other fields may auto‑populate. Accept these suggestions to save time and ensure consistency.",
  "Document thoroughly in notes: Use the Interview and Event Instructions fields to capture details about the job (e.g., site conditions, special handling instructions, pets on site). Detailed notes reduce follow‑up questions later.",
  "Use keyboard shortcuts: Press Tab or Enter to move forward, and Shift + Tab or Shift + Enter to move backward through fields. Keyboard navigation can speed up data entry and reduce reliance on the mouse."
];

// --- START SCREEN ---
const StartScreen = ({ onSelect }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 fade-in scale-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">New Order Entry</h1>
        <p className="text-lg text-slate-500">Choose your entry mode</p>
        <button
          type="button"
          onClick={() => setShowGuidelines(v => !v)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          Start here {showGuidelines ? "▾" : "▸"}
        </button>
      </div>

      {showGuidelines && (
        <div className="mb-10 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-sky-600">AI App Usage Guidelines</div>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_USAGE_GUIDELINES.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">Additional Time‑Saving Tips</div>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_TIME_SAVING_TIPS.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
      <button 
        onClick={() => onSelect('quick')}
        className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">⚡</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Quick Entry</h2>
        <p className="text-center text-slate-500">Rapid data capture. Basic details, location, and scheduling.</p>
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Fast →</div>
      </button>
      <button 
        onClick={() => onSelect('detailed')}
        className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📝</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Detailed Entry</h2>
        <p className="text-center text-slate-500">Full interview process. Smart triggers, detailed conditions, and billing.</p>
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Detailed →</div>
      </button>
      <button 
        onClick={() => onSelect('same-day-scope')}
        className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📦</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Same Day Scope</h2>
        <p className="text-center text-slate-500">Room-by-room pack-out scope with guided lists and notes.</p>
        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Open Scope →</div>
      </button>
      </div>
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
    { id: 'sec1', sub: 'order', label: 'Project Type', keywords: 'project type restoration non-restoration' },
    { id: 'sec1', sub: 'order', label: 'Order Type', keywords: 'order type loss types fire water mold dust debris puffback oil non-restoration cleaning commercial residential' },
    { id: 'sec1', sub: 'order', label: 'Service Offerings', keywords: 'service offerings rugs furniture packout consulting storage tli appliance art textiles' },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Fire', keywords: 'fire smoke soot battery candle cooking electrical explosion fireplace flammables heating neighbor protein smoking wildfire', action: () => onSearchHit('Fire') },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Water', keywords: 'water leak roof window frozen pipe burst overflow storm', action: () => onSearchHit('Water') },
    { id: 'sec1', sub: 'order', label: 'Loss Type: Mold', keywords: 'mold spores visible odor', action: () => onSearchHit('Mold') },
    { id: 'sec1', sub: 'order', label: 'Cause', keywords: 'cause origin' },
    { id: 'sec1', sub: 'order', label: 'Origin', keywords: 'origin location' },
    { id: 'sec1', sub: 'order', label: 'Severity', keywords: 'severity rejects' },
    { id: 'sec1', sub: 'interview', label: 'Interview', keywords: 'interview living staying temp moving repairs packout conditions' },
    { id: 'sec1', sub: 'codes', label: 'Order Codes', keywords: 'handling severity quality box damp' },
    { id: 'sec1', sub: 'source', label: 'Source', keywords: 'source referral marketing internal method sales rep' },
    { id: 'sec1', sub: 'source', label: 'Referrer (Contact or Company)', keywords: 'referrer referring company contact' },
    { id: 'sec1', sub: 'source', label: 'Method', keywords: 'method call email form meeting text tpa' },
    { id: 'sec1', sub: 'source', label: 'Sales Rep', keywords: 'sales rep representative rep' },

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
    { id: 'sec4', sub: 'insurance', label: 'Work Order #', keywords: 'work order number' },
    { id: 'sec4', sub: 'insurance', label: 'Policy #', keywords: 'policy number' },
    { id: 'sec4', sub: 'insurance', label: 'Order Specific Email', keywords: 'order specific email insurance email' },
    { id: 'sec4', sub: 'insurance', label: 'Contents Limit', keywords: 'contents limit coverage' },
    { id: 'sec4', sub: 'insurance', label: 'Mold Limit', keywords: 'mold limit coverage' },
    { id: 'sec4', sub: 'finance', label: 'Pricing Platform', keywords: 'pricing platform' },
    { id: 'sec4', sub: 'finance', label: 'Price List', keywords: 'price list' },
    { id: 'sec4', sub: 'finance', label: 'Price Multiplier', keywords: 'price multiplier' },
    { id: 'sec4', sub: 'finance', label: 'Estimate Requested', keywords: 'estimate requested' },
    { id: 'sec4', sub: 'companies', label: 'Companies & Contacts', keywords: 'companies contacts add company contact vendor' },

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
const Header = ({ activeSection, visitedSections, completedSections, onJump, onJumpSub, title, version, entryMode, setEntryMode, showInlineHelp, setShowInlineHelp, compactMode, setCompactMode, onReset, currentUser, setCurrentUser, setShowSampleDataModal, onOpenPresets, presetCount }) => {
    const steps = [
        { id: 'sec1', label: 'Order', subsections: [{ id: "order", label: "Order" }, { id: "source", label: "Source" }, { id: "interview", label: "Interview" }, { id: "codes", label: "Codes" }] },
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200 shadow-md shadow-slate-900/5">
            <div className="max-w-6xl mx-auto px-4 pt-4 pb-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 min-w-[120px]">
                     <button onClick={() => setEntryMode('start')} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
                        <span className="text-lg">←</span>
                     </button>
                     <div className="flex flex-col">
                         <h1 className="text-base font-bold text-slate-900 leading-none">{title}</h1>
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
                        onClick={() => setShowSettings(v => !v)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    >
                        <span>Settings ⚙︎</span>
                    </button>
                    {showSettings && (
                        <div className="absolute right-0 top-10 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
                            <button 
                                onClick={() => setShowInlineHelp(!showInlineHelp)} 
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${showInlineHelp ? 'bg-sky-50 text-sky-600' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <span>Inline Help</span>
                                <span>{showInlineHelp ? 'On' : 'Off'}</span>
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
const FloatingCapsule = ({ entryMode, setEntryMode, onSave, onAudit, auditOn, setShowSearch, onPlan }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="fixed bottom-4 sm:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none fade-in" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className={`pointer-events-auto bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.15)] shadow-slate-700/30 rounded-full flex items-center p-1.5 gap-2 transition-all duration-500 ease-out ${expanded ? 'px-3' : 'px-2'}`}>
                
                <button 
                    onClick={() => setExpanded(!expanded)} 
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    title={expanded ? "Collapse" : "Expand"}
                >
                    <span className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : 'rotate-0'}`}>›</span>
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <button onClick={() => setShowSearch(true)} className={`flex items-center justify-center h-10 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 ${expanded ? 'px-4 gap-2 bg-slate-50' : 'w-10'}`}>
                    <span className="text-lg">🔍</span>
                    {expanded && <span className="text-sm font-bold">Search</span>}
                </button>

                <button 
                    onClick={() => setEntryMode(entryMode === 'quick' ? 'detailed' : 'quick')} 
                    className={`flex items-center justify-center h-10 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 ${expanded ? 'px-4 gap-2 bg-slate-50' : 'w-10'}`}
                >
                    <span className="text-lg">{entryMode === 'quick' ? '⚡' : '📝'}</span>
                    {expanded && <span className="text-sm font-bold">{entryMode === 'quick' ? 'Detailed' : 'Quick'}</span>}
                </button>

                <button onClick={onAudit} className={`flex items-center justify-center h-10 rounded-full transition-all ${auditOn ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'} ${expanded ? 'px-4 gap-2' : 'w-10'}`}>
                    <span className="text-lg">📋</span>
                    {expanded && <span className="text-sm font-bold">{auditOn ? 'Audit: On' : 'Audit'}</span>}
                </button>

                <button onClick={onPlan} className={`flex items-center justify-center h-10 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 ${expanded ? 'px-4 gap-2 bg-slate-50' : 'w-10'}`}>
                    <span className="text-lg">🧭</span>
                    {expanded && <span className="text-sm font-bold">Plan</span>}
                </button>

                <button onClick={onSave} className={`flex items-center justify-center h-10 rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200 hover:bg-sky-500 transition-all ${expanded ? 'px-6 gap-2' : 'w-10'}`}>
                    <span className="text-lg">💾</span>
                    {expanded && <span className="text-sm font-bold">Save</span>}
                </button>

            </div>
        </div>
    );
};


const Section = ({ id, title, helpText, isOpen, onToggle, onHeaderClick, onCaretClick, children, badges, className, compact }) => {
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
    <div id={id} className={`mb-0 overflow-hidden rounded-none border-y border-slate-200 bg-white shadow-sm transition-shadow duration-300 scroll-mt-28 sm:mb-4 sm:rounded-xl sm:border ${isOpen ? 'ring-1 ring-sky-500/20 shadow-md' : ''} ${className||""}`}>
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
const CustomerItem = memo(({ c, index, total, updateCust, onRemove, highlightMissing, auditOn, onAddHousehold, onSendWelcome, contacts }) => {
  const toggleList = (list, value) => list.includes(value) ? list.filter(v=>v!==value) : [...list, value];
  const [householdName, setHouseholdName] = useState("");
  const [open, setOpen] = useState(false);
  const customerDisplayName = [c.first, c.last].filter(hasMeaningfulValue).join(" ").trim();
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
  return (
    <div
      data-audit-key={customerPlaceholder ? `placeholder-customer-${c.id}` : undefined}
      className={`group relative rounded-lg sm:rounded-xl border bg-white p-3 sm:p-5 shadow-sm transition-all hover:border-sky-300 hover:shadow-md ${customerPlaceholder ? "placeholder-shell" : (c.isPrimary ? "border-sky-400 ring-1 ring-sky-50" : "border-slate-200")}`}
    >
      {c.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && ( <button onClick={() => onRemove(c.id, index)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">×</button> )}
      
      <div
        className="mb-4 flex cursor-pointer flex-col gap-3 pl-1 sm:pl-2 sm:flex-row sm:items-center sm:justify-between"
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
	            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">{index + 1}</div>
	            <div className="flex flex-col">
	              <span className={`text-sm font-semibold ${customerDisplayName ? "text-slate-800" : (customerPlaceholder ? "placeholder-text" : "text-slate-800")}`}>{customerDisplayName || "Customer"}</span>
	              <span className={`text-[10px] ${customerPlaceholder ? "placeholder-text" : "text-slate-500"}`}>{customerRoleLabel}</span>
	            </div>
              {customerPlaceholder && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>
              )}
	         </div>
	         <div className="flex flex-wrap gap-2">
	            <ToggleMulti className="!py-1 !px-3 sm:!px-3 !text-xs" label="Primary" checked={!!c.isPrimary} onChange={()=>updateCust(c.id, { isPrimary: true })} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} />
            <ToggleMulti className="!py-1 !px-2 sm:!px-3 !text-xs" label="Policy Holder" checked={!!c.policyHolder} onChange={()=>updateCust(c.id, { policyHolder: !c.policyHolder, type: !c.policyHolder ? "Policyholder" : c.type })} />
            <ToggleMulti className="!py-1 !px-2 sm:!px-3 !text-xs" label="Self Pay" checked={!!c.selfPay} onChange={()=>updateCust(c.id, { selfPay: !c.selfPay, type: !c.selfPay ? "Owner" : c.type })} />
         </div>
      </div>

      {open && (
      <div className="grid gap-4 pl-1 sm:pl-2">
         <div className="w-full sm:w-1/2">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500">Type</label>
              {c.type && (
                <button
                  type="button"
                  onClick={() => updateCust(c.id, { type: "" })}
                  className="text-[10px] font-semibold text-slate-400 hover:text-rose-600"
                >
                  Clear
                </button>
              )}
            </div>
            <SearchSelect value={c.type || ""} onChange={(v)=>updateCust(c.id,{type:v})} options={CUSTOMER_TYPES} listId={`customer-type-${c.id}`} placeholder="Search relationship..." maxResults={CUSTOMER_TYPES.length} />
         </div>

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name"><Input data-audit-key="custFirst" className={index===0 && auditOn && highlightMissing?.custFirst ? "audit-missing" : ""} value={c.first} onChange={e=>updateCust(c.id,{first:e.target.value})} /></Field>
            <Field label="Last Name"><Input data-audit-key="custLast" className={index===0 && auditOn && highlightMissing?.custLast ? "audit-missing" : ""} value={c.last} onChange={e=>updateCust(c.id,{last:e.target.value})} /></Field>
         </div>

         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center"><label className="text-sm font-semibold text-slate-700">Phone</label><button className="text-xs text-sky-600 font-bold hover:text-sky-700">+ Add</button></div>
                <div className="flex gap-2">
                    <div className="w-1/3"><Select value={c.phoneType} onChange={(e) => updateCust(c.id, { phoneType: e.target.value })}><option>Mobile</option><option>Home</option><option>Work</option></Select></div>
                    <Input data-audit-key="custPhone" className={`flex-1 ${index===0 && auditOn && highlightMissing?.custPhone ? "audit-missing" : ""}`} type="tel" value={c.phone} onChange={e=>updateCust(c.id,{phone: formatPhoneNumber(e.target.value)})} maxLength={14} placeholder="(555) 123-4567" />
                </div>
             </div>
             <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center"><label className="text-sm font-semibold text-slate-700">Email</label><button className="text-xs text-sky-600 font-bold hover:text-sky-700">+ Add</button></div>
                <Input data-audit-key="custEmail" className={index===0 && auditOn && highlightMissing?.custEmail ? "audit-missing" : ""} type="email" value={c.email} onChange={e=>updateCust(c.id,{email:e.target.value})} placeholder="user@example.com" />
             </div>
         </div>

         <Field label="Preferred Contact Method">
             <div className="flex flex-wrap gap-2">
                 {["Phone", "Email", "Text"].map(m => (
                     <ToggleMulti key={m} label={m} checked={c.preferredMethod === m} onChange={() => updateCust(c.id, { preferredMethod: m })} colorClass="!bg-sky-500 !border-sky-500 !text-white" />
                 ))}
             </div>
         </Field>

         <div className="flex items-center gap-3">
           <span className="text-sm font-bold text-rose-700">Do Not Contact</span>
           <Switch checked={!!c.doNotContact} onChange={(val)=>updateCust(c.id,{doNotContact: val})} />
           {c.doNotContact && (
             <span className="text-xs text-rose-700">Enabled</span>
           )}
         </div>

         <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
             <button onClick={() => updateCust(c.id, { showWelcomePanel: !c.showWelcomePanel })} className="flex w-full items-center justify-between">
               <span className="text-sm font-bold text-slate-700">Send Welcome Text</span>
               <span className="text-slate-400 text-lg">{c.showWelcomePanel ? "▾" : "›"}</span>
             </button>
             {c.showWelcomePanel && (
               <div className="space-y-3">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                     <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-200" checked={!!c.sendBrochure} onChange={e=>updateCust(c.id,{sendBrochure:e.target.checked})} /> Send Brochure</label>
                     <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-200" checked={!!c.sendRushGuide} onChange={e=>updateCust(c.id,{sendRushGuide:e.target.checked})} /> Send Rush Guide</label>
                     <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-200" checked={!!c.sendAuthLink} onChange={e=>updateCust(c.id,{sendAuthLink:e.target.checked})} /> Authorization Form Link</label>
                     <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-200" checked={!!c.sendCosLink} onChange={e=>updateCust(c.id,{sendCosLink:e.target.checked})} /> COS Link</label>
                     <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-slate-200" checked={!!c.sendGoogleReviewLink} onChange={e=>updateCust(c.id,{sendGoogleReviewLink:e.target.checked})} /> Google Review Link</label>
                 </div>
                 <div className="flex items-center justify-end">
                   <button onClick={() => onSendWelcome?.(c.id)} disabled={!canSendWelcome} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${canSendWelcome ? 'bg-sky-500 text-white hover:bg-sky-500' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Send</button>
                 </div>
                 {!hasMobile && (
                   <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                     Add a mobile phone number to send texts.
                   </div>
                 )}
                 {c.doNotContact && (
                   <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                     Do Not Contact is enabled. Sending is disabled.
                   </div>
                 )}
               </div>
             )}
         </div>

         <Field label="Notes">
             <div className="mb-2">
               <button
                 onClick={() => updateCust(c.id, { showQuickNotes: !c.showQuickNotes })}
                 className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${c.showQuickNotes ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
               >
                 📝 Add Quick Note
               </button>
             </div>
             {c.showQuickNotes && (
                 <div className="mb-2 flex flex-wrap gap-2">
                     {CUSTOMER_QUICK_NOTES.map(n => (
                         <ToggleMulti key={n} label={n} checked={(c.quickNotes || []).includes(n)} onChange={() => toggleQuickNote(n)} />
                     ))}
                 </div>
             )}
             <Textarea value={c.note} onChange={e => updateCust(c.id, { note: e.target.value })} placeholder="Add notes about this customer..." />
         </Field>

         {c.isPrimary && (
           <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
               <div className="flex items-center justify-between">
                   <span className="text-sm font-bold text-emerald-800">Household</span>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <Field label="Number of Members">
                   <Input type="number" value={c.householdCount || ""} onChange={e=>updateCust(c.id,{householdCount:e.target.value})} placeholder="#" />
                 </Field>
                <Field label="Pets">
                  <Input value={c.householdAnimals || ""} onChange={e=>updateCust(c.id,{householdAnimals:e.target.value})} placeholder="Enter type and names" />
                </Field>
               </div>
               <Field label="Quick Add Names">
                 <div className="flex gap-2">
                   <Input
                     value={householdName}
                     onChange={e=>setHouseholdName(e.target.value)}
                     placeholder="Name"
                     onKeyDown={(e) => {
                       if (e.key === "Enter") {
                         e.preventDefault();
                         const name = householdName.trim();
                         if (!name) return;
                         const next = [...(c.householdMembers || []), name];
                         updateCust(c.id, { householdMembers: next });
                         setHouseholdName("");
                       }
                     }}
                   />
                   <button
                     onClick={() => {
                       const name = householdName.trim();
                       if (!name) return;
                       const next = [...(c.householdMembers || []), name];
                       updateCust(c.id, { householdMembers: next });
                       setHouseholdName("");
                     }}
                     className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                   >
                     Add
                   </button>
                 </div>
                 {(c.householdMembers || []).length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-2">
                     {(c.householdMembers || []).map((n, idx) => (
                       <span key={`${n}-${idx}`} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                         {n}
                       </span>
                     ))}
                   </div>
                 )}
               </Field>
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
      className={`group relative overflow-hidden rounded-lg sm:rounded-xl border bg-white p-3 sm:p-5 shadow-sm transition-all hover:shadow-md ${placeholder ? "placeholder-shell" : (addr.isPrimary ? "border-sky-400 ring-1 ring-sky-50" : "border-slate-200")}`}
    >
      {addr.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && ( <button onClick={()=>onRemove(addr.id)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">×</button> )}
      <div
        className="mb-4 pl-1 sm:pl-2 flex items-center gap-2 cursor-pointer"
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
         <div className="flex flex-col">
           <span className={`text-sm font-bold ${placeholder ? "placeholder-text" : "text-slate-800"}`}>{addr.type || "Address"}</span>
           <span className="text-[10px] text-slate-500">{summarizeAddress(addr)}</span>
         </div>
         {placeholder && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>}
         {addr.isPrimary && <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">Primary</span>}
         {addr.isLossSite && <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">Loss Site</span>}
      </div>
      {open && (
      <div className="grid gap-4 pl-1 sm:pl-2">
        <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-2">
          <Field label="Find on Google (recommended)" subtle className="text-sky-700">
            <div className="flex gap-2">
              <Input
                placeholder="Start typing address..."
                value={addr.googleQuery || ""}
                onChange={e=>updateAddr(addr.id,{googleQuery:e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    updateAddr(addr.id,{street:"1 Main St",city:"Bloomingdale",state:"NJ",zip:"07403"});
                  }
                }}
              />
              <button className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 transition-all" onClick={()=>updateAddr(addr.id,{street:"1 Main St",city:"Bloomingdale",state:"NJ",zip:"07403"})}>Search</button>
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <Field label="Type">
              <Select
                ref={typeSelectRef}
                value={addr.type}
                onChange={e=>updateAddr(addr.id,{type:e.target.value})}
                className={placeholder && !addr.type ? "attention-fill" : ""}
              >
                <option value="" disabled>Select Type...</option>
                {["House","Apartment","Garden Apartment","Row House","Neighbor","Hotel","Moving","Relative","Rental","Other Home","Temp","Work","Other"].map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
              {placeholder && !addr.type && (
                <div className="mt-1 text-[10px] font-semibold text-orange-700">
                  Select address type now, or leave as placeholder for later.
                </div>
              )}
            </Field>
          </div>
          <div className="flex-1"><Field label="Location Status"><div className="flex gap-2"><ToggleMulti label="Primary" checked={!!addr.isPrimary} onChange={()=>updateAddr(addr.id,{isPrimary:!addr.isPrimary})} colorClass="!bg-sky-100 !border-sky-400 !text-sky-700" showDot={false} /><ToggleMulti label="Loss Site" checked={!!addr.isLossSite} onChange={()=>updateAddr(addr.id,{isLossSite:!addr.isLossSite})} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} /></div></Field></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Street Address"><Input data-audit-key="addrStreet" className={index===0 && auditOn && highlightMissing?.addrStreet ? "audit-missing" : ""} value={addr.street} onChange={e=>updateAddr(addr.id,{street:e.target.value})} /></Field><Field label="Apt / Unit #"><Input value={addr.apt} onChange={e=>updateAddr(addr.id,{apt:e.target.value})} /></Field></div>
        <div className="grid grid-cols-3 gap-4">
           <div className="col-span-1"><Field label="City"><Input data-audit-key="addrCity" className={index===0 && auditOn && highlightMissing?.addrCity ? "audit-missing" : ""} value={addr.city} onChange={e=>updateAddr(addr.id,{city:e.target.value})} /></Field></div>
           <div className="col-span-1">
             <Field label="State">
               <SearchSelect
                 value={addr.state}
                 onChange={(v)=>updateAddr(addr.id,{state:v})}
                 options={STATES}
                 placeholder="State"
                 className={index===0 && auditOn && highlightMissing?.addrState ? "audit-missing" : ""}
                 maxResults={STATES.length}
                 uppercase
               />
               <div className="mt-1 text-[10px] text-slate-400">Press Tab to accept.</div>
             </Field>
           </div>
           <div className="col-span-1"><Field label="Zip"><Input data-audit-key="addrZip" className={index===0 && auditOn && highlightMissing?.addrZip ? "audit-missing" : ""} value={addr.zip} onChange={e=>updateAddr(addr.id,{zip:e.target.value})} inputMode="numeric" pattern="\d{5}" /></Field></div>
        </div>
        <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${verified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"} ${index===0 && auditOn && (!addr.lat || !addr.lng) ? "audit-missing" : ""}`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {verified ? "✓" : "!"}
            </span>
            <span className={verified ? "text-emerald-700" : "text-amber-700"}>
              {verified ? "Verified by Google" : "Address not verified"}
            </span>
          </div>
          <button
            onClick={() => setCoordsOpen(v => !v)}
            className="text-[10px] font-bold text-slate-500 hover:text-sky-700"
          >
            {coordsOpen ? "Hide coords" : "Edit coords"}
          </button>
          {index === 0 && (
            <>
              <span data-audit-key="addrLat" className="block h-[1px] w-[1px] opacity-0" />
              <span data-audit-key="addrLng" className="block h-[1px] w-[1px] opacity-0" />
            </>
          )}
        </div>
        {coordsOpen && (
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-1"><Field label="Latitude"><Input className={index===0 && auditOn && highlightMissing?.addrLat ? "audit-missing" : ""} value={addr.lat} onChange={e=>updateAddr(addr.id,{lat:e.target.value})} placeholder="e.g. 40.8874" /></Field></div>
             <div className="col-span-1"><Field label="Longitude"><Input className={index===0 && auditOn && highlightMissing?.addrLng ? "audit-missing" : ""} value={addr.lng} onChange={e=>updateAddr(addr.id,{lng:e.target.value})} placeholder="e.g. -74.0291" /></Field></div>
          </div>
        )}
        {index === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Field label="Rent or Own?">
              <ToggleGroup options={["Rent","Own"]} value={rentOrOwn} onChange={onRentOrOwnChange} />
            </Field>
            {rentOrOwn === "Rent" && (
              <div className="mt-3 rounded-lg border border-orange-300 bg-orange-50 p-3">
                <div className="text-sm font-bold text-orange-800 mb-2">Confirm Coverage</div>
                <Input data-audit-key="rentCoverageLimit" className={auditOn && highlightMissing?.rentCoverageLimit ? "audit-missing" : ""} value={rentCoverageLimit || ""} onChange={e=>onRentCoverageChange(e.target.value)} placeholder="Coverage amount ($)" />
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
           <div className="text-xs text-slate-500">Verify address and auto-fill lat/long (demo)</div>
           <button onClick={() => onVerify?.(addr.id)} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-600">Verify</button>
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
const QuickEntry = ({ data, update, updateMany, updateAddr, updateCust, companies, setModal, toggleMulti, updateSmart, handleConfirmClick, setToast, showInlineHelp, auditOn, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, quickQuestionsCollapsed, setQuickQuestionsCollapsed, compactMode, recordTypeLabel, getSalesRepForContact, onOpenCrmLog, onOpenReminder, knownPeople, onSetNowDate, onSetNowTime, dateCloseSignal, timeCloseSignal, onPromptRoleAssignment }) => {
    const [eventNoteDraft, setEventNoteDraft] = useState("");
    const [showQuickInstructions, setShowQuickInstructions] = useState(false);
    const [showLoadListPanel, setShowLoadListPanel] = useState(false);
    const [showAllEventNotes, setShowAllEventNotes] = useState(false);
    const [editSystemInstructions, setEditSystemInstructions] = useState(false);
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Quick Questions</div>
                {quickQuestionsCollapsed && (
                  <button className="text-[10px] font-bold text-sky-600 hover:text-sky-700" onClick={() => setQuickQuestionsCollapsed(false)}>Edit</button>
                )}
              </div>
              {quickQuestionsCollapsed ? (
                <div className="mt-3 text-xs text-slate-600 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${recordTypeLabel === "Select Type" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{recordTypeLabel}</span>
                  {data.restorationType && <span className="rounded-full bg-slate-100 px-2 py-0.5">{data.restorationType}</span>}
                  {data.involvesInsurance && <span className="rounded-full bg-slate-100 px-2 py-0.5">Insurance: {data.involvesInsurance}</span>}
                  {data.payorQuick && <span className="rounded-full bg-slate-100 px-2 py-0.5">Payor: {data.payorQuick}</span>}
                </div>
              ) : (
                <div className={`mt-4 ${compactMode ? "space-y-3" : "space-y-4"}`}>
                  <Field label="Is this an Order or only a Lead?">
                    <ToggleGroup options={[
                      { label: "Order", title: "Active project with confirmed billing." },
                      { label: "Lead", title: "Potential project; incomplete information or no billing yet." }
                    ]} value={data.isLead === true ? "Lead" : data.isLead === false ? "Order" : ""} onChange={v => update("isLead", v === "Lead")} />
                  </Field>
                  <Field label="Is this a restoration project or non-restoration project?">
                    <ToggleGroup options={[
                      { label: "Restoration Project", title: "Project involving a loss event (fire, water, pests, etc.)." },
                      { label: "Non-Restoration Project", title: "Service without a loss event (cleaning, storage, etc.)." }
                    ]} value={data.restorationType} onChange={v => update("restorationType", v)} />
                  </Field>
                  {data.restorationType === "Restoration Project" && (
                    <Field label="Does it involve insurance?">
                      <ToggleGroup options={[
                        { label: "Yes", title: "Whether customer is filing an insurance claim." },
                        { label: "No", title: "Whether customer is filing an insurance claim." }
                      ]} value={data.involvesInsurance} onChange={v => update("involvesInsurance", v)} />
                    </Field>
                  )}
                  {data.involvesInsurance === "Yes" && (
                    <Field label="Who will be paying?">
                      <ToggleGroup options={[
                        { label: "Insurance", title: "Whether customer is filing an insurance claim." },
                        { label: "Self-pay", title: "Customer pays directly without insurance." },
                        { label: "Referrer", title: "Referring party covers payment." },
                        { label: "Public Adjuster", title: "Public adjuster covers payment." },
                        { label: "Other", title: "Other payment arrangement." }
                      ]} value={data.payorQuick} onChange={v => { update("payorQuick", v); update("billingPayer", v === "Self-pay" ? "Customer" : (v === "Insurance" ? "Insurance" : v)); }} />
                    </Field>
                  )}
                </div>
              )}
            </div>

            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={onApplyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={onOpenCrmLog} onPromptRoleAssignment={onPromptRoleAssignment} />

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase text-sky-600">Quick Flags</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Restoration Project?">
                        <ToggleGroup options={["Y", "N"]} value={data.isRestorationProject} onChange={v => update("isRestorationProject", v)} />
                    </Field>
                    <Field label="Going Through Insurance?">
                        <ToggleGroup options={["Yes", "No", "TBD"]} value={data.insuranceStatus} onChange={v => update("insuranceStatus", v)} />
                    </Field>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase text-sky-600">Customer</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First Name">
                        <Input value={data.customers?.[0]?.first || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { first: e.target.value })} />
                    </Field>
                    <Field label="Last Name">
                        <Input value={data.customers?.[0]?.last || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { last: e.target.value })} />
                    </Field>
                    <Field label="Phone">
                        <Input value={data.customers?.[0]?.phone || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { phone: formatPhoneNumber(e.target.value) })} placeholder="(555) 123-4567" />
                    </Field>
                    <Field label="Email">
                        <Input type="email" value={data.customers?.[0]?.email || ""} onChange={e=>updateCust(data.customers?.[0]?.id, { email: e.target.value })} placeholder="user@example.com" />
                    </Field>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                 <h3 className="mb-4 text-sm font-bold uppercase text-sky-600">Address</h3>
                 <div className="grid gap-4">
                    <div className="rounded-lg border border-sky-50 bg-sky-50/50 p-2">
                        <Field label="Find on Google" subtle className="text-sky-700">
                             <div className="flex gap-2">
                                <Input placeholder="Start typing address..." value={primaryAddr.googleQuery || ""} onChange={e=>updateAddr(primaryAddr.id,{googleQuery:e.target.value})} />
                                <button className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 transition-all" onClick={()=>updateAddr(primaryAddr.id,{street:"1 Main St",city:"Bloomingdale",state:"NJ",zip:"07403"})}>Search</button>
                             </div>
                        </Field>
                    </div>
                    <Field label="Street"><Input value={primaryAddr.street || ""} onChange={e=>updateAddr(primaryAddr.id,{street:e.target.value})} /></Field>
                    <div className="grid grid-cols-3 gap-2">
                       <div className="col-span-1"><Input placeholder="City" value={primaryAddr.city || ""} onChange={e=>updateAddr(primaryAddr.id,{city:e.target.value})} /></div>
                       <div className="col-span-1"><Select value={primaryAddr.state || ""} onChange={e=>updateAddr(primaryAddr.id,{state:e.target.value})}><option value="">State</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}</Select></div>
                       <div className="col-span-1"><Input placeholder="Zip" value={primaryAddr.zip || ""} onChange={e=>updateAddr(primaryAddr.id,{zip:e.target.value})} /></div>
                    </div>
                 </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase text-sky-600">Scheduling</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                     <button onClick={() => update('scheduleType', 'Scope')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Scope' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">📋</span><span className="font-bold text-xs">Scope</span></button>
                     <button onClick={() => update('scheduleType', 'Pickup')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Pickup' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🚚</span><span className="font-bold text-xs">Pickup</span></button>
                     <button onClick={() => update('scheduleType', 'In-Home')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'In-Home' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🏡</span><span className="font-bold text-xs">In-Home</span></button>
                     <button onClick={() => update('scheduleType', 'Meeting')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Meeting' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🗓️</span><span className="font-bold text-xs">Meeting</span></button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <Field
                      label="Date"
                      action={
                        <button
                          type="button"
                          onClick={() => onSetNowDate?.()}
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                          title="Set to today"
                        >
                          📅 Now
                        </button>
                      }
                    >
                      <DatePicker value={data.pickupDate} onChange={(v)=>update("pickupDate", v)} closeSignal={dateCloseSignal} />
                    </Field>
                    <Field
                      label="Time"
                      action={
                        <button
                          type="button"
                          onClick={() => onSetNowTime?.()}
                          className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                          title="Set to now"
                        >
                          🕒 Now
                        </button>
                      }
                    >
                      <TimePicker value={data.pickupTime} onChange={(v)=>update("pickupTime", v)} closeSignal={timeCloseSignal} />
                    </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Event Assignee">
                    <Input value={data.eventAssignee} onChange={e=>update("eventAssignee", e.target.value)} placeholder="Assignee" />
                  </Field>
                  <Field label="Vehicle">
                    <Input value={data.eventVehicle} onChange={e=>update("eventVehicle", e.target.value)} placeholder="Vehicle" />
                  </Field>
                </div>
                <Field label="Firm / Tentative">
                  <div className="flex flex-wrap gap-2">
                    <ToggleMulti
                      label="Firm"
                      checked={!!data.eventFirm}
                      onChange={() => updateMany({ eventFirm: !data.eventFirm, pickupTimeTentative: false, scheduleStatus: !data.eventFirm ? "" : data.scheduleStatus })}
                    />
                    <ToggleMulti
                      label="Tentative"
                      checked={!!data.pickupTimeTentative}
                      onChange={() => updateMany({ pickupTimeTentative: !data.pickupTimeTentative, eventFirm: false })}
                      colorClass="!bg-orange-50 !border-orange-400 !text-orange-700"
                    />
                  </div>
                </Field>
                <Field label="Scheduling Status">
                  <div className="space-y-2">
                    <div className={data.eventFirm ? "opacity-50 pointer-events-none" : ""}>
                      <ToggleGroup
                        options={["Schedule ASAP","Rep will Schedule"]}
                        value={data.scheduleStatus}
                        onChange={(v)=>updateMany({ scheduleStatus: v, eventFirm: false, pickupTimeTentative: false })}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">Use when the event is not firm and the customer has not been contacted.</div>
                  </div>
                </Field>
                <Field label="Who are we meeting?">
                  <div className="flex flex-wrap gap-2">
                    {(knownPeople && knownPeople.length > 0) ? knownPeople.map(p => (
                      <ToggleMulti key={p} label={p} checked={(data.meetingWith || []).includes(p)} onChange={() => update("meetingWith", toggleMulti(data.meetingWith || [], p))}/>
                    )) : <span className="text-sm text-slate-400 italic">Add customers or contacts first</span>}
                  </div>
                </Field>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <button onClick={handleConfirmClick} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✅ Send Confirmation</button>
                    <button onClick={onOpenReminder} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${data.reminderEnabled ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}>⏰ {data.reminderEnabled ? "Edit Reminder" : "Schedule Reminder"}</button>
                </div>
                <div className="flex items-center justify-start border-t border-slate-100 pt-3">
                  <button
                    onClick={() => { update("addCRMlog", true); onOpenCrmLog?.(); }}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  >
                    + Add CRM Log
                  </button>
                </div>
                <Field label="Event Instructions">
                  <div className="relative rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2">
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
                              eventSystemEntries.map(entry => (
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
                      placeholder="please enter instrucitons for this event"
                      className={hasEventInstructions ? "" : "border-orange-300 focus:border-orange-400 focus:ring-orange-200/40"}
                    />
                    {showQuickInstructions && (
                      <div className="absolute right-3 top-12 z-20 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
                        <div className="text-xs font-bold text-slate-500 mb-2">📝 Notes</div>
                        <div className="flex flex-wrap gap-2">
                          {quickNotes.map(n => (
                            <ToggleMulti key={n} label={n} checked={(data.quickInstructionNotes||[]).includes(n)} onChange={()=>appendQuickNote(n)} />
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
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <ToggleMulti label="Customer Contacted" checked={!!data.eventCustomerContacted} onChange={() => update("eventCustomerContacted", !data.eventCustomerContacted)} className="!text-[10px] !px-2 !py-1" />
                        <ToggleMulti label="Bill To Contacted" checked={!!data.eventBillToContacted} onChange={() => update("eventBillToContacted", !data.eventBillToContacted)} className="!text-[10px] !px-2 !py-1" />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          ref={noteInputRef}
                          value={eventNoteDraft}
                          onChange={e=>setEventNoteDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEventNote(); } }}
                          placeholder="enter scheduling notes and attempts here"
                        />
                        <button onClick={addEventNote} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600">Add</button>
                      </div>
                      {(data.eventNotes || []).length === 0 ? (
                        <div className="text-xs text-slate-400 mt-2">No scheduling notes yet.</div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {visibleEventNotes.map(n => (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickScopeFields data={data} update={update} toggleMulti={toggleMulti} />
                <LoadListFields data={data} update={update} toggleMulti={toggleMulti} />
            </div>

        </div>
    );
};

// --- MAIN APP ---

export default function App(){
  const SECTION_ORDER = ["sec1","sec2","sec3","sec4","sec5"];
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
  const normalizeSampleContacts = (rows = []) => (
    rows.map(r => {
      const defaults = inferRoleCapabilities(r.companyType || "", r.company || "");
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
        canInsure: typeof r.canInsure === "boolean" ? r.canInsure : defaults.canInsure
      };
    })
  );
  const [entryMode, setEntryMode] = useState("start"); 
  const [showInlineHelp, setShowInlineHelp] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
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
        sdsServices: normalizedSdsServices,
        suggestedGroups: mergedSelectedGroups,
        scopeBridge: withScopeBridgeSnippet({
          ...parsedScopeBridge,
          selectedGroups: mergedSelectedGroups,
        }),
      };
    } catch(e) { return DEFAULT_FORM; }
  });
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

  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", onConfirm: null });
  const [smartNotification, setSmartNotification] = useState(null);
  const [smartConfirm, setSmartConfirm] = useState(createSmartConfirmState);
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
  const [welcomeModal, setWelcomeModal] = useState({ isOpen: false, customerId: null, note: "" });
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
  const addCompanyInputRef = useRef(null);
  const [autoFlash, setAutoFlash] = useState({ key: "", ts: 0 });

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
  const [saveSummaryOpen, setSaveSummaryOpen] = useState(false);
  const [saveSummaryLines, setSaveSummaryLines] = useState([]);
  const [saveSummaryMissing, setSaveSummaryMissing] = useState([]);
  const [saveExportLines, setSaveExportLines] = useState([]);
  const appContentRef = useRef(null);
  const orderNameInputRef = useRef(null);
  const scheduleDateRef = useRef(null);
  const scheduleTimeRef = useRef(null);
  const eventNoteInputRef = useRef(null);
  const [autoScrollDone, setAutoScrollDone] = useState(false);
  const [lastLossDetailTouched, setLastLossDetailTouched] = useState(null);
  const [pendingAddressTypePromptId, setPendingAddressTypePromptId] = useState("");
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
  useEffect(()=>{ localStorage.setItem("sample-contacts", JSON.stringify(sampleContacts)); },[sampleContacts]);

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
      if (a.id !== id) return a;
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

  const toggleLossType = (type) => {
     setData(prev => {
         const current = prev.orderTypes || [];
         const isActive = current.includes(type);
         let newTypes;
         if (isActive) {
             newTypes = current.filter(t => t !== type);
         } else {
             newTypes = [...current, type];
         }
         return { ...prev, orderTypes: newTypes };
     });
     if(!data.orderTypes.includes(type)) {
         setMinimizedLossTypes(p => ({...p, [type]: false}));
     }
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
    const added = ensureAddressType(type, { placeholder: mode === "placeholder" });
    setLivingAddressPrompt({ open: false, type: "" });
    if (!added) {
      setToast(`${type} address already exists.`);
      return;
    }
    setOpenSections(prev => ({ ...prev, sec3: true }));
    setVisitedSections(prevV => new Set([...prevV, "sec3"]));
    setActiveSection("sec3");
    setTimeout(() => {
      const section = document.getElementById("sec3");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    setToast(
      mode === "placeholder"
        ? `${type} placeholder address added.`
        : `${type} address row added.`
    );
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
      else if (resolvedKey === "insurance") setInsuranceSubOpen(true);
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

  const focusSearchLabel = (label) => {
    if (!label) return;
    const normalize = (s) => (s || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
    const target = normalize(label);
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
    }
  };

  const handleSearchNavigate = (item) => {
    if (!item) return;
    if (item.id) jumpToSection(item.id, { scroll: !item.sub });
    setTimeout(() => {
      if (item.sub) {
        openSearchSubsection(item.sub, item.id);
        requestAnimationFrame(() => scrollToSubsection(item.sub, item.id));
      }
    }, 80);
    setTimeout(() => {
      if (item.label) focusSearchLabel(item.label);
    }, 220);
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

  const handleSendWelcome = (customerId) => {
    setWelcomeModal({ isOpen: true, customerId, note: "" });
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
        const hasPrimary = p.addresses.some(a => a.isPrimary);
        return {
          ...p,
          addresses: [
            ...p.addresses,
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
    setData(p => ({
      ...p,
      customers: [
        ...p.customers,
        initCustomer({
          type: "",
          policyHolder: false,
          isPrimary: false,
          placeholder: createPlaceholderFlag("customer", "Customer details needed")
        })
      ]
    }));
  }, []);

  const handleAddressTypePromptFocused = useCallback((addressId) => {
    setPendingAddressTypePromptId(prev => (prev === addressId ? "" : prev));
  }, []);

  useEffect(() => {
    const insuranceRelated = data.involvesInsurance === "Yes" && data.restorationType === "Restoration Project";
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
  }, [data.involvesInsurance, data.restorationType]);

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
    setData({ ...DEFAULT_FORM, isLead: entryMode === "quick" ? true : null });
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
    setToast("Reset complete");
  }, [entryMode]);

  const verifyAddressDemo = useCallback((id) => {
    const demoLat = "40.8874";
    const demoLng = "-74.0291";
    updateAddr(id, { lat: demoLat, lng: demoLng });
    setToast("Address verified (demo).");
  }, [updateAddr]);
  
  const removeCust = useCallback((id, index) => { 
    if(index===0) setAlertModal({ isOpen: true, message: "Cannot delete primary customer.", onConfirm: null });
    else setAlertModal({ isOpen: true, message: "Remove this customer?", onConfirm: () => setData(p=>({...p,customers:p.customers.filter(x=>x.id!==id)})) });
  }, []);
  const removeAddr = useCallback((id) => {
    if (window.confirm("Remove this address?")) {
      setData(p=>({...p,addresses:p.addresses.filter(a=>a.id!==id)}));
    }
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
    push("Project Type", data.restorationType);
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
    if(!(data.orderTypes||[]).length) missing.orderTypes=true;
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
    setSaveSummaryLines(buildSaveSummary());
    setSaveExportLines(buildFullExportLines());
    setSaveSummaryOpen(true);
  };

  const computeAuditMissing = () => {
    const missing = [];
    const primaryCustomer = (data.customers || [])[0] || {};
    const primaryAddress = (data.addresses || [])[0] || {};

    if(!data.orderName) missing.push({ id: "sec1", label: "Order Name", section: "sec1", key: "orderName" });
    if(!(data.orderTypes||[]).length) missing.push({ id: "sec1", label: "Order Type", section: "sec1", key: "orderTypes" });
    if(!data.leadSourceCategory) missing.push({ id: "sec1", label: "Lead Source", section: "sec1", key: "leadSourceCategory" });
    if(data.leadSourceCategory === "Referral") {
      if(!data.referringCompany) missing.push({ id: "sec1", label: "Referring Company", section: "sec1", key: "referringCompany" });
      if(!data.referrer) missing.push({ id: "sec1", label: "Referrer", section: "sec1", key: "referrer" });
    }
    if((data.leadSourceCategory === "Marketing" || data.leadSourceCategory === "Internal") && !data.leadSourceDetail) {
      missing.push({ id: "sec1", label: "Lead Source Detail", section: "sec1", key: "leadSourceDetail" });
    }
    if(!data.billingPayer) missing.push({ id: "sec4", label: "Bill To (Payer)", section: "sec4", key: "billingPayer" });

    if(!primaryCustomer.first) missing.push({ id: "sec2", label: "Customer First Name", section: "sec2", key: "custFirst" });
    if(!primaryCustomer.last) missing.push({ id: "sec2", label: "Customer Last Name", section: "sec2", key: "custLast" });
    if(!primaryCustomer.phone) missing.push({ id: "sec2", label: "Customer Phone", section: "sec2", key: "custPhone" });
    if(!primaryCustomer.email) missing.push({ id: "sec2", label: "Customer Email", section: "sec2", key: "custEmail" });

    (data.customers || []).forEach((customer, idx) => {
      if (!isPlaceholderFlagActive(customer?.placeholder)) return;
      const customerLabel = [customer?.first, customer?.last].filter(hasMeaningfulValue).join(" ").trim() || `Customer ${idx + 1}`;
      missing.push({
        id: "sec2",
        label: `Resolve Placeholder: ${customerLabel}`,
        section: "sec2",
        key: `placeholder-customer-${customer?.id || idx}`,
        category: "placeholders"
      });
    });

    if(!primaryAddress.street) missing.push({ id: "sec3", label: "Street Address", section: "sec3", key: "addrStreet" });
    if(!primaryAddress.city) missing.push({ id: "sec3", label: "City", section: "sec3", key: "addrCity" });
    if(!primaryAddress.state) missing.push({ id: "sec3", label: "State", section: "sec3", key: "addrState" });
    if(!primaryAddress.zip) missing.push({ id: "sec3", label: "Zip", section: "sec3", key: "addrZip" });
    if(!primaryAddress.lng) missing.push({ id: "sec3", label: "Longitude", section: "sec3", key: "addrLng" });
    if(!primaryAddress.lat) missing.push({ id: "sec3", label: "Latitude", section: "sec3", key: "addrLat" });
    if((data.orderTypes || []).includes("Mold") && !data.moldCoverageConfirm) missing.push({ id: "sec1", label: "Mold Coverage", section: "sec1", key: "moldCoverageConfirm" });
    if(data.rentOrOwn === "Rent" && !data.rentCoverageLimit) missing.push({ id: "sec3", label: "Rent Coverage", section: "sec3", key: "rentCoverageLimit" });

    const needsPickupAudit = ["Pickup Complete","Ready to Bill"].includes(data.orderStatus);
    const needsFinanceAudit = ["Intake Complete","Ready to Bill"].includes(data.orderStatus);
    if (needsPickupAudit) {
      const severityGroupsNeeded = (data.orderTypes || []).reduce((acc, t) => {
        const group = t === "Dust/Debris" ? "Dust" : t;
        if (SEVERITY_GROUPS.includes(group)) acc.add(group);
        return acc;
      }, new Set());
      severityGroupsNeeded.forEach(group => {
        const hasCode = (data.severityCodes || []).some(c => c.startsWith(group + "-"));
        if (!hasCode) missing.push({ id: "sec1", label: `${group} Severity`, section: "sec1", key: `severity-${group.toLowerCase()}` });
      });
      const interviewCompleted = !!(data.livingStatus || data.processType || data.repairsSummary || (data.packoutSummary||[]).length || data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y" || data.noLights || data.noHeat || data.boardedUp);
      if (!interviewCompleted) missing.push({ id: "sec1", label: "Interview Section", section: "sec1", key: "interview" });
      const codesCompleted = !!((data.severityCodes||[]).length || data.qualityCode || (data.handlingCodes||[]).length);
      if (!codesCompleted) missing.push({ id: "sec1", label: "Codes Section", section: "sec1", key: "codes" });
    }
    if (needsFinanceAudit) {
      if (!data.pricePlatform) missing.push({ id: "sec4", label: "Pricing Platform", section: "sec4", key: "pricePlatform" });
      if (!data.priceList) missing.push({ id: "sec4", label: "Price List", section: "sec4", key: "priceList" });
      if (!data.multiplier) missing.push({ id: "sec4", label: "Price Multiplier", section: "sec4", key: "multiplier" });
      if (!data.estimateRequested) missing.push({ id: "sec4", label: "Estimate Requested", section: "sec4", key: "estimateRequested" });
    }

    (data.addresses || []).forEach((addr, idx) => {
      if (!isAddressPlaceholder(addr)) return;
      const addressLabel = addr?.type || (idx === 0 ? "Primary Address" : `Address ${idx + 1}`);
      missing.push({
        id: "sec3",
        label: `Resolve Placeholder: ${addressLabel}`,
        section: "sec3",
        key: `placeholder-address-${addr.id}`,
        category: "placeholders"
      });
    });

    Object.entries(data.additionalCompanies || {}).forEach(([type, rawEntry]) => {
      const entry = syncCompanyEntryPlaceholders(rawEntry || {});
      const companyPending = isCompanyPlaceholder(entry);
      if (companyPending) {
        missing.push({
          id: "sec4",
          label: `Resolve Placeholder: ${type} company`,
          section: "sec4",
          key: `placeholder-company-${normalizePlaceholderKeyPart(type)}`,
          category: "placeholders"
        });
      }
      if (!companyPending && isContactPlaceholder(entry)) {
        missing.push({
          id: "sec4",
          label: `Resolve Placeholder: ${type} contact`,
          section: "sec4",
          key: `placeholder-contact-${normalizePlaceholderKeyPart(type)}`,
          category: "placeholders"
        });
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
    total += Object.values(data.additionalCompanies || {}).reduce((acc, rawEntry) => {
      const entry = syncCompanyEntryPlaceholders(rawEntry || {});
      let count = acc;
      const companyPending = isCompanyPlaceholder(entry);
      if (companyPending) count += 1;
      if (!companyPending && isContactPlaceholder(entry)) count += 1;
      return count;
    }, 0);
    return total;
  };

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
    if (["orderName","orderTypes","moldCoverageConfirm"].includes(m.key)) subsections.add("order");
      if (["insuranceClaim","insuranceCompany","insuranceAdjuster","claimNumber","dateOfLoss","nationalCarrier","directionOfPayment","contentsCoverageLimit","moldLimit"].includes(m.key)) subsections.add("insurance");
      if (["moldCoverageConfirm","orderTypes"].includes(m.key)) subsections.add("order");
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
    const hasOperationalHold =
      (bridge?.pickupOption || "") === "wait" ||
      ["tag_hold", "urgent", "cod"].includes((bridge?.processingOption || "").toString()) ||
      !!(bridge?.nextStep || "");
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
      const isAutoManaged = BRIDGE_AUTO_MANAGED_BLOCKERS.includes(normalizedIssue);
      if (isAutoManaged) return prev;
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
      const nextEnabled = !currentMilestones[milestoneId];
      return {
        ...prev,
        milestones: {
          ...currentMilestones,
          [milestoneId]: nextEnabled,
          [atId]: nextEnabled ? new Date().toISOString() : "",
        }
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
    const estimateApproved = !!milestones.estimateApproved || hasMeaningfulValue(data.estimateApprovedAt);
    const estimateRequestedBy = (data.estimateRequestedBy || "").toString().trim().toLowerCase();
    const estimateRequestedByInsurance = /\b(adjuster|insurance|carrier|public adjuster|pa|tpa)\b/.test(estimateRequestedBy);

    if (!authorizationOnFile) auto.push("Won't Sign Authorization");
    if (!!data.estimateRequested && !estimateApproved) {
      auto.push(estimateRequestedByInsurance ? "Adjuster Wants Estimate" : "Customer Wants Estimate");
    }

    return Array.from(new Set(auto));
  }, [
    scopeBridgeState.milestones,
    data.estimateRequested,
    data.estimateRequestedBy,
    data.estimateApprovedAt,
  ]);
  const autoManagedBridgeBlockerSet = useMemo(
    () => new Set(BRIDGE_AUTO_MANAGED_BLOCKERS),
    []
  );
  useEffect(() => {
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
  const selectedBridgeNextStep = useMemo(() => {
    const known = (scopeBridgeState.nextStep || "").toString();
    if (BRIDGE_NEXT_STEP_OPTIONS.some((option) => option.id === known)) return known;
    if ((scopeBridgeState.processingOption || "") === "cod") return "cod";
    if ((scopeBridgeState.processingOption || "") === "tag_hold") return "processing_hold";
    if ((scopeBridgeState.processingOption || "") === "urgent" || (scopeBridgeState.pickupOption || "") === "urgent") return "emergency_groups_only";
    if ((scopeBridgeState.pickupOption || "") === "wait") return "pickup_hold";
    return "";
  }, [scopeBridgeState.nextStep, scopeBridgeState.pickupOption, scopeBridgeState.processingOption]);
  const toggleBridgeNextStep = useCallback((optionId) => {
    patchScopeBridge((prev) => {
      const currentStep = (() => {
        const known = (prev.nextStep || "").toString();
        if (BRIDGE_NEXT_STEP_OPTIONS.some((option) => option.id === known)) return known;
        if ((prev.processingOption || "") === "cod") return "cod";
        if ((prev.processingOption || "") === "tag_hold") return "processing_hold";
        if ((prev.processingOption || "") === "urgent" || (prev.pickupOption || "") === "urgent") return "emergency_groups_only";
        if ((prev.pickupOption || "") === "wait") return "pickup_hold";
        return "";
      })();
      const isTurningOff = currentStep === optionId;
      if (isTurningOff) {
        const clearPatch = { nextStep: "" };
        if (optionId === "pickup_hold" && prev.pickupOption === "wait") clearPatch.pickupOption = "";
        if (optionId === "processing_hold" && prev.processingOption === "tag_hold") clearPatch.processingOption = "";
        if (optionId === "emergency_groups_only") {
          if (prev.pickupOption === "urgent") clearPatch.pickupOption = "";
          if (prev.processingOption === "urgent") clearPatch.processingOption = "";
        }
        if (optionId === "cod" && prev.processingOption === "cod") clearPatch.processingOption = "";
        return { ...prev, ...clearPatch };
      }
      const nextPatch = { nextStep: optionId };
      if (optionId === "pickup_hold") nextPatch.pickupOption = "wait";
      if (optionId === "processing_hold") nextPatch.processingOption = "tag_hold";
      if (optionId === "emergency_groups_only") {
        nextPatch.pickupOption = "urgent";
        nextPatch.processingOption = "urgent";
      }
      if (optionId === "cod") nextPatch.processingOption = "cod";
      return { ...prev, ...nextPatch };
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
      const companyPlaceholder = !!entry && !sourceCompany && isCompanyPlaceholder(normalizedEntry);
      const contactPlaceholder = !!entry && !sourceContact && !companyPlaceholder && isContactPlaceholder(normalizedEntry);
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
              contactPlaceholder: createPlaceholderFlag("contact", `${type} contact pending`)
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
    if (!company) return "Other";
    const c = company.toLowerCase();
    const isCarrier = NATIONAL_CARRIERS.some(n => normalizeCompany(n) === normalizeCompany(company));
    if (isCarrier) return "Insurance";
    if (c.includes("insurance")) return "Insurance";
    if (c.includes("adjusting") || c.includes("claims")) return "Public Adjusting";
    if (c.includes("moving")) return "Moving";
    if (c.includes("restoration") || c.includes("dki") || c.includes("servpro")) return "Restoration Company";
    return "Other";
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
          : (incomingEntry.contactPlaceholder || existingEntry.contactPlaceholder || createPlaceholderFlag("contact", `${targetType} contact pending`))
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
          contactPlaceholder: hasMeaningfulValue(contact) ? null : (prev.additionalCompanies?.[type]?.contactPlaceholder || createPlaceholderFlag("contact", `${type} contact pending`))
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

  useEffect(() => {
    if (data.restorationType === "Non-Restoration Project") {
      setData(prev => {
        const nextTypes = (prev.orderTypes || []).filter(t => !LOSS_TYPES.includes(t));
        return {
          ...prev,
          orderTypes: nextTypes,
          involvesInsurance: "No",
          payorQuick: prev.payorQuick === "Insurance" ? "" : prev.payorQuick,
          insuranceClaim: "No",
          insuranceCompany: "",
          insuranceAdjuster: "",
          claimNumber: "",
          dateOfLoss: "",
        };
      });
      return;
    }
    if (data.restorationType === "Restoration Project") {
      setData(prev => ({
        ...prev,
        orderTypes: (prev.orderTypes || []).filter(t => !NON_RESTORATION_TYPES.includes(t))
      }));
    }
  }, [data.restorationType]);

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
    !!data.restorationType &&
    (data.restorationType !== "Restoration Project" || !!data.involvesInsurance) &&
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
    const addRole = (id, icon, title) => {
      if (!roles.find(r => r.id === id)) roles.push({ id, icon, title });
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
    if (isReferrerContact) addRole("referrer", "🏷️", "Referrer");
    if (isInsuranceContact) addRole("insurance", "🛡️", "Insurance");
    if (isBillToContact) addRole("billto", "💳", "Bill To");
    if (isReferrerCompany) addRole("referrer", "🏷️", "Referrer");
    if (isInsuranceCompany) addRole("insurance", "🛡️", "Insurance");
    if (isBillToCompany) addRole("billto", "💳", "Bill To");
    return roles;
  };

  const getRolesForContact = (company, contact) => {
    const roles = [];
    const isReferrer = !!data.referrer && contact && data.referrer === contact;
    const isBillTo = !!data.billingContact && contact && data.billingContact === contact;
    const isInsurance = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;
    if (isReferrer) roles.push({ id: "referrer", icon: "🏷️", title: "Referrer" });
    if (isInsurance) roles.push({ id: "insurance", icon: "🛡️", title: "Insurance" });
    if (isBillTo) roles.push({ id: "billto", icon: "💳", title: "Bill To" });
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
    if (!refAssigned || isReferrer) options.push({ id: "referrer", label: "Referrer", icon: "🏷️", active: isReferrer });
    if (isInsurance || (!insuranceAssigned && insuranceEligible)) options.push({ id: "insurance", label: "Insurance", icon: "🛡️", active: isInsurance });
    if (!billAssigned || isBillTo) options.push({ id: "billto", label: "Bill To", icon: "💳", active: isBillTo });
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
      setData(prev => ({ ...prev, isLead: true }));
    }
    if (mode === "detailed") {
      setData(prev => ({ ...prev, isLead: null }));
    }
  };

  if (entryMode === 'start') return <StartScreen onSelect={handleEntryModeSelect} />;
  if (entryMode === 'same-day-scope') {
    const primaryAddr = (data.addresses || []).find(a => a.isPrimary) || (data.addresses || [])[0] || {};
    const addressLabel = [primaryAddr.street, primaryAddr.city, primaryAddr.state].filter(Boolean).join(", ");
    return (
      <SameDayScope
        onExit={() => setEntryMode('start')}
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
            title={entryMode === 'quick' ? 'Quick Entry' : 'New Order'} 
            version="v55"
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            showInlineHelp={showInlineHelp}
            setShowInlineHelp={setShowInlineHelp}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            onReset={handleReset}
            currentUser={data.currentUser}
            setCurrentUser={(v)=>update("currentUser", v)}
            setShowSampleDataModal={setShowSampleDataModal}
            onOpenPresets={() => setShowPresetModal(true)}
            presetCount={testPresets.length}
        />

        <div ref={appContentRef} className={`min-h-screen bg-slate-50 pb-32 font-sans fade-in scale-in ${compactMode ? 'compact-mode' : ''} ${entryMode === 'detailed' ? 'pt-28' : 'pt-24'}`}>
            
            <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none" />

            <div className="mx-auto max-w-6xl px-2 sm:px-4 relative"> 
              
              {entryMode === 'detailed' ? (
                <>
                  <div className={compactMode ? "space-y-3" : "space-y-4"}>
                    
                    <Section
                      id="sec1"
                      title="1. Order & Interview"
                      helpText="Enter job basics + call details (source, scope/needs, internal codes if known)."
                      isOpen={openSections.sec1}
                      onHeaderClick={()=>handleToggleSection('sec1')}
                      onCaretClick={()=>handleToggleSection('sec1')}
                      badges={
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${recordTypeLabel === "Select Type" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}>{recordTypeLabel}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{codeSummary}</span>
                        </div>
                      }
                      compact={compactMode}
                      className={auditOn && auditTargets.sections.has("sec1") ? "audit-outline" : ""}
                    >
                        <div className={`grid ${compactMode ? 'gap-3' : 'gap-5'}`}>
                            <SubSection id="sec1-order" title="Order" open={orderSubOpen} onToggle={(nextOpen) => setOrderSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("order") ? "audit-outline" : ""}>
                                <Field label={<span>Order Name <span className="font-normal text-slate-400 text-xs ml-1">(Auto-generated)</span></span>} missing={data.highlightMissing?.orderName}>
                                  <div className="flex gap-2">
                                      <Input
                                        ref={orderNameInputRef}
                                        data-audit-key="orderName"
                                        className={`${auditOn && data.highlightMissing?.orderName ? "audit-missing" : ""} ${data.orderNameLocked ? "bg-slate-100 text-slate-500" : ""}`}
                                        value={data.orderName}
                                        onChange={e=>updateMany({ orderName: e.target.value, orderNameAuto: !e.target.value.trim() })}
                                        readOnly={!!data.orderNameLocked}
                                        aria-readonly={!!data.orderNameLocked}
                                        placeholder="e.g. Name-TownST"
                                      />
                                      <button className={`rounded-lg border px-3 text-xs font-bold transition-all ${data.orderNameLocked?"bg-slate-800 text-white":"bg-white hover:bg-slate-50"}`} onClick={()=>updateMany({ orderNameLocked: !data.orderNameLocked, orderNameAuto: data.orderNameLocked ? data.orderNameAuto : false })}>{data.orderNameLocked?"LOCKED":"LOCK"}</button>
                                  </div>
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <Field label="Record Type">
                                    <ToggleGroup options={[
                                      { label: "Order", title: "Active project with confirmed billing." },
                                      { label: "Lead", title: "Potential project; incomplete information or no billing yet." }
                                    ]} value={data.isLead === true ? "Lead" : data.isLead === false ? "Order" : ""} onChange={v => update("isLead", v === "Lead")} />
                                  </Field>
                                  <Field label="Order Status">
                                    <ToggleGroup options={ORDER_STATUSES} value={data.orderStatus} onChange={v => update("orderStatus", v)} />
                                  </Field>
                                  <Field label="Project Type">
                                    <ToggleGroup options={[
                                      { label: "Restoration Project", title: "Project involving a loss event (fire, water, pests, etc.)." },
                                      { label: "Non-Restoration Project", title: "Service without a loss event (cleaning, storage, etc.)." }
                                    ]} value={data.restorationType} onChange={v => update("restorationType", v)} />
                                  </Field>
                                </div>
                                {showInlineHelp && <div className="text-[11px] text-slate-400">Auto-generated by using the LastName-TownST.</div>}
                                <Field label="Order Type" missing={data.highlightMissing.orderTypes} smart>
                                  <div className="flex flex-wrap gap-2" data-audit-key="orderTypes">
                                      {(data.restorationType === "Non-Restoration Project" ? NON_RESTORATION_TYPES : LOSS_TYPES).map(ot=> (
                                          <ToggleMulti
                                            key={ot}
                                            label={ot}
                                            title="Type of peril/damage involved."
                                            checked={(data.orderTypes||[]).includes(ot)}
                                            onChange={()=>toggleLossType(ot)}
                                            className={ot === "Water" && attentionWater ? "attention-fill" : ot === "Mold" && attentionMold ? "attention-fill" : ""}
                                          />
                                      ))}
                                  </div>
                                </Field>
                                {(attentionWater || attentionMold) && (
                                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                    {attentionWater && <div>Still Wet selected → review Water loss type and severity.</div>}
                                    {attentionMold && <div>Visible Mold selected → review Mold loss type, severity, and Mold coverage.</div>}
                                  </div>
                                )}
                                {showInlineHelp && <div className="text-[11px] text-slate-400">Type of peril/damage involved.</div>}
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
                                    const needsSeverityCode = hasSeverity && data.restorationType !== "Non-Restoration Project" && expectedSeverityGroups.has(severityGroup) && !severityCode;
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
                                                    {hasSeverity && data.restorationType !== "Non-Restoration Project" && (
                                                        <Field label="Severity" subtle>
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
                                                    {hasCauses && (<Field label={`${type} Cause`} subtle><div className="flex flex-wrap gap-2">{CAUSES[type].map(c => (<ToggleMulti key={c} label={c} checked={(details.causes || []).includes(c)} onChange={() => updateLossDetail(type, 'causes', c)} />))}</div></Field>)}
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
                            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={applyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={openCrmModal} onPromptRoleAssignment={openRoleAssignmentPrompt} />
                            </SubSection>

                            <SubSection id="sec1-interview-panel" title="Interview" open={interviewSubOpen} onToggle={(nextOpen) => setInterviewSubOpen(!!nextOpen)} compact={compactMode}>
                                <div id="sec1-interview">
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-4">
                                      <label className="text-xs font-bold text-sky-600 uppercase flex items-center gap-1">Conditions <span className="text-orange-500">⚡</span></label>
                                      <div className="flex flex-wrap gap-3">
                                          {[
                                            {
                                              id: "wet",
                                              label: "Still Wet",
                                              active: !!data.damageWasWet,
                                              onToggle: () => updateSmart("damageWasWet", data.damageWasWet ? "N" : "Y"),
                                              suggested: suggestWet
                                            },
                                            {
                                              id: "mold",
                                              label: "Visible Mold",
                                              active: !!data.damageMoldMildew,
                                              onToggle: () => updateSmart("damageMoldMildew", !data.damageMoldMildew)
                                            },
                                            {
                                              id: "structural",
                                              label: "Structural Damage",
                                              active: data.structuralElectricDamage === "Y",
                                              onToggle: () => update("structuralElectricDamage", data.structuralElectricDamage === "Y" ? "N" : "Y")
                                            },
                                            {
                                              id: "lights",
                                              label: "No Electricity",
                                              active: !!data.noLights,
                                              onToggle: () => updateSmart("noLights", !data.noLights)
                                            },
                                            {
                                              id: "heat",
                                              label: "No Heat",
                                              active: !!data.noHeat,
                                              onToggle: () => updateSmart("noHeat", !data.noHeat)
                                            },
                                            {
                                              id: "boarded",
                                              label: "Boarded Up",
                                              active: !!data.boardedUp,
                                              onToggle: () => updateSmart("boardedUp", !data.boardedUp)
                                            }
                                          ].map(item => (
                                            <button
                                              key={item.id}
                                              type="button"
                                              onClick={item.onToggle}
                                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                                                item.active
                                                  ? "border-orange-300 bg-orange-50 text-slate-800"
                                                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                                              } ${item.suggested ? "suggested-field" : ""}`}
                                            >
                                              <span className={`inline-block h-2 w-2 rounded-full ${item.active ? "bg-sky-500" : "bg-slate-300"}`} />
                                              <span>{item.label}</span>
                                              {item.suggested ? (
                                                <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold suggested-pill">
                                                  Suggested
                                                </span>
                                              ) : null}
                                            </button>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                      <div className="text-sm font-semibold text-sky-600 mb-3">Repairs Summary</div>
                                      <div className="flex flex-wrap gap-2">
                                      {["Just Cleaning", "Clean and Paint", "Cosmetic Damage", "Major Structural Damage", "Refinish Floors", "Replace Floors", "Complete Rebuild"].map(s => (
                                          <ToggleMulti key={s} label={s} checked={data.repairsSummary === s} onChange={()=>update("repairsSummary", data.repairsSummary === s ? "" : s)} />
                                        ))}
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <Field label={<span className="text-sky-600">Living Situation</span>}>
                                          <div className="flex flex-wrap gap-2">
                                            {["Staying in home", "Moving", "Hotel", "Neighbor", "Relative", "Rental", "Other Home"].map(s => (
                                              <ToggleMulti
                                                key={s}
                                                label={s}
                                                checked={data.livingStatus === s}
                                                onChange={() => updateLivingStatus(data.livingStatus === s ? "" : s)}
                                              />
                                            ))}
                                          </div>
                                        </Field>
                                      </div>
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><Field label={<span className="text-sky-600">Delivery + Storage Timeline</span>}><div className="flex flex-wrap gap-2">{["Deliver to Temp", "Deliver to Move", "Deliver to home ASAP", "Long-Term Storage"].map(s => (<ToggleMulti key={s} label={s} checked={data.processType === s} onChange={()=>update("processType", data.processType === s ? "" : s)} />))}</div></Field></div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                      <div className="text-sm font-semibold text-sky-600 mb-3">Packout Summary</div>
                                      <div className="flex flex-wrap gap-2">
                                        {["Remove Rugs", "Remove Window Treatments", "Remove Hardware", "Remove Furniture", "Remove Electronics"].map(s => (
                                          <ToggleMulti key={s} label={s} checked={(data.packoutSummary || []).includes(s)} onChange={()=>update("packoutSummary", toggleMulti(data.packoutSummary || [], s))} />
                                        ))}
                                      </div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                      <div className="text-sm font-semibold text-sky-600 mb-3">Suggested Groups</div>
                                      <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_GROUPS.map(g => {
                                          const selected = (data.suggestedGroups || []).includes(g);
                                          const link = getGroupLink(g);
                                          const linkedAddr = (data.addresses || []).find(a => a.id === link.addressId);
                                          if (!selected) {
                                            return (
                                              <ToggleMulti
                                                key={g}
                                                label={g}
                                                title={SUGGESTED_GROUP_HELP[g]}
                                                checked={false}
                                                onChange={() => {
                                                  const next = toggleMulti(data.suggestedGroups || [], g);
                                                  update("suggestedGroups", next);
                                                }}
                                              />
                                            );
                                          }

                                          return (
                                            <div
                                              key={g}
                                              className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-2 py-1"
                                              title={SUGGESTED_GROUP_HELP[g]}
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const next = toggleMulti(data.suggestedGroups || [], g);
                                                  update("suggestedGroups", next);
                                                  if (!next.includes(g)) clearGroupLink(g);
                                                }}
                                                className="rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-200"
                                              >
                                                {g}
                                              </button>
                                              <span className="h-4 w-px bg-sky-200" />
                                              <button
                                                type="button"
                                                onClick={() => openGroupLinkModal(g)}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${link?.addressId ? "border-sky-300 bg-white text-sky-700" : "border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-700"}`}
                                                title="Link group to address/date"
                                              >
                                                <span>📍</span>
                                                <span>{link?.addressId ? (linkedAddr?.type || "Address") : "Link"}</span>
                                                {link?.date ? <span>• {link.date}</span> : null}
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="text-sm font-semibold text-sky-600 mb-3">Preferences & Care</div>
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between"><Field label="Medical Issues?" /><ToggleGroup options={["Y","N"]} value={data.familyMedicalIssues || ""} onChange={v => update("familyMedicalIssues", v)} /></div>
                                      {data.familyMedicalIssues === "Y" && (
                                        <Textarea value={data.familyMedicalNote || ""} onChange={e=>update("familyMedicalNote", e.target.value)} placeholder="Details..." />
                                      )}
                                      <div className="flex items-center justify-between"><Field label="Soap Allergies?" smart /><ToggleGroup options={["Y","N"]} value={data.soapFragAllergies || ""} onChange={v => update("soapFragAllergies", v)} /></div>
                                      {data.soapFragAllergies === "Y" && (
                                        <Textarea value={data.soapFragNote || ""} onChange={e=>update("soapFragNote", e.target.value)} placeholder="Allergy details..." />
                                      )}
                                      <div className="flex items-center justify-between"><Field label="Self Cleaning?" /><ToggleGroup options={["Y","N"]} value={data.selfCleaning || ""} onChange={v => update("selfCleaning", v)} /></div>
                                      {data.selfCleaning === "Y" && (
                                        <Textarea value={data.selfCleaningNote || ""} onChange={e=>update("selfCleaningNote", e.target.value)} placeholder="What will they clean?" />
                                      )}
                                      <div className="flex items-center justify-between"><Field label="Donate Items?" /><ToggleGroup options={["Y","N"]} value={data.donateSalvation || ""} onChange={v => update("donateSalvation", v)} /></div>
                                      {data.donateSalvation === "Y" && (
                                        <Textarea value={data.donateSalvationNote || ""} onChange={e=>update("donateSalvationNote", e.target.value)} placeholder="Items to donate..." />
                                      )}
                                      <div className="flex items-center justify-between"><Field label="Use Dry Cleaner?" /><ToggleGroup options={["Yes","No","Rarely"]} value={data.useDryCleaner || ""} onChange={v => update("useDryCleaner", v)} /></div>
                                      {data.useDryCleaner === "Yes" && (
                                        <Textarea value={data.useDryCleanerNote || ""} onChange={e=>update("useDryCleanerNote", e.target.value)} placeholder="Dry cleaner notes..." />
                                      )}
                                      <div className="flex items-center justify-between"><Field label="How do you dry laundry?" smart /><ToggleGroup options={["Air-Dry","Low Heat","Dryer"]} value={data.howDryLaundry || ""} onChange={v => updateHowDry(v)} /></div>
                                      {data.howDryLaundry && data.howDryLaundry !== "Dryer" && (
                                        <div className="text-xs suggested-text">Smart handling code applied based on laundry preference.</div>
                                      )}
                                      <div className="flex items-center justify-between">
                                        <Field label="Need Storage?" />
                                      <div className={`rounded-lg p-1 ${suggestStorage ? 'suggested-field' : ''} ${highlightStorageFromProcess ? 'attention-outline' : ''}`}>
                                        <ToggleGroup options={["Y","N"]} value={data.storageNeeded || ""} onChange={v => update("storageNeeded", v)} />
                                      </div>
                                      </div>
                                      {suggestStorage && <div className="text-xs suggested-text">Suggested based on structural damage or process goal.</div>}
                                      {highlightStorageFromProcess && (
                                        <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                          Long-Term Storage selected → confirm Need Storage.
                                        </div>
                                      )}
                                      {data.storageNeeded === "Y" && (
                                        <div className="flex items-center gap-2">
                                          <Input className={`w-24 ${suggestStorageMonths ? 'suggested-field' : ''}`} value={data.storageMonths || ""} onChange={e=>update("storageMonths", e.target.value)} placeholder="#" />
                                          <span className="text-xs text-slate-500">months</span>
                                          {suggestStorageMonths && <span className="text-[10px] font-bold suggested-pill rounded-full px-2 py-0.5">Suggested</span>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Repairs Summary moved into section above */}
                                </div>
                            </SubSection>

                            <SubSection id="sec1-codes-panel" title="Codes" open={codesSubOpen} onToggle={(nextOpen) => { const next = !!nextOpen; setCodesSubOpen(next); if(next) setOpenCodes(true); }} compact={compactMode}>
                                <div id="sec1-codes">
                                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-sky-300">
                                      <button className="flex w-full justify-between bg-slate-50/50 px-4 py-3 text-left transition-colors hover:bg-slate-50" onClick={()=>setOpenCodes(!openCodes)}>
                                          <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">HANDLING CODES (Order-level)</span></div>
                                          <div className="flex items-center gap-2">{!openCodes && codeSummary !== "None" && <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 fade-in">{codeSummary}</span>}<Chevron open={openCodes} /></div>
                                      </button>
                                      {openCodes && (
                                          <div className="p-4 grid gap-6 bg-white border-t border-slate-100 fade-in">
                                            {data.restorationType !== "Non-Restoration Project" && (
                                              <div>
                                                <div className="mb-2 text-xs font-bold text-slate-400">SEVERITY</div>
                                                <div className="text-xs text-slate-500 mb-3">1 = No Rejects, 5 = Many Rejects (higher means more rejects).</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{SEVERITY_GROUPS.map(type => {
                                                  const hasGroupCode = (data.severityCodes || []).some(c => c.startsWith(`${type}-`));
                                                  const expectsGroupCode = expectedSeverityGroups.has(type);
                                                  const needsExpectedCode = expectsGroupCode && !hasGroupCode;
                                                  const needsAttention = (type === "Water" && attentionWater) || (type === "Mold" && attentionMold) || needsExpectedCode;
                                                  return (
                                                    <div key={type} data-audit-key={`severity-${type.toLowerCase()}`} className={`rounded-lg border p-2 ${needsExpectedCode ? "border-orange-300 bg-orange-50/60" : "border-slate-200"} ${needsAttention && !needsExpectedCode ? "attention-outline" : ""}`}>
                                                      <div className="mb-1.5 flex items-center justify-between">
                                                        <div className="text-xs font-bold text-slate-600">{type}</div>
                                                        {needsExpectedCode ? <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Expected</span> : null}
                                                      </div>
                                                      <div className="flex gap-1">
                                                        {SEVERITY_LEVELS.map(level => { const code = `${type}-${level}`; const isActive = (data.severityCodes || []).includes(code); return (<button key={level} onClick={() => toggleSeverity(code)} className={`flex-1 rounded py-1 text-xs font-bold transition-all ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : needsExpectedCode ? 'bg-orange-50 border border-orange-300 text-orange-700 hover:bg-orange-100' : 'bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200'} ${needsAttention && !needsExpectedCode ? "attention-outline" : ""}`}>{level}</button>); })}
                                                      </div>
                                                    </div>
                                                  );
                                                })}</div>
                                              </div>
                                            )}
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <div className={suggestQ1 ? "suggested-field rounded-lg p-2" : ""}>
                                              <div className="mb-2 text-xs font-bold text-slate-400">QUALITY</div>
                                              <div className="text-xs text-slate-500 mb-3">Q1 = Best Quality Expectation, Q5 = Worst Quality Expectation.</div>
                                              {suggestQ1 && <div className="mb-2 text-[10px] font-bold suggested-pill inline-flex rounded-full px-2 py-0.5">Suggested: Q1</div>}
                                              <div className="flex flex-wrap gap-2">{QUALITY_CODES.map(q => (<ToggleMulti key={q} label={q} checked={data.qualityCode === q} onChange={() => update("qualityCode", q)} />))}</div>
                                            </div>
                                            <div className="border-t border-slate-100 my-1"></div>
                                          <div><div className="mb-2 text-xs font-bold text-slate-400">HANDLING</div><div className="flex flex-wrap gap-2">{HANDLING_META.map(([c, d]) => <ToggleMulti key={c} label={c} title={d} className="!px-3 !py-2 !text-sm" checked={data.handlingCodes.includes(c)} onChange={() => toggleHandling(c)} />)}</div></div>
                                          </div>
                                      )}
                                  </div>
                                </div>
                            </SubSection>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec1')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec1')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec1')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                    </Section>

                    <Section id="sec2" title="2. Customer" helpText="Add the customer + any key contacts (spouse, tenant, neighbor, PM)." isOpen={openSections.sec2} onHeaderClick={()=>handleToggleSection('sec2')} onCaretClick={()=>handleToggleSection('sec2')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec2") ? "audit-outline" : ""}>
                      <div className="space-y-4">
                        {data.customers.map((c,i)=><CustomerItem key={c.id} c={c} index={i} total={data.customers.length} updateCust={updateCust} onRemove={removeCust} highlightMissing={data.highlightMissing} auditOn={auditOn} onAddHousehold={addHouseholdMember} onSendWelcome={handleSendWelcome} contacts={contacts} />)}
                        <div className="pt-2"><button onClick={addNewCustomer} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Customer</button></div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec2')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec2')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec2')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec3" title="3. Address" helpText="Enter the job site + any related locations (temp housing, hotel, alt delivery)." isOpen={openSections.sec3} onHeaderClick={()=>handleToggleSection('sec3')} onCaretClick={()=>handleToggleSection('sec3')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec3") ? "audit-outline" : ""}>
                      <div className="space-y-4">
                        {data.addresses.map((a,i)=><AddressItem key={a.id} addr={a} total={data.addresses.length} updateAddr={updateAddr} onRemove={removeAddr} index={i} highlightMissing={data.highlightMissing} auditOn={auditOn} onVerify={verifyAddressDemo} ToggleMulti={ToggleMulti} rentOrOwn={data.rentOrOwn} rentCoverageLimit={data.rentCoverageLimit} onRentOrOwnChange={(v)=>update("rentOrOwn", v)} onRentCoverageChange={(v)=>update("rentCoverageLimit", v)} forceShowCoords={i===0 ? showPrimaryCoords : false} autoOpenForTypePrompt={pendingAddressTypePromptId === a.id} autoFocusTypePrompt={pendingAddressTypePromptId === a.id} onTypePromptFocused={handleAddressTypePromptFocused} />)}
                        <div className="pt-2"><button onClick={addNewAddress} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Address</button></div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec3')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec3')} onKeyDown={(e) => handleNextSectionKeyDown(e, 'sec3')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec4" title="4. Billing & Companies" helpText="Who pays + who’s involved (billing, insurance, limits/approvals, all companies/contacts)." isOpen={openSections.sec4} onHeaderClick={()=>handleToggleSection('sec4')} onCaretClick={()=>handleToggleSection('sec4')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec4") ? "audit-outline" : ""}>
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
                              onClick={() => { setCompaniesSubOpen(true); setAddCompanyModalOpen(true); }}
                              className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-sky-600"
                            >
                              + Quick add
                            </button>
                          }
                        >
                          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-bold text-slate-700">Roles</div>
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
                            <div className="mt-1 text-[11px] text-slate-500">Click a company type to add this company type.</div>
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
                                      className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-2 ${(role.pending || isPlaceholderFlagActive(c?.placeholder)) ? 'placeholder-shell rounded-lg' : ''}`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => toggleCompanyRoleNeeded(role)}
                                        className="md:col-span-3 text-left rounded-lg py-1 focus-visible:ring-2 focus-visible:ring-sky-200"
                                        title="Toggle needed"
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
                                        title="Choose company"
                                      >
                                        {idx === 0 && (
                                          <div className="flex flex-col gap-1">
                                            <span className={`font-medium ${role.companyName ? 'text-slate-700' : 'placeholder-text'}`}>
                                              {role.companyName || "Add company"}
                                            </span>
                                            {(() => {
                                              const contactRoles = c?.name && getRolesForContact ? getRolesForContact(role.companyName, c.name) : [];
                                              const roleBadges = anyContactRoles ? [] : companyRolesFor(entryForBadges);
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
                                                      <RoleBadge icon={r.icon} title={r.title} />
                                                    </button>
                                                  ) : (
                                                    <RoleBadge key={`${role.id}-${r.title}`} icon={r.icon} title={r.title} />
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
                                        title="Choose contact"
                                      >
                                        {c?.name ? (
                                          <div className="flex flex-col">
                                            <span className={`font-medium ${isPlaceholderFlagActive(c?.placeholder) ? "placeholder-text" : "text-slate-700"}`}>{c.name}</span>
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
                                                      <RoleBadge icon={r.icon} title={r.title} />
                                                    </button>
                                                  ) : (
                                                    <RoleBadge key={`${role.id}-${c.name}-${r.title}`} icon={r.icon} title={r.title} />
                                                  )
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="placeholder-text">
                                            Add contact
                                          </span>
                                        )}
                                      </button>
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
                            <div className="grid sm:grid-cols-2 gap-4">
                              <Field label={
                                <span className="inline-flex items-center gap-2">
                                  Billing Company
                                  <span className="inline-flex items-center gap-1">
                                    {companyRolesFor({ company: data.billingCompany, contact: data.billingContact }).map(r => <RoleBadge key={`billing-${r.title}`} icon={r.icon} title={r.title} />)}
                                  </span>
                                </span>
                              }><Input className={getFlashClass("billingCompany")} value={data.billingCompany} onChange={e=>update("billingCompany", e.target.value)} placeholder="Billing company" /></Field>
                              <Field label="Billing Contact" subtle action={<span className="text-[10px] text-slate-400">Auto-fill company</span>}>
                                <SearchSelect data-audit-key="billingContact" value={data.billingContact} onChange={(v)=>handleBillingContactChange(v)} options={combinedContactOptions} listId="billing-contact-list" />
                              </Field>
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
                              </div>
                            )}
                          </div>
                        </SubSection>
                        <SubSection id="sec4-insurance" title="Insurance" open={insuranceSubOpen} onToggle={(nextOpen) => setInsuranceSubOpen(!!nextOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("insurance") ? "audit-outline" : ""}>
                          <Field label="Insurance Claim?" smart action={<ToggleGroup options={["Yes","No"]} value={data.insuranceClaim} onChange={v=>update("insuranceClaim",v)} />} />
                          <Field label="Direction of Payment"><ToggleGroup options={["Direct from Insurance","Check","Credit Card","Other"]} value={data.directionOfPayment} onChange={v=>update("directionOfPayment",v)} /></Field>
                          {data.insuranceClaim==="Yes" && (
                            <div className="animate-purple-section-fade slide-up rounded-xl bg-white p-4 grid gap-4 shadow-sm">
                              <div className="grid sm:grid-cols-[1fr_220px] gap-4 items-start">
                                <Field label={
                                  <span className="inline-flex items-center gap-2">
                                    Insurance Company
                                    <span className="inline-flex items-center gap-1">
                                      {companyRolesFor({ company: data.insuranceCompany, contact: data.insuranceAdjuster }).map(r => <RoleBadge key={`ins-${r.title}`} icon={r.icon} title={r.title} />)}
                                    </span>
                                  </span>
                                }>
                                  <div className={`flex gap-2 ${getFlashClass("insuranceCompany")}`}>
                                    <SearchSelect value={data.insuranceCompany} onChange={(v)=>update("insuranceCompany",v)} options={companies} listId="insurance-company-list" />
                                    <button className="rounded-lg bg-white px-3 font-bold text-sky-600 shadow-sm hover:bg-sky-50" onClick={()=>setModal({type:"company",value:"",onSave:(name)=>update("insuranceCompany",name)})}>+</button>
                                  </div>
                                </Field>
                                <Field label="National Carrier">
                                  <SearchSelect value={data.nationalCarrier} onChange={(v)=>update("nationalCarrier",v)} options={NATIONAL_CARRIERS} listId="national-carrier-list" placeholder="Linked" className={getFlashClass("nationalCarrier")} />
                                </Field>
                              </div>
                              <Field label="Adjuster">
                                <div className={`flex gap-2 ${getFlashClass("insuranceAdjuster")}`}>
                                  <SearchSelect data-audit-key="insuranceAdjuster" value={data.insuranceAdjuster} onChange={(v)=>handleAdjusterContactChange(v)} options={combinedContactOptions} listId="insurance-adjuster-list" />
                                  <button className="rounded-lg bg-white px-3 font-bold text-sky-600 shadow-sm hover:bg-sky-50" onClick={()=>setModal({type:"contact",value:"",onSave:(name)=>update("insuranceAdjuster",name)})}>+</button>
                                </div>
                              </Field>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Claim #"><Input value={data.claimNumber} onChange={e=>update("claimNumber",e.target.value)} /></Field>
                                <Field label="Date of Loss"><DatePicker value={data.dateOfLoss} onChange={(v)=>update("dateOfLoss", v)} /></Field>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Work Order #"><Input value={data.workOrderNumber} onChange={e=>update("workOrderNumber",e.target.value)} placeholder="Work order" /></Field>
                                <Field label="Policy #"><Input value={data.policyNumber} onChange={e=>update("policyNumber",e.target.value)} placeholder="Policy number" /></Field>
                              </div>
                              <Field label="Order Specific Email">
                                <Input value={data.insuranceOrderEmail} onChange={e=>update("insuranceOrderEmail",e.target.value)} placeholder="special-email@carrier.com" />
                              </Field>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Contents Limit ($)"><Input value={data.contentsCoverageLimit} onChange={e=>update("contentsCoverageLimit",e.target.value)} placeholder="Coverage limit" /></Field>
                                <Field label="Mold Limit ($)"><Input className={attentionMold ? "attention-fill" : ""} value={data.moldLimit} onChange={e=>update("moldLimit",e.target.value)} placeholder="Mold limit" /></Field>
                              </div>
                              {attentionMold && (
                                <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                  Visible Mold selected → confirm Mold Limit.
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

                    <Section id="sec5" title="5. Schedule" helpText="Set the next appointment. Put everything the field team needs in Event Instructions." isOpen={openSections.sec5} onHeaderClick={()=>handleToggleSection('sec5')} onCaretClick={()=>handleToggleSection('sec5')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec5") ? "audit-outline" : ""}>
                      <div className="space-y-6">
                        <SubSection id="sec5-schedule" title="Schedule" open={scheduleSubOpen} onToggle={(nextOpen) => setScheduleSubOpen(!!nextOpen)} compact={compactMode}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <button onClick={() => update('scheduleType', 'Scope')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Scope' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">📋</span><span className="font-bold text-xs">Scope Only</span></button>
                          <button onClick={() => update('scheduleType', 'Pickup')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Pickup' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🚚</span><span className="font-bold text-xs">Pickup</span></button>
                          <button onClick={() => update('scheduleType', 'In-Home')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'In-Home' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🏡</span><span className="font-bold text-xs">In-Home</span></button>
                          <button onClick={() => update('scheduleType', 'Meeting')} className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${data.scheduleType === 'Meeting' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}><span className="text-lg">🗓️</span><span className="font-bold text-xs">Meeting</span></button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Date"
                            action={
                              <button
                                type="button"
                                onClick={() => setNowDate()}
                                className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                title="Set to today"
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
                              <button
                                type="button"
                                onClick={() => setNowTime()}
                                className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                title="Set to now"
                              >
                                🕒 Now
                              </button>
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
                        <Field label="Firm / Tentative">
                          <div className="flex flex-wrap gap-2">
                            <ToggleMulti
                              label="Firm"
                              checked={!!data.eventFirm}
                              onChange={() => updateMany({ eventFirm: !data.eventFirm, pickupTimeTentative: false, scheduleStatus: !data.eventFirm ? "" : data.scheduleStatus })}
                            />
                            <ToggleMulti
                              label="Tentative"
                              checked={!!data.pickupTimeTentative}
                              onChange={() => updateMany({ pickupTimeTentative: !data.pickupTimeTentative, eventFirm: false })}
                              colorClass="!bg-orange-50 !border-orange-400 !text-orange-700"
                            />
                          </div>
                        </Field>
                        <Field label="Scheduling Status">
                          <div className="space-y-2">
                            <div className={data.eventFirm ? "opacity-50 pointer-events-none" : ""}>
                              <ToggleGroup options={["Schedule ASAP","Rep will Schedule"]} value={data.scheduleStatus} onChange={(v)=>updateMany({ scheduleStatus: v, eventFirm: false, pickupTimeTentative: false })} />
                            </div>
                            <div className="text-[11px] text-slate-400">Use when the event is not firm and the customer has not been contacted.</div>
                          </div>
                        </Field>
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
                              placeholder="please enter instrucitons for this event"
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
                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <ToggleMulti label="Customer Contacted" checked={!!data.eventCustomerContacted} onChange={() => update("eventCustomerContacted", !data.eventCustomerContacted)} className="!text-[10px] !px-2 !py-1" />
                                <ToggleMulti label="Bill To Contacted" checked={!!data.eventBillToContacted} onChange={() => update("eventBillToContacted", !data.eventBillToContacted)} className="!text-[10px] !px-2 !py-1" />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Input
                                  ref={eventNoteInputRef}
                                  value={eventNoteDraft}
                                  onChange={e=>setEventNoteDraft(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEventNote(eventNoteDraft); setEventNoteDraft(""); } }}
                                  placeholder="enter scheduling notes and attempts here"
                                />
                                <button onClick={() => { addEventNote(eventNoteDraft); setEventNoteDraft(""); }} className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600">Add</button>
                              </div>
                              {(data.eventNotes || []).length === 0 ? (
                                <div className="text-xs text-slate-400 mt-2">No scheduling notes yet.</div>
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
                        <div className="grid sm:grid-cols-2 gap-4">
                          <button onClick={handleConfirmClick} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✅ Send Confirmation</button>
                          <button onClick={openReminderModal} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${data.reminderEnabled ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}>⏰ {data.reminderEnabled ? "Edit Reminder" : "Schedule Reminder"}</button>
                        </div>
                        <div className="flex items-center justify-start border-t border-slate-100 pt-3">
                          <button
                            onClick={() => { update("addCRMlog", true); openCrmModal(); }}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                          >
                            + Add CRM Log
                          </button>
                        </div>
                        </SubSection>
                        <SubSection id="sec5-bridge" title="Scope Update and Blockers" open={scheduleBridgeOpen} onToggle={(nextOpen) => setScheduleBridgeOpen(!!nextOpen)} compact={compactMode} className={bridgeSectionClass}>
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-xs text-slate-500">
                                Shared NOE/Scope/SDS status center for approvals, blockers, and next-step decisions.
                              </div>
                              <button
                                type="button"
                                onClick={() => setEntryMode("same-day-scope")}
                                className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                                title="Open Same Day Scope"
                              >
                                Open in Scope
                              </button>
                            </div>

                            <div className={`rounded-lg border p-3 space-y-3 ${bridgeStatusClass}`}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-700">
                                  {statusBadgeLabel(scopeBridgeState.projectStatus)}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {activeBridgeIssues.length} blocker(s)
                                </span>
                                {selectedBridgeNextStep ? (
                                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {BRIDGE_NEXT_STEP_OPTIONS.find((option) => option.id === selectedBridgeNextStep)?.label || selectedBridgeNextStep}
                                  </span>
                                ) : null}
                              </div>

                              <div className="grid gap-3 lg:grid-cols-2">
                                {groupedBridgeIssues.map((group) => (
                                  <div key={group.id} className="rounded-lg border border-slate-200 bg-white p-2">
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
                                            onClick={() => {
                                              if (!isAuto) toggleScopeBridgeIssue(issue);
                                            }}
                                            disabled={isAuto}
                                            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                                              active
                                                ? "border-sky-300 bg-sky-50"
                                                : isAuto
                                                  ? "border-slate-200 bg-slate-50"
                                                  : "border-slate-200 bg-white hover:border-sky-200"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-xs font-semibold text-slate-700">--- {issue.replace("Customer Wants Estimate", "Wants Estimate").replace("Adjuster Wants Estimate", "Wants estimate")}</span>
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

                              <div className="rounded-lg border border-slate-200 bg-white p-2">
                                <div className="px-1 pb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Next Steps</div>
                                <div className="space-y-1.5">
                                  {BRIDGE_NEXT_STEP_OPTIONS.map((option) => {
                                    const active = selectedBridgeNextStep === option.id;
                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => toggleBridgeNextStep(option.id)}
                                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                                          active
                                            ? "border-sky-300 bg-sky-50"
                                            : "border-slate-200 bg-white hover:border-sky-200"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs font-semibold text-slate-700">--- {option.label}</span>
                                          <span className={`text-[10px] font-bold ${active ? "text-sky-700" : "text-slate-400"}`}>{active ? "ON" : "OFF"}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion Flags (timestamped)</div>
                              <div className="grid gap-2">
                                {BRIDGE_MILESTONE_FIELDS.map((field) => {
                                  const milestone = scopeBridgeState.milestones || {};
                                  const active = !!milestone[field.id];
                                  return (
                                    <div key={field.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-semibold text-slate-700">{field.label}</div>
                                        <Switch
                                          checked={active}
                                          onChange={() => toggleScopeBridgeMilestone(field.id, field.atId)}
                                        />
                                      </div>
                                      {active ? (
                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                                    </div>
                                  );
                                })}
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
                                        <div className="h-[4.9rem] w-full flex items-center justify-center">
                                          <img src={iconSrc} alt={item} className="h-full w-full object-contain" />
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
                                        <div className="h-[4.9rem] w-full flex items-center justify-center">
                                          <img src={iconSrc} alt={item} className="h-full w-full object-contain" />
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
                                        <div className="h-[4.9rem] w-full flex items-center justify-center">
                                          <img src={iconSrc} alt={item} className="h-full w-full object-contain" />
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
                    updateSmart={updateSmart}
                    handleConfirmClick={handleConfirmClick}
                    setToast={setToast}
                    showInlineHelp={showInlineHelp}
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
                />
              )}

            </div>
        </div>

        <FloatingCapsule 
            entryMode={entryMode} 
            setEntryMode={setEntryMode} 
            onSave={handleSaveClick} 
            onPlan={() => setPlanModalOpen(true)}
            onAudit={() => {
              setAuditOn(prev => {
                const next = !prev;
                setAuditOpen(next);
                if (next) runAudit();
                return next;
              });
            }}
            auditOn={auditOn}
            setShowSearch={setShowSearch}
        />

        {(auditOpen || auditOn) && (
          <div className="fixed right-4 top-28 z-[80] w-[170px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="text-sm font-bold text-slate-800">Audit</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (auditOn) {
                      setAuditOn(false);
                      setAuditOpen(false);
                    } else {
                      setAuditOn(true);
                      setAuditOpen(true);
                      runAudit();
                    }
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border ${auditOn ? 'audit-pill' : 'border-slate-200 text-slate-400'}`}
                >
                  {auditOn ? 'ON' : 'OFF'}
                </button>
                <button className="text-slate-400 hover:text-slate-600" onClick={() => { setAuditOn(false); setAuditOpen(false); }}>×</button>
              </div>
            </div>
            <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Critical fields + placeholders:</span>
              <span className="font-bold text-slate-600">{auditPercent}% complete</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto custom-scroll px-3 pb-3 space-y-2">
              {auditMissing.length === 0 ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">All critical fields complete.</div>
              ) : (
                auditMissing.map((item, idx) => (
                  <button
                    key={`${item.key}-${idx}`}
                    onClick={() => focusAuditItem(item)}
                    className={`w-full text-left rounded-lg px-3 py-2 border hover:border-sky-300 hover:bg-sky-50 ${(item.key || "").startsWith("placeholder-") ? "audit-placeholder-pill" : "border-slate-200"}`}
                  >
                    <div className="text-xs font-bold text-slate-700">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.category === "placeholders" ? "Placeholder Queue" : "Go to section"}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      
      {toast && <Toast message={toast} onClose={()=>setToast("")} />}
      {smartNotification && <SmartNotification message={smartNotification.message} onReject={rejectSmartAction} onClose={()=>setSmartNotification(null)} />}
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
        <div data-suggested-roles-modal="true" className="fixed inset-0 z-[131] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 pt-12 sm:pt-20">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
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
                        <span className="mr-1">{role.icon}</span>
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

      {saveSummaryOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              {saveSummaryMissing.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <div className="font-bold mb-1">Missing Audit Fields</div>
                  <ul className="list-disc pl-5">
                    {saveSummaryMissing.map((m, idx) => (
                      <li key={`${m.key}-${idx}`}>{m.label}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm font-bold text-slate-700 mb-2">Entered Fields</div>
                <div className="max-h-[320px] overflow-y-auto custom-scroll text-xs text-slate-700 space-y-1">
                  {saveSummaryLines.length === 0 ? (
                    <div className="text-slate-400">No fields entered yet.</div>
                  ) : (
                    saveSummaryLines.map((l, idx) => <div key={`${l}-${idx}`}>{l}</div>)
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => copyLines(saveSummaryLines)}
                >
                  Copy Summary
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => downloadLines(saveSummaryLines, "order-summary.txt")}
                >
                  Download Summary
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => copyLines(saveExportLines)}
                >
                  Copy All Fields
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  onClick={() => downloadLines(saveExportLines, "order-all-fields.txt")}
                >
                  Download All Fields
                </button>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setSaveSummaryOpen(false)}>Close</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => { setSaveSummaryOpen(false); validateGenerateScope(); }}
              >
                Continue Save
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

      {addCompanyModalOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-start justify-center bg-slate-900/30 backdrop-blur-sm p-4 pt-12 sm:pt-20"
            onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); setAddCompanyPanel(""); }}
          >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden fade-in"
            onClick={(e)=>e.stopPropagation()}
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
            }}
          >
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">Add Existing Companies and Contacts</div>
              </div>
              <button
                onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); setAddCompanyPanel(""); }}
                className="rounded-full border border-sky-200 px-3 py-1 text-[10px] font-bold text-white/90 hover:bg-sky-600"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                  maxResults={16}
                  menuClassName="max-h-[28rem]"
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

      {livingAddressPrompt.open && (
        <div className="fixed inset-0 z-[109] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Add {livingAddressPrompt.type} Address?</h3>
            <div className="text-sm text-slate-600 mb-4">
              No <span className="font-semibold">{livingAddressPrompt.type}</span> address exists yet.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Choose how to continue:
              <div className="mt-2 space-y-1">
                <div>• Add address now with type preselected</div>
                <div>• Use a TBD placeholder for now</div>
              </div>
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
                className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50"
              >
                Use TBD Placeholder
              </button>
              <button
                type="button"
                onClick={() => addLivingAddressFromPrompt("full")}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
              >
                Add Now
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
                        const attachments = [
                          customer.sendBrochure && "Brochure",
                          customer.sendRushGuide && "Rush Guide",
                          customer.sendAuthLink && "Authorization Form",
                          customer.sendCosLink && "COS Link",
                          customer.sendGoogleReviewLink && "Google Review Link",
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
                            <div className="text-xs text-red-500 mt-2">company specific docs available here</div>
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
                      <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setWelcomeModal({ isOpen:false, customerId:null, note:"" })}>Cancel</button>
                      {(() => {
                        const customer = (data.customers || []).find(c => c.id === welcomeModal.customerId) || {};
                        const hasMobile = (customer.phone || "").replace(/[^\d]/g, "").length >= 10;
                        return (
                          <button
                            disabled={!hasMobile}
                            className={`rounded-lg px-6 py-2 text-sm font-bold text-white shadow ${hasMobile ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"}`}
                            onClick={() => { if (!hasMobile) return; setToast("Welcome message sent!"); setWelcomeModal({ isOpen:false, customerId:null, note:"" }); }}
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
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Add CRM Log</h3>
                <div className="text-sm text-sky-100">Capture outreach and follow-up actions.</div>
              </div>
              <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={() => setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"", followUpEnabled:false, followUpDate:"", followUpTime:"", notifySalesRep:true, notifyOrderLead:true, notifyOthers:"" })}>×</button>
            </div>
            <div className="p-6 space-y-5">
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
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
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
