// @ts-nocheck
import React from "react";
import { pillBase, pillActive, pillInactive } from "./pillStyles";

// ToggleMulti — single pill button that toggles its own checked state when clicked.
// `colorClass` overrides the active style for color-coded groups.
export const ToggleMulti = ({ label, checked, onChange, className, colorClass, title, showDot = true, noeField }) => {
  const activeClass = colorClass || pillActive;
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      aria-pressed={checked}
      data-noe-option={label}
      data-noe-selected={checked}
      data-noe-field={noeField || undefined}
      className={(checked ? `${pillBase} ${activeClass}` : `${pillBase} ${pillInactive}`) + " " + (className || "")}
    >
      {label}
    </button>
  );
};
