// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { HEADER_STEPS } from "../../config";

// StepNav — progress dots for the detailed-entry header.
// Click a dot to jump to its section; click again to open a subsection menu;
// on hover-capable devices the menu opens on hover instead.
export const StepNav = ({ activeSection, visitedSections, completedSections, onJump, onJumpSub }) => {
  const [openStepMenu, setOpenStepMenu] = useState("");
  const [touchLikeNav, setTouchLikeNav] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setTouchLikeNav(!!media.matches);
    apply();
    if (media.addEventListener) {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
    media.addListener?.(apply);
    return () => media.removeListener?.(apply);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!navRef.current) return;
      if (navRef.current.contains(event.target)) return;
      setOpenStepMenu("");
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const getStatus = (stepId) => {
    if (stepId === activeSection) return "active";
    if (visitedSections.has(stepId)) return completedSections?.has(stepId) ? "done" : "visited";
    return "future";
  };

  const openFirstSubsection = (step) => {
    const first = step?.subsections?.[0];
    if (first && onJumpSub) onJumpSub(step.id, first.id);
    else onJump(step.id);
    setOpenStepMenu("");
  };

  const handleStepClick = (step) => {
    onJump(step.id);
    if (!step?.subsections?.length) { setOpenStepMenu(""); return; }
    if (openStepMenu === step.id) { openFirstSubsection(step); return; }
    setOpenStepMenu(step.id);
  };

  const handleHoverIn  = (step) => { if (!touchLikeNav && step?.subsections?.length) setOpenStepMenu(step.id); };
  const handleHoverOut = (step) => { if (!touchLikeNav) setOpenStepMenu((prev) => prev === step.id ? "" : prev); };

  return (
    <div ref={navRef} className="flex items-center w-full relative">
      {HEADER_STEPS.map((step, idx) => {
        const status = getStatus(step.id);
        const isLast = idx === HEADER_STEPS.length - 1;
        const hasSub = !!step.subsections?.length;
        let circleClass = "bg-white border border-slate-300 text-slate-400 group-hover:border-slate-400";
        if (status === "active")  circleClass = "bg-sky-500 border-2 border-sky-500 text-white shadow-lg shadow-sky-200 scale-110";
        else if (status === "done")    circleClass = "bg-white border-2 border-sky-500 text-sky-600";
        else if (status === "visited") circleClass = "bg-white border-2 border-sky-400 text-sky-500";

        return (
          <React.Fragment key={step.id}>
            <div className="flex-1 flex items-center relative last:flex-none">
              <div className="relative" onMouseEnter={() => handleHoverIn(step)} onMouseLeave={() => handleHoverOut(step)}>
                <button
                  onClick={() => handleStepClick(step)}
                  onDoubleClick={() => openFirstSubsection(step)}
                  className="group flex flex-col items-center gap-1 focus:outline-none z-10 relative"
                  title={hasSub ? "Click once for section menu, click again for first subsection" : "Go to section"}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${circleClass}`}>{idx + 1}</div>
                  <span className={`absolute top-9 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${status === "active" ? "text-sky-700" : status === "done" || status === "visited" ? "text-sky-500" : "text-slate-400"}`}>{step.label}</span>
                </button>
                {hasSub && openStepMenu === step.id && (
                  <div className="absolute left-1/2 top-12 z-[70] w-52 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">{step.label} sections</div>
                    <div className="max-h-56 overflow-y-auto custom-scroll space-y-1">
                      {step.subsections.map((sub, subIdx) => (
                        <button
                          key={`${step.id}-${sub.id}`}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); if (onJumpSub) onJumpSub(step.id, sub.id); else onJump(step.id); setOpenStepMenu(""); }}
                          className="w-full rounded-lg border border-slate-100 px-2 py-1.5 text-left text-[11px] font-semibold text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <span className="mr-1 text-[10px] text-slate-400">{subIdx + 1}.</span>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {!isLast && (
                <div className={`flex-1 h-[2px] mx-2 rounded transition-all duration-500 ${status === "visited" || status === "done" || status === "active" ? "bg-sky-400" : "bg-slate-200"}`} />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
