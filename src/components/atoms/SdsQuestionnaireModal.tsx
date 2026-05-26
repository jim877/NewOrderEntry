// @ts-nocheck
import React from "react";
import { SERVICE_OFFERINGS } from "../../config";

type Props = {
  serviceOfferings: string[];
  tliScope: string;
  setServiceOfferings: (next: string[]) => void;
  setTliScope: (next: string) => void;
  onCancel: () => void;
  onGenerate: () => void;
};

const PICKUP_OPTIONS = ["Contents", "Furniture", "Rugs", "Textiles", "Art", "Appliance", "Hand Clean"];
const INHOME_OPTIONS = ["Consulting", "Expert Stain Removal", "Hand Clean"];
const TLI_OPTIONS = [
  { id: "tli-writing", label: "Yes — We Are Writing" },
  { id: "tli-not-writing", label: "Yes — We Are Not Writing" },
  { id: "tli-no", label: "No" },
];

// Small toggle helper — shared chip styling across all four question groups.
const Chip = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${active ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}>{label}</button>
);

// SdsQuestionnaireModal — pre-flight "Before Generating SDS" sheet. Four
// quick questions confirm the scope to bake into the SDS doc:
//   Q1 picking up?            (writes serviceOfferings: Contents/Furniture/Rugs/...)
//   Q2 cleaning in home?      (writes serviceOfferings: Consulting/Expert Stain Removal/Hand Clean)
//   Q3 total loss items?      (writes tliScope; auto-adds "TLI" to serviceOfferings when Yes)
//   Q4 special services?      (writes serviceOfferings — full picker)
// Footer: Cancel / Generate SDS.
export const SdsQuestionnaireModal = ({
  serviceOfferings, tliScope, setServiceOfferings, setTliScope, onCancel, onGenerate,
}: Props) => {
  const toggleOffering = (s: string) =>
    setServiceOfferings(serviceOfferings.includes(s) ? serviceOfferings.filter((x) => x !== s) : [...serviceOfferings, s]);

  return (
    <div className="fixed inset-0 z-[195] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-sky-600 px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Before Generating SDS</h3>
          <button onClick={onCancel} className="text-white/70 hover:text-white text-lg font-bold">×</button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-sm text-slate-500">Confirm scope details to include in the document.</div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700">Will we be picking anything up?</div>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_OFFERINGS.filter((s) => PICKUP_OPTIONS.includes(s)).map((s) => (
                <Chip key={s} active={serviceOfferings.includes(s)} label={s} onClick={() => toggleOffering(s)} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700">Will we be cleaning anything in the home?</div>
            <div className="flex flex-wrap gap-1.5">
              {INHOME_OPTIONS.map((s) => (
                <Chip key={s} active={serviceOfferings.includes(s)} label={s} onClick={() => toggleOffering(s)} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700">Are there any total loss items?</div>
            <div className="flex gap-2">
              {TLI_OPTIONS.map((opt) => {
                const isOn = tliScope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTliScope(isOn ? "" : opt.id);
                      // When picking a "yes" option, auto-add TLI as an offering if missing.
                      if (opt.id !== "tli-no" && !isOn && !serviceOfferings.includes("TLI")) {
                        setServiceOfferings([...serviceOfferings, "TLI"]);
                      }
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold flex-1 ${isOn ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500"}`}
                  >{opt.label}</button>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700">Any special services required?</div>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_OFFERINGS.map((s) => (
                <Chip key={s} active={serviceOfferings.includes(s)} label={s} onClick={() => toggleOffering(s)} />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-5 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
          <button onClick={onGenerate} className="rounded-lg bg-sky-600 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-700">Generate SDS</button>
        </div>
      </div>
    </div>
  );
};
