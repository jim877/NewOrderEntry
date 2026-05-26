// @ts-nocheck
import React from "react";
import { OUTBOUND_ACTIONS } from "../../config";

type Props = {
  // Order data slices used to auto-queue suggestions and read current state.
  customers: any[];
  eventCustomerContacted?: boolean;
  pickupDate?: string;
  queuedOutbound: string[];
  dismissedOutbound: string[];
  // Setters — flat because they bridge two unrelated state arrays on `data`.
  setQueuedOutbound: (next: string[]) => void;
  setDismissedOutbound: (next: string[]) => void;
};

// Reasons for auto-suggesting each action. Derived from order data — when a
// reason is live and the user hasn't dismissed it, the action shows as
// "Suggested" with the reason as a tiny tagline.
const computeAutoQueued = (
  customers: any[] = [],
  eventCustomerContacted?: boolean,
  pickupDate?: string,
): Record<string, string> => {
  const out: Record<string, string> = {};
  if (customers.some((c) => c?.sendWelcomeText)) out["sendWelcomeText"] = "Welcome text was toggled on a customer";
  if (customers.some((c) => c?.sendRushGuide)) out["sendRushGuide"] = "Rush Guide was toggled on a customer";
  if (eventCustomerContacted) out["sendConfirmation"] = "Customer was marked as contacted";
  if (pickupDate) out["sendConfirmation"] = "Appointment scheduled";
  return out;
};

// OutboundActionsPanel — the Save Summary modal's queue of outbound
// messages. Each OUTBOUND_ACTION renders as a card; clicking toggles
// between queued / dismissed / inactive. Auto-suggestions come from
// computeAutoQueued and show a "Suggested" pill until the user dismisses
// or replaces them. Footer summary line appears when at least one is
// explicitly queued.
export const OutboundActionsPanel = ({
  customers, eventCustomerContacted, pickupDate,
  queuedOutbound, dismissedOutbound,
  setQueuedOutbound, setDismissedOutbound,
}: Props) => {
  const autoQueued = computeAutoQueued(customers, eventCustomerContacted, pickupDate);

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Outbound Actions</div>
        <span className="text-[9px] text-teal-500">Queued for send on save</span>
      </div>
      <div className="space-y-2">
        {OUTBOUND_ACTIONS.map((action) => {
          const isQueued = queuedOutbound.includes(action.key);
          const isDismissed = dismissedOutbound.includes(action.key);
          const wasAutoQueued = !isDismissed && autoQueued[action.key];
          const isActive = isQueued || !!wasAutoQueued;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                if (isQueued) {
                  setQueuedOutbound(queuedOutbound.filter((k) => k !== action.key));
                } else if (wasAutoQueued) {
                  setDismissedOutbound([...dismissedOutbound, action.key]);
                } else {
                  setQueuedOutbound([...queuedOutbound, action.key]);
                  setDismissedOutbound(dismissedOutbound.filter((k) => k !== action.key));
                }
              }}
              className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all ${isActive ? "border-teal-400 bg-teal-100/60" : "border-slate-200 bg-white hover:border-teal-300"}`}
            >
              <span className="text-base shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold ${isActive ? "text-teal-800" : "text-slate-700"}`}>{action.label}</div>
                <div className="text-[10px] text-slate-500">{action.desc}</div>
                {wasAutoQueued && <div className="text-[9px] text-teal-600 mt-0.5">{wasAutoQueued}</div>}
              </div>
              {isActive && <span className="rounded-full bg-teal-500 text-white px-2 py-0.5 text-[9px] font-bold shrink-0">{isQueued ? "Queued" : "Suggested"}</span>}
            </button>
          );
        })}
      </div>
      {queuedOutbound.length > 0 && (
        <div className="text-[10px] text-teal-600 font-semibold">{queuedOutbound.length} action(s) will execute on save</div>
      )}
    </div>
  );
};
