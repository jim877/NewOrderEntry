// @ts-nocheck
// useCamera — encapsulates getUserMedia lifecycle for the Scope Wizard's photo capture.
// Falls back to a file input on failure. Caller wires the returned `videoRef` into a <video>.

import { useCallback, useEffect, useRef, useState } from "react";

export const useCamera = () => {
  const camStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const startCamera = useCallback(async (fallbackInput?: HTMLInputElement | null) => {
    setCameraError("");
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        // environment camera unavailable (e.g. desktop Mac) — try any camera.
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      }
      camStreamRef.current = stream;
      setCameraActive(true);
      // Defer srcObject — the video element mounts on the next render after setCameraActive.
      const connectStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      };
      requestAnimationFrame(connectStream);
      setTimeout(connectStream, 100);
      setTimeout(connectStream, 500);
      // Fallback: if 3s in the video still has no data, surface a friendly error.
      setTimeout(() => {
        if (videoRef.current && !videoRef.current.videoWidth && camStreamRef.current) {
          setCameraError("Camera stream not rendering. Choose a photo from files instead.");
        }
      }, 3000);
    } catch {
      setCameraError("Camera unavailable in this browser. Choose a photo instead.");
      setCameraActive(false);
      fallbackInput?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  // Always release the stream when the host unmounts.
  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  return { videoRef, camStreamRef, cameraActive, cameraError, setCameraError, startCamera, stopCamera };
};
