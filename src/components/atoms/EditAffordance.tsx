// @ts-nocheck
import React from "react";
import { SquarePen } from "lucide-react";

// EditAffordance — small circular badge with a pencil icon. Visual hint that a field is editable.
export const EditAffordance = ({ title = "Edit" }) => (
  <span
    title={title}
    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm"
  >
    <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
  </span>
);
