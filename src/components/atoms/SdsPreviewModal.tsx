// @ts-nocheck
// Full-screen SDS Preview wrapper. The top-of-screen tab bar (Order /
// Scope / SDS) + the back button are this atom's chrome; the body
// renders SdsDocument with all the per-order props. Each navigation
// action is a callback so the atom doesn't need access to the App's
// entry-mode setters.
import React from "react";
import SdsDocument from "../../SdsDocument";

type Props = {
  data: any;
  mergedSdsPhotos: any;
  mergedSdsCoverPhoto: any;
  scopeBridgeState: any;
  orderNarrative: any[];
  orderNarrativeProse: string[];
  rushGuideTimeline: any;
  onClose: () => void;
  onGoToOrder: () => void;
  onGoToScope: () => void;
  onPhotoNoteChange: (photoId: string, note: string) => void;
  onNarrativeChange: (prose: string[]) => void;
};

export const SdsPreviewModal: React.FC<Props> = ({
  data,
  mergedSdsPhotos,
  mergedSdsCoverPhoto,
  scopeBridgeState,
  orderNarrative,
  orderNarrativeProse,
  rushGuideTimeline,
  onClose,
  onGoToOrder,
  onGoToScope,
  onPhotoNoteChange,
  onNarrativeChange,
}) => (
  <div
    className="fixed inset-0 z-[200] bg-white flex flex-col"
    onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    tabIndex={-1}
    ref={(el) => { if (el && !el.dataset.focused) { el.dataset.focused = "true"; el.focus(); } }}
  >
    <div className="flex-shrink-0 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-2 shadow-sm z-10 relative">
      <div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
        <button onClick={onGoToOrder} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Order</button>
        <button onClick={onGoToScope} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all">Scope</button>
        <button className="rounded-full px-3 py-1.5 text-xs font-bold bg-white text-sky-700 shadow-sm">SDS</button>
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
      >
        ← Back
      </button>
    </div>
    <div className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
      <SdsDocument
        orderName={data.orderName || ""}
        claimNumber={data.claimNumber || ""}
        insuranceCompany={data.insuranceCompany || ""}
        insuranceAdjuster={data.insuranceAdjuster || ""}
        dateOfLoss={data.dateOfLoss || ""}
        policyNumber={data.policyNumber || ""}
        nationalCarrier={data.nationalCarrier || ""}
        orderTypes={data.orderTypes || []}
        primaryLossType={data.primaryLossType || ""}
        address={(() => {
          const a = (data.addresses || []).find((a: any) => a.isPrimary) || (data.addresses || [])[0] || {};
          return [a.street, a.city, a.state].filter(Boolean).join(", ");
        })()}
        lossSeverity={data.lossSeverity}
        rooms={data.sdsRooms || []}
        lossDetails={data.lossDetails || {}}
        severityCodes={data.severityCodes || []}
        selectedServices={data.sdsServices || []}
        noeServiceOfferings={data.serviceOfferings || []}
        customers={data.customers || []}
        familyMedicalIssues={data.familyMedicalIssues}
        soapFragAllergies={data.soapFragAllergies}
        sdsConsiderations={data.sdsConsiderations || []}
        sdsObservations={data.sdsObservations || []}
        sdsServices={data.sdsServices || []}
        sdsPhotos={mergedSdsPhotos}
        sdsCoverPhoto={mergedSdsCoverPhoto}
        scopeBridge={scopeBridgeState}
        documentType="approval"
        orderNarrative={orderNarrative}
        orderNarrativeProse={orderNarrativeProse}
        rushGuideTimeline={rushGuideTimeline}
        onClose={onClose}
        onPhotoNoteChange={onPhotoNoteChange}
        onNarrativeChange={onNarrativeChange}
      />
    </div>
  </div>
);
