import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyPremium } from "./premium.functions";

export function useAuthUser() {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return { user, loading };
}

export function usePremium() {
  const { user, loading } = useAuthUser();
  const getMyPremiumFn = useServerFn(getMyPremium);
  const q = useQuery({
    queryKey: ["my-premium", user?.id ?? "anon"],
    queryFn: () => getMyPremiumFn(),
    enabled: !!user,
    staleTime: 30_000,
  });
  return {
    user,
    authLoading: loading,
    isPremium: !!q.data?.isPremium,
    isLoading: q.isLoading,
  };
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
