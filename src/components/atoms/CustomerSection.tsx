// @ts-nocheck
// Section 2 — Customer. Renders the customers list (via CustomerItem),
// the "+ Add Another Customer" button, the Household card with the
// people + pets editor, the Done/Next footer, and the link out to the
// Customer Interview panel. The household editor's emoji icon helpers
// and the petStr-sync handlers live inside this atom.

import React from "react";
import { Section } from "./Section";
import { CustomerItem } from "./CustomerItem";
import { Select } from "./Select";
import { initCustomer } from "../../utils/orderFactories";
import { safeUid } from "../../utils/uid";

const PET_TYPES = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Snake", "Lizard", "Turtle", "Horse", "Other"];
const PERSON_TYPES = ["Child", "Infant", "Elderly", "Housekeeper", "Caretaker", "Tenant", "Roommate", "Other"];

const getPetIcon = (text: string) => {
  const t = (text || "").toLowerCase();
  if (/\bdog\b/.test(t)) return "🐕";
  if (/\bcat\b/.test(t)) return "🐈";
  if (/\bbird\b/.test(t)) return "🐦";
  if (/\bfish\b/.test(t)) return "🐟";
  if (/\brabbit\b/.test(t)) return "🐇";
  if (/\bhamster\b/.test(t)) return "🐹";
  if (/\bsnake|lizard|turtle\b/.test(t)) return "🐍";
  if (/\bhorse\b/.test(t)) return "🐴";
  return "🐕";
};

const getPersonIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (/child|infant|baby/.test(t)) return "👶";
  if (/elderly/.test(t)) return "🧓";
  if (/housekeeper|caretaker/.test(t)) return "🏠";
  return "👤";
};

type Props = {
  data: any;
  contacts: string[];
  isOpen: boolean;
  compact: boolean;
  auditOn: boolean;
  auditOutline: boolean;
  householdEditOpen: boolean;
  setHouseholdEditOpen: (open: boolean) => void;
  interviewPanelOpen: boolean;
  setInterviewPanelOpen: (open: boolean) => void;
  orderPoc: any;
  setOrderPoc: (poc: any) => void;
  update: (key: string, value: any) => void;
  setData: (updater: (prev: any) => any) => void;
  setToast: (msg: string) => void;
  updateCust: (id: string, patch: any) => void;
  removeCust: (id: string, index: number) => void;
  addNewCustomer: () => void;
  addHouseholdMember: (name: string) => void;
  handleSendWelcome: (customerId: string, options?: any) => void;
  handleToggleSection: (sectionId: string) => void;
  goToNextSection: (currentId: string) => void;
  handleNextSectionKeyDown: (e: React.KeyboardEvent, currentId: string) => void;
};

export const CustomerSection: React.FC<Props> = ({
  data,
  contacts,
  isOpen,
  compact,
  auditOn,
  auditOutline,
  householdEditOpen,
  setHouseholdEditOpen,
  interviewPanelOpen,
  setInterviewPanelOpen,
  orderPoc,
  setOrderPoc,
  update,
  setData,
  setToast,
  updateCust,
  removeCust,
  addNewCustomer,
  addHouseholdMember,
  handleSendWelcome,
  handleToggleSection,
  goToNextSection,
  handleNextSectionKeyDown,
}) => {
  const members = data.household || [];
  const people = members.filter((m: any) => m.category === "person");
  const pets = members.filter((m: any) => m.category === "pet");

  const setHousehold = (next: any[]) => {
    update("household", next);
    const petStr = next
      .filter((m: any) => m.category === "pet")
      .map((p: any) => [p.type, p.name].filter(Boolean).join(" "))
      .filter(Boolean)
      .join(", ");
    update("householdAnimals", petStr);
    const sdsC = data.sdsConsiderations || [];
    if (petStr && !sdsC.includes("Pets")) update("sdsConsiderations", [...sdsC, "Pets"]);
    if (!petStr && sdsC.includes("Pets")) update("sdsConsiderations", sdsC.filter((s: string) => s !== "Pets"));
  };

  const addMember = (category: "person" | "pet", type: string) => {
    const newId = safeUid();
    setHousehold([...members, { id: newId, category, type: type || (category === "pet" ? "Dog" : "Child"), name: "" }]);
    setTimeout(() => {
      const input = document.querySelector(`[data-household-id="${newId}"]`) as HTMLInputElement | null;
      if (input) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus();
      }
    }, 100);
  };

  const updateMember = (id: string, field: string, val: string) => {
    setHousehold(members.map((m: any) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const removeMember = (id: string) => {
    setHousehold(members.filter((m: any) => m.id !== id));
  };

  const promoteToCustomer = (member: any) => {
    const nameParts = (member.name || "").trim().split(/\s+/);
    const first = nameParts[0] || "";
    const last = nameParts.slice(1).join(" ") || "";
    setData((p) => ({
      ...p,
      customers: [...p.customers, initCustomer({ first, last, type: member.type || "Household" })],
      household: (p.household || []).filter((m: any) => m.id !== member.id),
    }));
    setToast(`${member.name || "Member"} promoted to customer`);
  };

  return (
    <Section
      id="sec2"
      noeSection="customer"
      title="2. Customer"
      helpText="The primary person(s) we are performing work for and their contacts or representatives."
      isOpen={isOpen}
      onHeaderClick={() => handleToggleSection("sec2")}
      onCaretClick={() => handleToggleSection("sec2")}
      compact={compact}
      className={auditOutline ? "audit-outline" : ""}
    >
      <div className="space-y-4">
        {(data.customers || []).map((c: any, i: number) => (
          <CustomerItem
            key={c.id}
            c={c}
            index={i}
            total={data.customers.length}
            updateCust={updateCust}
            onRemove={removeCust}
            highlightMissing={data.highlightMissing}
            auditOn={auditOn}
            onAddHousehold={addHouseholdMember}
            onSendWelcome={handleSendWelcome}
            contacts={contacts}
            sdsConsiderations={data.sdsConsiderations || []}
            householdAnimals={data.householdAnimals || ""}
            onUpdatePets={(animals: string, considerations: string[]) => {
              update("householdAnimals", animals);
              update("sdsConsiderations", considerations);
            }}
            household={data.household || []}
            orderPoc={orderPoc}
            onSetOrderPoc={setOrderPoc}
            salesRep={data.salesRep || ""}
            orderUseSalesRepOnly={!!(data as any).useSalesRepOnly}
          />
        ))}
        <div className="pt-2">
          <button
            onClick={addNewCustomer}
            className="w-full rounded-lg border-2 border-dashed border-slate-300 p-3 text-sm font-bold text-slate-500 hover:border-sky-500 hover:text-sky-600 transition-colors"
          >
            + Add Another Customer
          </button>
        </div>

        {/* Household card */}
        <div
          id="household-pets"
          className={`rounded-xl border bg-white shadow-sm ${
            householdEditOpen
              ? "border-slate-200 px-4 py-3"
              : "border-slate-100 px-4 py-2.5 cursor-pointer hover:border-slate-200 transition-colors"
          }`}
          data-noe-subsection="household"
          onClick={!householdEditOpen ? () => setHouseholdEditOpen(true) : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🏠</span>
            <span className="text-xs font-bold text-slate-700">Other Household Members</span>
            <div className="flex-1" />
            {householdEditOpen && (
              <>
                <Select
                  value=""
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { if (e.target.value) addMember("person", e.target.value); }}
                  className="!w-auto !text-xs !py-1.5 !text-sky-600 !border-sky-200 !bg-sky-50/50"
                >
                  <option value="">👤 + Person</option>
                  {PERSON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Select
                  value=""
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { if (e.target.value) addMember("pet", e.target.value); }}
                  className="!w-auto !text-xs !py-1.5 !text-sky-600 !border-sky-200 !bg-sky-50/50"
                >
                  <option value="">🐕 + Pet</option>
                  {PET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 mb-1">
            Children, pets, and others at the home who aren't a contact on the order.
          </div>

          {!householdEditOpen ? (
            members.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {members.map((m: any) => {
                  const icon = m.category === "pet" ? getPetIcon(m.type) : getPersonIcon(m.type);
                  const label = m.name ? `${m.type} (${m.name.split(/\s+/)[0]})` : m.type;
                  return <span key={m.id} className="text-xs text-slate-600">{icon} {label}</span>;
                })}
              </div>
            ) : null
          ) : (
            <>
              {members.length > 0 && (
                <div className="space-y-1">
                  {people.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        People ({people.length})
                      </div>
                      {people.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-1.5 h-8">
                          <span className="text-sm shrink-0">{getPersonIcon(m.type)}</span>
                          <span className="text-[11px] font-semibold text-slate-600 w-[72px] shrink-0 truncate">
                            {m.type || "Person"}
                          </span>
                          <input
                            data-household-id={m.id}
                            value={m.name || ""}
                            onChange={(e) => updateMember(m.id, "name", e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (m.name?.trim()) setHouseholdEditOpen(false); } }}
                            placeholder="Name"
                            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400"
                          />
                          <input
                            value={m.age || ""}
                            onChange={(e) => updateMember(m.id, "age", e.target.value)}
                            placeholder="Age"
                            className="w-12 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400 text-center"
                          />
                          {m.name && (
                            <button
                              type="button"
                              onClick={() => promoteToCustomer(m)}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-700 shrink-0 whitespace-nowrap"
                              title="Promote to customer with contact details"
                            >
                              Make Contact
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMember(m.id)}
                            className="text-slate-400 hover:text-rose-500 text-xs shrink-0"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                  {pets.length > 0 && (
                    <>
                      {people.length > 0 && <div className="border-t border-slate-100 my-0.5" />}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pets ({pets.length})
                      </div>
                      {pets.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-1.5 h-8">
                          <span className="text-sm shrink-0">{getPetIcon(m.type)}</span>
                          <span className="text-[11px] font-semibold text-slate-600 w-[72px] shrink-0 truncate">
                            {m.type || "Pet"}
                          </span>
                          <input
                            data-household-id={m.id}
                            value={m.name || ""}
                            onChange={(e) => updateMember(m.id, "name", e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (m.name?.trim()) setHouseholdEditOpen(false); } }}
                            placeholder="Name, breed, notes"
                            className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none focus:border-sky-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeMember(m.id)}
                            className="text-slate-400 hover:text-rose-500 text-xs shrink-0"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
              <div className="flex justify-end pt-2 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHouseholdEditOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => handleToggleSection("sec2")}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Done
          </button>
          <button
            onClick={() => goToNextSection("sec2")}
            onKeyDown={(e) => handleNextSectionKeyDown(e, "sec2")}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-500"
          >
            Next
          </button>
        </div>

        {/* Interview link */}
        <button
          type="button"
          onClick={() => setInterviewPanelOpen(true)}
          className={`w-full rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between transition-all ${
            interviewPanelOpen
              ? "border-indigo-400 bg-indigo-50"
              : "border-indigo-200 bg-indigo-50/30 hover:border-indigo-300"
          }`}
        >
          <div>
            <div className="text-sm font-bold text-violet-700">Customer Interview</div>
            <div className="text-[11px] text-violet-500 mt-0.5">
              Living situation, delivery, packout, medical, pets, interests
            </div>
          </div>
          <span className="text-violet-400 text-lg">›</span>
        </button>
      </div>
    </Section>
  );
};
