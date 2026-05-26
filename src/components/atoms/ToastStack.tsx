// @ts-nocheck
import React from "react";
import { ToastItem } from "./ToastItem";

type Props = {
  toasts: { id: number; message: string }[];
  onRemove: (id: number) => void;
  panelOffset?: number;
};

// ToastStack — fixed-position queue of ToastItems.
// `panelOffset` lets a side panel push the stack toward the visible viewport.
export const ToastStack = ({ toasts, onRemove, panelOffset = 0 }: Props) => {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-28 z-[90] flex flex-col-reverse items-center gap-1.5"
      style={{ left: "0", right: `${panelOffset}px`, margin: "0 auto", width: "fit-content" }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
};
