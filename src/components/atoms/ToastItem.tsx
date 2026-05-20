// @ts-nocheck
import React, { useEffect } from "react";

type Props = { message: string; onClose: () => void; style?: React.CSSProperties };

// ToastItem — single toast that auto-dismisses after 3.5s.
// Render inside a ToastStack; container handles positioning.
export const ToastItem = ({ message, onClose, style }: Props) => {
  useEffect(() => {
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [onClose]);
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
