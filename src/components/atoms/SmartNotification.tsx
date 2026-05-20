// @ts-nocheck
import React, { useEffect } from "react";

// SmartNotification — bottom-of-screen banner for auto-actions the user can reject.
// Auto-dismisses after 4s.
export const SmartNotification = ({ message, onReject, onClose, panelOffset = 0 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-24 z-[90] flex items-center gap-4 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-2xl slide-up border border-slate-700"
      style={{ left: "0", right: `${panelOffset}px`, margin: "0 auto", width: "fit-content" }}
    >
      <div className="flex items-center gap-3">
        <div className="text-orange-500 font-bold text-lg">⚡</div>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="h-4 w-px bg-slate-700"></div>
      <button
        onClick={onReject}
        className="rounded px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase tracking-wider"
      >
        Reject
      </button>
    </div>
  );
};
