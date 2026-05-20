// @ts-nocheck
import React from "react";

// CustomerWelcomePanel — checklist for the welcome text + send button.
// Only renders when c.showWelcomePanel is true (parent gates visibility).
export const CustomerWelcomePanel = ({ c, updateCust, hasMobile, canSendWelcome, onSendWelcome }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendBrochure} onChange={(e) => updateCust(c.id, { sendBrochure: e.target.checked })} /> Brochure</label>
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendRushGuide} onChange={(e) => updateCust(c.id, { sendRushGuide: e.target.checked })} /> Rush Guide</label>
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendAuthLink} onChange={(e) => updateCust(c.id, { sendAuthLink: e.target.checked })} /> Auth Form</label>
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendCosLink} onChange={(e) => updateCust(c.id, { sendCosLink: e.target.checked })} /> COS Link</label>
      <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" checked={!!c.sendGoogleReviewLink} onChange={(e) => updateCust(c.id, { sendGoogleReviewLink: e.target.checked })} /> Google Review</label>
    </div>
    <div className="flex items-center justify-between">
      {!hasMobile && <span className="text-[10px] text-amber-600">Add mobile # to send</span>}
      {c.doNotContact && <span className="text-[10px] text-rose-600">Do Not Contact enabled</span>}
      {c.welcomeTextSent ? (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-green-600">Sent</span>
          <button onClick={() => updateCust(c.id, { showWelcomePanel: true })} className="rounded-full px-2 py-0.5 text-[9px] font-bold border border-slate-200 text-slate-500 hover:text-slate-700">Edit</button>
        </div>
      ) : (
        <button
          onClick={() => { onSendWelcome?.(c.id); updateCust(c.id, { welcomeTextSent: true }); }}
          disabled={!canSendWelcome}
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${canSendWelcome ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
        >
          Send
        </button>
      )}
    </div>
  </div>
);
