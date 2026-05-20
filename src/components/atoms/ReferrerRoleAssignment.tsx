// @ts-nocheck
import React from "react";
import { ToggleMulti } from "./ToggleMulti";

// ReferrerRoleAssignment — three quick-pick chips (Referrer / Bill To / Insurance) shown
// after a referrer is set. Toggling Bill To or Insurance writes the referrer onto the
// matching company/contact slots; toggling Referrer clears all.
export const ReferrerRoleAssignment = ({ data, updateMany, referrerDisplayValue, setToast }) => (
  <div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assign roles for this contact</div>
    <div className="flex flex-wrap gap-2">
      <ToggleMulti
        label="Referrer"
        checked
        onChange={() => {
          if (window.confirm(`Remove ${referrerDisplayValue} as referrer? This will also clear any linked roles.`)) {
            updateMany({ referrer: "", referringCompany: "", salesRep: "" });
            setToast?.("Referrer removed");
          }
        }}
        title="Click to remove referrer"
      />
      <ToggleMulti
        label="Bill To"
        checked={!!data.referringCompany && data.billingCompany === data.referringCompany}
        onChange={() => {
          if (data.billingCompany === data.referringCompany) {
            updateMany({ billingCompany: "", billingContact: "", billingPayer: "" });
          } else {
            updateMany({ billingCompany: data.referringCompany, billingContact: data.referrer, billingPayer: "Referrer" });
          }
        }}
      />
      <ToggleMulti
        label="Insurance"
        checked={!!data.referringCompany && data.insuranceCompany === data.referringCompany}
        onChange={() => {
          if (data.insuranceCompany === data.referringCompany) {
            updateMany({ insuranceCompany: "", insuranceAdjuster: "", insuranceClaim: "" });
          } else {
            updateMany({
              insuranceCompany: data.referringCompany,
              insuranceAdjuster: data.referrer,
              insuranceClaim: "Yes",
              involvesInsurance: "Yes",
            });
          }
        }}
      />
    </div>
  </div>
);
