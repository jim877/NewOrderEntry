// @ts-nocheck
import React, { useMemo } from "react";
import { Droplet, Flame } from "lucide-react";

const MAX_SEVERITY = 3;
const valueMap = [0, 1, 2, 3];

const interpolateColor = (color1, color2, factor) => {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const f = clamp(factor);
  const toHex = (c) => {
    const h = Math.round(c).toString(16);
    return h.length === 1 ? `0${h}` : h;
  };
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  const r = r1 + f * (r2 - r1);
  const g = g1 + f * (g2 - g1);
  const b = b1 + f * (b2 - b1);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getSliderBackground = (value, start, end, disabled) => {
  if (disabled) return "#e5e7eb";
  const rawValue = Number(value || 0);
  const position = (rawValue / MAX_SEVERITY) * 100;
  const mappedValue = valueMap[rawValue] || 0;
  const factor = mappedValue / MAX_SEVERITY;
  const mid = interpolateColor(start, end, factor);
  return `linear-gradient(to right, ${start}, ${mid} ${position}%, #e5e7eb ${position}%)`;
};

const sliderClasses =
  "w-full h-1.5 rounded-full appearance-none outline-none transition-all";

const LOSS_SEVERITY_CONFIG = [
  {
    key: "fire",
    label: "Fire",
    border: "border-gradient-fire",
    colorStart: "#fef3c7",
    colorEnd: "#f97316",
    fields: ["Heat", "Soot", "Odor", "Extinguisher Powder", "Remediation Debris"],
  },
  {
    key: "water",
    label: "Water",
    border: "border-gradient-water",
    colorStart: "#dbeafe",
    colorEnd: "#3b82f6",
    fields: [
      "Water",
      "Humidity",
      "Musty Smell",
      "Visible Mildew",
      "Visible Mold",
      "Sprinkler Chemical",
      "Flood Cut Debris",
    ],
  },
];

const Slider = ({ value, onChange, colorStart, colorEnd, disabled }) => (
  <input
    type="range"
    min="0"
    max={MAX_SEVERITY}
    step="1"
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(Number(e.target.value))}
    className={sliderClasses}
    style={{ background: getSliderBackground(value, colorStart, colorEnd, disabled) }}
  />
);

export default function SdsDocument({ lossSeverity, onChange, onClose, rooms = [], orderTypes = [], severityCodes = [], claimNumber = "", address = "", selectedServices = [], customers = [], familyMedicalIssues = "", soapFragAllergies = "", sdsConsiderations = [], sdsObservations = [], sdsServices = [] }) {
  const docSeverity = lossSeverity || {};

  const visibleSections = useMemo(() => {
    return LOSS_SEVERITY_CONFIG.filter((section) => {
      const state = docSeverity[section.key] || { values: {} };
      const values = Object.values(state.values || {});
      const hasSeverity = values.some((v) => Number(v) >= 1);
      const typeSelected = orderTypes.length ? orderTypes.includes(section.label) : true;
      return hasSeverity && typeSelected;
    });
  }, [docSeverity, orderTypes]);

  const normalizeSeverity = (s) => String(s ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  const severityCodeForPeril = (peril) => {
    const entry = (severityCodes || []).find(c => (c || "").startsWith(peril === "fire" ? "Fire-" : "Water-"));
    if (!entry) return "";
    const level = Number(entry.split("-")[1] || 0);
    if (!level) return "";
    const letter = peril === "fire" ? "F" : "W";
    return `${letter}${Math.min(Math.max(level, 1), MAX_SEVERITY)}`;
  };

  const getPerils = () => {
    const picks = [];
    if (orderTypes.includes("Fire") && severityCodeForPeril("fire")) picks.push("fire");
    if (orderTypes.includes("Water") && severityCodeForPeril("water")) picks.push("water");
    return picks;
  };

  const severityColors = {
    W1: "#BAE6FD",
    W2: "#7DD3FC",
    W3: "#38BDF8",
    F1: "#FED7AA",
    F2: "#FDBA74",
    F3: "#FB923C",
    ORIGIN: "#1D4ED8",
  };

  const severityTint = (sev) => {
    const key = normalizeSeverity(sev);
    if (key.startsWith("W")) return "#E0F2FE";
    if (key.startsWith("F")) return "#FFEDD5";
    if (key === "ORIGIN") return "#DBEAFE";
    return "#FFFFFF";
  };

  const severityDotColor = (sev) => severityColors[normalizeSeverity(sev)] || "#94A3B8";

  const sortFloors = (a, b) => {
    const rank = (name) => {
      const lower = (name || "").toLowerCase();
      if (lower.includes("attic")) return 99;
      if (lower.includes("basement")) return 0;
      const match = lower.match(/(\d+)/);
      if (match) return Number(match[1]);
      return 50;
    };
    return rank(b.name) - rank(a.name);
  };

  const buildFloorsFromRooms = (sevCode) => {
    const byFloor = {};
    (rooms || []).forEach((room) => {
      const floor = room.floorLabel || "Unassigned";
      if (!byFloor[floor]) byFloor[floor] = { name: floor, rooms: [] };
      const affected = room.affected === true || (room.severitySelections || []).length > 0;
      byFloor[floor].rooms.push({
        name: room.name || "Room",
        affected,
        severity: affected ? sevCode : "none",
        origin: false
      });
    });
    return Object.values(byFloor)
      .map((floor) => {
        const anyAffected = floor.rooms.some(r => r.affected);
        return { ...floor, severity: anyAffected ? sevCode : "none" };
      })
      .sort(sortFloors);
  };

  const LossOverviewWidget = ({ peril }) => {
    const sevCode = severityCodeForPeril(peril);
    const floors = buildFloorsFromRooms(sevCode);
    if (!floors.length) return null;
    const perilLabel = peril === "fire" ? "Fire" : "Water";
    const Icon = peril === "fire" ? Flame : Droplet;
    return (
      <div className="w-full">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <RoofHeader peril={peril} addressText={address || "Address"} />
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Area</th>
                  <th className="px-4 py-2">Affected</th>
                  <th className="px-4 py-2">Peril</th>
                  <th className="px-4 py-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((floor) => (
                  <React.Fragment key={floor.name}>
                    <tr className="border-t border-slate-200" style={{ backgroundColor: severityTint(floor.severity) }}>
                      <td colSpan={4} className="px-4 py-2 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: severityDotColor(floor.severity) }} />
                          {floor.name}
                        </span>
                      </td>
                    </tr>
                    {floor.rooms.map((room) => {
                      const sevDisplay = room.severity || "";
                      return (
                        <tr key={`${floor.name}-${room.name}`} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-slate-700">— {room.name}</td>
                          <td className="px-4 py-2">
                            {room.affected ? (
                              <span className="inline-flex items-center gap-2 text-slate-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-700" /> Yes
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {room.affected ? (
                              <span className="inline-flex items-center gap-2 text-slate-700">
                                <Icon size={14} className={peril === "fire" ? "text-orange-500" : "text-sky-600"} />
                                {perilLabel}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {room.affected && sevDisplay ? (
                              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityDotColor(sevDisplay) }} />
                                {sevDisplay}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const showDustWidget = (orderTypes || []).some(t => String(t).toLowerCase().includes("dust"));
  const unpackingIcon = "/Gemini_Unpacking.png";
  const LOSS_ICON_MAP = {
    Fire: "/Gemini_Fireplace.png",
    Water: "/Copilot_Dust_Cloud.png",
    Mold: "/Gemini_Health_Concerns.png",
    "Dust/Debris": "/Copilot_Dust_Cloud.png",
    Puffback: "/Copilot_Puffback.png",
    Oil: "/Copilot_Oil.png",
  };
  const SERVICE_ICON_MAP = {
    Unpacking: "/Gemini_Unpacking.png",
    "Photo Inventory": "/Gemini_Photo_Inventory.png",
    "Fiber Protection": "/Gemini_Fiber_Protection.png",
    "Premium Brands": "/Gemini_Premium_Brands.png",
    "Anti-Microbial": "/Gemini_Anti_Microbial.png",
    "Fold ASAP": "/Gemini_Fold_AMAP.png"
  };
  const SDS_ICON_MAP = {
    "Elderly": "/Gemini_Elderly.png",
    "Pregnancy": "/Gemini_Pregnancy.png",
    "Baby": "/Gemini_Baby.png",
    "Needs Assistance": "/Gemini_Needs_Assistance.png",
    "Premium Brands": "/Gemini_Premium_Brands.png",
    "Skin Sensitivity": "/Gemini_Skin_Sensitivity.png",
    "Pets": "/Gemini_Pets.png",
    "Fireplace": "/Gemini_Fireplace.png",
    "Insects": "/Gemini_Generated_Image_n42bx9n42bx9n42b.png",
    "Moth Damage": "/Gemini_Moth_Holes.png",
    "Sun Damage": "/Gemini_Generated_Image_bvveb5bvveb5bvve.png",
    "Smoking": "/Gemini_Smoking.png",
    "Fold as Much as Possible": "/Gemini_Fold_AMAP.png",
    "Re-Hanging": "/Gemini_Generated_Image_jnzpynjnzpynjnzp.png",
    "Photo Inventory": "/Gemini_Photo_Inventory.png",
    "Unpacking": "/Gemini_Unpacking.png",
    "Anti-Microbial": "/Gemini_Anti_Microbial.png",
    "Drying Needed": "/Gemini_Generated_Image_tydpketydpketydp.png",
    "Disposal": "/Gemini_Generated_Image_b58khsb58khsb58k.png",
    "Fiber Protection": "/Gemini_Fiber_Protection.png",
    "Moving": "/Gemini_Generated_Image_wqmls4wqmls4wqml.png",
    "Rolling Racks": "/Gemini_Generated_Image_bxkqrbxkqrbxkqrb.png",
  };
  const TILE_SIZE = "2in";

  const ServiceRequestsWidget = () => (
    <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden" style={{ width: TILE_SIZE, height: TILE_SIZE }}>
          <img
            src={unpackingIcon}
            alt="Unpacking"
            className="h-full w-full object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Unpacking</div>
          <div className="text-xs text-slate-500">Dust order request</div>
        </div>
    </div>
  );

  const LossTypeIconsWidget = () => {
    const active = (orderTypes || []).filter(t => LOSS_ICON_MAP[t]);
    if (!active.length) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {active.map(type => (
          <div key={type} className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden" style={{ width: TILE_SIZE, height: TILE_SIZE }}>
              <img src={LOSS_ICON_MAP[type]} alt={type} className="h-full w-full object-contain" />
            </div>
            <div className="text-[11px] font-semibold text-slate-600">{type}</div>
          </div>
        ))}
      </div>
    );
  };

  const SdsIconSelectionsWidget = () => {
    const mergedServices = Array.from(new Set([...(sdsServices || []), ...(selectedServices || [])]));
    const hasAny = (sdsConsiderations || []).length || (sdsObservations || []).length || mergedServices.length;
    if (!hasAny) return null;
    const renderGroup = (title, items) => {
      if (!items || !items.length) return null;
      return (
        <div>
          <div className="text-xs font-bold text-slate-500 mb-2">{title}</div>
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <div key={item} className="flex flex-col items-center gap-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden" style={{ width: TILE_SIZE, height: TILE_SIZE }}>
                  <img src={SDS_ICON_MAP[item] || "/Icons_Copilot.png"} alt={item} className="h-full w-full object-contain" />
                </div>
                <div className="text-[11px] font-semibold text-slate-600 text-center max-w-[120px]">{item}</div>
              </div>
            ))}
          </div>
        </div>
      );
    };
    return (
      <div className="space-y-3">
        {renderGroup("Considerations", sdsConsiderations)}
        {renderGroup("Observations", sdsObservations)}
        {renderGroup("Services Requested", mergedServices)}
      </div>
    );
  };

  const SpecialConsiderationsWidget = () => {
    const collected = new Set();
    (customers || []).forEach(c => {
      (c.quickNotes || []).forEach(n => collected.add(n));
      if ((c.householdAnimals || "").trim()) collected.add("Pets");
      if (c.doNotContact) collected.add("Do Not Contact");
    });
    if (familyMedicalIssues === "Y") collected.add("Medical Issues");
    if (soapFragAllergies === "Y") collected.add("Skin Sensitivity");
    const items = Array.from(collected);
    if (!items.length) return null;
    const ICON_MAP = {
      "Elderly": "/Gemini_Elderly.png",
      "Hearing Impaired": "/Gemini_Needs_Assistance.png",
      "Spanish Only": "/Gemini_Needs_Assistance.png",
      "Medical Issues": "/Gemini_Health_Concerns.png",
      "Skin Sensitivity": "/Gemini_Skin_Sensitivity.png",
      "Pets": "/Gemini_Pets.png",
      "Do Not Contact": "/Gemini_Needs_Assistance.png"
    };
    return (
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item} className="flex flex-col items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden" style={{ width: TILE_SIZE, height: TILE_SIZE }}>
              {ICON_MAP[item] ? (
                <img src={ICON_MAP[item]} alt={item} className="h-full w-full object-contain" />
              ) : (
                <div className="text-xs font-semibold text-slate-500 px-2 text-center">{item}</div>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-600">{item}</div>
          </div>
        ))}
      </div>
    );
  };

  const hasLossIcons = (orderTypes || []).some(t => LOSS_ICON_MAP[t]);
  const hasSdsIconSelections =
    (sdsConsiderations || []).length > 0 ||
    (sdsObservations || []).length > 0 ||
    (sdsServices || []).length > 0 ||
    (selectedServices || []).length > 0;
  const hasSpecialConsiderations = (() => {
    const collected = new Set();
    (customers || []).forEach(c => {
      (c.quickNotes || []).forEach(n => collected.add(n));
      if ((c.householdAnimals || "").trim()) collected.add("Pets");
      if (c.doNotContact) collected.add("Do Not Contact");
    });
    if (familyMedicalIssues === "Y") collected.add("Medical Issues");
    if (soapFragAllergies === "Y") collected.add("Skin Sensitivity");
    return collected.size > 0;
  })();

  const WidgetSection = ({ title, subtitle, children, className }) => (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className || ""}`}>
      <div className="flex flex-col gap-1 mb-3">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      </div>
      {children}
    </div>
  );

  const updateSeverity = (sectionKey, field, value) => {
    const section = docSeverity[sectionKey] || { enabled: true, values: {} };
    const next = {
      ...docSeverity,
      [sectionKey]: {
        ...section,
        values: { ...(section.values || {}), [field]: value },
      },
      touched: true,
    };
    onChange?.(next);
  };

  const toggleSection = (sectionKey) => {
    const section = docSeverity[sectionKey] || { enabled: true, values: {} };
    const next = {
      ...docSeverity,
      [sectionKey]: { ...section, enabled: !section.enabled },
      touched: true,
    };
    onChange?.(next);
  };

  const RoofHeader = ({ peril, addressText }) => {
    const Icon = peril === "fire" ? Flame : Droplet;
    return (
      <div className="w-full">
        <svg viewBox="0 0 700 110" className="block h-[90px] w-full">
          <polygon points="5,100 695,100 350,12" fill="#E5E7EB" stroke="#CBD5E1" />
          <rect x="540" y="36" width="26" height="30" fill="#D6D3D1" stroke="#A8A29E" />
          <rect x="536" y="32" width="34" height="6" fill="#A8A29E" stroke="#78716C" />
          <g>
            <rect x="180" y="56" width="340" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
            <text x="350" y="81" textAnchor="middle" fontSize="20" fill="#0F172A" fontWeight="700">
              {addressText || "Address"}
            </text>
          </g>
          <g>
            <circle cx="350" cy="16" r="10" fill="#FFFFFF" stroke="#CBD5E1" />
          </g>
        </svg>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 -mt-6">
          <Icon size={14} className={peril === "fire" ? "text-orange-500" : "text-sky-600"} />
          <span className="capitalize">{peril}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <style>{`
        .border-gradient-fire {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, linear-gradient(to right, #fb923c, #ef4444) border-box;
        }
        .border-gradient-water {
          border: 2px solid transparent;
          background: linear-gradient(white, white) padding-box, linear-gradient(to right, #7dd3fc, #a855f7) border-box;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border: 2px solid #9ca3af;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ffffff;
          border: 2px solid #9ca3af;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="range"]:disabled::-webkit-slider-thumb {
          background-color: #f3f4f6;
          border-color: #d1d5db;
          cursor: not-allowed;
          box-shadow: none;
        }
        @page {
          size: letter portrait;
          margin: 0.65in;
        }
        @media print {
          body { background: #fff; }
          .print-hidden { display: none !important; }
          .print-container { box-shadow: none !important; border: none !important; }
          .print-page { page-break-after: always; }
          .print-avoid { break-inside: avoid; }
          .print-scroll { max-height: none !important; overflow: visible !important; }
        }
      `}</style>

      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 print-container print-scroll">
        <div className="bg-sky-500 px-6 py-4 flex items-center justify-between print-hidden">
          <div>
            <h3 className="text-xl font-bold text-white">SDS Document</h3>
            <div className="text-sm text-sky-100">Loss Severity Widget</div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
              onClick={() => window.print()}
            >
              Print / PDF
            </button>
            <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-50 space-y-8">
          <WidgetSection title="Loss Severity">
            <div className="mb-4 pt-2 pb-3 border-b border-slate-200/60">
              <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Severity Scale</span>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-full">Score 0 — 3</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center text-xs font-bold text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-slate-300 mr-2 border border-white shadow-sm"></div>
                  <span>0: None</span>
                </div>
                <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-600 rounded-full opacity-30"></div>
                <div className="flex items-center text-xs font-bold text-slate-600 text-right">
                  <span>3: Extreme</span>
                  <div className="w-3 h-3 rounded-full bg-slate-700 ml-2 border border-white shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-sm print-avoid">
              {visibleSections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
                  No loss severity has been recorded yet.
                </div>
              ) : (
                <div className={`grid gap-4 ${visibleSections.length > 1 ? "md:grid-cols-2" : ""}`}>
                  {visibleSections.map(section => {
                  const state = docSeverity[section.key] || { enabled: false, values: {} };
                  return (
                    <div key={section.key} className={`p-4 rounded-2xl transition-all duration-300 ${section.border}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-base font-bold text-slate-800">{section.label}</h2>
                        <button
                          className={`h-6 w-6 rounded-md border-2 flex items-center justify-center text-[10px] font-bold ${state.enabled ? "bg-sky-500 border-sky-500 text-white" : "bg-white border-slate-400 text-slate-600"}`}
                          onClick={() => toggleSection(section.key)}
                          title={state.enabled ? "Disable" : "Enable"}
                        >
                          ✓
                        </button>
                      </div>
                      <div className="space-y-4">
                        {section.fields.map(field => (
                          <div key={field} className="slider-container" data-color-start={section.colorStart} data-color-end={section.colorEnd}>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">{field}</label>
                            <Slider
                              value={state.values?.[field] ?? 0}
                              disabled={!state.enabled}
                              colorStart={section.colorStart}
                              colorEnd={section.colorEnd}
                              onChange={(val) => updateSeverity(section.key, field, val)}
                            />
                            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1 px-1">
                              <span>0</span><span>1</span><span>2</span><span>3</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          </WidgetSection>

          {getPerils().length > 0 && (
            <div className="space-y-6">
              {getPerils().map((peril) => {
                const perilLabel = peril === "fire" ? "Fire" : "Water";
                const subtitle = claimNumber
                  ? `Loss Type: ${perilLabel} · Claim #: ${claimNumber}`
                  : `Loss Type: ${perilLabel}`;
                return (
                  <div key={peril} className="print-page">
                    <WidgetSection title="Home Loss Visualization" subtitle={subtitle}>
                      <LossOverviewWidget peril={peril} />
                    </WidgetSection>
                  </div>
                );
              })}
            </div>
          )}
          {(hasLossIcons || hasSpecialConsiderations || hasSdsIconSelections) && (
            <div className="space-y-6 print-page">
              {hasLossIcons && (
                <WidgetSection title="Loss Type">
                  <LossTypeIconsWidget />
                </WidgetSection>
              )}
              {hasSdsIconSelections && (
                <WidgetSection title="SDS Icons">
                  <SdsIconSelectionsWidget />
                </WidgetSection>
              )}
              {hasSpecialConsiderations && (
                <WidgetSection title="Special Considerations">
                  <SpecialConsiderationsWidget />
                </WidgetSection>
              )}
            </div>
          )}
          {showDustWidget && (
            <div className="space-y-6 print-page">
              <WidgetSection title="Service Requests">
                <ServiceRequestsWidget />
              </WidgetSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
