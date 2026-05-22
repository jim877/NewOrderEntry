// @ts-nocheck
import React, { useEffect, useRef } from "react";

type Props = { message: string; onClose: () => void; style?: React.CSSProperties };

// ToastItem — single toast that auto-dismisses after 3.5s.
// Render inside a ToastStack; container handles positioning.
// We hold onClose in a ref so the parent passing a fresh arrow `() => onRemove(t.id)`
// on every render doesn't reset the timer. Mount-once timer; closure reads latest onClose.
export const ToastItem = ({ message, onClose, style }: Props) => {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const id = setTimeout(() => onCloseRef.current(), 3500);
    return () => clearTimeout(id);
  }, []);
  return (
    <div
      className="fade-in rounded-2xl bg-slate-800/95 backdrop-blur px-5 py-2.5 text-[12px] font-semibold text-white shadow-xl shadow-slate-500/20 flex items-center gap-2 w-fit"
      style={style}
    >
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] shrink-0">✓</span>
      {message}
    </div>
  );
};
