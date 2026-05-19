// @ts-nocheck
import React from "react";

// Field — label + optional action + missing/smart indicators wrapping a single input/control.
export const Field = ({ label, children, subtle, missing, className, action, smart, id, noeField }) => (
  <div
    id={id}
    className={`flex flex-col gap-1.5 ${className || ""}`}
    data-noe-field={noeField || undefined}
    data-noe-label={label || undefined}
  >
    <div className="flex items-center justify-between">
      <label className={`flex items-center text-sm font-semibold tracking-wide ${subtle ? "text-slate-500" : "text-slate-700"}`}>
        {label}
        {missing && <span className="ml-1 text-red-500">*</span>}
        {smart && (
          <span
            title={typeof smart === "string" ? smart : "Automatically updates"}
            className="ml-1.5 text-orange-500 text-xs cursor-help"
          >
            ⚡
          </span>
        )}
      </label>
      {action}
    </div>
    {children}
  </div>
);
