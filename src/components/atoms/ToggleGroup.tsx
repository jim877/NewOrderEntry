// @ts-nocheck
import React from "react";
import { pillBase, pillActive, pillInactive } from "./pillStyles";

// ToggleGroup — row of pill buttons where only one can be selected at a time.
// Click the active option again to clear it.
export const ToggleGroup = ({ options, value, onChange, noeField }) => (
  <div className="flex flex-wrap gap-2" data-noe-field={noeField || undefined} data-noe-value={value || undefined}>
    {options.map((opt) => {
      const label = typeof opt === "string" ? opt : opt.label;
      const title = typeof opt === "string" ? undefined : opt.title;
      const isActive = value === label;
      return (
        <button
          key={label}
          type="button"
          title={title}
          aria-pressed={isActive}
          data-noe-option={label}
          data-noe-selected={isActive}
          onClick={() => onChange(isActive ? "" : label)}
          className={isActive ? `${pillBase} ${pillActive}` : `${pillBase} ${pillInactive}`}
        >
          {label}
        </button>
      );
    })}
  </div>
);
