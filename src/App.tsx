// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';

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
    .join("\n")
    .trimEnd();

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
const CUSTOMER_TYPES=["Primary","Secondary","Husband","Wife","Father","Mother","Brother","Sister","Son","Daughter","Relative","Boyfriend","Girlfriend","Housekeeper","Neighbor","Owner","Partner","Policyholder","Assistant","Attorney","Employee","Manager","POC","Other"];
const ORDER_STATUSES=["New","Intake Complete","Pickup Complete","Tagging Complete","Ready to Bill"];
const MEETING_TYPES = ["Scope", "Pickup", "In-Home", "Meeting"];
const DEFAULT_COMPANIES=["Allstate", "State Farm", "Chubb", "Servpro of Anytown", "Metro Claims", "Pure Insurance", "DKI FastDry", "United Claims", "Croziers Moving", "Company 1", "Company 2"];
const DEFAULT_CONTACTS=["Alex Morgan", "Jamie Lee", "Pat Adjuster", "Ronzel Simmons", "Zack Barsack", "Sim Fern", "Steven Earthman", "Contact 1", "Contact 2"];
const WELCOME_CAMPAIGNS=["Brochure", "Rush Guide", "Vcard"];
const VENDOR_TYPES=["Art","Contents","Moving","Mitigation","Contractor","Consultant","Agent","Broker","Decorator","Building Management","Superintendent","Other"];
const SALES_REPS=["Dave Fenyo, Sales Rep","Jim Fenyo","Josh Cintron, Sales Rep"];
const SERVICE_OFFERINGS=["Appliance","Art","Consulting","Contents","Furniture","Hand Clean","Pack-out","Rugs","Storage Only","Textiles","TLI"];
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
  TLI: "Total Loss Inventory - listing/valuing non-restorable items."
};

// --- CONSTANTS FOR SELECTIONS ---
const LOSS_TYPES = ["Fire", "Water", "Mold", "Dust/Debris", "Puffback", "Oil"];
const NON_RESTORATION_TYPES = ["Commercial Cleaning", "Residential Cleaning", "Other"];

const CAUSES = {
  "Fire": ["Battery", "Candle", "Cooking", "Electrical", "Explosion", "Fireplace", "Flammables", "Heating", "Neighbor", "Protein", "Smoking", "Wildfire"],
  "Water": ["Roof Leak", "Window/Door Leak", "Frozen Pipes", "Pipe Burst", "Overflow", "Storm"],
  "Mold": ["Spores Only", "Visible Mold", "Moldy Odor"],
  "Dust/Debris": ["Mitigation", "Construction", "Fiberglass"],
  "Puffback": ["Oily Odor"],
  "Non-Restoration Cleaning": ["Inhome Cleaning", "Pickup", "Stain Removal", "Furniture Cleaning", "Drapery Take-down"],
  "Oil": ["Spill", "Furnace"]
};

const ORIGINS = ["Basement", "Bathroom", "Attic", "Family", "Garage", "Kitchen", "Laundry", "Living", "Master", "Outside", "Roof", "Walls", "All Over", "Ceiling"];

const PHONE_TYPES = ["Mobile", "Home", "Office"];
const ESTIMATE_TYPES = ["Ballpark", "Tag and Hold", "Itemized (costs)", "TLI", "Cash-out"];
const TECHS = ["Mike S.", "Sarah J.", "Tom B.", "Unassigned"];
const LEAD_SOURCES = ["Referral", "Marketing", "Internal"];
const CONTACT_METHODS = ["Call", "Email", "Form Submission", "Meeting", "Text", "TPA Assignment"];
const REFERRAL_SOURCES = ["Referring Co", "Referrer"];
const MARKETING_SOURCES = ["Website", "Google Business Page", "AI Recommendation", "Social Media", "Other"];
const INTERNAL_TYPES = ["Met on Site", "Previous Customer", "Friend of Company", "Neighbor", "Building Staff"];
const CUSTOMER_QUICK_NOTES = ["Elderly", "Hearing Impaired", "Spanish Only", "Do not call", "Email only", "Sales rep only"];
const NATIONAL_CARRIERS = ["Allstate", "State Farm", "Nationwide", "Farmers", "USAA", "Liberty Mutual", "Progressive", "Travelers", "Chubb", "American Family", "Pure Insurance"];
const SAMPLE_CONTACTS = [
  { name: "Alex Morgan", company: "Allstate", companyType: "Insurance", salesRep: "Josh Cintron, Sales Rep", title: "Adjuster", isAdjuster: true },
  { name: "Jamie Lee", company: "State Farm", companyType: "Insurance", salesRep: "Josh Cintron, Sales Rep", title: "Adjuster", isAdjuster: true },
  { name: "Pat Adjuster", company: "Metro Claims", companyType: "Public Adjusting", salesRep: "Dave Fenyo, Sales Rep", title: "Adjuster", isAdjuster: true },
  { name: "Ronzel Simmons", company: "Pure Insurance", companyType: "Insurance", salesRep: "Dave Fenyo, Sales Rep", title: "Adjuster", isAdjuster: true },
  { name: "Zack Barsack", company: "DKI DryFast", companyType: "Restoration Company", salesRep: "", title: "Owner", isAdjuster: false },
  { name: "Sim Fern", company: "United Claims", companyType: "Public Adjusting", salesRep: "", title: "Adjuster", isAdjuster: true },
  { name: "Steven Earthman", company: "Croziers Moving", companyType: "Moving", salesRep: "", title: "Project Manager", isAdjuster: false }
];

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

const QUICK_INSTRUCTION_NOTES = [
  "Gate code needed",
  "Call upon arrival",
  "Parking in rear",
  "Beware of pets",
  "Owner on-site",
];

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
    coiRequired:"", coiRequestedAt:"", coiRequestedBy:"", coiProvidedAt:"", coiProvidedBy:"", coiContactNote:"", ...overrides };
}

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
    ...overrides 
  }; 
}

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
  
  orderNumber:"150001", orderName:"", orderNameLocked:false,
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
const Select = ({children, ...props}) => <select {...props} className={`w-full min-h-[42px] appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 hover:border-slate-300 ${props.className||""}`}>{children}</select>;
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

const SearchSelect = ({ value, onChange, onQueryChange, options, placeholder, className, onKeyDown, onBlur, clearOnCommit, inputRef, onEmptyEnter, ...props }) => {
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
    if (!q) return normalizedOptions.slice(0, 8);
    const starts = normalizedOptions.filter(o => o.label.toLowerCase().startsWith(q) || o.value.toLowerCase().startsWith(q));
    const includes = normalizedOptions.filter(o => !starts.includes(o) && (o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)));
    return [...starts, ...includes].slice(0, 8);
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
    onChange(val);
    if (clearOnCommit) {
      setQuery("");
      onQueryChange?.("");
    } else {
      setQuery(val);
      onQueryChange?.(val);
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className||""}`}>
      <Input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onQueryChange?.(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Type to search..."}
        className="pr-10"
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
        <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
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
       return (<div key={label} title={title} onClick={() => onChange(isActive ? "" : label)} className={isActive ? `${pillBase} ${pillActive}` : `${pillBase} ${pillInactive}`}>
         {isActive && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
         {label}
       </div>)
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
        <div onClick={onChange} title={title} className={(checked ? `${pillBase} ${activeClass}` : `${pillBase} ${pillInactive}`) + " " + (className||"")}> 
            {checked && showDot && <span className="block h-1.5 w-1.5 rounded-full bg-sky-500 mr-2"></span>}
            {label}
        </div>
    );
};

const SubSection = ({ title, open, onToggle, children, compact, className, action }) => (
  <div className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-5"} shadow-sm ${className || ""}`}>
    <div className="flex items-center justify-between gap-2">
      <button onClick={onToggle} className="flex flex-1 items-center justify-between text-left">
        <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">{title}</span>
        <span className="text-slate-400 text-lg">{open ? "▾" : "›"}</span>
      </button>
      {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
    </div>
    {open && <div className={`mt-4 ${compact ? "space-y-3" : "space-y-4"} fade-in`}>{children}</div>}
  </div>
);

// --- SHARED FIELD COMPONENTS ---

const LeadInfoFields = memo(({ data, update, updateMany, companies, setModal, toggleMulti, showInlineHelp, auditOn, salesRep, setSalesRep, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, setToast, getSalesRepForContact, onOpenCrmLog }) => {
  const [referrerQuery, setReferrerQuery] = useState(data.referrer || "");
  const [repMenuOpen, setRepMenuOpen] = useState(false);
  const [showSuggestedRoles, setShowSuggestedRoles] = useState(false);
  const [suggestedSelection, setSuggestedSelection] = useState(suggestedReferrerRoles || []);
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
    const isCarrier = NATIONAL_CARRIERS.some(c => normalizeCompany(c) === normalizeCompany(parsed.company || ""));
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
    const nextSuggested = [];
    if (parsed.contact) nextSuggested.push("adjuster");
    if (isCarrier) nextSuggested.push("insurance", "billing", "national");
    if (nextSuggested.length > 0) {
      setSuggestedSelection(nextSuggested);
      setShowSuggestedRoles(true);
    }
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

      <Field label="Sales Rep" className="max-w-[140px]">
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 fade-in">
            <div className="text-base font-bold text-slate-800 mb-2">Apply Suggested Roles</div>
            <div className="text-sm text-slate-500 mb-3">Choose which roles to apply for this referrer.</div>
            <div className="grid gap-2 text-base">
              {[
                { id: "insurance", label: "Insurance Carrier" },
                { id: "billing", label: "Billing Company" },
                { id: "national", label: "National Carrier" },
                { id: "adjuster", label: "Adjuster" }
              ].map(r => (
                <label key={r.id} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={suggestedSelection.includes(r.id)}
                    onChange={(e) => {
                      setSuggestedSelection(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id));
                    }}
                  />
                  <span className="flex-1">{r.label}</span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {r.id === "adjuster" ? (data.referrer || "—") : (data.referringCompany || "—")}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSuggestedRoles(false)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700">Skip</button>
              <button onClick={() => { ensureReferrerFromQuery(); onApplyReferrerRoles?.(suggestedSelection); setShowSuggestedRoles(false); }} className="rounded-full bg-sky-500 px-3 py-1 text-xs font-bold text-white hover:bg-sky-600">Apply</button>
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
             <ToggleMulti label="Heater" checked={(data.loadList||[]).includes("Heater")} onChange={()=>update("loadList", toggleMulti(data.loadList||[], "Heater"))} className={data.noHeat ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" : ""} />
             <ToggleMulti label="Ladder" checked={(data.loadList||[]).includes("Ladder")} onChange={()=>update("loadList", toggleMulti(data.loadList||[], "Ladder"))} />
             <ToggleMulti label="Lights" checked={(data.loadList||[]).includes("Lights")} onChange={()=>update("loadList", toggleMulti(data.loadList||[], "Lights"))} className={data.noLights || data.boardedUp ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" : ""} />
             <ToggleMulti label="Tyvek" checked={(data.loadList||[]).includes("Tyvek")} onChange={()=>update("loadList", toggleMulti(data.loadList||[], "Tyvek"))} className={(data.orderTypes||[]).includes('Mold') ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" : ""} />
             <ToggleMulti label="Plastic Bags" checked={(data.loadList||[]).includes("Plastic Bags")} onChange={()=>update("loadList", toggleMulti(data.loadList||[], "Plastic Bags"))} className={data.damageWasWet === "Y" || (data.orderTypes||[]).includes('Mold') ? "animate-orange-highlight !border-orange-500 !bg-orange-50 !text-orange-700" : ""} />
         </div>
    </div>
));

// --- START SCREEN ---
const StartScreen = ({ onSelect }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 fade-in scale-in">
    <div className="text-center mb-12">
      <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">New Order Entry</h1>
      <p className="text-lg text-slate-500">Choose your entry mode</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
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
    </div>
  </div>
);

// --- SEARCH COMPONENT ---
const GlobalSearch = ({ show, onClose, onNavigate, onSearchHit }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if(show) {
      setQuery("");
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

  if (!show) return null;

  const handleClose = () => {
    setQuery("");
    onClose();
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
               onChange={e=>setQuery(e.target.value)}
               onKeyDown={e => {
                  if(e.key === 'Enter' && filtered.length > 0) {
                      const item = filtered[0];
                      if(item.action) item.action();
                      onNavigate(item);
                      handleClose();
                  }
                  if(e.key === 'Escape') handleClose();
               }}
             />
             <span className="text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50">ESC</span>
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scroll">
             {filtered.map((s, idx) => (
               <button 
                 key={idx}
                 onClick={() => { 
                     if(s.action) s.action();
                     onNavigate(s); 
                     handleClose(); 
                 }}
                 className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${idx === 0 ? 'bg-gradient-to-r from-sky-50 to-sky-50 border border-sky-100' : 'hover:bg-white/50 hover:shadow-sm'}`}
               >
                  <span className={`font-semibold ${idx === 0 ? 'text-sky-700' : 'text-slate-700'}`}>{s.label}</span>
                  {idx === 0 && <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider group-hover:text-sky-600">Hit Enter</span>}
               </button>
             ))}
             {filtered.length === 0 && <div className="text-center py-4 text-slate-500 text-sm">No results found.</div>}
          </div>
       </div>
    </div>
  );
};

// --- UNIFIED FLOATING HEADER (PROGRESS HEADER) ---
const Header = ({ activeSection, visitedSections, onJump, title, version, entryMode, setEntryMode, showInlineHelp, setShowInlineHelp, compactMode, setCompactMode, onReset, currentUser, setCurrentUser, setShowSampleDataModal }) => {
    const steps = [
        { id: 'sec1', label: 'Order' },
        { id: 'sec2', label: 'Customer' },
        { id: 'sec3', label: 'Address' },
        { id: 'sec4', label: 'Billing' },
        { id: 'sec5', label: 'Schedule' },
    ];

    const getStatus = (stepId) => {
        if (stepId === activeSection) return 'active';
        if (visitedSections.has(stepId)) return 'visited';
        return 'future';
    };

    const [showSettings, setShowSettings] = useState(false);

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
                        <div className="flex items-center w-full relative">
                             {steps.map((step, idx) => {
                                const status = getStatus(step.id);
                                const isLast = idx === steps.length - 1;
                                let circleClass = "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400";
                                if (status === 'active') circleClass = "bg-sky-500 border-sky-500 text-white shadow-md scale-110";
                                else if (status === 'visited') circleClass = "bg-white border-2 border-sky-500 text-sky-600";

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className="flex-1 flex items-center relative last:flex-none">
                                            <button onClick={() => onJump(step.id)} className="group flex flex-col items-center gap-1 focus:outline-none z-10 relative">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border ${circleClass}`}>
                                                    {status === 'visited' && status !== 'active' ? '✓' : idx + 1}
                                                </div>
                                                <span className={`absolute top-9 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${status === 'active' ? 'text-sky-700 opacity-100' : 'text-slate-400 opacity-100 block'}`}>
                                                    {step.label}
                                                </span>
                                            </button>
                                            {!isLast && (
                                                <div className="flex-1 h-[2px] bg-slate-200 mx-2 rounded relative overflow-hidden">
                                                    <div className={`absolute left-0 top-0 h-full bg-sky-500 transition-all duration-500`} style={{ width: status === 'visited' || status === 'active' ? '100%' : '0%' }}></div>
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


const Section = ({ id, title, helpText, isOpen, onToggle, children, badges, className, compact }) => (
  <div id={id} className={`mb-0 overflow-hidden rounded-none border-y border-slate-200 bg-white shadow-sm transition-shadow duration-300 scroll-mt-28 sm:mb-4 sm:rounded-xl sm:border ${isOpen ? 'ring-1 ring-sky-500/20 shadow-md' : ''} ${className||""}`}>
    <button className={`flex w-full cursor-pointer items-center justify-between px-4 py-4 sm:px-6 sm:py-5 text-left font-semibold text-slate-800 transition-colors ${compact ? "section-header-tight" : ""} ${isOpen ? "bg-white" : "bg-slate-50/50 hover:bg-slate-50"}`} onClick={onToggle}>
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-3">
          <span className={`text-lg ${isOpen ? "text-slate-900" : "text-slate-700"}`}>{title}</span>
          {badges}
        </div>
        {helpText && <div className="mt-1 text-[11px] text-slate-500">{helpText}</div>}
      </div>
      <Chevron open={isOpen} />
    </button>
    {isOpen && <div className={`border-t border-slate-100 ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} fade-in`}>{children}</div>}
  </div>
);

// --- SUB-COMPONENTS ---
const CustomerItem = memo(({ c, index, total, updateCust, onRemove, highlightMissing, auditOn, onAddHousehold, onSendWelcome, contacts }) => {
  const toggleList = (list, value) => list.includes(value) ? list.filter(v=>v!==value) : [...list, value];
  const [householdName, setHouseholdName] = useState("");
  const [open, setOpen] = useState(index === 0);
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
    <div className={`group relative rounded-lg sm:rounded-xl border bg-white p-3 sm:p-5 shadow-sm transition-all hover:border-sky-300 hover:shadow-md ${c.isPrimary ? "border-sky-400 ring-1 ring-sky-50" : "border-slate-200"}`}>
      {c.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && ( <button onClick={() => onRemove(c.id, index)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">×</button> )}
      
      <div className="mb-4 flex flex-col gap-3 pl-1 sm:pl-2 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex items-center gap-2">
            {total > 1 && (
              <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="text-slate-400 hover:text-slate-600"
                title={open ? "Collapse" : "Expand"}
              >
                <Chevron open={open} />
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">{index + 1}</div>
            <span className="text-sm font-semibold text-slate-800">{c.first && c.last ? `${c.first} ${c.last}` : "Customer"}</span>
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
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Type</label>
            <SearchSelect value={c.type || ""} onChange={(v)=>updateCust(c.id,{type:v})} options={CUSTOMER_TYPES} listId={`customer-type-${c.id}`} placeholder="Search relationship..." />
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

         <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
             <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-emerald-800">Household</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Field label="Number of Members">
                 <Input type="number" value={c.householdCount || ""} onChange={e=>updateCust(c.id,{householdCount:e.target.value})} placeholder="#" />
               </Field>
               <Field label="Animals">
                 <Input value={c.householdAnimals || ""} onChange={e=>updateCust(c.id,{householdAnimals:e.target.value})} placeholder="Pets / animals" />
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

      </div>
      )}
    </div>
  );
});

const AddressItem = memo(({ addr, total, updateAddr, onRemove, highlightMissing, index, onVerify, auditOn, rentOrOwn, rentCoverageLimit, onRentOrOwnChange, onRentCoverageChange, forceShowCoords }) => {
  const [coordsOpen, setCoordsOpen] = useState(false);
  useEffect(() => {
    if (forceShowCoords) setCoordsOpen(true);
  }, [forceShowCoords]);
  const verified = !!addr.lat && !!addr.lng;
  return (
    <div className={`group relative overflow-hidden rounded-lg sm:rounded-xl border bg-white p-3 sm:p-5 shadow-sm transition-all hover:shadow-md ${addr.isPrimary ? "border-sky-400 ring-1 ring-sky-50" : "border-slate-200"}`}>
      {addr.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg"></div>}
      {total > 1 && ( <button onClick={()=>onRemove(addr.id)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">×</button> )}
      <div className="mb-4 pl-1 sm:pl-2 flex items-center gap-2">
         <span className="text-sm font-bold text-slate-800">{addr.street || "Address"}</span>
         {addr.isPrimary && <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">Primary</span>}
         {addr.isLossSite && <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">Loss Site</span>}
      </div>
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
            <Field label="Type"><Select value={addr.type} onChange={e=>updateAddr(addr.id,{type:e.target.value})}><option value="" disabled>Select Type...</option>{["House","Apartment","Garden Apartment","Row House","Neighbor","Hotel","Temp","Work","Other"].map(t=><option key={t} value={t}>{t}</option>)}</Select></Field>
          </div>
          <div className="flex-1"><Field label="Location Status"><div className="flex gap-2"><ToggleMulti label="Primary" checked={!!addr.isPrimary} onChange={()=>updateAddr(addr.id,{isPrimary:!addr.isPrimary})} colorClass="!bg-sky-100 !border-sky-400 !text-sky-700" showDot={false} /><ToggleMulti label="Loss Site" checked={!!addr.isLossSite} onChange={()=>updateAddr(addr.id,{isLossSite:!addr.isLossSite})} colorClass="!bg-sky-50 !border-sky-300 !text-sky-700" showDot={false} /></div></Field></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Street Address"><Input data-audit-key="addrStreet" className={index===0 && auditOn && highlightMissing?.addrStreet ? "audit-missing" : ""} value={addr.street} onChange={e=>updateAddr(addr.id,{street:e.target.value})} /></Field><Field label="Apt / Unit #"><Input value={addr.apt} onChange={e=>updateAddr(addr.id,{apt:e.target.value})} /></Field></div>
        <div className="grid grid-cols-3 gap-4">
           <div className="col-span-1"><Field label="City"><Input data-audit-key="addrCity" className={index===0 && auditOn && highlightMissing?.addrCity ? "audit-missing" : ""} value={addr.city} onChange={e=>updateAddr(addr.id,{city:e.target.value})} /></Field></div>
           <div className="col-span-1"><Field label="State"><Select data-audit-key="addrState" className={index===0 && auditOn && highlightMissing?.addrState ? "audit-missing" : ""} value={addr.state} onChange={e=>updateAddr(addr.id,{state:e.target.value})}><option value="">Select</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field></div>
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
      </div>
    </div>
  );
});

// --- QUICK ENTRY COMPONENT ---
const QuickEntry = ({ data, update, updateMany, updateAddr, updateCust, companies, setModal, toggleMulti, updateSmart, handleConfirmClick, setToast, showInlineHelp, auditOn, onApplyReferrerRoles, suggestedReferrerRoles, combinedContactOptions, parseCombinedContact, getFlashClass, triggerAutoFlash, quickQuestionsCollapsed, setQuickQuestionsCollapsed, compactMode, recordTypeLabel, getSalesRepForContact, onOpenCrmLog, onOpenReminder, knownPeople, onSetNowDate, onSetNowTime, dateCloseSignal, timeCloseSignal }) => {
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

            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={onApplyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={onOpenCrmLog} />

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
                          {["Heater","Ladder","Lights","Tyvek","Plastic Bags"].map(item => (
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
  const normalizeSampleContacts = (rows = []) => (
    rows.map(r => ({
      id: r.id || safeUid(),
      name: r.name || "",
      company: r.company || "",
      companyType: r.companyType || "",
      title: r.title || "",
      salesRep: r.salesRep || "",
      isAdjuster: !!r.isAdjuster
    }))
  );
  const [entryMode, setEntryMode] = useState("start"); 
  const [showInlineHelp, setShowInlineHelp] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem("same-day-scope-v52");
      const parsed = s ? JSON.parse(s) : {};
      return { 
        ...DEFAULT_FORM, 
        ...parsed, 
        addresses: parsed.addresses?.length ? parsed.addresses : DEFAULT_FORM.addresses, 
        customers: parsed.customers?.length ? parsed.customers : DEFAULT_FORM.customers 
      };
    } catch(e) { return DEFAULT_FORM; }
  });
  const [toast, setToast] = useState("");
  const [showSearch, setShowSearch] = useState(false);
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
  const [crmModal, setCrmModal] = useState({ isOpen: false, method: "", owner: "", subject: "", orderLink: "", notes: "" });
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
    if (data.moldCoverageConfirm && data.moldLimit !== data.moldCoverageConfirm) {
      setData(prev => ({ ...prev, moldLimit: prev.moldCoverageConfirm || prev.moldLimit }));
    }
  }, [data.moldCoverageConfirm, data.moldLimit]);

  useEffect(() => {
    if (data.rentCoverageLimit && data.contentsCoverageLimit !== data.rentCoverageLimit) {
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
          ["Insurance"]: { contact, company }
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
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditOn, setAuditOn] = useState(false);
  const [auditMissing, setAuditMissing] = useState([]);
  const [auditPercent, setAuditPercent] = useState(0);
  const [saveSummaryOpen, setSaveSummaryOpen] = useState(false);
  const [saveSummaryLines, setSaveSummaryLines] = useState([]);
  const [saveSummaryMissing, setSaveSummaryMissing] = useState([]);
  const [saveExportLines, setSaveExportLines] = useState([]);
  const scheduleDateRef = useRef(null);
  const scheduleTimeRef = useRef(null);
  const eventNoteInputRef = useRef(null);
  const [autoScrollDone, setAutoScrollDone] = useState(false);
  const [lastLossDetailTouched, setLastLossDetailTouched] = useState(null);
  const [orderSubOpen, setOrderSubOpen] = useState(true);
  const [sourceSubOpen, setSourceSubOpen] = useState(false);
  const [interviewSubOpen, setInterviewSubOpen] = useState(false);
  const [codesSubOpen, setCodesSubOpen] = useState(false);

  useEffect(() => {
    if (entryMode !== "detailed") return;
    setOrderSubOpen(true);
    setSourceSubOpen(false);
    setInterviewSubOpen(false);
    setCodesSubOpen(false);
    setBillingSubOpen(false);
    setInsuranceSubOpen(false);
    setCompaniesSubOpen(false);
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

  const update = useCallback((k,v) => setData(p=>({...p,[k]:v})), []);
  const updateMany = useCallback((patch) => setData(p => ({ ...p, ...patch })), []);
  const triggerAutoFlash = useCallback((key) => {
    setAutoFlash({ key, ts: Date.now() });
    setTimeout(() => setAutoFlash({ key: "", ts: 0 }), 1400);
  }, []);
  const getFlashClass = (key) => (autoFlash.key === key ? "auto-flash" : "");
  const updateAddr = useCallback((id,patch) => setData(p => ({...p, addresses: p.addresses.map(a=>a.id===id?{...a,...patch}:a)})), []);
  const updateCust = useCallback((id,patch) => setData(p => ({...p, customers: p.customers.map(c=>c.id===id?{...c,...patch}:c)})), []);
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
  
  const scrollToSection = (key) => {
    const el = document.getElementById(key);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleToggleSection = (key) => {
    // Close sub-sections to keep scroll target consistent
    setBillingSubOpen(false);
    setInsuranceSubOpen(false);
    setCompaniesSubOpen(false);
    setFinanceSubOpen(false);
    setOpenCodes(false);
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

  const jumpToSection = (key) => {
      // Close sub-sections to keep scroll target consistent
      setBillingSubOpen(false);
      setInsuranceSubOpen(false);
      setCompaniesSubOpen(false);
      setFinanceSubOpen(false);
      setOpenCodes(false);
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
      setTimeout(() => {
          const el = document.getElementById(key);
          if(el) {
              scrollToSection(key);
              el.classList.remove('animate-purple-section-fade'); 
              void el.offsetWidth;
              el.classList.add('animate-purple-section-fade');
          }
      }, 100);
  };

  const goToNextSection = (currentKey) => {
    const idx = SECTION_ORDER.indexOf(currentKey);
    if (idx < 0 || idx === SECTION_ORDER.length - 1) return;
    const nextKey = SECTION_ORDER[idx + 1];
    setOpenSections(prev => ({ ...prev, [currentKey]: false, [nextKey]: true }));
    setVisitedSections(prevV => new Set([...prevV, nextKey]));
    setTimeout(() => {
      const el = document.getElementById(nextKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('animate-purple-section-fade');
        void el.offsetWidth;
        el.classList.add('animate-purple-section-fade');
      }
    }, 100);
  };

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

  const updateSmart = (k, v) => {
      let loadListAdded = [];
      let addHandling = [];
      let removeHandling = [];
      const isOn = v === true || v === "Y";
      const isOff = v === false || v === "N" || v === "";
      let currentLoadList = new Set(data.loadList || []);

      if (k === 'noHeat' && isOn && !currentLoadList.has('Heater')) loadListAdded.push('Heater');
      if ((k === 'noLights' && isOn) || (k === 'boardedUp' && isOn)) { if(!currentLoadList.has('Lights')) loadListAdded.push('Lights'); }
      if (k === 'damageWasWet' && isOn && !currentLoadList.has('Plastic Bags')) loadListAdded.push('Plastic Bags');
      if (k === 'damageMoldMildew' && isOn && !currentLoadList.has('Tyvek')) loadListAdded.push('Tyvek');

      if (k === "damageWasWet") {
        if (isOn) addHandling.push("Wet");
        if (isOff) removeHandling.push("Wet");
      }
      if (k === "damageMoldMildew") {
        if (isOn) addHandling.push("PPE");
        if (isOff) removeHandling.push("PPE");
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
          if (addHandling.length || removeHandling.length) {
            const handling = new Set(prev.handlingCodes || []);
            removeHandling.forEach(c => handling.delete(c));
            addHandling.forEach(c => handling.add(c));
            newData.handlingCodes = Array.from(handling);
          }
          return newData;
      });
  };

  const updateHowDry = (v) => {
      const addCodes = [];
      const removeCodes = [];
      if (v === "Air-Dry") { addCodes.push("NoDry"); removeCodes.push("Low"); }
      if (v === "Low Heat") { addCodes.push("Low"); removeCodes.push("NoDry"); }
      if (v === "Dryer") { removeCodes.push("NoDry", "Low"); }

      if (addCodes.length) {
          setSmartNotification({ message: `Smart Update: Added ${addCodes.join(", ")} handling code${addCodes.length > 1 ? "s" : ""}` });
      }

      setData(prev => {
          const current = new Set(prev.handlingCodes || []);
          removeCodes.forEach(c => current.delete(c));
          addCodes.forEach(c => current.add(c));
          return { ...prev, howDryLaundry: v, handlingCodes: Array.from(current) };
      });
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

  const openSearchSubsection = (key) => {
    if (!key) return;
    if (key === "order") setOrderSubOpen(true);
    if (key === "source") setSourceSubOpen(true);
    if (key === "interview") setInterviewSubOpen(true);
    if (key === "codes") { setCodesSubOpen(true); setOpenCodes(true); }
    if (key === "billing") setBillingSubOpen(true);
    if (key === "insurance") setInsuranceSubOpen(true);
    if (key === "companies") setCompaniesSubOpen(true);
    if (key === "finance") setFinanceSubOpen(true);
  };

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
    if (item.id) jumpToSection(item.id);
    setTimeout(() => {
      if (item.sub) openSearchSubsection(item.sub);
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
    setCrmModal({ isOpen: true, method: defaultMethod, owner, subject, orderLink: "", notes: "" });
  };
  
  const addNewAddress = useCallback(() => {
    setData(p => {
        const hasPrimary = p.addresses.some(a => a.isPrimary);
        return { ...p, addresses: [...p.addresses, initAddress({ isPrimary: !hasPrimary, isLossSite: false, type: "" })] };
    });
  }, []);
  
  const addNewCustomer = useCallback(() => {
    setData(p => ({ ...p, customers: [...p.customers, initCustomer({ type: "", policyHolder: false, isPrimary: false })] }));
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
      setBillingSubOpen(true);
      setInsuranceSubOpen(true);
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
    }, 260);
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
    return total;
  };

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
  const attentionWater = data.damageWasWet === "Y" || data.damageWasWet === true;
  const attentionMold = !!data.damageMoldMildew;
  const highlightStorageFromProcess = data.processType === "Long-Term Storage";

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
      const entry = data.additionalCompanies?.[role.type];
      const sourceCompany = role.source ? (data[role.source] || "") : "";
      const sourceContact = role.contactSource ? (data[role.contactSource] || "") : "";
      const contactsFromEntry = entry?.contacts && entry.contacts.length
        ? entry.contacts
        : (entry?.contact ? [{ name: entry.contact }] : []);
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
      const pending = !!entry && !entry.company && !sourceCompany;
      const filled = !!companyName;
      return { ...role, companyName, contactName, pending, filled, entry, contacts: mergedContacts };
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
      if (!entries[type]) entries[type] = { contact: "", company: "" };
      updated.additionalCompanies = entries;
      return updated;
    });
  };

  const updateAdditionalCompanyEntry = (type, patch) => {
    setData(prev => ({
      ...prev,
      additionalCompanies: {
        ...(prev.additionalCompanies || {}),
        [type]: { ...(prev.additionalCompanies?.[type] || { contact: "", company: "", inactive: false }), ...patch }
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
        return [...normalized, { id: safeUid(), name: contact, company, companyType: autoTypeForCompany(company), title: "", salesRep: "", isAdjuster: false }];
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
      return sameCompany || sameContact;
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
      return sameCompany || sameContact;
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
      const entry = entries[type] || { contact: "", company: companyName, contacts: [] };
      const list = entry.contacts && entry.contacts.length
        ? entry.contacts
        : (entry.contact ? [{ name: entry.contact, inactive: false }] : []);
      if (list.find(c => normalizeContact(c.name) === normalizeContact(name))) return prev;
      const next = [...list, { name, inactive: false }];
      entries[type] = { ...entry, company: companyName, contacts: next, contact: entry.contact || next[0]?.name || "" };
      return { ...prev, additionalCompanies: entries };
    });
    registerContactCompany(name, companyName);
    triggerAutoFlash(`company-${type}`);
  };

  const getSalesRepForContact = (name) => {
    const found = sampleContacts.find(c => normalizeContact(c.name) === normalizeContact(name));
    return found?.salesRep || "";
  };

  const getTitleForContact = (name) => {
    const found = sampleContacts.find(c => normalizeContact(c.name) === normalizeContact(name));
    return found?.title || "";
  };

  const addPlaceholderCompanyType = (type) => {
    if (!type) return;
    setData(prev => {
      const types = new Set(prev.additionalCompanyTypes || []);
      types.add(type);
      return {
        ...prev,
        additionalCompanyTypes: Array.from(types),
        additionalCompanies: {
          ...(prev.additionalCompanies || {}),
          [type]: prev.additionalCompanies?.[type] || { contact: "", company: "" }
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
      nextCompanies[inferredType] = {
        contact: legacyEntry.contact || existing.contact || "",
        company: legacyEntry.company || existing.company || ""
      };
      return { ...prev, additionalCompanyTypes: Array.from(nextTypes), additionalCompanies: nextCompanies };
    });
  }, [data.additionalCompanies, data.referringCompany]);

  useEffect(() => {
    const entries = data.additionalCompanies || {};
    const seen = new Map();
    let changed = false;
    const cleaned = { ...entries };
    Object.entries(entries).forEach(([type, entry]) => {
      const key = `${entry?.company ? normalizeCompany(entry.company) : ""}`;
      if (!key) return;
      if (seen.has(key)) {
        const keepType = seen.get(key);
        const keepEntry = cleaned[keepType] || {};
        const keepContacts = keepEntry.contacts && keepEntry.contacts.length
          ? keepEntry.contacts
          : (keepEntry.contact ? [{ name: keepEntry.contact, inactive: false }] : []);
        const entryContacts = entry.contacts && entry.contacts.length
          ? entry.contacts
          : (entry.contact ? [{ name: entry.contact, inactive: false }] : []);
        const merged = [...keepContacts];
        entryContacts.forEach(c => {
          if (!c?.name) return;
          if (!merged.find(x => normalizeContact(x.name) === normalizeContact(c.name))) {
            merged.push({ name: c.name, inactive: !!c.inactive });
          }
        });
        cleaned[keepType] = { ...keepEntry, ...entry, contacts: merged, contact: merged[0]?.name || keepEntry.contact || entry.contact || "" };
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
    const nextType = type || autoTypeForCompany(entry.company);
    setData(prev => {
      const types = new Set(prev.additionalCompanyTypes || []);
      const entries = { ...(prev.additionalCompanies || {}) };
      const keyContact = entry.contact ? normalizeContact(entry.contact) : "";
      const keyCompany = entry.company ? normalizeCompany(entry.company) : "";
      const existingType = Object.entries(entries).find(([t, e]) => {
        const sameContact = keyContact && e?.contact && normalizeContact(e.contact) === keyContact;
        const sameCompany = keyCompany && e?.company && normalizeCompany(e.company) === keyCompany;
        return sameContact || sameCompany;
      })?.[0];
      const targetType = existingType || nextType;
      if (existingType && existingType !== targetType) {
        delete entries[existingType];
        types.delete(existingType);
      }
      const existingEntry = entries[targetType] || {};
      const existingContacts = existingEntry.contacts && existingEntry.contacts.length
        ? existingEntry.contacts
        : (existingEntry.contact ? [{ name: existingEntry.contact, inactive: false }] : []);
      const incomingContacts = entry.contacts && entry.contacts.length
        ? entry.contacts
        : (entry.contact ? [{ name: entry.contact, inactive: false }] : []);
      const mergedContacts = [...existingContacts];
      incomingContacts.forEach(c => {
        if (!c?.name) return;
        if (!mergedContacts.find(x => normalizeContact(x.name) === normalizeContact(c.name))) {
          mergedContacts.push({ name: c.name, inactive: !!c.inactive });
        }
      });
      types.add(targetType);
      entries[targetType] = {
        ...(existingEntry || {}),
        ...entry,
        contacts: mergedContacts,
        contact: mergedContacts[0]?.name || entry.contact || existingEntry.contact || ""
      };
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
        [type]: {
          ...(prev.additionalCompanies?.[type] || { contact: "", company: "" }),
          contact,
          company: (prev.additionalCompanies?.[type]?.company || suggested || "")
        }
      }
    }));
    // roles are handled via chips; no special type handling
  };

  const handleBillingContactChange = (contact) => {
    const suggested = contactCompanyMap.get(normalizeContact(contact));
    setData(prev => ({
      ...prev,
      billingContact: contact,
      billingCompany: prev.billingCompany || suggested || ""
    }));
  };

  const handleAdjusterContactChange = (contact) => {
    const suggested = contactCompanyMap.get(normalizeContact(contact));
    setData(prev => ({
      ...prev,
      insuranceAdjuster: contact,
      adjusterCompany: prev.adjusterCompany || suggested || ""
    }));
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
    const company = entry?.company || "";
    const contacts = entry?.contacts && entry.contacts.length
      ? entry.contacts
      : (entry?.contact ? [{ name: entry.contact }] : []);
    const contactNames = contacts.map(c => c.name);
    const isReferrerContact = !!data.referrer && contactNames.includes(data.referrer);
    const isBillToContact = !!data.billingContact && contactNames.includes(data.billingContact);
    const isAdjusterContact = !!data.insuranceAdjuster && contactNames.includes(data.insuranceAdjuster);
    const isReferrerCompany = !data.referrer && !!data.referringCompany && data.referringCompany === company;
    const isBillToCompany = !data.billingContact && !!data.billingCompany && data.billingCompany === company;
    const isAdjusterCompany = !data.insuranceAdjuster && false;
    if (isReferrerCompany) roles.push({ id: "referrer", icon: "🏷️", title: "Referrer" });
    if (isBillToCompany) roles.push({ id: "billto", icon: "💳", title: "Bill To" });
    if (isAdjusterCompany) roles.push({ id: "adjuster", icon: "🧑‍💼", title: "Adjuster" });
    return roles;
  };

  const getRolesForContact = (company, contact) => {
    const roles = [];
    const isReferrer = !!data.referrer && contact && data.referrer === contact;
    const isBillTo = !!data.billingContact && contact && data.billingContact === contact;
    const isAdjuster = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;
    if (isReferrer) roles.push({ id: "referrer", icon: "🏷️", title: "Referrer" });
    if (isBillTo) roles.push({ id: "billto", icon: "💳", title: "Bill To" });
    if (isAdjuster) roles.push({ id: "adjuster", icon: "🧑‍💼", title: "Adjuster" });
    return roles;
  };

  const getRoleOptionsForContact = (company, contact) => {
    const isReferrer = !!data.referrer && contact && data.referrer === contact;
    const isBillTo = !!data.billingContact && contact && data.billingContact === contact;
    const isAdjuster = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;
    const refAssigned = !!data.referringCompany || !!data.referrer;
    const billAssigned = !!data.billingCompany || !!data.billingContact;
    const adjusterAssigned = !!data.insuranceAdjuster;
    const options = [];
    if (!refAssigned || isReferrer) options.push({ id: "referrer", label: "Referrer", icon: "🏷️", active: isReferrer });
    if (!billAssigned || isBillTo) options.push({ id: "billto", label: "Bill To", icon: "💳", active: isBillTo });
    if (!adjusterAssigned || isAdjuster) options.push({ id: "adjuster", label: "Adjuster", icon: "🧑‍💼", active: isAdjuster });
    return options;
  };

  const toggleRoleForContact = (company, contact, id) => {
    if (!company && !contact) return;
    const patch = {};
    const refActive = (!!data.referrer && contact && data.referrer === contact) || (!data.referrer && !!data.referringCompany && data.referringCompany === company);
    const billActive = (!!data.billingContact && contact && data.billingContact === contact) || (!data.billingContact && !!data.billingCompany && data.billingCompany === company);
    const adjActive = !!data.insuranceAdjuster && contact && data.insuranceAdjuster === contact;

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
    if (id === "adjuster") {
      if (adjActive) {
        patch.insuranceAdjuster = "";
      } else if (contact) {
        patch.insuranceAdjuster = contact;
        patch.insuranceClaim = "Yes";
        patch.involvesInsurance = "Yes";
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

  return (
    <React.Fragment>
        <style>{STYLES}</style>
        
        <GlobalSearch show={showSearch} onClose={()=>setShowSearch(false)} onNavigate={handleSearchNavigate} onSearchHit={handleSearchHit} />

        <Header 
            activeSection={activeSectionId} 
            visitedSections={visitedSections} 
            onJump={jumpToSection} 
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
        />

        <div className={`min-h-screen bg-slate-50 pb-32 font-sans fade-in scale-in ${compactMode ? 'compact-mode' : ''} ${entryMode === 'detailed' ? 'pt-28' : 'pt-24'}`}>
            
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
                      onToggle={()=>handleToggleSection('sec1')}
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
                            <SubSection title="Order" open={orderSubOpen} onToggle={() => setOrderSubOpen(!orderSubOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("order") ? "audit-outline" : ""}>
                                <Field label={<span>Order Name <span className="font-normal text-slate-400 text-xs ml-1">(Auto-generated)</span></span>} missing={data.highlightMissing?.orderName}>
                                  <div className="flex gap-2">
                                      <Input data-audit-key="orderName" className={auditOn && data.highlightMissing?.orderName ? "audit-missing" : ""} value={data.orderName} onChange={e=>update("orderName",e.target.value)} disabled={!!data.orderNameLocked} placeholder="e.g. Name-TownST" />
                                      <button className={`rounded-lg border px-3 text-xs font-bold transition-all ${data.orderNameLocked?"bg-slate-800 text-white":"bg-white hover:bg-slate-50"}`} onClick={()=>update("orderNameLocked",!data.orderNameLocked)}>{data.orderNameLocked?"LOCKED":"LOCK"}</button>
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
                                    const attentionForSeverity = (severityGroup === "Water" && attentionWater) || (severityGroup === "Mold" && attentionMold);
                                    return (
                                        <div key={type} className="animate-purple-section-fade rounded-xl border border-sky-100 bg-sky-50/30 overflow-hidden transition-all shadow-sm">
                                            <div className="flex items-center justify-between px-4 py-3 bg-sky-50/50 cursor-pointer hover:bg-sky-100/50 transition-colors" onClick={() => { toggleMinimizeLoss(type); if (isMinimized) setManualEditLossTypes(p => ({ ...p, [type]: true })); }}>
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
                                            </div>
                                            {!isMinimized && (
                                                <div className="p-4 grid gap-4 border-t border-sky-100 bg-white">
                                                    {hasSeverity && data.restorationType !== "Non-Restoration Project" && (
                                                        <Field label="Severity" subtle>
                                                            <div className="flex gap-2" data-audit-key={`severity-${severityGroup.toLowerCase()}`}>{SEVERITY_LEVELS.map(level => { const code = `${severityGroup}-${level}`; const isActive = (data.severityCodes || []).includes(code); return (<button key={level} onClick={() => toggleSeverity(code)} className={`h-9 w-9 rounded-lg text-sm font-bold transition-all border ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-200'} ${attentionForSeverity ? 'attention-outline' : ''}`}>{level}</button>); })}</div>
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

                            <SubSection title="Source" open={sourceSubOpen} onToggle={() => setSourceSubOpen(!sourceSubOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("source") ? "audit-outline" : ""}>
                            <LeadInfoFields data={data} update={update} updateMany={updateMany} companies={companies} setModal={setModal} toggleMulti={toggleMulti} showInlineHelp={showInlineHelp} auditOn={auditOn} salesRep={data.salesRep} setSalesRep={(v)=>update("salesRep", v)} onApplyReferrerRoles={applyReferrerRoles} suggestedReferrerRoles={suggestedReferrerRoles} combinedContactOptions={combinedContactOptions} parseCombinedContact={parseCombinedContact} getFlashClass={getFlashClass} triggerAutoFlash={triggerAutoFlash} setToast={setToast} getSalesRepForContact={getSalesRepForContact} onOpenCrmLog={openCrmModal} />
                            </SubSection>

                            <SubSection title="Interview" open={interviewSubOpen} onToggle={() => setInterviewSubOpen(!interviewSubOpen)} compact={compactMode}>
                                <div id="sec1-interview">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><Field label="Living Situation"><div className="flex flex-wrap gap-2">{["Staying in home", "Temp - Short Term", "Temp - Long Term", "Moving"].map(s => (<ToggleMulti key={s} label={s} checked={data.livingStatus === s} onChange={()=>update("livingStatus", data.livingStatus === s ? "" : s)} />))}</div></Field></div>
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><Field label="Delivery + Storage Timeline"><div className="flex flex-wrap gap-2">{["Deliver to Temp", "Deliver to Move", "Deliver to home ASAP", "Long-Term Storage"].map(s => (<ToggleMulti key={s} label={s} checked={data.processType === s} onChange={()=>update("processType", data.processType === s ? "" : s)} />))}</div></Field></div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-4">
                                      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">Conditions <span className="text-orange-500">⚡</span></label>
                                      <div className="flex flex-wrap gap-3">
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.damageWasWet ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'} ${suggestWet ? 'suggested-field' : ''}`}>
                                            <input type="checkbox" checked={data.damageWasWet} onChange={e => updateSmart('damageWasWet', e.target.checked ? 'Y' : 'N')} />
                                            <span className="text-sm">Still Wet</span>
                                            {suggestWet && <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold suggested-pill">Suggested</span>}
                                          </div>
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.damageMoldMildew ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}><input type="checkbox" checked={data.damageMoldMildew} onChange={e => updateSmart('damageMoldMildew', e.target.checked)} /><span className="text-sm">Visible Mold</span></div>
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.structuralElectricDamage === 'Y' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}><input type="checkbox" checked={data.structuralElectricDamage === 'Y'} onChange={e => update("structuralElectricDamage", e.target.checked ? 'Y' : 'N')} /><span className="text-sm">Structural Damage</span></div>
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.noLights ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}><input type="checkbox" checked={data.noLights} onChange={e => updateSmart('noLights', e.target.checked)} /><span className="text-sm">No Electricity</span></div>
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.noHeat ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}><input type="checkbox" checked={data.noHeat} onChange={e => updateSmart('noHeat', e.target.checked)} /><span className="text-sm">No Heat</span></div>
                                          <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${data.boardedUp ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}><input type="checkbox" checked={data.boardedUp} onChange={e => updateSmart('boardedUp', e.target.checked)} /><span className="text-sm">Boarded Up</span></div>
                                      </div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                      <div className="text-sm font-semibold text-sky-600 mb-3">Repairs Summary</div>
                                      <div className="flex flex-wrap gap-2">
                                      {["Just Cleaning", "Clean and Paint", "Packout Rugs", "Cosmetic Damage", "Major Structural Damage", "Refinish Floors", "Replace Floors", "Complete Rebuild"].map(s => (
                                          <ToggleMulti key={s} label={s} checked={data.repairsSummary === s} onChange={()=>update("repairsSummary", data.repairsSummary === s ? "" : s)} />
                                        ))}
                                      </div>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                                      <div className="text-sm font-semibold text-sky-600 mb-3">Packout Summary</div>
                                      <div className="flex flex-wrap gap-2">
                                        {["Remove Rugs", "Remove Window Treatments", "Remove Hardware", "Remove Furniture"].map(s => (
                                          <ToggleMulti key={s} label={s} checked={(data.packoutSummary || []).includes(s)} onChange={()=>update("packoutSummary", toggleMulti(data.packoutSummary || [], s))} />
                                        ))}
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

                            <SubSection title="Codes" open={codesSubOpen} onToggle={() => { const next = !codesSubOpen; setCodesSubOpen(next); if(next) setOpenCodes(true); }} compact={compactMode}>
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
                                                  const needsAttention = (type === "Water" && attentionWater) || (type === "Mold" && attentionMold);
                                                  return (
                                                    <div key={type} data-audit-key={`severity-${type.toLowerCase()}`} className={`rounded-lg border border-slate-200 p-2 ${needsAttention ? "attention-outline" : ""}`}>
                                                      <div className="text-xs font-bold text-slate-600 mb-1.5">{type}</div>
                                                      <div className="flex gap-1">
                                                        {SEVERITY_LEVELS.map(level => { const code = `${type}-${level}`; const isActive = (data.severityCodes || []).includes(code); return (<button key={level} onClick={() => toggleSeverity(code)} className={`flex-1 rounded py-1 text-xs font-bold transition-all ${isActive ? 'bg-sky-500 border-sky-700 text-white shadow' : 'bg-slate-100 border border-slate-300 text-slate-600 hover:bg-slate-200'} ${needsAttention ? "attention-outline" : ""}`}>{level}</button>); })}
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
                          <button onClick={() => goToNextSection('sec1')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                    </Section>

                    <Section id="sec2" title="2. Customer" helpText="Add the customer + any key contacts (spouse, tenant, neighbor, PM)." isOpen={openSections.sec2} onToggle={()=>handleToggleSection('sec2')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec2") ? "audit-outline" : ""}>
                      <div className="space-y-4">
                        {data.customers.map((c,i)=><CustomerItem key={c.id} c={c} index={i} total={data.customers.length} updateCust={updateCust} onRemove={removeCust} highlightMissing={data.highlightMissing} auditOn={auditOn} onAddHousehold={addHouseholdMember} onSendWelcome={handleSendWelcome} contacts={contacts} />)}
                        <div className="pt-2"><button onClick={addNewCustomer} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Customer</button></div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec2')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec2')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec3" title="3. Address" helpText="Enter the job site + any related locations (temp housing, hotel, alt delivery)." isOpen={openSections.sec3} onToggle={()=>handleToggleSection('sec3')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec3") ? "audit-outline" : ""}>
                      <div className="space-y-4">
                        {data.addresses.map((a,i)=><AddressItem key={a.id} addr={a} total={data.addresses.length} updateAddr={updateAddr} onRemove={removeAddr} index={i} highlightMissing={data.highlightMissing} auditOn={auditOn} onVerify={verifyAddressDemo} ToggleMulti={ToggleMulti} rentOrOwn={data.rentOrOwn} rentCoverageLimit={data.rentCoverageLimit} onRentOrOwnChange={(v)=>update("rentOrOwn", v)} onRentCoverageChange={(v)=>update("rentCoverageLimit", v)} forceShowCoords={i===0 ? showPrimaryCoords : false} />)}
                        <div className="pt-2"><button onClick={addNewAddress} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors">+ Add Another Address</button></div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec3')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec3')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec4" title="4. Billing & Companies" helpText="Who pays + who’s involved (billing, insurance, limits/approvals, all companies/contacts)." isOpen={openSections.sec4} onToggle={()=>handleToggleSection('sec4')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec4") ? "audit-outline" : ""}>
                      <div className="grid gap-6">
                        <SubSection title="Billing" open={billingSubOpen} onToggle={() => setBillingSubOpen(!billingSubOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("billing") ? "audit-outline" : ""}>
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
                                <Input value={data.billingContact} onChange={e=>handleBillingContactChange(e.target.value)} placeholder="Billing contact" />
                              </Field>
                            </div>
                          )}
                          <Field label="Billing Note"><Textarea value={data.billingNote} onChange={e=>update("billingNote",e.target.value)} /></Field>
                        </SubSection>
                        <SubSection title="Finance" open={financeSubOpen} onToggle={() => setFinanceSubOpen(!financeSubOpen)} compact={compactMode}>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <Field label="Pricing Platform">
                              <Input data-audit-key="pricePlatform" value={data.pricePlatform} onChange={e=>update("pricePlatform", e.target.value)} placeholder="Platform" />
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
                        <SubSection title="Insurance" open={insuranceSubOpen} onToggle={() => setInsuranceSubOpen(!insuranceSubOpen)} compact={compactMode} className={auditOn && auditTargets.subsections.has("insurance") ? "audit-outline" : ""}>
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
                                  <SearchSelect value={data.insuranceAdjuster} onChange={(v)=>handleAdjusterContactChange(v)} options={contacts} listId="insurance-adjuster-list" />
                                  <button className="rounded-lg bg-white px-3 font-bold text-sky-600 shadow-sm hover:bg-sky-50" onClick={()=>setModal({type:"contact",value:"",onSave:(name)=>update("insuranceAdjuster",name)})}>+</button>
                                </div>
                              </Field>
                              <div className="grid grid-cols-2 gap-4">
                                <Field label="Claim #"><Input value={data.claimNumber} onChange={e=>update("claimNumber",e.target.value)} /></Field>
                                <Field label="Date of Loss"><Input value={data.dateOfLoss} onChange={e=>update("dateOfLoss",e.target.value)} placeholder="mm/dd/yyyy" /></Field>
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
                          {[
                            { label: "Billing", value: data.billingCompany },
                            { label: "Insurance", value: data.insuranceCompany },
                            { label: "National Carrier", value: data.nationalCarrier },
                            { label: "Independent Adjusting", value: data.independentAdjustingCo },
                            { label: "Public Adjusting", value: data.publicAdjustingCompany },
                            { label: "TPA", value: data.tpaCompany }
                          ].some(i => i.value) && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <div className="text-xs font-bold text-slate-500 mb-2">Companies Involved</div>
                              <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                {[
                                  { label: "Billing", value: data.billingCompany },
                                  { label: "Insurance", value: data.insuranceCompany },
                                  { label: "National Carrier", value: data.nationalCarrier },
                                  { label: "Independent Adjusting", value: data.independentAdjustingCo },
                                  { label: "Public Adjusting", value: data.publicAdjustingCompany },
                                  { label: "TPA", value: data.tpaCompany }
                                ].filter(i => i.value).map(item => (
                                  <div key={item.label} className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 w-32">{item.label}</span>
                                    <span className="font-semibold text-slate-700">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </SubSection>

                        <SubSection
                          title="Companies & Contacts"
                          open={companiesSubOpen}
                          onToggle={() => setCompaniesSubOpen(!companiesSubOpen)}
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
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                    {pendingCompanyRoleCount} pending
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
                                    <div key={`${role.id}-${c.name || idx}`} className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-2 ${role.pending ? 'bg-emerald-50/40' : ''}`}>
                                      <button
                                        type="button"
                                        onClick={() => toggleCompanyRoleNeeded(role)}
                                        className="md:col-span-3 text-left rounded-lg py-1 focus-visible:ring-2 focus-visible:ring-sky-200"
                                        title="Toggle needed"
                                      >
                                        {idx === 0 && (
                                          <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-sky-700">{role.label}</span>
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
                                            <span className={`font-medium ${role.companyName ? 'text-slate-700' : 'text-sky-600'}`}>
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
                                            <span className="font-medium text-slate-700">{c.name}</span>
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
                                          <span className={role.companyName ? "text-sky-600" : "text-slate-300"}>
                                            {role.companyName ? "Add contact" : "—"}
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

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec4')} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">Done</button>
                          <button onClick={() => goToNextSection('sec4')} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500">Next</button>
                        </div>
                      </div>
                    </Section>

                    <Section id="sec5" title="5. Schedule" helpText="Set the next appointment. Put everything the field team needs in Event Instructions." isOpen={openSections.sec5} onToggle={()=>handleToggleSection('sec5')} compact={compactMode} className={auditOn && auditTargets.sections.has("sec5") ? "audit-outline" : ""}>
                      <div className="space-y-6">
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
                                  {["Heater","Ladder","Lights","Tyvek","Plastic Bags"].map(item => (
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
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleSection('sec5')} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">Done</button>
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
          <div className="fixed right-4 top-28 z-[80] w-[190px] rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
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
            <div className="px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Missing critical fields:</span>
              <span className="font-bold text-slate-600">{auditPercent}% complete</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto custom-scroll px-4 pb-4 space-y-2">
              {auditMissing.length === 0 ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">All critical fields complete.</div>
              ) : (
                auditMissing.map((item, idx) => (
                  <button
                    key={`${item.key}-${idx}`}
                    onClick={() => focusAuditItem(item)}
                    className="w-full text-left rounded-lg px-3 py-2 border border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                  >
                    <div className="text-xs font-bold text-slate-700">{item.label}</div>
                    <div className="text-[10px] text-slate-400">Go to section</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      
      {toast && <Toast message={toast} onClose={()=>setToast("")} />}
      {smartNotification && <SmartNotification message={smartNotification.message} onReject={rejectSmartAction} onClose={()=>setSmartNotification(null)} />}

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
            className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
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
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div className="col-span-3">Contact</div>
              <div className="col-span-3">Company</div>
              <div className="col-span-2">Company Type</div>
              <div className="col-span-2">Title</div>
              <div className="col-span-1">Rep</div>
              <div className="col-span-1">Adj</div>
            </div>
            <div className="mt-2 space-y-2">
              {sampleContacts.map((row, idx) => (
                <div key={row.id || idx} className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <Input value={row.name} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, name: e.target.value } : r))} className="!py-1.5 !text-xs" />
                  </div>
                  <div className="col-span-3">
                    <Input value={row.company} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, company: e.target.value } : r))} className="!py-1.5 !text-xs" />
                  </div>
                  <div className="col-span-2">
                    <Input value={row.companyType || ""} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, companyType: e.target.value } : r))} className="!py-1.5 !text-xs" placeholder="Type" />
                  </div>
                  <div className="col-span-2">
                    <Input value={row.title || ""} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, title: e.target.value } : r))} className="!py-1.5 !text-xs" />
                  </div>
                  <div className="col-span-1">
                    <Select value={row.salesRep || ""} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, salesRep: e.target.value } : r))} className="!py-1.5 !text-[10px]">
                      <option value="">Unassigned</option>
                      {SALES_REPS.map(rep => <option key={rep} value={rep}>{rep}</option>)}
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] text-slate-400">
                      <input type="checkbox" checked={!!row.isAdjuster} onChange={(e)=>setSampleContacts(prev => prev.map((r,i)=> i===idx ? { ...r, isAdjuster: e.target.checked } : r))} />
                    </label>
                    <button onClick={() => setSampleContacts(prev => prev.filter((_,i)=>i!==idx))} className="text-rose-600 text-xs font-bold">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => setSampleContacts(prev => [...prev, { id: safeUid(), name: "", company: "", companyType: "", title: "", salesRep: "", isAdjuster: false }])}
                className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
              >
                + Add Row
              </button>
              <div className="text-[10px] text-slate-400">Edits save automatically.</div>
            </div>
          </div>
        </div>
      )}

      {addCompanyModalOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4"
            onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); }}
          >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden fade-in"
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
              }
            }}
          >
            <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">Add Existing Companies and Contacts</div>
              </div>
              <button
                onClick={() => { setAddCompanyModalOpen(false); setShowTypePicker(false); setAddCompanyType(""); setNewCompanyDraft({ contact: "", company: "" }); setAddContactExisting({ contact: "", company: "" }); setCompanyModalCloseArmed(false); setAddCompanyQuery(""); }}
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
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      setAddCompanyModalOpen(false);
                      setShowTypePicker(false);
                      setAddCompanyType("");
                      setNewCompanyDraft({ contact: "", company: "" });
                      setAddContactExisting({ contact: "", company: "" });
                      setAddCompanyQuery("");
                    }
                  }}
                  clearOnCommit
                  inputRef={addCompanyInputRef}
                  options={combinedContactOptions}
                  placeholder="Start typing a contact or company..."
                />
              </Field>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-bold text-slate-700 mb-3">Add Contact to an Existing Company</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                    <SearchSelect
                      value={addContactExisting.company}
                      onChange={(v) => setAddContactExisting(prev => ({ ...prev, company: v }))}
                      options={existingCompanyOptions}
                      placeholder="Select company..."
                      clearOnCommit={false}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact</label>
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500 mb-2">Can't find your contact or company?</div>
                <div className="text-sm font-bold text-slate-700 mb-3">Add New Company and Contact Here</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact (optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={splitName(newCompanyDraft.contact || "").first}
                        onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, contact: [e.target.value, splitName(prev.contact || "").last].filter(Boolean).join(" ") })); }}
                        placeholder="First name"
                      />
                      <Input
                        value={splitName(newCompanyDraft.contact || "").last}
                        onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, contact: [splitName(prev.contact || "").first, e.target.value].filter(Boolean).join(" ") })); }}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                    <Input
                      value={newCompanyDraft.company}
                      onChange={(e)=>{ setCompanyModalCloseArmed(false); setNewCompanyDraft(prev => ({ ...prev, company: e.target.value })); }}
                      placeholder="Company name"
                    />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">Contacts must be added to a company.</div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const demo = newCompanyDraft.company || "New Company";
                      setNewCompanyDraft(prev => ({ ...prev, company: demo }));
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700"
                  >
                    Find on Google (demo)
                  </button>
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
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
            <div className="bg-sky-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Add CRM Log</h3>
            </div>
            <div className="p-6 space-y-4">
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
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={() => setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"" })}>Cancel</button>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600"
                onClick={() => {
                  const entry = {
                    id: safeUid(),
                    method: crmModal.method,
                    owner: crmModal.owner,
                    subject: crmModal.subject,
                    orderLink: crmModal.orderLink,
                    notes: crmModal.notes
                  };
                  setData(prev => ({ ...prev, crmLogs: [...(prev.crmLogs || []), entry] }));
                  setToast("CRM log submitted");
                  setCrmModal({ isOpen:false, method:"", owner:"", subject:"", orderLink:"", notes:"" });
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
