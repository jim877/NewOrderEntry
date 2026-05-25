// iCalendar (.ics) export — builds a single-VEVENT calendar file from the
// order's scheduled pickup and triggers a same-tab download. Pure aside from
// browser globals (Blob, URL, document) — no React, no closure deps.

import { safeUid } from "./uid";
import { formatIcsDateTime, addHours } from "./dateTime";

// buildOrderIcsLines — assemble the iCalendar text body (CRLF-joined, per
// RFC 5545) for the order's scheduled pickup. Returns null when there's no
// pickupDate so the caller can no-op.
export const buildOrderIcsLines = (data: any): string | null => {
  if (!data?.pickupDate) return null;
  const dtStart = formatIcsDateTime(data.pickupDate, data.pickupTime);
  const dtEnd = data.pickupTime ? formatIcsDateTime(data.pickupDate, addHours(data.pickupTime, 1)) : "";
  const summary = `${data.scheduleType || "Event"} - ${data.orderName || "New Order"}`;
  const primaryAddr = (data.addresses || []).find((a: any) => a.isPrimary) || {};
  const location = [primaryAddr.street, primaryAddr.city, primaryAddr.state, primaryAddr.zip].filter(Boolean).join(" ");
  const descriptionLines = [
    data.eventAssignee ? `Assignee: ${data.eventAssignee}` : null,
    data.eventVehicle ? `Vehicle: ${data.eventVehicle}` : null,
  ].filter(Boolean).join("\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//New Order Entry//EN",
    "BEGIN:VEVENT",
    `UID:${safeUid()}`,
    `SUMMARY:${summary}`,
    descriptionLines ? `DESCRIPTION:${descriptionLines}` : null,
    location ? `LOCATION:${location}` : null,
    data.pickupTime ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
    data.pickupTime && dtEnd ? `DTEND:${dtEnd}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
};

// downloadOrderIcs — convenience wrapper: build the .ics text, write it as a
// text/calendar blob, and trigger download via a temporary anchor. No-op when
// there's no pickupDate.
export const downloadOrderIcs = (data: any): void => {
  const lines = buildOrderIcsLines(data);
  if (!lines) return;
  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(data.orderName || "event").replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
