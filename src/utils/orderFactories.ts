// @ts-nocheck
// Factory functions for the canonical shapes used inside an order:
// addresses, customers, loss-severity scoring. Each accepts an `overrides` object
// merged over the defaults so callers can seed specific fields.

import { safeUid } from "./uid";

export function initAddress(overrides: any = {}) {
  return {
    id: safeUid(), type: "", isPrimary: true, isLossSite: true,
    name: "", googleQuery: "", street: "", apt: "", city: "", state: "", zip: "", lng: "", lat: "",
    beds: "", baths: "", sqft: "", people: "", infants: "", otherUnitsAffected: "", otherUnitsNote: "",
    coiRequired: "", coiRequestedAt: "", coiRequestedBy: "", coiProvidedAt: "", coiProvidedBy: "", coiContactNote: "",
    // Building & access — persists across orders at this address
    buildingType: "",        // trailer, house, largehouse, estate, townhouse, lowrise, highrise, storefront, commercial
    buildingWorkScope: "",   // building, unit, partial
    buildingParking: {} as Record<string, boolean>,
    buildingAccess: {} as Record<string, boolean>,
    buildingUnitNumber: "",
    buildingUnitFloor: "" as number | "",
    buildingFloors: "" as number | "",
    placeholder: null,
    ...overrides,
  };
}

export function initCustomer(overrides: any = {}) {
  return {
    id: safeUid(), type: "", selfPay: false, policyHolder: false,
    last: "", first: "",
    phone: "", phoneType: "Mobile", phoneExt: "",
    phone2: "", phone2Type: "Mobile", phone2Ext: "",
    email: "", email2: "",
    doNotContact: false,
    preferredContact: "",
    note: "", isPrimary: false,
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
    ...overrides,
  };
}

// initLossSeverity — per-peril severity scoring grid. Each peril has its own observation keys.
// `touched` flips to true after the user has reviewed it once (used to suppress nag prompts).
export function initLossSeverity(overrides: any = {}) {
  return {
    touched: false,
    fire: {
      enabled: false,
      values: {
        "Heat": 0,
        "Soot": 0,
        "Odor": 0,
        "Extinguisher Powder": 0,
        "Remediation Debris": 0,
      },
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
        "Flood Cut Debris": 0,
      },
    },
    puffback: {
      enabled: false,
      values: {
        "Oil": 0,
        "Soot": 0,
        "Odor": 0,
        "Oily Film": 0,
      },
    },
    ...overrides,
  };
}
