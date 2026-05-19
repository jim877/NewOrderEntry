// @ts-nocheck
import React from "react";

const BASE =
  "w-full min-h-[80px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 hover:border-slate-300 placeholder:text-slate-400/70";

export const Textarea = (props) => (
  <textarea {...props} className={`${BASE} ${props.className || ""}`} />
);
