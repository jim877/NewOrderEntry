// @ts-nocheck
import React from "react";
import { Input } from "./Input";
import { Select } from "./Select";
import { getInitials } from "../../utils/names";

type PlanStep = {
  id: string;
  text: string;
  done?: boolean;
  doneBy?: string;
  doneAt?: string;
  assignee?: string;
};

type Props = {
  steps: PlanStep[];
  setSteps: (next: PlanStep[]) => void;
  currentUser: string;
  salesReps: string[];
  // Top "add a step" row
  newStep: string;
  setNewStep: (v: string) => void;
  newAssignee: string;
  setNewAssignee: (v: string) => void;
  onAddStep: () => void;
  // Per-row mutations — App owns these so the saved-data and draft-data stay in sync
  onToggleStep: (id: string) => void;
  onRemoveStep: (id: string) => void;
  // Edit-in-place state
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editingText: string;
  setEditingText: (v: string) => void;
  onCommitEdit: (id: string, nextText: string) => void;
  onReassign: (id: string, nextAssignee: string) => void;
  // Drag-to-reorder state
  dragId: string | null;
  setDragId: (id: string | null) => void;
  reorderDirty: boolean;
  setReorderDirty: (v: boolean) => void;
  onCancelReorder: () => void;
  onConfirmReorder: () => void;
  // Close
  onClose: () => void;
};

// PlanOfActionModal — drag-to-reorder, edit-in-place, mark-done plan of
// action sheet. Each step has text + assignee + done flag (with done-by /
// done-at audit). Top row: add new step (text + assignee + Add). Footer:
// Cancel/Confirm appear only when the user has reordered without saving;
// Close is always present.
export const PlanOfActionModal = ({
  steps, setSteps, currentUser, salesReps,
  newStep, setNewStep, newAssignee, setNewAssignee, onAddStep,
  onToggleStep, onRemoveStep,
  editingId, setEditingId, editingText, setEditingText, onCommitEdit, onReassign,
  dragId, setDragId, reorderDirty, setReorderDirty, onCancelReorder, onConfirmReorder,
  onClose,
}: Props) => {
  const assigneeOptions = [...new Set([currentUser, ...salesReps].filter(Boolean))];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="bg-sky-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Plan of Action</h3>
          <button className="text-white/80 hover:text-white text-2xl font-bold leading-none" onClick={onClose}>×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a step..."
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddStep(); } }}
            />
            <Select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} className="!w-48">
              <option value="">Assignee</option>
              {assigneeOptions.map((rep) => <option key={rep} value={rep}>{rep}</option>)}
            </Select>
            <button onClick={onAddStep} className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-500">Add</button>
          </div>
          <div className="space-y-2">
            {steps.length === 0 && <div className="text-sm text-slate-500">No steps yet.</div>}
            {steps.map((step, idx) => (
              <div
                key={step.id}
                draggable
                onDragStart={() => setDragId(step.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!dragId || dragId === step.id) return;
                  const fromIdx = steps.findIndex((s) => s.id === dragId);
                  const toIdx = steps.findIndex((s) => s.id === step.id);
                  if (fromIdx < 0 || toIdx < 0) return;
                  const next = [...steps];
                  const [moved] = next.splice(fromIdx, 1);
                  next.splice(toIdx, 0, moved);
                  setSteps(next);
                  setReorderDirty(true);
                }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 bg-white ${dragId === step.id ? "border-sky-400 ring-2 ring-sky-200" : "border-slate-200"} ${dragId && dragId !== step.id ? "border-dashed border-sky-200" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <button onClick={() => onToggleStep(step.id)} className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold ${step.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-400"}`}>{step.done ? "✓" : ""}</button>
                  {editingId === step.id ? (
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="!py-1.5 !text-sm w-64"
                      onKeyDown={(e) => { if (e.key === "Enter") { onCommitEdit(step.id, editingText); setEditingId(null); } }}
                    />
                  ) : (
                    <span className={`text-sm ${step.done ? "line-through text-slate-400" : "text-slate-700"}`}>{step.text}</span>
                  )}
                  <Select
                    value={step.assignee || ""}
                    onChange={(e) => onReassign(step.id, e.target.value)}
                    className="!w-40 !py-1.5 !text-xs"
                  >
                    <option value="">Assignee</option>
                    {assigneeOptions.map((rep) => <option key={rep} value={rep}>{rep}</option>)}
                  </Select>
                  {step.done && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600">{getInitials(step.doneBy || "Unknown")}</span>
                      {step.doneAt ? new Date(step.doneAt).toLocaleString([], { year: "2-digit", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === step.id ? (
                    <button className="text-slate-500 hover:text-slate-700 text-xs" onClick={() => { onCommitEdit(step.id, editingText); setEditingId(null); }}>Save</button>
                  ) : (
                    <button className="text-slate-500 hover:text-slate-700 text-xs" onClick={() => { setEditingId(step.id); setEditingText(step.text); }}>Edit</button>
                  )}
                  <button className="text-slate-400 hover:text-red-600" onClick={() => onRemoveStep(step.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
          {reorderDirty ? (
            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100" onClick={onCancelReorder}>Cancel Reorder</button>
              <button className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-500" onClick={onConfirmReorder}>Confirm Order</button>
            </div>
          ) : <span />}
          <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
