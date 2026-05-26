// @ts-nocheck
import React, { useState } from "react";
import { AI_USAGE_GUIDELINES, AI_TIME_SAVING_TIPS } from "../../config";

// StartScreen — entry-mode picker shown on first load. Three options: Quick, Detailed, Scope/SDS.
// Calls `onSelect('quick'|'detailed'|'scope'|'sds-preview')` when the user picks.
export const StartScreen = ({ onSelect }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 fade-in scale-in">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">New Order Entry</h1>
        <p className="text-lg text-slate-500">How much detail do you have right now?</p>
        <p className="mt-2 text-sm text-slate-400">You can switch between modes at any time — nothing is lost.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <button onClick={() => onSelect("quick")} className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-300">
          <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">⚡</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Quick Entry</h2>
          <p className="text-center text-slate-500 text-sm">Get it on the calendar fast. Name, address, date — just the essentials.</p>
          <div className="mt-4 text-xs text-slate-400 text-center">Best for: sales reps, leads, partial info, mobile</div>
          <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Fast →</div>
        </button>

        <button onClick={() => onSelect("detailed")} className="group relative flex flex-col items-center p-10 rounded-3xl bg-white border-2 border-sky-200 shadow-xl hover:shadow-2xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">Most Common</div>
          <div className="h-20 w-20 mb-6 rounded-full bg-sky-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📝</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Detailed Entry</h2>
          <p className="text-center text-slate-500 text-sm">Guided workflow for the full order. Insurance, billing, conditions, contacts, scope — a complete interview.</p>
          <div className="mt-4 text-xs text-slate-400 text-center">Best for: office team, live conversations, computer</div>
          <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 font-bold text-sm">Start Detailed →</div>
        </button>

        <div className="flex flex-col items-center p-10 rounded-3xl bg-white border-2 border-blue-200 shadow-xl">
          <div className="h-20 w-20 mb-6 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden"><img src="/Scope_Icon.svg" alt="Scope" className="h-14 w-14" /></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Scope & SDS</h2>
          <p className="text-center text-slate-500 text-sm mb-2">Room-by-room scope for pack-out instructions or photo documentation.</p>
          <div className="mt-2 text-xs text-slate-400 text-center mb-5">Best for: on-site at the home, field work</div>
          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => onSelect("scope")} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md">
              Start Scope
              <div className="text-[10px] font-normal text-blue-200 mt-0.5">Room-by-room walkthrough with photo tagging</div>
            </button>
            <button onClick={() => onSelect("sds-preview")} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 transition-all">
              SDS Document
              <div className="text-[10px] font-normal text-slate-400 mt-0.5">Generate the Same Day Service PDF</div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-10">
        <button type="button" onClick={() => setShowGuidelines((v) => !v)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-600">
          Usage guidelines {showGuidelines ? "▾" : "▸"}
        </button>
      </div>
      {showGuidelines && (
        <div className="mt-4 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-widest text-sky-600">AI App Usage Guidelines</div>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_USAGE_GUIDELINES.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <div className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-500">Additional Time-Saving Tips</div>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-700">
            {AI_TIME_SAVING_TIPS.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
