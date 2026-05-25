// @ts-nocheck
// Shared chrome for the ~17 question cards inside the Interview side
// panel. Every card has the same shape: numbered badge + title in a
// click-to-toggle header, an answered-state border tint, a summary
// string + log timestamp line shown when collapsed, and the per-
// question controls + coaching banners + collapse button shown when
// expanded.
//
// The variable parts — what controls appear in the expanded body and
// which coaching banners to show — come through `children` so each
// question stays in App.tsx with its specific state-bindings.

import React from "react";

type Log = { user: string; at: string };

type Props = {
  number: number;
  title: string;
  /** What to show in the header instead of `title` when the card is
   *  collapsed (e.g. "Conditions" instead of "Is anything still wet
   *  or damaged?"). Defaults to `title` when omitted. */
  collapsedLabel?: string;
  summary: string;
  log: Log | undefined;
  answered: boolean;
  expanded: boolean;
  onToggle: () => void;
  /** Highlighter for the in-card search match — caller passes the
   *  React node produced by their highlightSearch(text) helper. */
  highlightSearch?: (text: string) => React.ReactNode;
  /** Force the answered-state border tint on/off. Defaults to
   *  matching `answered` (the conditions card uses this so the tint
   *  follows hasAnswers; the repairs card always uses the plain
   *  border). */
  showAnsweredTint?: boolean;
  children?: React.ReactNode;
};

export const InterviewQuestionCard: React.FC<Props> = ({
  number,
  title,
  collapsedLabel,
  summary,
  log,
  answered,
  expanded,
  onToggle,
  highlightSearch,
  showAnsweredTint,
  children,
}) => {
  const tinted = showAnsweredTint !== undefined ? showAnsweredTint : answered;
  const headerLabel = expanded ? title : (collapsedLabel || title);
  const renderedLabel = highlightSearch ? highlightSearch(headerLabel) : headerLabel;

  return (
    <div
      className={`noe-iq rounded-xl border ${
        tinted ? "border-sky-200 bg-sky-50/30" : "border-slate-200 bg-white"
      } overflow-hidden`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50"
      >
        <div className="text-[13px] font-bold text-sky-600 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shrink-0">
            {number}
          </span>
          {renderedLabel}
        </div>
        {answered && !expanded && (
          <span className="text-[12px] text-sky-600 font-semibold truncate ml-2">{summary}</span>
        )}
      </button>
      {answered && !expanded && log && (
        <div className="px-3 pb-1 text-[10px] text-slate-400">
          {log.user} · {log.at}
        </div>
      )}
      {expanded && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
};

// CollapseInterviewRow — the standard "log line + Collapse button"
// row that sits at the bottom of every expanded interview card.
type CollapseProps = {
  log: Log | undefined;
  onCollapse: () => void;
  /** Use the sky tint when there's a meaningful answer; otherwise
   *  the plain slate border. Default: plain slate. */
  tinted?: boolean;
};

export const CollapseInterviewRow: React.FC<CollapseProps> = ({ log, onCollapse, tinted }) => (
  <div className="flex items-center justify-between mt-1">
    {log && (
      <span className="text-[10px] text-slate-400">
        {log.user} · {log.at}
      </span>
    )}
    <button
      type="button"
      onClick={onCollapse}
      className={`ml-auto rounded-full border px-3 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 transition-all ${
        tinted ? "border-sky-300 text-sky-700" : "border-slate-300 text-slate-500"
      }`}
    >
      Collapse
    </button>
  </div>
);
