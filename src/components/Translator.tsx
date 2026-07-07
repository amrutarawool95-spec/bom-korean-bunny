import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { translateToKorean, explainKorean, speechStyles, tenseForms } from "@/lib/korean.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, Volume2, Crown } from "lucide-react";
import { GrammarBreakdown } from "./GrammarBreakdown";
import { PremiumDialog } from "./PremiumDialog";
import { usePremium, speakKorean } from "@/lib/premium";

type StyleEntry = { korean: string; romanization?: string; note?: string } | null;
type Styles = { formal: StyleEntry; polite: StyleEntry; casual: StyleEntry };
type TenseEntry = { korean: string; romanization?: string; english?: string; note?: string } | null;
type Tenses = { past: TenseEntry; present: TenseEntry; future: TenseEntry };

const STYLE_META: Record<keyof Styles, { label: string; emoji: string; tag: string }> = {
  formal: { label: "Formal", emoji: "🎩", tag: "하십시오체 · business, elders" },
  polite: { label: "Polite", emoji: "🌸", tag: "해요체 · everyday safe" },
  casual: { label: "Casual", emoji: "💬", tag: "반말 · close friends" },
};

const TENSE_META: Record<keyof Tenses, { label: string; emoji: string; tag: string }> = {
  past: { label: "Past", emoji: "⏪", tag: "-았/었어요" },
  present: { label: "Present", emoji: "🎯", tag: "-아/어요" },
  future: { label: "Future", emoji: "⏩", tag: "-(으)ㄹ 거예요" },
};

export function Translator() {
  const [input, setInput] = useState("");
  const [premiumOpen, setPremiumOpen] = useState(false);
  const { isPremium: premium } = usePremium();
  const translateFn = useServerFn(translateToKorean);
  const explainFn = useServerFn(explainKorean);
  const stylesFn = useServerFn(speechStyles);
  const tensesFn = useServerFn(tenseForms);

  const translate = useMutation({
    mutationFn: (text: string) => translateFn({ data: { text } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const explain = useMutation({
    mutationFn: () => {
      const korean = translate.data?.korean?.trim();
      if (!korean) throw new Error("Translate a sentence first 🌸");
      return explainFn({
        data: { english: input.trim(), korean },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const styles = useMutation({
    mutationFn: () => {
      const korean = translate.data?.korean?.trim();
      if (!korean) throw new Error("Translate a sentence first 🌸");
      return stylesFn({
        data: { english: input.trim(), korean },
      }) as Promise<Styles>;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tenses = useMutation({
    mutationFn: () => {
      const korean = translate.data?.korean?.trim();
      if (!korean) throw new Error("Translate a sentence first 🌸");
      return tensesFn({
        data: { english: input.trim(), korean },
      }) as Promise<Tenses>;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleTranslate = () => {
    if (!input.trim()) return;
    explain.reset();
    styles.reset();
    tenses.reset();
    translate.mutate(input.trim(), {
      onSuccess: (res) => {
        if (premium && res?.korean?.trim()) {
          styles.mutate();
        }
      },
    });
  };

  const handleHear = () => {
    if (!premium) {
      setPremiumOpen(true);
      return;
    }
    const korean = translate.data?.korean?.trim();
    if (!korean) {
      toast.error("Translate a sentence first 🌸");
      return;
    }
    try {
      speakKorean(korean);
    } catch (e) {
      toast.error((e as Error).message);
    }
    if (!styles.data && !styles.isPending) styles.mutate();
  };

  const speak = (text?: string) => {
    if (!text) return;
    try {
      speakKorean(text);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-[var(--shadow-bloom)] backdrop-blur-sm sm:p-8">
        <label className="mb-2 block font-display text-sm font-semibold text-muted-foreground">
          English
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something in English… e.g. “I want to learn Korean because I love K-dramas.”"
          rows={4}
          className="resize-none rounded-2xl border-border bg-petal text-base shadow-inner focus-visible:ring-accent"
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleTranslate}
            disabled={translate.isPending || !input.trim()}
            size="lg"
            className="rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:scale-[1.02] hover:bg-primary/90"
          >
            {translate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Translate to Korean
              </>
            )}
          </Button>
        </div>

        {translate.data && (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-petal to-blossom/40 p-6">
            <p
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              {translate.data.korean}
            </p>
            {translate.data.romanization && (
              <p className="mt-2 text-sm italic text-muted-foreground">
                {translate.data.romanization}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => explain.mutate()}
                disabled={explain.isPending}
                aria-label="Ask the rabbit to explain"
                className="group inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-border transition hover:bg-accent hover:text-accent-foreground hover:ring-accent disabled:opacity-60"
              >
                <span className="text-xl transition-transform group-hover:scale-125 group-hover:-rotate-12">
                  🐰
                </span>
                {explain.isPending ? "Bom-Bunny is thinking…" : "Explain this sentence"}
              </button>

              <button
                onClick={handleHear}
                aria-label={premium ? "Play Korean pronunciation" : "Unlock pronunciation (Premium)"}
                className={
                  premium
                    ? "group inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-border transition hover:bg-accent hover:text-accent-foreground hover:ring-accent"
                    : "group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:scale-[1.03]"
                }
              >
                {premium ? (
                  <>
                    <Volume2 className="h-4 w-4" /> Hear it in Korean
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" /> Hear it in Korean
                    <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Premium
                    </span>
                  </>
                )}
              </button>
            </div>

            {!premium && (
              <p className="mt-3 text-xs text-muted-foreground">
                🔒 Unlock native Korean pronunciation + formal/polite/casual versions for a one-time{" "}
                <b>$2.99</b> —{" "}
                <button
                  onClick={() => setPremiumOpen(true)}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  see what's inside
                </button>
                .
              </p>
            )}

            {premium && (styles.isPending || styles.data) && (
              <div className="mt-6 space-y-3">
                <p className="font-display text-sm font-bold text-foreground/80">
                  Say it three ways · pick the vibe that fits 💕
                </p>
                {styles.isPending && !styles.data && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Crafting formal, polite & casual versions…
                  </div>
                )}
                {styles.data &&
                  (Object.keys(STYLE_META) as Array<keyof Styles>).map((key) => {
                    const entry = styles.data?.[key];
                    if (!entry?.korean) return null;
                    const meta = STYLE_META[key];
                    return (
                      <div
                        key={key}
                        className="rounded-2xl bg-card p-4 ring-1 ring-border"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                              <span>{meta.emoji}</span> {meta.label}
                              <span className="rounded-full bg-petal px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-muted-foreground">
                                {meta.tag}
                              </span>
                            </p>
                            <p
                              className="mt-2 font-display text-lg font-semibold text-foreground sm:text-xl"
                              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                            >
                              {entry.korean}
                            </p>
                            {entry.romanization && (
                              <p className="mt-1 text-xs italic text-muted-foreground">
                                {entry.romanization}
                              </p>
                            )}
                            {entry.note && (
                              <p className="mt-1 text-xs text-foreground/70">💡 {entry.note}</p>
                            )}
                          </div>
                          <button
                            onClick={() => speak(entry.korean)}
                            aria-label={`Hear ${meta.label} version`}
                            className="shrink-0 rounded-full bg-primary/15 p-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {premium && translate.data?.korean && (() => {
              const hasAnyTense =
                !!tenses.data &&
                (Object.keys(TENSE_META) as Array<keyof Tenses>).some(
                  (k) => tenses.data?.[k]?.korean,
                );
              return (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-sm font-bold text-foreground/80">
                      Learn it in every tense · past, present & future ⏳
                    </p>
                    <button
                      onClick={() => tenses.mutate()}
                      disabled={tenses.isPending}
                      aria-label={hasAnyTense ? "Reload tenses" : "Load tenses"}
                      title={hasAnyTense ? "Reload tenses" : "Load tenses"}
                      className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blossom to-primary/70 text-primary-foreground shadow-[var(--shadow-soft)] ring-2 ring-white/60 transition hover:scale-110 active:scale-95 disabled:opacity-60"
                    >
                      {tenses.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="text-xl leading-none">⏳</span>
                      )}
                    </button>
                  </div>

                  {tenses.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Conjugating past, present & future…
                    </div>
                  )}

                  {!tenses.isPending && !hasAnyTense && (
                    <p className="text-xs text-muted-foreground">
                      Tap the pink button to see this sentence in past, present & future tenses ✨
                    </p>
                  )}

                  {hasAnyTense &&
                    (Object.keys(TENSE_META) as Array<keyof Tenses>).map((key) => {
                      const entry = tenses.data?.[key];
                      if (!entry?.korean) return null;
                      const meta = TENSE_META[key];
                      return (
                        <div key={key} className="rounded-2xl bg-card p-4 ring-1 ring-border">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                <span>{meta.emoji}</span> {meta.label}
                                <span className="rounded-full bg-petal px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-muted-foreground">
                                  {meta.tag}
                                </span>
                              </p>
                              <p
                                className="mt-2 font-display text-lg font-semibold text-foreground sm:text-xl"
                                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                              >
                                {entry.korean}
                              </p>
                              {entry.romanization && (
                                <p className="mt-1 text-xs italic text-muted-foreground">
                                  {entry.romanization}
                                </p>
                              )}
                              {entry.english && (
                                <p className="mt-1 text-xs text-foreground/80">“{entry.english}”</p>
                              )}
                              {entry.note && (
                                <p className="mt-1 text-xs text-foreground/70">💡 {entry.note}</p>
                              )}
                            </div>
                            <button
                              onClick={() => speak(entry.korean)}
                              aria-label={`Hear ${meta.label} tense`}
                              className="shrink-0 rounded-full bg-primary/15 p-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })()}

            {explain.data && <GrammarBreakdown data={explain.data} />}
          </div>
        )}
      </div>
      <PremiumDialog open={premiumOpen} onOpenChange={setPremiumOpen} />
    </section>
  );
}
