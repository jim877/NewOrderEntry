// @ts-nocheck
import React from "react";

// renderAlertMessageContent — special-cases the "instructions found" /
// "requirements found" alert family: bolds the entity name (the leading
// portion of the message before the standard suffix) and leaves the suffix
// in normal weight. Falls through to plain text for other alerts.
export const renderAlertMessageContent = (message: string = "", title: string = ""): React.ReactNode => {
  const marker = " has saved guidance for this order.";
  if (
    message &&
    marker &&
    message.endsWith(marker) &&
    /instructions found|requirements found/i.test(title || "")
  ) {
    const entity = message.slice(0, -marker.length).trim();
    return (
      <>
        <span className="font-semibold text-slate-900">{entity}</span>
        <span>{marker}</span>
      </>
    );
  }
  return message;
};

// renderAlertDetailContent — split each "Label: value" bullet so the label
// reads as the bold lead. Bullets without a colon render as plain text.
export const renderAlertDetailContent = (detail: string = ""): React.ReactNode => {
  const separatorIndex = (detail || "").indexOf(":");
  if (separatorIndex === -1) return detail;
  const label = detail.slice(0, separatorIndex).trim();
  const text = detail.slice(separatorIndex + 1).trim();
  return (
    <>
      <span className="font-semibold text-slate-900">{label}:</span>
      {text ? <span>{` ${text}`}</span> : null}
    </>
  );
};
