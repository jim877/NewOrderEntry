// @ts-nocheck
// Export helpers — flat representation of the order shape (one "key.path: value"
// line per scalar) plus the clipboard / file-download plumbing the Save Summary
// modal uses for Copy and Download buttons. All pure (clipboard/document are
// browser globals, not React state).

// buildFullExportLines — walks an arbitrarily nested data object and emits
// "dot.path: value" lines for every scalar (and "key: a, b, c" for arrays of
// scalars). Empty arrays + null/undefined are skipped; arrays of objects are
// recursed with bracketed indices. The seen-set guards against the same key
// appearing twice (defensive — shouldn't happen with plain order data).
export const buildFullExportLines = (data: any): string[] => {
  const lines: string[] = [];
  const seen = new Set<string>();
  const walk = (obj: any, path = "") => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== "object") {
      const key = path || "value";
      if (seen.has(key)) return;
      seen.add(key);
      lines.push(`${key}: ${obj}`);
      return;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return;
      if (obj.every((v) => typeof v !== "object")) {
        const key = path || "value";
        if (!seen.has(key)) {
          seen.add(key);
          lines.push(`${key}: ${obj.join(", ")}`);
        }
        return;
      }
      obj.forEach((v, idx) => walk(v, path ? `${path}[${idx}]` : `[${idx}]`));
      return;
    }
    Object.entries(obj).forEach(([k, v]) => {
      walk(v, path ? `${path}.${k}` : k);
    });
  };
  walk(data);
  return lines;
};

// copyLinesToClipboard — newline-join + write to clipboard, with a textarea
// fallback for environments without the async Clipboard API. Returns true on
// success so callers can decide whether to show a confirmation toast. Empty
// inputs are a no-op (returns false without throwing).
export const copyLinesToClipboard = async (lines: string[] | null | undefined): Promise<boolean> => {
  const text = (lines || []).join("\n");
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through to textarea */ }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  document.body.removeChild(textarea);
  return ok;
};

import { normalizeInstructionEntries } from "./instructions";
import { projectTypeFromOrderTypes } from "./orderType";

// buildSaveSummaryLines — emit the "Label: Value" line list shown in
// the Save Summary modal. Each push() helper skips empty / undefined /
// empty-array values so the output is dense. Customer + address
// arrays expand to per-row entries.
export const buildSaveSummaryLines = (data: any): string[] => {
  const lines: string[] = [];
  const push = (label: string, value: any) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    lines.push(`${label}: ${Array.isArray(value) ? value.join(", ") : value}`);
  };
  push("Record Type", data.isLead === true ? "Lead" : data.isLead === false ? "Order" : "");
  push("Order Status", data.orderStatus);
  push("Project Type", projectTypeFromOrderTypes(data.orderTypes || []));
  push("Order Name", data.orderName);
  push("Order Type", data.orderTypes);
  push("Service Offerings", data.serviceOfferings);
  if (data.leadSourceCategory) {
    push("Lead Source", data.leadSourceCategory);
    push("Lead Source Detail", data.leadSourceDetail);
    push("Referring Company", data.referringCompany);
    push("Referrer", data.referrer);
  }
  (data.customers || []).forEach((c: any, idx: number) => {
    const name = [c.first, c.last].filter(Boolean).join(" ").trim();
    if (name) push(`Customer ${idx + 1}`, name);
    if (c.phone) push(`Customer ${idx + 1} Phone`, c.phone);
    if (c.email) push(`Customer ${idx + 1} Email`, c.email);
  });
  (data.addresses || []).forEach((a: any, idx: number) => {
    const addr = [a.street, a.city, a.state, a.zip].filter(Boolean).join(", ");
    if (addr) push(`Address ${idx + 1}`, addr);
  });
  push("Bill To", data.billingPayer);
  push("Billing Company", data.billingCompany);
  push("Billing Contact", data.billingContact);
  push(
    "Order Instructions",
    normalizeInstructionEntries(data.orderInstructions || []).map((e: any) => `${e.type}: ${e.text}`).join(" | ")
  );
  push("Insurance Claim", data.insuranceClaim);
  push("Insurance Company", data.insuranceCompany);
  push("National Carrier", data.nationalCarrier);
  push("Adjuster", data.insuranceAdjuster);
  push("Claim #", data.claimNumber);
  push("Policy #", data.policyNumber);
  push("Work Order #", data.workOrderNumber);
  push("Order Specific Email", data.insuranceOrderEmail);
  push("Contents Limit", data.contentsCoverageLimit);
  push("Mold Limit", data.moldLimit);
  push("Schedule Type", data.scheduleType);
  push("Schedule Date", data.pickupDate);
  push("Schedule Time", data.pickupTime);
  return lines;
};

// downloadLinesAsFile — newline-join + trigger a same-tab text file download
// via a hidden anchor. The Blob URL is revoked after the click to free memory.
export const downloadLinesAsFile = (lines: string[] | null | undefined, filename: string): void => {
  const text = (lines || []).join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
