import { useEffect, useState } from "react";

const KEY = "bom_premium_v1";

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "true";
}

export function setPremium(v: boolean) {
  localStorage.setItem(KEY, v ? "true" : "false");
  window.dispatchEvent(new Event("bom-premium-change"));
}

export function usePremium() {
  const [premium, setP] = useState(false);
  useEffect(() => {
    setP(isPremium());
    const h = () => setP(isPremium());
    window.addEventListener("bom-premium-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bom-premium-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return premium;
}

export function speakKorean(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("Your browser doesn't support speech playback.");
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.92;
  u.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const ko = voices.find((v) => v.lang?.toLowerCase().startsWith("ko"));
  if (ko) u.voice = ko;
  window.speechSynthesis.speak(u);
}
