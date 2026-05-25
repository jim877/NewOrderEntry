// @ts-nocheck
// Pure derivation of the per-section audit status badges shown in the
// Detailed-mode section headers ({ required, missing, complete }). The
// "required" counts are derived from the order's current shape (which
// fields the user has filled in, what's still placeholder, the order
// status gate for pickup/finance audits); the "missing" count comes
// from computeAuditMissing() at the call site.

import { isPlaceholderFlagActive, isAddressPlaceholder } from "./order";
import { isCompanyPlaceholder, isContactPlaceholder, syncCompanyEntryPlaceholders } from "./companyEntry";
import { isNonRestorationSelected } from "./orderType";

type AuditMissingItem = { key?: string; section?: string; id?: string; [k: string]: any };
type SectionStatus = { required: number; missing: number; complete: boolean };

// computeSectionAuditStatus — bucket the missing-field list by section
// (sec1..sec5), tally a per-section "required" count from the order shape,
// and emit one { required, missing, complete } record per section. A
// section reads as "complete" only when its required count is > 0 AND
// nothing is currently missing (so a section with no requirements doesn't
// flash green falsely).
export const computeSectionAuditStatus = (
  data: any,
  missing: AuditMissingItem[],
  severityGroups: string[],
  sectionOrder: string[],
): Record<string, SectionStatus> => {
  const missingBySection = missing.reduce((acc: Record<string, number>, item) => {
    const section = item.section || item.id;
    if (!section) return acc;
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {});

  const requiredBySection: Record<string, number> = { sec1: 0, sec2: 0, sec3: 0, sec4: 0, sec5: 0 };

  // Section 1 — Order: orderName, orderTypes, leadSourceCategory (always),
  // plus conditional fields based on lead source + restoration vs. service.
  requiredBySection.sec1 += 3;
  if (isNonRestorationSelected(data.orderTypes || [])) requiredBySection.sec1 += 1;
  if (data.leadSourceCategory === "Referral") requiredBySection.sec1 += 2;
  if (data.leadSourceCategory === "Marketing" || data.leadSourceCategory === "Internal") requiredBySection.sec1 += 1;
  if ((data.orderTypes || []).includes("Mold")) requiredBySection.sec1 += 1;

  // Sections 2-4 baseline.
  requiredBySection.sec2 += 4; // primary customer fields
  requiredBySection.sec3 += 6; // primary address fields
  requiredBySection.sec4 += 1; // billingPayer

  if (data.rentOrOwn === "Rent") requiredBySection.sec3 += 1;

  // Status-gated extras.
  const needsPickupAudit = ["Pickup Complete", "Ready to Bill"].includes(data.orderStatus);
  const needsFinanceAudit = ["Intake Complete", "Ready to Bill"].includes(data.orderStatus);
  if (needsPickupAudit) {
    const severityGroupsNeeded = (data.orderTypes || []).reduce((acc: Set<string>, t: string) => {
      const group = t === "Dust/Debris" ? "Dust" : t;
      if (severityGroups.includes(group)) acc.add(group);
      return acc;
    }, new Set<string>());
    requiredBySection.sec1 += severityGroupsNeeded.size;
    requiredBySection.sec1 += 2; // interview + codes
  }
  if (needsFinanceAudit) requiredBySection.sec4 += 4; // pricing + estimate

  // Placeholder records bump their owning section's required count so
  // they stay flagged until the user resolves them.
  requiredBySection.sec3 += (data.addresses || []).filter((addr: any) => isAddressPlaceholder(addr)).length;
  requiredBySection.sec2 += (data.customers || []).filter((customer: any) => isPlaceholderFlagActive(customer?.placeholder)).length;
  requiredBySection.sec4 += Object.values(data.additionalCompanies || {}).reduce((acc: number, rawEntry: any) => {
    const entry = syncCompanyEntryPlaceholders(rawEntry || {});
    if (isCompanyPlaceholder(entry)) return acc + 1;
    if (isContactPlaceholder(entry)) return acc + 1;
    return acc;
  }, 0);

  return sectionOrder.reduce((acc: Record<string, SectionStatus>, sectionId: string) => {
    const required = requiredBySection[sectionId] || 0;
    const missingCount = missingBySection[sectionId] || 0;
    acc[sectionId] = { required, missing: missingCount, complete: required > 0 && missingCount === 0 };
    return acc;
  }, {});
};
