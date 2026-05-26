// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Input } from "./Input";
import { ToggleGroup } from "./ToggleGroup";

const BUILDING_TYPES = [
  { id: "trailer", label: "Trailer" }, { id: "house", label: "House" }, { id: "largehouse", label: "Large House" },
  { id: "estate", label: "Estate" }, { id: "townhouse", label: "Townhome" }, { id: "lowrise", label: "Low-Rise" },
  { id: "highrise", label: "High-Rise" }, { id: "storefront", label: "Storefront" }, { id: "commercial", label: "Commercial" },
];

// AddressPropertyDetails — collapsible "Property Details" card.
// Holds verify status, lat/lng, rent-or-own (primary only), and building info (primary only).
// `coordsOpen` is controlled by the parent so it can be auto-opened on demand.
export const AddressPropertyDetails = ({
  addr, updateAddr, index, auditOn, highlightMissing, onVerify, coordsOpen, setCoordsOpen,
  rentOrOwn, rentCoverageLimit, onRentOrOwnChange, onRentCoverageChange,
}) => {
  const verified = !!addr.lat && !!addr.lng;
  const filledCount = [addr.lat, addr.lng, (addr as any).buildingType, addr.beds, addr.sqft, (addr as any).buildingFloors, addr.apt].filter((f) => f && String(f).trim()).length;
  const totalFields = 7;
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={() => setCoordsOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Details</span>
          {filledCount > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filledCount >= 5 ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{filledCount}/{totalFields}</span>}
        </div>
        <span className={`text-slate-400 text-xs transition-transform ${coordsOpen ? "rotate-90" : ""}`}>›</span>
      </button>
      {coordsOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${verified ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-sm text-slate-700">{verified ? "Address verified" : "Verify address"}</span>
            </div>
            <button onClick={() => onVerify?.(addr.id)} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold text-sky-700 hover:bg-sky-100">Verify</button>
          </div>
          {index === 0 && (<><span data-audit-key="addrLat" className="block h-[1px] w-[1px] opacity-0" /><span data-audit-key="addrLng" className="block h-[1px] w-[1px] opacity-0" /></>)}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude"><Input className={index === 0 && auditOn && highlightMissing?.addrLat ? "audit-missing" : ""} value={addr.lat} onChange={(e) => updateAddr(addr.id, { lat: e.target.value })} placeholder="e.g. 40.8874" /></Field>
            <Field label="Longitude"><Input className={index === 0 && auditOn && highlightMissing?.addrLng ? "audit-missing" : ""} value={addr.lng} onChange={(e) => updateAddr(addr.id, { lng: e.target.value })} placeholder="e.g. -74.0291" /></Field>
          </div>
          {index === 0 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
              <span className="text-sm text-slate-700">Rent or own?</span>
              <ToggleGroup options={["Rent", "Own"]} value={rentOrOwn} onChange={onRentOrOwnChange} />
            </div>
          )}
          {index === 0 && rentOrOwn === "Rent" && (
            <div className="rounded-lg border border-orange-300 bg-orange-50 p-3">
              <div className="text-sm font-bold text-orange-800 mb-2">Confirm Coverage</div>
              <Input data-audit-key="rentCoverageLimit" className={auditOn && highlightMissing?.rentCoverageLimit ? "audit-missing" : ""} value={rentCoverageLimit || ""} onChange={(e) => onRentCoverageChange(e.target.value)} placeholder="Coverage amount ($)" />
            </div>
          )}
          {index === 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Building Info</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Building Type">
                  <div className="flex flex-wrap gap-1.5">
                    {BUILDING_TYPES.map((bt) => (
                      <button key={bt.id} type="button" onClick={() => updateAddr(addr.id, { buildingType: bt.id })} className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-[12px] font-bold transition-all ${(addr as any).buildingType === bt.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        <img src={`/icons/${bt.id}.png`} alt={bt.label} className="w-8 h-8 object-contain" />
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Unit / Suite"><Input value={addr.apt || ""} onChange={(e) => updateAddr(addr.id, { apt: e.target.value })} placeholder="e.g. 4B, Suite 200" /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Floors"><Input inputMode="numeric" value={(addr as any).buildingFloors || ""} onChange={(e) => updateAddr(addr.id, { buildingFloors: e.target.value ? Number(e.target.value) : "" })} placeholder="e.g. 2" /></Field>
                <Field label="Bedrooms"><Input inputMode="numeric" value={addr.beds || ""} onChange={(e) => updateAddr(addr.id, { beds: e.target.value })} placeholder="e.g. 3" /></Field>
                <Field label="Sq Ft"><Input inputMode="numeric" value={addr.sqft || ""} onChange={(e) => updateAddr(addr.id, { sqft: e.target.value })} placeholder="e.g. 2400" /></Field>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
