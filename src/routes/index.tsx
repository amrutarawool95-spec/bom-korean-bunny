import { createFileRoute } from "@tanstack/react-router";
import { Translator } from "@/components/Translator";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bom — Learn Korean Sweetly" },
      {
        name: "description",
        content:
          "Translate English to Korean and tap the rabbit to see grammar, sentence structure, and word-by-word breakdowns.",
      },
      { property: "og:title", content: "Bom — Learn Korean Sweetly" },
      {
        property: "og:description",
        content:
          "Sweet, friendly Korean learning. Translate, then ask Bom-Bunny how the sentence works.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary ring-1 ring-border backdrop-blur-sm">
          <span>🌸</span> Bom · 봄 · Spring of Korean
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Learn Korean,{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            sweetly.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Type anything in English, get a natural Korean translation, then tap
          the little 🐰 to see exactly how the sentence is built — particles,
          word order, and all.
        </p>
      </header>

      <Translator />

      <footer className="mx-auto mt-16 max-w-3xl text-center text-xs text-muted-foreground">
        Made with 🌸 — practice a sentence a day, fighting! 화이팅!
      </footer>
      <Toaster />
    </main>
  );
}
