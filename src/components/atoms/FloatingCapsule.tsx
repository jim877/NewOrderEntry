// @ts-nocheck
import React from "react";

// FloatingCapsule — bottom-anchored action bar with Search / Interview / Action Items / Mode toggle / Save.
// Shifts left when a side panel is open. Switches between rounded floating bar and edge-anchored bar in compact mode.
export const FloatingCapsule = ({
  entryMode, setEntryMode, onSave, setShowSearch, onInterview, interviewPanelOpen,
  onActionItems, actionItemsOpen, actionItemCount, modeButtonFlash, compactMode = false,
}) => {
  const sidePanelOpen = interviewPanelOpen || actionItemsOpen;
  return (
    <div
      className={`fixed left-0 z-50 flex justify-center fade-in ${compactMode ? "bottom-0 pointer-events-auto" : "bottom-4 sm:bottom-8 pointer-events-none"}`}
      style={{
        right: sidePanelOpen ? "480px" : "0",
        paddingBottom: compactMode ? "0" : "env(safe-area-inset-bottom)",
        transition: "right 0.2s ease",
      }}
    >
      <div className={`pointer-events-auto bg-white border-t border-slate-200 flex items-center ${compactMode ? "w-full justify-between px-4 py-2 shadow-[0_-4px_20px_rgb(0,0,0,0.08)] gap-2" : "border rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] shadow-slate-700/30 p-1.5 px-2 sm:px-3 gap-1 sm:gap-2"}`}>
        <div className="flex items-center gap-1 sm:gap-2">
          <button data-noe-action="search" onClick={() => setShowSearch(true)} className="flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 bg-slate-50">
            <span className="text-xs sm:text-sm font-bold">Search</span>
          </button>
          <button
            data-noe-action="interview"
            onClick={onInterview}
            className={`flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all ${interviewPanelOpen ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 bg-slate-50"}`}
          >
            <span className="text-xs sm:text-sm font-bold">Interview</span>
          </button>
          <button
            data-noe-action="action-items"
            onClick={onActionItems}
            className={`flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all relative ${actionItemsOpen ? "bg-amber-50 text-amber-700 border border-amber-200" : "hover:bg-amber-50 text-slate-600 hover:text-amber-600 bg-slate-50"}`}
          >
            <span className="text-xs sm:text-sm font-bold">Action Items</span>
            {actionItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">{actionItemCount}</span>
            )}
          </button>
          <button
            data-noe-action="toggle-mode"
            data-noe-current-mode={entryMode}
            onClick={() => setEntryMode(entryMode === "quick" ? "detailed" : "quick")}
            className={`flex items-center justify-center h-10 px-3 sm:px-4 gap-1.5 rounded-full transition-all hover:bg-sky-50 text-slate-600 hover:text-sky-600 bg-slate-50 ${modeButtonFlash ? "animate-nav-focus ring-2 ring-sky-400" : ""}`}
          >
            <span className="text-base">{entryMode === "quick" ? "📝" : "⚡"}</span>
            <span className="text-xs sm:text-sm font-bold">{entryMode === "quick" ? "Detailed" : "Quick"}</span>
          </button>
        </div>
        <button data-noe-action="save" onClick={onSave} className="flex items-center justify-center h-10 px-6 sm:px-8 gap-1.5 rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all">
          <span className="text-base">💾</span>
          <span className="text-xs sm:text-sm font-bold">Save</span>
        </button>
      </div>
    </div>
  );
};
