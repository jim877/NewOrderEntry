// @ts-nocheck
// Pure derivation of the "known people" list — the de-duped roster
// of everyone mentioned anywhere on the order (customers + role
// holders + vendor contacts + quick-add people). Used to seed the
// "@person" mention picker inside the event notes / CRM log fields.
// Each entry is "Name" or "Name - Company" so the dropdown gives
// disambiguating context when the same first name appears twice.

export const buildKnownPeople = (data: any): string[] => {
  const s = new Set<string>();

  (data.customers || []).forEach((c: any) => {
    if (c.first || c.last) s.add(((c.first || "") + " " + (c.last || "")).trim());
  });

  // Adjusters: prefer "Name - Company" when the company is known.
  if (data.insuranceAdjuster) {
    s.add(data.adjusterCompany ? `${data.insuranceAdjuster} - ${data.adjusterCompany}` : data.insuranceAdjuster);
  }
  if (data.publicAdjuster) {
    s.add(data.publicAdjustingCompany ? `${data.publicAdjuster} - ${data.publicAdjustingCompany}` : data.publicAdjuster);
  }
  if (data.independentAdjuster) {
    s.add(data.independentAdjustingCo ? `${data.independentAdjuster} - ${data.independentAdjustingCo}` : data.independentAdjuster);
  }
  if (data.tpaContact) {
    s.add(data.tpaCompany ? `${data.tpaContact} - ${data.tpaCompany}` : data.tpaContact);
  }

  if (data.referrer) {
    s.add(data.referringCompany ? `${data.referrer} - ${data.referringCompany}` : data.referrer);
  }

  Object.entries(data.vendorDetails || {}).forEach(([company, v]: [string, any]) => {
    if (v?.contact) s.add(`${v.contact} - ${company}`);
  });

  (data.peopleQuick || []).forEach((m: any) => {
    if (m.first) s.add(m.first);
  });

  return Array.from(s).filter(Boolean);
};
