// @ts-nocheck
// Pure builder for the audit "missing fields" list shown in the Action
// Items panel and Save Summary. Combines two layers:
//   1. Config-driven field checks from fieldConfig (each entry can opt
//      into the audit via requiredInAudit, with optional condition guard
//      and status gate).
//   2. Structural placeholder checks for customers / vendors / addresses
//      / additionalCompanies entries that the user hasn't filled in yet.

import { hasMeaningfulValue, isPlaceholderFlagActive, isAddressPlaceholder } from "./order";
import {
  isCompanyPlaceholder,
  isContactPlaceholder,
  companyTypeRequiresContact,
  syncCompanyEntryPlaceholders,
} from "./companyEntry";
import { hasPrimaryOrderTypeDecision, hasRequiredNonRestorationSubtype } from "./orderType";
import { normalizePlaceholderKeyPart } from "./strings";

export type AuditMissingItem = {
  id?: string;
  label: string;
  section: string;
  key: string;
  category?: string;
  vendorIdx?: number;
};

// computeAuditMissing — emit the missing-fields list. fieldConfig drives
// the field-level checks; the order data drives the structural placeholder
// checks. Caller passes ORDER_STATUSES + SEVERITY_GROUPS so this module
// doesn't need to import config.ts.
export const computeAuditMissing = (
  data: any,
  fieldConfig: Record<string, any>,
  orderStatuses: string[],
  severityGroups: string[],
): AuditMissingItem[] => {
  const missing: AuditMissingItem[] = [];
  const primaryCustomer = (data.customers || [])[0] || {};
  const primaryAddress = (data.addresses || [])[0] || {};
  const statusIndex = orderStatuses.indexOf(data.orderStatus);

  // Named check functions for complex validations referenced from fieldConfig.
  const checkFns: Record<string, () => boolean> = {
    hasPrimaryOrderTypeDecision: () => hasPrimaryOrderTypeDecision(data.orderTypes || []),
    hasRequiredNonRestorationSubtype: () => hasRequiredNonRestorationSubtype(data.orderTypes || []),
    interviewCompleted: () => !!(
      data.livingStatus || data.processType || data.repairsSummary ||
      (data.packoutSummary || []).length ||
      data.damageWasWet || data.damageMoldMildew ||
      data.structuralElectricDamage === "Y" ||
      data.noLights || data.noHeat || data.boardedUp
    ),
    codesCompleted: () => !!(
      (data.severityCodes || []).length || data.qualityCode || (data.handlingCodes || []).length
    ),
  };

  // Resolve a value either via a special dataPath (customers[0].xxx /
  // addresses[0].xxx) or by direct lookup on data.
  const resolveValue = (key: string, cfg: any) => {
    if (cfg.dataPath) {
      if (cfg.dataPath.startsWith("customers[0].")) return primaryCustomer[cfg.dataPath.split(".")[1]];
      if (cfg.dataPath.startsWith("addresses[0].")) return primaryAddress[cfg.dataPath.split(".")[1]];
    }
    return data[key];
  };

  // Evaluate the optional `condition` guard attached to a field config
  // entry. Supported shapes: { field, equals }, { field, oneOf }, { field, includes }.
  const conditionMet = (cond: any) => {
    if (!cond) return true;
    if (cond.equals) return data[cond.field] === cond.equals;
    if (cond.oneOf) return (cond.oneOf || []).includes(data[cond.field]);
    if (cond.includes) return (data[cond.field] || []).includes(cond.includes);
    return true;
  };

  // requiredAtStatus gates which order-status threshold a field starts
  // being audited at. "always" / "never" are special; otherwise it's an
  // ORDER_STATUSES index threshold.
  const statusGateMet = (requiredAtStatus: string) => {
    if (!requiredAtStatus || requiredAtStatus === "always") return true;
    if (requiredAtStatus === "never") return false;
    const gateIndex = orderStatuses.indexOf(requiredAtStatus);
    return gateIndex >= 0 && statusIndex >= gateIndex;
  };

  // Config-driven field checks.
  Object.entries(fieldConfig).forEach(([key, cfg]: [string, any]) => {
    if (!cfg.requiredInAudit) return;
    if (!statusGateMet(cfg.requiredAtStatus)) return;
    if (!conditionMet(cfg.condition)) return;

    const isEmpty = cfg.checkFn && checkFns[cfg.checkFn]
      ? !checkFns[cfg.checkFn]()
      : !resolveValue(key, cfg);

    if (isEmpty) missing.push({ id: cfg.section, label: cfg.label, section: cfg.section, key });
  });

  // Dynamic severity checks (special case — codes depend on order types).
  if (["Pickup Complete", "Ready to Bill"].includes(data.orderStatus)) {
    const severityGroupsNeeded = (data.orderTypes || []).reduce((acc: Set<string>, t: string) => {
      const group = t === "Dust/Debris" ? "Dust" : t;
      if (severityGroups.includes(group)) acc.add(group);
      return acc;
    }, new Set<string>());
    severityGroupsNeeded.forEach((group) => {
      const hasCode = (data.severityCodes || []).some((c: string) => c.startsWith(group + "-"));
      if (!hasCode) missing.push({ id: "sec1", label: `${group} Severity`, section: "sec1", key: `severity-${group.toLowerCase()}` });
    });
  }

  // Structural placeholder checks — not field-config driven.
  (data.customers || []).forEach((customer: any, idx: number) => {
    if (!isPlaceholderFlagActive(customer?.placeholder)) return;
    const customerLabel = [customer?.first, customer?.last].filter(hasMeaningfulValue).join(" ").trim() || `Customer ${idx + 1}`;
    missing.push({ id: "sec2", label: `Resolve Placeholder: ${customerLabel}`, section: "sec2", key: `placeholder-customer-${customer?.id || idx}`, category: "placeholders" });
  });
  (data.vendors || []).forEach((v: any, idx: number) => {
    if (v.incomplete) {
      missing.push({ id: "sec4", label: `Incomplete: ${v.contact || v.company || `Company ${idx + 1}`}`, section: "sec4", key: `placeholder-vendor-${v.id || idx}`, category: "placeholders", vendorIdx: idx });
    }
  });
  (data.addresses || []).forEach((addr: any, idx: number) => {
    if (!isAddressPlaceholder(addr)) return;
    const addrLabel = addr?.type || (idx === 0 ? "Primary Address" : `Address ${idx + 1}`);
    const addrContext = addr?.linkedContext ? ` (${addr.linkedContext})` : "";
    missing.push({ id: "sec3", label: `Resolve Placeholder: ${addrLabel}${addrContext}`, section: "sec3", key: `placeholder-address-${addr.id}`, category: "placeholders" });
  });
  Object.entries(data.additionalCompanies || {}).forEach(([type, rawEntry]: [string, any]) => {
    const entry = syncCompanyEntryPlaceholders(rawEntry || {});
    if (isCompanyPlaceholder(entry)) {
      missing.push({ id: "sec4", label: `Resolve Placeholder: ${type} company`, section: "sec4", key: `placeholder-company-${normalizePlaceholderKeyPart(type)}`, category: "placeholders" });
    } else if (companyTypeRequiresContact(type) && isContactPlaceholder(entry)) {
      missing.push({ id: "sec4", label: `Resolve Placeholder: ${type} contact`, section: "sec4", key: `placeholder-contact-${normalizePlaceholderKeyPart(type)}`, category: "placeholders" });
    }
  });

  return missing;
};
