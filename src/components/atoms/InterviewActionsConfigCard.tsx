// @ts-nocheck
import React from "react";
import { INTERVIEW_ACTION_GROUPS } from "../../config";
import { ACTION_TYPE_LABELS } from "../../utils/loadTargets";

type ActionConfig = { coaching?: string; actions?: { type: string; value?: string }[]; _open?: boolean };

type Props = {
  configs: Record<string, ActionConfig>;
  setConfigs: (updater: (prev: Record<string, ActionConfig>) => Record<string, ActionConfig>) => void;
  search: string;
  onResetAll: () => void;
};

// Empty-config fallback used when an answer key has no entry yet — the
// editor never mutates a missing key.
const EMPTY_CONFIG: ActionConfig = { coaching: "", actions: [] };

// InterviewActionsConfigCard — Settings → Interview Answer Actions panel.
// Each answer key (grouped by INTERVIEW_ACTION_GROUPS) is a collapsible
// row showing the per-answer coaching text + the list of auto-actions
// fired when the answer is selected. Actions are (type, value) pairs
// keyed by the ACTION_TYPE_LABELS dict. Search filters by key OR by
// coaching text content.
export const InterviewActionsConfigCard = ({ configs, setConfigs, search, onResetAll }: Props) => {
  const searchL = (search || "").toLowerCase().trim();

  // Patch the config for a single answer key. Atom-local writer so the
  // ~7 callbacks below stay readable.
  const patchKey = (key: string, patch: Partial<ActionConfig>) =>
    setConfigs((prev) => ({ ...prev, [key]: { ...(prev[key] || EMPTY_CONFIG), ...patch } }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-violet-800">Interview Answer Actions</span>
          <span className="text-xs text-violet-500 ml-2">{Object.keys(configs).length} answers configured</span>
        </div>
        <button onClick={onResetAll} className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-bold text-violet-600 hover:bg-violet-50">Reset</button>
      </div>
      <div className="divide-y divide-slate-100">
        {INTERVIEW_ACTION_GROUPS.map((group) => {
          const filteredKeys = group.keys.filter((k) => !searchL || k.toLowerCase().includes(searchL) || (configs[k]?.coaching || "").toLowerCase().includes(searchL));
          if (!filteredKeys.length) return null;
          return (
            <div key={group.label}>
              <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{group.label}</div>
              {filteredKeys.map((key) => {
                const cfg = configs[key] || EMPTY_CONFIG;
                const isOpen = !!cfg._open;
                return (
                  <div key={key} className="border-t border-slate-50">
                    <div
                      className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-slate-50/50"
                      onClick={() => patchKey(key, { _open: !isOpen })}
                    >
                      <span className="text-xs font-semibold text-slate-700 w-48">{key}</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {(cfg.actions || []).map((a: any, i: number) => (
                          <span key={i} className="rounded-full bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
                            {ACTION_TYPE_LABELS[a.type] || a.type}{a.value ? `: ${a.value}` : ""}
                          </span>
                        ))}
                        {!(cfg.actions || []).length && <span className="text-[9px] text-slate-300">No actions</span>}
                      </div>
                      {cfg.coaching && (
                        <span className="text-[9px] text-violet-400 truncate max-w-[200px]" title={cfg.coaching}>🎓 {cfg.coaching.slice(0, 40)}...</span>
                      )}
                      <span className="text-slate-300 text-xs">{isOpen ? "▾" : "▸"}</span>
                    </div>
                    {isOpen && (
                      <div className="px-4 pb-3 space-y-2 bg-slate-50/30">
                        <div>
                          <div className="text-[10px] font-bold text-violet-600 mb-1">Coaching Text</div>
                          <textarea
                            value={cfg.coaching || ""}
                            onChange={(e) => patchKey(key, { coaching: e.target.value })}
                            rows={2}
                            className="w-full rounded border border-violet-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-violet-400 bg-white"
                            placeholder="What to say to the customer..."
                          />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-sky-600 mb-1">Actions</div>
                          <div className="space-y-1">
                            {(cfg.actions || []).map((a: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 bg-white rounded border border-slate-200 px-2 py-1">
                                <select
                                  value={a.type}
                                  onChange={(e) => {
                                    const actions = [...(cfg.actions || [])];
                                    actions[i] = { ...actions[i], type: e.target.value };
                                    patchKey(key, { actions });
                                  }}
                                  className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-700"
                                >
                                  {Object.entries(ACTION_TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </select>
                                <input
                                  value={a.value || ""}
                                  onChange={(e) => {
                                    const actions = [...(cfg.actions || [])];
                                    actions[i] = { ...actions[i], value: e.target.value };
                                    patchKey(key, { actions });
                                  }}
                                  placeholder="Value"
                                  className="flex-1 text-[10px] border border-slate-200 rounded px-1.5 py-0.5 outline-none"
                                />
                                <button
                                  onClick={() => patchKey(key, { actions: (cfg.actions || []).filter((_: any, j: number) => j !== i) })}
                                  className="text-rose-400 hover:text-rose-600 text-xs"
                                >×</button>
                              </div>
                            ))}
                            <button
                              onClick={() => patchKey(key, { actions: [...(cfg.actions || []), { type: "loadList", value: "" }] })}
                              className="text-[10px] font-bold text-sky-500 hover:text-sky-700"
                            >+ Add Action</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
