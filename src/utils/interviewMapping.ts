// Bidirectional mapping between the ScopeWizard's interview-answers shape
// (flat Record keyed by question id) and the NOE order-data shape (typed
// fields scattered across customer/order/scope flags). Both pure — no React,
// no closure. Used by ScopeWizard's interviewAnswers useState initializer and
// its syncInterviewToNOE useCallback respectively.

export type InterviewAnswers = Record<string, string | string[] | boolean | null | undefined>;

// interviewAnswersFromOrderData — read an existing NOE order and hydrate the
// interview's flat answer Record. Skips fields that haven't been answered so
// the wizard knows "answer missing" vs "answered N".
export const interviewAnswersFromOrderData = (orderData: any): InterviewAnswers => {
  if (!orderData) return {};
  const d = orderData as any;
  const a: InterviewAnswers = {};

  // Living / delivery
  if (d.livingStatus) a.living = d.livingStatus;
  if (d.processType) a.delivery = d.processType;

  // Repairs (stored as comma-joined string on the order)
  if (d.repairsSummary) a.repairs = String(d.repairsSummary).split(", ").filter(Boolean);

  // Boolean Y/N questions with free-text notes
  if (d.familyMedicalIssues === "Y" || d.familyMedicalIssues === true) a.medicalIssues = true;
  if (d.familyMedicalIssues === "N" || d.familyMedicalIssues === false) a.medicalIssues = false;
  if (d.familyMedicalNote) a.medicalIssues_note = d.familyMedicalNote;
  if (d.soapFragAllergies === "Y" || d.soapFragAllergies === true) a.soapAllergies = true;
  if (d.soapFragAllergies === "N" || d.soapFragAllergies === false) a.soapAllergies = false;
  if (d.soapFragNote) a.soapAllergies_note = d.soapFragNote;
  if (d.selfCleaning === "Y" || d.selfCleaning === true) a.selfCleaning = true;
  if (d.selfCleaning === "N" || d.selfCleaning === false) a.selfCleaning = false;
  if (d.selfCleaningNote) a.selfCleaning_note = d.selfCleaningNote;
  if (d.storageNeeded === "Y" || d.storageNeeded === true) a.needStorage = true;
  if (d.storageNeeded === "N" || d.storageNeeded === false) a.needStorage = false;

  // Single-select
  if (d.useDryCleaner) a.useDryCleaner = d.useDryCleaner;
  if (d.howDryLaundry) a.dryLaundry = d.howDryLaundry;

  // Multi-select lists
  if (d.loadList?.length) a.loadList = d.loadList;
  if (d.packoutSummary?.length) a.packout = d.packoutSummary;
  if (d.sdsConsiderations?.length) a.considerations = d.sdsConsiderations;
  if (d.suggestedGroups?.length) a.suggestedGroups = d.suggestedGroups;
  if (d.finalDeliveryQualifier) a.finalDeliveryDate = d.finalDeliveryQualifier;
  if (d.rushDeliveryNeeded === "Y") a.rushDelivery = true;
  if (d.rushDeliveryNeeded === "N") a.rushDelivery = false;

  // Conditions are stored as separate boolean flags on the order; re-assemble
  // the multi-select chip array the interview UI expects.
  const conditions: string[] = [];
  if (d.damageWasWet === true || d.damageWasWet === "Y") conditions.push("Still Wet");
  if (d.damageMoldMildew === true || d.damageMoldMildew === "Y") conditions.push("Visible Mold");
  if (d.structuralElectricDamage) conditions.push("Structural Damage");
  if (d.noLights === true || d.noLights === "Y") conditions.push("No Electricity");
  if (d.noHeat === true || d.noHeat === "Y") conditions.push("No Heat");
  if (d.boardedUp === true || d.boardedUp === "Y") conditions.push("Boarded Up");
  if (conditions.length) a.conditions = conditions;

  // Pets — flatten across customers
  const pets = (d.customers || []).flatMap((c: any) => (c.pets || []).map((p: any) => p.type || p.name || "")).filter(Boolean);
  if (pets.length) a.petsInHome = pets;

  return a;
};

// orderUpdatesFromInterviewAnswers — invert the mapping for live sync: take
// a partial answers Record and emit the NOE-field patch to merge into the
// order. Booleans flatten to "Y"/"N"/"". Caller is responsible for actually
// applying the patch (e.g. via onOrderUpdate(updates)).
export const orderUpdatesFromInterviewAnswers = (answers: InterviewAnswers): Record<string, any> => {
  const updates: Record<string, any> = {};
  if (answers.living !== undefined) updates.livingStatus = answers.living;
  if (answers.delivery !== undefined) updates.processType = answers.delivery;
  if (answers.rushDelivery !== undefined) {
    updates.rushDeliveryNeeded = answers.rushDelivery === true ? "Y" : answers.rushDelivery === false ? "N" : "";
  }
  if (answers.deliveryAddress !== undefined) updates.deliveryAddress = answers.deliveryAddress;
  if (answers.livingAddresses !== undefined) updates.livingAddresses = answers.livingAddresses;
  if (answers.repairs !== undefined) updates.repairsSummary = Array.isArray(answers.repairs) ? answers.repairs.join(", ") : "";
  if (answers.medicalIssues !== undefined) updates.familyMedicalIssues = answers.medicalIssues === true ? "Y" : answers.medicalIssues === false ? "N" : "";
  if (answers.medicalIssues_note !== undefined) updates.familyMedicalNote = answers.medicalIssues_note;
  if (answers.soapAllergies !== undefined) updates.soapFragAllergies = answers.soapAllergies === true ? "Y" : answers.soapAllergies === false ? "N" : "";
  if (answers.soapAllergies_note !== undefined) updates.soapFragNote = answers.soapAllergies_note;
  if (answers.selfCleaning !== undefined) updates.selfCleaning = answers.selfCleaning === true ? "Y" : answers.selfCleaning === false ? "N" : "";
  if (answers.selfCleaning_note !== undefined) updates.selfCleaningNote = answers.selfCleaning_note;
  if (answers.needStorage !== undefined) updates.storageNeeded = answers.needStorage === true ? "Y" : answers.needStorage === false ? "N" : "";
  if (answers.useDryCleaner !== undefined) updates.useDryCleaner = answers.useDryCleaner;
  if (answers.dryLaundry !== undefined) updates.howDryLaundry = answers.dryLaundry;
  if (answers.loadList !== undefined) updates.loadList = answers.loadList;
  if (answers.packout !== undefined) updates.packoutSummary = answers.packout;
  if (answers.considerations !== undefined) updates.sdsConsiderations = answers.considerations;
  if (answers.suggestedGroups !== undefined) updates.suggestedGroups = answers.suggestedGroups;
  if (answers.finalDeliveryDate !== undefined) updates.finalDeliveryQualifier = answers.finalDeliveryDate;
  if (answers.interests !== undefined) updates.customerInterests = answers.interests;
  if (answers.upcomingEvents !== undefined) updates.customerUpcomingEvents = answers.upcomingEvents;
  if (Array.isArray(answers.conditions)) {
    updates.damageWasWet = answers.conditions.includes("Still Wet") ? "Y" : "N";
    updates.damageMoldMildew = answers.conditions.includes("Visible Mold") ? "Y" : "N";
    updates.noHeat = answers.conditions.includes("No Heat") ? "Y" : "N";
    updates.noLights = answers.conditions.includes("No Electricity") ? "Y" : "N";
    updates.boardedUp = answers.conditions.includes("Boarded Up") ? "Y" : "N";
  }
  if (Array.isArray(answers.petsInHome)) {
    // Surfaced by the NOE pet display section
    updates.interviewPets = answers.petsInHome;
  }
  return updates;
};
