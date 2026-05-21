// @ts-nocheck
// useVoiceNote — Web Speech API wrapper for transcribing voice notes into a target field.
// Tracks which target is recording so the UI can show an "active" state. Auto-stops on unmount.

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceTarget = { rKey: string; index: number };

export const useVoiceNote = () => {
  const [voiceTarget, setVoiceTarget] = useState<VoiceTarget | null>(null);
  const recRef = useRef<any>(null);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (rec) {
      try { rec.onend = null; rec.onerror = null; rec.stop(); } catch { /* ignore */ }
      recRef.current = null;
    }
    setVoiceTarget(null);
  }, []);

  const isRecording = useCallback(
    (target: VoiceTarget) => voiceTarget?.rKey === target.rKey && voiceTarget?.index === target.index,
    [voiceTarget],
  );

  // toggle — if `target` is currently recording, stop. Otherwise stop any prior recording and start fresh.
  // `baseText` is the existing note value; the transcript appends to it.
  // `onTranscript(text)` receives the updated string each time a final result arrives.
  const toggle = useCallback(
    (target: VoiceTarget, baseText: string, onTranscript: (text: string) => void) => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      if (isRecording(target)) { stop(); return; }
      stop();
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      const base = baseText || "";
      rec.onresult = (e: any) => {
        let text = base;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) text += (text ? " " : "") + e.results[i][0].transcript.trim();
        }
        onTranscript(text);
      };
      rec.onerror = () => { recRef.current = null; setVoiceTarget(null); };
      rec.onend   = () => { recRef.current = null; setVoiceTarget(null); };
      rec.start();
      recRef.current = rec;
      setVoiceTarget(target);
    },
    [isRecording, stop],
  );

  useEffect(() => () => { stop(); }, [stop]);

  return { voiceTarget, isRecording, toggle, stop };
};
