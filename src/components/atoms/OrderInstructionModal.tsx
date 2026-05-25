// @ts-nocheck
import React from "react";
import { Field } from "./Field";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { INSTRUCTION_TYPES } from "../../config";

type ModalState = {
  isOpen: boolean;
  mode: "add" | "edit";
  draft: { type: string; text: string };
};

type Props = {
  state: ModalState;
  setState: (updater: (prev: ModalState) => ModalState) => void;
  onClose: () => void;
  onSave: () => void;
};

// OrderInstructionModal — add / edit a single order-only instruction (type +
// text). Order-level instructions apply only to this order; company /
// contact instructions stay inherited from saved profiles (the gray panel
// inside the body restates that to the user).
export const OrderInstructionModal = ({ state, setState, onClose, onSave }: Props) => (
  <div className="fixed inset-0 z-[128] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">
          {state.mode === "edit" ? "Edit Order Instruction" : "Add Order Instruction"}
        </h3>
      </div>
      <div className="space-y-4 p-6">
        <Field label="Instruction Type">
          <Select
            value={state.draft.type}
            onChange={(e) => setState((prev) => ({ ...prev, draft: { ...prev.draft, type: e.target.value } }))}
          >
            {INSTRUCTION_TYPES.map((type) => (
              <option key={`order-instruction-type-${type}`} value={type}>{type}</option>
            ))}
          </Select>
        </Field>
        <Field label="Instruction">
          <Textarea
            value={state.draft.text}
            onChange={(e) => setState((prev) => ({ ...prev, draft: { ...prev.draft, text: e.target.value } }))}
            placeholder="Enter an order-only instruction..."
          />
        </Field>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Order-level instructions apply only to this order. Company and contact instructions remain inherited from their saved profiles.
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700" onClick={onClose}>Cancel</button>
        <button className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-bold text-white shadow hover:bg-sky-600" onClick={onSave}>Save</button>
      </div>
    </div>
  </div>
);
