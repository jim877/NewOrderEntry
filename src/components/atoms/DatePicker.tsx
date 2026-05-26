// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { normalizeDateInput, getNowDateIso } from "../../utils/dateTime";

// DatePicker — input + calendar popup. Closes on outside click, Enter, Escape, or external `closeSignal`.
// `allowPast` lets past dates be selected (off by default).
export const DatePicker = ({ value, onChange, closeSignal, allowPast = false }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [view, setView] = useState(() => {
    const base = value ? new Date(normalizeDateInput(value)) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (closeSignal !== undefined) setOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    if (!value) return;
    const d = new Date(normalizeDateInput(value));
    if (!isNaN(d.getTime())) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

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

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const todayIso = getNowDateIso();

  const pick = (d) => {
    if (!d) return;
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    if (!allowPast && iso < todayIso) return;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          const normalized = normalizeDateInput(value);
          const today = getNowDateIso();
          if (!allowPast && (!normalized || normalized < today)) { onChange(today); return; }
          if (allowPast && !normalized) return;
          if (normalized !== value) onChange(normalized);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const normalized = normalizeDateInput(value || "");
            if (normalized !== value) onChange(normalized);
            setOpen(false);
          }
          if (e.key === "Tab") {
            const normalized = normalizeDateInput(value || "");
            if (normalized !== value) onChange(normalized);
            setOpen(false);
          }
        }}
        placeholder="YYYY-MM-DD"
        className="!py-3 !text-base pr-10"
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
        title="Pick a date"
      >
        📅
      </button>
      {open && (
        <div className="absolute z-[120] mt-2 w-[380px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView(new Date(year, month - 1, 1))} className="rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700">←</button>
            <div className="text-sm font-bold text-slate-700">{view.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <button onClick={() => setView(new Date(year, month + 1, 1))} className="rounded-full border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-sky-300 hover:text-sky-700">→</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold text-slate-400 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, idx) => {
              const dateIso = d ? new Date(year, month, d).toISOString().slice(0, 10) : "";
              const isSelected = d ? normalizeDateInput(value) === dateIso : false;
              const isToday = d ? dateIso === todayIso : false;
              const isPast = d && !allowPast ? dateIso < todayIso : false;
              const dayOfWeek = d ? new Date(year, month, d).getDay() : -1;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <button
                  key={`${d}-${idx}`}
                  onClick={() => pick(d)}
                  className={`h-10 w-10 rounded-full text-sm relative ${
                    !d ? "text-transparent" :
                    isPast ? "text-slate-300 cursor-not-allowed" :
                    isSelected ? "bg-sky-500 text-white font-bold" :
                    isToday ? "bg-sky-50 text-sky-700 font-bold ring-2 ring-sky-300" :
                    isWeekend ? "text-slate-500 bg-slate-50 hover:bg-sky-50" :
                    "text-slate-700 hover:bg-sky-50"
                  }`}
                  disabled={!d || isPast}
                  title={d ? new Date(year, month, d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : ""}
                >
                  {d || "."}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => setOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
