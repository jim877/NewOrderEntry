// @ts-nocheck
// Pure date/time helpers used by pickers + scheduling code.
// No React, no external state — safe to import anywhere.

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
