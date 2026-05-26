// @ts-nocheck
import React from "react";

// Chevron — tiny right-arrow that rotates 90° when `open` is true.
// Used as a disclosure indicator on collapsible rows.
export const Chevron = ({ open }) => (
  <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
);
