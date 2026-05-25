// @ts-nocheck
// Share / Email buttons that sit under the delivery group cards. Both
// buttons serialize the deliveryGroups array into a numbered text
// summary; Share uses navigator.share (or clipboard fallback), Email
// opens a mailto: link.
import React from "react";
import { rushFormatDate } from "../../utils/dateTime";

type DeliveryGroup = {
  id: string;
  label: string;
  date: Date;
  items: string[];
};

type Props = {
  deliveryGroups: DeliveryGroup[];
  orderName: string;
  deliveryNotes: Record<string, string>;
  onCopyToast?: (msg: string) => void;
};

// formatRushGuideLines — pure: turn the delivery groups into the
// numbered "1. Label (Date) — items" text the share/email buttons emit.
const formatRushGuideLines = (
  deliveryGroups: DeliveryGroup[],
  deliveryNotes: Record<string, string>,
  newline: string,
): string =>
  deliveryGroups
    .map((dg, i) => {
      const dgNotes = deliveryNotes?.[dg.id] || "";
      const items = dg.items.map((item) => `  - ${item}`).join(newline);
      return `${i + 1}. ${dg.label} (${rushFormatDate(dg.date)})${newline}${items}${
        dgNotes ? `${newline}  Note: ${dgNotes}` : ""
      }`;
    })
    .join(`${newline}${newline}`);

export const RushGuideShareButtons: React.FC<Props> = ({
  deliveryGroups,
  orderName,
  deliveryNotes,
  onCopyToast,
}) => {
  const onShare = () => {
    const lines = formatRushGuideLines(deliveryGroups, deliveryNotes, "\n");
    const text = `Rush Guide - ${orderName || "Order"}\n\n${lines}`;
    if (navigator.share) {
      navigator.share({ title: "Rush Guide", text });
    } else {
      navigator.clipboard.writeText(text);
      onCopyToast?.("Copied to clipboard");
    }
  };

  const onEmail = () => {
    const lines = formatRushGuideLines(deliveryGroups, deliveryNotes, "%0A");
    const subject = encodeURIComponent(`Rush Guide - ${orderName || "Order"}`);
    window.open(`mailto:?subject=${subject}&body=${lines}`);
  };

  return (
    <div className="px-4 pb-4 flex gap-2">
      <button
        onClick={onShare}
        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all"
      >
        Share / Copy
      </button>
      <button
        onClick={onEmail}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition-all"
      >
        Email
      </button>
    </div>
  );
};
