// @ts-nocheck
// "Important Reminders" callout shown at the bottom of the Rush
// Guide Results. The reminders list comes from buildRushGuideActionPlan.
import React from "react";

type Props = {
  reminders: string[];
};

export const RushGuideReminders: React.FC<Props> = ({ reminders }) => (
  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
    <div className="text-xs font-bold text-amber-800 mb-2">Important Reminders</div>
    <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
      {reminders.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>
  </div>
);
