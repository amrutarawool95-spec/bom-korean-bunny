import { useEffect, useState } from "react";

const KEY = "bom_premium_v1";
const USED_COUPON_KEY = "bom_used_coupon_v1";

// Valid one-time coupon codes. Each code can only be used once per device.
const VALID_COUPONS = new Set([
  "RKL9M", "P4VTQ", "CJXW2", "L8ZGB", "YND3F", "H7KSR", "BQW5T", "M1VPL",
  "XGZ0N", "D6FCH", "WTY8K", "J2PXR", "N5MBV", "S9LDC", "FQG4H", "T3JWM",
  "V8CZX", "K1RBQ", "ZD7PN", "C6XLT", "G2WJF", "P9HVK", "M4DBR", "LSQ1Y",
  "X3TNG", "B8FMC", "R7VZW", "K0PHD", "J5WYB", "NQ2TL",
]);

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "true";
}

export function setPremium(v: boolean) {
  localStorage.setItem(KEY, v ? "true" : "false");
  window.dispatchEvent(new Event("bom-premium-change"));
}

export function redeemCoupon(rawCode: string): { ok: boolean; error?: string } {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Please enter a coupon code." };
  if (!VALID_COUPONS.has(code)) {
    return { ok: false, error: "Invalid coupon code. Double-check and try again." };
  }
  const used: string[] = JSON.parse(localStorage.getItem(USED_COUPON_KEY) ?? "[]");
  if (used.includes(code)) {
    return { ok: false, error: "This coupon has already been used on this device." };
  }
  used.push(code);
  localStorage.setItem(USED_COUPON_KEY, JSON.stringify(used));
  setPremium(true);
  return { ok: true };
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
