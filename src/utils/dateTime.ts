// @ts-nocheck
// Pure date/time helpers used by pickers + scheduling code.
// No React, no external state — safe to import anywhere.

import { RUSH_SEASONS } from "../config";

export const normalizeDateInput = (value) => {
  const v = (value || "").trim();
  if (!v) return "";
  const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return v;
  const usMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const mm = String(usMatch[1]).padStart(2, "0");
    const dd = String(usMatch[2]).padStart(2, "0");
    return `${usMatch[3]}-${mm}-${dd}`;
  }
  return v;
};

export const formatDateLabel = (value) => {
  if (!value) return "";
  const iso = normalizeDateInput(value);
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return value;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const getNowDateIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getNowTimeLabel = () => {
  const d = new Date();
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hr = hours24 % 12 || 12;
  return `${hr}:${minutes} ${ampm}`;
};

export const getNextHalfHourLabel = () => {
  const d = new Date();
  let hours24 = d.getHours();
  const mins = d.getMinutes();
  let nextMinutes = 30;
  if (mins >= 30) {
    nextMinutes = 0;
    hours24 = (hours24 + 1) % 24;
  }
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hr = hours24 % 12 || 12;
  const mm = String(nextMinutes).padStart(2, "0");
  return `${hr}:${mm} ${ampm}`;
};

// formatShortTimestamp — locale "MM/DD/YY, h:mm" for audit logs. Falls back to ISO on error.
export const formatShortTimestamp = (date: Date = new Date()) => {
  try {
    return date.toLocaleString("en-US", {
      month: "numeric", day: "numeric", year: "2-digit",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return date.toISOString(); }
};

// 12:XX AM is treated as "no time set yet" elsewhere (default placeholder).
export const isTimeIn12AmHour = (timeStr = "") => /12:\d{2}\s*AM/i.test((timeStr || "").trim());

// shouldAutoFirm — a non-empty time that isn't 12 AM is intentional → auto-mark schedule as firm.
export const shouldAutoFirm = (timeStr = "") => !!(timeStr || "").trim() && !isTimeIn12AmHour(timeStr);

export const toIcsDate = (dateStr = "") => (!dateStr ? "" : dateStr.replace(/-/g, ""));

export const parseTimeTo24h = (timeStr = "") => {
  const match = (timeStr || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return { hour, minute };
};

export const formatIcsDateTime = (dateStr = "", timeStr = "") => {
  if (!dateStr) return "";
  const time = parseTimeTo24h(timeStr);
  if (!time) return toIcsDate(dateStr);
  const hh = String(time.hour).padStart(2, "0");
  const mm = String(time.minute).padStart(2, "0");
  return `${toIcsDate(dateStr)}T${hh}${mm}00`;
};

// addHours — bump a 12-hour-formatted time string by N hours; wraps at 24h. Returns 24h "HH:MM".
export const addHours = (timeStr = "", hours = 1) => {
  const time = parseTimeTo24h(timeStr);
  if (!time) return timeStr;
  const nextHour = (time.hour + hours) % 24;
  const hh = String(nextHour).padStart(2, "0");
  const mm = String(time.minute).padStart(2, "0");
  return `${hh}:${mm}`;
};

// computeStorageEstimate — months between two ISO yyyy-mm-dd dates, rounded up.
// Used to derive `storageMonths` from a Final delivery date.
export const computeStorageEstimate = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate);
  const e = new Date(endDate);
  return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
};

// rushAddDays — return a NEW date shifted by `days` (positive or negative).
export const rushAddDays = (date: Date, days: number) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

// parseLocalDate — coerce a value into a Date. Accepts Date, ISO yyyy-mm-dd, or anything
// `new Date()` can parse. Returns null for invalid input.
export const parseLocalDate = (value: any) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

// formatDateInputValue — coerce a value to yyyy-mm-dd. Empty string for invalid input.
export const formatDateInputValue = (value: any) => {
  const d = parseLocalDate(value);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// rushFormatDate — "Jan 5, 2026" style.
export const rushFormatDate = (d: any) =>
  d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

// rushGetSeasons — return the set of RUSH_SEASONS entries that overlap [start, end].
export const rushGetSeasons = (start: Date, end: Date) => {
  const found = new Set();
  const cur = new Date(start);
  while (cur <= end) {
    const m = cur.getMonth();
    Object.values(RUSH_SEASONS).forEach((s: any) => { if (s.months.includes(m)) found.add(s); });
    cur.setMonth(cur.getMonth() + 1);
  }
  return Array.from(found);
};

// TIME_SLOTS — 6 AM to 8 PM in 30-min increments (RCS business hours).
export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let i = 6; i <= 20; i++) {
    const hour = i > 12 ? i - 12 : i === 0 ? 12 : i;
    const ampm = i >= 12 ? "PM" : "AM";
    slots.push(`${hour}:00 ${ampm}`);
    if (i < 20) slots.push(`${hour}:30 ${ampm}`);
  }
  return slots;
})();
