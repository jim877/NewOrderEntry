// @ts-nocheck
// Pure builder for the "auto" Scope Bridge blocker list — the subset of
// pending issues the system computes from the order shape (independent of
// what the user has manually flagged). The auto list is reconciled against
// the manually-managed pending list in a useEffect at the call site so
// that auto-detected blockers stay synced and auto-managed slots clear
// themselves when the underlying condition resolves.

import { hasMeaningfulValue } from "./order";
import { normalizeCompany } from "./strings";

// computeAutoBridgeIssues — emit the ordered, de-duped list of
// auto-detected blockers. Inputs:
//   data — order data (estimateRequested / estimateRequestedBy /
//     estimateApprovedAt / insuranceCompany)
//   milestones — scopeBridgeState.milestones object
//   currentOrderSpecialDocs — names of any special paperwork required
//     on the order (drives the SPECIAL_PAPERWORK_BLOCKER slot)
//   blockerLabels — { specialPaperwork, unknownInsurance } string
//     constants from config.lists.bridge
export const computeAutoBridgeIssues = (
  data: any,
  milestones: Record<string, any>,
  currentOrderSpecialDocs: string[],
  blockerLabels: { specialPaperwork: string; unknownInsurance: string },
): string[] => {
  const auto: string[] = [];
  const authorizationOnFile = !!milestones.authorizationOnFile;
  const proceedWithoutApproval = !!milestones.proceedWithoutApproval;
  const estimateApproved =
    proceedWithoutApproval || !!milestones.estimateApproved || hasMeaningfulValue(data.estimateApprovedAt);
  const estimateRequestedBy = (data.estimateRequestedBy || "").toString().trim().toLowerCase();
  const estimateRequestedByInsurance = /\b(adjuster|insurance|carrier|public adjuster|pa|tpa)\b/.test(estimateRequestedBy);

  if (!authorizationOnFile) auto.push("Won't Sign Authorization");
  if (!!data.estimateRequested && !estimateApproved) {
    auto.push(estimateRequestedByInsurance ? "Adjuster Wants Estimate" : "Customer Wants Estimate");
  }
  if (currentOrderSpecialDocs.length > 0) auto.push(blockerLabels.specialPaperwork);
  if (normalizeCompany(data.insuranceCompany || "") === normalizeCompany("Not Yet Known")) {
    auto.push(blockerLabels.unknownInsurance);
  }

  return Array.from(new Set(auto));
};
