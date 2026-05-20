// @ts-nocheck
import React, { useState } from "react";
import { StepNav } from "./StepNav";
import { SettingsMenu } from "./SettingsMenu";

// Header — fixed top bar. Shifts left when a side panel is open.
// Composes StepNav (progress dots) and SettingsMenu (gear dropdown).
export const Header = ({
  activeSection, visitedSections, completedSections, onJump, onJumpSub,
  title, version,
  entryMode, setEntryMode,
  showCoaching, setShowCoaching, compactMode, setCompactMode,
  onShowSds, onShowScopeWizard,
  onReset, setShowSampleDataModal, onOpenPresets, presetCount, onOpenFieldConfig,
  currentUser, setCurrentUser,
  interviewPanelOpen, actionItemsOpen,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const sidePanelOpen = interviewPanelOpen || actionItemsOpen;

  return (
    <header
      className="fixed top-0 left-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200 shadow-md shadow-slate-900/5"
      style={{ right: sidePanelOpen ? "480px" : "0", transition: "right 0.2s ease" }}
    >
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[120px]">
          <button onClick={() => setEntryMode("start")} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100">
            <span className="text-lg">←</span>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-none">{title}</h1>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{version}</span>
          </div>
        </div>

        {entryMode === "detailed" ? (
          <div className="flex-1 flex items-center justify-center max-w-xl">
            <StepNav
              activeSection={activeSection}
              visitedSections={visitedSections}
              completedSections={completedSections}
              onJump={onJump}
              onJumpSub={onJumpSub}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="min-w-[120px] flex justify-end gap-2 relative">
          <button
            onClick={() => setShowCoaching((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all border ${showCoaching ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-400 hover:border-violet-300"}`}
            title={showCoaching ? "Hide coaching prompts" : "Show coaching prompts"}
          >
            {showCoaching ? "🎓 Coaching" : "🎓"}
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border bg-white text-slate-400 border-slate-200 hover:border-slate-300"
          >
            <span>Settings ⚙︎</span>
          </button>
          {showSettings && (
            <SettingsMenu
              showCoaching={showCoaching} setShowCoaching={setShowCoaching}
              compactMode={compactMode} setCompactMode={setCompactMode}
              onShowSds={onShowSds} onShowScopeWizard={onShowScopeWizard}
              onReset={onReset}
              setShowSampleDataModal={setShowSampleDataModal}
              onOpenPresets={onOpenPresets} presetCount={presetCount}
              onOpenFieldConfig={onOpenFieldConfig}
              currentUser={currentUser} setCurrentUser={setCurrentUser}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
};
