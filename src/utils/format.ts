// @ts-nocheck
// Pure formatters for user input. No React, no external state.

// formatPhoneNumber — incremental US phone formatter: "5551234567" → "(555) 123-4567".
export const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const len = phoneNumber.length;
  if (len < 4) return phoneNumber;
  if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// formatCurrencyInput — render a value as a currency string with thousands separators.
// Strips non-digits/decimals, normalizes leading zeros, clips decimals to 2 digits.
export const formatCurrencyInput = (value: any) => {
  if (value === null || value === undefined) return "";
  const cleaned = value.toString().replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const [intPartRaw, decPartRaw] = cleaned.split(".");
  const intPart = intPartRaw ? intPartRaw.replace(/^0+(?=\d)/, "") : "0";
  const intFormatted = Number(intPart || 0).toLocaleString("en-US");
  const decPart = decPartRaw ? decPartRaw.slice(0, 2) : "";
  return `$${intFormatted}${decPart ? "." + decPart : ""}`;
};
