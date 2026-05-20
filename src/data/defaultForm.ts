// @ts-nocheck
// DEFAULT_FORM — the canonical empty-order shape that App initializes its `data` state from
// and that every reset/preset merges over. Composed from the order factories + scope bridge.

import { initAddress, initCustomer, initLossSeverity } from "../utils/orderFactories";
import { createScopeBridgeState } from "../scopeBridgeUtils";

export const DEFAULT_FORM = {
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

  orderNumber: "150001", orderName: "", orderNameLocked: false, orderNameAuto: true,
  referringCompany: "", referrer: "",

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

  addresses: [initAddress({ type: "Primary" })],
  customers: [initCustomer({ isPrimary: true, type: "" })],
  peopleQuick: [],
  addCRMlog: false,

  billingPayer: "", billingMethod: "", billingNote: "", directionOfPayment: "",
  billingCompany: "", billingContact: "",
  pricePlatform: "", priceList: "", multiplier: "",
  estimateNeeded: "", estimateRecipients: [], estimateType: "",
  estimateRequestedBy: "",
  pickupBeforeApproval: "", pickupBeforeApprovalNote: "", scopeApproved: "", estimateAmount: "", estimateApprovedAt: "",
  orderInstructions: [],

  insuranceClaim: "", insuranceCompany: "", insuranceAdjuster: "", adjusterCompany: "",
  nationalCarrier: "", nationalCarrierRequested: false,
  claimNumber: "", dateOfLoss: "", workOrderNumber: "", policyNumber: "",
  insuranceOrderEmail: "", rentOrOwn: "",
  contentsCoverageLimit: "", moldLimit: "", rentCoverageLimit: "",
  publicAdjustingCompany: "", publicAdjuster: "", independentAdjustingCo: "",
  independentAdjuster: "", tpaCompany: "", tpaContact: "",
  salesRep: "",

  serviceOfferings: [],
  serviceSubCategories: [],
  groupAddressLinks: {},
  lossSeverity: initLossSeverity(),
  interviewLog: {},
  upcomingEvents: [],
  rushInterests: [],
  vendors: [],
  vendorDetails: {},
  showReferralVendor: true,

  additionalCompanyTypes: [],
  additionalCompanies: {},
  crmLogs: [],
  planSteps: [],
  currentUser: "",

  handlingCodes: [],
  qualityCode: "",
  severityCodes: [],
  preferenceNote: "",

  structuralElectricDamage: "", willPaint: "", willSandWoodFloors: "", willRemoveWindowTreatments: "", willPackOutFurniture: "",
  everyoneOk: "", everyoneOkNote: "", familyMedicalIssues: "", familyMedicalNote: "", soapFragAllergies: "", soapFragNote: "",
  useDryCleaner: "", useDryCleanerNote: "", selfCleaning: "", selfCleaningNote: "", donateSalvation: "", donateSalvationNote: "",
  howDryLaundry: "", howDryNote: "",
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
  rushDeliveryNeeded: "",
  timelineWorkTypes: [],
  eventAssignee: "",
  eventAttendee: "",
  eventVehicle: "",
  quickInstructionNotes: [],

  // Property description
  propertyType: "" as string,        // "house" | "apartment" | "condo" | "townhouse" | "commercial"
  propertyFloors: "" as number | "",
  propertyBedrooms: "" as number | "",
  propertyBathrooms: "" as number | "",
  propertyHasBasement: false,
  propertyHasAttic: false,
  propertyRooms: [] as {
    name: string; floor: string; affected: boolean; depth: number; notes: string;
    severityOverrides?: Record<string, number>; handlingCodes?: string[]; qualityCode?: string; isOrigin?: boolean;
  }[],
  propertyImpactScope: "" as string, // "entire" | "partial" | "unknown"

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
  pickupDate: new Date().toISOString().split("T")[0],
  pickupTime: "",
  assignedTech: "",

  quickScopeNotes: [],
  loadList: [],
  loadListNote: "",

  postPickup: {
    totalLoss:        { taken: false, left: false, listed: false },
    notWorthCleaning: { taken: false, left: false, listed: false },
    donationItems:    { taken: false, left: false, listed: false },
    cashOut:          { taken: false, left: false, listed: false },
    testCleaning:     { taken: false, left: false, listed: false },
  },
  additionalObservations: [], whoAtPickup: [], storageNeeded: "", storageMonths: "", highlightMissing: {},
  suggestedGroups: [],
  scopeBridge: createScopeBridgeState(),
};
