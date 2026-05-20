// @ts-nocheck
// SAMPLE_PRESET_DATA — factory for the seeded "Sample Water Loss - Smith" preset
// used by the Sample Data modal and any "load demo" affordance.

import { DEFAULT_FORM } from "./defaultForm";
import { initAddress, initCustomer } from "../utils/orderFactories";

export const SAMPLE_PRESET_DATA = () => ({
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
    { id: "sample-order-instruction", type: "Communication", text: "Customer asked for evening updates when possible." },
  ],
  claimNumber: "CLM-1001",
  dateOfLoss: "2026-02-14",
  serviceOfferings: ["Textiles", "Art"],
  suggestedGroups: ["RD", "TLI"],
  eventInstructions: "Bring: Heater\nConditions: Still Wet\nQuick Notes: Everything Affected",
  customers: [
    initCustomer({ isPrimary: true, firstName: "Mary", lastName: "Smith", type: "Primary", phone: "(555) 555-0101" }),
  ],
  addresses: [
    initAddress({
      isPrimary: true, street: "123 Main St", city: "Houston", state: "TX", zip: "77002", type: "Primary",
    }),
  ],
  sdsInitialInstructions: [
    { id: "inst-1", person: "Ronzel Simmons", role: "Adjuster", instruction: "Please secure all contents before pickup." },
  ],
  sdsInstructionAgreement: "agree",
  sdsDisagreementNote: "",
});
