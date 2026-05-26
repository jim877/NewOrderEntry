// @ts-nocheck
// Name parsing + initials. Pure, no React.

export const getInitials = (name = "") => {
  const parts = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SR";
  const filtered = parts.filter((p) => !["SALES", "REP", "REPRESENTATIVE"].includes(p.toUpperCase()));
  const useParts = filtered.length ? filtered : parts;
  const first = useParts[0][0] || "";
  const last = useParts.length > 1 ? useParts[useParts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

export const splitName = (name = "") => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") };
};

// getRepInitials — handles "Last, First — Sales Rep" style by stripping the trailing comma part.
export const getRepInitials = (name = "") => {
  const base = (name || "").split(",")[0] || name;
  return getInitials(base);
};
