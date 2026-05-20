// @ts-nocheck
import React, { useEffect, useRef, useCallback, useState } from "react";

const ROLE_OPTIONS = [
  { id: "insurance", label: "Insurance Carrier" },
  { id: "billing",   label: "Billing Company" },
  { id: "national",  label: "National Carrier" },
  { id: "adjuster",  label: "Adjuster" },
];

// SuggestedRolesModal — overlay shown after picking a referrer that has known roles.
// Positions itself near the anchor field, traps focus, hides body scroll while open.
// On apply: ensures referrer is committed, then calls onApply(selectedIds).
export const SuggestedRolesModal = ({
  show, onClose, anchorRef, suggestedSelection, setSuggestedSelection,
  ensureReferrerFromQuery, onApply, data,
}) => {
  const cardRef = useRef(null);
  const [offsetTop, setOffsetTop] = useState(72);

  const updateOffset = useCallback(() => {
    if (!show) return;
    const visualViewport = window.visualViewport;
    const viewportTop = visualViewport?.offsetTop || 0;
    const viewportHeight = visualViewport?.height || window.innerHeight || 0;
    const viewportBottom = viewportTop + viewportHeight;
    const minTop = viewportTop + 16;
    const anchorRect = anchorRef?.current?.getBoundingClientRect();
    const anchorTop = anchorRect ? anchorRect.top + viewportTop : minTop;
    const anchorBottom = anchorRect ? anchorRect.bottom + viewportTop : minTop;
    const modalHeight = cardRef.current?.offsetHeight || Math.min(520, Math.max(280, viewportHeight - 32));
    const preferredBelow = anchorBottom + 8;
    const preferredAbove = anchorTop - modalHeight - 8;
    let nextTop = preferredBelow;
    if (preferredBelow + modalHeight > viewportBottom - 8) {
      nextTop = preferredAbove >= minTop ? preferredAbove : Math.max(minTop, viewportBottom - modalHeight - 8);
    }
    setOffsetTop(nextTop);
  }, [show, anchorRef]);

  useEffect(() => {
    if (!show) return;
    updateOffset();
    const onShift = () => updateOffset();
    window.addEventListener("resize", onShift);
    window.addEventListener("scroll", onShift, true);
    window.visualViewport?.addEventListener("resize", onShift);
    window.visualViewport?.addEventListener("scroll", onShift);
    return () => {
      window.removeEventListener("resize", onShift);
      window.removeEventListener("scroll", onShift, true);
      window.visualViewport?.removeEventListener("resize", onShift);
      window.visualViewport?.removeEventListener("scroll", onShift);
    };
  }, [show, updateOffset]);

  useEffect(() => {
    if (!show) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const rafId = requestAnimationFrame(() => {
      const firstFocusable = cardRef.current?.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
      firstFocusable?.focus?.();
    });
    return () => { cancelAnimationFrame(rafId); document.body.style.overflow = previousOverflow; };
  }, [show]);

  if (!show) return null;

  const apply = () => { ensureReferrerFromQuery?.(); onApply?.(suggestedSelection); onClose(); };

  return (
    <div
      data-suggested-roles-modal="true"
      className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-900/35 p-4"
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } if (e.key === "Escape") onClose(); }}
    >
      <div ref={cardRef} className="w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-auto fade-in" style={{ marginTop: `${offsetTop}px` }}>
        <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">Apply Suggested Roles</div>
            <div className="text-base text-sky-100">Choose which roles to apply for this referrer.</div>
          </div>
          <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid gap-2 text-base">
            {ROLE_OPTIONS.map((r) => (
              <label key={r.id} className="flex items-center gap-3 text-base font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={suggestedSelection.includes(r.id)}
                  onChange={(e) => setSuggestedSelection((prev) => e.target.checked ? [...prev, r.id] : prev.filter((x) => x !== r.id))}
                />
                <span className="flex-1">{r.label}</span>
                <span className="text-sm font-semibold text-slate-500">
                  {r.id === "adjuster" ? (data.referrer || "—") : (data.referringCompany || "—")}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Skip</button>
          <button onClick={apply} className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white hover:bg-sky-600">Apply</button>
        </div>
      </div>
    </div>
  );
};
