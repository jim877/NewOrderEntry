// @ts-nocheck
// updateSdsPhotoNote — pure reducer for the SDS document's
// onPhotoNoteChange callback. Routes the note write to either scopePhotos
// (walkthrough capture, keyed by "<rKey>-<ts>") or sdsPhotos (manually
// added, keyed by id). The photoId prefix is the discriminator: scope
// photos get a "scope-" prefix when the SDS doc surfaces them.

// updateSdsPhotoNote — return the next order data after applying a note
// edit. Caller wraps this in setData(prev => updateSdsPhotoNote(prev, ...))
// so the React glue stays in App.
export const updateSdsPhotoNote = (prev: any, photoId: string, note: string): any => {
  if (photoId.startsWith("scope-")) {
    // photoId shape: scope-<rKey1>-<rKey2>-<ts>  (rKey is itself "<a>-<b>")
    const parts = photoId.replace("scope-", "").split("-");
    const rKey = `${parts[0]}-${parts[1]}`;
    const ts = Number(parts[2]);
    const scopePhotos = { ...(prev as any).scopePhotos };
    if (scopePhotos[rKey]) {
      scopePhotos[rKey] = scopePhotos[rKey].map((p: any) => (p.ts === ts ? { ...p, note } : p));
    }
    return { ...prev, scopePhotos };
  }
  return {
    ...prev,
    sdsPhotos: (prev.sdsPhotos || []).map((p: any) => (p.id === photoId ? { ...p, note } : p)),
  };
};
