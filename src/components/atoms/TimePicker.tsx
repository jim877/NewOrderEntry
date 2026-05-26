// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { TIME_SLOTS } from "../../utils/dateTime";

// TimePicker — input + dropdown of 30-min slots (6 AM–8 PM RCS business hours).
// Closes on outside click, Enter, Escape, or external `closeSignal`.
export const TimePicker = ({ value, onChange, closeSignal }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (closeSignal !== undefined) setOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Enter") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setOpen(false);
          }
          if (e.key === "Tab") setOpen(false);
        }}
        placeholder="Time"
        className="!py-3 !text-base pr-10"
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
        title="Pick a time"
      >
        🕒
      </button>
      {open && (
        <div className="absolute z-[120] mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="max-h-[300px] overflow-y-auto custom-scroll">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                onClick={() => { onChange(t); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg ${t === value ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
