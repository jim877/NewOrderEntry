// @ts-nocheck
// Scope Wizard interview question definitions. Called as a factory because the
// loadList question's options come from loadTargetsFromStorage() — that reads
// localStorage at call time so it picks up live edits from the Settings panel.

import { loadTargetsFromStorage } from "../utils/loadTargets";

export type ScopeInterviewSection = {
  id: string;
  title: string;
  type: "multi" | "single" | "boolean";
  critical: boolean;
  timeline: boolean;
  options?: string[];
};

// getScopeInterviewSections — build the section list. Sections with `timeline: true` feed the Rush Guide.
export const getScopeInterviewSections = (): ScopeInterviewSection[] => [
  // --- General questions ---
  { id: "conditions",     title: "Current conditions?",                 type: "multi",   critical: true,  timeline: false, options: ["Still Wet", "Visible Mold", "Structural Damage", "No Electricity", "No Heat", "Boarded Up"] },
  { id: "packout",        title: "What type of items will we be cleaning?", type: "multi", critical: true, timeline: false, options: ["Rugs", "Window Treatments", "Clothing", "Bedding", "Furniture", "Art", "Electronics", "Hardware", "Appliances"] },
  { id: "medicalIssues",  title: "Medical issues?",                     type: "boolean", critical: true,  timeline: false },
  { id: "soapAllergies",  title: "Soap/fragrance allergies?",           type: "boolean", critical: true,  timeline: false },
  { id: "dryLaundry",     title: "How do they dry laundry?",            type: "single",  critical: true,  timeline: false, options: ["Air-Dry", "Low Heat", "Dryer"] },
  { id: "selfCleaning",   title: "Self-clean anything?",                type: "boolean", critical: false, timeline: false },
  { id: "useDryCleaner",  title: "Use a dry cleaner?",                  type: "single",  critical: false, timeline: false, options: ["Yes", "No", "Rarely"] },
  { id: "considerations", title: "Special considerations",              type: "multi",   critical: false, timeline: false, options: ["Elderly", "Pregnancy", "Baby", "Hearing Impaired", "Spanish Only", "Respiratory", "Skin Sensitivity", "Premium Brands"] },
  { id: "petsInHome",     title: "Pets in home?",                       type: "multi",   critical: false, timeline: false, options: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Other"] },
  { id: "loadList",       title: "What do we need to bring?",           type: "multi",   critical: false, timeline: false, options: loadTargetsFromStorage().map((t) => t.label) },
  // --- Timeline / Rush Guide questions (timeline: true) ---
  { id: "suggestedGroups",   title: "Suggested groups",                       type: "multi",   critical: false, timeline: true, options: ["RD", "RFD", "STD", "STFD", "LTD", "LTFD", "Inhome", "TLI", "Test", "Dispose", "Storage Only"] },
  { id: "repairs",           title: "What repairs are being done?",           type: "multi",   critical: true,  timeline: true, options: ["Cleaning Exposed", "Cleaning Everywhere", "Clean & Paint", "Plaster/Wall Repairs", "Refinish Floors", "Replace Floors", "Cosmetic (Cabinets/Tile)", "Major Structural/Electrical", "Gut/Rebuild"] },
  { id: "packoutScope",      title: "Has packout been discussed?",            type: "single",  critical: true,  timeline: true, options: ["No Packout", "Content Manipulation", "Partial Packout", "Full Packout"] },
  { id: "living",            title: "Where will customer live during repairs?", type: "multi", critical: true,  timeline: true, options: ["Their Home", "Hotel", "Temp", "Moving", "Neighbor", "Relative", "Rental", "Other Home"] },
  { id: "delivery",          title: "Where should we make final delivery?",   type: "single",  critical: true,  timeline: true, options: ["Primary", "Hotel", "Temporary", "Business", "New Home", "TBD"] },
  { id: "finalDeliveryDate", title: "Expected final delivery?",               type: "single",  critical: true,  timeline: true, options: ["Firm Date", "Must Be Before", "Deliver When Ready"] },
  { id: "needStorage",       title: "Need storage?",                          type: "boolean", critical: true,  timeline: true },
  { id: "interests",         title: "Activities & interests",                 type: "multi",   critical: false, timeline: true, options: ["School & Kids Sports", "Summer & Swim", "Winter & Snow", "Halloween", "Thanksgiving", "Christmas / Hanukkah", "Easter / Passover", "Religious Services", "Graduation", "Gym & Fitness", "Work from Home"] },
  { id: "upcomingEvents",    title: "Upcoming trips & events",                type: "multi",   critical: false, timeline: true, options: ["Warm Weather Vacation", "Cold Weather Trip", "Wedding / Formal Event", "Business Trip", "Sports Tournament"] },
];
