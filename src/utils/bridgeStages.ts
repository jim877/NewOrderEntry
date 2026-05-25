// @ts-nocheck
// Pure mappings between the Scope Bridge "stage tone" option ids
// (used by the UI buttons in the Action Items panel — "hold" /
// "priority" / "ok" / "schedule" / "yes") and the underlying
// pickupOption / processingOption / deliveryOption / nextStep fields
// on the bridge state.

// resolveBridgePickupStep — derive the selected pickup option id from
// the underlying pickupOption. "wait" -> "hold", "urgent" ->
// "priority", everything else -> "schedule" (the default neutral state).
export const resolveBridgePickupStep = (pickupOption: string): string => {
  const pickup = (pickupOption || "").toString();
  if (pickup === "wait") return "hold";
  if (pickup === "urgent") return "priority";
  return "schedule";
};

// resolveBridgeProcessStep — derive the selected process option id.
// "tag_hold" -> "hold", "urgent"/"specific" -> "priority", anything
// else -> "yes" (proceed).
export const resolveBridgeProcessStep = (processingOption: string): string => {
  const process = (processingOption || "").toString();
  if (process === "tag_hold") return "hold";
  if (process === "urgent" || process === "specific") return "priority";
  return "yes";
};

// resolveBridgeDeliveryStep — derive the selected delivery option id.
// Falls back through deliveryOption -> nextStep -> processingOption
// to handle older states where the explicit deliveryOption wasn't set.
export const resolveBridgeDeliveryStep = (state: {
  deliveryOption?: string;
  nextStep?: string;
  processingOption?: string;
}): string => {
  const delivery = (state.deliveryOption || "").toString();
  if (delivery === "hold_cod") return "hold_cod";
  if (delivery === "priority") return "priority";
  if (delivery === "ok") return "ok";

  const nextStep = (state.nextStep || "").toString();
  if (nextStep === "delivery_hold_cod" || nextStep === "cod" || nextStep === "delivery_hold") return "hold_cod";
  if (nextStep === "delivery_priority" || nextStep === "emergency_groups_only") return "priority";
  if ((state.processingOption || "").toString() === "cod") return "hold_cod";
  return "ok";
};

// applyBridgePickupStepReducer — given a selected option id, return
// the patch to apply to bridge state. Empty pickupOption means
// "schedule" (the neutral default).
export const applyBridgePickupStepReducer = (prev: any, optionId: string) => {
  const pickupOption = optionId === "hold" ? "wait" : optionId === "priority" ? "urgent" : "";
  return { ...prev, pickupOption };
};

// applyBridgeProcessStepReducer — given the selected option id,
// return the patch. "yes" (proceed) maps to "all"; the rest map to
// explicit modes.
export const applyBridgeProcessStepReducer = (prev: any, optionId: string) => {
  const processingOption = optionId === "hold" ? "tag_hold" : optionId === "priority" ? "urgent" : "all";
  return { ...prev, processingOption };
};

// applyBridgeDeliveryStepReducer — given the selected option id,
// return the patch. Sets both deliveryOption and nextStep so the
// downstream "where are we in the bridge?" derivation stays in sync.
export const applyBridgeDeliveryStepReducer = (prev: any, optionId: string) => {
  const deliveryOption = optionId === "hold_cod" ? "hold_cod" : optionId === "priority" ? "priority" : "ok";
  const nextStep =
    optionId === "hold_cod"
      ? "delivery_hold_cod"
      : optionId === "priority"
        ? "delivery_priority"
        : "delivery_ok";
  return { ...prev, deliveryOption, nextStep };
};
