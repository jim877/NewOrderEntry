// @ts-nocheck
// Pure reducers for the Scope Bridge milestone toggles. Each takes
// the prev bridge state and returns the next — no React, no setData.
// The call site wraps them with patchScopeBridge() to push the
// patched state into the order.

import { canonicalBridgeIssue } from "./bridge";
import { toggleMulti } from "./strings";

// toggleBridgeMilestoneReducer — flip a milestone on/off. When
// enabling certain milestones, also drop matching pending issues:
//   authorizationOnFile -> drop "Won't Sign Authorization"
//   estimateApproved    -> drop the two "Wants Estimate" variants
//     and clear any "proceed without approval" override.
// `milestoneId` is the boolean field name; `atId` is the timestamp
// field that gets stamped to now / cleared.
export const toggleBridgeMilestoneReducer = (
  prev: any,
  milestoneId: string,
  atId: string,
) => {
  const currentMilestones = prev.milestones || {};
  const currentPending = Array.from(
    new Set((prev.pendingIssues || []).map(canonicalBridgeIssue).filter(Boolean))
  );
  const nextEnabled = !currentMilestones[milestoneId];
  const isEstimateApproval = milestoneId === "estimateApproved";
  const isAuthorizationSigned = milestoneId === "authorizationOnFile";

  const clearOverridePatch =
    isEstimateApproval && nextEnabled
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
    nextPending = nextPending.filter(
      (issue) => issue !== "Customer Wants Estimate" && issue !== "Adjuster Wants Estimate"
    );
  }

  return {
    ...prev,
    pendingIssues: nextPending,
    milestones: {
      ...currentMilestones,
      ...clearOverridePatch,
      [milestoneId]: nextEnabled,
      [atId]: nextEnabled ? new Date().toISOString() : "",
    },
  };
};

// toggleBridgeIssueReducer — flip a single pending issue on/off in
// the bridge state's pendingIssues list. Normalizes the issue label
// before comparing so case/whitespace variants don't double up.
export const toggleBridgeIssueReducer = (prev: any, issue: string) => {
  const normalizedIssue = canonicalBridgeIssue(issue);
  const currentPending = Array.from(
    new Set((prev.pendingIssues || []).map(canonicalBridgeIssue).filter(Boolean))
  );
  const nextPending = toggleMulti(currentPending, normalizedIssue);
  return { ...prev, pendingIssues: nextPending };
};

// updateBridgeMilestoneReducer — direct write into a single milestone
// field. Used for free-text milestone-completed-by inputs.
export const updateBridgeMilestoneReducer = (prev: any, milestoneKey: string, value: any) => ({
  ...prev,
  milestones: {
    ...(prev.milestones || {}),
    [milestoneKey]: value,
  },
});

// toggleProceedWithoutApprovalReducer — the "proceed without
// approval" override is mutually exclusive with estimateApproved.
// Enabling it clears the approval timestamp+by; disabling it leaves
// them unchanged (since approval may legitimately exist independently).
export const toggleProceedWithoutApprovalReducer = (prev: any) => {
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
};
