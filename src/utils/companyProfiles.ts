// @ts-nocheck
// Company / contact profile resolution — given a company name, return its known
// shortcuts, national-carrier alias, default instructions, type inference, etc.

import { normalizeCompany, normalizeContact, mergeUniqueStrings } from "./strings";
import { mergeInstructionEntries } from "./instructions";
import { NATIONAL_CARRIERS } from "../config";

// --- Static profile data ---

// Insurance company shortcuts — typed by the customer as placeholders when the
// real carrier name isn't yet known. The blocker flag drives downstream UX.
export const INSURANCE_COMPANY_SHORTCUTS = [
  { company: "Not Yet Known",  helpText: "You will enter the company info later.", createsBlocker: true },
  { company: "Not Provided",   helpText: "You will not be able to find out.",      createsBlocker: false },
];

export const INSURANCE_COMPANY_SHORTCUT_SET = new Set(
  INSURANCE_COMPANY_SHORTCUTS.map((item) => normalizeCompany(item.company)),
);

// NATIONAL_CARRIER_LINKS — maps normalized company name → display name of the national carrier.
// Keys built at module load via normalizeCompany so callers can lookup by raw company name.
export const NATIONAL_CARRIER_LINKS: Record<string, string> = {
  [normalizeCompany("Allstate")]:               "Allstate",
  [normalizeCompany("Allstate Insurance Co.")]: "Allstate",
  [normalizeCompany("State Farm")]:             "State Farm",
  [normalizeCompany("Nationwide")]:             "Nationwide",
  [normalizeCompany("Farmers")]:                "Farmers",
  [normalizeCompany("USAA")]:                   "USAA",
  [normalizeCompany("Liberty Mutual")]:         "Liberty Mutual",
  [normalizeCompany("Progressive")]:            "Progressive",
  [normalizeCompany("Travelers")]:              "Travelers",
  [normalizeCompany("Chubb")]:                  "Chubb",
  [normalizeCompany("American Family")]:        "American Family",
  [normalizeCompany("Pure Insurance")]:         "Pure Insurance",
};

// DEFAULT_COMPANY_PROFILES — keyed by normalized company name. Merged with sample-contact
// rows + inferred fields by resolveCompanyProfile.
export const DEFAULT_COMPANY_PROFILES: Record<string, any> = {
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
    specialDocuments:  ["Contractor Connection specialty form"],
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

export const DEFAULT_CONTACT_PROFILES: Record<string, any> = {};

// --- Predicates / inference ---

export const isInsuranceShortcutCompany = (companyName = "") =>
  INSURANCE_COMPANY_SHORTCUT_SET.has(normalizeCompany(companyName || ""));

// inferCompanyTypeFromName — best-effort type from the company name when no profile match.
export const inferCompanyTypeFromName = (company = "") => {
  if (!company) return "Other";
  const c = company.toLowerCase();
  const isCarrier = NATIONAL_CARRIERS.some((n) => normalizeCompany(n) === normalizeCompany(company));
  if (isCarrier) return "Insurance";
  if (c.includes("contractor connection") || c.includes("tpa")) return "TPA";
  if (c.includes("insurance")) return "Insurance";
  if (c.includes("adjusting") || c.includes("claims")) return "Public Adjusting";
  if (c.includes("moving")) return "Moving";
  if (c.includes("restoration") || c.includes("dki") || c.includes("servpro")) return "Restoration Company";
  return "Other";
};

// --- Resolvers ---

export const resolveLinkedNationalCarrierName = (companyName = "", sampleContacts: any[] = []) => {
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

export const resolveCompanyProfile = (companyName = "", sampleContacts: any[] = []) => {
  const normalized = normalizeCompany(companyName || "");
  if (!normalized) {
    return {
      companyName: "", companyType: "", nationalCarrier: "",
      companyInstructions: [], companyPreferences: [],
      specialDocuments: [], customerTextForms: [],
      reportingPlaceholder: false,
    };
  }
  const defaults = DEFAULT_COMPANY_PROFILES[normalized] || {};
  const matchingRows = (sampleContacts || []).filter((row) => normalizeCompany(row.company || "") === normalized);
  const companyInstructions = mergeInstructionEntries(
    defaults.companyInstructions || defaults.companyPreferences || [],
    matchingRows.flatMap((row) => row.companyInstructions || row.companyPreferences || []),
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
    specialDocuments:  mergeUniqueStrings(defaults.specialDocuments  || [], matchingRows.flatMap((row) => row.specialDocuments  || [])),
    customerTextForms: mergeUniqueStrings(defaults.customerTextForms || [], matchingRows.flatMap((row) => row.customerTextForms || [])),
    reportingPlaceholder: !!defaults.reportingPlaceholder,
  };
};

export const resolveContactProfile = (contactName = "", sampleContacts: any[] = []) => {
  const normalized = normalizeContact(contactName || "");
  if (!normalized) {
    return {
      contactName: "", contactInstructions: [], contactPreferences: [],
      specialDocuments: [], customerTextForms: [],
    };
  }
  const defaults = DEFAULT_CONTACT_PROFILES[normalized] || {};
  const row = (sampleContacts || []).find((item) => normalizeContact(item.name || "") === normalized);
  const contactInstructions = mergeInstructionEntries(
    defaults.contactInstructions || defaults.contactPreferences || [],
    row?.contactInstructions || row?.contactPreferences || [],
  );
  return {
    contactName,
    contactInstructions,
    contactPreferences: contactInstructions.map((entry) => entry.text),
    specialDocuments:  mergeUniqueStrings(defaults.specialDocuments  || [], row?.specialDocuments  || []),
    customerTextForms: mergeUniqueStrings(defaults.customerTextForms || [], row?.customerTextForms || []),
  };
};

export const isInsuranceCarrierCompany = (companyName = "", sampleContacts: any[] = []) => {
  const normalized = normalizeCompany(companyName || "");
  if (!normalized) return false;
  if (isInsuranceShortcutCompany(companyName)) return true;
  if (resolveLinkedNationalCarrierName(companyName, sampleContacts)) return true;
  const profile = resolveCompanyProfile(companyName, sampleContacts);
  const type = normalizeCompany(profile.companyType || "");
  return type === "insurance" || type.includes("insurance");
};
