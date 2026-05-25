// @ts-nocheck
// Step 2 of the Rush Guide — family composition counters + interest pills.
// Pure presentation atom: takes the current family/interests slice + the
// setRushGuideData updater + the back/next step handlers. Owns no state.

import React from "react";
import { RUSH_INTERESTS } from "../../config";

type Family = { adults: number; kids: number; babies: number; pets: number };

type Props = {
  family: Family;
  interests: string[];
  setRushGuideData: (updater: (prev: any) => any) => void;
  onBack: () => void;
  onNext: () => void;
};

const COUNTER_FIELDS: { id: keyof Family; label: string }[] = [
  { id: "adults", label: "Adults" },
  { id: "kids", label: "Children" },
  { id: "babies", label: "Babies/Toddlers" },
  { id: "pets", label: "Pets" },
];

export const RushGuideFamilyStep: React.FC<Props> = ({
  family,
  interests,
  setRushGuideData,
  onBack,
  onNext,
}) => {
  const setFamily = (id: keyof Family, value: number) =>
    setRushGuideData((p) => ({ ...p, family: { ...family, [id]: Math.max(0, value) } }));

  const toggleInterest = (id: string, active: boolean) =>
    setRushGuideData((p) => ({
      ...p,
      interests: active ? (p.interests || []).filter((x: string) => x !== id) : [...(p.interests || []), id],
    }));

  return (
    <>
      <div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 mb-2">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Step 2: Family & Lifestyle</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {COUNTER_FIELDS.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
          >
            <span className="text-sm font-bold text-slate-700">{t.label}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFamily(t.id, family[t.id] - 1)}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm"
              >
                -
              </button>
              <span className="w-4 text-center font-bold">{family[t.id]}</span>
              <button
                onClick={() => setFamily(t.id, family[t.id] + 1)}
                className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Activities &amp; Interests
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RUSH_INTERESTS.map((i: any) => {
            const active = (interests || []).includes(i.id);
            return (
              <button
                key={i.id}
                onClick={() => toggleInterest(i.id, active)}
                className={`p-3 rounded-xl border text-center ${
                  active ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className={`text-xs font-bold ${active ? "text-teal-800" : "text-slate-700"}`}>
                  {i.label}
                </div>
                <div className="text-[9px] text-slate-500">{i.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={onNext}
          className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          Next →
        </button>
      </div>
    </>
  );
};
