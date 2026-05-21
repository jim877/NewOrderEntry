// @ts-nocheck
// Pure image utilities. No React, no state.

// compressImage — load `src` (data URL or http URL), downscale to `maxWidth`, return JPEG dataURL.
// Resolves with the original src on load/canvas failure so callers always get something usable.
export const compressImage = (src: string, maxWidth = 1200): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(src); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

// captureFrameFromVideo — pull a frame from an HTMLVideoElement as a downscaled JPEG dataURL.
// Returns undefined if the video isn't ready (no width yet).
export const captureFrameFromVideo = (vid: HTMLVideoElement | null, maxWidth = 1200): string | undefined => {
  if (!vid || !vid.videoWidth) return undefined;
  const canvas = document.createElement("canvas");
  const scale = vid.videoWidth > maxWidth ? maxWidth / vid.videoWidth : 1;
  canvas.width = Math.round(vid.videoWidth * scale);
  canvas.height = Math.round(vid.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
};
