// @ts-nocheck
import React from "react";

// Inline SVG fallbacks used when the per-property-type PNG (under public/icons)
// fails to load. Kept here so the icon component is fully self-contained.
const svgFallbacks: Record<string, React.ReactNode> = {
  trailer:    <svg viewBox="0 0 48 48" className="w-14 h-14"><rect x="4" y="20" width="40" height="14" rx="2.5" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="24" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="18" y="24" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="34" y="24" width="6" height="7" rx="1" fill="currentColor" opacity=".3"/></svg>,
  house:      <svg viewBox="0 0 48 48" className="w-14 h-14"><path d="M24 8L6 24h5v16h10v-10h6v10h10V24h5L24 8z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  largehouse: <svg viewBox="0 0 64 48" className="w-14 h-14"><path d="M28 6L6 22h4v18h36V22h4L28 6z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="42" y="22" width="16" height="18" rx="1.5" fill="currentColor" opacity=".12" stroke="currentColor" strokeWidth="1.5"/></svg>,
  estate:     <svg viewBox="0 0 72 48" className="w-14 h-14"><rect x="2" y="32" width="3" height="14" rx=".5" fill="currentColor" opacity=".5"/><rect x="67" y="32" width="3" height="14" rx=".5" fill="currentColor" opacity=".5"/><path d="M5 35h10M5 38h10M5 41h10M57 35h10M57 38h10M57 41h10" stroke="currentColor" strokeWidth="1.2" opacity=".35"/><path d="M36 4L14 20h4v18h36V20h4L36 4z" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  townhouse:  <svg viewBox="0 0 48 48" className="w-14 h-14"><path d="M12 18L5 25v17h14V25L12 18z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M24 14l-7 7v21h14V21l-7-7z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M36 18l-7 7v17h14V25l-7-7z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  lowrise:    <svg viewBox="0 0 48 48" className="w-14 h-14"><rect x="8" y="14" width="32" height="28" rx="2.5" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="19" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/><rect x="28" y="19" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/><rect x="14" y="29" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/><rect x="28" y="29" width="5" height="5" rx="1" fill="currentColor" opacity=".4"/></svg>,
  highrise:   <svg viewBox="0 0 48 48" className="w-14 h-14"><rect x="12" y="4" width="24" height="38" rx="2.5" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5"/><rect x="17" y="9" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="27" y="9" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="17" y="16" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="27" y="16" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="17" y="23" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="27" y="23" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="17" y="30" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/><rect x="27" y="30" width="4" height="4" rx=".5" fill="currentColor" opacity=".4"/></svg>,
  storefront: <svg viewBox="0 0 48 48" className="w-14 h-14"><rect x="4" y="16" width="40" height="26" rx="2.5" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5"/><path d="M4 16l5-10h30l5 10" fill="currentColor" opacity=".1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><rect x="10" y="26" width="12" height="12" rx="1" fill="currentColor" opacity=".3"/><rect x="28" y="26" width="10" height="16" rx="1" fill="currentColor" opacity=".25"/></svg>,
  commercial: <svg viewBox="0 0 48 48" className="w-14 h-14"><rect x="4" y="8" width="40" height="34" rx="2.5" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="14" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="21" y="14" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="32" y="14" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="10" y="24" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="21" y="24" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/><rect x="32" y="24" width="6" height="5" rx="1" fill="currentColor" opacity=".35"/></svg>,
};

// Per-property-type icon size (PNG natural size differs across the set; these
// values look optically centered inside the 70px tile).
const sizes: Record<string, number> = {
  trailer: 150, house: 125, largehouse: 118, estate: 118,
  townhouse: 120, lowrise: 120, highrise: 125, storefront: 120, commercial: 118,
};

// Per-property-type vertical nudge — some icons have baked-in whitespace and
// need a downward shift to look centered against the others.
const nudge: Record<string, number> = {
  trailer: 0, house: 20, largehouse: 20, estate: 0,
  townhouse: 20, lowrise: 20, highrise: 20, storefront: 15, commercial: 12,
};

// BuildingIcon — renders /icons/<id>.png at the tuned size/nudge for that
// property type, with the inline SVG above as fallback if the PNG 404s.
export const BuildingIcon = ({ id }: { id: string }) => {
  const [imgError, setImgError] = React.useState(false);
  if (imgError) return <>{svgFallbacks[id] || null}</>;
  const sz = sizes[id] || 125;
  return (
    <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: 70 }}>
      <img
        src={`/icons/${id}.png`}
        alt={id}
        className="max-w-none"
        style={{ width: sz, height: sz, objectFit: "contain", marginTop: nudge[id] || 0 }}
        onError={() => setImgError(true)}
      />
    </div>
  );
};
