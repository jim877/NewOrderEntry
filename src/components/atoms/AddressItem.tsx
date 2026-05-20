// @ts-nocheck
import React, { useState, useEffect, useRef, memo } from "react";
import { Chevron } from "./Chevron";
import { AddressActionMenu } from "./AddressActionMenu";
import { AddressCoreFields } from "./AddressCoreFields";
import { AddressPropertyDetails } from "./AddressPropertyDetails";
import { isAddressPlaceholder, summarizeAddress, isHeaderToggleIgnoredTarget } from "../../utils/order";

// AddressItem — one address card. Collapsible. Header row shows label + verified badge + role pills.
// Body composes AddressCoreFields (always visible when open) and AddressPropertyDetails (collapsible).
export const AddressItem = memo(
  ({
    addr, total, updateAddr, onRemove, highlightMissing, index, onVerify, auditOn,
    rentOrOwn, rentCoverageLimit, onRentOrOwnChange, onRentCoverageChange,
    forceShowCoords, autoOpenForTypePrompt, autoFocusTypePrompt, onTypePromptFocused, setToast,
  }) => {
    const [coordsOpen, setCoordsOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const prevOpenRef = useRef(false);
    const typeSelectRef = useRef(null);

    // On open, focus the Google search input + briefly highlight its border.
    useEffect(() => {
      if (open && !prevOpenRef.current) {
        setTimeout(() => {
          const card = document.querySelector(`[data-address-item-id="${addr.id}"]`);
          if (!card) return;
          const searchInput = card.querySelector(".google-address-search")?.querySelector("input");
          if (searchInput) {
            searchInput.focus();
            searchInput.style.borderColor = "#0ea5e9";
            searchInput.style.outline = "none";
            searchInput.style.boxShadow = "none";
            setTimeout(() => { searchInput.style.borderColor = ""; }, 2500);
          }
        }, 150);
      }
      prevOpenRef.current = open;
    }, [open]);

    useEffect(() => {
      if (addr._forceOpen) { setOpen(true); updateAddr(addr.id, { _forceOpen: false }); }
    }, [addr._forceOpen]);

    useEffect(() => { if (forceShowCoords) setCoordsOpen(true); }, [forceShowCoords]);
    useEffect(() => { if (autoOpenForTypePrompt) setOpen(true); }, [autoOpenForTypePrompt]);

    // Auto-focus the Address Type select when prompted (after open).
    useEffect(() => {
      if (!autoFocusTypePrompt) return;
      if (!open) { setOpen(true); return; }
      const timer = window.setTimeout(() => {
        const el = typeSelectRef.current;
        if (el instanceof HTMLElement) {
          el.focus();
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        onTypePromptFocused?.(addr.id);
      }, 100);
      return () => window.clearTimeout(timer);
    }, [autoFocusTypePrompt, open, onTypePromptFocused, addr.id]);

    const placeholder = isAddressPlaceholder(addr);
    const verified = !!addr.lat && !!addr.lng;
    const shellClass = addr.inactive
      ? "bg-slate-50 opacity-60 border-slate-200"
      : placeholder
      ? "placeholder-shell bg-white"
      : addr.isPrimary
      ? "bg-white border-sky-400 ring-1 ring-sky-50"
      : "bg-white border-slate-200";

    return (
      <div
        data-address-item-id={addr.id}
        data-audit-key={placeholder ? `placeholder-address-${addr.id}` : undefined}
        className={`group relative overflow-hidden rounded-lg sm:rounded-xl border ${open ? "p-3 sm:p-5" : "px-3 py-2 sm:px-4 sm:py-2.5"} shadow-sm transition-all hover:shadow-md ${shellClass}`}
      >
        {addr.isPrimary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-lg" />}
        {total > 1 && !addr.inactive && (
          <button
            onClick={() => updateAddr(addr.id, { _showMenu: true })}
            className={`absolute ${open ? "right-3 top-3 h-7 w-7" : "right-2 top-2 h-5 w-5 text-xs"} grid place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors`}
            title="Remove or deactivate address"
          >×</button>
        )}
        {addr._showMenu && <AddressActionMenu addr={addr} updateAddr={updateAddr} onRemove={onRemove} />}
        {addr.inactive && (
          <button
            onClick={() => updateAddr(addr.id, { inactive: false })}
            className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-sky-600 hover:bg-sky-50"
            title="Reactivate this address"
          >Reactivate</button>
        )}

        <div
          className="pl-1 sm:pl-2 flex items-center gap-2 cursor-pointer"
          onClick={(e) => { if (isHeaderToggleIgnoredTarget(e.target)) return; setOpen((v) => !v); }}
        >
          <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} className="text-slate-400 hover:text-slate-600" title={open ? "Collapse" : "Expand"}>
            <Chevron open={open} />
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className={`${open ? "text-base" : "text-sm"} font-bold truncate ${placeholder ? "placeholder-text" : "text-slate-800"}`}>{addr.label || addr.purpose || addr.type || "Address"}</span>
              {verified && <span title="This address was found and confirmed via Google Maps." className="rounded-full bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 cursor-help shrink-0">✓</span>}
            </div>
            <span className="text-xs text-slate-500 truncate">{summarizeAddress(addr)}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {addr.inactive && <span className="rounded-full bg-slate-200 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-500">Inactive</span>}
            {placeholder && !addr.inactive && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold placeholder-chip">Placeholder</span>}
            {!placeholder && <button type="button" onClick={() => updateAddr(addr.id, { isPrimary: !addr.isPrimary })} className={`rounded-full ${open ? "px-2 py-0.5" : "px-1.5 py-0.5"} text-[10px] font-bold border ${addr.isPrimary ? "bg-sky-100 border-sky-300 text-sky-700" : "bg-white border-slate-200 text-slate-400 hover:border-sky-300"}`}>Primary</button>}
            {(addr.isPrimary || addr.isLossSite || open) && (
              <button type="button" onClick={() => updateAddr(addr.id, { isLossSite: !addr.isLossSite })} className={`rounded-full ${open ? "px-2 py-0.5" : "px-1.5 py-0.5"} text-[10px] font-bold border ${addr.isLossSite ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-slate-400 hover:border-rose-300"}`}>Loss Site</button>
            )}
          </div>
        </div>

        {open && (
          <div className="space-y-4 pl-1 sm:pl-2 mt-3">
            <AddressCoreFields
              addr={addr} updateAddr={updateAddr} index={index}
              auditOn={auditOn} highlightMissing={highlightMissing}
              typeSelectRef={typeSelectRef} setToast={setToast}
            />
            <AddressPropertyDetails
              addr={addr} updateAddr={updateAddr} index={index}
              auditOn={auditOn} highlightMissing={highlightMissing} onVerify={onVerify}
              coordsOpen={coordsOpen} setCoordsOpen={setCoordsOpen}
              rentOrOwn={rentOrOwn} rentCoverageLimit={rentCoverageLimit}
              onRentOrOwnChange={onRentOrOwnChange} onRentCoverageChange={onRentCoverageChange}
            />
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-600">Done</button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
