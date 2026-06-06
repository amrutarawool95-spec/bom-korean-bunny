import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { translateToKorean, explainKorean } from "@/lib/korean.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { GrammarBreakdown } from "./GrammarBreakdown";

export function Translator() {
  const [input, setInput] = useState("");
  const translateFn = useServerFn(translateToKorean);
  const explainFn = useServerFn(explainKorean);

  const translate = useMutation({
    mutationFn: (text: string) => translateFn({ data: { text } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const explain = useMutation({
    mutationFn: () =>
      explainFn({
        data: { english: input, korean: translate.data?.korean ?? "" },
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const handleTranslate = () => {
    if (!input.trim()) return;
    explain.reset();
    translate.mutate(input.trim());
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
            <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
              {translate.data.korean}
            </p>
            {translate.data.romanization && (
              <p className="mt-2 text-sm italic text-muted-foreground">
                {translate.data.romanization}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
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
            </div>

            {explain.data && <GrammarBreakdown data={explain.data} />}
          </div>
        )}
      </div>
    </section>
  );
}
