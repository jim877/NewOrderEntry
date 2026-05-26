// @ts-nocheck
// Generic search helpers — accept either string options or {label, value} objects.

export const getOptionText = (opt: any) => {
  if (typeof opt === "string") return opt;
  if (!opt) return "";
  return String(opt.label ?? opt.value ?? "");
};

// getBestMatch — startsWith first, then includes. Returns "" if nothing matches.
export const getBestMatch = (options: any[] = [], query: string) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return "";
  const starts = options.find((o) => getOptionText(o).toLowerCase().startsWith(q));
  if (starts) return getOptionText(starts);
  const includes = options.find((o) => getOptionText(o).toLowerCase().includes(q));
  return includes ? getOptionText(includes) : "";
};
