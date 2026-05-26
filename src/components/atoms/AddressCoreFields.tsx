// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";
import { SearchSelect } from "./SearchSelect";
import { useCurrentLocation } from "../../utils/order";
import { STATES } from "../../config";

// Demo address search results — prototype Google Places stand-in.
const DEMO_RESULTS = [
  { street: "148 Amsterdam Ave", city: "Hawthorne", state: "NY", zip: "10532", display: "148 Amsterdam Ave, Hawthorne, NY 10532" },
  { street: "25 Main St",        city: "Bloomingdale", state: "NJ", zip: "07403", display: "25 Main St, Bloomingdale, NJ 07403" },
  { street: "1616 Springfield Ave", city: "Pennsauken", state: "NJ", zip: "08110", display: "1616 Springfield Ave, Pennsauken, NJ 08110" },
  { street: "17 Wausau St",      city: "Ogdensburg", state: "NJ", zip: "07439", display: "17 Wausau St, Ogdensburg, NJ 07439" },
  { street: "42 Park Ave",       apt: "4B", city: "New York", state: "NY", zip: "10016", display: "42 Park Ave #4B, New York, NY 10016" },
];

const ADDRESS_TYPES = ["Primary","Business","Neighbor","Hotel","Rental","Secondary Home","Temporary","Moving","Relative","Storage Facility","Other"];

// AddressCoreFields — search-from-Google + map preview + street/apt/city/state/zip + type/note.
// Always-visible part of an open address card.
export const AddressCoreFields = ({ addr, updateAddr, index, auditOn, highlightMissing, typeSelectRef, setToast }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
    <SearchSelect
      value=""
      onChange={(v) => {
        const match = DEMO_RESULTS.find((r) => r.display === v);
        if (match) updateAddr(addr.id, { street: match.street, apt: match.apt || "", city: match.city, state: match.state, zip: match.zip, lat: "40.0", lng: "-74.0" });
      }}
      options={DEMO_RESULTS.map((r) => ({ label: r.display, value: r.display, type: "address" }))}
      placeholder="🔍  Find address on Google..."
      clearOnCommit
      maxResults={5}
      autoComplete="off"
      className="google-address-search !border-sky-300 !rounded-lg !py-3 !shadow-none !ring-0"
    />
    <button
      type="button"
      onClick={() => useCurrentLocation(
        (coords) => updateAddr(addr.id, { lat: String(coords.lat), lng: String(coords.lng) }),
        (msg) => setToast?.(`Location error: ${msg}`),
      )}
      className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-600 hover:bg-sky-100 flex items-center gap-1.5 w-fit"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
      Use Current Location
    </button>
    {addr.street && (
      <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mt-2">
        <iframe title="Map" width="100%" height="140" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent([addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(", "))}&zoom=16`} allowFullScreen />
      </div>
    )}
    <div className="grid grid-cols-4 gap-3">
      <div className="col-span-3"><Field label="Street"><Input data-audit-key="addrStreet" className={index === 0 && auditOn && highlightMissing?.addrStreet ? "audit-missing" : ""} value={addr.street} onChange={(e) => updateAddr(addr.id, { street: e.target.value })} /></Field></div>
      <div className="col-span-1"><Field label="Apt / Unit"><Input value={addr.apt} onChange={(e) => updateAddr(addr.id, { apt: e.target.value })} placeholder="Apt #" /></Field></div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Field label="City"><Input data-audit-key="addrCity" className={index === 0 && auditOn && highlightMissing?.addrCity ? "audit-missing" : ""} value={addr.city} onChange={(e) => updateAddr(addr.id, { city: e.target.value })} /></Field>
      <Field label="State"><SearchSelect value={addr.state} onChange={(v) => updateAddr(addr.id, { state: v })} options={STATES} placeholder="State" className={index === 0 && auditOn && highlightMissing?.addrState ? "audit-missing" : ""} maxResults={STATES.length} uppercase /></Field>
      <Field label="Zip"><Input data-audit-key="addrZip" className={index === 0 && auditOn && highlightMissing?.addrZip ? "audit-missing" : ""} value={addr.zip} onChange={(e) => updateAddr(addr.id, { zip: e.target.value })} inputMode="numeric" /></Field>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Field label="Address Type">
        <Select ref={typeSelectRef} value={addr.type || ""} onChange={(e) => updateAddr(addr.id, { type: e.target.value })}>
          <option value="">Select type...</option>
          {ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <Field label="Address Note"><Input value={addr.note || ""} onChange={(e) => updateAddr(addr.id, { note: e.target.value })} placeholder="e.g. Long driveway on left, gate code 1234" /></Field>
    </div>
  </div>
);
