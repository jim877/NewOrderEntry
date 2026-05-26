// @ts-nocheck
// Gantt-style timeline visualization for the Rush Guide. Three vertical
// regions stacked above + below a colored location band:
//   1. Pin toggles (which event/season pins are visible).
//   2. Staggered event/season pins (above the bar) with connector lines.
//   3. Month labels.
//   4. The location-band bar (with "today" marker + drag-target hint).
//   5. Delivery markers below the bar, staggered into lanes when dates
//      cluster, with click-to-scroll and drag-to-move handlers.
//   6. The pending-date-change confirmation strip.
//
// Everything below the disclaimer banner is read-only render +
// dispatch — all state lives on the parent, including the drag state
// + pending-change ref. Extracting this keeps App.tsx free of the
// dense Gantt JSX while still letting the parent own behavior.

import React from "react";
import { rushFormatDate, formatDateInputValue, parseLocalDate } from "../../utils/dateTime";

type Pin = { id: string; label: string; icon: string; date: Date; defaultOn: boolean; pctPos: number };

type Band = {
  label: string;
  color: string;
  textClass?: string;
  startPct: number;
  widthPct: number;
  address?: string;
};

type MonthLabel = { label: string; pct: number };

type DeliveryGroup = {
  id: string;
  label: string;
  date: Date;
  color: string;
};

type DraggingDelivery = { id: string; pct: number } | null;

type PendingDateChange = {
  id: string;
  label: string;
  oldDateStr: string;
  newDateStr: string;
  oldDateLabel: string;
  newDateLabel: string;
  isFinal: boolean;
} | null;

type Props = {
  // Disclaimer + today.
  now: Date;
  // Pin toggle row + staggered event/season pins above the bar.
  allPins: Pin[];
  pinPositions: Record<string, number>;
  isPinOn: (id: string, defaultOn: boolean) => boolean;
  togglePin: (id: string) => void;
  handlePinDrag: (id: string, e: React.MouseEvent) => void;
  // Month labels along the bottom.
  monthLabels: MonthLabel[];
  // The bar bands + the pct() helper for mapping dates -> 0-100%.
  bands: Band[];
  pct: (d: Date) => number;
  timelineStart: Date;
  timelineEnd: Date;
  // Delivery markers below the bar.
  deliveryGroups: DeliveryGroup[];
  draggingDelivery: DraggingDelivery;
  setDraggingDelivery: (d: DraggingDelivery) => void;
  pendingDeliveryDateChange: PendingDateChange;
  setPendingDeliveryDateChange: (c: PendingDateChange) => void;
  applyDeliveryDateChange: (change: PendingDateChange) => void;
};

export const RushGuideGanttTimeline: React.FC<Props> = ({
  now,
  allPins,
  pinPositions,
  isPinOn,
  togglePin,
  handlePinDrag,
  monthLabels,
  bands,
  pct,
  timelineStart,
  timelineEnd,
  deliveryGroups,
  draggingDelivery,
  setDraggingDelivery,
  pendingDeliveryDateChange,
  setPendingDeliveryDateChange,
  applyDeliveryDateChange,
}) => {
  // === Stagger event/season pins into rows so labels don't overlap ===
  const activePins = allPins
    .filter((p) => isPinOn(p.id, p.defaultOn))
    .map((pin) => ({ ...pin, pos: pinPositions[pin.id] !== undefined ? pinPositions[pin.id] : pin.pctPos }))
    .sort((a, b) => a.pos - b.pos);

  const pinRows: number[] = [];
  const pinRowEnds: number[] = [];
  activePins.forEach((pin) => {
    let row = 0;
    for (let r = 0; r < pinRowEnds.length; r++) {
      if (pin.pos > pinRowEnds[r] + 8) {
        row = r;
        break;
      }
      row = r + 1;
    }
    pinRows.push(row);
    pinRowEnds[row] = pin.pos;
  });
  const maxPinRow = pinRows.length ? Math.max(...pinRows) : 0;
  const pinRowHeight = 18;
  const totalEventHeight = (maxPinRow + 1) * pinRowHeight + 16;

  // === Stagger delivery markers into lanes when dates cluster ===
  const markerClearancePct = 10;
  const markerLaneGapPx = 48;
  const markerBaseConnectorPx = 6;
  const markerRowsById: Record<string, number> = {};
  const markerRowEnds: number[] = [];
  deliveryGroups
    .map((dg) => ({ id: dg.id, pos: pct(dg.date) }))
    .sort((a, b) => a.pos - b.pos)
    .forEach((marker) => {
      let row = markerRowEnds.findIndex((end) => marker.pos > end + markerClearancePct);
      if (row === -1) row = markerRowEnds.length;
      markerRowsById[marker.id] = row;
      markerRowEnds[row] = marker.pos;
    });
  const maxMarkerRow = Math.max(0, ...Object.values(markerRowsById));
  const markerAreaHeight = markerBaseConnectorPx + maxMarkerRow * markerLaneGapPx + 58;

  // === Drag indicator overlay (above the bar) ===
  const dragIndicator = draggingDelivery || pendingDeliveryDateChange;
  const dragPct = draggingDelivery
    ? draggingDelivery.pct
    : pendingDeliveryDateChange
      ? pct(parseLocalDate(pendingDeliveryDateChange.newDateStr) || new Date())
      : null;
  const dragDropDate =
    dragPct != null
      ? new Date(timelineStart.getTime() + (dragPct / 100) * (timelineEnd.getTime() - timelineStart.getTime()))
      : null;

  // Drag handler for a single delivery marker.
  const onDeliveryDragStart = (dg: DeliveryGroup) => (e: React.MouseEvent) => {
    e.preventDefault();
    const bar = document.getElementById("rush-timeline-bar");
    if (!bar) return;
    const startX = e.clientX;
    let moved = false;
    const onMove = (me: MouseEvent) => {
      moved = true;
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((me.clientX - rect.left) / rect.width) * 100));
      setDraggingDelivery({ id: dg.id, pct: x });
    };
    const onUp = (me: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      // Click (not drag) — scroll to the card.
      if (!moved || Math.abs(me.clientX - startX) < 5) {
        setDraggingDelivery(null);
        const el = document.getElementById(`delivery-card-${dg.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-offset-2", "ring-sky-400");
          setTimeout(() => el.classList.remove("ring-2", "ring-offset-2", "ring-sky-400"), 2000);
        }
        return;
      }
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
      const newDate = new Date(timelineStart.getTime() + x * (timelineEnd.getTime() - timelineStart.getTime()));
      const newDateStr = formatDateInputValue(newDate);
      const oldDateStr = formatDateInputValue(dg.date);
      setDraggingDelivery(null);
      if (!newDateStr || newDateStr === oldDateStr) return;
      setPendingDeliveryDateChange({
        id: dg.id,
        label: dg.label,
        oldDateStr,
        newDateStr,
        oldDateLabel: rushFormatDate(dg.date),
        newDateLabel: rushFormatDate(newDate),
        isFinal: dg.id === "final",
      });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <>
      <div className="px-4 py-2 border-b border-slate-100 bg-amber-50/50">
        <p className="text-[10px] text-amber-700 leading-relaxed">
          This timeline is based on estimated information as of {rushFormatDate(now)} and is likely to change as additional information is learned. Please use this as a guide and communicate new realities as they occur so dates can be adjusted. These are not intended to be firm appointments — all appointments will need to be confirmed.
        </p>
      </div>

      {/* Pin toggles */}
      <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap gap-1.5">
        {allPins.map((pin) => {
          const on = isPinOn(pin.id, pin.defaultOn);
          return (
            <button
              key={pin.id}
              onClick={() => togglePin(pin.id)}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${
                on ? "border-teal-400 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-400 opacity-60"
              }`}
              title={`${pin.label} — ${rushFormatDate(pin.date)}`}
            >
              {pin.icon} {pin.label}
            </button>
          );
        })}
      </div>

      {/* Timeline visualization */}
      <div className="px-4 py-4">
        {/* Event/season pins (above the bar) — staggered into rows */}
        <div className="relative mb-0.5" style={{ height: totalEventHeight }}>
          {activePins.map((pin, idx) => {
            const row = pinRows[idx];
            const topOffset = row * pinRowHeight;
            const lineHeight = totalEventHeight - topOffset - 14;
            return (
              <div
                key={pin.id}
                className="absolute cursor-grab active:cursor-grabbing group"
                style={{ left: `${pin.pos}%`, transform: "translateX(-50%)", top: topOffset }}
                onMouseDown={(e) => handlePinDrag(pin.id, e)}
                title={`${pin.label} — ${rushFormatDate(pin.date)} — drag to reposition`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px]">{pin.icon}</span>
                    <span className="text-[7px] font-bold text-slate-500 whitespace-nowrap group-hover:text-teal-700">
                      {pin.label}
                    </span>
                  </div>
                  <div
                    className="w-px bg-slate-200 group-hover:bg-teal-400"
                    style={{ height: lineHeight }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Month labels — tight above the bar */}
        <div className="relative h-4">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{ left: `${m.pct}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[9px] text-slate-400 font-bold">{m.label}</span>
              <div className="w-px h-1 bg-slate-300" />
            </div>
          ))}
        </div>

        {/* THE BAR — location bands with "today" red marker */}
        <div className="relative">
          {/* Drag-target indicator — vertical line + date pill above the bar */}
          {dragIndicator && dragPct != null && dragDropDate && (
            <>
              <div
                className="absolute w-0.5 bg-sky-500 z-30 pointer-events-none"
                style={{ left: `${dragPct}%`, transform: "translateX(-50%)", top: "0", bottom: "-55px" }}
              />
              <div
                className="absolute z-30 pointer-events-none"
                style={{ left: `${dragPct}%`, transform: "translateX(-50%)", top: "-20px" }}
              >
                <div className="rounded bg-sky-600 px-2 py-0.5 text-[11px] font-bold text-white whitespace-nowrap shadow-md">
                  {rushFormatDate(dragDropDate)}
                </div>
              </div>
            </>
          )}
          <div id="rush-timeline-bar" className="relative z-20 h-7 bg-slate-100 rounded-lg overflow-hidden">
            {bands.map((b, i) => (
              <div
                key={i}
                className={`absolute top-0 bottom-0 ${b.color} flex items-center justify-center cursor-default`}
                style={{ left: `${b.startPct}%`, width: `${Math.max(b.widthPct, 1)}%` }}
                title={`${b.label}${b.address ? `\n→ ${b.address}` : ""}`}
              >
                <span className={`text-[10px] font-bold truncate px-1 ${b.textClass || "text-white drop-shadow-sm"}`}>
                  {b.label}
                </span>
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
              style={{ left: `${pct(now)}%` }}
              title="Today"
            />
          </div>
        </div>

        {/* Delivery markers below the bar */}
        <div className="relative z-0 mt-0.5" style={{ height: `${markerAreaHeight}px` }}>
          {/* Connector lines from the bar down to each marker */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {deliveryGroups.map((dg) => {
              const markerRow = markerRowsById[dg.id] || 0;
              const connectorHeight = markerBaseConnectorPx + markerRow * markerLaneGapPx;
              return (
                <div
                  key={`${dg.id}-connector`}
                  className="absolute top-0"
                  style={{ left: `${pct(dg.date)}%`, transform: "translateX(-50%)" }}
                >
                  <div className="w-px bg-slate-300" style={{ height: `${connectorHeight + 12}px` }} />
                </div>
              );
            })}
          </div>
          {/* Marker dots + labels */}
          {deliveryGroups.map((dg, i) => {
            const markerRow = markerRowsById[dg.id] || 0;
            const connectorHeight = markerBaseConnectorPx + markerRow * markerLaneGapPx;
            const leftPct =
              draggingDelivery?.id === dg.id
                ? draggingDelivery.pct
                : pendingDeliveryDateChange?.id === dg.id
                  ? pct(parseLocalDate(pendingDeliveryDateChange.newDateStr) || dg.date)
                  : pct(dg.date);
            const dateLabel =
              draggingDelivery?.id === dg.id
                ? rushFormatDate(
                    new Date(
                      timelineStart.getTime() +
                        (draggingDelivery.pct / 100) * (timelineEnd.getTime() - timelineStart.getTime())
                    )
                  )
                : pendingDeliveryDateChange?.id === dg.id
                  ? pendingDeliveryDateChange.newDateLabel
                  : rushFormatDate(dg.date);
            return (
              <div
                key={dg.id}
                className={`absolute z-10 cursor-grab active:cursor-grabbing transition-transform ${
                  draggingDelivery?.id === dg.id
                    ? "scale-125 z-30 opacity-80"
                    : pendingDeliveryDateChange?.id === dg.id
                      ? "scale-110 z-20"
                      : "hover:scale-110"
                }`}
                style={{
                  left: `${leftPct}%`,
                  transform: "translateX(-50%)",
                  height: `${connectorHeight + 48}px`,
                }}
                onMouseDown={onDeliveryDragStart(dg)}
                title="Drag to move · Click to view"
              >
                <div
                  className="relative z-10 flex flex-col items-center"
                  style={{ paddingTop: `${connectorHeight}px` }}
                >
                  <div
                    className={`${dg.color} rounded-full w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold shadow-sm border-2 border-white ${
                      draggingDelivery?.id === dg.id ? "ring-2 ring-sky-400 ring-offset-1" : ""
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="text-[7px] font-bold text-slate-600 whitespace-nowrap mt-0.5 bg-white/90 px-0.5 rounded">
                    {dg.label}
                  </div>
                  <div className="text-[7px] text-slate-400 whitespace-nowrap bg-white/90 px-0.5 rounded">
                    {dateLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending date-change confirmation strip */}
      {pendingDeliveryDateChange && (
        <div className="mx-4 mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-900">
                Change {pendingDeliveryDateChange.label} date?
              </div>
              <div className="text-[10px] text-amber-800">
                {pendingDeliveryDateChange.oldDateLabel} → {pendingDeliveryDateChange.newDateLabel}
                {pendingDeliveryDateChange.isFinal
                  ? " This will also update the expected return date."
                  : ""}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPendingDeliveryDateChange(null)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[10px] font-bold text-amber-800 hover:bg-amber-100"
              >
                Keep current
              </button>
              <button
                type="button"
                onClick={() => applyDeliveryDateChange(pendingDeliveryDateChange)}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700"
              >
                Confirm change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address legend — color-coded */}
      {bands.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Addresses:</span>
            {bands
              .filter((b, bi, arr) => arr.findIndex((x) => x.label === b.label) === bi)
              .map((b, bi) => (
                <div key={bi} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm ${b.color}`} />
                  <span className="text-[9px] font-bold text-slate-600">{b.label}</span>
                  {b.address && (
                    <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{b.address}</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};
