// @ts-nocheck
// Empty-state setup panel shown inside the Rush Guide when there isn't
// yet enough signal (no repair type AND no living situation AND no
// estimated return) to compute the action plan. Walks the user through
// three required questions (Living / How long / Final delivery) plus a
// chip row showing which optional interview answers also enhance the
// guide.

import React from "react";
import { RUSH_REPAIR_TIMELINES } from "../../config";
import { safeUid } from "../../utils/uid";
import { rushAddDays, rushFormatDate, parseLocalDate } from "../../utils/dateTime";
import { formatShortTimestamp } from "../../utils/dateTime";

type Props = {
  data: any;
  update: (key: string, value: any) => void;
  setData: (updater: (prev: any) => any) => void;
  addressPayloadFromChoice: (choice: string) => { address: string; addressType: string; addressId: string };
  onCloseAndOpenInterview: () => void;
  onCloseAndOpenInterviewExpanded: () => void;
};

export const RushGuideSetupPanel: React.FC<Props> = ({
  data,
  update,
  setData,
  addressPayloadFromChoice,
  onCloseAndOpenInterview,
  onCloseAndOpenInterviewExpanded,
}) => {
  const livingAnswered = !!data.livingStatus || (data.livingTimeline || []).length > 0;
  const unit = (data as any).timeAwayUnit || "months";
  const val = (data as any).estimatedTimeAwayValue || 0;
  const maxVal = unit === "weeks" ? 8 : 18;
  const durLabel = val === 0
    ? "Not set"
    : `${val} ${unit === "weeks" ? (val === 1 ? "week" : "weeks") : (val === 1 ? "month" : "months")}`;
  const hasDuration = val > 0;
  const hasDate = !!(data.estimatedReturnDate || data.storageMonths || data.repairsSummary);
  const stepNum = data.livingStatus === "Staying in home" ? "2" : "3";

  const onStayingHome = () => {
    const payload = addressPayloadFromChoice("type:Primary");
    update("livingTimeline", [
      {
        id: safeUid(),
        type: "Staying in home",
        duration: "Until repairs done",
        endDate: "",
        address: payload.address,
        addressType: payload.addressType,
        addressId: payload.addressId,
      },
    ]);
    update("livingStatus", "Staying in home");
    setData((p) => ({
      ...p,
      interviewLog: {
        ...(p.interviewLog || {}),
        living: { user: p.currentUser || "Unknown", at: formatShortTimestamp() },
      },
    }));
  };

  const onStayingElsewhere = () => {
    if (
      data.livingStatus !== "Not staying in home" &&
      data.livingStatus !== "Staying in home" &&
      !data.livingStatus
    ) {
      update("livingStatus", "Not staying in home");
    }
    onCloseAndOpenInterviewExpanded();
  };

  const enhancingQuestions = [
    { label: "Packout items", done: (data.packoutSummary || []).length > 0 },
    {
      label: "Conditions",
      done: !!(data.damageWasWet || data.damageMoldMildew || data.structuralElectricDamage === "Y"),
    },
    { label: "Considerations", done: (data.sdsConsiderations || []).length > 0 },
    { label: "Activities", done: (data.rushInterests || []).length > 0 },
    { label: "Upcoming events", done: (data.upcomingEvents || []).length > 0 },
    { label: "Pets", done: (data.household || []).some((m: any) => m.category === "pet") },
  ];

  return (
    <div className="py-8 space-y-4 max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-4xl mb-2">📋</div>
        <div className="text-lg font-bold text-slate-700">Set up the Rush Guide</div>
        <p className="text-sm text-slate-500 mt-1">
          Answer these questions to generate the delivery timeline.
        </p>
      </div>

      {/* Required: Living Status — inline answer */}
      <div
        className={`rounded-xl border-2 p-4 ${
          livingAnswered ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-2">
          <span
            className={`text-lg mt-0.5 ${livingAnswered ? "text-emerald-500" : "text-amber-500"}`}
          >
            {livingAnswered ? "✓" : "1"}
          </span>
          <div className="flex-1 space-y-2">
            <div className="text-sm font-bold text-slate-700">
              Will the customer be able to stay in the home?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onStayingHome}
                className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${
                  data.livingStatus === "Staying in home"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300"
                }`}
              >
                Yes, staying home
              </button>
              <button
                type="button"
                onClick={onStayingElsewhere}
                className={`rounded-xl border-2 px-4 py-3 text-[13px] font-bold transition-all ${
                  data.livingStatus && data.livingStatus !== "Staying in home"
                    ? "border-sky-400 bg-sky-50 text-sky-700"
                    : "border-slate-200 text-slate-600 hover:border-sky-300"
                }`}
              >
                No, staying elsewhere
              </button>
            </div>
            {data.livingStatus && (data.livingTimeline || []).length > 0 && (
              <div className="text-xs text-emerald-600">
                {(data.livingTimeline || []).map((s: any) => s.type).join(" → ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Q2: How long will they be out (only when not staying in home) */}
      {data.livingStatus && data.livingStatus !== "Staying in home" && (
        <div
          className={`rounded-xl border-2 p-4 ${
            hasDuration ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
          }`}
        >
          <div className="flex items-start gap-2">
            <span
              className={`text-lg mt-0.5 ${hasDuration ? "text-emerald-500" : "text-amber-500"}`}
            >
              {hasDuration ? "✓" : "2"}
            </span>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-700">How long will they be out?</div>
                <div className="text-sm font-bold text-teal-700">{durLabel}</div>
              </div>
              <div className="flex rounded-full border border-slate-200 overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => {
                    update("timeAwayUnit", "weeks");
                    update("estimatedTimeAwayValue", Math.min(val, 8));
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold ${
                    unit === "weeks" ? "bg-sky-500 text-white" : "bg-white text-slate-500"
                  }`}
                >
                  Weeks
                </button>
                <button
                  type="button"
                  onClick={() => update("timeAwayUnit", "months")}
                  className={`px-2.5 py-1 text-[10px] font-bold ${
                    unit === "months" ? "bg-sky-500 text-white" : "bg-white text-slate-500"
                  }`}
                >
                  Months
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={maxVal}
                step={1}
                value={val}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  update("estimatedTimeAwayValue", v || "");
                  update("timeAwayUnit", unit);
                  update("estimatedMonthsAway", unit === "months" ? v : "");
                }}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[9px] text-slate-400">
                {unit === "weeks" ? (
                  <>
                    <span>0</span>
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                    <span>8</span>
                  </>
                ) : (
                  <>
                    <span>0</span>
                    <span>3</span>
                    <span>6</span>
                    <span>9</span>
                    <span>12</span>
                    <span>15</span>
                    <span>18</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Q2/3: Final delivery or return date */}
      <div
        className={`rounded-xl border-2 p-4 ${
          hasDate ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-2">
          <span className={`text-lg mt-0.5 ${hasDate ? "text-emerald-500" : "text-amber-500"}`}>
            {hasDate ? "✓" : stepNum}
          </span>
          <div className="flex-1 space-y-3">
            <div className="text-sm font-bold text-slate-700">
              When is the final delivery or in-home date?
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Target date</div>
                <input
                  type="date"
                  defaultValue={data.estimatedReturnDate || ""}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== data.estimatedReturnDate) {
                      update("estimatedReturnDate", e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-teal-400"
                />
              </div>
              <div className="text-[10px] text-slate-400 pt-4">or</div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                  Storage months
                </div>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={data.storageMonths || ""}
                  onChange={(e) => update("storageMonths", e.target.value)}
                  placeholder="#"
                  className="w-16 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-teal-400 text-center"
                />
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                Or estimate from repair type
              </div>
              <div className="flex flex-wrap gap-1">
                {RUSH_REPAIR_TIMELINES.map((r: any) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => update("repairsSummary", r.label)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${
                      (data.repairsSummary || "").includes(r.label)
                        ? "border-teal-400 bg-teal-50 text-teal-700"
                        : "border-slate-300 text-slate-500 hover:border-slate-400 bg-white"
                    }`}
                  >
                    {r.label} ({r.days}d)
                  </button>
                ))}
              </div>
            </div>
            {hasDate && (() => {
              const ri = RUSH_REPAIR_TIMELINES.find((r: any) => (data.repairsSummary || "").includes(r.label));
              const explicit = parseLocalDate(data.estimatedReturnDate);
              const fromRepairs = ri ? rushAddDays(new Date(), ri.days) : null;
              const fromStorage = data.storageMonths
                ? rushAddDays(new Date(), parseInt(data.storageMonths) * 30)
                : null;
              const est = explicit || fromRepairs || fromStorage;
              return est ? (
                <div className="rounded-lg bg-teal-100 border border-teal-200 px-3 py-1.5 text-xs text-teal-800 font-bold">
                  Estimated final: {rushFormatDate(est)}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* Enhancing questions chip row */}
      <div className="text-xs text-slate-400 text-center pt-1">
        These questions also enhance the Rush Guide:
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {enhancingQuestions.map((q) => (
          <span
            key={q.label}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              q.done
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 text-slate-400"
            }`}
          >
            {q.done ? "✓" : "○"} {q.label}
          </span>
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={onCloseAndOpenInterview}
          className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
        >
          Open Full Interview
        </button>
      </div>
    </div>
  );
};
