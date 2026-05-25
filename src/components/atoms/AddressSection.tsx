// @ts-nocheck
// Section 3 — Address. Renders the addresses list (via AddressItem
// per address) plus the "+ Add Another Address" button + a quick-add
// purpose-chip row (Hotel/Temporary/Rental/Relative/New Home/Storage)
// that appends a typed placeholder address. Footer has Done / Next.

import React from "react";
import { Section } from "./Section";
import { AddressItem } from "./AddressItem";
import { ToggleMulti } from "./ToggleMulti";
import { initAddress } from "../../utils/orderFactories";
import { createPlaceholderFlag } from "../../utils/order";
import { safeUid } from "../../utils/uid";

const QUICK_PURPOSES = ["Hotel", "Temporary", "Rental", "Relative", "New Home", "Storage"];

type Props = {
  data: any;
  isOpen: boolean;
  compact: boolean;
  auditOn: boolean;
  auditOutline: boolean;
  showPrimaryCoords: boolean;
  pendingAddressTypePromptId: string;
  updateAddr: (id: string, patch: any) => void;
  removeAddr: (id: string) => void;
  update: (key: string, value: any) => void;
  setData: (updater: (prev: any) => any) => void;
  setToast?: (msg: string) => void;
  verifyAddressDemo: (id: string) => void;
  handleAddressTypePromptFocused: (id: string) => void;
  addNewAddress: () => void;
  handleToggleSection: (sectionId: string) => void;
  goToNextSection: (currentId: string) => void;
  handleNextSectionKeyDown: (e: React.KeyboardEvent, currentId: string) => void;
};

export const AddressSection: React.FC<Props> = ({
  data,
  isOpen,
  compact,
  auditOn,
  auditOutline,
  showPrimaryCoords,
  pendingAddressTypePromptId,
  updateAddr,
  removeAddr,
  update,
  setData,
  setToast,
  verifyAddressDemo,
  handleAddressTypePromptFocused,
  addNewAddress,
  handleToggleSection,
  goToNextSection,
  handleNextSectionKeyDown,
}) => {
  const addQuickPlaceholder = (purpose: string) => {
    const id = safeUid();
    setData((p) => ({
      ...p,
      addresses: [
        ...p.addresses,
        initAddress({
          id,
          isPrimary: false,
          isLossSite: false,
          type: purpose,
          placeholder: createPlaceholderFlag("address", `${purpose} — address needed`),
          name: `${purpose} Address`,
        }),
      ],
    }));
    setToast?.(`${purpose} address placeholder added`);
  };

  return (
    <Section
      id="sec3"
      noeSection="address"
      title="3. Address"
      helpText="Enter the job site + any related locations (temp housing, hotel, alt delivery)."
      isOpen={isOpen}
      onHeaderClick={() => handleToggleSection("sec3")}
      onCaretClick={() => handleToggleSection("sec3")}
      compact={compact}
      className={auditOutline ? "audit-outline" : ""}
    >
      <div className="space-y-4">
        {(data.addresses || []).map((a: any, i: number) => (
          <AddressItem
            key={a.id}
            addr={a}
            total={data.addresses.length}
            updateAddr={updateAddr}
            onRemove={removeAddr}
            index={i}
            highlightMissing={data.highlightMissing}
            auditOn={auditOn}
            onVerify={verifyAddressDemo}
            ToggleMulti={ToggleMulti}
            rentOrOwn={data.rentOrOwn}
            rentCoverageLimit={data.rentCoverageLimit}
            onRentOrOwnChange={(v: any) => update("rentOrOwn", v)}
            onRentCoverageChange={(v: any) => update("rentCoverageLimit", v)}
            forceShowCoords={i === 0 ? showPrimaryCoords : false}
            autoOpenForTypePrompt={pendingAddressTypePromptId === a.id}
            autoFocusTypePrompt={pendingAddressTypePromptId === a.id}
            onTypePromptFocused={handleAddressTypePromptFocused}
          />
        ))}
        <div className="pt-2 space-y-2">
          <button
            onClick={addNewAddress}
            className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors"
          >
            + Add Another Address
          </button>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {QUICK_PURPOSES.map((purpose) => (
              <button
                key={purpose}
                type="button"
                onClick={() => addQuickPlaceholder(purpose)}
                className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-[10px] font-bold text-slate-500 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50"
              >
                + {purpose}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => handleToggleSection("sec3")}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Done
          </button>
          <button
            onClick={() => goToNextSection("sec3")}
            onKeyDown={(e) => handleNextSectionKeyDown(e, "sec3")}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500"
          >
            Next
          </button>
        </div>
      </div>
    </Section>
  );
};
