// @ts-nocheck
// Pure computation of the loadList delta driven by Packout Summary
// changes. When the user adds an item to the packout list, the system
// auto-adds linked loadList entries (e.g., "Clothing" -> "Hangers,
// Plastic Bags"). When they remove a packout item, the system offers
// to remove linked loadList entries that aren't required by any
// remaining packout selection.

// computePackoutLoadChanges — given current/previous packout
// selections and current loadList membership, return the set of
// loadList items to auto-add and the set the call site should
// prompt the user to remove.
export const computePackoutLoadChanges = (
  selected: string[],
  previous: string[],
  loadList: string[],
  packoutLoadMap: Record<string, string[]>,
): { added: string[]; removeCandidates: string[]; removedSelections: string[] } => {
  const current = new Set(loadList || []);
  const added: string[] = [];

  (selected || []).forEach((item) => {
    (packoutLoadMap[item] || []).forEach((loadItem) => {
      if (!current.has(loadItem)) {
        current.add(loadItem);
        added.push(loadItem);
      }
    });
  });

  const removedSelections = (previous || []).filter((item) => !selected.includes(item));
  const removeCandidates: string[] = [];
  removedSelections.forEach((item) => {
    (packoutLoadMap[item] || []).forEach((loadItem) => {
      const stillRequired = (selected || []).some((sel) =>
        (packoutLoadMap[sel] || []).includes(loadItem)
      );
      if (!stillRequired && current.has(loadItem) && !removeCandidates.includes(loadItem)) {
        removeCandidates.push(loadItem);
      }
    });
  });

  return { added, removeCandidates, removedSelections };
};
