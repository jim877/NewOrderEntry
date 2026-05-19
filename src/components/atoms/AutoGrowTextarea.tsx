// @ts-nocheck
import React, { useEffect, useRef } from "react";

const BASE =
  "w-full min-h-[120px] resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 hover:border-slate-300 placeholder:text-slate-400/70";

// AutoGrowTextarea — grows to fit content. Uses a ref to size on every `value` change.
export const AutoGrowTextarea = ({ value, onChange, className, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className={`${BASE} ${className || ""}`}
      {...props}
    />
  );
};
