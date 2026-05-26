// @ts-nocheck
// Pure merger that combines manually-added SDS photos (data.sdsPhotos) with
// walkthrough captures (data.scopePhotos, keyed by "<fi>-<ri>"). Used by the
// SdsDocument render path so the doc sees one flat list of {id, src, room,
// ...} regardless of which mode produced the photo.

// mergeSdsPhotos — flatten manual + walkthrough photos into a single list,
// de-duped by id. Walkthrough photos get a "scope-<rKey>-<ts>" id and use
// their photo.roomName when present, otherwise the helper reconstructs
// "Room N-M" from propertyRooms by mapping fi/ri back to floor groupings.
export const mergeSdsPhotos = (
  manualSdsPhotos: any[] = [],
  scopePhotos: Record<string, any[]> = {},
  propertyRooms: any[] = [],
): any[] => {
  const seen = new Set(manualSdsPhotos.map((p) => p.id));
  const merged = [...manualSdsPhotos];
  // Reconstruct floor groupings so we can map fi/ri → flat propertyRooms index.
  const floors = [...new Set(propertyRooms.map((r: any) => r.floor))];

  Object.entries(scopePhotos).forEach(([rKey, photos]: [string, any[]]) => {
    const [fi, ri] = rKey.split("-").map(Number);
    let fallbackName = "";
    if (propertyRooms.length > 0) {
      let idx = 0;
      for (let f = 0; f < fi && f < floors.length; f++) {
        idx += propertyRooms.filter((r: any) => r.floor === floors[f]).length;
      }
      idx += ri;
      fallbackName = propertyRooms[idx]?.name || "";
    }
    (photos || []).forEach((photo: any) => {
      const id = `scope-${rKey}-${photo.ts}`;
      if (seen.has(id)) return;
      seen.add(id);
      const roomName = photo.roomName || fallbackName || `Room ${fi + 1}-${ri + 1}`;
      merged.push({
        id,
        src: photo.src,
        room: roomName,
        floor: photo.floor || "",
        note: photo.note || "",
        reason: photo.reason || "",
        ts: photo.ts,
        tag: photo.tag || "",
      });
    });
  });
  return merged;
};
